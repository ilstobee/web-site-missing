import { useEffect, useState } from 'react'
import { useApp, dmChatId, type User } from '../store'
import { getUserProfileFb } from '../firebase'
import { SEEKING_OPTIONS } from '../matching'

type Props = {
  userId: string | null
  onClose(): void
  onOpenChat(chatId: string): void
}

function initialsOf(name: string, surname: string): string {
  return `${name[0] ?? ''}${surname[0] ?? ''}`.toUpperCase()
}

export function UserProfileModal({ userId, onClose, onOpenChat }: Props) {
  const { user } = useApp()
  const [profile, setProfile] = useState<Partial<User> | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!userId) {
      setProfile(null)
      return
    }
    const id = userId.startsWith('fb-') ? userId.slice(3) : userId
    let alive = true
    setLoading(true)
    setProfile(null)
    void getUserProfileFb(id).then((data) => {
      if (!alive) return
      setProfile(data)
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [userId])

  if (!userId) return null

  const tg = (profile?.telegram ?? '').replace(/^@/, '').trim()
  const isSelf = user?.id === userId

  const copyTelegram = () => {
    if (!tg) return
    const link = `https://t.me/${tg}`
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(link).then(() => {
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1500)
      }).catch(() => {})
    }
  }

  const startChat = () => {
    if (!user || !userId) return
    onOpenChat(dmChatId(user.id, userId))
    onClose()
  }

  const field = (label: string, value?: string) => (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted">{label}</p>
      <p className="text-sm text-ink">{value && value.trim() ? value : '—'}</p>
    </div>
  )

  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-ink/40 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-[0_24px_60px_rgba(80,40,40,0.25)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-cream px-6 py-4">
          <p className="text-lg font-extrabold text-ink">Профиль пользователя</p>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted hover:bg-cream hover:text-ink"
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5">
          {loading ? (
            <p className="py-8 text-center text-sm text-muted">Загрузка профиля…</p>
          ) : !profile ? (
            <p className="py-8 text-center text-sm text-muted">Профиль не найден.</p>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-brand text-xl font-extrabold text-white">
                  {initialsOf(profile.name ?? '', profile.surname ?? '')}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xl font-extrabold text-ink">
                    {`${profile.name ?? ''} ${profile.surname ?? ''}`.trim() || 'Пользователь'}
                  </p>
                  <p className="text-[13px] text-muted">
                    {profile.city && profile.city.trim() ? profile.city : 'Город не указан'}
                    {profile.role === 'organizer' ? ' · Организатор' : ''}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Telegram</p>
                  {tg ? (
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <a
                        href={`https://t.me/${tg}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold text-brand underline"
                      >
                        @{tg}
                      </a>
                      <button
                        type="button"
                        onClick={copyTelegram}
                        className="rounded-full border border-brand/30 px-3 py-1 text-[12px] font-semibold text-brand transition hover:bg-brand-soft"
                      >
                        {copied ? 'Скопировано!' : 'Копировать'}
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-ink">—</p>
                  )}
                </div>

                {field('Ищет', SEEKING_OPTIONS.find((item) => item.value === profile.seeking)?.label)}
                {field('Уровень', profile.level)}
                {field('График', profile.availability)}
                {field('Цель', profile.goal)}

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Интересы</p>
                  {profile.interests && profile.interests.length > 0 ? (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {profile.interests.map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-blush px-3 py-1 text-[12px] font-semibold text-ink"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-ink">—</p>
                  )}
                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Навыки</p>
                  {profile.skills && profile.skills.length > 0 ? (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {profile.skills.map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-white px-3 py-1 text-[12px] font-semibold text-ink shadow-[0_4px_12px_rgba(80,40,40,0.06)]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-ink">—</p>
                  )}
                </div>
              </div>

              {!isSelf ? (
                <button
                  type="button"
                  onClick={startChat}
                  className="mt-6 w-full rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
                >
                  Написать сообщение
                </button>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
