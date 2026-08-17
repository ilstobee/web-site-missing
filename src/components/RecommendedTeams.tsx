import { useRef, useState } from 'react'
import { recommendedTeams } from '../data'
import { SectionHeader } from './SectionHeader'

export function RecommendedTeams() {
  const scroller = useRef<HTMLDivElement>(null)
  const [saved, setSaved] = useState<Record<string, boolean>>({})

  return (
    <section id="for-you" className="py-10">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <SectionHeader
          title="Команды для тебя"
          subtitle="На основе твоих интересов"
          href="#for-you"
          linkLabel="Все рекомендации"
        />

        <div className="relative">
          <div ref={scroller} className="hide-scroll flex gap-3 overflow-x-auto pb-2">
            {recommendedTeams.map((team) => (
              <article
                key={team.id}
                className="flex w-[240px] shrink-0 items-start gap-3 rounded-2xl bg-blush p-2.5"
              >
                <img
                  src={team.image}
                  alt=""
                  className="h-[72px] w-[72px] rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-[13px] font-extrabold text-ink">
                    {team.title}
                  </h3>
                  <p className="text-[11px] text-muted">{team.category}</p>
                  <p className="text-[11px] text-muted">
                    {team.members}/{team.capacity} участников
                  </p>
                  <div className="mt-1.5 flex -space-x-1.5">
                    {team.avatars.map((src) => (
                      <img
                        key={src}
                        src={src}
                        alt=""
                        className="h-5 w-5 rounded-full object-cover ring-2 ring-white"
                      />
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSaved((current) => ({
                      ...current,
                      [team.id]: !current[team.id],
                    }))
                  }
                  className={`mt-1 ${saved[team.id] ? 'text-brand' : 'text-muted'}`}
                  aria-label="Сохранить"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill={saved[team.id] ? 'currentColor' : 'none'}
                    aria-hidden
                  >
                    <path
                      d="M7 4.5h10a1 1 0 0 1 1 1V20l-6-3.2L6 20V5.5a1 1 0 0 1 1-1Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </article>
            ))}
          </div>
          <button
            type="button"
            className="absolute -right-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white text-brand shadow-md md:grid"
            onClick={() => scroller.current?.scrollBy({ left: 260, behavior: 'smooth' })}
            aria-label="Дальше"
          >
            →
          </button>
        </div>
      </div>
    </section>
  )
}
