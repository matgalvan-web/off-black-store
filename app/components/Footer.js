import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="main-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>TIENDA</h4>
          <Link href="/#productos">Todos los productos</Link>
          <Link href="/#productos">Nuevos ingresos</Link>
          <Link href="/#productos">Sale</Link>
        </div>
        <div className="footer-section">
          <h4>AYUDA</h4>
          <Link href="/historia">Envíos</Link>
          <Link href="/historia">Cambios y devoluciones</Link>
          <Link href="/historia">Preguntas frecuentes</Link>
        </div>
        <div className="footer-section">
          <h4>OFF-BLACK</h4>
          <Link href="/historia">Nuestra historia</Link>
          <Link href="/historia">Locales</Link>
          <Link href="/historia">Contacto</Link>
        </div>
        <div className="footer-section">
          <h4>SEGUINOS</h4>
          <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="https://www.tiktok.com/" target="_blank" rel="noopener noreferrer">TikTok</a>
          <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer">Facebook</a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2025 OFF-BLACK. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}