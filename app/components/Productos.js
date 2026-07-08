'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Productos({ searchTerm }) {
  const [productos, setProductos] = useState([]);
  const busqueda = searchTerm.toLowerCase().trim();

  useEffect(() => {
    let mounted = true;
    fetch(`/api/products?t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store', Pragma: 'no-cache' },
    })
      .then(r => r.json())
      .then(data => {
        if (!mounted) return;
        setProductos(data.products || []);
      });
    return () => { mounted = false; };
  }, []);

  const filtrados = productos.filter(p => p.nombre.toLowerCase().includes(busqueda));

  if (filtrados.length === 0 && busqueda !== '') {
    return (
      <section className="productos-section" id="productos">
        <div className="section-label">TIENDA</div>
        <div className="section-title">NUESTROS PRODUCTOS</div>
        <p className="no-results">NO SE ENCONTRARON RESULTADOS</p>
      </section>
    );
  }

  return (
    <section className="productos-section" id="productos">
      <div className="section-label">TIENDA</div>
      <div className="section-title">NUESTROS PRODUCTOS</div>
      <div className="productos-grid">
        {filtrados.map((producto) => {
          const sinStock = typeof producto.stock === 'number' && producto.stock === 0;
          return (
            <Link
              key={producto.id}
              href={`/producto/${producto.id}`}
              className={`producto-item${sinStock ? ' producto-sin-stock' : ''}`}
              aria-label={`Ver ${producto.nombre} - $${producto.precio.toLocaleString('es-AR')}${sinStock ? ' - Sin stock' : ''}`}
            >
              <div className="image-box">
                <Image src={producto.imagen} alt={producto.nombre} width={400} height={280} />
                {sinStock && <span className="catalog-sin-stock-label">SIN STOCK</span>}
              </div>
              <div className="item-meta">
                <span>{producto.nombre}</span>
                <span>${producto.precio.toLocaleString('es-AR')}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}