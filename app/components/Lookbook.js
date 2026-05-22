'use client';

import { useRouter } from 'next/navigation';

export default function Lookbook() {
  const router = useRouter();
  
  const looks = [
    {
      imagen: '/Imagenes/hoodienegropng.webp',
      titulo: 'Atuendo nocturno',
      descripcion: 'Una composición moderna con silueta relajada y líneas sólidas.',
      id: 'e19cff1b-65f2-4712-af1c-54ae63c6b600' // GUANTES DE INVIERNO
    },
    {
      imagen: '/Imagenes/camperapuffer.png.webp',
      titulo: 'Textura y volumen',
      descripcion: 'La pieza técnica que define la temporada y agrega actitud a cada outfit.',
      id: '62ad3e46-aa60-4ab0-a5b1-ec832d2d3cc1' // CAMPERA PUFFER
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