import { useRef } from 'react'
import { featuredTeams } from '../data'
import { SectionHeader } from './SectionHeader'
import { TeamCard } from './TeamCard'

export function FeaturedTeams() {
  const scroller = useRef<HTMLDivElement>(null)

  return (
    <section id="teams" className="relative py-10">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <SectionHeader
          title="Команды, которые ищут тебя"
          href="#teams"
          linkLabel="Смотреть все команды"
        />
        <div className="relative">
          <div ref={scroller} className="hide-scroll flex gap-4 overflow-x-auto pb-2">
            {featuredTeams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
          <button
            type="button"
            className="absolute -right-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white text-brand shadow-md md:grid"
            onClick={() => scroller.current?.scrollBy({ left: 300, behavior: 'smooth' })}
            aria-label="Дальше"
          >
            →
          </button>
        </div>
      </div>
    </section>
  )
}
