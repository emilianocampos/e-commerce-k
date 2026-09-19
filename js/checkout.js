/* ==========================================================================
   Moscú Showroom - 3-Step Checkout & WhatsApp Confirmation Logic
   ========================================================================== */

import { store } from './state.js';

let currentStep = 1;
let checkoutData = {
  customer: {
    email: '',
    name: '',
    phone: '',
    dni: '',
    address: {
      street: '',
      number: '',
      floor: '',
      city: '',
      province: 'Buenos Aires',
      postalCode: ''
    }
  },
  shipping: {
    method: 'correo',
    name: 'Correo Argentino a Domicilio',
    cost: 5400
  },
  payment: {
    method: 'transferencia',
    name: 'Transferencia Bancaria (15% OFF)',
    discountPct: 15
  },
  items: [],
  subtotal: 0,
  discount: 0,
  shippingCost: 0,
  total: 0
};

export function initCheckout() {
  const modal = document.getElementById('checkoutModal');
  const closeBtn = document.getElementById('checkoutCloseBtn');

  window.startCheckout = () => {
    const cart = store.getCart();
    if (cart.items.length === 0) {
      alert('Tu carrito está vacío.');
      return;
    }

    if (window.closeCart) window.closeCart();

    currentStep = 1;
    updateCheckoutCalculations();
    renderCheckoutStep(1);

    if (modal) modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.closeCheckout = () => {
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (closeBtn) closeBtn.addEventListener('click', window.closeCheckout);
}

function updateCheckoutCalculations() {
  const cart = store.getCart();
  const settings = store.getSettings();

  checkoutData.items = [...cart.items];
  checkoutData.subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Check Free shipping threshold
  const threshold = settings.freeShippingThreshold || 150000;
  if (checkoutData.subtotal >= threshold) {
    checkoutData.shipping.cost = 0;
    checkoutData.shipping.name = `${checkoutData.shipping.name} (¡Envío Gratis!)`;
  } else {
    if (checkoutData.shipping.method === 'correo') {
      checkoutData.shipping.cost = settings.shippingCosts.correoArgentino || 5400;
      checkoutData.shipping.name = 'Correo Argentino a Domicilio';
    } else if (checkoutData.shipping.method === 'andreani') {
      checkoutData.shipping.cost = settings.shippingCosts.andreani || 6800;
      checkoutData.shipping.name = 'Andreani Prioritario';
    } else {
      checkoutData.shipping.cost = 0;
      checkoutData.shipping.name = 'Retiro en Showroom Ayacucho (Gratis)';
    }
  }

  // Coupon discount
  let couponDiscount = 0;
  if (cart.coupon) {
    couponDiscount = Math.round(checkoutData.subtotal * (cart.coupon.discountPct / 100));
  }

  // Transfer discount
  let paymentDiscount = 0;
  if (checkoutData.payment.method === 'transferencia') {
    const transferPct = settings.transferDiscountPct || 15;
    paymentDiscount = Math.round((checkoutData.subtotal - couponDiscount) * (transferPct / 100));
  }

  checkoutData.discount = couponDiscount + paymentDiscount;
  checkoutData.shippingCost = checkoutData.shipping.cost;
  checkoutData.total = (checkoutData.subtotal - checkoutData.discount) + checkoutData.shippingCost;
}

export function renderCheckoutStep(step) {
  currentStep = step;
  const container = document.getElementById('checkoutStepContent');
  const summaryContainer = document.getElementById('checkoutSummaryBox');
  const stepTabs = document.querySelectorAll('.checkout-step-tab');

  // Update tabs visual state
  stepTabs.forEach(tab => {
    const tabStep = Number(tab.getAttribute('data-step'));
    tab.classList.remove('active', 'completed');
    if (tabStep === step) tab.classList.add('active');
    else if (tabStep < step) tab.classList.add('completed');
  });

  updateCheckoutCalculations();

  // Render Summary Side
  if (summaryContainer) {
    summaryContainer.innerHTML = `
      <h4 class="checkout-summary-title">Resumen de Compra</h4>
      <div class="checkout-summary-items">
        ${checkoutData.items.map(item => `
          <div class="checkout-summary-item">
            <div>
              <strong>${item.name}</strong>
              <div style="font-size: 11px; color: #6b7280;">Talle: ${item.size} × ${item.quantity}</div>
            </div>
            <span>$${(item.price * item.quantity).toLocaleString('es-AR')}</span>
          </div>
        `).join('')}
      </div>
      <div style="display: flex; flex-direction: column; gap: 6px; font-size: 13px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
        <div style="display:flex; justify-content:space-between; color:#64748b;">
          <span>Subtotal:</span>
          <span>$${checkoutData.subtotal.toLocaleString('es-AR')}</span>
        </div>
        ${checkoutData.discount > 0 ? `
          <div style="display:flex; justify-content:space-between; color:#15803d; font-weight:600;">
            <span>Descuentos aplicados:</span>
            <span>-$${checkoutData.discount.toLocaleString('es-AR')}</span>
          </div>
        ` : ''}
        <div style="display:flex; justify-content:space-between; color:#64748b;">
          <span>Envío:</span>
          <span>${checkoutData.shippingCost === 0 ? '<strong style="color:#15803d">¡GRATIS!</strong>' : '$' + checkoutData.shippingCost.toLocaleString('es-AR')}</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-size: 18px; font-weight: 800; color: #000000; border-top: 1px solid #e2e8f0; padding-top: 8px; margin-top: 4px;">
          <span>Total a Pagar:</span>
          <span>$${checkoutData.total.toLocaleString('es-AR')}</span>
        </div>
      </div>
    `;
  }

  if (!container) return;

  // STEP 1: Contacto y Tipo de Envío
  if (step === 1) {
    container.innerHTML = `
      <div class="checkout-step-content active">
        <h3 style="font-family: var(--heading-font); font-size: 20px; font-weight: 700; margin-bottom: 18px;">
          1. Datos de Contacto y Entrega
        </h3>
        <div class="form-field-group">
          <label class="form-label">Correo Electrónico *</label>
          <input type="email" id="chkEmail" class="form-input" placeholder="ejemplo@gmail.com" value="${checkoutData.customer.email}" required />
        </div>
        <div class="form-row-2">
          <div class="form-field-group">
            <label class="form-label">Nombre y Apellido *</label>
            <input type="text" id="chkName" class="form-input" placeholder="Juan Pérez" value="${checkoutData.customer.name}" required />
          </div>
          <div class="form-field-group">
            <label class="form-label">Teléfono / WhatsApp *</label>
            <input type="tel" id="chkPhone" class="form-input" placeholder="11 5829-4100" value="${checkoutData.customer.phone}" required />
          </div>
        </div>

        <div style="margin-top: 20px;">
          <label class="form-label">Seleccioná cómo querés recibir tu compra:</label>
          <div class="shipping-options-list">
            <div class="option-radio-card ${checkoutData.shipping.method === 'correo' ? 'selected' : ''}" onclick="window.selectShippingOption('correo')">
              <div class="option-radio-left">
                <input type="radio" name="shippingOpt" ${checkoutData.shipping.method === 'correo' ? 'checked' : ''} />
                <div>
                  <div class="option-radio-title">Correo Argentino a Domicilio</div>
                  <div class="option-radio-desc">Entrega en 3 a 5 días hábiles a todo el país</div>
                </div>
              </div>
              <span class="option-radio-price">${checkoutData.subtotal >= 150000 ? 'GRATIS' : '$5.400'}</span>
            </div>

            <div class="option-radio-card ${checkoutData.shipping.method === 'andreani' ? 'selected' : ''}" onclick="window.selectShippingOption('andreani')">
              <div class="option-radio-left">
                <input type="radio" name="shippingOpt" ${checkoutData.shipping.method === 'andreani' ? 'checked' : ''} />
                <div>
                  <div class="option-radio-title">Andreani Prioritario</div>
                  <div class="option-radio-desc">Entrega express en 24-72hs con seguimiento en vivo</div>
                </div>
              </div>
              <span class="option-radio-price">${checkoutData.subtotal >= 150000 ? 'GRATIS' : '$6.800'}</span>
            </div>

            <div class="option-radio-card ${checkoutData.shipping.method === 'showroom' ? 'selected' : ''}" onclick="window.selectShippingOption('showroom')">
              <div class="option-radio-left">
                <input type="radio" name="shippingOpt" ${checkoutData.shipping.method === 'showroom' ? 'checked' : ''} />
                <div>
                  <div class="option-radio-title">Retiro en Showroom Ayacucho</div>
                  <div class="option-radio-desc">9 de Julio 837, Ayacucho (Listo en 24hs)</div>
                </div>
              </div>
              <span class="option-radio-price" style="color:#15803d">¡GRATIS!</span>
            </div>
          </div>
        </div>

        <button class="checkout-btn-next" onclick="window.submitStep1()">
          <span>Continuar a Dirección</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </button>
      </div>
    `;
  }

  // STEP 2: Dirección de Envío
  else if (step === 2) {
    container.innerHTML = `
      <div class="checkout-step-content active">
        <h3 style="font-family: var(--heading-font); font-size: 20px; font-weight: 700; margin-bottom: 18px;">
          2. Dirección de Envío
        </h3>

        ${checkoutData.shipping.method === 'showroom' ? `
          <div class="bank-transfer-details-box" style="background:#eff6ff;border-color:#bfdbfe;color:#1e40af;margin-bottom:20px;">
            <strong>Punto de Retiro Seleccionado:</strong><br/>
            Showroom Oficial Moscú — 9 de Julio 837, Ayacucho, Prov. de Buenos Aires.<br/>
            Horarios de retiro: Lunes a Sábados de 10:00 a 13:00 y de 16:30 a 20:30 hs.
          </div>
        ` : `
          <div class="form-row-2">
            <div class="form-field-group">
              <label class="form-label">Calle *</label>
              <input type="text" id="chkStreet" class="form-input" placeholder="Av. San Martín" value="${checkoutData.customer.address.street}" required />
            </div>
            <div class="form-field-group">
              <label class="form-label">Número *</label>
              <input type="text" id="chkNumber" class="form-input" placeholder="1420" value="${checkoutData.customer.address.number}" required />
            </div>
          </div>
          <div class="form-row-2">
            <div class="form-field-group">
              <label class="form-label">Piso / Depto (Opcional)</label>
              <input type="text" id="chkFloor" class="form-input" placeholder="Piso 4 Depto B" value="${checkoutData.customer.address.floor}" />
            </div>
            <div class="form-field-group">
              <label class="form-label">Código Postal *</label>
              <input type="text" id="chkPostal" class="form-input" placeholder="7150" value="${checkoutData.customer.address.postalCode}" required />
            </div>
          </div>
          <div class="form-row-2">
            <div class="form-field-group">
              <label class="form-label">Ciudad *</label>
              <input type="text" id="chkCity" class="form-input" placeholder="Ayacucho" value="${checkoutData.customer.address.city}" required />
            </div>
            <div class="form-field-group">
              <label class="form-label">Provincia *</label>
              <select id="chkProvince" class="form-select">
                <option value="Buenos Aires" selected>Buenos Aires</option>
                <option value="CABA">Ciudad Autónoma de Buenos Aires</option>
                <option value="Córdoba">Córdoba</option>
                <option value="Santa Fe">Santa Fe</option>
                <option value="Mendoza">Mendoza</option>
                <option value="Tucumán">Tucumán</option>
                <option value="Entre Ríos">Entre Ríos</option>
                <option value="Otra">Otra provincia</option>
              </select>
            </div>
          </div>
        `}

        <div style="display:flex; gap:12px; margin-top:24px;">
          <button type="button" class="btn-table-action" style="padding:14px 20px;" onclick="window.renderCheckoutStep(1)">← Volver</button>
          <button class="checkout-btn-next" style="margin-top:0; flex-grow:1;" onclick="window.submitStep2()">
            <span>Continuar al Pago</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>
        </div>
      </div>
    `;
  }

  // STEP 3: Forma de Pago y Confirmación
  else if (step === 3) {
    const settings = store.getSettings();
    container.innerHTML = `
      <div class="checkout-step-content active">
        <h3 style="font-family: var(--heading-font); font-size: 20px; font-weight: 700; margin-bottom: 18px;">
          3. Método de Pago
        </h3>

        <div class="payment-options-list">
          <div class="option-radio-card ${checkoutData.payment.method === 'transferencia' ? 'selected' : ''}" onclick="window.selectPaymentOption('transferencia')">
            <div class="option-radio-left">
              <input type="radio" name="paymentOpt" ${checkoutData.payment.method === 'transferencia' ? 'checked' : ''} />
              <div>
                <div class="option-radio-title">Transferencia Bancaria / Efectivo</div>
                <div class="option-radio-desc">¡Ahorrás un ${settings.transferDiscountPct || 15}% en tu compra total!</div>
              </div>
            </div>
            <span class="badge-tag hot" style="background:#15803d;color:#ffffff;">15% OFF</span>
          </div>

          <div class="option-radio-card ${checkoutData.payment.method === 'mercadopago' ? 'selected' : ''}" onclick="window.selectPaymentOption('mercadopago')">
            <div class="option-radio-left">
              <input type="radio" name="paymentOpt" ${checkoutData.payment.method === 'mercadopago' ? 'checked' : ''} />
              <div>
                <div class="option-radio-title">Mercado Pago / Tarjetas de Crédito y Débito</div>
                <div class="option-radio-desc">Hasta 6 cuotas sin interés con todas las tarjetas bancarias</div>
              </div>
            </div>
            <span class="badge-tag new">6 CUOTAS</span>
          </div>
        </div>

        ${checkoutData.payment.method === 'transferencia' ? `
          <div class="bank-transfer-details-box">
            <strong>Datos Bancarios para Transferir:</strong><br/>
            <strong>Banco:</strong> ${settings.bankTransferData.banco}<br/>
            <strong>Titular:</strong> ${settings.bankTransferData.titular}<br/>
            <strong>CUIT:</strong> ${settings.bankTransferData.cuit}<br/>
            <strong>CBU:</strong> ${settings.bankTransferData.cbu}<br/>
            <strong>Alias:</strong> <span style="background:#bbf7d0;padding:2px 6px;border-radius:3px;font-weight:700;">${settings.bankTransferData.alias}</span><br/>
            <span style="font-size:11px;color:#15803d;display:block;margin-top:6px;">
              * Al finalizar tu compra, se abrirá WhatsApp automáticamente para enviar el comprobante y despachar tu pedido.
            </span>
          </div>
        ` : `
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:4px;padding:16px;margin-top:14px;font-size:12px;color:#475569;">
            💳 <strong>Financiación disponible:</strong><br/>
            • 1 pago sin interés de $${checkoutData.total.toLocaleString('es-AR')}<br/>
            • 3 cuotas sin interés de $${Math.round(checkoutData.total / 3).toLocaleString('es-AR')}<br/>
            • <strong>6 cuotas sin interés de $${Math.round(checkoutData.total / 6).toLocaleString('es-AR')}</strong>
          </div>
        `}

        <div style="display:flex; gap:12px; margin-top:24px;">
          <button type="button" class="btn-table-action" style="padding:14px 20px;" onclick="window.renderCheckoutStep(2)">← Volver</button>
          <button class="checkout-btn-next" style="margin-top:0; flex-grow:1; background:#10b981;" onclick="window.completeOrder()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>CONFIRMAR Y FINALIZAR COMPRA</span>
          </button>
        </div>
      </div>
    `;
  }

  // STEP 4: Orden Confirmada con WhatsApp
  else if (step === 4) {
    const order = checkoutData.confirmedOrder;
    const settings = store.getSettings();
    const phone = settings.phoneWhatsapp || '5492494123456';

    const orderMsg = encodeURIComponent(
      `¡Hola Moscú Showroom! 👋 Acabo de realizar el pedido *${order.id}* por un total de *$${order.total.toLocaleString('es-AR')}*.\n\n` +
      `Cliente: ${order.customer.name}\n` +
      `Método de pago: ${order.payment.name}\n` +
      `Dirección: ${order.customer.address.street} ${order.customer.address.number || ''} (${order.customer.address.city})\n\n` +
      `Te adjunto el comprobante para confirmar el despacho. ¡Muchas gracias!`
    );

    const waLink = `https://wa.me/${phone}?text=${orderMsg}`;

    // Hide summary side on final confirmation
    if (summaryContainer) summaryContainer.style.display = 'none';

    container.parentElement.style.gridTemplateColumns = '1fr';
    container.innerHTML = `
      <div class="order-confirmed-screen">
        <div class="order-success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h2 style="font-family: var(--heading-font); font-size: 28px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">
          ¡Gracias por tu compra, ${order.customer.name.split(' ')[0]}!
        </h2>
        <p style="font-size: 14px; color: #64748b;">Tu pedido ha sido registrado con éxito en nuestro sistema.</p>

        <div class="order-number-badge">
          ORDEN #${order.id}
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; max-width: 500px; width: 100%; text-align: left; font-size: 13px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #64748b;">Monto final abonado:</span>
            <strong style="font-size: 16px; color: #000000;">$${order.total.toLocaleString('es-AR')}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #64748b;">Medio de pago:</span>
            <span>${order.payment.name}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748b;">Forma de entrega:</span>
            <span>${order.shipping.name}</span>
          </div>
        </div>

        <a href="${waLink}" target="_blank" class="btn-whatsapp-order">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824z"/>
          </svg>
          <span>Enviar Comprobante por WhatsApp</span>
        </a>

        <button onclick="window.closeCheckout(); window.location.reload();" style="margin-top: 20px; background: none; border: none; font-size: 13px; text-decoration: underline; color: #64748b; cursor: pointer;">
          Volver a la tienda
        </button>
      </div>
    `;
  }
}

// Option selection handlers
window.selectShippingOption = (method) => {
  checkoutData.shipping.method = method;
  renderCheckoutStep(1);
};

window.selectPaymentOption = (method) => {
  checkoutData.payment.method = method;
  if (method === 'transferencia') {
    checkoutData.payment.name = 'Transferencia Bancaria (15% OFF)';
    checkoutData.payment.discountPct = 15;
  } else {
    checkoutData.payment.name = 'Mercado Pago (Hasta 6 Cuotas Sin Interés)';
    checkoutData.payment.discountPct = 0;
  }
  renderCheckoutStep(3);
};

window.submitStep1 = () => {
  const email = document.getElementById('chkEmail').value.trim();
  const name = document.getElementById('chkName').value.trim();
  const phone = document.getElementById('chkPhone').value.trim();

  if (!email || !name || !phone) {
    alert('Por favor, completá todos los campos requeridos.');
    return;
  }

  checkoutData.customer.email = email;
  checkoutData.customer.name = name;
  checkoutData.customer.phone = phone;

  renderCheckoutStep(2);
};

window.submitStep2 = () => {
  if (checkoutData.shipping.method !== 'showroom') {
    const street = document.getElementById('chkStreet').value.trim();
    const number = document.getElementById('chkNumber').value.trim();
    const postalCode = document.getElementById('chkPostal').value.trim();
    const city = document.getElementById('chkCity').value.trim();
    const province = document.getElementById('chkProvince').value;
    const floor = document.getElementById('chkFloor') ? document.getElementById('chkFloor').value.trim() : '';

    if (!street || !number || !postalCode || !city) {
      alert('Por favor, completá los datos de tu dirección de entrega.');
      return;
    }

    checkoutData.customer.address = {
      street,
      number,
      floor,
      postalCode,
      city,
      province
    };
  } else {
    checkoutData.customer.address = {
      street: 'Showroom Ayacucho',
      number: '9 de Julio 837',
      floor: '',
      postalCode: '7150',
      city: 'Ayacucho',
      province: 'Buenos Aires'
    };
  }

  renderCheckoutStep(3);
};

window.completeOrder = () => {
  updateCheckoutCalculations();

  const newOrder = store.addOrder({
    customer: checkoutData.customer,
    items: checkoutData.items,
    shipping: checkoutData.shipping,
    payment: checkoutData.payment,
    subtotal: checkoutData.subtotal,
    total: checkoutData.total
  });

  checkoutData.confirmedOrder = newOrder;

  // Clear cart
  store.clearCart();

  // Render Step 4
  renderCheckoutStep(4);
};
