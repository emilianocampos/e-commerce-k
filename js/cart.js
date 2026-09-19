/* ==========================================================================
   Moscú Showroom - Cart Drawer Logic
   ========================================================================== */

import { store } from './state.js';

export function initCart() {
  const drawer = document.getElementById('cartDrawer');
  const backdrop = document.getElementById('cartBackdrop');
  const closeBtn = document.getElementById('cartCloseBtn');
  const itemsContainer = document.getElementById('cartItemsList');
  const cartCountBadges = document.querySelectorAll('.js-cart-count');
  const couponInput = document.getElementById('cartCouponInput');
  const couponBtn = document.getElementById('cartCouponBtn');
  const couponStatus = document.getElementById('cartCouponStatus');

  // Open Cart
  window.openCart = () => {
    renderCart();
    drawer.classList.add('active');
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  // Close Cart
  window.closeCart = () => {
    drawer.classList.remove('active');
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (closeBtn) closeBtn.addEventListener('click', window.closeCart);
  if (backdrop) backdrop.addEventListener('click', window.closeCart);

  // Cart Triggers
  document.querySelectorAll('.js-open-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.openCart();
    });
  });

  // Apply Coupon
  if (couponBtn && couponInput) {
    couponBtn.addEventListener('click', () => {
      const code = couponInput.value.trim();
      if (!code) return;
      const res = store.applyCoupon(code);
      if (!res.success) {
        if (couponStatus) {
          couponStatus.innerHTML = `<span style="color:#dc2626;font-size:11px;">${res.message}</span>`;
        }
      } else {
        couponInput.value = '';
        if (couponStatus) couponStatus.innerHTML = '';
        renderCart();
      }
    });
  }

  // Remove Coupon
  window.removeCartCoupon = () => {
    store.removeCoupon();
    renderCart();
  };

  // Listen to State Changes
  store.subscribe((type) => {
    if (type === 'cart' || type === 'all' || type === 'settings') {
      renderCart();
    }
  });

  // Initial Render
  renderCart();
}

export function renderCart() {
  const cart = store.getCart();
  const settings = store.getSettings();
  const itemsContainer = document.getElementById('cartItemsList');
  const footerContainer = document.getElementById('cartFooter');
  const freeShippingBox = document.getElementById('freeShippingBox');
  const cartCountBadges = document.querySelectorAll('.js-cart-count');

  const totalQty = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  cartCountBadges.forEach(badge => {
    badge.textContent = totalQty;
    badge.style.display = totalQty > 0 ? 'flex' : 'none';
  });

  if (!itemsContainer) return;

  if (cart.items.length === 0) {
    itemsContainer.innerHTML = `
      <div class="cart-empty-state">
        <svg class="cart-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
        <h4 class="cart-empty-title">Tu carrito está vacío</h4>
        <p style="font-size: 13px;">Explorá nuestros últimos drops y prendas exclusivas.</p>
        <button class="cart-empty-btn" onclick="window.closeCart()">Ver Productos</button>
      </div>
    `;
    if (freeShippingBox) freeShippingBox.style.display = 'none';
    if (footerContainer) footerContainer.style.display = 'none';
    return;
  }

  // Show Footer & Free Shipping Box
  if (freeShippingBox) freeShippingBox.style.display = 'block';
  if (footerContainer) footerContainer.style.display = 'block';

  // Calculate Subtotal & Shipping Threshold
  const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const threshold = settings.freeShippingThreshold || 150000;
  const freeShippingDif = threshold - subtotal;
  const progressPct = Math.min(100, Math.round((subtotal / threshold) * 100));

  if (freeShippingBox) {
    if (freeShippingDif <= 0) {
      freeShippingBox.innerHTML = `
        <div class="free-shipping-message success">
          <span>¡Genial! Tenés ENVÍO GRATIS</span>
          <span>🚚</span>
        </div>
        <div class="free-shipping-bar-track">
          <div class="free-shipping-bar-fill" style="width: 100%;"></div>
        </div>
      `;
    } else {
      freeShippingBox.innerHTML = `
        <div class="free-shipping-message">
          <span>¡Estás a <strong>$${freeShippingDif.toLocaleString('es-AR')}</strong> de tener ENVÍO GRATIS!</span>
          <span>🚚</span>
        </div>
        <div class="free-shipping-bar-track">
          <div class="free-shipping-bar-fill" style="width: ${progressPct}%;"></div>
        </div>
      `;
    }
  }

  // Render Items List
  itemsContainer.innerHTML = cart.items.map(item => `
    <div class="cart-item-card" data-item-id="${item.id}">
      <img src="${item.image}" alt="${item.name}" class="cart-item-img" />
      <div class="cart-item-info">
        <div class="cart-item-top">
          <span class="cart-item-name">${item.name}</span>
          <button class="cart-item-remove" onclick="window.removeCartItem('${item.id}')" title="Eliminar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
        <span class="cart-item-size">Talle: <strong>${item.size}</strong></span>
        <div class="cart-item-bottom">
          <div class="cart-item-stepper">
            <button class="cart-item-btn" onclick="window.changeCartItemQty('${item.id}', ${item.quantity - 1})">-</button>
            <span class="cart-item-qty">${item.quantity}</span>
            <button class="cart-item-btn" onclick="window.changeCartItemQty('${item.id}', ${item.quantity + 1})">+</button>
          </div>
          <span class="cart-item-price">$${(item.price * item.quantity).toLocaleString('es-AR')}</span>
        </div>
      </div>
    </div>
  `).join('');

  // Calculate Discounts
  let couponDiscount = 0;
  if (cart.coupon) {
    couponDiscount = Math.round(subtotal * (cart.coupon.discountPct / 100));
  }

  const transferDiscountPct = settings.transferDiscountPct || 15;
  const total = subtotal - couponDiscount;
  const transferPrice = Math.round(total * (1 - (transferDiscountPct / 100)));

  // Render Footer Totals
  if (footerContainer) {
    footerContainer.innerHTML = `
      <div class="cart-collapsibles">
        ${cart.coupon ? `
          <div class="applied-coupon-pill">
            <span>Cupón: <strong>${cart.coupon.code}</strong> (${cart.coupon.discountPct}% OFF)</span>
            <button onclick="window.removeCartCoupon()" style="background:none;border:none;cursor:pointer;color:#166534;font-weight:700;">×</button>
          </div>
        ` : `
          <div class="cart-coupon-form">
            <input type="text" id="cartCouponInput" class="cart-coupon-input" placeholder="CUPÓN DE DESCUENTO" />
            <button id="cartCouponBtn" class="cart-coupon-btn">APLICAR</button>
          </div>
          <div id="cartCouponStatus"></div>
        `}
      </div>

      <div class="cart-totals-breakdown">
        <div class="cart-total-row">
          <span>Subtotal:</span>
          <span>$${subtotal.toLocaleString('es-AR')}</span>
        </div>
        ${couponDiscount > 0 ? `
          <div class="cart-total-row" style="color: #15803d; font-weight: 600;">
            <span>Descuento cupón:</span>
            <span>-$${couponDiscount.toLocaleString('es-AR')}</span>
          </div>
        ` : ''}
        <div class="cart-total-row final">
          <span>Total:</span>
          <span>$${total.toLocaleString('es-AR')}</span>
        </div>
        <div class="cart-transfer-badge">
          O <strong>$${transferPrice.toLocaleString('es-AR')}</strong> pagando por Transferencia (${transferDiscountPct}% OFF)
        </div>
      </div>

      <button class="btn-checkout-start" onclick="window.startCheckout()">
        <span>INICIAR COMPRA</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </button>
    `;

    // Re-bind coupon button after re-render
    const reCouponBtn = document.getElementById('cartCouponBtn');
    const reCouponInput = document.getElementById('cartCouponInput');
    const reCouponStatus = document.getElementById('cartCouponStatus');
    if (reCouponBtn && reCouponInput) {
      reCouponBtn.addEventListener('click', () => {
        const code = reCouponInput.value.trim();
        if (!code) return;
        const res = store.applyCoupon(code);
        if (!res.success) {
          if (reCouponStatus) {
            reCouponStatus.innerHTML = `<span style="color:#dc2626;font-size:11px;display:block;margin-top:4px;">${res.message}</span>`;
          }
        } else {
          renderCart();
        }
      });
    }
  }
}

// Global window helpers for inline HTML event handlers
window.changeCartItemQty = (id, qty) => {
  store.updateCartItemQty(id, qty);
};

window.removeCartItem = (id) => {
  store.removeFromCart(id);
};
