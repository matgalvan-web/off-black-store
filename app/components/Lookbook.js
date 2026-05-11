'use client';

import { useRouter } from 'next/navigation';

export default function Lookbook({ onProductClick }) {
  const router = useRouter();
  
  const looks = [
    {
      imagen: '/Imagenes/hoodienegropng.webp',
      titulo: 'Atuendo nocturno',
      descripcion: 'Una composición moderna con silueta relajada y líneas sólidas.',
      id: 8
    },
    {
      imagen: '/Imagenes/camperapuffer.png.webp',
      titulo: 'Textura y volumen',
      descripcion: 'La pieza técnica que define la temporada y agrega actitud a cada outfit.',
      id: 24
    }
  ];

  const handleProductClick = (id) => {
    router.push(`/producto/${id}`);
  };

  return (
    <section className="lookbook-section">
      <div className="section-label">LOOKBOOK</div>
      <div className="section-title">Más imágenes rectangulares para inspirarte</div>
      <div className="lookbook-grid">
        {looks.map((look, index) => (
          <article 
            key={index} 
            className="lookbook-card"
            onClick={() => handleProductClick(look.id)}
            style={{ cursor: 'pointer' }}
          >
            <img src={look.imagen} alt={look.titulo} />
            <div>
              <h3>{look.titulo}</h3>
              <p>{look.descripcion}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}