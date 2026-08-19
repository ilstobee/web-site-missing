import { useEffect, useState } from 'react'
import { Logo } from './Logo'
import { fmtDate, useApp } from '../store'

type Props = {
  onOpenAuth(): void
  onOpenLK(): void
  onOpenApplications(): void
  onOpenChat(chatId?: string): void
}

export function Header({ onOpenAuth, onOpenLK, onOpenApplications, onOpenChat }: Props) {
  const { user, db, logout, markAllNotificationsRead } = useApp()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem('missing_theme') === 'dark'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    try {
      window.localStorage.setItem('missing_theme', dark ? 'dark' : 'light')
    } catch {
      // ignore
    }
  }, [dark])

  const handleNotificationClick = (chatId?: string) => {
    setNotificationsOpen(false)
    markAllNotificationsRead()
    if (chatId) {
      onOpenChat(chatId)
    } else {
      onOpenApplications()
    }
  }

  const myNotifications = user
    ? db.notifications
        .filter((notification) => notification.userId === user.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    : []
  const unread = myNotifications.filter((notification) => !notification.read).length
  const initials = user ? `${user.name[0] ?? ''}${user.surname[0] ?? ''}`.toUpperCase() : ''

  return (
    <header className="sticky top-0 z-50 bg-blush shadow-[0_6px_20px_rgba(80,40,40,0.06)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <a href="#top" className="shrink-0" aria-label="На главную">
          <Logo />
        </a>

        <nav className="hidden items-center gap-5 text-sm font-semibold text-ink md:flex">
          <a href="#spheres" className="hover:text-brand">Сферы</a>
          <a href="#teams" className="hover:text-brand">Команды</a>
          <a href="#for-you" className="hover:text-brand">Для тебя</a>
          <button type="button" onClick={() => onOpenChat()} className="hover:text-brand">Чаты</button>
        </nav>

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => onOpenChat()}
            className="grid h-10 w-10 place-items-center text-ink"
            aria-label="Чаты"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
              <path
                d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4 4v-4h-.5A2.5 2.5 0 0 1 3 14.5v-8Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path d="M7.5 9h9M7.5 12.5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setDark((value) => !value)}
              className="grid h-10 w-10 place-items-center text-ink"
              aria-label={dark ? 'Светлая тема' : 'Тёмная тема'}
              title={dark ? 'Светлая тема' : 'Тёмная тема'}
            >
              {dark ? (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
                  <path
                    d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
                  <path
                    d="M20 13.5A8.5 8.5 0 0 1 10.5 4a8.5 8.5 0 1 0 9.5 9.5Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setNotificationsOpen((open) => !open)}
              className="relative grid h-10 w-10 place-items-center text-ink"
              aria-label="Уведомления"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
                <path
                  d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path d="M10 18a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              {unread > 0 ? (
                <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                  {unread}
                </span>
              ) : null}
            </button>

            {notificationsOpen ? (
              <div className="absolute right-0 top-12 z-10 w-[320px] overflow-hidden rounded-2xl bg-white shadow-[0_14px_40px_rgba(80,40,40,0.18)] ring-1 ring-ink/5">
                <div className="flex items-center justify-between gap-3 border-b border-cream px-4 py-3">
                  <p className="text-sm font-extrabold text-ink">Уведомления</p>
                  {unread > 0 ? (
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      className="text-xs font-semibold text-brand hover:text-brand-dark"
                    >
                      Прочитать все
                    </button>
                  ) : null}
                </div>
                <div className="max-h-[320px] overflow-y-auto">
                  {myNotifications.length === 0 ? (
                    <p className="px-4 py-6 text-center text-[13px] text-muted">
                      Пока нет уведомлений. Здесь появятся «мисы» от сфер, которые приняли твою заявку.
                    </p>
                  ) : (
                    myNotifications.map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() => handleNotificationClick(notification.chatId)}
                        className={`block w-full border-b border-cream px-4 py-3 text-left transition hover:bg-cream ${notification.read ? 'bg-white' : 'bg-brand-soft'}`}
                      >
                        <p className="text-[13px] leading-snug text-ink">{notification.text}</p>
                        <p className="mt-1 text-[11px] text-muted">{fmtDate(notification.createdAt)}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : null}
          </div>

          {user ? (
            <>
              <button
                type="button"
                onClick={onOpenLK}
                className="flex items-center gap-2 rounded-full bg-white py-1 pl-1 pr-3 shadow-[0_6px_16px_rgba(80,40,40,0.08)] transition hover:shadow-md"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-brand text-xs font-extrabold text-white">
                  {initials}
                </span>
                <span className="hidden max-w-[120px] truncate text-sm font-semibold text-ink sm:inline">
                  {user.name} {user.surname}
                </span>
              </button>
              <button
                type="button"
                onClick={logout}
                className="text-xs font-semibold text-muted hover:text-brand"
              >
                Выйти
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(247,86,109,0.28)] transition hover:bg-brand-dark"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
                <circle cx="12" cy="8.5" r="3.1" stroke="currentColor" strokeWidth="1.8" />
                <path
                  d="M6.2 18.2c1.1-2.6 3.2-4 5.8-4s4.7 1.4 5.8 4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
              Войти
            </button>
          )}
        </div>
      </div>
      <div className="wave-strip" aria-hidden />
    </header>
  )
}
