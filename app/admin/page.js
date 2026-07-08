'use client';

import { useState, useEffect, useContext } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../context/AuthContext';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

const STATUS_OPTIONS = ['pending', 'paid', 'shipped', 'cancelled'];
const STATUS_LABELS = {
  pending: 'Pendiente',
  paid: 'Pagado',
  shipped: 'Enviado',
  cancelled: 'Cancelado',
};

const EMPTY_PRODUCT = { nombre: '', precio: '', imagen: '', categoria: '', talles: '', stock: '' };

export default function AdminPage() {
  const { user, isLoading } = useContext(AuthContext);
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('orders');

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productError, setProductError] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT);
  const [savingProduct, setSavingProduct] = useState(false);

  const isAdmin = user && ADMIN_EMAIL && user.email === ADMIN_EMAIL;

  useEffect(() => {
    if (isLoading) return;
    if (!isAdmin) {
      router.replace('/');
      return;
    }
    fetchOrders();
    const interval = setInterval(() => fetchOrders(true), 10000);

    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchOrders(true);
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [isLoading, isAdmin, router]);

  useEffect(() => {
    if (tab === 'products' && isAdmin) fetchProducts();
  }, [tab, isAdmin]);

  const fetchOrders = async (silent = false) => {
    if (!silent) setLoadingOrders(true);
    try {
      const res = await fetch('/api/admin/orders', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOrders(data.orders);
      setError('');
    } catch (err) {
      if (!silent) setError(err.message);
    } finally {
      if (!silent) setLoadingOrders(false);
    }
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    setProductError('');
    try {
      const res = await fetch('/api/admin/products', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProducts(data.products || []);
    } catch (err) {
      setProductError(err.message);
    } finally {
      setLoadingProducts(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Error actualizando estado');
      fetchOrders(true);
    } catch (err) {
      fetchOrders(true);
      alert(err.message);
    }
  };

  const deleteOrder = async (orderId) => {
    if (!confirm('¿Eliminar esta orden?')) return;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error eliminando orden');
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (err) {
      alert(err.message);
    }
  };

  const openNewProduct = () => {
    setEditingProduct(null);
    setProductForm(EMPTY_PRODUCT);
    setShowProductModal(true);
  };

  const openEditProduct = (p) => {
    setEditingProduct(p);
    setProductForm({
      nombre: p.nombre || '',
      precio: p.precio || '',
      imagen: p.imagen || '',
      categoria: p.descripcion || '',
      talles: Array.isArray(p.talles) ? p.talles.join(', ') : '',
      stock: p.stock ?? '',
    });
    setShowProductModal(true);
  };

  const deleteProduct = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error eliminando producto');
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.nombre || !productForm.precio) {
      alert('Nombre y precio son obligatorios');
      return;
    }
    setSavingProduct(true);
    try {
      const payload = {
        nombre: productForm.nombre.trim(),
        precio: Number(productForm.precio),
        imagen: productForm.imagen.trim(),
        categoria: productForm.categoria.trim(),
        talles: productForm.talles
          ? productForm.talles.split(',').map(t => t.trim()).filter(Boolean)
          : [],
        stock: Number(productForm.stock) || 0,
      };

      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products';
      const method = editingProduct ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (editingProduct) {
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? data.product : p));
      } else {
        setProducts(prev => [data.product, ...prev]);
      }
      setShowProductModal(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingProduct(false);
    }
  };

  if (isLoading) {
    return <main className="admin-auth-wall"><p>Cargando...</p></main>;
  }

  if (!isAdmin) {
    return <main className="admin-auth-wall"><p>Acceso denegado.</p></main>;
  }

  const totalRevenue = orders
    .filter(o => o.status === 'paid' || o.status === 'shipped')
    .reduce((acc, o) => acc + (o.total || 0), 0);
  const pendingCount = orders.filter(o => o.status === 'pending').length;

  return (
    <main className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">ADMIN PANEL</h1>
        <div className="admin-header-right">
          {tab === 'orders' && (
            <button className="admin-refresh-btn" onClick={() => fetchOrders()} disabled={loadingOrders}>
              {loadingOrders ? 'Actualizando...' : '↻ Actualizar'}
            </button>
          )}
          {tab === 'products' && (
            <button className="admin-refresh-btn" onClick={fetchProducts} disabled={loadingProducts}>
              {loadingProducts ? 'Cargando...' : '↻ Actualizar'}
            </button>
          )}
          <span className="admin-user-badge">{user.email}</span>
        </div>
      </div>

      <div className="admin-stats">
        <div className="admin-stat">
          <span className="admin-stat-value">{orders.length}</span>
          <span className="admin-stat-label">ÓRDENES TOTALES</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-value">{pendingCount}</span>
          <span className="admin-stat-label">PENDIENTES</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-value">${totalRevenue.toLocaleString('es-AR')}</span>
          <span className="admin-stat-label">INGRESOS CONFIRMADOS</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-value">{products.length}</span>
          <span className="admin-stat-label">PRODUCTOS</span>
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab-btn ${tab === 'orders' ? 'active' : ''}`}
          onClick={() => setTab('orders')}
        >
          ÓRDENES
        </button>
        <button
          className={`admin-tab-btn ${tab === 'products' ? 'active' : ''}`}
          onClick={() => setTab('products')}
        >
          PRODUCTOS
        </button>
      </div>

      {tab === 'orders' && (
        <section className="admin-section">
          {loadingOrders && <p className="admin-loading">Cargando órdenes...</p>}
          {error && <p className="admin-error">{error}</p>}
          {!loadingOrders && orders.length === 0 && (
            <p className="admin-empty">No hay órdenes aún.</p>
          )}
          {!loadingOrders && orders.length > 0 && (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>FECHA</th>
                    <th>CLIENTE</th>
                    <th>PRODUCTOS</th>
                    <th>TOTAL</th>
                    <th>ESTADO</th>
                    <th>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td>{new Date(order.created_at).toLocaleDateString('es-AR')}</td>
                      <td>
                        <div className="admin-customer">
                          <span>{order.users?.name || '—'}</span>
                          <span className="admin-customer-email">{order.users?.email || '—'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="admin-items-list">
                          {Array.isArray(order.items) && order.items.map((item, i) => (
                            <div key={i} className="admin-order-item">
                              {item.nombre}
                              {item.size ? ` (T. ${item.size})` : ''}
                              {item.color ? ` — ${item.color}` : ''}
                              {' '}×{item.cantidad}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td>${(order.total || 0).toLocaleString('es-AR')}</td>
                      <td>
                        <span className={`admin-status-badge status-${order.status}`}>
                          {STATUS_LABELS[order.status] || order.status}
                        </span>
                      </td>
                      <td className="admin-actions-cell">
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          className="admin-status-select"
                          aria-label="Cambiar estado de la orden"
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                          ))}
                        </select>
                        <button
                          className="admin-delete-btn"
                          onClick={() => deleteOrder(order.id)}
                          aria-label="Eliminar orden"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {tab === 'products' && (
        <section className="admin-section">
          <div className="admin-products-header">
            <button className="admin-add-product-btn" onClick={openNewProduct}>
              + AGREGAR PRODUCTO
            </button>
          </div>

          {loadingProducts && <p className="admin-loading">Cargando productos...</p>}
          {productError && <p className="admin-error">{productError}</p>}

          {!loadingProducts && products.length === 0 && !productError && (
            <p className="admin-empty">No hay productos en la base de datos. Agregá uno.</p>
          )}

          {!loadingProducts && products.length > 0 && (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>IMAGEN</th>
                    <th>NOMBRE</th>
                    <th>PRECIO</th>
                    <th>TALLES</th>
                    <th>STOCK</th>
                    <th>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td>
                        {p.imagen ? (
                          <Image
                            src={p.imagen}
                            alt={p.nombre}
                            width={60}
                            height={60}
                            className="admin-product-thumb"
                          />
                        ) : (
                          <span className="admin-no-img">Sin imagen</span>
                        )}
                      </td>
                      <td>{p.nombre}</td>
                      <td>${Number(p.precio).toLocaleString('es-AR')}</td>
                      <td>
                        {Array.isArray(p.talles) && p.talles.length > 0
                          ? p.talles.join(', ')
                          : '—'}
                      </td>
                      <td>{p.stock ?? '—'}</td>
                      <td className="admin-actions-cell">
                        <button
                          className="admin-edit-btn"
                          onClick={() => openEditProduct(p)}
                          aria-label={`Editar ${p.nombre}`}
                        >
                          ✏️ Editar
                        </button>
                        <button
                          className="admin-delete-btn"
                          onClick={() => deleteProduct(p.id)}
                          aria-label={`Eliminar ${p.nombre}`}
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {showProductModal && (
        <div className="admin-modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={editingProduct ? 'Editar producto' : 'Nuevo producto'}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                {editingProduct ? 'EDITAR PRODUCTO' : 'NUEVO PRODUCTO'}
              </h2>
              <button className="cart-close" onClick={() => setShowProductModal(false)} aria-label="Cerrar">&times;</button>
            </div>
            <form className="admin-product-form" onSubmit={saveProduct}>
              <label className="checkout-label">Nombre *</label>
              <input
                className="checkout-input"
                type="text"
                placeholder="Ej: Campera Rompevientos"
                value={productForm.nombre}
                onChange={e => setProductForm(f => ({ ...f, nombre: e.target.value }))}
                required
              />

              <label className="checkout-label">Precio (ARS) *</label>
              <input
                className="checkout-input"
                type="number"
                min="0"
                placeholder="Ej: 150000"
                value={productForm.precio}
                onChange={e => setProductForm(f => ({ ...f, precio: e.target.value }))}
                required
              />

              <label className="checkout-label">URL de imagen</label>
              <input
                className="checkout-input"
                type="text"
                placeholder="Ej: /Imagenes/producto.webp"
                value={productForm.imagen}
                onChange={e => setProductForm(f => ({ ...f, imagen: e.target.value }))}
              />

              <label className="checkout-label">Categoría</label>
              <input
                className="checkout-input"
                type="text"
                placeholder="Ej: camperas, pantalones, accesorios"
                value={productForm.categoria}
                onChange={e => setProductForm(f => ({ ...f, categoria: e.target.value }))}
              />

              <label className="checkout-label">Talles (separados por coma)</label>
              <input
                className="checkout-input"
                type="text"
                placeholder="Ej: S, M, L, XL"
                value={productForm.talles}
                onChange={e => setProductForm(f => ({ ...f, talles: e.target.value }))}
              />

              <label className="checkout-label">Stock</label>
              <input
                className="checkout-input"
                type="number"
                min="0"
                placeholder="Ej: 10"
                value={productForm.stock}
                onChange={e => setProductForm(f => ({ ...f, stock: e.target.value }))}
              />

              <button
                type="submit"
                className="cart-checkout-btn"
                disabled={savingProduct}
                style={{ marginTop: '1rem' }}
              >
                {savingProduct ? 'Guardando...' : editingProduct ? 'GUARDAR CAMBIOS' : 'CREAR PRODUCTO'}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
