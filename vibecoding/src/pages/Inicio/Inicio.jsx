import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import './Inicio.css'

const INVENTORY_KEY = 'vera-skincare-inventory'
const SALES_KEY = 'vera-skincare-sales'

const fallbackProducts = [
  { id: 1, sku: 'VER-LIM-001', name: 'Limpiador Facial Suave', brand: 'CeraVe', category: 'Limpieza', stock: 18, minStock: 6, price: 12.5 },
  { id: 2, sku: 'VER-SER-002', name: 'Sérum Vitamina C 10%', brand: 'La Roche-Posay', category: 'Sérums', stock: 5, minStock: 6, price: 29.9 },
  { id: 3, sku: 'VER-HID-003', name: 'Ácido Hialurónico 2%', brand: 'The Ordinary', category: 'Sérums', stock: 13, minStock: 5, price: 11.75 },
  { id: 4, sku: 'VER-SPF-004', name: 'Protector Solar SPF 50+', brand: 'ISDIN', category: 'Protección solar', stock: 9, minStock: 5, price: 24.5 },
  { id: 5, sku: 'VER-CRE-005', name: 'Crema Hidratante Reparadora', brand: 'Avène', category: 'Hidratación', stock: 3, minStock: 5, price: 21 },
  { id: 6, sku: 'VER-TON-006', name: 'Tónico Calmante', brand: 'COSRX', category: 'Tónicos', stock: 11, minStock: 4, price: 18.25 },
]

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function money(value) {
  return new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value)
}

function Inicio() {
  const products = readStorage(INVENTORY_KEY, fallbackProducts)
  const sales = readStorage(SALES_KEY, [])
  const today = new Date().toLocaleDateString('es-CR')

  const dashboard = useMemo(() => {
    const todaySales = sales.filter((sale) => sale.date === today)
    const todayRevenue = todaySales.reduce((sum, sale) => sum + Number(sale.total || 0), 0)
    const units = products.reduce((sum, product) => sum + Number(product.stock || 0), 0)
    const inventoryValue = products.reduce(
      (sum, product) => sum + Number(product.stock || 0) * Number(product.price || 0),
      0,
    )
    const lowStock = products
      .filter((product) => Number(product.stock) <= Number(product.minStock))
      .sort((a, b) => Number(a.stock) - Number(b.stock))

    const soldByProduct = sales.reduce((acc, sale) => {
      sale.items?.forEach((item) => {
        acc[item.name] = (acc[item.name] || 0) + Number(item.quantity || 0)
      })
      return acc
    }, {})

    const topProducts = Object.entries(soldByProduct)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)

    return {
      todaySales,
      todayRevenue,
      units,
      inventoryValue,
      lowStock,
      topProducts,
    }
  }, [products, sales, today])

  return (
    <section className="home-page">
      <div className="home-container">
        <header className="home-hero">
          <div>
            <span className="home-eyebrow">Vera · Skincare</span>
            <h1>Panel de inicio</h1>
            <p>Una vista rápida del inventario, las ventas y las alertas más importantes de tu negocio.</p>
          </div>
          <div className="hero-actions">
            <Link className="home-button home-button-primary" to="/ventas">＋ Nueva venta</Link>
            <Link className="home-button home-button-secondary" to="/almacen">Ver almacén</Link>
          </div>
        </header>

        <section className="home-metrics" aria-label="Resumen general">
          <article className="home-metric-card">
            <span className="home-metric-icon">$</span>
            <div><span>Ingresos de hoy</span><strong>{money(dashboard.todayRevenue)}</strong></div>
          </article>
          <article className="home-metric-card">
            <span className="home-metric-icon">V</span>
            <div><span>Ventas de hoy</span><strong>{dashboard.todaySales.length}</strong></div>
          </article>
          <article className="home-metric-card">
            <span className="home-metric-icon">U</span>
            <div><span>Unidades en stock</span><strong>{dashboard.units}</strong></div>
          </article>
          <article className={`home-metric-card ${dashboard.lowStock.length ? 'home-metric-warning' : ''}`}>
            <span className="home-metric-icon">!</span>
            <div><span>Stock bajo</span><strong>{dashboard.lowStock.length}</strong></div>
          </article>
        </section>

        <div className="home-grid">
          <section className="home-panel home-stock-panel">
            <div className="home-section-heading">
              <div><span className="home-section-label">Inventario</span><h2>Productos que requieren atención</h2></div>
              <Link to="/almacen">Administrar →</Link>
            </div>

            {dashboard.lowStock.length ? (
              <div className="low-stock-list">
                {dashboard.lowStock.slice(0, 5).map((product) => (
                  <article className="low-stock-item" key={product.id}>
                    <div className="stock-product-copy">
                      <span className="stock-category">{product.category}</span>
                      <strong>{product.name}</strong>
                      <small>{product.brand} · {product.sku}</small>
                    </div>
                    <div className="stock-level">
                      <strong>{product.stock}</strong>
                      <span>mín. {product.minStock}</span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="home-empty-state"><strong>Inventario saludable</strong><span>No hay productos por debajo del stock mínimo.</span></div>
            )}
          </section>

          <section className="home-panel home-summary-panel">
            <div className="home-section-heading">
              <div><span className="home-section-label">Resumen</span><h2>Estado de Vera</h2></div>
            </div>
            <div className="business-summary">
              <div><span>Productos registrados</span><strong>{products.length}</strong></div>
              <div><span>Valor del inventario</span><strong>{money(dashboard.inventoryValue)}</strong></div>
              <div><span>Ventas acumuladas</span><strong>{sales.length}</strong></div>
              <div><span>Unidades vendidas hoy</span><strong>{dashboard.todaySales.reduce((sum, sale) => sum + Number(sale.units || 0), 0)}</strong></div>
            </div>
          </section>
        </div>

        <div className="home-grid home-grid-bottom">
          <section className="home-panel">
            <div className="home-section-heading">
              <div><span className="home-section-label">Actividad</span><h2>Ventas recientes</h2></div>
              <Link to="/ventas">Ver ventas →</Link>
            </div>

            {!sales.length ? (
              <div className="home-empty-state"><strong>Aún no hay ventas</strong><span>Las transacciones aparecerán aquí cuando registres la primera.</span></div>
            ) : (
              <div className="recent-sales">
                {sales.slice(0, 5).map((sale) => (
                  <article className="recent-sale-item" key={sale.id}>
                    <div className="sale-customer-avatar">{(sale.customer || 'C').charAt(0).toUpperCase()}</div>
                    <div className="recent-sale-copy">
                      <strong>{sale.customer || 'Cliente general'}</strong>
                      <span>{sale.units} {sale.units === 1 ? 'unidad' : 'unidades'} · {sale.date} {sale.time ? `· ${sale.time}` : ''}</span>
                    </div>
                    <strong className="recent-sale-total">{money(sale.total)}</strong>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="home-panel">
            <div className="home-section-heading">
              <div><span className="home-section-label">Preferencias</span><h2>Más vendidos</h2></div>
            </div>

            {dashboard.topProducts.length ? (
              <div className="top-products">
                {dashboard.topProducts.map(([name, quantity], index) => (
                  <article key={name}>
                    <span className="top-position">{String(index + 1).padStart(2, '0')}</span>
                    <div><strong>{name}</strong><span>{quantity} {quantity === 1 ? 'unidad vendida' : 'unidades vendidas'}</span></div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="home-empty-state"><strong>Sin datos todavía</strong><span>Este ranking se actualizará automáticamente con tus ventas.</span></div>
            )}
          </section>
        </div>
      </div>
    </section>
  )
}

export default Inicio
