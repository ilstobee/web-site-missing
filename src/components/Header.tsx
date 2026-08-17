import { Logo } from './Logo'

export function Header() {
  return (
    <header className="relative z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <Logo />

        <div className="flex items-center gap-3 sm:gap-4">
          <a
            href="#teams"
            className="hidden items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(247,86,109,0.28)] transition hover:bg-brand-dark sm:inline-flex"
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
            Найти единомышленников
          </a>

          <button
            type="button"
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
            <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
              3
            </span>
          </button>

          <button
            type="button"
            className="flex items-center gap-2 py-1 text-sm font-semibold text-ink"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
              <circle cx="12" cy="8.5" r="3.1" stroke="currentColor" strokeWidth="1.8" />
              <path
                d="M6.2 18.2c1.1-2.6 3.2-4 5.8-4s4.7 1.4 5.8 4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            <span className="hidden sm:inline">Личный кабинет</span>
            <svg viewBox="0 0 12 12" className="h-3 w-3 text-muted" fill="none" aria-hidden>
              <path d="M2 4.5 6 8.5 10 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
