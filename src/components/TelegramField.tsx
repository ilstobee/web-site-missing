import { useState } from 'react'

type Props = {
  value: string
  className?: string
}

function copyText(text: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    void navigator.clipboard.writeText(text).catch(() => {})
  }
}

export function TelegramField({ value, className }: Props) {
  const [copied, setCopied] = useState(false)
  const tg = (value ?? '').replace(/^@/, '')
  if (!tg) return null

  const handleCopy = () => {
    copyText(`https://t.me/${tg}`)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className={`inline-flex items-center gap-1 rounded-full border border-ink/10 bg-white py-1 pl-3 pr-1 ${className ?? ''}`}>
      <a
        href={`https://t.me/${tg}`}
        target="_blank"
        rel="noreferrer"
        className="text-[13px] font-semibold text-brand"
      >
        @{tg}
      </a>
      <button
        type="button"
        onClick={handleCopy}
        className="grid h-6 w-6 place-items-center rounded-full text-muted transition hover:bg-brand-soft hover:text-brand"
        title="Скопировать"
        aria-label="Скопировать Telegram"
      >
        {copied ? (
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-brand" fill="none" aria-hidden>
            <path
              d="m5 12 4 4L19 6"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden>
            <rect x="8" y="8" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
            <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        )}
      </button>
    </div>
  )
}
