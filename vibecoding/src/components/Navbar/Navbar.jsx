import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import './navbar.css'

const links = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/almacen', label: 'Almacén' },
  { to: '/ventas', label: 'Ventas' },
]

function Navbar({ user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    onLogout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="navbar-shell">
      <nav className="navbar" aria-label="Navegación principal">
        <NavLink className="navbar-brand" to="/" aria-label="Vera - Inicio">
          <span className="brand-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z" />
              <path d="m4.4 7.3 7.6 4.3 7.6-4.3M12 11.6V21" />
            </svg>
          </span>
          <span className="brand-copy">
            <strong>Vera</strong>
            <small>Control de Inventario</small>
          </span>
        </NavLink>

        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
          aria-controls="main-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <div id="main-menu" className={`navbar-menu ${menuOpen ? 'is-open' : ''}`}>
          <div className="navbar-links">
            {links.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                {label}
              </NavLink>
            ))}
          </div>

          <div className="navbar-account">
            <div className="admin-chip" title="Sesión actual">
              <span className="admin-avatar">A</span>
              <span className="admin-copy">
                <strong>{user?.name || 'Administrador'}</strong>
                <small>Admin</small>
              </span>
            </div>
            <button className="logout-button" type="button" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
