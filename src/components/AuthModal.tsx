import { useState } from 'react'
import { useApp, isValidEmail, ERR_NOT_REGISTERED } from '../store'
import { firebaseEnabled } from '../firebase'
import {
  INTEREST_OPTIONS,
  SEEKING_OPTIONS,
  AVAILABILITY_OPTIONS,
  type Seeking,
} from '../matching'

type Props = {
  open: boolean
  onClose(): void
  onSuccess(): void
}

type Mode = 'login' | 'register' | 'forgot' | 'verify'

export function AuthModal({ open, onClose, onSuccess }: Props) {
  const {
    register,
    login,
    sendPasswordReset,
    resendVerification,
    refreshVerification,
  } = useApp()

  const [mode, setMode] = useState<Mode>('login')

  const [loginValue, setLoginValue] = useState('')
  const [password, setPassword] = useState('')
  const [sending, setSending] = useState(false)

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

  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [verifyEmail, setVerifyEmail] = useState('')

  if (!open) return null

  const handleLogin = async () => {
    const err = await login(loginValue, password)
    if (err) {
      setError(err)
      return
    }
    setError(null)
    if (firebaseEnabled) {
      const verified = await refreshVerification()
      if (!verified) {
        setVerifyEmail(loginValue.trim())
        reset()
        setMode('verify')
        return
      }
    }
    reset()
    onClose()
  }

  const handleRegister = async () => {
    if (firebaseEnabled && !isValidEmail(loginValue)) {
      setError('Введи корректный email (например: name@mail.ru)')
      return
    }
    const err = await register({
      name,
      surname,
      login: loginValue,
      email: loginValue,
      password,
      telegram,
      city,
      hobbies: interests,
      interests,
      seeking,
      skills,
      availability,
      goal,
      role: 'participant',
    })
    if (err) {
      setError(err)
      return
    }
    setError(null)
    if (firebaseEnabled) {
      const email = loginValue.trim()
      reset()
      setMode('verify')
      setVerifyEmail(email)
      setInfo('Письмо для подтверждения отправлено на почту. Открой его и перейди по ссылке.')
      return
    }
    reset()
    onClose()
    onSuccess()
  }

  const handleForgot = async () => {
    if (!isValidEmail(loginValue)) {
      setError('Введи корректный email (например: name@mail.ru)')
      return
    }
    setError(null)
    setInfo(null)
    setSending(true)
    try {
      const err = await sendPasswordReset(loginValue)
      if (err) {
        setError(err)
      } else {
        setInfo('Письмо со ссылкой для сброса пароля отправлено. Проверь почту.')
      }
    } finally {
      setSending(false)
    }
  }

  const checkVerified = async () => {
    setError(null)
    setInfo(null)
    setSending(true)
    try {
      const verified = await refreshVerification()
      if (verified) {
        reset()
        setMode('login')
        onClose()
        onSuccess()
      } else {
        setError('Почта ещё не подтверждена. Проверь письмо и перейди по ссылке из него.')
      }
    } finally {
      setSending(false)
    }
  }

  const resend = async () => {
    setError(null)
    setInfo(null)
    setSending(true)
    try {
      const err = await resendVerification()
      if (err) {
        setError(err)
      } else {
        setInfo('Письмо отправлено ещё раз. Проверь почту.')
      }
    } finally {
      setSending(false)
    }
  }

  const reset = () => {
    setLoginValue('')
    setPassword('')
    setName('')
    setSurname('')
    setCity('')
    setTelegram('')
    setInterests([])
    setSeeking('team')
    setSkillInput('')
    setSkills([])
    setAvailability('')
    setGoal('')
    setError(null)
    setInfo(null)
    setVerifyEmail('')
  }

  const inputClass =
    'w-full rounded-xl border border-ink/10 bg-cream px-4 py-2.5 text-sm text-ink outline-none transition focus:border-brand focus:bg-white'

  const toggleInterest = (interest: string) => {
    setInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest],
    )
  }
  const addSkill = () => {
    const trimmed = skillInput.trim()
    if (trimmed && !skills.includes(trimmed)) setSkills([...skills, trimmed])
    setSkillInput('')
  }

  const profileFields = (
    <div className="space-y-4">
      <div>
        <p className="text-[12px] font-bold text-ink">Что тебе интересно?</p>
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
        <p className="mt-1.5 text-[11px] text-muted">
          Интересы нужны для умного подбора команд и людей.
        </p>
      </div>

      <div>
        <p className="text-[12px] font-bold text-ink">Ищу</p>
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
      </div>

      <div>
        <span className="text-[12px] font-bold text-ink">О себе</span>
        <div className="mt-1 flex gap-2">
          <input
            className={inputClass}
            placeholder="Расскажи о себе: чем интересуешься, что умеешь"
            value={skillInput}
            onChange={(event) => setSkillInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                addSkill()
              }
            }}
          />
          <button
            type="button"
            onClick={addSkill}
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
                onClick={() => setSkills(skills.filter((s) => s !== item))}
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
          className={`${inputClass} mt-1`}
          value={availability}
          onChange={(event) => setAvailability(event.target.value)}
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
          className={`${inputClass} mt-1 resize-none`}
          rows={2}
          placeholder="Например: хочу создать свой стартап / найти команду для хакатона"
          value={goal}
          onChange={(event) => setGoal(event.target.value)}
        />
      </div>

    </div>
  )

  const verifyForm = (
    <div className="space-y-3">
      <div className="rounded-xl bg-brand-soft px-4 py-3 text-[13px] leading-relaxed text-brand">
        <p className="font-bold">Подтверждение почты</p>
        <p className="mt-1">
          Мы отправили письмо на <b>{verifyEmail || loginValue}</b>. Открой его и перейди по ссылке,
          затем нажми кнопку ниже.
        </p>
      </div>
      <button
        type="button"
        disabled={sending}
        onClick={checkVerified}
        className="w-full rounded-full bg-brand py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
      >
        {sending ? 'Проверяем…' : 'Я подтвердил(а) — войти'}
      </button>
      <button
        type="button"
        disabled={sending}
        onClick={resend}
        className="w-full rounded-full border border-ink/10 py-3 text-sm font-semibold text-brand transition hover:bg-cream disabled:opacity-60"
      >
        {sending ? 'Отправляем…' : 'Отправить письмо ещё раз'}
      </button>
      <p className="text-center text-[11px] text-muted">
        Письмо может оказаться в папке «Спам».
      </p>
    </div>
  )

  const forgotForm = (
    <div className="space-y-3">
      <p className="text-[13px] leading-relaxed text-muted">
        Укажи email, указанный при регистрации. Мы отправим письмо со ссылкой для сброса пароля.
      </p>
      <input
        className={inputClass}
        type="email"
        placeholder="Email"
        value={loginValue}
        onChange={(event) => setLoginValue(event.target.value)}
      />
      <button
        type="button"
        disabled={sending}
        onClick={handleForgot}
        className="w-full rounded-full bg-brand py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
      >
        {sending ? 'Отправляем…' : 'Отправить ссылку для сброса'}
      </button>
      <p className="text-center text-[12px] text-muted">
        Вспомнил пароль?{' '}
        <button
          type="button"
          className="font-semibold text-brand hover:text-brand-dark"
          onClick={() => {
            setMode('login')
            setError(null)
            setInfo(null)
          }}
        >
          Назад ко входу
        </button>
      </p>
    </div>
  )

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-ink/40 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="mx-auto my-4 w-full max-w-md max-h-[92vh] overflow-y-auto rounded-[28px] bg-white shadow-[0_24px_60px_rgba(80,40,40,0.25)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-cream px-6 py-4">
          <p className="text-lg font-extrabold text-ink">Личный кабинет</p>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-cream hover:text-ink"
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {mode === 'login' || mode === 'register' ? (
            <div className="mb-5 grid grid-cols-2 gap-1 rounded-full bg-cream p-1">
              {(['login', 'register'] as Mode[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setMode(item)
                    setError(null)
                    setInfo(null)
                  }}
                  className={`rounded-full py-2 text-sm font-semibold transition ${
                    mode === item ? 'bg-white text-brand shadow-sm' : 'text-muted hover:text-ink'
                  }`}
                >
                  {item === 'login' ? 'Вход' : 'Регистрация'}
                </button>
              ))}
            </div>
          ) : null}

          {error ? (
            <div className="mb-4 rounded-xl bg-brand-soft px-4 py-2.5 text-[13px] font-medium text-brand">
              <p>{error}</p>
              {error === ERR_NOT_REGISTERED ? (
                <button
                  type="button"
                  onClick={() => {
                    setMode('register')
                    setError(null)
                    setInfo(null)
                  }}
                  className="mt-2 inline-flex items-center gap-1 rounded-full bg-brand px-4 py-1.5 text-[12px] font-bold text-white transition hover:bg-brand-dark"
                >
                  Зарегистрироваться →
                </button>
              ) : null}
            </div>
          ) : null}
          {info ? (
            <p className="mb-4 rounded-xl bg-emerald-50 px-4 py-2.5 text-[13px] font-medium text-emerald-700">
              {info}
            </p>
          ) : null}

          {mode === 'verify' ? (
            verifyForm
          ) : mode === 'forgot' ? (
            forgotForm
          ) : mode === 'login' ? (
            <form
                className="space-y-3"
                onSubmit={(event) => {
                  event.preventDefault()
                  void handleLogin()
                }}
              >
                <input
                  className={inputClass}
                  type="email"
                  placeholder={firebaseEnabled ? 'Email' : 'Логин'}
                  value={loginValue}
                  onChange={(event) => setLoginValue(event.target.value)}
                />
                <input
                  className={inputClass}
                  type="password"
                  placeholder="Пароль"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  className="text-[12px] font-semibold text-brand hover:text-brand-dark"
                  onClick={() => {
                    setMode('forgot')
                    setError(null)
                    setInfo(null)
                  }}
                >
                  Забыли пароль?
                </button>
                <button
                  type="submit"
                  className="w-full rounded-full bg-brand py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
                >
                  Войти
                </button>
                <p className="text-center text-[12px] text-muted">
                  Ещё нет аккаунта?{' '}
                  <button
                    type="button"
                    className="font-semibold text-brand hover:text-brand-dark"
                    onClick={() => {
                      setMode('register')
                      setError(null)
                      setInfo(null)
                    }}
                  >
                    Зарегистрируйся
                  </button>
                </p>
              </form>
          ) : (
            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault()
                void handleRegister()
              }}
            >
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
              <div className="grid grid-cols-2 gap-3">
                <input
                  className={inputClass}
                  placeholder="Город"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                />
                <input
                  className={inputClass}
                  placeholder="Telegram (@юзер)"
                  value={telegram}
                  onChange={(event) => setTelegram(event.target.value)}
                />
              </div>
              <input
                className={inputClass}
                type="email"
                placeholder={firebaseEnabled ? 'Email' : 'Логин'}
                value={loginValue}
                onChange={(event) => setLoginValue(event.target.value)}
              />
              <input
                className={inputClass}
                type="password"
                placeholder="Пароль (минимум 8 символов)"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              {profileFields}
              <button
                type="submit"
                className="w-full rounded-full bg-brand py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
              >
                Создать аккаунт
              </button>
              <p className="text-center text-[11px] text-muted">
                На почту придёт письмо для подтверждения аккаунта.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}