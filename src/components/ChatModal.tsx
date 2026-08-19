import { useEffect, useRef, useState } from 'react'
import { useApp } from '../store'

type Props = {
  open: boolean
  onClose(): void
  initialChatId?: string
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
      setSelectedId((current) => current ?? initialChatId ?? allCategories[0]?.id ?? null)
      setText('')
    }
  }, [open, initialChatId, allCategories])

  const active = allCategories.find((category) => category.id === selectedId)
  const messages = selectedId ? (db.chats[selectedId] ?? []) : []
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
    if (!value || !selectedId) return
    addChatMessage(selectedId, value)
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
            <p className="text-[12px] text-muted">Обсуждения по сферам</p>
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
              {allCategories.map((category) => {
                const count = db.chats[category.id]?.length ?? 0
                const isActive = category.id === selectedId
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedId(category.id)}
                    aria-pressed={isActive}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                      isActive ? 'bg-white' : 'hover:bg-white/60'
                    }`}
                  >
                    <img src={category.icon} alt="" className="h-8 w-8 shrink-0 object-contain" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-bold text-ink">{category.name}</p>
                      <p className="truncate text-[11px] text-muted">
                        {count ? `${count} сообщ.` : 'Нет сообщений'}
                      </p>
                    </div>
                    {count > 0 ? (
                      <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-brand px-1.5 text-[10px] font-bold text-white">
                        {count}
                      </span>
                    ) : null}
                  </button>
                )
              })}
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
                    <img src={active.icon} alt="" className="h-6 w-6 shrink-0 object-contain" />
                    <p className="truncate text-sm font-extrabold text-ink">
                      Чат сферы «{active.name}»
                    </p>
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