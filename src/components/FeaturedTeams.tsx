import { useMemo, useRef, useState } from 'react'
import { asset, socialAvatars } from '../data'
import type { Team } from '../data'
import { useApp } from '../store'
import type { CustomTeam } from '../store'
import { SectionHeader } from './SectionHeader'
import { TeamCard } from './TeamCard'
import { ApplyModal } from './ApplyModal'
import { TeamReviewModal } from './TeamReviewModal'

type Props = {
  onOpenAuth(): void
}

export function customToTeam(team: CustomTeam): Team {
  return {
    id: team.id,
    title: team.title,
    image: asset('images/teams/team-startup.png'),
    members: team.members,
    capacity: team.capacity,
    avatars: socialAvatars.slice(0, 3),
    tags: team.tags.length > 0 ? team.tags : [team.category],
    description: team.description,
    action: 'join',
    category: team.category,
    city: team.city,
    difficulty: team.difficulty,
    creatorId: team.creatorId,
  }
}

export function FeaturedTeams({ onOpenAuth }: Props) {
  const { db, user } = useApp()
  const scroller = useRef<HTMLDivElement>(null)

  const [city, setCity] = useState('all')
  const [people, setPeople] = useState('all')
  const [difficulty, setDifficulty] = useState('all')
  const [applyTeam, setApplyTeam] = useState<Team | null>(null)
  const [reviewTeam, setReviewTeam] = useState<Team | null>(null)

  const allTeams = useMemo<Team[]>(
    () => db.customTeams.map(customToTeam),
    [db.customTeams],
  )

  const cities = useMemo(
    () => Array.from(new Set(allTeams.map((team) => team.city))).sort(),
    [allTeams],
  )

  const filtered = allTeams.filter((team) => {
    if (city !== 'all' && team.city !== city) return false
    if (difficulty !== 'all' && team.difficulty !== difficulty) return false
    if (people !== 'all') {
      if (people === '1-5' && (team.members < 1 || team.members > 5)) return false
      if (people === '6-10' && (team.members < 6 || team.members > 10)) return false
      if (people === '11+' && team.members < 11) return false
    }
    return true
  })

  const handleApply = (team: Team) => {
    if (!user) {
      onOpenAuth()
      return
    }
    setApplyTeam(team)
  }

  const selectClass =
    'rounded-full border border-ink/10 bg-white px-4 py-2 text-[13px] font-semibold text-ink outline-none transition focus:border-brand'

  return (
    <section id="teams" className="relative py-10">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <SectionHeader
          title="Команды, которые ищут тебя"
          href="#teams"
          linkLabel="Смотреть все команды"
        />

        <div className="mb-5 flex flex-wrap items-center gap-2.5">
          <label className="flex items-center gap-2 text-[13px] font-medium text-muted">
            Город:
            <select value={city} onChange={(event) => setCity(event.target.value)} className={selectClass}>
              <option value="all">Все города</option>
              {cities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-[13px] font-medium text-muted">
            Людей:
            <select value={people} onChange={(event) => setPeople(event.target.value)} className={selectClass}>
              <option value="all">Любое</option>
              <option value="1-5">1–5</option>
              <option value="6-10">6–10</option>
              <option value="11+">11+</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-[13px] font-medium text-muted">
            Сложность:
            <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className={selectClass}>
              <option value="all">Любая</option>
              <option value="Легко">Легко</option>
              <option value="Средне">Средне</option>
              <option value="Сложно">Сложно</option>
            </select>
          </label>
          {filtered.length > 0 ? (
            <span className="text-[12px] text-muted">Найдено: {filtered.length}</span>
          ) : null}
        </div>

        <div className="relative">
          <div ref={scroller} className="hide-scroll flex gap-4 overflow-x-auto pb-2">
            {filtered.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                onApply={handleApply}
                onReview={setReviewTeam}
              />
            ))}
            {filtered.length === 0 ? (
              <p className="rounded-2xl bg-blush px-6 py-10 text-[14px] font-medium text-muted">
                Ничего не нашлось. Попробуй изменить фильтры.
              </p>
            ) : null}
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

      {applyTeam ? <ApplyModal team={applyTeam} onClose={() => setApplyTeam(null)} /> : null}
      {reviewTeam ? <TeamReviewModal team={reviewTeam} onClose={() => setReviewTeam(null)} /> : null}
    </section>
  )
}