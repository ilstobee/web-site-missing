import { useState } from 'react'
import type { Team } from '../data'
import { useApp } from '../store'

type Props = {
  team: Team
  onClose(): void
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
          className={`text-xl leading-none ${onChange ? 'cursor-pointer' : 'cursor-default'} ${
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

export function TeamReviewModal({ team, onClose }: Props) {
  const { user, addTeamReview, db } = useApp()
  const [rating, setRating] = useState(5)
  const [text, setText] = useState('')
  const [sent, setSent] = useState(false)

  const reviews = db.teamReviews
    .filter((review) => review.teamId === team.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const submit = () => {
    if (!text.trim()) return
    addTeamReview(team.id, team.title, team.category, rating, text.trim())
    setText('')
    setRating(5)
    setSent(true)
    window.setTimeout(() => setSent(false), 3000)
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink/40 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-[0_24px_60px_rgba(80,40,40,0.25)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-brand">Отзыв о команде</p>
            <h3 className="mt-0.5 text-lg font-extrabold text-ink">{team.title}</h3>
            <p className="text-[12px] text-muted">
              {team.category} · {team.city} · {team.difficulty}
            </p>
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

        {reviews.length > 0 ? (
          <div className="mt-5 space-y-3">
            <p className="text-[13px] font-extrabold text-ink">Отзывы участников</p>
            {reviews.map((review) => (
              <article
                key={review.id}
                className="rounded-2xl bg-cream p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[13px] font-extrabold text-ink">{review.authorName}</p>
                  <Stars value={review.rating} />
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{review.text}</p>
              </article>
            ))}
          </div>
        ) : null}

        {user ? (
          <div className="mt-5 rounded-2xl bg-cream p-4">
            <p className="text-[13px] font-extrabold text-ink">Оставить отзыв</p>
            <div className="mt-2 flex items-center gap-3">
              <span className="text-[12px] font-medium text-muted">Оценка:</span>
              <Stars value={rating} onChange={setRating} />
            </div>
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={3}
              placeholder="Расскажи про команду: атмосфера, организация, что понравилось… (цензура включена)"
              className="mt-3 w-full rounded-xl border border-ink/10 bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-brand"
            />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={submit}
                className="rounded-full bg-brand px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-brand-dark"
              >
                Отправить отзыв
              </button>
              {sent ? (
                <span className="text-[13px] font-semibold text-brand">✓ Отзыв добавлен!</span>
              ) : null}
            </div>
          </div>
        ) : (
          <p className="mt-5 rounded-2xl bg-cream p-4 text-center text-[13px] font-medium text-muted">
            Войди в аккаунт, чтобы оставить отзыв о команде.
          </p>
        )}
      </div>
    </div>
  )
}