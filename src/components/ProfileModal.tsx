import { useEffect, useState } from 'react'
import { useApp } from '../store'
import type { UserRole } from '../store'
import { fmtDate } from '../store'

type Props = {
  open: boolean
  onClose(): void
  initialTab?: Tab
}

type Tab = 'profile' | 'applications' | 'incoming' | 'reviews' | 'history' | 'moderation'

const roleLabel: Record<UserRole, string> = {
  organizer: 'Организатор',
  participant: 'Участник',
}

const statusLabel = {
  pending: 'На рассмотрении',
  accepted: 'Принята',
  rejected: 'Отклонена',
} as const

export function ProfileModal({ open, onClose, initialTab }: Props) {
  const {
    user,
    db,
    updateProfile,
    setUserRole,
    changePassword,
    setApplicationStatus,
    removeReview,
    removeTeamReview,
    approveTeam,
    rejectTeam,
    approveCategory,
    rejectCategory,
    sphereName,
  } = useApp()

  const [tab, setTab] = useState<Tab>(initialTab ?? 'profile')

  useEffect(() => {
    if (open && initialTab) setTab(initialTab)
  }, [open, initialTab])

  const [name, setName] = useState('')
  const [surname, setSurname] = useState('')
  const [city, setCity] = useState('')
  const [telegram, setTelegram] = useState('')
  const [hobby, setHobby] = useState('')
  const [hobbies, setHobbies] = useState<string[]>([])
  const [profileSaved, setProfileSaved] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [nextPassword, setNextPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordDone, setPasswordDone] = useState(false)

  useEffect(() => {
    if (open && user) {
      setName(user.name)
      setSurname(user.surname)
      setCity(user.city)
      setTelegram(user.telegram)
      setHobbies(user.hobbies)
    }
  }, [open, user])

  if (!open) return null
  if (!user) return null

  const myTeams = db.customTeams.filter((team) => team.creatorId === user.id)
  const myTeamIds = new Set(myTeams.map((team) => team.id))

  const myApplications = db.applications
    .filter((application) => application.userId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const incoming = db.applications
    .filter((application) => myTeamIds.has(application.teamId))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const mySphereReviews = db.reviews
    .filter((review) => review.userId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const myTeamReviews = db.teamReviews
    .filter((review) => review.userId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const myVisits = db.visits
    .filter((visit) => visit.userId === user.id)
    .sort((a, b) => b.at.localeCompare(a.at))

  const saveProfile = () => {
    const patch = { name, surname, city, telegram, hobbies }
    updateProfile(patch)
    setProfileSaved(true)
    window.setTimeout(() => setProfileSaved(false), 2500)
  }

  const applyHobby = () => {
    const trimmed = hobby.trim()
    if (trimmed && !hobbies.includes(trimmed)) setHobbies([...hobbies, trimmed])
    setHobby('')
  }

  const submitPassword = () => {
    const err = changePassword(currentPassword, nextPassword)
    if (err) {
      setPasswordError(err)
      return
    }
    setPasswordError(null)
    setCurrentPassword('')
    setNextPassword('')
    setPasswordDone(true)
    window.setTimeout(() => setPasswordDone(false), 2500)
  }

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: 'profile', label: 'Профиль' },
    { id: 'applications', label: 'Мои заявки', badge: myApplications.length },
    { id: 'incoming', label: 'Входящие', badge: incoming.filter((a) => a.status === 'pending').length },
    { id: 'reviews', label: 'Отзывы', badge: mySphereReviews.length + myTeamReviews.length },
    { id: 'history', label: 'История сфер', badge: myVisits.length },
  ]

  if (user.isAdmin) {
    tabs.push({ id: 'moderation', label: 'Модерация', badge: db.pendingTeams.length + db.pendingCategories.length })
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink/40 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-[28px] bg-white shadow-[0_24px_60px_rgba(80,40,40,0.25)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-cream px-6 py-4">
          <div className="min-w-0">
            <p className="text-lg font-extrabold text-ink">Личный кабинет</p>
            <p className="truncate text-[12px] text-muted">
              {user.name} {user.surname} · {roleLabel[user.role]}
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

        <div className="flex gap-1 overflow-x-auto border-b border-cream px-4 py-2">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold transition ${
                tab === item.id ? 'bg-brand text-white' : 'text-muted hover:bg-cream hover:text-ink'
              }`}
            >
              {item.label}
              {item.badge && item.badge > 0 ? (
                <span
                  className={`grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-bold ${
                    tab === item.id ? 'bg-white text-brand' : 'bg-brand text-white'
                  }`}
                >
                  {item.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-6">
          {tab === 'profile' ? (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-extrabold text-ink">Роль на платформе</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(
                    [
                      { value: 'participant', title: 'Участник', desc: 'Ищу команду и принимаю заявки' },
                      { value: 'organizer', title: 'Организатор', desc: 'Создаю команды и отправляю заявки' },
                    ] as const
                  ).map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setUserRole(option.value)}
                      className={`rounded-xl border px-3 py-2.5 text-left transition ${
                        user.role === option.value
                          ? 'border-brand bg-brand-soft'
                          : 'border-ink/10 hover:border-brand/40'
                      }`}
                    >
                      <span className="block text-[13px] font-extrabold text-ink">
                        {option.title}
                      </span>
                      <span className="mt-0.5 block text-[11px] leading-snug text-muted">
                        {option.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-extrabold text-ink">Профиль</p>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <input
                    value={name}
                    placeholder="Имя"
                    onChange={(event) => setName(event.target.value)}
                    className="w-full rounded-xl border border-ink/10 bg-cream px-4 py-2.5 text-sm text-ink outline-none transition focus:border-brand focus:bg-white"
                  />
                  <input
                    value={surname}
                    placeholder="Фамилия"
                    onChange={(event) => setSurname(event.target.value)}
                    className="w-full rounded-xl border border-ink/10 bg-cream px-4 py-2.5 text-sm text-ink outline-none transition focus:border-brand focus:bg-white"
                  />
                  <input
                    value={city}
                    placeholder="Город"
                    onChange={(event) => setCity(event.target.value)}
                    className="w-full rounded-xl border border-ink/10 bg-cream px-4 py-2.5 text-sm text-ink outline-none transition focus:border-brand focus:bg-white"
                  />
                  <input
                    value={telegram}
                    placeholder="Telegram (@юзер)"
                    onChange={(event) => setTelegram(event.target.value)}
                    className="w-full rounded-xl border border-ink/10 bg-cream px-4 py-2.5 text-sm text-ink outline-none transition focus:border-brand focus:bg-white"
                  />
                </div>
                <p className="mt-3 text-[11px] text-muted">
                  Измени нужные поля и нажми «Сохранить», чтобы обновить данные.
                </p>
              </div>

              <div>
                <p className="text-sm font-extrabold text-ink">Хобби</p>
                <div className="mt-2 flex gap-2">
                  <input
                    value={hobby}
                    placeholder="Добавить хобби (футбол, кино…)"
                    onChange={(event) => setHobby(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        applyHobby()
                      }
                    }}
                    className="w-full rounded-xl border border-ink/10 bg-cream px-4 py-2.5 text-sm text-ink outline-none transition focus:border-brand focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={applyHobby}
                    className="shrink-0 rounded-xl bg-brand-soft px-3 text-lg font-bold text-brand hover:bg-brand hover:text-white"
                    aria-label="Добавить хобби"
                  >
                    +
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {hobbies.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setHobbies(hobbies.filter((h) => h !== item))}
                      className="rounded-full bg-brand-soft px-3 py-1 text-[12px] font-semibold text-brand"
                    >
                      {item} ✕
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-[11px] text-muted">
                  Хобби помогут подбирать рекомендации команд и сфер.
                </p>
                <button
                  type="button"
                  onClick={saveProfile}
                  className="mt-3 rounded-full bg-brand px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-brand-dark"
                >
                  Сохранить профиль
                </button>
                {profileSaved ? (
                  <span className="ml-2 text-[13px] font-semibold text-brand">✓ Сохранено!</span>
                ) : null}
              </div>

              <div>
                <p className="text-sm font-extrabold text-ink">Сменить пароль</p>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <input
                    type="password"
                    value={currentPassword}
                    placeholder="Текущий пароль"
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    className="w-full rounded-xl border border-ink/10 bg-cream px-4 py-2.5 text-sm text-ink outline-none transition focus:border-brand focus:bg-white"
                  />
                  <input
                    type="password"
                    value={nextPassword}
                    placeholder="Новый пароль (мин. 8 символов)"
                    onChange={(event) => setNextPassword(event.target.value)}
                    className="w-full rounded-xl border border-ink/10 bg-cream px-4 py-2.5 text-sm text-ink outline-none transition focus:border-brand focus:bg-white"
                  />
                </div>
                {passwordError ? (
                  <p className="mt-2 text-[12px] font-semibold text-brand">{passwordError}</p>
                ) : null}
                <button
                  type="button"
                  onClick={submitPassword}
                  className="mt-3 rounded-full border border-brand px-5 py-2.5 text-[13px] font-semibold text-brand transition hover:bg-brand-soft"
                >
                  Сменить пароль
                </button>
                {passwordDone ? (
                  <span className="ml-2 text-[13px] font-semibold text-brand">✓ Пароль изменён!</span>
                ) : null}
              </div>
            </div>
          ) : null}

          {tab === 'applications' ? (
            <div>
              <p className="text-sm font-extrabold text-ink">Мои заявки</p>
              {myApplications.length === 0 ? (
                <p className="mt-3 rounded-2xl bg-cream p-5 text-center text-[13px] text-muted">
                  Пока нет заявок. Найди команду в ленте и подай заявку — она сохранится здесь.
                </p>
              ) : (
                <div className="mt-3 space-y-3">
                  {myApplications.map((application) => (
                    <article
                      key={application.id}
                      className="rounded-2xl bg-cream p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[14px] font-extrabold text-ink">
                            {application.teamTitle}
                          </p>
                          <p className="mt-0.5 text-[12px] text-muted">
                            {application.sphereName} · {application.city}
                          </p>
                          <p className="mt-1 text-[12px] text-muted">
                            Твой отклик: {application.review || '—'}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${
                            application.status === 'accepted'
                              ? 'bg-brand-soft text-brand'
                              : application.status === 'rejected'
                                ? 'bg-[#fde4df] text-brand'
                                : 'bg-white text-muted'
                          }`}
                        >
                          {statusLabel[application.status]}
                        </span>
                      </div>
                      <p className="mt-2 text-[11px] text-muted">
                        {fmtDate(application.createdAt)}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {tab === 'incoming' ? (
            <div>
              <p className="text-sm font-extrabold text-ink">Входящие заявки на твои команды</p>
              {incoming.length === 0 ? (
                <p className="mt-3 rounded-2xl bg-cream p-5 text-center text-[13px] text-muted">
                  Сюда приходят заявки от участников на твои команды. Создай команду, чтобы получать их.
                </p>
              ) : (
                <div className="mt-3 space-y-3">
                  {incoming.map((application) => (
                    <article
                      key={application.id}
                      className="rounded-2xl bg-cream p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[14px] font-extrabold text-ink">
                            {application.userName}
                          </p>
                          <p className="mt-0.5 text-[12px] text-muted">
                            → команда «{application.teamTitle}» · {application.city}
                          </p>
                          <p className="mt-1 text-[12px] text-muted">
                            Telegram: {application.telegram || '—'} · Контакты:{' '}
                            {application.contacts || '—'} · Рейтинг: {application.rating}/5
                          </p>
                          {application.review ? (
                            <p className="mt-1 text-[12px] leading-snug text-muted">
                              Отклик: {application.review}
                            </p>
                          ) : null}
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${
                            application.status === 'accepted'
                              ? 'bg-brand-soft text-brand'
                              : application.status === 'rejected'
                                ? 'bg-[#fde4df] text-brand'
                                : 'bg-white text-muted'
                          }`}
                        >
                          {statusLabel[application.status]}
                        </span>
                      </div>
                      {application.status === 'pending' ? (
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() => setApplicationStatus(application.id, 'accepted')}
                            className="rounded-full bg-brand px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-brand-dark"
                          >
                            Принять
                          </button>
                          <button
                            type="button"
                            onClick={() => setApplicationStatus(application.id, 'rejected')}
                            className="rounded-full border border-brand/30 px-4 py-2 text-[12px] font-semibold text-brand transition hover:bg-brand-soft"
                          >
                            Отклонить
                          </button>
                        </div>
                      ) : null}
                      <p className="mt-2 text-[11px] text-muted">
                        {fmtDate(application.createdAt)}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {tab === 'reviews' ? (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-extrabold text-ink">Мои отзывы о командах</p>
                {myTeamReviews.length === 0 ? (
                  <p className="mt-3 rounded-2xl bg-cream p-5 text-center text-[13px] text-muted">
                    Пока нет отзывов о командах. Оставь отзыв на карточке команды.
                  </p>
                ) : (
                  <div className="mt-3 space-y-3">
                    {myTeamReviews.map((review) => (
                      <article key={review.id} className="rounded-2xl bg-cream p-4">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[14px] font-extrabold text-ink">
                              {review.teamTitle}
                            </p>
                            <p className="mt-1 text-[12px] text-muted">
                              {'★'.repeat(review.rating)}
                              {'☆'.repeat(5 - review.rating)}
                            </p>
                            <p className="mt-1 text-[12px] leading-snug text-muted">
                              {review.text}
                            </p>
                            <p className="mt-1 text-[11px] text-muted">
                              {fmtDate(review.createdAt)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeTeamReview(review.id)}
                            className="shrink-0 rounded-full border border-brand/30 px-3 py-1.5 text-[11px] font-semibold text-brand transition hover:bg-brand-soft"
                          >
                            Удалить
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-extrabold text-ink">Мои отзывы о сферах</p>
                {mySphereReviews.length === 0 ? (
                  <p className="mt-3 rounded-2xl bg-cream p-5 text-center text-[13px] text-muted">
                    Пока нет отзывов о сферах.
                  </p>
                ) : (
                  <div className="mt-3 space-y-3">
                    {mySphereReviews.map((review) => (
                      <article key={review.id} className="rounded-2xl bg-cream p-4">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[14px] font-extrabold text-ink">
                              {sphereName(review.sphereId)}
                            </p>
                            <p className="mt-1 text-[12px] text-muted">
                              {'★'.repeat(review.rating)}
                              {'☆'.repeat(5 - review.rating)}
                            </p>
                            <p className="mt-1 text-[12px] leading-snug text-muted">{review.text}</p>
                            <p className="mt-1 text-[11px] text-muted">
                              {fmtDate(review.createdAt)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeReview(review.id)}
                            className="shrink-0 rounded-full border border-brand/30 px-3 py-1.5 text-[11px] font-semibold text-brand transition hover:bg-brand-soft"
                          >
                            Удалить
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {tab === 'history' ? (
            <div>
              <p className="text-sm font-extrabold text-ink">История посещения сфер</p>
              {myVisits.length === 0 ? (
                <p className="mt-3 rounded-2xl bg-cream p-5 text-center text-[13px] text-muted">
                  Здесь появится история сфер, которые ты открывал.
                </p>
              ) : (
                <div className="mt-3 space-y-2">
                  {myVisits.map((visit) => (
                    <div
                      key={`${visit.sphereId}-${visit.at}`}
                      className="flex items-center justify-between gap-3 rounded-2xl bg-cream px-4 py-3"
                    >
                      <p className="text-[13px] font-bold text-ink">{sphereName(visit.sphereId)}</p>
                      <p className="text-[11px] text-muted">{fmtDate(visit.at)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        {tab === 'moderation' && user.isAdmin ? (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-extrabold text-ink">
                  Сферы на модерации
                </p>
                {db.pendingCategories.length === 0 ? (
                  <p className="mt-3 rounded-2xl bg-cream p-5 text-center text-[13px] text-muted">
                    Нет сфер на проверке.
                  </p>
                ) : (
                  <div className="mt-3 space-y-3">
                    {db.pendingCategories.map((category) => (
                      <article key={category.id} className="rounded-2xl bg-cream p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[14px] font-extrabold text-ink">{category.name}</p>
                            <p className="mt-0.5 text-[11px] text-muted">
                              {fmtDate(category.createdAt)}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => approveCategory(category.id)}
                              className="rounded-full bg-brand px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-brand-dark"
                            >
                              Одобрить
                            </button>
                            <button
                              type="button"
                              onClick={() => rejectCategory(category.id)}
                              className="rounded-full border border-brand/30 px-4 py-2 text-[12px] font-semibold text-brand transition hover:bg-brand-soft"
                            >
                              Отклонить
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-extrabold text-ink">Команды на модерации</p>
                {db.pendingTeams.length === 0 ? (
                  <p className="mt-3 rounded-2xl bg-cream p-5 text-center text-[13px] text-muted">
                    Нет команд на проверке.
                  </p>
                ) : (
                  <div className="mt-3 space-y-3">
                    {db.pendingTeams.map((team) => (
                      <article key={team.id} className="rounded-2xl bg-cream p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[14px] font-extrabold text-ink">{team.title}</p>
                            <p className="mt-0.5 text-[12px] text-muted">
                              {team.category} · {team.city} · {team.difficulty}
                            </p>
                            {team.image ? (
                              <img
                                src={team.image}
                                alt=""
                                className="mt-2 h-16 w-28 rounded-lg object-cover"
                              />
                            ) : null}
                            <p className="mt-1 text-[11px] text-muted">
                              Создал: {team.creatorName} · {fmtDate(team.createdAt)}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => approveTeam(team.id)}
                              className="rounded-full bg-brand px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-brand-dark"
                            >
                              Одобрить
                            </button>
                            <button
                              type="button"
                              onClick={() => rejectTeam(team.id)}
                              className="rounded-full border border-brand/30 px-4 py-2 text-[12px] font-semibold text-brand transition hover:bg-brand-soft"
                            >
                              Отклонить
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}