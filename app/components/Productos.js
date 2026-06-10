'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getProducts } from '../../lib/supabaseOperations';

export default function Productos({ searchTerm }) {
  const [productos, setProductos] = useState([]);
  const busqueda = searchTerm.toLowerCase().trim();

  useEffect(() => {
    let mounted = true;
    getProducts().then(res => {
      if (!mounted) return;
      if (res.success) setProductos(res.products || []);
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
        {filtrados.map((producto) => (
          <Link
            key={producto.id}
            href={`/producto/${producto.id}`}
            className="producto-item"
            aria-label={`Ver ${producto.nombre} - $${producto.precio.toLocaleString('es-AR')}`}
          >
            <div className="image-box">
              <Image src={producto.imagen} alt={producto.nombre} width={400} height={280} />
            </div>
            <div className="item-meta">
              <span>{producto.nombre}</span>
              <span>${producto.precio.toLocaleString('es-AR')}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}