import { useMemo, useState } from 'react'
import './Almacen.css'

const STORAGE_KEY = 'vera-skincare-inventory'

const initialProducts = [
  {
    id: 1,
    sku: 'VER-LIM-001',
    name: 'Limpiador Facial Suave',
    brand: 'CeraVe',
    category: 'Limpieza',
    stock: 18,
    minStock: 6,
    price: 12.5,
  },
  {
    id: 2,
    sku: 'VER-SER-002',
    name: 'Sérum Vitamina C 10%',
    brand: 'La Roche-Posay',
    category: 'Sérums',
    stock: 5,
    minStock: 6,
    price: 29.9,
  },
  {
    id: 3,
    sku: 'VER-HID-003',
    name: 'Ácido Hialurónico 2%',
    brand: 'The Ordinary',
    category: 'Sérums',
    stock: 13,
    minStock: 5,
    price: 11.75,
  },
  {
    id: 4,
    sku: 'VER-SPF-004',
    name: 'Protector Solar SPF 50+',
    brand: 'ISDIN',
    category: 'Protección solar',
    stock: 9,
    minStock: 5,
    price: 24.5,
  },
  {
    id: 5,
    sku: 'VER-CRE-005',
    name: 'Crema Hidratante Reparadora',
    brand: 'Avène',
    category: 'Hidratación',
    stock: 3,
    minStock: 5,
    price: 21.0,
  },
  {
    id: 6,
    sku: 'VER-TON-006',
    name: 'Tónico Calmante',
    brand: 'COSRX',
    category: 'Tónicos',
    stock: 11,
    minStock: 4,
    price: 18.25,
  },
]

const categories = [
  'Limpieza',
  'Sérums',
  'Hidratación',
  'Tónicos',
  'Protección solar',
  'Mascarillas',
  'Contorno de ojos',
  'Otros',
]

const emptyProduct = {
  name: '',
  brand: '',
  category: 'Limpieza',
  stock: '',
  minStock: '',
  price: '',
}

function getStoredProducts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : initialProducts
  } catch {
    return initialProducts
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value)
}

function Almacen() {
  const [products, setProducts] = useState(getStoredProducts)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todas')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyProduct)
  const [movement, setMovement] = useState(null)
  const [movementQty, setMovementQty] = useState(1)
  const [message, setMessage] = useState('')

  const saveProducts = (nextProducts) => {
    setProducts(nextProducts)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProducts))
  }

  const metrics = useMemo(() => {
    const units = products.reduce((sum, product) => sum + product.stock, 0)
    const lowStock = products.filter((product) => product.stock <= product.minStock).length
    const value = products.reduce((sum, product) => sum + product.stock * product.price, 0)

    return {
      products: products.length,
      units,
      lowStock,
      value,
    }
  }, [products])

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()

    return products.filter((product) => {
      const matchesCategory = category === 'Todas' || product.category === category
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query)

      return matchesCategory && matchesSearch
    })
  }, [products, search, category])

  const showFeedback = (text) => {
    setMessage(text)
    window.setTimeout(() => setMessage(''), 2600)
  }

  const handleFormChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const addProduct = (event) => {
    event.preventDefault()

    const stock = Number(form.stock)
    const minStock = Number(form.minStock)
    const price = Number(form.price)

    if (!form.name.trim() || !form.brand.trim() || stock < 0 || minStock < 0 || price <= 0) {
      showFeedback('Revisa los datos del producto antes de guardarlo.')
      return
    }

    const nextId = products.length ? Math.max(...products.map((product) => product.id)) + 1 : 1
    const nextProduct = {
      id: nextId,
      sku: `VER-${form.category.slice(0, 3).toUpperCase()}-${String(nextId).padStart(3, '0')}`,
      name: form.name.trim(),
      brand: form.brand.trim(),
      category: form.category,
      stock,
      minStock,
      price,
    }

    saveProducts([nextProduct, ...products])
    setForm(emptyProduct)
    setShowForm(false)
    showFeedback('Producto agregado al inventario.')
  }

  const openMovement = (product, type) => {
    setMovement({ product, type })
    setMovementQty(1)
  }

  const applyMovement = (event) => {
    event.preventDefault()
    const quantity = Number(movementQty)

    if (!movement || quantity <= 0 || !Number.isInteger(quantity)) {
      showFeedback('Ingresa una cantidad válida.')
      return
    }

    if (movement.type === 'salida' && quantity > movement.product.stock) {
      showFeedback('La salida no puede ser mayor que el stock disponible.')
      return
    }

    const nextProducts = products.map((product) => {
      if (product.id !== movement.product.id) return product

      return {
        ...product,
        stock: movement.type === 'entrada' ? product.stock + quantity : product.stock - quantity,
      }
    })

    saveProducts(nextProducts)
    showFeedback(
      `${movement.type === 'entrada' ? 'Entrada' : 'Salida'} registrada: ${quantity} unidad${quantity === 1 ? '' : 'es'}.`,
    )
    setMovement(null)
  }

  const deleteProduct = (product) => {
    const confirmed = window.confirm(`¿Eliminar “${product.name}” del inventario?`)
    if (!confirmed) return

    saveProducts(products.filter((item) => item.id !== product.id))
    showFeedback('Producto eliminado del inventario.')
  }

  return (
    <section className="warehouse-page">
      <div className="warehouse-container">
        <div className="warehouse-heading">
          <div>
            <span className="eyebrow">Vera · Skincare</span>
            <h1>Almacén</h1>
            <p>Administra productos, existencias y movimientos de tu inventario de cuidado de la piel.</p>
          </div>

          <button className="primary-button" type="button" onClick={() => setShowForm((value) => !value)}>
            <span aria-hidden="true">＋</span>
            {showForm ? 'Cerrar formulario' : 'Nuevo producto'}
          </button>
        </div>

        {message && <div className="warehouse-alert" role="status">{message}</div>}

        <div className="inventory-metrics" aria-label="Resumen del inventario">
          <article className="metric-card">
            <div className="metric-icon" aria-hidden="true">▦</div>
            <div>
              <span>Productos</span>
              <strong>{metrics.products}</strong>
            </div>
          </article>

          <article className="metric-card">
            <div className="metric-icon" aria-hidden="true">◫</div>
            <div>
              <span>Unidades en stock</span>
              <strong>{metrics.units}</strong>
            </div>
          </article>

          <article className={`metric-card ${metrics.lowStock ? 'metric-warning' : ''}`}>
            <div className="metric-icon" aria-hidden="true">!</div>
            <div>
              <span>Stock bajo</span>
              <strong>{metrics.lowStock}</strong>
            </div>
          </article>

          <article className="metric-card">
            <div className="metric-icon" aria-hidden="true">$</div>
            <div>
              <span>Valor estimado</span>
              <strong>{formatCurrency(metrics.value)}</strong>
            </div>
          </article>
        </div>

        {showForm && (
          <form className="product-form" onSubmit={addProduct}>
            <div className="form-title-row">
              <div>
                <span className="eyebrow">Alta de inventario</span>
                <h2>Agregar producto</h2>
              </div>
              <p>Los campos son obligatorios.</p>
            </div>

            <div className="form-grid">
              <label>
                Nombre del producto
                <input name="name" value={form.name} onChange={handleFormChange} placeholder="Ej. Gel limpiador" required />
              </label>

              <label>
                Marca
                <input name="brand" value={form.brand} onChange={handleFormChange} placeholder="Ej. Beauty of Joseon" required />
              </label>

              <label>
                Categoría
                <select name="category" value={form.category} onChange={handleFormChange}>
                  {categories.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>

              <label>
                Stock inicial
                <input name="stock" type="number" min="0" step="1" value={form.stock} onChange={handleFormChange} placeholder="0" required />
              </label>

              <label>
                Stock mínimo
                <input name="minStock" type="number" min="0" step="1" value={form.minStock} onChange={handleFormChange} placeholder="5" required />
              </label>

              <label>
                Precio unitario (USD)
                <input name="price" type="number" min="0.01" step="0.01" value={form.price} onChange={handleFormChange} placeholder="0.00" required />
              </label>
            </div>

            <div className="form-actions">
              <button className="secondary-button" type="button" onClick={() => setShowForm(false)}>Cancelar</button>
              <button className="primary-button" type="submit">Guardar producto</button>
            </div>
          </form>
        )}

        <div className="inventory-panel">
          <div className="inventory-toolbar">
            <div>
              <span className="eyebrow">Existencias</span>
              <h2>Productos de skincare</h2>
            </div>

            <div className="filters">
              <label className="search-field">
                <span className="sr-only">Buscar producto</span>
                <span aria-hidden="true">⌕</span>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar por nombre, marca o SKU"
                />
              </label>

              <label className="category-filter">
                <span className="sr-only">Filtrar por categoría</span>
                <select value={category} onChange={(event) => setCategory(event.target.value)}>
                  <option>Todas</option>
                  {categories.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Estado</th>
                  <th aria-label="Acciones" />
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const lowStock = product.stock <= product.minStock
                  const outOfStock = product.stock === 0

                  return (
                    <tr key={product.id}>
                      <td data-label="Producto">
                        <div className="product-cell">
                          <div className="product-avatar" aria-hidden="true">
                            {product.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong>{product.name}</strong>
                            <span>{product.brand} · {product.sku}</span>
                          </div>
                        </div>
                      </td>
                      <td data-label="Categoría"><span className="category-chip">{product.category}</span></td>
                      <td data-label="Precio">{formatCurrency(product.price)}</td>
                      <td data-label="Stock"><strong className="stock-number">{product.stock}</strong> unid.</td>
                      <td data-label="Estado">
                        <span className={`stock-status ${outOfStock ? 'out' : lowStock ? 'low' : 'ok'}`}>
                          {outOfStock ? 'Agotado' : lowStock ? 'Stock bajo' : 'Disponible'}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <div className="row-actions">
                          <button type="button" className="movement-button entry" onClick={() => openMovement(product, 'entrada')}>+ Entrada</button>
                          <button type="button" className="movement-button exit" onClick={() => openMovement(product, 'salida')} disabled={product.stock === 0}>− Salida</button>
                          <button type="button" className="icon-button" title="Eliminar producto" aria-label={`Eliminar ${product.name}`} onClick={() => deleteProduct(product)}>×</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {filteredProducts.length === 0 && (
              <div className="empty-state">
                <strong>No encontramos productos</strong>
                <p>Prueba con otra búsqueda o agrega un producto nuevo.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {movement && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setMovement(null)}>
          <form className="movement-modal" onSubmit={applyMovement} onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" aria-label="Cerrar" onClick={() => setMovement(null)}>×</button>
            <span className="eyebrow">Movimiento de inventario</span>
            <h2>{movement.type === 'entrada' ? 'Registrar entrada' : 'Registrar salida'}</h2>
            <p>{movement.product.name}</p>

            <div className="movement-current-stock">
              <span>Stock actual</span>
              <strong>{movement.product.stock} unidades</strong>
            </div>

            <label>
              Cantidad
              <input
                type="number"
                min="1"
                step="1"
                max={movement.type === 'salida' ? movement.product.stock : undefined}
                value={movementQty}
                onChange={(event) => setMovementQty(event.target.value)}
                autoFocus
              />
            </label>

            <div className="form-actions">
              <button className="secondary-button" type="button" onClick={() => setMovement(null)}>Cancelar</button>
              <button className="primary-button" type="submit">Confirmar {movement.type}</button>
            </div>
          </form>
        </div>
      )}
    </section>
  )
}

export default Almacen
