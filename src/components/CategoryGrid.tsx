import { useState } from 'react'
import { categories } from '../data'
import { SectionHeader } from './SectionHeader'

export function CategoryGrid() {
  const [activeId, setActiveId] = useState(categories[0].id)
  const active = categories.find((category) => category.id === activeId) ?? categories[0]

  return (
    <section id="spheres" className="py-8">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <SectionHeader
          title="Найди свою сферу"
          href="#spheres"
          linkLabel="Смотреть все сферы"
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => {
            const isActive = category.id === activeId
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveId(category.id)}
                aria-pressed={isActive}
                className={`flex h-[72px] items-center justify-center gap-2.5 rounded-2xl px-3 transition ${
                  isActive
                    ? 'bg-white shadow-[0_8px_20px_rgba(80,40,40,0.08)] ring-2 ring-brand'
                    : `${category.tint ?? 'bg-cream'} hover:ring-1 hover:ring-brand/40`
                }`}
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
            className="flex h-[72px] items-center justify-center gap-2.5 rounded-2xl bg-[#fde4df] px-3"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center gap-0.5 rounded-full bg-white">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            </span>
            <span className="text-left text-[13px] font-semibold leading-tight text-ink">
              Ещё сотни направлений
            </span>
          </button>
        </div>

        <div className="mt-6 overflow-hidden rounded-[28px] bg-blush shadow-[0_8px_24px_rgba(80,40,40,0.04)]">
          <div className="border-b border-white/70 p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <img src={active.icon} alt="" className="h-10 w-10 shrink-0 object-contain" />
              <div>
                <h3 className="text-[1.4rem] font-extrabold leading-tight text-ink">
                  {active.info.title}
                </h3>
                <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted">
                  {active.info.subtitle}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="rounded-2xl bg-cream p-5">
              <h4 className="text-sm font-extrabold text-ink">Сферы направления</h4>
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
            </div>

            <div>
              <h4 className="text-sm font-extrabold text-ink">Команды, которые ищут тебя</h4>
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
                    <button
                      type="button"
                      className="shrink-0 rounded-full bg-brand px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-brand-dark"
                    >
                      Посмотреть
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/70 bg-white/70 px-6 py-5 sm:px-8">
            <div>
              <p className="text-[15px] font-extrabold text-ink">
                Не нашёл подходящую команду?{' '}
                <span className="text-brand">Создай свою!</span>
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
      </div>
    </section>
  )
}
