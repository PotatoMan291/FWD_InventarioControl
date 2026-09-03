import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { getCurrentUser, login } from '../../services/authService'
import './Login.css'

function Login({ onLogin }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ username: '', password: '', remember: false })
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  if (getCurrentUser()) {
    return <Navigate to="/" replace />
  }

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (error) setError('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!form.username.trim() || !form.password) {
      setError('Completa el usuario y la contraseña para continuar.')
      return
    }

    setLoading(true)
    const result = login(form.username, form.password, form.remember)

    if (!result.ok) {
      setError(result.message)
      setLoading(false)
      return
    }

    onLogin(result.user)
    const destination = location.state?.from?.pathname || '/'
    navigate(destination, { replace: true })
  }

  return (
    <div className="login-page">
      <section className="login-brand-panel" aria-label="Presentación de Vera">
        <div className="login-brand-content">
          <div className="login-logo" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z" />
              <path d="m4.4 7.3 7.6 4.3 7.6-4.3M12 11.6V21" />
            </svg>
          </div>
          <p className="login-eyebrow">Control de inventario</p>
          <h1>Vera</h1>
          <p className="login-brand-description">
            Administra productos de skincare, existencias y ventas desde un solo lugar.
          </p>

          <div className="login-feature-list">
            <div><span>✓</span> Control de stock en tiempo real</div>
            <div><span>✓</span> Registro de ventas y movimientos</div>
            <div><span>✓</span> Resumen general del negocio</div>
          </div>
        </div>
      </section>

      <section className="login-form-panel">
        <div className="login-card">
          <div className="login-card-heading">
            <span className="login-mobile-logo">Vera</span>
            <p className="login-kicker">Acceso administrativo</p>
            <h2>Bienvenido de nuevo</h2>
            <p>Ingresa tus credenciales para acceder al sistema.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <label className="login-field">
              <span>Usuario</span>
              <div className="login-input-wrap">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
                </svg>
                <input
                  name="username"
                  type="text"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Ingresa tu usuario"
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </label>

            <label className="login-field">
              <span>Contraseña</span>
              <div className="login-input-wrap">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="4" y="10" width="16" height="11" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Ingresa tu contraseña"
                  autoComplete="current-password"
                />
                <button
                  className="password-toggle"
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? 'Ocultar' : 'Ver'}
                </button>
              </div>
            </label>

            <label className="remember-option">
              <input
                name="remember"
                type="checkbox"
                checked={form.remember}
                onChange={handleChange}
              />
              <span>Recordar mi sesión</span>
            </label>

            {error && (
              <div className="login-error" role="alert">
                <span aria-hidden="true">!</span>
                {error}
              </div>
            )}

            <button className="login-submit" type="submit" disabled={loading}>
              {loading ? 'Ingresando…' : 'Iniciar sesión'}
              {!loading && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <div className="demo-credentials">
            <strong>Credenciales de demostración</strong>
            <span>Usuario: <code>admin</code></span>
            <span>Contraseña: <code>vera123</code></span>
          </div>

          <p className="login-security-note">
            Acceso exclusivo para la administración de Vera.
          </p>
        </div>
      </section>
    </div>
  )
}

export default Login
