import { NavLink } from 'react-router-dom'
import './Footer.css'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-brand">
          <div className="footer-logo" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z" />
              <path d="m4.4 7.3 7.6 4.3 7.6-4.3M12 11.6V21" />
            </svg>
          </div>

          <div>
            <strong>Vera</strong>
            <span>Control de Inventario</span>
          </div>
        </div>

        <div className="footer-links">
          <h3>Accesos rápidos</h3>

          <NavLink to="/">Inicio</NavLink>
          <NavLink to="/almacen">Almacén</NavLink>
          <NavLink to="/ventas">Ventas</NavLink>
        </div>

        <div className="footer-info">
          <h3>Sistema</h3>
          <p>Control de inventario</p>
          <p>Gestión de productos y ventas</p>
          <span className="footer-status">
            <span className="footer-status-dot" />
            Sistema activo
          </span>
        </div>

      </div>

      <div className="footer-bottom">
        <p>© {currentYear} Vera · Control de Inventario</p>
        <p>Gestión simple, organizada y eficiente.</p>
      </div>
    </footer>
  )
}

export default Footer

