import { useState } from 'react'
import { useApp } from '../store'

type Props = {
  open: boolean
  onClose(): void
  onSuccess(): void
}

type Mode = 'login' | 'register'

export function AuthModal({ open, onClose, onSuccess }: Props) {
  const { login, register } = useApp()
  const [mode, setMode] = useState<Mode>('login')

  const [loginValue, setLoginValue] = useState('')
  const [password, setPassword] = useState('')

  const [name, setName] = useState('')
  const [surname, setSurname] = useState('')
  const [city, setCity] = useState('')
  const [telegram, setTelegram] = useState('')
  const [hobby, setHobby] = useState('')
  const [hobbies, setHobbies] = useState<string[]>([])

  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const addHobby = () => {
    const trimmed = hobby.trim()
    if (trimmed && !hobbies.includes(trimmed)) setHobbies([...hobbies, trimmed])
    setHobby('')
  }

  const handleLogin = () => {
    const err = login(loginValue, password)
    if (err) {
      setError(err)
      return
    }
    setError(null)
    reset()
    onClose()
  }

  const handleRegister = () => {
    const err = register({ name, surname, login: loginValue, password, telegram, city, hobbies })
    if (err) {
      setError(err)
      return
    }
    setError(null)
    reset()
    onClose()
    onSuccess()
  }

  const reset = () => {
    setLoginValue('')
    setPassword('')
    setName('')
    setSurname('')
    setCity('')
    setTelegram('')
    setHobby('')
    setHobbies([])
    setError(null)
  }

  const inputClass =
    'w-full rounded-xl border border-ink/10 bg-cream px-4 py-2.5 text-sm text-ink outline-none transition focus:border-brand focus:bg-white'

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
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-full bg-cream p-1">
            {(['login', 'register'] as Mode[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setMode(item)
                  setError(null)
                }}
                className={`rounded-full py-2 text-sm font-semibold transition ${
                  mode === item ? 'bg-white text-brand shadow-sm' : 'text-muted hover:text-ink'
                }`}
              >
                {item === 'login' ? 'Вход' : 'Регистрация'}
              </button>
            ))}
          </div>

          {error ? (
            <p className="mb-4 rounded-xl bg-brand-soft px-4 py-2.5 text-[13px] font-medium text-brand">
              {error}
            </p>
          ) : null}

          {mode === 'login' ? (
            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault()
                handleLogin()
              }}
            >
              <input
                className={inputClass}
                placeholder="Логин"
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
                handleRegister()
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
                placeholder="Логин"
                value={loginValue}
                onChange={(event) => setLoginValue(event.target.value)}
              />
              <input
                className={inputClass}
                type="password"
                placeholder="Пароль (минимум 4 символа)"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
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
              <button
                type="submit"
                className="w-full rounded-full bg-brand py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
              >
                Создать аккаунт
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}