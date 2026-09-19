'use client';

/* ==========================================================================
   Moscú Showroom - Newsletter Component
   ========================================================================== */

import React, { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
  };

  return (
    <section className="newsletter-section" aria-label="Suscripción al Club">
      <div className="newsletter-container">
        <h2 className="newsletter-title">Unite a TuTienda Club</h2>
        <p className="newsletter-desc">
          Recibí un 10% OFF en tu primera compra y enterate antes que nadie de los nuevos drops y liquidaciones.
        </p>
        {subscribed ? (
          <div style={{ background: '#dcfce7', color: '#166534', padding: '14px', borderRadius: '4px', fontWeight: 700 }}>
            ¡Gracias por suscribirte! Te enviamos tu código de descuento a {email}.
          </div>
        ) : (
          <form className="newsletter-form" onSubmit={handleSubmit}>
            <input
              type="email"
              className="newsletter-input"
              placeholder="Ingresá tu correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="newsletter-btn">Suscribirme</button>
          </form>
        )}
      </div>
    </section>
  );
}
