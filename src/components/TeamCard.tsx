import { useState } from 'react'
import type { Team } from '../data'

const actionLabel: Record<Team['action'], string> = {
  details: 'Подробнее',
  join: 'Присоединиться',
  watch: 'Посмотреть',
}

export function TeamCard({
  team,
  onApply,
  onReview,
}: {
  team: Team
  onApply(team: Team): void
  onReview?(team: Team): void
}) {
  const [saved, setSaved] = useState(false)

  return (
    <article className="flex w-[270px] shrink-0 flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_10px_28px_rgba(80,40,40,0.08)]">
      <div className="relative h-[150px] overflow-hidden">
        <img src={team.image} alt="" className="img-even" />
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-brand/40 bg-white px-2 py-0.5 text-[11px] font-semibold text-ink">
          <svg viewBox="0 0 16 16" className="h-3 w-3 text-brand" fill="none" aria-hidden>
            <circle cx="8" cy="5.5" r="2.1" stroke="currentColor" strokeWidth="1.4" />
            <path d="M3.8 12.4c.8-1.7 2.2-2.6 4.2-2.6s3.4.9 4.2 2.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          {team.members}/{team.capacity}
        </span>
        <div className="absolute bottom-2.5 left-3 flex -space-x-2">
          {team.avatars.map((src) => (
            <img
              key={src}
              src={src}
              alt=""
              className="h-7 w-7 rounded-full object-cover ring-2 ring-white"
            />
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-[16px] font-extrabold text-ink">{team.title}</h3>
        <p className="mt-1 text-[12px] font-medium text-muted">
          {team.tags.join(' • ')}
        </p>
        <p className="mt-1.5 flex items-center gap-1 text-[12px] font-medium text-muted">
          <span>📍 {team.city}</span>
          <span aria-hidden>·</span>
          <span>🎯 {team.difficulty}</span>
        </p>
        <p className="mt-2 line-clamp-2 flex-1 text-[13px] leading-snug text-muted">
          {team.description || 'Открой страницу команды и подай заявку!'}
        </p>
        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onApply(team)}
            className="rounded-full bg-brand px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-dark"
          >
            {actionLabel[team.action]}
          </button>
          <div className="flex items-center gap-1.5">
            {onReview ? (
              <button
                type="button"
                onClick={() => onReview(team)}
                className="rounded-full border border-brand/30 px-3 py-2 text-[12px] font-semibold text-brand hover:bg-brand-soft"
                aria-label="Оставить отзыв о команде"
              >
                Отзыв
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setSaved((value) => !value)}
              className={saved ? 'text-brand' : 'text-muted'}
              aria-label="Сохранить команду"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill={saved ? 'currentColor' : 'none'} aria-hidden>
                <path
                  d="M7 4.5h10a1 1 0 0 1 1 1V20l-6-3.2L6 20V5.5a1 1 0 0 1 1-1Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
