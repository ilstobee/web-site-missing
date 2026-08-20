import { useEffect, useMemo, useRef, useState } from 'react'
import { asset } from '../data'
import { useApp, dmChatId } from '../store'
import type { ChatMessage } from '../store'

type Props = {
  open: boolean
  onClose(): void
  initialChatId?: string
}

type ChatRef = {
  id: string
  kind: 'sphere' | 'team' | 'dm'
  name: string
  icon?: string
  subtitle: string
  creatorId?: string
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

export function ChatModal({ open, onClose, initialChatId }: Props) {
  const { db, user, allCategories, addChatMessage, chatRead, markChatRead, setActiveChatId } =
    useApp()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [text, setText] = useState('')
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

  const resolvePeerName = (peerId: string): string => {
    const peer = db.users.find((candidate) => candidate.id === peerId)
    if (peer) return `${peer.name} ${peer.surname}`.trim()
    const team = db.customTeams.find((candidate) => candidate.creatorId === peerId)
    if (team) return team.creatorName
    const application = db.applications.find((candidate) => candidate.userId === peerId)
    if (application) return application.userName
    return 'Пользователь'
  }

  const resolveChat = (id: string): ChatRef | null => {
    if (id.startsWith('team:')) {
      const team = db.customTeams.find((candidate) => candidate.id === id.slice(5))
      if (team) {
        return {
          id,
          kind: 'team',
          name: team.title,
          icon: team.image || FALLBACK_IMAGE,
          subtitle: `${team.category} · ${team.city}`,
          creatorId: team.creatorId,
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
  }, [db.chats, db.applications, db.customTeams, db.users, user])

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
      const author = db.users.find((candidate) => candidate.id === message.userId)
      if (author && (author.name || author.surname)) {
        return `${author.name} ${author.surname}`.trim()
      }
    }
    return message.authorName || 'Пользователь'
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
                    return (
                      <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[82%] rounded-2xl px-4 py-2.5 ${
                            mine
                              ? 'rounded-br-md bg-brand text-white'
                              : 'rounded-bl-md bg-white text-ink ring-1 ring-ink/5'
                          }`}
                        >
                          <div
                            className={`text-[11px] font-bold ${
                              mine ? 'text-white/80' : 'text-brand'
                            }`}
                          >
                            {messageAuthorName(message)}
                          </div>
                          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                            {message.text}
                          </p>
                          <div
                            className={`mt-1 text-right text-[10px] ${
                              mine ? 'text-white/70' : 'text-muted'
                            }`}
                          >
                            {fmtTime(message.createdAt)}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              <div className="flex items-center gap-2 border-t border-cream px-4 py-3">
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
    </div>
  )
}