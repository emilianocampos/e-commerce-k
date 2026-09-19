/* ==========================================================================
   Moscú Showroom - Storefront Rendering & Interactions
   ========================================================================== */

import { store } from './state.js';

let activeHeroIndex = 0;
let heroTimer = null;
let currentFilter = 'todos';

export function initStorefront() {
  renderAnnouncements();
  renderNavCategories();
  renderHeroSlider();
  renderCategoryCards();
  renderProductSections();
  initSearchSuggest();
  initHeroControls();

  // Listen to State Changes
  store.subscribe((type) => {
    if (type === 'products' || type === 'all') {
      renderProductSections();
    }
    if (type === 'categories' || type === 'all') {
      renderNavCategories();
      renderCategoryCards();
    }
    if (type === 'slides' || type === 'all') {
      renderHeroSlider();
    }
    if (type === 'announcements' || type === 'all') {
      renderAnnouncements();
    }
  });
}

// 1. Announcements Ticker
export function renderAnnouncements() {
  const container = document.getElementById('adbarTicker');
  if (!container) return;

  const announcements = store.getAnnouncements();
  // Duplicate array so marquee loops seamlessly
  const items = [...announcements, ...announcements, ...announcements];

  container.innerHTML = items.map(msg => `
    <span class="adbar-item">${msg}</span>
  `).join('');
}

// 2. Desktop & Mobile Navigation Categories
export function renderNavCategories() {
  const navContainer = document.getElementById('navCategoriesDropdown');
  const mobileNavMenu = document.getElementById('mobileNavCategories');
  const categories = store.getCategories();

  if (navContainer) {
    navContainer.innerHTML = categories.map(cat => `
      <a href="#" class="dropdown-item-link" onclick="window.filterByCategory('${cat.slug}')">
        <span>${cat.name}</span>
        ${cat.badge ? `<span class="dropdown-item-badge">${cat.badge}</span>` : ''}
      </a>
    `).join('');
  }

  if (mobileNavMenu) {
    mobileNavMenu.innerHTML = categories.map(cat => `
      <li style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
        <a href="#" style="font-weight:700; text-transform:uppercase; display:flex; justify-content:space-between;" onclick="window.filterByCategory('${cat.slug}'); window.closeMobileMenu();">
          <span>${cat.name}</span>
          ${cat.badge ? `<span class="badge-tag sale" style="font-size:8px;">${cat.badge}</span>` : ''}
        </a>
      </li>
    `).join('');
  }
}

// 3. Hero Slider
export function renderHeroSlider() {
  const sliderContainer = document.getElementById('heroSlider');
  const bulletsContainer = document.getElementById('heroBullets');
  if (!sliderContainer) return;

  const slides = store.getHeroSlides();
  sliderContainer.innerHTML = slides.map((slide, idx) => `
    <div class="hero-slide ${idx === activeHeroIndex ? 'active' : ''}">
      <img src="${slide.image}" alt="${slide.title}" class="hero-slide-bg" />
      <div class="hero-slide-overlay">
        <div class="hero-slide-content">
          <h2 class="hero-slide-title">${slide.title}</h2>
          <p class="hero-slide-subtitle">${slide.subtitle}</p>
          <button class="hero-cta-btn" onclick="window.filterByCategory('${slide.categoryLink}')">
            <span>${slide.buttonText}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  if (bulletsContainer) {
    bulletsContainer.innerHTML = slides.map((_, idx) => `
      <button class="hero-bullet ${idx === activeHeroIndex ? 'active' : ''}" onclick="window.goToHeroSlide(${idx})"></button>
    `).join('');
  }

  startHeroAutoplay(slides.length);
}

function startHeroAutoplay(totalSlides) {
  if (heroTimer) clearInterval(heroTimer);
  heroTimer = setInterval(() => {
    activeHeroIndex = (activeHeroIndex + 1) % totalSlides;
    updateHeroSlideVisual();
  }, 6000);
}

function updateHeroSlideVisual() {
  const slides = document.querySelectorAll('.hero-slide');
  const bullets = document.querySelectorAll('.hero-bullet');

  slides.forEach((s, idx) => {
    s.classList.toggle('active', idx === activeHeroIndex);
  });
  bullets.forEach((b, idx) => {
    b.classList.toggle('active', idx === activeHeroIndex);
  });
}

function initHeroControls() {
  window.goToHeroSlide = (idx) => {
    activeHeroIndex = idx;
    updateHeroSlideVisual();
  };

  window.prevHeroSlide = () => {
    const slides = store.getHeroSlides();
    activeHeroIndex = (activeHeroIndex - 1 + slides.length) % slides.length;
    updateHeroSlideVisual();
  };

  window.nextHeroSlide = () => {
    const slides = store.getHeroSlides();
    activeHeroIndex = (activeHeroIndex + 1) % slides.length;
    updateHeroSlideVisual();
  };
}

// 4. Category Visual Cards
export function renderCategoryCards() {
  const container = document.getElementById('categoriesVisualGrid');
  if (!container) return;

  const visualCategories = [
    {
      name: 'PANTALONES & CARGOS',
      slug: 'pantalones',
      image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=700&auto=format&fit=crop'
    },
    {
      name: 'HOODIES & BUZOS',
      slug: 'hoodies',
      image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=700&auto=format&fit=crop'
    },
    {
      name: 'REMERAS OVERSIZE',
      slug: 'remeras',
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=700&auto=format&fit=crop'
    },
    {
      name: 'LIQUIDACIÓN ORIGINALS',
      slug: 'liquidacion',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=700&auto=format&fit=crop'
    }
  ];

  container.innerHTML = visualCategories.map(cat => `
    <a href="#" class="cat-visual-card" onclick="window.filterByCategory('${cat.slug}')">
      <img src="${cat.image}" alt="${cat.name}" class="cat-visual-img" />
      <div class="cat-visual-overlay">
        <h3 class="cat-visual-name">${cat.name}</h3>
        <span class="cat-visual-action">VER COLECCIÓN →</span>
      </div>
    </a>
  `).join('');
}

// 5. Product Sections Grid (NUEVO DROP, LIQUIDACIÓN, MÁS VENDIDOS)
export function renderProductSections() {
  const newDropGrid = document.getElementById('gridNuevoDrop');
  const liquidacionGrid = document.getElementById('gridLiquidacion');
  const allProductsGrid = document.getElementById('gridAllProducts');
  const activeCategoryTitle = document.getElementById('activeCategoryTitle');

  const products = store.getProducts();
  const settings = store.getSettings();

  // Filter if user clicked category
  let displayProducts = products;
  if (currentFilter && currentFilter !== 'todos') {
    displayProducts = products.filter(p => p.category === currentFilter);
    if (activeCategoryTitle) {
      activeCategoryTitle.textContent = `COLECCIÓN: ${currentFilter.toUpperCase()}`;
    }
  } else if (activeCategoryTitle) {
    activeCategoryTitle.textContent = 'TODOS LOS PRODUCTOS';
  }

  // Section 1: Nuevo Drop
  if (newDropGrid) {
    const newItems = products.filter(p => p.isNew || p.tags.includes('DROP 41') || p.tags.includes('NUEVO DROP')).slice(0, 4);
    newDropGrid.innerHTML = newItems.map(p => renderProductCard(p, settings)).join('');
  }

  // Section 2: Liquidación
  if (liquidacionGrid) {
    const saleItems = products.filter(p => p.isSale || p.category === 'liquidacion' || p.comparePrice).slice(0, 4);
    liquidacionGrid.innerHTML = saleItems.map(p => renderProductCard(p, settings)).join('');
  }

  // Section 3: All or Filtered Products Grid
  if (allProductsGrid) {
    allProductsGrid.innerHTML = displayProducts.map(p => renderProductCard(p, settings)).join('');
  }
}

function renderProductCard(product, settings) {
  const transferDiscount = product.transferDiscountPct || settings.transferDiscountPct || 15;
  const transferPrice = Math.round(product.price * (1 - (transferDiscount / 100)));
  const installmentVal = Math.round(product.price / 6);
  const primaryImg = product.images[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop';
  const secondaryImg = product.images[1] || primaryImg;

  // Selected size defaults to first with stock
  const availableSize = product.sizes.find(s => s.stock > 0);
  const defaultSize = availableSize ? availableSize.size : (product.sizes[0] ? product.sizes[0].size : 'Único');

  return `
    <div class="product-card" id="card-${product.id}" data-selected-size="${defaultSize}">
      <div class="product-image-box" onclick="window.openProductDetail('${product.id}')">
        <div class="product-badges">
          ${product.tags.map(tag => `
            <span class="badge-tag ${tag.includes('LIQUID') ? 'sale' : tag.includes('DROP') ? 'new' : 'hot'}">
              ${tag}
            </span>
          `).join('')}
        </div>
        <img src="${primaryImg}" alt="${product.name}" class="product-img-primary" loading="lazy" />
        <img src="${secondaryImg}" alt="${product.name}" class="product-img-secondary" loading="lazy" />
      </div>

      <div class="product-info-box">
        <span class="product-category-label">${product.categoryName}</span>
        <h3 class="product-title" onclick="window.openProductDetail('${product.id}')">${product.name}</h3>

        <div class="product-pricing">
          <div class="price-row">
            <span class="product-price-regular">$${product.price.toLocaleString('es-AR')}</span>
            ${product.comparePrice ? `
              <span class="product-price-compare">$${product.comparePrice.toLocaleString('es-AR')}</span>
            ` : ''}
          </div>
          <div class="product-price-transfer">
            💵 $${transferPrice.toLocaleString('es-AR')} (${transferDiscount}% OFF con Transferencia)
          </div>
          <div class="product-installments">
            💳 6 cuotas sin interés de <strong>$${installmentVal.toLocaleString('es-AR')}</strong>
          </div>
        </div>

        <!-- Size Chips -->
        <div class="product-size-chips">
          ${product.sizes.map(s => `
            <button 
              type="button" 
              class="size-chip ${s.size === defaultSize ? 'selected' : ''} ${s.stock <= 0 ? 'disabled' : ''}" 
              onclick="window.selectCardSize('${product.id}', '${s.size}', this)"
              ${s.stock <= 0 ? 'disabled' : ''}
            >
              ${s.size}
            </button>
          `).join('')}
        </div>

        <button 
          type="button" 
          id="btn-add-${product.id}" 
          class="btn-quick-add" 
          onclick="window.quickAddToCart('${product.id}')"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
          <span>AGREGAR AL CARRITO</span>
        </button>
      </div>
    </div>
  `;
}

// Global Handlers
window.filterByCategory = (slug) => {
  currentFilter = slug;
  renderProductSections();
  const targetSection = document.getElementById('sectionAllProducts');
  if (targetSection) {
    targetSection.scrollIntoView({ behavior: 'smooth' });
  }
};

window.selectCardSize = (productId, size, btnEl) => {
  const card = document.getElementById(`card-${productId}`);
  if (card) {
    card.setAttribute('data-selected-size', size);
    card.querySelectorAll('.size-chip').forEach(c => c.classList.remove('selected'));
    btnEl.classList.add('selected');
  }
};

window.quickAddToCart = (productId) => {
  const card = document.getElementById(`card-${productId}`);
  const product = store.getProductById(productId);
  if (!card || !product) return;

  const size = card.getAttribute('data-selected-size') || (product.sizes[0] ? product.sizes[0].size : 'Único');
  const btn = document.getElementById(`btn-add-${productId}`);

  if (btn) {
    btn.innerHTML = '<span>Agregando...</span>';
    btn.classList.add('added');
  }

  setTimeout(() => {
    store.addToCart(product, size, 1);
    if (btn) {
      btn.innerHTML = '<span>¡Listo!</span>';
    }
    setTimeout(() => {
      if (btn) {
        btn.classList.remove('added');
        btn.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
          <span>AGREGAR AL CARRITO</span>
        `;
      }
      window.openCart();
    }, 450);
  }, 300);
};

// 6. Search Suggest Box
function initSearchSuggest() {
  const input = document.getElementById('headerSearchInput');
  const suggestBox = document.getElementById('searchSuggestBox');
  if (!input || !suggestBox) return;

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) {
      suggestBox.classList.remove('active');
      return;
    }

    const products = store.getProducts();
    const matches = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.categoryName.toLowerCase().includes(q) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
    ).slice(0, 5);

    if (matches.length === 0) {
      suggestBox.innerHTML = `
        <div style="padding: 14px; text-align: center; font-size: 12px; color: #6b7280;">
          No encontramos productos para "${q}"
        </div>
      `;
      suggestBox.classList.add('active');
      return;
    }

    suggestBox.innerHTML = matches.map(p => `
      <div class="search-suggest-item" onclick="window.openProductDetail('${p.id}'); document.getElementById('searchSuggestBox').classList.remove('active');">
        <img src="${p.images[0]}" alt="${p.name}" class="search-suggest-thumb" />
        <div class="search-suggest-info">
          <h4>${p.name}</h4>
          <span>$${p.price.toLocaleString('es-AR')} • ${p.categoryName}</span>
        </div>
      </div>
    `).join('');
    suggestBox.classList.add('active');
  });

  // Hide suggest on outside click
  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !suggestBox.contains(e.target)) {
      suggestBox.classList.remove('active');
    }
  });
}
