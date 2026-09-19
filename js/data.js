/* ==========================================================================
   Moscú Showroom - Initial Seed Data
   ========================================================================== */

export const INITIAL_CATEGORIES = [
  { id: 'todos', name: 'TODO', slug: 'todos', count: 12, showInNav: true },
  { id: 'liquidacion', name: 'LIQUIDACIÓN!', slug: 'liquidacion', count: 3, showInNav: true, badge: 'HOT' },
  { id: 'drop-41', name: 'DROP 41', slug: 'drop-41', count: 4, showInNav: true, badge: 'NUEVO' },
  { id: 'pantalones', name: 'PANTALONES', slug: 'pantalones', count: 4, showInNav: true },
  { id: 'hoodies', name: 'HOODIES', slug: 'hoodies', count: 3, showInNav: true },
  { id: 'remeras', name: 'REMERAS', slug: 'remeras', count: 3, showInNav: true },
  { id: 'bermudas', name: 'BERMUDAS', slug: 'bermudas', count: 3, showInNav: true },
  { id: 'abrigos', name: 'ABRIGOS', slug: 'abrigos', count: 2, showInNav: true },
  { id: 'accesorios', name: 'ACCESORIOS & BEANIES', slug: 'accesorios', count: 2, showInNav: true }
];

export const INITIAL_ANNOUNCEMENTS = [
  'HASTA 6 CUOTAS SIN INTERÉS',
  '15% OFF CON TRANSFERENCIA',
  'ENVÍOS GRATIS EN COMPRAS SUPERIORES A $150.000',
  'SHOWROOM FÍSICO EN AYACUCHO - 9 DE JULIO 837'
];

export const INITIAL_HERO_SLIDES = [
  {
    id: 'slide-1',
    title: 'NUEVA COLECCIÓN DROP 41',
    subtitle: 'Siluetas oversize, denim pesado y terminaciones premium artesanales.',
    buttonText: 'EXPLORAR DROP',
    categoryLink: 'drop-41',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop',
    imageMobile: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=900&auto=format&fit=crop',
    theme: 'dark'
  },
  {
    id: 'slide-2',
    title: 'SUPER BAGGY DENIM & CARGOS',
    subtitle: 'El calce urbano definitivo confeccionado en gabardina y denim de 13oz.',
    buttonText: 'VER PANTALONES',
    categoryLink: 'pantalones',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1920&auto=format&fit=crop',
    imageMobile: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=900&auto=format&fit=crop',
    theme: 'light'
  },
  {
    id: 'slide-3',
    title: 'LIQUIDACIÓN DE TEMPORADA',
    subtitle: 'Últimas unidades de MiTienda Originals con hasta 40% OFF + 15% extra por transferencia.',
    buttonText: 'IR A LIQUIDACIÓN',
    categoryLink: 'liquidacion',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1920&auto=format&fit=crop',
    imageMobile: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=900&auto=format&fit=crop',
    theme: 'dark'
  },
  {
    id: 'slide-4',
    title: 'NUESTRO LOCAL FÍSICO',
    subtitle: 'Ubicado en Ayacucho, Provincia de Buenos Aires — 9 de Julio 837. Retirá tus compras online gratis.',
    buttonText: 'VER UBICACIÓN',
    categoryLink: 'showroom',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1920&auto=format&fit=crop',
    imageMobile: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=900&auto=format&fit=crop',
    theme: 'light'
  }
];

export const INITIAL_PRODUCTS = [
  {
    id: 'prod-001',
    sku: 'MSC-BER-SAINT',
    name: 'Bermuda Super Baggy "Saint" Premium',
    category: 'bermudas',
    categoryName: 'Bermudas',
    price: 95600,
    comparePrice: 112000,
    transferDiscountPct: 15,
    tags: ['NUEVO DROP', 'MÁS VENDIDO'],
    isFeatured: true,
    isNew: true,
    isSale: false,
    description: 'Bermuda con corte súper baggy de tiro medio-alto, confeccionada en denim rígido premium de 13oz. Lavado vintage suave con detalles de roturas sutiles y remaches metálicos con grabado exclusivo MiTienda. Ideal para combinar con remeras boxy.',
    specs: {
      composicion: '100% Algodón denim pesado',
      corte: 'Super Baggy fit',
      cuidados: 'Lavar con agua fría del revés. No usar blanqueador.'
    },
    images: [
      'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1000&auto=format&fit=crop'
    ],
    sizes: [
      { size: '38', stock: 3 },
      { size: '40', stock: 5 },
      { size: '42', stock: 4 },
      { size: '44', stock: 2 },
      { size: '46', stock: 0 }
    ]
  },
  {
    id: 'prod-002',
    sku: 'MSC-PAN-CARP',
    name: 'Pantalón Carpenter Baggy "Raw Black"',
    category: 'pantalones',
    categoryName: 'Pantalones',
    price: 118000,
    comparePrice: 135000,
    transferDiscountPct: 15,
    tags: ['DROP 41', 'DESTACADO'],
    isFeatured: true,
    isNew: true,
    isSale: false,
    description: 'Pantalón carpintero de corte ancho y relajado, confeccionado en twill pesado negro carbón. Bolsillos laterales utilitarios, presilla portamartillo y costuras reforzadas al tono para máxima durabilidad urbana.',
    specs: {
      composicion: '100% Gabardina de algodón esmerilada',
      corte: 'Relaxed Carpenter Fit',
      cuidados: 'Lavar con prendas oscuras. Secado a la sombra.'
    },
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?q=80&w=1000&auto=format&fit=crop'
    ],
    sizes: [
      { size: '38', stock: 4 },
      { size: '40', stock: 6 },
      { size: '42', stock: 5 },
      { size: '44', stock: 3 },
      { size: '46', stock: 2 }
    ]
  },
  {
    id: 'prod-003',
    sku: 'MSC-HD-BOX-WSH',
    name: 'Hoodie Heavyweight Boxy "MiTienda Studio"',
    category: 'hoodies',
    categoryName: 'Hoodies',
    price: 129000,
    comparePrice: null,
    transferDiscountPct: 15,
    tags: ['DROP 41'],
    isFeatured: true,
    isNew: true,
    isSale: false,
    description: 'Buzo canguro con capucha doble sin cordón. Confeccionado en frisa invisible pesada peinada de 450 gramos. Calce boxy con hombros caídos marcados y rib ancho al tono.',
    specs: {
      composicion: '85% Algodón peinado / 15% Poliéster hilado',
      corte: 'Boxy Heavyweight',
      cuidados: 'Lavar a máquina en ciclo suave. No usar secadora.'
    },
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=1000&auto=format&fit=crop'
    ],
    sizes: [
      { size: 'S', stock: 2 },
      { size: 'M', stock: 6 },
      { size: 'L', stock: 5 },
      { size: 'XL', stock: 3 }
    ]
  },
  {
    id: 'prod-004',
    sku: 'MSC-REM-OVER-ST',
    name: 'Remera Oversized "Saint" Vintage Washed',
    category: 'remeras',
    categoryName: 'Remeras',
    price: 52000,
    comparePrice: 65000,
    transferDiscountPct: 15,
    tags: ['LIQUIDACIÓN!', '15% OFF'],
    isFeatured: true,
    isNew: false,
    isSale: true,
    description: 'Remera de cuello cerrado alto en rib de 3cm, corte oversized auténtico con mangas anchas al codo. Tratamiento stonewash con desgaste artesanal en bordes y estampado serigráfico al agua.',
    specs: {
      composicion: '100% Jersey peinado 24/1 pesado',
      corte: 'Oversize 90s Fit',
      cuidados: 'No planchar sobre la estampa.'
    },
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1000&auto=format&fit=crop'
    ],
    sizes: [
      { size: 'S', stock: 5 },
      { size: 'M', stock: 8 },
      { size: 'L', stock: 4 },
      { size: 'XL', stock: 1 }
    ]
  },
  {
    id: 'prod-005',
    sku: 'MSC-JEAN-BAG-OW',
    name: 'Jean Super Baggy "Off-White" Washed',
    category: 'pantalones',
    categoryName: 'Pantalones',
    price: 114500,
    comparePrice: 139000,
    transferDiscountPct: 15,
    tags: ['LIQUIDACIÓN!'],
    isFeatured: false,
    isNew: false,
    isSale: true,
    description: 'Jean blanco tiza con proceso de teñido natural. Corte ultra holgado con caída pesada sobre el calzado, 5 bolsillos clásicos y etiqueta de cuero curtido vegetal en cintura trasera.',
    specs: {
      composicion: '100% Denim Bull 12.5oz',
      corte: 'Extra Wide Leg',
      cuidados: 'Lavar solo o con prendas blancas.'
    },
    images: [
      'https://images.unsplash.com/photo-1542272604-780c96856592?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?q=80&w=1000&auto=format&fit=crop'
    ],
    sizes: [
      { size: '38', stock: 2 },
      { size: '40', stock: 4 },
      { size: '42', stock: 3 },
      { size: '44', stock: 0 }
    ]
  },
  {
    id: 'prod-006',
    sku: 'MSC-CAM-PUFF-BK',
    name: 'Campera Puffer Matte Black "Alpine"',
    category: 'abrigos',
    categoryName: 'Abrigos',
    price: 185000,
    comparePrice: null,
    transferDiscountPct: 15,
    tags: ['DROP 41', 'ÚLTIMAS UNIDADES'],
    isFeatured: true,
    isNew: true,
    isSale: false,
    description: 'Campera acolchada de alto rendimiento térmico con terminación mate hidrófuga. Relleno ultraliviano térmico, cuello alto envolvente, cierre YKK bidireccional y cordones de ajuste en botamanga.',
    specs: {
      composicion: 'Exterior 100% Ripstop Matte / Interior Guata Siliconada',
      corte: 'Boxy Puffer',
      cuidados: 'Limpieza en seco o paño húmedo.'
    },
    images: [
      'https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=1000&auto=format&fit=crop'
    ],
    sizes: [
      { size: 'M', stock: 2 },
      { size: 'L', stock: 3 },
      { size: 'XL', stock: 1 }
    ]
  },
  {
    id: 'prod-007',
    sku: 'MSC-REM-BOX-BLK',
    name: 'Remera Boxy Fit "Originals 90" Black',
    category: 'remeras',
    categoryName: 'Remeras',
    price: 49500,
    comparePrice: 58000,
    transferDiscountPct: 15,
    tags: ['MÁS VENDIDO'],
    isFeatured: false,
    isNew: false,
    isSale: false,
    description: 'Básico esencial de alta gama. Confeccionada con algodón de 230gr peinado, cuello grueso en rib y silueta ancha y corta tipo square boxy.',
    specs: {
      composicion: '100% Algodón Premium 24/1',
      corte: 'Square Boxy',
      cuidados: 'Lavar en frío, no usar secarropas.'
    },
    images: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=1000&auto=format&fit=crop'
    ],
    sizes: [
      { size: 'S', stock: 6 },
      { size: 'M', stock: 9 },
      { size: 'L', stock: 8 },
      { size: 'XL', stock: 5 }
    ]
  },
  {
    id: 'prod-008',
    sku: 'MSC-ACC-BEANIE-GR',
    name: 'Gorro Beanie Ribbed Knit "Slate Grey"',
    category: 'accesorios',
    categoryName: 'Accesorios & Beanies',
    price: 26000,
    comparePrice: 32000,
    transferDiscountPct: 15,
    tags: ['HOT SALE'],
    isFeatured: false,
    isNew: false,
    isSale: true,
    description: 'Gorro beanie tejido en punto inglés apretado de tacto ultra suave. Dobladillo regulable con parche de goma microinyectado MiTienda.',
    specs: {
      composicion: '100% Dralón térmico antialérgico',
      corte: 'Talle Único Adaptable',
      cuidados: 'Lavar a mano con agua fría.'
    },
    images: [
      'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1618354691438-25bc04584c03?q=80&w=1000&auto=format&fit=crop'
    ],
    sizes: [
      { size: 'Único', stock: 12 }
    ]
  }
];

export const INITIAL_ORDERS = [
  {
    id: 'ord-1001',
    orderNumber: 'MSC-9281',
    date: '2025-02-14T14:32:00Z',
    customer: {
      name: 'Joaquín Benítez',
      email: 'joaquin.b@gmail.com',
      phone: '+54 9 11 4829-1920',
      shippingAddress: {
        street: 'Av. Colón 2341',
        city: 'Mar del Plata',
        province: 'Buenos Aires',
        postalCode: '7600'
      }
    },
    items: [
      {
        productId: 'prod-003',
        name: 'Hoodie Heavyweight Boxy "MiTienda Studio"',
        size: '42',
        quantity: 1,
        unitPrice: 95600,
        image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=300&auto=format&fit=crop'
      }
    ],
    shipping: {
      method: 'andreani',
      name: 'Andreani a Domicilio',
      cost: 6500
    },
    payment: {
      method: 'transferencia',
      name: 'Transferencia Bancaria (15% OFF)',
      discountPct: 15,
      discountAmount: 14340
    },
    subtotal: 95600,
    total: 87760,
    status: 'Pendiente',
    trackingCode: ''
  },
  {
    id: 'MSC-84911',
    date: '2026-09-14T21:15:00Z',
    customer: {
      name: 'Camila Rodriguez',
      email: 'cami.rodriguez99@hotmail.com',
      phone: '+54 9 223 644-8891',
      address: {
        street: 'Güemes 2840',
        city: 'Mar del Plata',
        province: 'Buenos Aires',
        postalCode: '7600'
      }
    },
    items: [
      {
        productId: 'prod-003',
        name: 'Hoodie Heavyweight Boxy "Moscú Studio"',
        size: 'M',
        quantity: 1,
        unitPrice: 129000,
        image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=300&auto=format&fit=crop'
      },
      {
        productId: 'prod-008',
        name: 'Gorro Beanie Ribbed Knit "Slate Grey"',
        size: 'Único',
        quantity: 1,
        unitPrice: 26000,
        image: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?q=80&w=300&auto=format&fit=crop'
      }
    ],
    shipping: {
      method: 'gratis',
      name: 'Envío Gratis (Superó $150.000)',
      cost: 0
    },
    payment: {
      method: 'mercadopago',
      name: 'Mercado Pago (6 Cuotas Sin Interés)',
      discountPct: 0,
      discountAmount: 0
    },
    subtotal: 155000,
    total: 155000,
    status: 'Pagado',
    trackingCode: 'AND-99482710AR'
  },
  {
    id: 'MSC-84910',
    date: '2026-09-14T14:02:00Z',
    customer: {
      name: 'Federico Gómez',
      email: 'fede.gomez.tandil@gmail.com',
      phone: '+54 9 249 433-1288',
      address: {
        street: 'Showroom Pick-up',
        city: 'Ayacucho',
        province: 'Buenos Aires',
        postalCode: '7150'
      }
    },
    items: [
      {
        productId: 'prod-002',
        name: 'Pantalón Carpenter Baggy "Raw Black"',
        size: '40',
        quantity: 1,
        unitPrice: 118000,
        image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=300&auto=format&fit=crop'
      }
    ],
    shipping: {
      method: 'showroom',
      name: 'Retiro en Showroom Ayacucho (Gratis)',
      cost: 0
    },
    payment: {
      method: 'transferencia',
      name: 'Transferencia Bancaria (15% OFF)',
      discountPct: 15,
      discountAmount: 17700
    },
    subtotal: 118000,
    total: 100300,
    status: 'En preparación',
    trackingCode: ''
  },
  {
    id: 'MSC-84909',
    date: '2026-09-13T10:45:00Z',
    customer: {
      name: 'Martina Soler',
      email: 'martusoler@gmail.com',
      phone: '+54 9 11 3109-8822',
      address: {
        street: 'Thames 1720, Piso 3 Depto B',
        city: 'Palermo, CABA',
        province: 'Buenos Aires',
        postalCode: '1414'
      }
    },
    items: [
      {
        productId: 'prod-006',
        name: 'Campera Puffer Matte Black "Alpine"',
        size: 'L',
        quantity: 1,
        unitPrice: 185000,
        image: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=300&auto=format&fit=crop'
      }
    ],
    shipping: {
      method: 'gratis',
      name: 'Envío Gratis a Domicilio',
      cost: 0
    },
    payment: {
      method: 'mercadopago',
      name: 'Tarjeta de Crédito (3 Cuotas Sin Interés)',
      discountPct: 0,
      discountAmount: 0
    },
    subtotal: 185000,
    total: 185000,
    status: 'Enviado',
    trackingCode: 'CR-882910482AR'
  }
];

export const INITIAL_SETTINGS = {
  storeName: 'MiTienda',
  storeTagline: 'SHOWROOM • MODA URBANA',
  themeMode: 'dark',
  enableGlassmorphism: true,
  primaryColor: '#000000',
  adbarColor: '#ff0000',
  cuotasSinInteres: 6,
  transferDiscountPct: 15,
  freeShippingThreshold: 150000,
  shippingCosts: {
    correoArgentino: 5400,
    andreani: 6800,
    showroom: 0
  },
  phoneWhatsapp: '5492494123456',
  showroomAddress: '9 de Julio 837, Ayacucho, Provincia de Buenos Aires',
  bankTransferData: {
    titular: 'MITIENDA S.R.L.',
    cuit: '30-71829304-9',
    banco: 'Banco Galicia',
    cbu: '0070123130004019283741',
    alias: 'MITIENDA.OFICIAL'
  },
  activeCoupons: [
    { code: 'MITIENDA10', discountPct: 10, minPurchase: 50000 },
    { code: 'BIENVENIDA', discountPct: 15, minPurchase: 40000 },
    { code: 'HOTDROP', discountPct: 20, minPurchase: 80000 }
  ],
  trustBadges: [
    {
      id: 'badge-1',
      title: 'Envíos a todo el país',
      subtitle: 'Correo Argentino & Andreani. Gratis superando $150.000',
      icon: 'truck'
    },
    {
      id: 'badge-2',
      title: 'Hasta 6 Cuotas Sin Interés',
      subtitle: 'Con todas las tarjetas bancarias mediante Mercado Pago',
      icon: 'credit-card'
    },
    {
      id: 'badge-3',
      title: '15% OFF Transferencia',
      subtitle: 'Descuento automático pagando por transferencia bancaria',
      icon: 'dollar'
    },
    {
      id: 'badge-4',
      title: 'Showroom en Ayacucho',
      subtitle: '9 de Julio 837. Retirá tus pedidos online sin costo',
      icon: 'map-pin'
    }
  ],
  lookbook: {
    tag: 'Comprá el Outfit',
    title: 'MiTienda Streetwear Lookbook',
    description: 'Diseñamos siluetas amplias, texturas de alto gramaje y calces relajados pensados para el uso diario sin perder la vanguardia.',
    buttonText: 'VER LOOKS COMPLETOS',
    categoryLink: 'pantalones',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop'
  },
  mercadoPago: {
    enabled: true,
    publicKey: 'TEST-xxxx-xxxx-xxxx',
    accessToken: 'TEST-xxxx-xxxx-xxxx',
    sandboxMode: true
  }
};
