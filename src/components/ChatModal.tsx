import { useEffect, useMemo, useRef, useState } from 'react'
import { asset } from '../data'
import { useApp, dmChatId } from '../store'

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
  const { db, user, allCategories, addChatMessage } = useApp()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [text, setText] = useState('')
  const listRef = useRef<HTMLDivElement>(null)
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches,
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
    if (!open) setSelectedId(null)
  }, [open])

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

  const folders = [
    { label: 'Сферы', refs: sphereRefs, empty: 'Чат каждой сферы — здесь.' },
    {
      label: 'Команды',
      refs: teamRefs,
      empty: 'Ты пока не участвуешь в командах. Открой «Чат команды» на её карточке.',
    },
    {
      label: 'Личные чаты',
      refs: dmRefs,
      empty: 'Личные переписки с создателями и участниками появятся после заявок.',
    },
  ]

  const active = selectedId ? resolveChat(selectedId) : null
  const messages = active ? (db.chats[active.id] ?? []) : []
  const sorted = [...messages].sort((a, b) => a.createdAt.localeCompare(b.createdAt))

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
            <aside className="w-full shrink-0 overflow-y-auto border-r border-cream bg-blush/40 md:w-64">
              {folders.map((folder) => (
                <div key={folder.label}>
                  <p className="px-4 pb-1 pt-4 text-[10px] font-extrabold uppercase tracking-wider text-muted">
                    {folder.label}
                  </p>
                  {folder.refs.length === 0 ? (
                    <p className="px-4 pb-2 text-[11px] leading-snug text-muted/80">{folder.empty}</p>
                  ) : (
                    folder.refs.map((ref) => {
                      const count = db.chats[ref.id]?.length ?? 0
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
                              {count ? `${count} сообщ.` : ref.subtitle}
                            </p>
                          </div>
                          {count > 0 ? (
                            <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-brand px-1.5 text-[10px] font-bold text-white">
                              {count}
                            </span>
                          ) : null}
                        </button>
                      )
                    })
                  )}
                </div>
              ))}
            </aside>
          ) : null}

          {showConversation ? (
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
                            {message.authorName}
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
          ) : null}
        </div>
      </div>
    </div>
  )
}