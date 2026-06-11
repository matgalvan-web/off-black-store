'use client';

import { useState, useEffect, useContext } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../context/AuthContext';
import { productos } from '../data/productos';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

const STATUS_OPTIONS = ['pending', 'paid', 'shipped', 'cancelled'];
const STATUS_LABELS = {
  pending: 'Pendiente',
  paid: 'Pagado',
  shipped: 'Enviado',
  cancelled: 'Cancelado',
};

export default function AdminPage() {
  const { user, isLoading } = useContext(AuthContext);
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('orders');

  const isAdmin = user && ADMIN_EMAIL && user.email === ADMIN_EMAIL;

  useEffect(() => {
    if (isLoading) return;
    if (!isAdmin) {
      router.replace('/');
      return;
    }
    fetchOrders();
    const interval = setInterval(() => fetchOrders(true), 15000);

    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchOrders(true);
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [isLoading, isAdmin, router]);

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

  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Error actualizando estado');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
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
          <button className="admin-refresh-btn" onClick={fetchOrders} disabled={loadingOrders}>
            {loadingOrders ? 'Actualizando...' : '↻ Actualizar'}
          </button>
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
          <span className="admin-stat-value">{productos.length}</span>
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
                              {item.nombre} ×{item.cantidad}
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
          <div className="admin-products-grid">
            {productos.map(p => (
              <div key={p.id} className="admin-product-card">
                <Image src={p.imagen} alt={p.nombre} width={300} height={300} className="admin-product-img" />
                <div className="admin-product-info">
                  <span className="admin-product-name">{p.nombre}</span>
                  <span className="admin-product-price">${p.precio.toLocaleString('es-AR')}</span>
                  <span className="admin-product-cat">{p.categoria}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
