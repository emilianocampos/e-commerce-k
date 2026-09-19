import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CartProvider } from '../context/CartContext';

export const metadata: Metadata = {
  title: 'Tienda Online de MiTienda | Indumentaria Streetwear & Drops Exclusivos',
  description:
    'Tienda online oficial de MiTienda Showroom. Hoodies oversize, baggy pants, camperas y remeras urbanas. Envíos gratis a todo el país superando $150.000 y hasta 6 cuotas sin interés.',
  keywords: [
    'MiTienda',
    'Streetwear',
    'Indumentaria Urbana',
    'Showroom',
    'Drop 41',
    'Baggy Pants',
    'Hoodies Oversize'
  ],
  authors: [{ name: 'MiTienda Showroom' }]
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#000000'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" data-theme="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,600;0,7..72,700;1,7..72,400&family=Orbitron:wght@600;700;800;900&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Syncopate:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('mitienda_theme');
                  if (t) {
                    document.documentElement.setAttribute('data-theme', t);
                  }
                } catch (e) {}
              })();
            `
          }}
        />
      </head>
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
