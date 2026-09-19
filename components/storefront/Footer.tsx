import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSettings } from '../../lib/supabaseClient';

/* ==========================================================================
   TuTienda Showroom - Site Footer
   ========================================================================== */

interface FooterProps {
  onSelectCategory?: (slug: string) => void;
  onOpenSizeGuide?: () => void;
}

export default function Footer({ onSelectCategory, onOpenSizeGuide }: FooterProps) {
  const [storeName, setStoreName] = useState('MiTienda');
  const [showroomAddress, setShowroomAddress] = useState('9 de Julio 837, Ayacucho, Buenos Aires');
  const [phoneWhatsapp, setPhoneWhatsapp] = useState('+54 9 249 412-3456');

  useEffect(() => {
    getSettings().then(s => {
      if (s?.storeName) {
        const clean = (s.storeName.includes('Moscú') || s.storeName.includes('TuTienda')) ? 'MiTienda' : s.storeName;
        setStoreName(clean);
      }
      if (s?.showroomAddress) setShowroomAddress(s.showroomAddress);
      if (s?.phoneWhatsapp) setPhoneWhatsapp(s.phoneWhatsapp);
    });
  }, []);

  return (
    <footer className="site-footer" id="showroom">
      <div className="footer-grid">
        <div className="footer-col footer-about">
          <h3 style={{ fontFamily: 'var(--heading-font)', fontSize: '26px', fontWeight: 700, marginBottom: '8px' }}>
            {storeName}!
          </h3>
          <p>
            Showroom exclusivo de indumentaria y streetwear ubicado en {showroomAddress}. Envíos a todo el país y retiro en local.
          </p>
          <div style={{ marginTop: '14px', fontSize: '13px', color: '#4b5563', lineHeight: 1.6 }}>
            📍 <strong>Showroom:</strong> {showroomAddress}<br />
            ⏰ <strong>Horarios:</strong> Lun a Sáb 10:00 - 13:00 / 16:30 - 20:30 hs<br />
            📱 <strong>WhatsApp:</strong> {phoneWhatsapp}
          </div>
        </div>

        <div className="footer-col">
          <h4>Navegación</h4>
          <ul>
            <li>
              <a href="#productos" onClick={(e) => { e.preventDefault(); onSelectCategory && onSelectCategory('drop-41'); }}>
                Nuevo Drop
              </a>
            </li>
            <li>
              <a href="#productos" onClick={(e) => { e.preventDefault(); onSelectCategory && onSelectCategory('pantalones'); }}>
                Pantalones & Cargos
              </a>
            </li>
            <li>
              <a href="#productos" onClick={(e) => { e.preventDefault(); onSelectCategory && onSelectCategory('hoodies'); }}>
                Hoodies & Buzos
              </a>
            </li>
            <li>
              <a href="#productos" onClick={(e) => { e.preventDefault(); onSelectCategory && onSelectCategory('remeras'); }}>
                Remeras Oversize
              </a>
            </li>
            <li>
              <a href="#productos" onClick={(e) => { e.preventDefault(); onSelectCategory && onSelectCategory('liquidacion'); }}>
                Liquidación!
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Ayuda & Contacto</h4>
          <ul>
            <li>
              <button
                type="button"
                onClick={onOpenSizeGuide}
                style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', color: 'inherit', cursor: 'pointer', textAlign: 'left' }}
              >
                Guía de Talles
              </button>
            </li>
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); alert('Envíos por Correo Argentino y Andreani. Demora estimada de 3 a 5 días hábiles.'); }}>
                Tiempos de Envío
              </a>
            </li>
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); alert('Tenés 30 días para realizar cambios con tu ticket o número de orden.'); }}>
                Políticas de Cambio
              </a>
            </li>
            <li>
              <a href="https://wa.me/5492494123456" target="_blank" rel="noopener noreferrer">
                Atención por WhatsApp
              </a>
            </li>
            <li>
              <Link href="/admin">
                Acceso Panel Admin
              </Link>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Medios de Pago</h4>
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>
            Hasta 6 cuotas sin interés con tarjetas bancarias y 15% OFF por transferencia.
          </p>
          <div className="payment-shipping-logos">
            <span className="badge-pay">Mercado Pago</span>
            <span className="badge-pay">Visa</span>
            <span className="badge-pay">Mastercard</span>
            <span className="badge-pay">Naranja</span>
            <span className="badge-pay">Transferencia</span>
          </div>

          <h4 style={{ marginTop: '20px', marginBottom: '8px' }}>Formas de Envío</h4>
          <div className="payment-shipping-logos">
            <span className="badge-pay">Correo Argentino</span>
            <span className="badge-pay">Andreani</span>
            <span className="badge-pay">Retiro Showroom</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 {storeName} Showroom. Todos los derechos reservados. Desarrollado con Next.js y Supabase.</span>
        <span>Ayacucho, Buenos Aires, Argentina.</span>
      </div>
    </footer>
  );
}
