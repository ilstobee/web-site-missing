import { useMemo, useRef, useState } from 'react'
import type { Team } from '../data'
import { recommendedTeams } from '../data'
import { useApp } from '../store'
import { SectionHeader } from './SectionHeader'
import { TeamCard } from './TeamCard'
import { customToTeam } from './FeaturedTeams'
import { ApplyModal } from './ApplyModal'
import { TeamReviewModal } from './TeamReviewModal'

export function RecommendedTeams({
  city,
  onOpenChat,
}: {
  city: string
  onOpenChat(chatId: string): void
}) {
  const { db, user, withdrawApplication } = useApp()
  const scroller = useRef<HTMLDivElement>(null)
  const [applyTeam, setApplyTeam] = useState<Team | null>(null)
  const [reviewTeam, setReviewTeam] = useState<Team | null>(null)

  const teams = useMemo(() => {
    if (!user) {
      const demo = city === 'all' ? recommendedTeams : recommendedTeams.filter((team) => team.city.trim().toLowerCase() === city.toLowerCase())
      return demo.length > 0 ? demo : recommendedTeams
    }
    const hobbies = user.hobbies.map((hobby) => hobby.toLowerCase())
    return db.customTeams
      .filter((team) => {
        if (city !== 'all' && team.city.trim().toLowerCase() !== city.toLowerCase()) return false
        if (user.city && team.city.trim().toLowerCase() === user.city.toLowerCase()) return true
        const haystack = [team.category, ...team.tags].join(' ').toLowerCase()
        return hobbies.some((hobby) => haystack.includes(hobby))
      })
      .map(customToTeam)
  }, [db.customTeams, user, city])

  const appliedTeamIds = useMemo(
    () => new Set(db.applications.filter((application) => application.userId === user?.id).map((application) => application.teamId)),
    [db.applications, user?.id],
  )

  return (
    <section id="for-you" className="py-10">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <SectionHeader
          title="Команды по твоим интересам"
          subtitle="На основе твоих хобби и города"
          href="#for-you"
          linkLabel="Все рекомендации"
        />

        {teams.length > 0 ? (
          <div className="relative">
            <div ref={scroller} className="hide-scroll flex gap-4 overflow-x-auto pb-2">
              {teams.map((team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  applied={appliedTeamIds.has(team.id)}
                  onWithdraw={(item) => withdrawApplication(item.id)}
                  onApply={setApplyTeam}
                  onReview={setReviewTeam}
                  onChat={(item) => onOpenChat(`team:${item.id}`)}
                />
              ))}
            </div>
            <button
              type="button"
              className="absolute -left-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white text-brand shadow-md md:grid"
              onClick={() => scroller.current?.scrollBy({ left: -260, behavior: 'smooth' })}
              aria-label="Назад"
            >
              ←
            </button>
            <button
              type="button"
              className="absolute -right-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white text-brand shadow-md md:grid"
              onClick={() => scroller.current?.scrollBy({ left: 260, behavior: 'smooth' })}
              aria-label="Дальше"
            >
              →
            </button>
          </div>
        ) : (
          <div className="rounded-2xl bg-blush p-8 text-center">
            <p className="text-[15px] font-extrabold text-ink">
              {user
                ? 'Пока нет команд по твоим интересам'
                : 'Войди, чтобы получать подборку по интересам'}
            </p>
            <p className="mt-1 text-[13px] text-muted">
              {user
                ? 'Заполни хобби в личном кабинете и добавь команды, которые ищут тебя.'
                : 'Зарегистрируйся, укажи хобби и город — здесь появятся подходящие команды.'}
            </p>
          </div>
        )}
      </div>

      {applyTeam ? <ApplyModal team={applyTeam} onClose={() => setApplyTeam(null)} /> : null}
      {reviewTeam ? <TeamReviewModal team={reviewTeam} onClose={() => setReviewTeam(null)} /> : null}
    </section>
  )
}