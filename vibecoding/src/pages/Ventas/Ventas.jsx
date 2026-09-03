import { useMemo, useState } from 'react'
import './Ventas.css'

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
  return new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'USD' }).format(value)
}

function Ventas() {
  const [products, setProducts] = useState(() => readStorage(INVENTORY_KEY, fallbackProducts))
  const [sales, setSales] = useState(() => readStorage(SALES_KEY, []))
  const [cart, setCart] = useState([])
  const [search, setSearch] = useState('')
  const [customer, setCustomer] = useState('')
  const [message, setMessage] = useState('')

  const saveInventory = (next) => {
    setProducts(next)
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(next))
  }

  const saveSales = (next) => {
    setSales(next)
    localStorage.setItem(SALES_KEY, JSON.stringify(next))
  }

  const notify = (text) => {
    setMessage(text)
    window.setTimeout(() => setMessage(''), 2600)
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter((p) => p.stock > 0 && (!q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)))
  }, [products, search])

  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart])
  const units = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart])
  const today = new Date().toLocaleDateString('es-CR')
  const todaySales = sales.filter((sale) => sale.date === today)
  const todayTotal = todaySales.reduce((sum, sale) => sum + sale.total, 0)

  const addToCart = (product) => {
    const current = cart.find((item) => item.id === product.id)
    if (current && current.quantity >= product.stock) return notify('No hay más unidades disponibles de este producto.')
    setCart(current
      ? cart.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...cart, { ...product, quantity: 1 }])
  }

  const changeQty = (id, amount) => {
    const product = products.find((item) => item.id === id)
    setCart((current) => current
      .map((item) => item.id === id ? { ...item, quantity: Math.max(0, Math.min(product.stock, item.quantity + amount)) } : item)
      .filter((item) => item.quantity > 0))
  }

  const finishSale = () => {
    if (!cart.length) return notify('Agrega al menos un producto antes de registrar la venta.')

    const nextInventory = products.map((product) => {
      const sold = cart.find((item) => item.id === product.id)
      return sold ? { ...product, stock: product.stock - sold.quantity } : product
    })

    const sale = {
      id: Date.now(),
      date: today,
      time: new Date().toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' }),
      customer: customer.trim() || 'Cliente general',
      items: cart.map(({ id, name, quantity, price }) => ({ id, name, quantity, price })),
      units,
      total,
    }

    saveInventory(nextInventory)
    saveSales([sale, ...sales])
    setCart([])
    setCustomer('')
    notify('Venta registrada y existencias actualizadas.')
  }

  return (
    <section className="sales-page">
      <div className="sales-container">
        <header className="sales-heading">
          <div><span className="sales-eyebrow">Vera · Skincare</span><h1>Ventas</h1><p>Registra ventas y descuenta automáticamente los productos del almacén.</p></div>
        </header>

        {message && <div className="sales-alert" role="status">{message}</div>}

        <div className="sales-metrics">
          <article><span>Ventas de hoy</span><strong>{todaySales.length}</strong></article>
          <article><span>Ingresos de hoy</span><strong>{money(todayTotal)}</strong></article>
          <article><span>Unidades vendidas</span><strong>{todaySales.reduce((s, v) => s + v.units, 0)}</strong></article>
        </div>

        <div className="sales-workspace">
          <div className="product-picker">
            <div className="section-title"><div><h2>Productos</h2><p>Selecciona los productos que desea llevar el cliente.</p></div></div>
            <input className="sales-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por producto, marca o SKU..." />
            <div className="sales-products">
              {filtered.map((product) => (
                <article className="sale-product-card" key={product.id}>
                  <div><span className="product-category">{product.category}</span><h3>{product.name}</h3><p>{product.brand} · {product.sku}</p></div>
                  <div className="product-sale-info"><span>{product.stock} disponibles</span><strong>{money(product.price)}</strong><button type="button" onClick={() => addToCart(product)}>＋ Agregar</button></div>
                </article>
              ))}
              {!filtered.length && <p className="empty-sales">No hay productos disponibles con esa búsqueda.</p>}
            </div>
          </div>

          <aside className="sale-ticket">
            <div className="ticket-heading"><div><span>Nueva venta</span><h2>Detalle</h2></div><span className="cart-count">{units}</span></div>
            <label className="customer-field">Cliente (opcional)<input value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Nombre del cliente" /></label>
            <div className="cart-items">
              {!cart.length && <div className="empty-cart"><strong>Venta vacía</strong><span>Agrega productos desde el catálogo.</span></div>}
              {cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <div><strong>{item.name}</strong><span>{money(item.price)} c/u</span></div>
                  <div className="quantity-control"><button onClick={() => changeQty(item.id, -1)}>−</button><span>{item.quantity}</span><button onClick={() => changeQty(item.id, 1)}>＋</button></div>
                  <strong>{money(item.price * item.quantity)}</strong>
                </div>
              ))}
            </div>
            <div className="ticket-total"><span>Total</span><strong>{money(total)}</strong></div>
            <button className="finish-sale" type="button" onClick={finishSale}>Registrar venta</button>
          </aside>
        </div>

        <section className="sales-history">
          <div className="section-title"><div><h2>Historial de ventas</h2><p>Últimas transacciones registradas en Vera.</p></div></div>
          {!sales.length ? <p className="empty-sales">Todavía no hay ventas registradas.</p> : (
            <div className="history-table-wrap"><table><thead><tr><th>Fecha</th><th>Cliente</th><th>Productos</th><th>Unidades</th><th>Total</th></tr></thead><tbody>
              {sales.slice(0, 8).map((sale) => <tr key={sale.id}><td>{sale.date}<small>{sale.time}</small></td><td>{sale.customer}</td><td>{sale.items.map((i) => i.name).join(', ')}</td><td>{sale.units}</td><td><strong>{money(sale.total)}</strong></td></tr>)}
            </tbody></table></div>
          )}
        </section>
      </div>
    </section>
  )
}

export default Ventas
