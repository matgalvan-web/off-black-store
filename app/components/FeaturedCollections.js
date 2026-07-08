'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function FeaturedCollections() {
  const router = useRouter();
  
  const features = [
    {
      id: 1,
      imagen: '/Imagenes/camperanegra.png.webp',
      tag: 'STREET CORE',
      titulo: 'Campera nocturna',
      descripcion: 'Una pieza estructurada con presencia urbana y líneas bien definidas.'
    },
    {
      id: 21,
      imagen: '/Imagenes/remerasverdes.png.webp',
      tag: 'BASICS',
      titulo: 'Remeras esenciales',
      descripcion: 'Contraste suave, corte moderno y un bloque visual más contundente.'
    },
    {
      id: 17,
      imagen: '/Imagenes/pantalonblanco.png.webp',
      tag: 'CONTRASTE',
      titulo: 'Pantalón claro',
      descripcion: 'Minimalismo con actitud para balancear la nueva colección OFF-BLACK.'
    },
    {
      id: 11,
      imagen: '/Imagenes/bolsogrande.png.webp',
      tag: 'ACCESORIOS',
      titulo: 'Bolso grande',
      descripcion: 'Un accesorio funcional y estético que complementa cualquier look urbano.'
    }
  ];

  const handleProductClick = () => {
    document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' });
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
            onClick={() => handleProductClick()}
            onKeyDown={(e) => e.key === 'Enter' && handleProductClick()}
            role="button"
            tabIndex={0}
            aria-label={`Ver colección: ${item.titulo}`}
            style={{ cursor: 'pointer' }}
          >
            <Image src={item.imagen} alt={item.titulo} width={600} height={280} />
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