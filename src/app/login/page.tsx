'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Tab = 'login' | 'register'
type LoginMethod = 'phone' | 'email'

function formatPhoneDisplay(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.length <= 2) return digits
  if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`
  if (digits.length <= 7) return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`
}

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('login')
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('phone')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const telegramRef = useRef<HTMLDivElement>(null)

  const handleTelegramAuth = useCallback(async (data: Record<string, unknown>) => {
    setLoading(true)
    setError('')
    try {
      const result = await signIn('telegram', {
        telegramData: JSON.stringify(data),
        redirect: false,
      })
      if (result?.error) {
        setError('Ошибка входа через Telegram')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      setError('Произошла ошибка. Попробуйте снова.')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    const botUsername = process.env.NEXT_PUBLIC_BOT_USERNAME
    if (!botUsername || !telegramRef.current) return
    // Expose callback globally for Telegram widget
    ;(window as any).onTelegramAuth = handleTelegramAuth

    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.async = true
    script.setAttribute('data-telegram-login', botUsername)
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-onauth', 'onTelegramAuth(user)')
    script.setAttribute('data-request-access', 'write')
    script.setAttribute('data-radius', '12')

    telegramRef.current.innerHTML = ''
    telegramRef.current.appendChild(script)

    return () => { delete (window as any).onTelegramAuth }
  }, [handleTelegramAuth])

  const loginValue = loginMethod === 'phone' ? `+998${phone.replace(/\D/g, '')}` : email

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 9)
    setPhone(formatPhoneDisplay(raw))
  }

  const isFormValid = () => {
    if (loginMethod === 'phone') {
      const digits = phone.replace(/\D/g, '')
      if (digits.length !== 9) return false
    } else {
      if (!email.includes('@')) return false
    }
    if (!password || password.length < 6) return false
    if (tab === 'register' && !name.trim()) return false
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        login: loginValue,
        password,
        name: tab === 'register' ? name : undefined,
        action: tab,
        redirect: false,
      })

      if (result?.error) {
        if (result.error.includes('уже зарегистрирован') || result.error === 'User already exists') {
          setError(loginMethod === 'phone'
            ? 'Этот номер уже зарегистрирован'
            : 'Этот email уже зарегистрирован')
        } else if (result.error === 'CredentialsSignin') {
          setError('Неверный логин или пароль')
        } else {
          setError(result.error)
        }
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      setError('Произошла ошибка. Попробуйте снова.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo / Back link */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            На главную
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Jovob
          </h1>
          <p className="text-slate-500 mt-1">
            AI-конструктор ботов для бизнеса
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            {(['login', 'register'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError('') }}
                className={`flex-1 py-3.5 text-sm font-medium transition-colors relative ${
                  tab === t ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {t === 'login' ? 'Вход' : 'Регистрация'}
                {tab === t && (
                  <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {tab === 'register' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Имя
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ваше имя"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                />
              </div>
            )}

            {/* Login method toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  {loginMethod === 'phone' ? 'Телефон' : 'Email'}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod(loginMethod === 'phone' ? 'email' : 'phone')
                    setError('')
                  }}
                  className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
                >
                  {loginMethod === 'phone' ? 'Войти по email' : 'Войти по телефону'}
                </button>
              </div>

              {loginMethod === 'phone' ? (
                <div className="flex">
                  <span className="inline-flex items-center px-3 py-2.5 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-sm text-slate-500 font-medium">
                    +998
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="90 123 45 67"
                    required
                    className="w-full px-4 py-2.5 rounded-r-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                  />
                </div>
              ) : (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={tab === 'register' ? 'Минимум 6 символов' : 'Ваш пароль'}
                required
                minLength={6}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !isFormValid()}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium text-sm hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-200 focus:ring-offset-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {tab === 'login' ? 'Входим...' : 'Создаём аккаунт...'}
                </span>
              ) : tab === 'login' ? 'Войти' : 'Создать аккаунт'}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-slate-400">или</span>
              </div>
            </div>

            {/* Telegram Login Widget */}
            <div ref={telegramRef} className="flex justify-center" />
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Продолжая, вы соглашаетесь с условиями использования
        </p>
      </div>
    </div>
  )
}
