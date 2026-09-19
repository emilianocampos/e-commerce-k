/* ==========================================================================
   Moscú Showroom - Product Detail Page & Modal Logic
   ========================================================================== */

import { store } from './state.js';

let activeProduct = null;
let selectedSize = null;
let currentQty = 1;

export function initProductDetail() {
  const modal = document.getElementById('pdpModal');
  const closeBtn = document.getElementById('pdpCloseBtn');

  window.openProductDetail = (productId) => {
    const product = store.getProductById(productId);
    if (!product) return;

    activeProduct = product;
    currentQty = 1;
    // Default to first available size
    const availableSize = product.sizes.find(s => s.stock > 0);
    selectedSize = availableSize ? availableSize.size : (product.sizes[0] ? product.sizes[0].size : 'Único');

    renderProductModal();

    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeProductDetail = () => {
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  if (closeBtn) closeBtn.addEventListener('click', window.closeProductDetail);

  // Close when clicking overlay backdrop
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) window.closeProductDetail();
    });
  }

  // Size Guide Modal Events
  const sizeGuideModal = document.getElementById('sizeGuideModal');
  const sizeGuideClose = document.getElementById('sizeGuideClose');
  window.openSizeGuide = () => {
    if (sizeGuideModal) sizeGuideModal.classList.add('active');
  };
  window.closeSizeGuide = () => {
    if (sizeGuideModal) sizeGuideModal.classList.remove('active');
  };
  if (sizeGuideClose) sizeGuideClose.addEventListener('click', window.closeSizeGuide);
}

function renderProductModal() {
  const container = document.getElementById('pdpModalContent');
  if (!container || !activeProduct) return;

  const settings = store.getSettings();
  const transferDiscount = activeProduct.transferDiscountPct || settings.transferDiscountPct || 15;
  const transferPrice = Math.round(activeProduct.price * (1 - (transferDiscount / 100)));
  const installmentVal = Math.round(activeProduct.price / 6);

  container.innerHTML = `
    <div class="pdp-grid">
      <!-- Gallery Column -->
      <div class="pdp-gallery">
        <div class="pdp-thumbnails">
          ${activeProduct.images.map((img, idx) => `
            <img src="${img}" alt="${activeProduct.name}" class="pdp-thumb-img ${idx === 0 ? 'active' : ''}" onclick="window.switchPdpMainImage('${img}', this)" />
          `).join('')}
        </div>
        <div class="pdp-main-image-wrap">
          <img id="pdpMainImg" src="${activeProduct.images[0]}" alt="${activeProduct.name}" class="pdp-main-img" />
        </div>
      </div>

      <!-- Info Column -->
      <div class="pdp-details">
        <div class="pdp-breadcrumbs">
          <a href="#" onclick="window.closeProductDetail();">Inicio</a>
          <span>/</span>
          <a href="#" onclick="window.filterByCategory('${activeProduct.category}'); window.closeProductDetail();">${activeProduct.categoryName}</a>
          <span>/</span>
          <span>${activeProduct.name}</span>
        </div>

        <h1 class="pdp-title">${activeProduct.name}</h1>
        <div class="pdp-sku-line">SKU: ${activeProduct.sku || 'MSC-001'}</div>

        <div class="pdp-pricing-box">
          <div class="pdp-price-row">
            <span class="pdp-price-current">$${activeProduct.price.toLocaleString('es-AR')}</span>
            ${activeProduct.comparePrice ? `
              <span class="pdp-price-compare">$${activeProduct.comparePrice.toLocaleString('es-AR')}</span>
            ` : ''}
          </div>
          <div class="pdp-transfer-discount">
            <span>💵 $${transferPrice.toLocaleString('es-AR')} con Transferencia (${transferDiscount}% OFF)</span>
          </div>
          <div class="pdp-installments-line">
            <span>💳 Hasta <strong>6 cuotas sin interés</strong> de $${installmentVal.toLocaleString('es-AR')}</span>
            <a onclick="window.openPaymentMethodsModal()">Ver medios de pago</a>
          </div>
        </div>

        <!-- Size Selection -->
        <div class="pdp-variant-section">
          <div class="pdp-size-header">
            <span class="pdp-size-label">Talle seleccionado: <strong>${selectedSize}</strong></span>
            <button type="button" class="pdp-size-guide-btn" onclick="window.openSizeGuide()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.3 15.3l-8.6-8.6a1 1 0 0 0-1.4 0l-8.6 8.6a1 1 0 0 0 0 1.4l2.6 2.6a1 1 0 0 0 1.4 0l7.9-7.9 7.9 7.9a1 1 0 0 0 1.4 0l2.6-2.6a1 1 0 0 0 0-1.4z"></path></svg>
              <span>Guía de Talles</span>
            </button>
          </div>
          <div class="pdp-size-options">
            ${activeProduct.sizes.map(s => `
              <button 
                type="button" 
                class="pdp-size-pill ${s.size === selectedSize ? 'selected' : ''} ${s.stock <= 0 ? 'out-of-stock' : ''}" 
                onclick="window.selectPdpSize('${s.size}')"
                ${s.stock <= 0 ? 'title="Agotado"' : ''}
              >
                ${s.size}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Actions Row -->
        <div class="pdp-actions-row">
          <div class="pdp-qty-stepper">
            <button type="button" class="pdp-qty-btn" onclick="window.changePdpQty(-1)">-</button>
            <input type="text" class="pdp-qty-input" id="pdpQtyInput" value="1" readonly />
            <button type="button" class="pdp-qty-btn" onclick="window.changePdpQty(1)">+</button>
          </div>
          <button type="button" id="pdpAddBtn" class="pdp-btn-add" onclick="window.addPdpToCart()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            <span>AGREGAR AL CARRITO</span>
          </button>
        </div>

        <button type="button" class="pdp-btn-buy-now" onclick="window.buyPdpNow()">
          COMPRAR AHORA
        </button>

        <!-- Shipping Calculator Box -->
        <div class="pdp-shipping-calculator">
          <div class="shipping-calc-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
            <span>Medios de Envío</span>
          </div>
          <div class="shipping-calc-form">
            <input type="text" id="pdpZipInput" class="shipping-calc-input" placeholder="Tu Código Postal (ej: 7150)" />
            <button type="button" class="shipping-calc-btn" onclick="window.calculatePdpShipping()">CALCULAR</button>
          </div>
          <div id="pdpShippingResults" class="shipping-calc-results"></div>
        </div>

        <!-- Accordions -->
        <div class="pdp-accordions">
          <div class="pdp-accordion-item active">
            <button type="button" class="pdp-accordion-header" onclick="this.parentElement.classList.toggle('active')">
              <span>Detalles y Composición</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
            <div class="pdp-accordion-body">
              <p style="margin-bottom: 8px;">${activeProduct.description}</p>
              ${activeProduct.specs ? `
                <ul style="padding-left: 18px; margin-top: 6px; list-style: disc;">
                  <li><strong>Composición:</strong> ${activeProduct.specs.composicion || '100% Algodón'}</li>
                  <li><strong>Corte:</strong> ${activeProduct.specs.corte || 'Oversize Fit'}</li>
                  <li><strong>Cuidados:</strong> ${activeProduct.specs.cuidados || 'Lavar en frío'}</li>
                </ul>
              ` : ''}
            </div>
          </div>

          <div class="pdp-accordion-item">
            <button type="button" class="pdp-accordion-header" onclick="this.parentElement.classList.toggle('active')">
              <span>Cambios y Devoluciones</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
            <div class="pdp-accordion-body">
              Los cambios se pueden realizar dentro de los 30 días posteriores a la recepción de la prenda. Podés gestionarlo directamente por WhatsApp o presencialmente en nuestro Showroom de Ayacucho. Las prendas deben encontrarse en perfecto estado con sus etiquetas correspondientes.
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

window.switchPdpMainImage = (src, el) => {
  const mainImg = document.getElementById('pdpMainImg');
  if (mainImg) mainImg.src = src;
  document.querySelectorAll('.pdp-thumb-img').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');
};

window.selectPdpSize = (size) => {
  selectedSize = size;
  renderProductModal();
};

window.changePdpQty = (delta) => {
  currentQty = Math.max(1, currentQty + delta);
  const input = document.getElementById('pdpQtyInput');
  if (input) input.value = currentQty;
};

window.addPdpToCart = () => {
  if (!activeProduct || !selectedSize) return;

  const btn = document.getElementById('pdpAddBtn');
  if (btn) {
    btn.classList.add('loading');
    btn.innerHTML = '<span>Agregando...</span>';
  }

  setTimeout(() => {
    store.addToCart(activeProduct, selectedSize, currentQty);
    if (btn) {
      btn.classList.remove('loading');
      btn.classList.add('success');
      btn.innerHTML = '<span>¡Agregado!</span>';
    }

    setTimeout(() => {
      window.closeProductDetail();
      window.openCart();
    }, 400);
  }, 350);
};

window.buyPdpNow = () => {
  if (!activeProduct || !selectedSize) return;
  store.addToCart(activeProduct, selectedSize, currentQty);
  window.closeProductDetail();
  window.startCheckout();
};

window.calculatePdpShipping = () => {
  const zip = document.getElementById('pdpZipInput').value.trim();
  const resBox = document.getElementById('pdpShippingResults');
  if (!zip) return;

  const settings = store.getSettings();
  const isFree = activeProduct && activeProduct.price >= (settings.freeShippingThreshold || 150000);

  resBox.style.display = 'flex';
  resBox.innerHTML = `
    <div class="shipping-result-item">
      <div>
        <strong>Correo Argentino a Domicilio</strong>
        <div style="font-size:11px;color:#6b7280;">Llega en 3-5 días hábiles</div>
      </div>
      <span>${isFree ? '<strong>¡GRATIS!</strong>' : '$' + (settings.shippingCosts.correoArgentino || 5400).toLocaleString('es-AR')}</span>
    </div>
    <div class="shipping-result-item">
      <div>
        <strong>Andreani Prioritario</strong>
        <div style="font-size:11px;color:#6b7280;">Llega en 24-72hs hábiles</div>
      </div>
      <span>${isFree ? '<strong>¡GRATIS!</strong>' : '$' + (settings.shippingCosts.andreani || 6800).toLocaleString('es-AR')}</span>
    </div>
    <div class="shipping-result-item">
      <div>
        <strong>Retiro en Showroom Ayacucho</strong>
        <div style="font-size:11px;color:#6b7280;">9 de Julio 837 (Listo en 24hs)</div>
      </div>
      <span style="color:#15803d;font-weight:700;">¡GRATIS!</span>
    </div>
  `;
};

window.openPaymentMethodsModal = () => {
  alert(
    `Medios de pago disponibles en Moscú Showroom:\n\n` +
    `• 15% OFF abonando por Transferencia Bancaria o Efectivo.\n` +
    `• Hasta 6 cuotas SIN INTERÉS con todas las tarjetas de crédito bancarias mediante Mercado Pago.\n` +
    `• Tarjetas de Débito (Visa Débito, Maestro, Cabal).`
  );
};
