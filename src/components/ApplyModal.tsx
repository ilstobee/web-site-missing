import { useMemo, useState } from 'react'
import type { Team } from '../data'
import { useApp } from '../store'

type Props = {
  team: Team
  onClose(): void
}

const appliedKey = (userId: string) => `missing_applied_${userId}`

export function ApplyModal({ team, onClose }: Props) {
  const { user, addApplication } = useApp()

  const [name, setName] = useState(user?.name ?? '')
  const [surname, setSurname] = useState(user?.surname ?? '')
  const [city, setCity] = useState(user?.city ?? '')
  const [contacts, setContacts] = useState('')
  const [telegram, setTelegram] = useState(user?.telegram ?? '')
  const [rating, setRating] = useState('5')
  const [review, setReview] = useState('')
  const [sent, setSent] = useState(false)

  const isOwn = !!user && team.creatorId === user.id

  const alreadyApplied = useMemo(() => {
    if (!user || isOwn) return false
    try {
      const raw = localStorage.getItem(appliedKey(user.id))
      const list: string[] = raw ? (JSON.parse(raw) as string[]) : []
      return list.includes(team.id)
    } catch {
      return false
    }
  }, [user, isOwn, team.id])

  const markApplied = () => {
    if (!user) return
    try {
      const raw = localStorage.getItem(appliedKey(user.id))
      const list: string[] = raw ? (JSON.parse(raw) as string[]) : []
      if (!list.includes(team.id)) {
        list.push(team.id)
        localStorage.setItem(appliedKey(user.id), JSON.stringify(list))
      }
    } catch {
      // ignore
    }
  }

  const inputClass =
    'w-full rounded-xl border border-ink/10 bg-cream px-4 py-2.5 text-sm text-ink outline-none transition focus:border-brand focus:bg-white'

  const submit = () => {
    if (!name.trim() || !surname.trim() || !city.trim() || !contacts.trim()) {
      return
    }
    addApplication({
      teamId: team.id,
      teamTitle: team.title,
      sphereId: team.category,
      sphereName: team.category,
      city: city.trim(),
      contacts: contacts.trim(),
      telegram: telegram.trim(),
      rating,
      review: review.trim(),
    })
    setSent(true)
    markApplied()
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
            <p className="text-sm font-semibold text-brand">Заявка в команду</p>
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

        {isOwn ? (
          <div className="mt-6 rounded-2xl bg-brand-soft p-6 text-center">
            <p className="text-2xl">🙅</p>
            <p className="mt-2 text-[15px] font-extrabold text-ink">Это твоя команда!</p>
            <p className="mt-1 text-[13px] text-muted">
              Нельзя подать заявку в свою собственную команду.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 rounded-full bg-brand px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-brand-dark"
            >
              Понятно
            </button>
          </div>
        ) : alreadyApplied ? (
          <div className="mt-6 rounded-2xl bg-brand-soft p-6 text-center">
            <p className="text-2xl">✅</p>
            <p className="mt-2 text-[15px] font-extrabold text-ink">Ты уже отправил(а) заявку</p>
            <p className="mt-1 text-[13px] text-muted">
              В эту команду уже есть твоя заявка. Когда организатор ответит — придёт уведомление.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 rounded-full bg-brand px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-brand-dark"
            >
              Понятно
            </button>
          </div>
        ) : sent ? (
          <div className="mt-6 rounded-2xl bg-brand-soft p-6 text-center">
            <p className="text-2xl">🎉</p>
            <p className="mt-2 text-[15px] font-extrabold text-ink">Заявка отправлена!</p>
            <p className="mt-1 text-[13px] text-muted">
              Заявка сохранилась в твоём личном кабинете. Когда организатор ответит, тебе придёт уведомление.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 rounded-full bg-brand px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-brand-dark"
            >
              Отлично
            </button>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                className={inputClass}
                placeholder="Имя"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <input
                className={inputClass}
                placeholder="Фамилия"
                value={surname}
                onChange={(event) => setSurname(event.target.value)}
              />
            </div>
            <input
              className={inputClass}
              placeholder="Город"
              value={city}
              onChange={(event) => setCity(event.target.value)}
            />
            <input
              className={inputClass}
              placeholder="Контакты для связи (почта, телефон)"
              value={contacts}
              onChange={(event) => setContacts(event.target.value)}
            />
            <input
              className={inputClass}
              placeholder="Номер юзер в Telegram (@username)"
              value={telegram}
              onChange={(event) => setTelegram(event.target.value)}
            />
            <div className="flex items-center justify-between gap-3 rounded-xl bg-cream px-4 py-2.5">
              <span className="text-sm font-medium text-ink">Твой рейтинг</span>
              <select
                value={rating}
                onChange={(event) => setRating(event.target.value)}
                className="rounded-lg border border-ink/10 bg-white px-2 py-1.5 text-sm font-semibold text-ink outline-none"
              >
                {['5', '4', '3', '2', '1'].map((value) => (
                  <option key={value} value={value}>
                    {value} / 5
                  </option>
                ))}
              </select>
            </div>
            <textarea
              className={inputClass}
              rows={3}
              placeholder="Отзыв о себе и что ищешь в команде… (цензура включена)"
              value={review}
              onChange={(event) => setReview(event.target.value)}
            />
            <button
              type="button"
              onClick={submit}
              className="w-full rounded-full bg-brand py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
            >
              Отправить заявку
            </button>
            <p className="text-center text-[11px] text-muted">
              Все поля обязательны. Заявки без цензуры автоматически редактируются.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}