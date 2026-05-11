import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="main-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>TIENDA</h4>
          <Link href="#">Todos los productos</Link>
          <Link href="#">Nuevos ingresos</Link>
          <Link href="#">Sale</Link>
        </div>
        <div className="footer-section">
          <h4>AYUDA</h4>
          <Link href="#">Envíos</Link>
          <Link href="#">Cambios y devoluciones</Link>
          <Link href="#">Preguntas frecuentes</Link>
        </div>
        <div className="footer-section">
          <h4>OFF-BLACK</h4>
          <Link href="#">Nuestra historia</Link>
          <Link href="#">Locales</Link>
          <Link href="#">Contacto</Link>
        </div>
        <div className="footer-section">
          <h4>SEGUINOS</h4>
          <Link href="#">Instagram</Link>
          <Link href="#">TikTok</Link>
          <Link href="#">Facebook</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2024 OFF-BLACK. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}