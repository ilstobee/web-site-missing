import { useEffect, useMemo, useRef, useState } from 'react'
import { asset } from '../data'
import { useApp, dmChatId } from '../store'
import type { ChatMessage } from '../store'
import { firebaseEnabled, getUserProfileFb } from '../firebase'

type Props = {
  open: boolean
  onClose(): void
  initialChatId?: string
  onOpenProfile(userId: string): void
}

type ChatRef = {
  id: string
  kind: 'sphere' | 'team' | 'dm'
  name: string
  icon?: string
  subtitle: string
  creatorId?: string
  memberCount?: number
  capacity?: number
}

const FALLBACK_IMAGE = asset('images/teams/team-startup.png')

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function ChatModal({ open, onClose, initialChatId, onOpenProfile }: Props) {
  const { db, user, allCategories, addChatMessage, editChatMessage, deleteChatMessage, chatRead, markChatRead, setActiveChatId } =
    useApp()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [folder, setFolder] = useState<'all' | 'sphere' | 'team' | 'dm'>('all')
  const [search, setSearch] = useState('')
  const listRef = useRef<HTMLDivElement>(null)
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches,
  )
  const [notifGranted, setNotifGranted] = useState(
    () =>
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted',
  )
  const [peerNames, setPeerNames] = useState<Record<string, string>>({})
  const peerTriedRef = useRef<Set<string>>(new Set())

  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null)
  const [recording, setRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordChunksRef = useRef<Blob[]>([])
  const recordStartRef = useRef(0)
  const longPressRef = useRef<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const onChange = () => setIsDesktop(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (open) {
      setSelectedId((current) => {
        if (initialChatId) return initialChatId
        return current ?? allCategories[0]?.id ?? null
      })
      setText('')
    }
  }, [open, initialChatId, allCategories])

  useEffect(() => {
    if (!open) {
      setSelectedId(null)
      setActiveChatId(null)
    }
  }, [open, setActiveChatId])

  useEffect(() => {
    if (open && selectedId) {
      setActiveChatId(selectedId)
      markChatRead(selectedId)
    }
  }, [open, selectedId, setActiveChatId, markChatRead])

  const peerIds = useMemo(() => {
    const ids = new Set<string>()
    if (!user) return Array.from(ids)
    for (const key of Object.keys(db.chats)) {
      if (key.startsWith('dm:')) {
        key
          .slice(3)
          .split(':')
          .forEach((id) => {
            if (id !== user.id) ids.add(id)
          })
      }
    }
    db.applications
      .filter((application) => application.userId === user.id)
      .forEach((application) => {
        const team = db.customTeams.find((candidate) => candidate.id === application.teamId)
        if (team && team.creatorId !== user.id) ids.add(team.creatorId)
      })
    const myTeamIds = new Set(
      db.customTeams.filter((team) => team.creatorId === user.id).map((team) => team.id),
    )
    db.applications
      .filter((application) => myTeamIds.has(application.teamId) && application.userId !== user.id)
      .forEach((application) => ids.add(application.userId))
    ;[...db.customTeams, ...db.pendingTeams].forEach((team) => {
      if (team.creatorId !== user.id) ids.add(team.creatorId)
    })
    return Array.from(ids)
  }, [db.chats, db.applications, db.customTeams, db.pendingTeams, user])

  useEffect(() => {
    if (!firebaseEnabled) return
    let alive = true
    for (const id of peerIds) {
      if (!id.startsWith('fb-') || peerTriedRef.current.has(id)) continue
      peerTriedRef.current.add(id)
      void getUserProfileFb(id.slice(3)).then((profile) => {
        if (!alive) return
        const name = `${profile.name ?? ''} ${profile.surname ?? ''}`.trim()
        if (name) setPeerNames((prev) => ({ ...prev, [id]: name }))
      })
    }
    return () => {
      alive = false
    }
  }, [peerIds])

  const teamParticipants = (teamId: string) => {
    const team =
      db.customTeams.find((candidate) => candidate.id === teamId) ??
      db.pendingTeams.find((candidate) => candidate.id === teamId)
    if (!team) return null
    const names: string[] = [team.creatorName || 'Создатель']
    db.applications
      .filter(
        (application) => application.teamId === teamId && application.status === 'accepted',
      )
      .forEach((application) => {
        if (!names.includes(application.userName)) names.push(application.userName)
      })
    return { names, count: names.length, capacity: team.capacity }
  }

  const resolvePeerName = (peerId: string): string => {
    const peer = db.users.find((candidate) => candidate.id === peerId)
    if (peer && (peer.name || peer.surname)) return `${peer.name} ${peer.surname}`.trim()
    const cached = peerNames[peerId]
    if (cached) return cached
    const team = [...db.customTeams, ...db.pendingTeams].find(
      (candidate) => candidate.creatorId === peerId,
    )
    if (team && team.creatorName) return team.creatorName
    const application = db.applications.find((candidate) => candidate.userId === peerId)
    if (application && application.userName) return application.userName
    return 'Пользователь'
  }

  const resolveChat = (id: string): ChatRef | null => {
    if (id.startsWith('team:')) {
      const team = db.customTeams.find((candidate) => candidate.id === id.slice(5))
      if (team) {
        const participants = teamParticipants(team.id)
        const count = participants ? participants.count : team.members
        return {
          id,
          kind: 'team',
          name: team.title,
          icon: team.image || FALLBACK_IMAGE,
          subtitle: `${team.category} · ${team.city} · ${count} участн.`,
          creatorId: team.creatorId,
          memberCount: count,
          capacity: participants ? participants.capacity : team.capacity,
        }
      }
      return null
    }
    if (id.startsWith('dm:')) {
      const parts = id.slice(3).split(':')
      const peerId = parts.find((candidate) => candidate !== user?.id) ?? parts[0]
      return {
        id,
        kind: 'dm',
        name: resolvePeerName(peerId),
        subtitle: 'Личный чат',
        creatorId: peerId,
      }
    }
    const category = allCategories.find((candidate) => candidate.id === id)
    if (category) {
      return { id, kind: 'sphere', name: category.name, icon: category.icon, subtitle: 'Чат сферы' }
    }
    return null
  }

  const teamRefs = useMemo(() => {
    if (!user) return []
    const myTeamIds = new Set<string>()
    db.customTeams.forEach((team) => {
      if (team.creatorId === user.id) myTeamIds.add(team.id)
    })
    db.applications.forEach((application) => {
      if (application.userId === user.id) myTeamIds.add(application.teamId)
    })
    return db.customTeams
      .filter((team) => myTeamIds.has(team.id))
      .map((team) =>
        resolveChat(`team:${team.id}`),
      )
      .filter((ref): ref is ChatRef => ref !== null)
  }, [db.customTeams, db.applications, user])

  const dmRefs = useMemo(() => {
    if (!user) return []
    const keys = new Set<string>()
    for (const key of Object.keys(db.chats)) {
      if (key.startsWith('dm:') && key.slice(3).split(':').includes(user.id)) keys.add(key)
    }
    db.applications
      .filter((application) => application.userId === user.id)
      .forEach((application) => {
        const team = db.customTeams.find((candidate) => candidate.id === application.teamId)
        if (team && team.creatorId !== user.id) keys.add(dmChatId(user.id, team.creatorId))
      })
    const myTeamIds = new Set(
      db.customTeams.filter((team) => team.creatorId === user.id).map((team) => team.id),
    )
    db.applications
      .filter((application) => myTeamIds.has(application.teamId) && application.userId !== user.id)
      .forEach((application) => keys.add(dmChatId(user.id, application.userId)))
    return Array.from(keys)
      .map(resolveChat)
      .filter((ref): ref is ChatRef => ref !== null)
  }, [db.chats, db.applications, db.customTeams, db.users, user, peerNames])

  const sphereRefs = useMemo(
    () =>
      allCategories.map((category) => ({
        id: category.id,
        kind: 'sphere' as const,
        name: category.name,
        icon: category.icon,
        subtitle: 'Чат сферы',
      })),
    [allCategories],
  )

  const lastMessageOf = (id: string): ChatMessage | null => {
    const msgs = db.chats[id] ?? []
    if (!msgs.length) return null
    return [...msgs].sort((a, b) => a.createdAt.localeCompare(b.createdAt))[msgs.length - 1]
  }

  const messageAuthorName = (message: ChatMessage): string => {
    if (message.userId) {
      const resolved = resolvePeerName(message.userId)
      if (resolved !== 'Пользователь') return resolved
    }
    return message.authorName && message.authorName !== 'Пользователь'
      ? message.authorName
      : 'Пользователь'
  }

  const unreadCount = (id: string): number => {
    if (!user) return 0
    const lastRead = chatRead[id] ?? ''
    return (db.chats[id] ?? []).filter(
      (message) => message.userId && message.userId !== user.id && message.createdAt > lastRead,
    ).length
  }

  const folderTabs = [
  {
    id: 'all' as const,
    label: 'Все',
    refs: [...sphereRefs, ...teamRefs, ...dmRefs],
    empty: 'Чатов пока нет. Открой чат команды или сферы, чтобы начать переписку.',
  },
  { id: 'sphere' as const, label: 'Сферы', refs: sphereRefs, empty: 'Чат каждой сферы — здесь.' },
  {
    id: 'team' as const,
    label: 'Команды',
    refs: teamRefs,
    empty: 'Ты пока не участвуешь в командах. Открой «Чат команды» на её карточке.',
  },
  {
    id: 'dm' as const,
    label: 'Личные',
    refs: dmRefs,
    empty: 'Личные переписки с создателями и участниками появятся после заявок.',
  },
]

const activeFolder = folderTabs.find((tab) => tab.id === folder) ?? folderTabs[0]
const query = search.trim().toLowerCase()
const visibleRefs = activeFolder.refs.filter((ref) => {
  if (!query) return true
  const preview = lastMessageOf(ref.id)
  return (
    ref.name.toLowerCase().includes(query) ||
    (preview ? preview.text.toLowerCase().includes(query) : false)
  )
})

const active = selectedId ? resolveChat(selectedId) : null
  const messages = active ? (db.chats[active.id] ?? []) : []
  const sorted = [...messages].sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  const folderUnread = (refs: ChatRef[]): number =>
  refs.reduce((sum, ref) => sum + unreadCount(ref.id), 0)

  const requestNotifs = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return
    const permission = await Notification.requestPermission()
    setNotifGranted(permission === 'granted')
  }

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [open, selectedId, sorted.length])

  if (!open) return null

  const myName = user ? `${user.name} ${user.surname}`.trim() : 'Гость'

  const send = () => {
    const value = text.trim()
    if (!value || !active) return
    addChatMessage(active.id, value)
    setText('')
  }

  const openMenu = (message: ChatMessage, x: number, y: number) => {
    setMenu({ id: message.id, x, y })
  }

  const closeMenu = () => setMenu(null)

  const copyMessage = (message: ChatMessage) => {
    if (message.text && typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(message.text).catch(() => {})
    }
    closeMenu()
  }

  const downscaleImage = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const img = new Image()
        img.onload = () => {
          const max = 1000
          const scale = Math.min(1, max / Math.max(img.width, img.height))
          const w = Math.max(1, Math.round(img.width * scale))
          const h = Math.max(1, Math.round(img.height * scale))
          const canvas = document.createElement('canvas')
          canvas.width = w
          canvas.height = h
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('no-canvas'))
            return
          }
          ctx.drawImage(img, 0, 0, w, h)
          resolve(canvas.toDataURL('image/jpeg', 0.72))
        }
        img.onerror = reject
        img.src = reader.result as string
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const onPhotoPicked = async (files: FileList | null) => {
    if (!files || !files.length || !active) return
    const file = files[0]
    try {
      const url = await downscaleImage(file)
      addChatMessage(active.id, text.trim(), [{ kind: 'image', url, name: file.name }])
      setText('')
    } catch {
      // ignore image errors
    }
  }

  const toggleRecording = async () => {
    if (recording) {
      mediaRecorderRef.current?.stop()
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const rec = new MediaRecorder(stream)
      recordChunksRef.current = []
      recordStartRef.current = Date.now()
      rec.ondataavailable = (event) => {
        if (event.data.size > 0) recordChunksRef.current.push(event.data)
      }
      rec.onstop = () => {
        stream.getTracks().forEach((track) => track.stop())
        const blob = new Blob(recordChunksRef.current, {
          type: rec.mimeType || 'audio/webm',
        })
        const reader = new FileReader()
        reader.onload = () => {
          const url = reader.result as string
          if (active) {
            addChatMessage(active.id, '', [
              { kind: 'audio', url, durationMs: Date.now() - recordStartRef.current },
            ])
          }
        }
        reader.readAsDataURL(blob)
        setRecording(false)
      }
      mediaRecorderRef.current = rec
      rec.start()
      setRecording(true)
    } catch {
      setRecording(false)
    }
  }

  const startEdit = (message: ChatMessage) => {
    setEditingId(message.id)
    setEditText(message.text)
  }

  const saveEdit = (message: ChatMessage) => {
    if (!active || !editingId) return
    if (editText.trim() && editText.trim() !== message.text) {
      editChatMessage(active.id, message.id, editText)
    }
    setEditingId(null)
    setEditText('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText('')
  }

  const confirmDelete = (message: ChatMessage) => {
    if (!active) return
    if (window.confirm('Удалить это сообщение?')) {
      deleteChatMessage(active.id, message.id)
    }
  }

  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })

  const showList = isDesktop || !selectedId
  const showConversation = isDesktop || !!selectedId

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink/40 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="flex h-[min(80svh,720px)] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_24px_60px_rgba(80,40,40,0.25)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-cream px-6 py-4">
          <div>
            <p className="text-lg font-extrabold text-ink">Чаты</p>
            <p className="text-[12px] text-muted">Сферы · команды · личные чаты</p>
          </div>
          {!notifGranted && typeof window !== 'undefined' && 'Notification' in window ? (
            <button
              type="button"
              onClick={requestNotifs}
              className="shrink-0 rounded-full border border-brand/30 px-3 py-1.5 text-[12px] font-semibold text-brand transition hover:bg-brand-soft"
            >
              🔔 Включить уведомления
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted hover:bg-cream hover:text-ink"
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>

        <div className="flex min-h-0 flex-1">
          {showList ? (
            <aside className="flex w-full shrink-0 flex-col border-r border-cream bg-blush/40 md:w-64">
              <div className="p-2 pb-1">
                <input
                  value={search}
                  placeholder="Поиск чатов…"
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full rounded-full border border-ink/10 bg-white px-3.5 py-2 text-[13px] text-ink outline-none transition focus:border-brand"
                />
              </div>
              <div className="flex gap-1 overflow-x-auto px-2 py-1.5">
                {folderTabs.map((tab) => {
                  const unread = folderUnread(tab.refs)
                  const isActive = tab.id === folder
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setFolder(tab.id)}
                      aria-pressed={isActive}
                      className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold transition ${
                        isActive ? 'bg-brand text-white' : 'text-muted hover:bg-white/70'
                      }`}
                    >
                      {tab.label}
                      {unread > 0 ? (
                        <span
                          className={`grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-bold ${
                            isActive ? 'bg-white text-brand' : 'bg-brand text-white'
                          }`}
                        >
                          {unread}
                        </span>
                      ) : null}
                    </button>
                  )
                })}
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">
                {visibleRefs.length === 0 ? (
                  <p className="px-4 py-6 text-[11px] leading-snug text-muted/80">
                    {query ? 'Ничего не найдено.' : activeFolder.empty}
                  </p>
                ) : (
                  visibleRefs.map((ref) => {
                    const preview = lastMessageOf(ref.id)
                    const unread = unreadCount(ref.id)
                    const isActive = ref.id === selectedId
                    return (
                      <button
                        key={ref.id}
                        type="button"
                        onClick={() => setSelectedId(ref.id)}
                        aria-pressed={isActive}
                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition ${
                          isActive ? 'bg-white' : 'hover:bg-white/60'
                        }`}
                      >
                        {ref.icon ? (
                          <img src={ref.icon} alt="" className="h-8 w-8 shrink-0 rounded-xl object-cover" />
                        ) : (
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-[11px] font-bold text-white">
                            {initialsOf(ref.name)}
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-bold text-ink">{ref.name}</p>
                          <p className="truncate text-[11px] text-muted">
                            {preview ? `${messageAuthorName(preview)}: ${preview.text}` : ref.subtitle}
                          </p>
                        </div>
                        {unread > 0 ? (
                          <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-brand px-1.5 text-[10px] font-bold text-white">
                            {unread}
                          </span>
                        ) : null}
                      </button>
                    )
                  })
                )}
              </div>
            </aside>
          ) : null}

          {showConversation ? (
            active ? (
              <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-center gap-2 border-b border-cream px-4 py-2.5">
                {!isDesktop ? (
                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted hover:bg-cream hover:text-ink"
                    aria-label="Назад к списку чатов"
                  >
                    ←
                  </button>
                ) : null}
                {active ? (
                  <>
                    {active.icon ? (
                      <img src={active.icon} alt="" className="h-6 w-6 shrink-0 rounded-lg object-cover" />
                    ) : (
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand text-[10px] font-bold text-white">
                        {initialsOf(active.name)}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-extrabold text-ink">{active.name}</p>
                      <p className="truncate text-[11px] text-muted">
                        {active.kind === 'sphere'
                          ? 'Чат сферы'
                          : active.kind === 'team'
                            ? `${active.subtitle}`
                            : 'Личный чат'}
                      </p>
                    </div>
                    {active.kind === 'team' && user && active.creatorId && active.creatorId !== user.id ? (
                      <button
                        type="button"
                        onClick={() => setSelectedId(dmChatId(user.id, active.creatorId!))}
                        className="shrink-0 rounded-full border border-brand/30 px-3 py-1.5 text-[12px] font-semibold text-brand transition hover:bg-brand-soft"
                      >
                        Написать создателю
                      </button>
                    ) : null}
                  </>
                ) : (
                  <p className="text-sm font-extrabold text-ink">Чат</p>
                )}
              </div>

              {active.kind === 'team' && active.memberCount !== undefined ? (
                <div className="border-b border-cream bg-white/80 px-4 py-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-muted">
                      Участники · {active.memberCount} из {active.capacity ?? '—'}
                    </p>
                  </div>
                  <div className="mt-2 flex max-h-24 flex-wrap gap-1.5 overflow-y-auto pr-1">
                    {teamParticipants(active.id.slice(5))?.names.map((name, index) => (
                      <span
                        key={`${name}-${index}`}
                        className="flex items-center gap-1.5 rounded-full bg-blush px-2.5 py-1 text-[11px] font-semibold text-ink"
                      >
                        <span className="grid h-4 w-4 place-items-center rounded-full bg-brand text-[8px] font-bold text-white">
                          {initialsOf(name)}
                        </span>
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              <div
                ref={listRef}
                className="flex-1 space-y-3 overflow-y-auto bg-blush/50 px-4 py-4"
              >
                {sorted.length === 0 ? (
                  <p className="py-12 text-center text-[13px] text-muted">
                    Пока нет сообщений в этом чате. Напиши первым!
                  </p>
                ) : (
                  sorted.map((message) => {
                    const mine = message.userId
                      ? message.userId === (user?.id ?? 'guest')
                      : message.authorName === myName
                    const isEditing = editingId === message.id
                    return (
                      <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[82%] rounded-2xl px-4 py-2.5 ${
                            mine
                              ? 'rounded-br-md bg-brand text-white'
                              : 'rounded-bl-md bg-white text-ink ring-1 ring-ink/5'
                          }`}
                          onContextMenu={(event) => {
                            event.preventDefault()
                            openMenu(message, event.clientX, event.clientY)
                          }}
                          onTouchStart={(event) => {
                            const x = event.touches[0]?.clientX ?? 0
                            const y = event.touches[0]?.clientY ?? 0
                            longPressRef.current = window.setTimeout(() => openMenu(message, x, y), 550)
                          }}
                          onTouchEnd={() => {
                            if (longPressRef.current) {
                              clearTimeout(longPressRef.current)
                              longPressRef.current = null
                            }
                          }}
                          onTouchMove={() => {
                            if (longPressRef.current) {
                              clearTimeout(longPressRef.current)
                              longPressRef.current = null
                            }
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => message.userId && onOpenProfile(message.userId)}
                            className={`text-[11px] font-bold hover:underline ${
                              mine ? 'text-white/80' : 'text-brand'
                            }`}
                          >
                            {messageAuthorName(message)}
                          </button>
                          {isEditing ? (
                            <div className="mt-1">
                              <input
                                autoFocus
                                value={editText}
                                onChange={(event) => setEditText(event.target.value)}
                                onKeyDown={(event) => {
                                  if (event.key === 'Enter') saveEdit(message)
                                  if (event.key === 'Escape') cancelEdit()
                                }}
                                className="w-full rounded-lg border border-ink/10 bg-white px-3 py-1.5 text-sm text-ink outline-none"
                              />
                              <div className="mt-1.5 flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => saveEdit(message)}
                                  className="rounded-full bg-brand px-3 py-1 text-[11px] font-semibold text-white"
                                >
                                  Сохранить
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEdit}
                                  className="rounded-full border border-ink/10 px-3 py-1 text-[11px] font-semibold text-muted"
                                >
                                  Отмена
                                </button>
                              </div>
                            </div>
                          ) : (
                             <>
                              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                                {message.text}
                              </p>
                              {message.attachments?.map((att, index) => (
                                <div key={index} className="mt-2">
                                  {att.kind === 'image' ? (
                                    <a href={att.url} target="_blank" rel="noreferrer">
                                      <img
                                        src={att.url}
                                        alt={att.name ?? 'фото'}
                                        className="max-h-72 w-full rounded-xl object-cover"
                                      />
                                    </a>
                                  ) : (
                                    <audio controls src={att.url} className="w-full" />
                                  )}
                                </div>
                              ))}
                              <div
                                className={`mt-1 flex items-center justify-end gap-2 text-[10px] ${
                                  mine ? 'text-white/70' : 'text-muted'
                                }`}
                              >
                                <span>
                                  {fmtTime(message.createdAt)}
                                  {message.edited ? ' · изменено' : ''}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              <div className="flex items-center gap-2 border-t border-cream px-4 py-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    void onPhotoPicked(event.target.files)
                    event.target.value = ''
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Отправить фото"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink transition hover:bg-cream"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
                    <path
                      d="M4 16l4.5-4.5 3 3L16 9l4 4M4 6h16v12H4z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => void toggleRecording()}
                  aria-label={recording ? 'Остановить запись' : 'Голосовое сообщение'}
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-full transition ${
                    recording ? 'bg-brand text-white' : 'text-ink hover:bg-cream'
                  }`}
                >
                  {recording ? (
                    <span className="h-3.5 w-3.5 rounded-sm bg-white" />
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
                      <path
                        d="M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                      <path
                        d="M5 11a7 7 0 0 0 14 0M12 18v3"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </button>
                <input
                  className="w-full rounded-full border border-ink/10 bg-cream px-4 py-2.5 text-sm text-ink outline-none transition focus:border-brand focus:bg-white"
                  placeholder="Напиши сообщение…"
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') send()
                  }}
                />
                <button
                  type="button"
                  onClick={send}
                  disabled={!text.trim()}
                  className="shrink-0 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
                >
                  Отправить
                </button>
              </div>
              </div>
            ) : (
              <div className="hidden min-w-0 flex-1 flex-col items-center justify-center gap-2 bg-blush/40 md:flex">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-cream">
                  <svg viewBox="0 0 24 24" className="h-8 w-8 text-muted" fill="none" aria-hidden>
                    <path
                      d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4 4v-4h-.5A2.5 2.5 0 0 1 3 14.5v-8Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    <path d="M7.5 9h9M7.5 12.5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
                <p className="text-[15px] font-extrabold text-muted">Выберите чат</p>
                <p className="text-[12px] text-muted/70">
                  Начни переписку — выбери чат из списка слева
                </p>
              </div>
            )
          ) : null}
        </div>
      </div>

      {menu ? (
        (() => {
          const menuMessage = sorted.find((candidate) => candidate.id === menu.id) ?? null
          const menuMine = menuMessage
            ? menuMessage.userId
              ? menuMessage.userId === (user?.id ?? 'guest')
              : menuMessage.authorName === myName
            : false
          const maxLeft = typeof window !== 'undefined' ? window.innerWidth - 180 : 240
          const maxTop = typeof window !== 'undefined' ? window.innerHeight - 200 : 600
          return (
            <>
              <div
                className="fixed inset-0 z-[60]"
                onClick={closeMenu}
                onContextMenu={(event) => {
                  event.preventDefault()
                  closeMenu()
                }}
              />
              <div
                className="fixed z-[61] min-w-[160px] overflow-hidden rounded-2xl bg-white py-1 shadow-[0_14px_40px_rgba(80,40,40,0.22)] ring-1 ring-ink/10"
                style={{ top: Math.min(menu.y, maxTop), left: Math.min(menu.x, maxLeft) }}
              >
                <button
                  type="button"
                  onClick={() => menuMessage && copyMessage(menuMessage)}
                  className="block w-full px-4 py-2.5 text-left text-[13px] font-semibold text-ink transition hover:bg-cream"
                >
                  Копировать
                </button>
                {menuMine ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        if (menuMessage) startEdit(menuMessage)
                        closeMenu()
                      }}
                      className="block w-full px-4 py-2.5 text-left text-[13px] font-semibold text-ink transition hover:bg-cream"
                    >
                      Изменить
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (menuMessage) confirmDelete(menuMessage)
                        closeMenu()
                      }}
                      className="block w-full px-4 py-2.5 text-left text-[13px] font-semibold text-brand transition hover:bg-cream"
                    >
                      Удалить
                    </button>
                  </>
                ) : null}
              </div>
            </>
          )
        })()
      ) : null}
    </div>
  )
}