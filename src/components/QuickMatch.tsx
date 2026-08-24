import { useMemo, useState } from 'react'
import { useApp } from '../store'
import {
  INTEREST_OPTIONS,
  SEEKING_OPTIONS,
  rankTeams,
  toMatchTeam,
  type Seeking,
} from '../matching'

function scoreTone(score: number): string {
  if (score >= 80) return 'bg-emerald-500'
  if (score >= 60) return 'bg-brand'
  return 'bg-amber-500'
}

export function QuickMatch({
  city,
  onOpenAuth,
  onOpenChat,
}: {
  city: string
  onOpenAuth: () => void
  onOpenChat: (chatId?: string) => void
}) {
  const { user, db } = useApp()
  const [selected, setSelected] = useState<string[]>(user?.interests ?? [])
  const [seeking, setSeeking] = useState<Seeking>(user?.seeking || 'team')
  const [submitted, setSubmitted] = useState(false)
  const [showAllInterests, setShowAllInterests] = useState(false)

  const candidates = useMemo(
    () =>
      db.customTeams
        .filter((team) => city === 'all' || team.city.toLowerCase() === city.toLowerCase())
        .map((team) =>
          toMatchTeam({
            id: team.id,
            title: team.title,
            category: team.category,
            tags: team.tags,
            city: team.city,
            difficulty: team.difficulty,
            description: team.description,
          }),
        ),
    [db.customTeams, city],
  )

  const results = useMemo(() => {
    const prefs = {
      ...user,
      interests: selected.length > 0 ? selected : (user?.interests ?? []),
      seeking,
    }
    return rankTeams(prefs, candidates).slice(0, 12)
  }, [user, selected, seeking, candidates])

  const toggle = (interest: string) => {
    setSelected((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest],
    )
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12">
      <div className="rounded-[28px] bg-white/70 p-6 shadow-[0_16px_40px_rgba(80,40,40,0.08)] backdrop-blur sm:p-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-[12px] font-bold text-brand">
          🔎 Умный подбор
        </span>
        <h2 className="mt-3 text-[26px] font-extrabold text-ink sm:text-[32px]">
          Найди команду за 10 секунд
        </h2>
        <p className="mt-1 max-w-2xl text-[14px] text-muted">
          Отметь, что тебе интересно, и мы покажем команды с наибольшей совместимостью —
          по интересам, городу, навыкам и целям.
        </p>

        <p className="mt-6 text-[13px] font-bold uppercase tracking-wide text-muted">
          Мне интересно
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {(showAllInterests ? INTEREST_OPTIONS : INTEREST_OPTIONS.slice(0, 8)).map((interest) => {
            const active = selected.includes(interest)
            return (
              <button
                key={interest}
                type="button"
                onClick={() => toggle(interest)}
                className={
                  active
                    ? 'rounded-full bg-brand px-3.5 py-2 text-[13px] font-semibold text-white'
                    : 'rounded-full border border-ink/15 bg-white px-3.5 py-2 text-[13px] font-semibold text-ink hover:border-brand'
                }
              >
                {interest}
              </button>
            )
          })}
          {INTEREST_OPTIONS.length > 8 ? (
            <button
              type="button"
              onClick={() => setShowAllInterests((value) => !value)}
              className="rounded-full border border-brand/40 bg-white px-3.5 py-2 text-[13px] font-semibold text-brand hover:bg-brand-soft"
            >
              {showAllInterests ? 'Скрыть' : `Ещё ${INTEREST_OPTIONS.length - 8}`}
            </button>
          ) : null}
        </div>

        <p className="mt-5 text-[13px] font-bold uppercase tracking-wide text-muted">Ищу</p>
        <div className="mt-2 inline-flex flex-wrap gap-2 rounded-full bg-ink/5 p-1">
          {SEEKING_OPTIONS.map((option) => {
            const active = seeking === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setSeeking(option.value)}
                title={option.hint}
                className={
                  active
                    ? 'rounded-full bg-brand px-4 py-2 text-[13px] font-semibold text-white'
                    : 'rounded-full px-4 py-2 text-[13px] font-semibold text-ink hover:text-brand'
                }
              >
                {option.label}
              </button>
            )
          })}
        </div>

        <button
          type="button"
          onClick={() => setSubmitted(true)}
          disabled={selected.length === 0}
          className="mt-6 rounded-full bg-brand px-6 py-3 text-[14px] font-bold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          Получить подборку
        </button>

        {submitted ? (
          <div className="mt-8">
            <div className="mb-3 flex items-baseline justify-between">
              <h3 className="text-[18px] font-extrabold text-ink">
                Подобранные команды
              </h3>
              <span className="text-[13px] text-muted">{results.length} вариантов</span>
            </div>
            {results.length === 0 ? (
              <p className="text-[14px] text-muted">Пока нет подходящих команд. Загляни позже!</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((team) => (
                  <article
                    key={team.id}
                    className="flex flex-col overflow-hidden rounded-[20px] bg-white p-4 shadow-[0_10px_28px_rgba(80,40,40,0.08)]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-[16px] font-extrabold text-ink">{team.title}</h4>
                      <span
                        className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[12px] font-bold text-white ${scoreTone(
                          team.score,
                        )}`}
                        title="Совместимость"
                      >
                        {team.score}%
                      </span>
                    </div>
                    <p className="mt-1 text-[12px] font-medium text-muted">
                      {[team.category, ...team.tags].filter(Boolean).slice(0, 4).join(' • ')}
                    </p>
                    <p className="mt-1.5 flex items-center gap-1 text-[12px] font-medium text-muted">
                      <span>📍 {team.city || 'онлайн'}</span>
                      <span aria-hidden>·</span>
                      <span>🎯 {team.difficulty || '—'}</span>
                    </p>
                    <ul className="mt-2 space-y-1">
                      {team.reasons.map((reason) => (
                        <li
                          key={reason}
                          className="flex items-start gap-1.5 text-[12px] leading-snug text-muted"
                        >
                          <span className="mt-0.5 text-emerald-500" aria-hidden>
                            ✓
                          </span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => {
                        if (!user) {
                          onOpenAuth()
                          return
                        }
                        onOpenChat(`team:${team.id}`)
                      }}
                      className="mt-4 rounded-full bg-brand px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-dark"
                    >
                      {user ? 'Открыть чат команды' : 'Войди, чтобы присоединиться'}
                    </button>
                  </article>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </section>
  )
}
