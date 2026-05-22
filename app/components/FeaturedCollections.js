'use client';

import { useRouter } from 'next/navigation';

export default function FeaturedCollections() {
  const router = useRouter();
  
  // IDs correctos que coinciden con productos reales
  const features = [
    {
      id: 'e77c85fb-f264-4ea5-88c3-fc2735bb2622', // CAMPERA ROMPEVIENTOS
      imagen: '/Imagenes/camperanegra.png.webp',
      tag: 'STREET CORE',
      titulo: 'Campera nocturna',
      descripcion: 'Una pieza estructurada con presencia urbana y líneas bien definidas.'
    },
    {
      id: 'f55fb962-9618-4f65-84e9-4b7b530c5488', // REMERAS
      imagen: '/Imagenes/remerasverdes.png.webp',
      tag: 'BASICS',
      titulo: 'Remeras esenciales',
      descripcion: 'Contraste suave, corte moderno y un bloque visual más contundente.'
    },
    {
      id: 'd7cc6975-c7c7-4e3d-a92e-69d2aed7703c', // PANTALÓN
      imagen: '/Imagenes/pantalonblanco.png.webp',
      tag: 'CONTRASTE',
      titulo: 'Pantalón claro',
      descripcion: 'Minimalismo con actitud para balancear la nueva colección OFF-BLACK.'
    },
    {
      id: 'da6fe60a-902d-4b0b-b3e7-67c426cc1adc', // MOCHILA
      imagen: '/Imagenes/bolsogrande.png.webp',
      tag: 'ACCESORIOS',
      titulo: 'Bolso grande',
      descripcion: 'Un accesorio funcional y estético que complementa cualquier look urbano.'
    }
  ];

  const handleProductClick = (id) => {
    router.push(`/producto/${id}`);
  };

  return (
    <section className="featured-collections">
      <div className="section-label">DESTACADOS</div>
      <div className="section-title">Imágenes rectangulares para darle energía a OFF-BLACK</div>
      <div className="feature-grid">
        {features.map((item) => (
          <article 
            key={item.id} 
            className="feature-card"
            onClick={() => handleProductClick(item.id)}
            style={{ cursor: 'pointer' }}
          >
            <img src={item.imagen} alt={item.titulo} />
            <div className="feature-copy">
              <span className="feature-tag">{item.tag}</span>
              <h3>{item.titulo}</h3>
              <p>{item.descripcion}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}