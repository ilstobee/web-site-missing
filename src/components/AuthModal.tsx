import { useState } from 'react'
import { useApp, isValidEmail, isValidPhone } from '../store'
import type { UserRole } from '../store'
import {
  firebaseEnabled,
  sendPhoneCode,
  confirmPhoneCode,
  saveUserProfileFb,
  fbErrorMessage,
} from '../firebase'

type Props = {
  open: boolean
  onClose(): void
  onSuccess(): void
}

type Mode = 'login' | 'register' | 'forgot' | 'verify'
type Contact = 'email' | 'phone'

export function AuthModal({ open, onClose, onSuccess }: Props) {
  const {
    register,
    login,
    markFbSession,
    sendPasswordReset,
    resendVerification,
    refreshVerification,
  } = useApp()

  const [mode, setMode] = useState<Mode>('login')
  const [contact, setContact] = useState<Contact>('email')

  const [loginValue, setLoginValue] = useState('')
  const [password, setPassword] = useState('')
  const [phoneValue, setPhoneValue] = useState('')
  const [codeValue, setCodeValue] = useState('')
  const [verificationId, setVerificationId] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [sending, setSending] = useState(false)

  const [name, setName] = useState('')
  const [surname, setSurname] = useState('')
  const [city, setCity] = useState('')
  const [telegram, setTelegram] = useState('')
  const [hobby, setHobby] = useState('')
  const [hobbies, setHobbies] = useState<string[]>([])
  const [role, setRole] = useState<UserRole>('participant')

  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [verifyEmail, setVerifyEmail] = useState('')

  if (!open) return null

  const addHobby = () => {
    const trimmed = hobby.trim()
    if (trimmed && !hobbies.includes(trimmed)) setHobbies([...hobbies, trimmed])
    setHobby('')
  }

  const handleLogin = async () => {
    const err = await login(loginValue, password)
    if (err) {
      setError(err)
      return
    }
    setError(null)
    if (firebaseEnabled && contact === 'email') {
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
      hobbies,
      role,
    })
    if (err) {
      setError(err)
      return
    }
    setError(null)
    if (firebaseEnabled && contact === 'email') {
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

  const sendCode = async () => {
    if (!isValidPhone(phoneValue)) {
      setError('Введи корректный номер телефона (например: +7 900 000-00-00)')
      return
    }
    setError(null)
    setSending(true)
    try {
      const container = document.getElementById('fb-recaptcha')
      if (container) container.innerHTML = ''
      const confirmation = await sendPhoneCode(phoneValue, 'fb-recaptcha')
      setVerificationId(confirmation.verificationId)
      setCodeSent(true)
    } catch (caught) {
      setError(fbErrorMessage(caught))
    } finally {
      setSending(false)
    }
  }

  const confirmPhone = async (asRegister: boolean) => {
    if (!verificationId) return
    setError(null)
    setSending(true)
    try {
      const fbUser = await confirmPhoneCode(verificationId, codeValue)
      if (asRegister) {
        await saveUserProfileFb(fbUser.uid, {
          name,
          surname,
          city,
          telegram,
          hobbies,
          role,
        })
        markFbSession(fbUser.uid, {
          name,
          surname,
          city,
          telegram,
          hobbies,
          role,
        })
      }
      setError(null)
      reset()
      onClose()
      onSuccess()
    } catch (caught) {
      setError(fbErrorMessage(caught))
    } finally {
      setSending(false)
    }
  }

  const reset = () => {
    setLoginValue('')
    setPassword('')
    setPhoneValue('')
    setCodeValue('')
    setVerificationId('')
    setCodeSent(false)
    setName('')
    setSurname('')
    setCity('')
    setTelegram('')
    setHobby('')
    setHobbies([])
    setRole('participant')
    setError(null)
    setInfo(null)
    setVerifyEmail('')
  }

  const inputClass =
    'w-full rounded-xl border border-ink/10 bg-cream px-4 py-2.5 text-sm text-ink outline-none transition focus:border-brand focus:bg-white'

  const contactToggle = (
    <div className="grid grid-cols-2 gap-1 rounded-full bg-cream p-1">
      {(
        [
          { value: 'email', label: 'Почта' },
          { value: 'phone', label: 'Телефон' },
        ] as const
      ).map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => {
            setContact(option.value)
            setCodeSent(false)
            setError(null)
          }}
          className={`rounded-full py-2 text-sm font-semibold transition ${
            contact === option.value
              ? 'bg-white text-brand shadow-sm'
              : 'text-muted hover:text-ink'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )

  const phoneForm = (asRegister: boolean) => (
    <div className="space-y-3">
      {codeSent ? (
        <>
          <p className="rounded-xl bg-brand-soft px-4 py-2.5 text-[13px] font-medium text-brand">
            Код отправлен на {phoneValue}. Введи его ниже.
          </p>
          <input
            className={inputClass}
            inputMode="numeric"
            placeholder="Код из SMS"
            value={codeValue}
            onChange={(event) => setCodeValue(event.target.value)}
          />
          <button
            type="button"
            disabled={sending}
            onClick={() => confirmPhone(asRegister)}
            className="w-full rounded-full bg-brand py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
          >
            {sending ? 'Подтверждаем…' : 'Подтвердить код'}
          </button>
        </>
      ) : (
        <>
          <input
            className={inputClass}
            inputMode="tel"
            placeholder="+7 900 000-00-00"
            value={phoneValue}
            onChange={(event) => setPhoneValue(event.target.value)}
          />
          <button
            type="button"
            disabled={sending}
            onClick={sendCode}
            className="w-full rounded-full bg-brand py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
          >
            {sending ? 'Отправляем…' : 'Получить код'}
          </button>
          <p className="text-center text-[11px] text-muted">
            Придёт SMS с кодом подтверждения.
          </p>
        </>
      )}
    </div>
  )

  const roleSelect = (
    <div className="rounded-xl bg-cream p-3">
      <p className="text-[12px] font-bold text-ink">Кем ты хочешь быть?</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {(
          [
            { value: 'participant', title: 'Участник', desc: 'Ищу команду и принимаю заявки' },
            { value: 'organizer', title: 'Организатор', desc: 'Создаю команды и собираю людей' },
          ] as const
        ).map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setRole(option.value)}
            className={`rounded-xl border px-3 py-2.5 text-left transition ${
              role === option.value
                ? 'border-brand bg-white shadow-sm'
                : 'border-ink/10 bg-white/50 hover:border-brand/40'
            }`}
          >
            <span className="block text-[13px] font-extrabold text-ink">{option.title}</span>
            <span className="mt-0.5 block text-[11px] leading-snug text-muted">{option.desc}</span>
          </button>
        ))}
      </div>
    </div>
  )

  const hobbiesField = (
    <div>
      <div className="flex gap-2">
        <input
          className={inputClass}
          placeholder="Хобби (например: футбол, кино)"
          value={hobby}
          onChange={(event) => setHobby(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              addHobby()
            }
          }}
        />
        <button
          type="button"
          onClick={addHobby}
          className="shrink-0 rounded-xl bg-brand-soft px-3 text-lg font-bold text-brand hover:bg-brand hover:text-white"
          aria-label="Добавить хобби"
        >
          +
        </button>
      </div>
      {hobbies.length > 0 ? (
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
      ) : null}
      <p className="mt-1.5 text-[11px] text-muted">
        Хобби нужны для персональных рекомендаций команд и сфер.
      </p>
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
      className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-[0_24px_60px_rgba(80,40,40,0.25)]"
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
            <p className="mb-4 rounded-xl bg-brand-soft px-4 py-2.5 text-[13px] font-medium text-brand">
              {error}
            </p>
          ) : null}
          {info ? (
            <p className="mb-4 rounded-xl bg-emerald-50 px-4 py-2.5 text-[13px] font-medium text-emerald-700">
              {info}
            </p>
          ) : null}

          {firebaseEnabled ? (
            <div className="mb-4">
              {contactToggle}
              <div id="fb-recaptcha" className="hidden" />
            </div>
          ) : null}

          {mode === 'verify' ? (
            verifyForm
          ) : mode === 'forgot' ? (
            forgotForm
          ) : mode === 'login' ? (
            firebaseEnabled && contact === 'phone' ? (
              phoneForm(false)
            ) : (
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
            )
          ) : firebaseEnabled && contact === 'phone' ? (
            <div className="space-y-3">
              {roleSelect}
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
              {hobbiesField}
              {phoneForm(true)}
            </div>
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
              {roleSelect}
              {hobbiesField}
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