'use client';

import Link from 'next/link';

export default function HistoryPage() {
  return (
    <main className="history-page">
      <div className="history-header">
        <Link href="/" className="back-link">← VOLVER</Link>
        <h1 className="history-title">HISTORIA DE LA MARCA</h1>
      </div>

      <div className="history-content">
        <section className="history-section">
          <h2>NUESTROS ORÍGENES</h2>
          <p>
            OFF-BLACK nace en 2018 como una respuesta a la necesidad de ropa de calidad con diseño minimalista y accesible. 
            Lo que comenzó como un proyecto personal se transformó rápidamente en una marca que representa la actitud real 
            de jóvenes que no quieren comprometerse con la calidad ni con su identidad visual.
          </p>
        </section>

        <section className="history-section">
          <h2>NUESTRO PROPÓSITO</h2>
          <p>
            Creemos en la libertad de expresión a través de la ropa. OFF-BLACK es más que una tienda; es un movimiento 
            que desafía lo convencional y abraza la individualidad. Cada prenda que producimos está hecha pensando en 
            personas que conocen lo que quieren y no temen ser diferentes.
          </p>
        </section>

        <section className="history-section">
          <h2>DISEÑO LIMPIO, ACTITUD REAL</h2>
          <p>
            Nuestro concepto central es simple pero poderoso: diseño limpio sin complicaciones. Cada pieza está cuidadosamente 
            seleccionada para garantizar calidad, comodidad y estilo. Utilizamos materiales de primera calidad y procesos de 
            manufactura responsables para asegurar que cada prenda sea duradera y versátil.
          </p>
        </section>

        <section className="history-section">
          <h2>VALORES QUE NOS DEFINEN</h2>
          <ul className="history-values">
            <li><strong>Calidad:</strong> Ningún compromiso en los materiales ni la confección</li>
            <li><strong>Minimalismo:</strong> Diseños simples que nunca pasan de moda</li>
            <li><strong>Autenticidad:</strong> Ropa para personas reales, no para modelos de pasarela</li>
            <li><strong>Sostenibilidad:</strong> Comprometidos con prácticas responsables con el medio ambiente</li>
            <li><strong>Comunidad:</strong> Cada cliente es parte de la familia OFF-BLACK</li>
          </ul>
        </section>

        <section className="history-section">
          <h2>HOY EN DÍA</h2>
          <p>
            OFF-BLACK ha crecido exponencialmente, pero mantenemos nuestros valores fundamentales intactos. Contamos con 
            miles de clientes leales en toda la región que creen en nuestra visión. Nuestro equipo trabaja incansablemente 
            para traer nuevas colecciones que combinen tendencias actuales con diseño atemporal.
          </p>
        </section>

        <section className="history-section final-message">
          <h2>TÚ ERES PARTE DE ESTO</h2>
          <p>
            Cuando eliges OFF-BLACK, no solo estás comprando ropa. Estás siendo parte de un movimiento que valora la 
            calidad, la autenticidad y la individualidad. Gracias por creer en nosotros y ser parte de esta historia.
          </p>
          <Link href="/#productos" className="history-cta">VER COLECCIÓN</Link>
        </section>
      </div>
    </main>
  );
}
