import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useApp, dmChatId, isValidEmail } from '../store'
import { fmtDate } from '../store'
import {
  INTEREST_OPTIONS,
  SEEKING_OPTIONS,
  AVAILABILITY_OPTIONS,
  type Seeking,
} from '../matching'
import { uploadAvatarFb } from '../firebase'
import { TelegramField } from './TelegramField'

type Props = {
  open: boolean
  onClose(): void
  initialTab?: Tab
  onOpenChat(chatId: string): void
}

type Tab = 'profile' | 'teams' | 'applications' | 'incoming' | 'reviews' | 'history' | 'moderation'

const statusLabel = {
  pending: 'На рассмотрении',
  accepted: 'Принята',
  rejected: 'Отклонена',
} as const

function Stars({ value, onChange }: { value: number; onChange?: (next: number) => void }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          className={`text-sm leading-none ${onChange ? 'cursor-pointer transition hover:scale-110' : 'cursor-default'} ${
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

export function ProfileModal({ open, onClose, initialTab, onOpenChat }: Props) {
  const {
    user,
    db,
    updateProfile,
    changePassword,
    changeEmail,
    setApplicationStatus,
    removeReview,
    removeTeamReview,
    approveTeam,
    rejectTeam,
    approveCategory,
    rejectCategory,
    deleteTeam,
    deleteCategory,
    sphereName,
    rateUser,
    userRating,
    isOrganizer,
    logout,
  } = useApp()

  const [tab, setTab] = useState<Tab>(initialTab ?? 'profile')

  useEffect(() => {
    if (open && initialTab) setTab(initialTab)
  }, [open, initialTab])

  const [name, setName] = useState('')
  const [surname, setSurname] = useState('')
  const [city, setCity] = useState('')
  const [telegram, setTelegram] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [seeking, setSeeking] = useState<Seeking>('team')
  const [skillInput, setSkillInput] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [availability, setAvailability] = useState('')
  const [goal, setGoal] = useState('')
  const [profileSaved, setProfileSaved] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [nextPassword, setNextPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordDone, setPasswordDone] = useState(false)

  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [emailDone, setEmailDone] = useState(false)

  const [avatar, setAvatar] = useState('')
  const [avatarLoading, setAvatarLoading] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open && user) {
      setName(user.name)
      setSurname(user.surname)
      setCity(user.city)
      setTelegram(user.telegram)
      setInterests(user.interests)
      setSeeking(user.seeking || 'team')
      setSkills(user.skills)
      setAvailability(user.availability)
      setGoal(user.goal)
      setEmail(user.login)
      setAvatar(user.avatar ?? '')
    }
  }, [open, user])

  const onAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') setAvatar(reader.result)
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  if (!open) return null
  if (!user) return null

  const myTeams = [
    ...db.pendingTeams.filter((team) => team.creatorId === user.id),
    ...db.customTeams.filter((team) => team.creatorId === user.id),
  ]

  const myApplications = db.applications
    .filter((application) => application.userId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const myParticipations = db.applications
    .filter((application) => application.userId === user.id && application.status === 'accepted')

  const teamMembers = (teamId: string) =>
    db.applications
      .filter(
        (application) => application.teamId === teamId && application.status === 'accepted',
      )
      .map((application) => ({
        applicationId: application.id,
        name: application.userName,
        city: application.city,
        telegram: application.telegram,
        userId: application.userId,
      }))

  const teamPendingApplications = (teamId: string) =>
    db.applications
      .filter((application) => application.teamId === teamId && application.status === 'pending')
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const ratingOf = (targetId: string) => userRating(targetId).rating

  const incoming = db.applications
    .filter((application) => application.creatorId === user.id)
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

  const saveProfile = async () => {
    const patch = {
      name,
      surname,
      city,
      telegram,
      hobbies: interests,
      interests,
      seeking,
      skills,
      availability,
      goal,
    }
    let finalPatch: typeof patch & { avatar?: string } = patch
    if (avatar && avatar.startsWith('data:') && user.id.startsWith('fb-')) {
      setAvatarLoading(true)
      try {
        const url = await uploadAvatarFb(user.id.slice(3), avatar)
        finalPatch = { ...patch, avatar: url }
        setAvatar(url)
      } catch {
        finalPatch = { ...patch, avatar: avatar }
      } finally {
        setAvatarLoading(false)
      }
    } else if (avatar !== (user.avatar ?? '')) {
      finalPatch = { ...patch, avatar: avatar }
    }
    updateProfile(finalPatch)
    setProfileSaved(true)
    window.setTimeout(() => setProfileSaved(false), 2500)
  }

  const toggleInterest = (interest: string) => {
    setInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest],
    )
  }
  const addEditorSkill = () => {
    const trimmed = skillInput.trim()
    if (trimmed && !skills.includes(trimmed)) setSkills([...skills, trimmed])
    setSkillInput('')
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

  const submitEmail = async () => {
    if (!isValidEmail(email.trim())) {
      setEmailError('Введи корректный email')
      return
    }
    const err = await changeEmail(email)
    if (err) {
      setEmailError(err)
      return
    }
    setEmailError(null)
    setEmailDone(true)
    window.setTimeout(() => setEmailDone(false), 2500)
  }

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: 'profile', label: 'Профиль' },
    { id: 'teams', label: 'Команды', badge: myTeams.length },
    { id: 'applications', label: 'Мои заявки', badge: myApplications.length },
    { id: 'reviews', label: 'Отзывы', badge: mySphereReviews.length + myTeamReviews.length },
    { id: 'history', label: 'История сфер', badge: myVisits.length },
  ]

  if (isOrganizer()) {
    tabs.push({
      id: 'incoming',
      label: 'Входящие',
      badge: incoming.filter((a) => a.status === 'pending').length,
    })
  }

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
              {user.name} {user.surname} · {isOrganizer() ? 'Организатор' : 'Участник'}
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
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-brand-soft">
                  {avatar ? (
                    <img src={avatar} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl font-black text-brand">
                      {(user.name || '?').slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-extrabold text-ink">Фото профиля</p>
                  <p className="mt-0.5 text-[12px] text-muted">
                    Показывается в командах и чатах.
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="rounded-full border border-brand/30 px-3 py-1.5 text-[12px] font-semibold text-brand transition hover:bg-brand-soft"
                    >
                      {avatar ? 'Заменить фото' : 'Загрузить фото'}
                    </button>
                    {avatar ? (
                      <button
                        type="button"
                        onClick={() => setAvatar('')}
                        className="rounded-full border border-ink/15 px-3 py-1.5 text-[12px] font-semibold text-muted transition hover:border-brand"
                      >
                        Удалить
                      </button>
                    ) : null}
                  </div>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onAvatarChange}
                  />
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
                  <div className="flex items-center gap-2">
                    <input
                      value={telegram}
                      placeholder="Telegram (@юзер)"
                      onChange={(event) => setTelegram(event.target.value)}
                      className="w-full flex-1 rounded-xl border border-ink/10 bg-cream px-4 py-2.5 text-sm text-ink outline-none transition focus:border-brand focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const tg = telegram.replace(/^@/, '').trim()
                        if (!tg) return
                        const link = `https://t.me/${tg}`
                        if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
                          void navigator.clipboard.writeText(link).catch(() => {})
                        } else {
                          try {
                            const area = document.createElement('textarea')
                            area.value = link
                            area.setAttribute('readonly', '')
                            area.style.position = 'fixed'
                            area.style.top = '-9999px'
                            document.body.appendChild(area)
                            area.select()
                            document.execCommand('copy')
                            document.body.removeChild(area)
                          } catch {
                            // ignore
                          }
                        }
                      }}
                      className="shrink-0 rounded-xl border border-brand/30 px-3 py-2.5 text-[12px] font-semibold text-brand transition hover:bg-brand-soft"
                    >
                      Копировать
                    </button>
                  </div>
                </div>
                <p className="mt-3 text-[11px] text-muted">
                  Измени нужные поля и нажми «Сохранить», чтобы обновить данные.
                </p>
              </div>

              <div className="space-y-5">
                <div className="rounded-2xl bg-brand-soft/60 p-4">
                  <p className="text-[12px] font-bold uppercase tracking-wide text-brand">
                    Как тебя видят другие
                  </p>
                  <p className="mt-1.5 text-[15px] font-extrabold text-ink">
                    {name} {surname}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {interests.map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-white px-2.5 py-1 text-[12px] font-semibold text-brand"
                      >
                        {item}
                      </span>
                    ))}
                    {skills.map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-white px-2.5 py-1 text-[12px] font-semibold text-ink"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                  {goal ? <p className="mt-2 text-[13px] font-medium text-ink">🔥 {goal}</p> : null}
                  <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[12px] font-medium text-muted">
                    {availability ? <span>🕐 {availability}</span> : null}
                    {seeking ? (
                      <span>
                        🎯 Ищу: {SEEKING_OPTIONS.find((option) => option.value === seeking)?.label.toLowerCase()}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-extrabold text-ink">Интересы</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {INTEREST_OPTIONS.map((interest) => {
                      const active = interests.includes(interest)
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={
                            active
                              ? 'rounded-full bg-brand px-3 py-1.5 text-[12px] font-semibold text-white'
                              : 'rounded-full border border-ink/15 bg-white px-3 py-1.5 text-[12px] font-semibold text-ink hover:border-brand'
                          }
                        >
                          {interest}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-extrabold text-ink">Ищу</p>
                  <div className="mt-2 inline-flex flex-wrap gap-1.5 rounded-full bg-ink/5 p-1">
                    {SEEKING_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSeeking(option.value)}
                        title={option.hint}
                        className={
                          seeking === option.value
                            ? 'rounded-full bg-brand px-3 py-1.5 text-[12px] font-semibold text-white'
                            : 'rounded-full px-3 py-1.5 text-[12px] font-semibold text-ink hover:text-brand'
                        }
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-1.5 text-[11px] text-muted">
                    {SEEKING_OPTIONS.find((option) => option.value === seeking)?.hint}
                  </p>
                </div>

                <div>
                  <span className="text-[12px] font-bold text-ink">О себе</span>
                  <div className="mt-1 flex gap-2">
                    <input
                      value={skillInput}
                      placeholder="Расскажи о себе: чем интересуешься, что умеешь"
                      onChange={(event) => setSkillInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          addEditorSkill()
                        }
                      }}
                      className="w-full rounded-xl border border-ink/10 bg-cream px-4 py-2.5 text-sm text-ink outline-none transition focus:border-brand focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={addEditorSkill}
                      className="shrink-0 rounded-xl bg-brand-soft px-3 text-lg font-bold text-brand hover:bg-brand hover:text-white"
                      aria-label="Добавить навык"
                    >
                      +
                    </button>
                  </div>
                  {skills.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {skills.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setSkills(skills.filter((skill) => skill !== item))}
                          className="rounded-full bg-brand-soft px-3 py-1 text-[12px] font-semibold text-brand"
                        >
                          {item} ✕
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div>
                  <span className="text-[12px] font-bold text-ink">График</span>
                  <select
                    value={availability}
                    onChange={(event) => setAvailability(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-ink/10 bg-cream px-4 py-2.5 text-sm text-ink outline-none transition focus:border-brand focus:bg-white"
                  >
                    <option value="">Не выбрано</option>
                    {AVAILABILITY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="text-[12px] font-bold text-ink">Твоя цель</span>
                  <textarea
                    value={goal}
                    onChange={(event) => setGoal(event.target.value)}
                    rows={2}
                    placeholder="Например: хочу создать свой стартап"
                    className="mt-1 w-full resize-none rounded-xl border border-ink/10 bg-cream px-4 py-2.5 text-sm text-ink outline-none transition focus:border-brand focus:bg-white"
                  />
                </div>

                <button
                  type="button"
                  onClick={saveProfile}
                  disabled={avatarLoading}
                  className="rounded-full bg-brand px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
                >
                  {avatarLoading ? 'Загружаем фото…' : 'Сохранить профиль'}
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

              <div>
                <p className="text-sm font-extrabold text-ink">Сменить email</p>
                <div className="mt-2">
                  <input
                    type="email"
                    value={email}
                    placeholder="Email для входа"
                    onChange={(event) => setEmail(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') submitEmail()
                    }}
                    className="w-full rounded-xl border border-ink/10 bg-cream px-4 py-2.5 text-sm text-ink outline-none transition focus:border-brand focus:bg-white"
                  />
                </div>
                {emailError ? (
                  <p className="mt-2 text-[12px] font-semibold text-brand">{emailError}</p>
                ) : null}
                <button
                  type="button"
                  onClick={submitEmail}
                  disabled={email === user.login}
                  className="mt-3 rounded-full border border-brand px-5 py-2.5 text-[13px] font-semibold text-brand transition hover:bg-brand-soft disabled:opacity-50"
                >
                  Сменить email
                </button>
                {emailDone ? (
                  <span className="ml-2 text-[13px] font-semibold text-brand">
                    ✓ Email изменён! Теперь входи с новым адресом.
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}

          {tab === 'teams' ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-brand px-3 py-1 text-[12px] font-bold text-white">
                  Всего команд: {myTeams.length}
                </span>
                {myParticipations.length > 0 ? (
                  <span className="rounded-full bg-brand-soft px-3 py-1 text-[12px] font-bold text-brand">
                    Участник в {myParticipations.length} командах
                  </span>
                ) : null}
              </div>

              <div>
                <p className="text-sm font-extrabold text-ink">Мои команды</p>
                {myTeams.length === 0 ? (
                  <p className="mt-3 rounded-2xl bg-cream p-5 text-center text-[13px] text-muted">
                    Пока нет созданных команд. Создай команду в разделе «Создать команду».
                  </p>
                ) : (
                  <div className="mt-3 space-y-4">
                    {myTeams.map((team) => {
                      const members = teamMembers(team.id)
                      return (
                        <article key={team.id} className="rounded-2xl bg-cream p-4">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-[14px] font-extrabold text-ink">{team.title}</p>
                              <p className="mt-0.5 text-[12px] text-muted">
                                {team.category} · {team.city} · {team.difficulty}
                              </p>
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-2">
                              <span
                                className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${
                                  team.status === 'approved'
                                    ? 'bg-brand-soft text-brand'
                                    : team.status === 'rejected'
                                      ? 'bg-[#fde4df] text-brand'
                                      : 'bg-white text-muted'
                                }`}
                              >
                                {team.status === 'approved'
                                  ? 'Одобрена'
                                  : team.status === 'rejected'
                                    ? 'Отклонена'
                                    : 'На модерации'}
                              </span>
                              <button
                                type="button"
                                onClick={() => deleteTeam(team.id)}
                                className="rounded-full border border-ink/10 px-3 py-1 text-[11px] font-semibold text-muted transition hover:border-brand hover:bg-[#fde4df] hover:text-brand"
                                title="Удалить команду"
                              >
                                Удалить
                              </button>
                            </div>
                          </div>
                          <p className="mt-3 text-[12px] font-extrabold text-ink">
                            Участники ({members.length + 1}/{team.capacity})
                          </p>
                          <ul className="mt-2 space-y-1.5">
                            <li className="flex items-center gap-2 rounded-xl bg-white px-3 py-2">
                              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand text-[10px] font-bold text-white">
                                {user.name.slice(0, 1)}
                              </span>
                              <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-ink">
                                {user.name} {user.surname}
                              </span>
                              <span className="shrink-0 text-[11px] font-bold text-brand">
                                Создатель
                              </span>
                            </li>
                            {members.map((member) => (
                              <li key={member.userId} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2">
                                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-soft text-[10px] font-bold text-brand">
                                  {member.name.slice(0, 1)}
                                </span>
                                <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-ink">
                                  {member.name}
                                </span>
                                <div className="shrink-0" title="Рейтинг участника">
                                  <Stars value={ratingOf(member.userId)} onChange={(n) => rateUser(member.userId, team.id, n)} />
                                </div>
                                <span className="hidden truncate text-[11px] text-muted sm:block">
                                  {member.city}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onOpenChat(dmChatId(user.id, member.userId))}
                                  className="shrink-0 rounded-full border border-brand/30 px-2.5 py-1 text-[11px] font-semibold text-brand transition hover:bg-brand-soft"
                                >
                                  Написать
                                </button>
                                {member.applicationId ? (
                                  <button
                                    type="button"
                                    onClick={() => setApplicationStatus(member.applicationId, 'rejected')}
                                    className="shrink-0 rounded-full border border-ink/10 px-2.5 py-1 text-[11px] font-semibold text-muted transition hover:bg-[#fde4df] hover:text-brand"
                                    title="Исключить из команды"
                                  >
                                    Исключить
                                  </button>
                                ) : null}
                              </li>
                            ))}
                          </ul>

                          {(() => {
                            const pending = teamPendingApplications(team.id)
                            if (pending.length === 0) return null
                            return (
                              <div className="mt-3">
                                <p className="text-[12px] font-extrabold text-ink">
                                  Заявки на вступление ({pending.length})
                                </p>
                                <div className="mt-2 space-y-2">
                                  {pending.map((application) => (
                                    <div
                                      key={application.id}
                                      className="rounded-xl bg-white p-3"
                                    >
                                      <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="min-w-0">
                                          <p className="text-[13px] font-bold text-ink">
                                            {application.userName}
                                          </p>
                                          <p className="mt-0.5 text-[11px] text-muted">
                                            {application.city}
                                            {application.telegram ? ` · ${application.telegram}` : ''}
                                            {application.rating ? ` · Рейтинг ${application.rating}/5` : ''}
                                          </p>
                                          {application.review ? (
                                            <p className="mt-0.5 text-[11px] leading-snug text-muted">
                                              {application.review}
                                            </p>
                                          ) : null}
                                        </div>
                                        <div className="flex shrink-0 gap-2">
                                          <button
                                            type="button"
                                            onClick={() => setApplicationStatus(application.id, 'accepted')}
                                            className="rounded-full bg-brand px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-brand-dark"
                                          >
                                            Одобрить
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setApplicationStatus(application.id, 'rejected')}
                                            className="rounded-full border border-brand/30 px-3 py-1.5 text-[11px] font-semibold text-brand transition hover:bg-brand-soft"
                                          >
                                            Отклонить
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          })()}
                          {team.tags.length > 0 ? (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {team.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-muted"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </article>
                      )
                    })}
                  </div>
                )}
              </div>

              {myParticipations.length > 0 ? (
                <div>
                  <p className="text-sm font-extrabold text-ink">Где я участник</p>
                  <div className="mt-3 space-y-2">
                    {myParticipations.map((participation) => (
                      <div
                        key={participation.id}
                        className="rounded-2xl bg-cream px-4 py-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="min-w-0 text-[13px] font-bold text-ink">
                            {participation.teamTitle}
                          </p>
                          <span className="shrink-0 rounded-full bg-brand-soft px-3 py-1 text-[11px] font-bold text-brand">
                            Принят
                          </span>
                        </div>
                        {participation.creatorId ? (
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="text-[11px] text-muted">Организатор:</span>
                            <Stars
                              value={ratingOf(participation.creatorId)}
                              onChange={(n) => rateUser(participation.creatorId, participation.teamId, n)}
                            />
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
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
                      {(() => {
                        const team = db.customTeams.find(
                          (candidate) => candidate.id === application.teamId,
                        )
                        return team && team.creatorId !== user.id ? (
                          <button
                            type="button"
                            onClick={() => onOpenChat(dmChatId(user.id, team.creatorId))}
                            className="mt-3 rounded-full border border-brand/30 px-4 py-2 text-[12px] font-semibold text-brand transition hover:bg-brand-soft"
                          >
                            Написать создателю
                          </button>
                        ) : null
                      })()}
                    </article>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {tab === 'incoming' && isOrganizer() ? (
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
                          <p className="mt-1 text-[12px] text-muted">
                            → команда «{application.teamTitle}» · {application.city}
                          </p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] text-muted">
                            {application.telegram ? (
                              <TelegramField value={application.telegram} />
                            ) : null}
                            {application.contacts ? (
                              <span>Контакты: {application.contacts}</span>
                            ) : null}
                            <span>Рейтинг: {application.rating}/5</span>
                          </div>
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
                      <button
                        type="button"
                        onClick={() => onOpenChat(dmChatId(user.id, application.userId))}
                        className="mt-3 rounded-full border border-brand/30 px-4 py-2 text-[12px] font-semibold text-brand transition hover:bg-brand-soft"
                      >
                        Написать участнику
                      </button>
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
                            <button
                              type="button"
                              onClick={() => deleteCategory(category.id)}
                              className="rounded-full border border-ink/10 px-4 py-2 text-[12px] font-semibold text-muted transition hover:border-brand hover:bg-[#fde4df] hover:text-brand"
                              title="Удалить сферу"
                            >
                              Удалить
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
                              <a
                                href={team.image}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 block overflow-hidden rounded-xl border border-ink/10"
                                title="Открыть обложку команды"
                              >
                                 <img
                                   src={team.image}
                                   alt="Обложка команды"
                                   loading="lazy"
                                   decoding="async"
                                   className="h-32 w-52 max-w-full object-cover"
                                 />
                              </a>
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
                            <button
                              type="button"
                              onClick={() => deleteTeam(team.id)}
                              className="rounded-full border border-ink/10 px-4 py-2 text-[12px] font-semibold text-muted transition hover:border-brand hover:bg-[#fde4df] hover:text-brand"
                              title="Удалить команду"
                            >
                              Удалить
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-extrabold text-ink">
                  Все команды{' '}
                  <span className="text-muted">
                    ({db.pendingTeams.length + db.customTeams.length})
                  </span>
                </p>
                {db.pendingTeams.length + db.customTeams.length === 0 ? (
                  <p className="mt-3 rounded-2xl bg-cream p-5 text-center text-[13px] text-muted">
                    Команд пока нет.
                  </p>
                ) : (
                  <div className="mt-3 space-y-3">
                    {[...db.pendingTeams, ...db.customTeams].map((team) => (
                      <article key={team.id} className="rounded-2xl bg-cream p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[14px] font-extrabold text-ink">{team.title}</p>
                            <p className="mt-0.5 text-[12px] text-muted">
                              {team.category} · {team.city} · {team.difficulty}
                            </p>
                            <p className="mt-1 text-[11px] text-muted">
                              {team.status === 'pending' ? 'На модерации' : 'Опубликована'} · Создал:{' '}
                              {team.creatorName} · {fmtDate(team.createdAt)}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {team.status === 'pending' ? (
                              <button
                                type="button"
                                onClick={() => approveTeam(team.id)}
                                className="rounded-full bg-brand px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-brand-dark"
                              >
                                Одобрить
                              </button>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => deleteTeam(team.id)}
                              className="rounded-full border border-ink/10 px-4 py-2 text-[12px] font-semibold text-muted transition hover:border-brand hover:bg-[#fde4df] hover:text-brand"
                              title="Удалить команду"
                            >
                              Удалить
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

        <div className="flex items-center justify-between gap-3 border-t border-cream px-6 py-4">
          <p className="truncate text-[12px] text-muted">
            Вы вошли как {user.name} {user.surname}
          </p>
          <button
            type="button"
            onClick={() => {
              logout()
              onClose()
            }}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-brand/30 px-4 py-2 text-[13px] font-semibold text-brand transition hover:bg-brand-soft"
          >
            Выйти
          </button>
        </div>
      </div>
    </div>
  )
}