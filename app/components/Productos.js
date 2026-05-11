'use client';

import { useRouter } from 'next/navigation';
import { productos } from '../data/productos';

export default function Productos({ searchTerm, onProductClick }) {
  const router = useRouter();
  const busqueda = searchTerm.toLowerCase().trim();
  const filtrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(busqueda)
  );

  const handleProductClick = (id) => {
    router.push(`/producto/${id}`);
  };

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
          <div 
            key={producto.id} 
            className="producto-item"
            onClick={() => handleProductClick(producto.id)}
          >
            <div className="image-box">
              <img src={producto.imagen} alt={producto.nombre} />
            </div>
            <div className="item-meta">
              <span>{producto.nombre}</span>
              <span>${producto.precio.toLocaleString('es-AR')}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}