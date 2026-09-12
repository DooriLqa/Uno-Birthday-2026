import { useState, type FormEvent, type ReactNode } from 'react'
import './ProductionAccessGate.css'

const ACCESS_KEY = 'uno-birthday:production-access'
const PASSWORD_HASH = import.meta.env.VITE_SITE_PASSWORD_SHA256

type Props = {
  children: ReactNode
}

function hasAccess() {
  if (!import.meta.env.PROD) return true

  try {
    return sessionStorage.getItem(ACCESS_KEY) === 'granted'
  } catch {
    return false
  }
}

async function hashPassword(password: string) {
  const bytes = new TextEncoder().encode(password)
  const digest = await crypto.subtle.digest('SHA-256', bytes)

  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function ProductionAccessGate({ children }: Props) {
  const [authorized, setAuthorized] = useState(hasAccess)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (authorized) return children

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const submittedHash = await hashPassword(password)

      if (submittedHash !== PASSWORD_HASH) {
        setError('Неверный пароль')
        setPassword('')
        return
      }

      try {
        sessionStorage.setItem(ACCESS_KEY, 'granted')
      } catch {
        // Access still works until this tab is refreshed.
      }
      setAuthorized(true)
    } catch {
      setError('Не удалось проверить пароль. Обновите страницу и попробуйте ещё раз.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="production-access">
      <form className="production-access__card" onSubmit={handleSubmit}>
        <div className="production-access__lock" aria-hidden="true">
          🔐
        </div>
        <p className="production-access__eyebrow">Закрытый остров</p>
        <h1 className="production-access__title">Нужен пароль</h1>
        <p className="production-access__description">
          Введите секретный ключ, чтобы перейти к игре.
        </p>
        <label className="production-access__label" htmlFor="site-password">
          Пароль
        </label>
        <input
          className="production-access__input"
          id="site-password"
          name="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          autoFocus
          required
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'site-password-error' : undefined}
        />
        <div className="production-access__feedback" aria-live="polite">
          {error && <span id="site-password-error">{error}</span>}
        </div>
        <button className="production-access__submit" type="submit" disabled={submitting}>
          {submitting ? 'Проверяем…' : 'Войти'}
        </button>
      </form>
    </main>
  )
}
