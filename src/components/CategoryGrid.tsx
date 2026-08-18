import { useState } from 'react'
import { useApp } from '../store'
import { SectionHeader } from './SectionHeader'
import { fmtDate } from '../store'

type Props = {
  activeId: string
  onActiveChange(id: string): void
  onOpenAuth(): void
}

function Stars({ value, onChange }: { value: number; onChange?: (next: number) => void }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          className={`text-lg leading-none ${onChange ? 'cursor-pointer' : 'cursor-default'} ${
            n <= value ? 'text-brand' : 'text-muted/25'
          }`}
          aria-label={`Оценка ${n}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export function CategoryGrid({ activeId, onActiveChange, onOpenAuth }: Props) {
  const { allCategories, db, user, addReview, addCategory, sphereStats } = useApp()
  const [showAll, setShowAll] = useState(false)
  const [addCatOpen, setAddCatOpen] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewSent, setReviewSent] = useState(false)

  const active = allCategories.find((category) => category.id === activeId) ?? allCategories[0]
  const activeStats = sphereStats(active.id)

  const visible = allCategories.slice(0, 6)
  const rest = allCategories.slice(6)

  const reviews = db.reviews
    .filter((review) => review.sphereId === active.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const submitReview = () => {
    if (!reviewText.trim()) return
    addReview(active.id, reviewRating, reviewText)
    setReviewText('')
    setReviewRating(5)
    setReviewSent(true)
    window.setTimeout(() => setReviewSent(false), 3000)
  }

  const submitCategory = async () => {
    if (!newCatName.trim()) return
    const id = await addCategory(newCatName)
    if (id) onActiveChange(id)
    setNewCatName('')
    setAddCatOpen(false)
  }

  const tileClass = (tint?: string, isActive = false) =>
    `flex h-[72px] items-center justify-center gap-2.5 rounded-2xl px-3 transition ${
      isActive
        ? 'bg-white shadow-[0_8px_20px_rgba(80,40,40,0.08)] ring-2 ring-brand'
        : `${tint ?? 'bg-cream'} hover:ring-1 hover:ring-brand/40`
    }`

  return (
    <section id="spheres" className="py-8">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <SectionHeader title="Найди свою сферу" href="#spheres" linkLabel="Смотреть все сферы" />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {visible.map((category) => {
            const isActive = category.id === activeId
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onActiveChange(category.id)}
                aria-pressed={isActive}
                className={tileClass(category.tint, isActive)}
              >
                <img src={category.icon} alt="" className="icon-even" />
                <span className="text-left text-[13px] font-semibold leading-tight text-ink">
                  {category.name}
                </span>
              </button>
            )
          })}

          <button
            type="button"
            onClick={() => setShowAll((value) => !value)}
            aria-expanded={showAll}
            className={`flex h-[72px] items-center justify-center gap-2.5 rounded-2xl px-3 transition ${
              showAll
                ? 'bg-white shadow-[0_8px_20px_rgba(80,40,40,0.08)] ring-2 ring-brand'
                : 'bg-[#fde4df] hover:ring-1 hover:ring-brand/40'
            }`}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-brand">
              <svg
                viewBox="0 0 12 12"
                className={`h-3 w-3 transition ${showAll ? 'rotate-180' : ''}`}
                fill="none"
                aria-hidden
              >
                <path d="M2 4.5 6 8.5 10 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
            <span className="text-left text-[13px] font-semibold leading-tight text-ink">
              Другое
            </span>
          </button>
        </div>

        {showAll ? (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {rest.map((category) => {
              const isActive = category.id === activeId
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => onActiveChange(category.id)}
                  aria-pressed={isActive}
                  className={tileClass(category.tint, isActive)}
                >
                  <img src={category.icon} alt="" className="icon-even" />
                  <span className="text-left text-[13px] font-semibold leading-tight text-ink">
                    {category.name}
                  </span>
                </button>
              )
            })}
          </div>
        ) : null}

        <div className="mt-6 overflow-hidden rounded-[28px] bg-blush shadow-[0_8px_24px_rgba(80,40,40,0.04)]">
          <div className="border-b border-white/70 p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <img src={active.icon} alt="" className="h-10 w-10 shrink-0 object-contain" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-[1.4rem] font-extrabold leading-tight text-ink">
                    {active.info.title}
                  </h3>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[12px] font-bold text-brand shadow-sm">
                    <span className="text-brand">★</span>
                    {activeStats.rating > 0 ? activeStats.rating.toFixed(1) : '—'}
                    <span className="font-medium text-muted">
                      · {activeStats.reviews} отз. · активность {activeStats.activity}
                    </span>
                  </span>
                </div>
                <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted">
                  {active.info.subtitle}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="rounded-2xl bg-cream p-5">
              <h4 className="text-sm font-extrabold text-ink">Сферы направления</h4>
              {active.info.spheres.length > 0 ? (
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {active.info.spheres.map((sphere) => (
                    <li
                      key={sphere}
                      className="flex items-center gap-2 text-[13px] font-medium text-ink"
                    >
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
                        <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" aria-hidden>
                          <path
                            d="m3.5 8.5 3 3 6-7"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      {sphere}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-[13px] font-medium text-muted">
                  Своя сфера — добавить направления можно вместе с командами.
                </p>
              )}
            </div>

            <div>
              <h4 className="text-sm font-extrabold text-ink">Команды, которые ищут тебя</h4>
              {active.info.teams.length > 0 ? (
                <div className="mt-3 space-y-3">
                  {active.info.teams.map((team) => (
                    <article
                      key={team.name}
                      className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-[0_6px_16px_rgba(80,40,40,0.05)]"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-extrabold text-ink">{team.name}</p>
                        <p className="mt-1 text-[12px] text-muted">💼 Навыки: {team.skills}</p>
                        <p className="mt-0.5 text-[12px] text-muted">⭐️ Рейтинг: {team.rating}</p>
                      </div>
                      <a
                        href="#teams"
                        className="shrink-0 rounded-full bg-brand px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-brand-dark"
                      >
                        Посмотреть
                      </a>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-3 rounded-2xl bg-white p-5 text-[13px] font-medium text-muted">
                  Пока нет команд —{' '}
                  <a href="#create" className="font-semibold text-brand hover:text-brand-dark">
                    создай первую
                  </a>{' '}
                  и собери единомышленников!
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/70 bg-white/70 px-6 py-5 sm:px-8">
            <div>
              <p className="text-[15px] font-extrabold text-ink">
                Не нашёл подходящую команду? <span className="text-brand">Создай свою!</span>
              </p>
              <p className="mt-0.5 text-[12px] font-medium text-muted">{active.info.cta}</p>
            </div>
            <a
              href="#create"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
            >
              Создать команду →
            </a>
          </div>
        </div>

        <div className="mt-6 rounded-[28px] bg-blush p-6 shadow-[0_8px_24px_rgba(80,40,40,0.04)] sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h4 className="text-[1.15rem] font-extrabold text-ink">
              Отзывы о сфере «{active.name}»
            </h4>
            {!user ? (
              <button
                type="button"
                onClick={onOpenAuth}
                className="rounded-full bg-brand px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-brand-dark"
              >
                Войди, чтобы оставить отзыв
              </button>
            ) : null}
          </div>

          {reviews.length > 0 ? (
            <div className="mt-4 space-y-3">
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-2xl bg-white p-4 shadow-[0_4px_12px_rgba(80,40,40,0.05)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[13px] font-extrabold text-ink">{review.authorName}</p>
                    <div className="flex items-center gap-2">
                      <Stars value={review.rating} />
                      <span className="text-[11px] text-muted">{fmtDate(review.createdAt)}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted">{review.text}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-[13px] text-muted">
              Пока нет отзывов. Будь первым, кто поделится впечатлением о сфере!
            </p>
          )}

          {user ? (
            <div className="mt-5 rounded-2xl bg-cream p-4">
              <p className="text-[13px] font-extrabold text-ink">Оставить отзыв</p>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-[12px] font-medium text-muted">Оценка:</span>
                <Stars value={reviewRating} onChange={setReviewRating} />
              </div>
              <textarea
                value={reviewText}
                onChange={(event) => setReviewText(event.target.value)}
                rows={3}
                placeholder="Расскажи про сферу, команды и впечатления… (цензура включена)"
                className="mt-3 w-full rounded-xl border border-ink/10 bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-brand"
              />
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={submitReview}
                  className="rounded-full bg-brand px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-brand-dark"
                >
                  Отправить отзыв
                </button>
                {reviewSent ? (
                  <span className="text-[13px] font-semibold text-brand">✓ Отзыв добавлен!</span>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-6 rounded-[28px] bg-blush p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-[1.15rem] font-extrabold text-ink">
                Не нашёл нужной сферы? Добавь свою!
              </h4>
              <p className="mt-1 text-[13px] text-muted">
                Новая сфера появится в общем списке и в ленте предложений.
              </p>
            </div>
            {!user ? (
              <button
                type="button"
                onClick={onOpenAuth}
                className="rounded-full bg-brand px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-brand-dark"
              >
                Войди, чтобы добавлять сферы
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setAddCatOpen((open) => !open)}
                className="rounded-full bg-brand px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-brand-dark"
              >
                {addCatOpen ? 'Скрыть форму' : 'Добавить свою сферу +'}
              </button>
            )}
          </div>

          {user && addCatOpen ? (
            <div className="mt-4 flex flex-wrap gap-3">
              <input
                value={newCatName}
                onChange={(event) => setNewCatName(event.target.value)}
                placeholder="Название сферы (например: Астрономия, Скрапбукинг)"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    submitCategory()
                  }
                }}
                className="w-full max-w-sm rounded-xl border border-ink/10 bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-brand sm:flex-1"
              />
              <button
                type="button"
                onClick={submitCategory}
                className="rounded-full bg-brand px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-brand-dark"
              >
                Добавить сферу
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}