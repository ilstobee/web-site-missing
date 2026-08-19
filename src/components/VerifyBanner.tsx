import { useState } from 'react'
import { useApp } from '../store'

export function VerifyBanner() {
  const { resendVerification } = useApp()
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const resend = async () => {
    setSending(true)
    try {
      await resendVerification()
      setSent(true)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 border-y border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-[13px] font-medium text-amber-800">
      <span>Подтверди почту, чтобы отправлять команды и заявки.</span>
      <button
        type="button"
        disabled={sending || sent}
        onClick={() => void resend()}
        className="rounded-full bg-amber-600 px-4 py-1 text-[12px] font-semibold text-white transition hover:bg-amber-700 disabled:opacity-60"
      >
        {sent ? 'Письмо отправлено' : sending ? 'Отправляем…' : 'Отправить письмо'}
      </button>
    </div>
  )
}