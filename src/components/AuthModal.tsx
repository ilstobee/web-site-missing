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

type Country = {
  flag: string
  code: string
  prefix: string
  label: string
}

const COUNTRIES: Country[] = [
  { flag: '🇷🇺', code: '+7', prefix: '7', label: 'Россия' },
  { flag: '🇰🇿', code: '+7', prefix: '7', label: 'Казахстан' },
  { flag: '🇧🇾', code: '+375', prefix: '375', label: 'Беларусь' },
  { flag: '🇺🇦', code: '+380', prefix: '380', label: 'Украина' },
  { flag: '🇺🇸', code: '+1', prefix: '1', label: 'США' },
  { flag: '🇬🇧', code: '+44', prefix: '44', label: 'Великобритания' },
  { flag: '🇩🇪', code: '+49', prefix: '49', label: 'Германия' },
  { flag: '🇫🇷', code: '+33', prefix: '33', label: 'Франция' },
  { flag: '🇪🇸', code: '+34', prefix: '34', label: 'Испания' },
  { flag: '🇮🇹', code: '+39', prefix: '39', label: 'Италия' },
  { flag: '🇹🇷', code: '+90', prefix: '90', label: 'Турция' },
  { flag: '🇨🇳', code: '+86', prefix: '86', label: 'Китай' },
  { flag: '🇮🇳', code: '+91', prefix: '91', label: 'Индия' },
  { flag: '🇺🇿', code: '+998', prefix: '998', label: 'Узбекистан' },
  { flag: '🇦🇲', code: '+374', prefix: '374', label: 'Армения' },
  { flag: '🇬🇪', code: '+995', prefix: '995', label: 'Грузия' },
  { flag: '🇦🇿', code: '+994', prefix: '994', label: 'Азербайджан' },
  { flag: '🇲🇩', code: '+373', prefix: '373', label: 'Молдова' },
  { flag: '🇱🇹', code: '+370', prefix: '370', label: 'Литва' },
  { flag: '🇱🇻', code: '+371', prefix: '371', label: 'Латвия' },
  { flag: '🇪🇪', code: '+372', prefix: '372', label: 'Эстония' },
  { flag: '🇵🇱', code: '+48', prefix: '48', label: 'Польша' },
  { flag: '🇨🇿', code: '+420', prefix: '420', label: 'Чехия' },
  { flag: '🇫🇮', code: '+358', prefix: '358', label: 'Финляндия' },
  { flag: '🇸🇪', code: '+46', prefix: '46', label: 'Швеция' },
  { flag: '🇳🇴', code: '+47', prefix: '47', label: 'Норвегия' },
  { flag: '🇩🇰', code: '+45', prefix: '45', label: 'Дания' },
  { flag: '🇳🇱', code: '+31', prefix: '31', label: 'Нидерланды' },
  { flag: '🇨🇭', code: '+41', prefix: '41', label: 'Швейцария' },
  { flag: '🇦🇹', code: '+43', prefix: '43', label: 'Австрия' },
  { flag: '🇯🇵', code: '+81', prefix: '81', label: 'Япония' },
  { flag: '🇰🇷', code: '+82', prefix: '82', label: 'Южная Корея' },
  { flag: '🇮🇱', code: '+972', prefix: '972', label: 'Израиль' },
  { flag: '🇦🇪', code: '+971', prefix: '971', label: 'ОАЭ' },
  { flag: '🇧🇷', code: '+55', prefix: '55', label: 'Бразилия' },
  { flag: '🇲🇽', code: '+52', prefix: '52', label: 'Мексика' },
  { flag: '🇦🇺', code: '+61', prefix: '61', label: 'Австралия' },
]

function detectCountry(digits: string): { country: Country; national: string } {
  let best: Country | null = null
  for (const country of COUNTRIES) {
    if (digits.startsWith(country.prefix) && (!best || country.prefix.length > best.prefix.length)) {
      best = country
    }
  }
  if (best) return { country: best, national: digits.slice(best.prefix.length) }
  return { country: COUNTRIES[0], national: digits }
}

function formatNational(digits: string): string {
  if (!digits) return ''
  if (digits.length === 10) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8)}`
  }
  return digits.replace(/(\d{3})(?=\d)/g, '$1 ').trim()
}

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
  const [phoneDigits, setPhoneDigits] = useState('')
  const [phoneCountry, setPhoneCountry] = useState<Country>(COUNTRIES[0])
  const [countryOpen, setCountryOpen] = useState(false)
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

  const e164Phone = `${phoneCountry.prefix}${phoneDigits}`

  const handlePhoneChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '')
    const { country, national } = detectCountry(digits)
    setPhoneCountry(country)
    setPhoneDigits(national)
    setCountryOpen(false)
  }

  const pickCountry = (country: Country) => {
    setPhoneCountry(country)
    setCountryOpen(false)
  }

  const sendCode = async () => {
    if (!isValidPhone(e164Phone)) {
      setError('Введи корректный номер телефона (например: +7 900 000-00-00)')
      return
    }
    setError(null)
    setSending(true)
    try {
      const container = document.getElementById('fb-recaptcha')
      if (container) container.innerHTML = ''
      const confirmation = await sendPhoneCode(`+${e164Phone}`, 'fb-recaptcha')
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
    setPhoneDigits('')
    setPhoneCountry(COUNTRIES[0])
    setCountryOpen(false)
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
            Код отправлен на {phoneCountry.code} {formatNational(phoneDigits)}. Введи его ниже.
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
          <div className="relative">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCountryOpen((value) => !value)}
                className="shrink-0 rounded-xl border border-ink/10 bg-cream px-3 py-2.5 text-sm font-semibold text-ink transition hover:border-brand"
              >
                <span className="mr-1.5">{phoneCountry.flag}</span>
                {phoneCountry.code} ▾
              </button>
              <input
                className={inputClass}
                inputMode="tel"
                placeholder="900 000-00-00"
                value={formatNational(phoneDigits)}
                onChange={(event) => handlePhoneChange(event.target.value)}
              />
            </div>
            {countryOpen ? (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setCountryOpen(false)}
                />
                <div className="absolute left-0 top-full z-50 mt-2 max-h-56 w-64 overflow-y-auto rounded-2xl border border-ink/10 bg-white p-1 shadow-lg">
                  {COUNTRIES.map((country) => (
                    <button
                      key={`${country.code}-${country.label}`}
                      type="button"
                      onClick={() => pickCountry(country)}
                      className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[13px] transition hover:bg-cream ${
                        country.code === phoneCountry.code && country.label === phoneCountry.label
                          ? 'bg-brand-soft font-semibold text-brand'
                          : 'text-ink'
                      }`}
                    >
                      <span>{country.flag}</span>
                      <span className="font-semibold">{country.code}</span>
                      <span className="truncate text-muted">{country.label}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : null}
          </div>
          <button
            type="button"
            disabled={sending}
            onClick={sendCode}
            className="w-full rounded-full bg-brand py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
          >
            {sending ? 'Отправляем…' : 'Получить код'}
          </button>
          <p className="text-center text-[11px] text-muted">
            Страна определяется автоматически по коду номера.
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