-- ==========================================================================
-- TuTienda E-Commerce - Complete Supabase PostgreSQL Schema & Seed Data
-- Integración: Supabase Auth (Clientes & Admin) + Mercado Pago + CMS + RLS
-- ==========================================================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================================================
-- 1. PERFILES DE USUARIO (Vinculado a Supabase Auth)
-- Permite que los clientes se registren/inicien sesión para comprar
-- ==========================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  dni TEXT,
  shipping_address JSONB DEFAULT '{
    "street": "",
    "number": "",
    "floor": "",
    "city": "",
    "province": "Buenos Aires",
    "postalCode": ""
  }'::jsonb,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger para crear automáticamente el perfil cuando un usuario se registra en Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================================================
-- 2. CATEGORÍAS & COLECCIONES
-- ==========================================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  count INTEGER DEFAULT 0,
  show_in_nav BOOLEAN DEFAULT TRUE,
  badge TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================================================
-- 3. PRODUCTOS DEL CATÁLOGO
-- ==========================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY DEFAULT ('prod-' || floor(extract(epoch from now()))::text),
  sku TEXT,
  name TEXT NOT NULL,
  category TEXT REFERENCES public.categories(slug) ON UPDATE CASCADE ON DELETE SET NULL,
  category_name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  compare_price NUMERIC,
  transfer_discount_pct INTEGER DEFAULT 15,
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,
  is_sale BOOLEAN DEFAULT FALSE,
  description TEXT,
  specs JSONB DEFAULT '{"composicion": "100% Algodón Premium 24/1", "corte": "Oversize Streetwear", "cuidados": "Lavar con agua fría"}'::jsonb,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================================================
-- 4. TALLES Y CONTROL DE STOCK
-- ==========================================================================
CREATE TABLE IF NOT EXISTS public.product_sizes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  stock INTEGER DEFAULT 0,
  UNIQUE (product_id, size)
);

-- ==========================================================================
-- 5. BANNERS HERO SLIDER (CMS)
-- ==========================================================================
CREATE TABLE IF NOT EXISTS public.hero_slides (
  id TEXT PRIMARY KEY DEFAULT ('slide-' || floor(extract(epoch from now()))::text),
  title TEXT NOT NULL,
  subtitle TEXT,
  button_text TEXT DEFAULT 'VER COLECCIÓN',
  category_link TEXT DEFAULT 'todos',
  image TEXT NOT NULL,
  image_mobile TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================================================
-- 6. BARRA SUPERIOR DE ANUNCIOS / TICKER (CMS)
-- ==========================================================================
CREATE TABLE IF NOT EXISTS public.announcements (
  id SERIAL PRIMARY KEY,
  message TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- ==========================================================================
-- 7. PEDIDOS CON INTEGRACIÓN A MERCADO PAGO Y CLIENTES
-- ==========================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  customer JSONB NOT NULL,
  items JSONB NOT NULL,
  shipping JSONB NOT NULL,
  payment JSONB NOT NULL,
  subtotal NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT DEFAULT 'Pendiente' CHECK (status IN ('Pendiente', 'Pagado', 'En preparación', 'Enviado', 'Entregado', 'Cancelado')),
  tracking_code TEXT DEFAULT '',
  -- Campos dedicados de integración Mercado Pago:
  payment_method TEXT DEFAULT 'transferencia' CHECK (payment_method IN ('mercadopago', 'transferencia', 'efectivo')),
  mercado_pago_preference_id TEXT,
  mercado_pago_payment_id TEXT,
  mercado_pago_status TEXT DEFAULT 'pending' CHECK (mercado_pago_status IN ('pending', 'approved', 'authorized', 'in_process', 'in_mediation', 'rejected', 'cancelled', 'refunded', 'charged_back')),
  mercado_pago_merchant_order_id TEXT
);

-- ==========================================================================
-- 8. CONFIGURACIÓN TOTAL Y PERSONALIZACIÓN DE TIENDA
-- Guarda el modo oscuro/claro, glassmorphism, Mercado Pago y los 4 Badges
-- ==========================================================================
CREATE TABLE IF NOT EXISTS public.store_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  store_name TEXT DEFAULT 'TuTienda',
  store_tagline TEXT DEFAULT 'SHOWROOM • MODA URBANA',
  theme_mode TEXT DEFAULT 'light' CHECK (theme_mode IN ('light', 'dark', 'auto')),
  enable_glassmorphism BOOLEAN DEFAULT TRUE,
  primary_color TEXT DEFAULT '#000000',
  adbar_color TEXT DEFAULT '#ff0000',
  cuotas_sin_interes INTEGER DEFAULT 6,
  transfer_discount_pct INTEGER DEFAULT 15,
  free_shipping_threshold NUMERIC DEFAULT 150000,
  shipping_costs JSONB DEFAULT '{"correoArgentino": 5400, "andreani": 6800, "showroom": 0}'::jsonb,
  phone_whatsapp TEXT DEFAULT '5492494123456',
  showroom_address TEXT DEFAULT '9 de Julio 837, Ayacucho, Provincia de Buenos Aires',
  bank_transfer_data JSONB DEFAULT '{
    "titular": "TUTIENDA S.R.L.",
    "cuit": "30-71829304-9",
    "banco": "Banco Galicia",
    "cbu": "0070123130004019283741",
    "alias": "TUTIENDA.OFICIAL"
  }'::jsonb,
  active_coupons JSONB DEFAULT '[
    {"code": "TUTIENDA10", "discountPct": 10, "minPurchase": 50000},
    {"code": "BIENVENIDA", "discountPct": 15, "minPurchase": 40000},
    {"code": "HOTDROP", "discountPct": 20, "minPurchase": 80000}
  ]'::jsonb,
  trust_badges JSONB DEFAULT '[
    {
      "id": "badge-1",
      "title": "Envíos a todo el país",
      "subtitle": "Correo Argentino & Andreani. Gratis superando $150.000",
      "icon": "truck"
    },
    {
      "id": "badge-2",
      "title": "Hasta 6 Cuotas Sin Interés",
      "subtitle": "Con todas las tarjetas bancarias mediante Mercado Pago",
      "icon": "credit-card"
    },
    {
      "id": "badge-3",
      "title": "15% OFF Transferencia",
      "subtitle": "Descuento automático pagando por transferencia bancaria",
      "icon": "dollar"
    },
    {
      "id": "badge-4",
      "title": "Showroom en Ayacucho",
      "subtitle": "9 de Julio 837. Retirá tus pedidos online sin costo",
      "icon": "map-pin"
    }
  ]'::jsonb,
  lookbook JSONB DEFAULT '{
    "tag": "Comprá el Outfit",
    "title": "TuTienda Streetwear Lookbook",
    "description": "Diseñamos siluetas amplias, texturas de alto gramaje y calces relajados pensados para el uso diario sin perder la vanguardia.",
    "buttonText": "VER LOOKS COMPLETOS",
    "categoryLink": "pantalones",
    "image": "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop"
  }'::jsonb,
  mercado_pago JSONB DEFAULT '{
    "enabled": true,
    "publicKey": "TEST-xxxx-xxxx-xxxx",
    "accessToken": "TEST-xxxx-xxxx-xxxx",
    "sandboxMode": true
  }'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================================================
-- 9. POLÍTICAS DE SEGURIDAD (RLS - Row Level Security)
-- ==========================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Lectura pública para el Storefront
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public Read Product Sizes" ON public.product_sizes FOR SELECT USING (true);
CREATE POLICY "Public Read Hero Slides" ON public.hero_slides FOR SELECT USING (true);
CREATE POLICY "Public Read Announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Public Read Settings" ON public.store_settings FOR SELECT USING (true);

-- Clientes: Ver y editar su propio perfil
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Clientes: Crear pedidos y ver sus propios pedidos
CREATE POLICY "Public or Users Can Insert Orders" ON public.orders
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Users Can View Own Orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- Administradores: Acceso total a todas las tablas
CREATE POLICY "Admin Full Access Categories" ON public.categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin Full Access Products" ON public.products FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin Full Access Product Sizes" ON public.product_sizes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin Full Access Slides" ON public.hero_slides FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin Full Access Announcements" ON public.announcements FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin Full Access Orders" ON public.orders FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin Full Access Settings" ON public.store_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ==========================================================================
-- 10. SUPABASE STORAGE BUCKETS (Imágenes de Productos y Banners)
-- ==========================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('product-images', 'product-images', true),
  ('banners', 'banners', true),
  ('branding', 'branding', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access Bucket Images" ON storage.objects
  FOR SELECT USING (bucket_id IN ('product-images', 'banners', 'branding'));

CREATE POLICY "Authenticated Upload Bucket Images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id IN ('product-images', 'banners', 'branding'));

-- ==========================================================================
-- 11. DATOS SEMILLA INICIALES (TUTIENDA READY-TO-USE)
-- ==========================================================================

-- Categorías
INSERT INTO public.categories (id, name, slug, count, show_in_nav, badge) VALUES
('cat-1', 'Nuevo Drop 41', 'drop-41', 8, true, 'HOT'),
('cat-2', 'Liquidación!', 'liquidacion', 12, true, 'SALE'),
('cat-3', 'Remeras Oversize', 'remeras', 18, true, null),
('cat-4', 'Hoodies & Buzos', 'hoodies', 14, true, null),
('cat-5', 'Pantalones & Jeans', 'pantalones', 16, true, null),
('cat-6', 'Camperas & Abrigos', 'abrigos', 9, true, null),
('cat-7', 'Accesorios & Gorras', 'accesorios', 11, true, null)
ON CONFLICT (id) DO NOTHING;

-- Barra de Anuncios
INSERT INTO public.announcements (message, sort_order, is_active) VALUES
('HASTA 6 CUOTAS SIN INTERÉS CON TODAS LAS TARJETAS', 1, true),
('15% OFF PAGANDO POR TRANSFERENCIA BANCARIA', 2, true),
('ENVÍOS GRATIS A TODO EL PAÍS SUPERANDO $150.000', 3, true),
('SHOWROOM FÍSICO EN AYACUCHO - 9 DE JULIO 837', 4, true);

-- Hero Slides
INSERT INTO public.hero_slides (id, title, subtitle, button_text, category_link, image, sort_order) VALUES
('slide-1', 'NUEVO DROP 41', 'Oversize street fits de edición limitada', 'VER DROP EXCLUSIVO', 'drop-41', 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070&auto=format&fit=crop', 1),
('slide-2', 'LIQUIDACIÓN DE TEMPORADA', 'Hasta 30% OFF en prendas seleccionadas', 'EXPLORAR SALE', 'liquidacion', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2000&auto=format&fit=crop', 2),
('slide-3', 'STREETWEAR ESENCIAL', 'Calidad pesada 24/1 en siluetas amplias', 'VER TODOS', 'todos', 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2000&auto=format&fit=crop', 3)
ON CONFLICT (id) DO NOTHING;

-- Configuración de Tienda Inicial
INSERT INTO public.store_settings (id, store_name, store_tagline, theme_mode, enable_glassmorphism, primary_color, adbar_color)
VALUES (1, 'TuTienda', 'SHOWROOM • MODA URBANA', 'light', true, '#000000', '#ff0000')
ON CONFLICT (id) DO UPDATE SET
  store_name = EXCLUDED.store_name,
  store_tagline = EXCLUDED.store_tagline;

-- Productos Iniciales
INSERT INTO public.products (id, sku, name, category, category_name, price, compare_price, transfer_discount_pct, tags, is_featured, is_new, is_sale, description, images) VALUES
('prod-001', 'TT-HD-BOX-BK', 'Hoodie Boxy Heavyweight "Noir"', 'hoodies', 'Hoodies & Buzos', 89900, 105000, 15, ARRAY['DROP 41', 'DESTACADO'], true, true, false, 'Buzo hoodie confeccionado en frisa invisible pesada 450gr. Corte boxy fit con hombros caídos y capucha doble capa envolvente sin cordón.', ARRAY['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000&auto=format&fit=crop', 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=1000&auto=format&fit=crop']),
('prod-002', 'TT-CAR-PNT-OV', 'Pantalón Cargo Baggy "Olive Drab"', 'pantalones', 'Pantalones & Jeans', 94500, null, 15, ARRAY['DROP 41', 'MÁS VENDIDO'], true, true, false, 'Pantalón cargo de tiro medio en gabardina esmerilada de 8oz. 6 bolsillos utilitarios con fuelles reforzados y ajustadores elásticos con tanca.', ARRAY['https://images.unsplash.com/photo-1517445312882-bc9910d016b7?q=80&w=1000&auto=format&fit=crop', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=1000&auto=format&fit=crop']),
('prod-003', 'TT-REM-OVS-EC', 'Remera Heavyweight Vintage "Raw Ecru"', 'remeras', 'Remeras Oversize', 48900, 58000, 15, ARRAY['DESTACADO', 'LIQUIDACIÓN!'], true, false, true, 'Remera de cuello cerrado alto en rib de 3cm, corte oversized auténtico con mangas anchas al codo. Tratamiento stonewash con desgaste artesanal.', ARRAY['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1000&auto=format&fit=crop']),
('prod-004', 'TT-CAM-PUFF-BK', 'Campera Puffer Matte Black "Alpine"', 'abrigos', 'Camperas & Abrigos', 185000, null, 15, ARRAY['DROP 41', 'ÚLTIMAS UNIDADES'], true, true, false, 'Campera acolchada de alto rendimiento térmico con terminación mate hidrófuga. Relleno ultraliviano térmico y cuello alto envolvente.', ARRAY['https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=1000&auto=format&fit=crop', 'https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=1000&auto=format&fit=crop'])
ON CONFLICT (id) DO NOTHING;

-- Talles de los productos iniciales
INSERT INTO public.product_sizes (product_id, size, stock) VALUES
('prod-001', 'S', 5), ('prod-001', 'M', 10), ('prod-001', 'L', 7), ('prod-001', 'XL', 3),
('prod-002', 'S', 4), ('prod-002', 'M', 8), ('prod-002', 'L', 6), ('prod-002', 'XL', 2),
('prod-003', 'S', 6), ('prod-003', 'M', 12), ('prod-003', 'L', 9), ('prod-003', 'XL', 4),
('prod-004', 'M', 3), ('prod-004', 'L', 5), ('prod-004', 'XL', 2)
ON CONFLICT (product_id, size) DO NOTHING;
