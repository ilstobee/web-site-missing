import { useEffect, useRef, useState } from 'react'
import { useApp } from '../store'

type Props = {
  open: boolean
  onClose(): void
}

export function ChatModal({ open, onClose }: Props) {
  const { db, user, addChatMessage } = useApp()
  const [text, setText] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  const messages = [...db.chat].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const myName = user ? `${user.name} ${user.surname}`.trim() : 'Гость'

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [open, messages.length])

  if (!open) return null

  const send = () => {
    const value = text.trim()
    if (!value) return
    addChatMessage(value)
    setText('')
  }

  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink/40 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="flex h-[min(70svh,640px)] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_24px_60px_rgba(80,40,40,0.25)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-cream px-6 py-4">
          <div>
            <p className="text-lg font-extrabold text-ink">Чаты</p>
            <p className="text-[12px] text-muted">Общий чат сообщества</p>
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

        <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-blush/50 px-4 py-4">
          {messages.length === 0 ? (
            <p className="py-12 text-center text-[13px] text-muted">
              Пока нет сообщений. Напиши первым!
            </p>
          ) : (
            messages.map((message) => {
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
    </div>
  )
}