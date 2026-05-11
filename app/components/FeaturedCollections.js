'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { productos } from '../data/productos';

export default function FeaturedCollections({ onProductClick }) {
  const router = useRouter();
  
  // IDs correctos que coinciden con productos reales
  const features = [
    {
      id: 22, // CAMPERA AZUL
      imagen: '/Imagenes/camperanegra.png.webp',
      tag: 'STREET CORE',
      titulo: 'Campera nocturna',
      descripcion: 'Una pieza estructurada con presencia urbana y líneas bien definidas.'
    },
    {
      id: 21, // REMERAS VERDES
      imagen: '/Imagenes/remerasverdes.png.webp',
      tag: 'BASICS',
      titulo: 'Remeras esenciales',
      descripcion: 'Contraste suave, corte moderno y un bloque visual más contundente.'
    },
    {
      id: 17, // PANTALÓN BLANCO
      imagen: '/Imagenes/pantalonblanco.png.webp',
      tag: 'CONTRASTE',
      titulo: 'Pantalón claro',
      descripcion: 'Minimalismo con actitud para balancear la nueva colección OFF-BLACK.'
    },
    {
      id: 11, // MOCHILA
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