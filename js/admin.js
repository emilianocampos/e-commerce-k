/* ==========================================================================
   Moscú Showroom - Complete Admin Panel & Dashboard Logic
   ========================================================================== */

import { store } from './state.js';

let editingProductId = null;
let currentAdminTab = 'dashboard';
let tempProductImages = [];

export function initAdmin() {
  initAdminNavigation();
  renderDashboard();
  renderProductsTable();
  renderCategoriesTable();
  renderBannersCMS();
  renderOrdersTable();
  renderSettingsForm();
  initProductModal();

  // State Change Listener
  store.subscribe((type) => {
    if (type === 'products' || type === 'all') {
      renderDashboard();
      renderProductsTable();
    }
    if (type === 'orders' || type === 'all') {
      renderDashboard();
      renderOrdersTable();
    }
    if (type === 'categories' || type === 'all') {
      renderCategoriesTable();
      populateCategorySelects();
    }
    if (type === 'slides' || type === 'announcements' || type === 'all') {
      renderBannersCMS();
    }
    if (type === 'settings' || type === 'all') {
      renderSettingsForm();
    }
  });

  populateCategorySelects();
}

// 1. Navigation between Admin Tabs
function initAdminNavigation() {
  const navBtns = document.querySelectorAll('.admin-nav-item');
  const panels = document.querySelectorAll('.admin-panel-view');
  const topbarTitle = document.getElementById('adminTopbarTitle');

  window.switchAdminTab = (tabName) => {
    currentAdminTab = tabName;
    navBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
    });
    panels.forEach(p => {
      p.classList.toggle('active', p.id === `panel-${tabName}`);
    });

    const titles = {
      dashboard: 'Dashboard & Métricas',
      products: 'Gestión de Productos (CRUD)',
      categories: 'Categorías & Colecciones',
      banners: 'Banners & Anuncios CMS',
      orders: 'Gestión de Pedidos',
      settings: 'Configuración de Tienda'
    };
    if (topbarTitle) topbarTitle.textContent = titles[tabName] || 'Panel de Control';

    if (tabName === 'dashboard') renderDashboard();
    if (tabName === 'products') renderProductsTable();
    if (tabName === 'orders') renderOrdersTable();
  };

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      if (tab) window.switchAdminTab(tab);
    });
  });
}

// 2. Dashboard KPIs & Sales Visualizer
export function renderDashboard() {
  const orders = store.getOrders();
  const products = store.getProducts();

  const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrders = orders.length;
  const avgTicket = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;
  
  // Count low stock items (stock <= 2)
  let lowStockCount = 0;
  products.forEach(p => {
    const totalStock = p.sizes ? p.sizes.reduce((s, sz) => s + (sz.stock || 0), 0) : 0;
    if (totalStock <= 2) lowStockCount++;
  });

  const kpiSalesEl = document.getElementById('kpiTotalSales');
  const kpiOrdersEl = document.getElementById('kpiTotalOrders');
  const kpiAvgEl = document.getElementById('kpiAvgTicket');
  const kpiStockEl = document.getElementById('kpiLowStock');

  if (kpiSalesEl) kpiSalesEl.textContent = `$${totalSales.toLocaleString('es-AR')}`;
  if (kpiOrdersEl) kpiOrdersEl.textContent = totalOrders;
  if (kpiAvgEl) kpiAvgEl.textContent = `$${avgTicket.toLocaleString('es-AR')}`;
  if (kpiStockEl) kpiStockEl.textContent = lowStockCount;

  // Render Sales Chart Bars
  const chartContainer = document.getElementById('adminSalesChart');
  if (chartContainer) {
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const mockValues = [120000, 185000, 240000, 310000, 280000, 420000, 380000];
    const maxVal = Math.max(...mockValues);

    chartContainer.innerHTML = days.map((day, idx) => {
      const val = mockValues[idx];
      const heightPct = Math.round((val / maxVal) * 85);
      return `
        <div class="chart-bar-group">
          <div class="chart-bar" style="height: ${heightPct}%;" data-tooltip="$${val.toLocaleString('es-AR')}"></div>
          <span class="chart-bar-label">${day}</span>
        </div>
      `;
    }).join('');
  }

  // Render Recent Orders in Dashboard
  const recentOrdersTbody = document.getElementById('dashboardRecentOrders');
  if (recentOrdersTbody) {
    const recent = orders.slice(0, 5);
    recentOrdersTbody.innerHTML = recent.map(o => `
      <tr>
        <td><strong>#${o.id}</strong></td>
        <td>${o.customer.name}</td>
        <td>${o.items.length} prenda(s)</td>
        <td><strong>$${o.total.toLocaleString('es-AR')}</strong></td>
        <td>
          <span class="status-pill ${o.status.toLowerCase().replace(/\s+/g, '')}">${o.status}</span>
        </td>
        <td>
          <button class="btn-table-action" onclick="window.viewOrderDetail('${o.id}')">Ver Detalle</button>
        </td>
      </tr>
    `).join('');
  }
}

// 3. Products CRUD
export function renderProductsTable() {
  const tbody = document.getElementById('adminProductsTbody');
  const searchInput = document.getElementById('adminProductSearch');
  const catFilter = document.getElementById('adminProductCategoryFilter');
  if (!tbody) return;

  let products = store.getProducts();

  // Apply filters
  if (searchInput && searchInput.value.trim()) {
    const q = searchInput.value.trim().toLowerCase();
    products = products.filter(p => p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q)));
  }
  if (catFilter && catFilter.value && catFilter.value !== 'all') {
    products = products.filter(p => p.category === catFilter.value);
  }

  tbody.innerHTML = products.map(p => {
    const totalStock = p.sizes ? p.sizes.reduce((sum, s) => sum + s.stock, 0) : 0;
    const thumb = p.images && p.images[0] ? p.images[0] : 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=200&auto=format&fit=crop';

    return `
      <tr>
        <td>
          <div class="table-product-info">
            <img src="${thumb}" alt="${p.name}" class="product-cell-thumb" />
            <div>
              <span class="table-product-title">${p.name}</span>
              <span class="table-product-sku">SKU: ${p.sku || 'N/A'}</span>
            </div>
          </div>
        </td>
        <td>${p.categoryName}</td>
        <td><strong>$${p.price.toLocaleString('es-AR')}</strong></td>
        <td>
          <span class="status-pill ${totalStock > 2 ? 'pagado' : totalStock > 0 ? 'pendiente' : 'cancelado'}">
            ${totalStock > 0 ? totalStock + ' unid.' : 'Agotado'}
          </span>
        </td>
        <td>
          <span style="font-size: 11px; color: #475569;">${p.sizes ? p.sizes.map(s => s.size).join(', ') : 'Único'}</span>
        </td>
        <td>
          <div class="table-actions">
            <button class="btn-table-action" onclick="window.editProductModal('${p.id}')">Editar</button>
            <button class="btn-table-action delete" onclick="window.confirmDeleteProduct('${p.id}')">Eliminar</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Bind filter events once
  if (searchInput && !searchInput.dataset.bound) {
    searchInput.dataset.bound = 'true';
    searchInput.addEventListener('input', () => renderProductsTable());
  }
  if (catFilter && !catFilter.dataset.bound) {
    catFilter.dataset.bound = 'true';
    catFilter.addEventListener('change', () => renderProductsTable());
  }
}

// 4. Product Modal (Add / Edit)
function initProductModal() {
  const modal = document.getElementById('adminProductModal');
  const closeBtn = document.getElementById('adminProductModalClose');
  const cancelBtn = document.getElementById('adminProductModalCancel');
  const form = document.getElementById('adminProductForm');
  const addImageBtn = document.getElementById('adminAddImageBtn');
  const imageInput = document.getElementById('adminImageUrlInput');
  const fileInput = document.getElementById('adminImageFileInput');

  window.openNewProductModal = () => {
    editingProductId = null;
    tempProductImages = [];
    document.getElementById('adminModalProductTitle').textContent = 'Crear Nuevo Producto';
    if (form) form.reset();
    renderModalImagePreviews();
    renderModalSizesMatrix([
      { size: 'S', stock: 5 },
      { size: 'M', stock: 8 },
      { size: 'L', stock: 6 },
      { size: 'XL', stock: 3 }
    ]);
    if (modal) modal.classList.add('active');
  };

  window.editProductModal = (id) => {
    const product = store.getProductById(id);
    if (!product) return;

    editingProductId = id;
    tempProductImages = [...product.images];
    document.getElementById('adminModalProductTitle').textContent = `Editar Producto: ${product.name}`;

    document.getElementById('pFormName').value = product.name;
    document.getElementById('pFormSku').value = product.sku || '';
    document.getElementById('pFormCategory').value = product.category;
    document.getElementById('pFormPrice').value = product.price;
    document.getElementById('pFormComparePrice').value = product.comparePrice || '';
    document.getElementById('pFormDiscountPct').value = product.transferDiscountPct || 15;
    document.getElementById('pFormDesc').value = product.description || '';
    document.getElementById('pFormTags').value = product.tags ? product.tags.join(', ') : '';

    renderModalImagePreviews();
    renderModalSizesMatrix(product.sizes || []);

    if (modal) modal.classList.add('active');
  };

  window.closeProductModal = () => {
    if (modal) modal.classList.remove('active');
  };

  if (closeBtn) closeBtn.addEventListener('click', window.closeProductModal);
  if (cancelBtn) cancelBtn.addEventListener('click', window.closeProductModal);

  // Add Image URL
  if (addImageBtn && imageInput) {
    addImageBtn.addEventListener('click', () => {
      const url = imageInput.value.trim();
      if (url) {
        tempProductImages.push(url);
        imageInput.value = '';
        renderModalImagePreviews();
      }
    });
  }

  // Upload Local Image File as Data URL
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          tempProductImages.push(event.target.result);
          renderModalImagePreviews();
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Save Product Form
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('pFormName').value.trim();
      const sku = document.getElementById('pFormSku').value.trim();
      const category = document.getElementById('pFormCategory').value;
      const price = Number(document.getElementById('pFormPrice').value);
      const comparePrice = document.getElementById('pFormComparePrice').value ? Number(document.getElementById('pFormComparePrice').value) : null;
      const transferDiscountPct = Number(document.getElementById('pFormDiscountPct').value) || 15;
      const description = document.getElementById('pFormDesc').value.trim();
      const tagsStr = document.getElementById('pFormTags').value.trim();
      const tags = tagsStr ? tagsStr.split(',').map(t => t.trim().toUpperCase()).filter(Boolean) : [];

      // Collect Sizes Matrix
      const sizeInputs = document.querySelectorAll('.js-matrix-size-row');
      const sizes = [];
      sizeInputs.forEach(row => {
        const sizeName = row.querySelector('.js-size-name').value.trim();
        const stockVal = Number(row.querySelector('.js-size-stock').value) || 0;
        if (sizeName) {
          sizes.push({ size: sizeName, stock: stockVal });
        }
      });

      const categories = store.getCategories();
      const matchedCat = categories.find(c => c.slug === category);
      const categoryName = matchedCat ? matchedCat.name : 'Indumentaria';

      const images = tempProductImages.length ? tempProductImages : [
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop'
      ];

      const productPayload = {
        name,
        sku,
        category,
        categoryName,
        price,
        comparePrice,
        transferDiscountPct,
        description,
        tags,
        sizes,
        images
      };

      if (editingProductId) {
        store.updateProduct(editingProductId, productPayload);
      } else {
        store.addProduct(productPayload);
      }

      window.closeProductModal();
      renderProductsTable();
      renderDashboard();
    });
  }
}

function renderModalImagePreviews() {
  const container = document.getElementById('adminImagePreviews');
  if (!container) return;

  container.innerHTML = tempProductImages.map((img, idx) => `
    <div class="preview-thumb-card">
      <img src="${img}" alt="Foto ${idx + 1}" />
      <button type="button" class="preview-thumb-remove" onclick="window.removeTempImage(${idx})">×</button>
    </div>
  `).join('');
}

window.removeTempImage = (idx) => {
  tempProductImages.splice(idx, 1);
  renderModalImagePreviews();
};

function renderModalSizesMatrix(sizes) {
  const container = document.getElementById('adminSizesMatrix');
  if (!container) return;

  container.innerHTML = sizes.map((s, idx) => `
    <tr class="js-matrix-size-row">
      <td><input type="text" class="js-size-name form-input" value="${s.size}" style="width:70px;" /></td>
      <td><input type="number" class="js-size-stock form-input" value="${s.stock}" min="0" style="width:80px;" /></td>
      <td><button type="button" class="btn-table-action delete" onclick="this.closest('tr').remove()">×</button></td>
    </tr>
  `).join('');
}

window.addSizeRowToMatrix = () => {
  const container = document.getElementById('adminSizesMatrix');
  if (!container) return;
  const tr = document.createElement('tr');
  tr.className = 'js-matrix-size-row';
  tr.innerHTML = `
    <td><input type="text" class="js-size-name form-input" placeholder="Talle" style="width:70px;" /></td>
    <td><input type="number" class="js-size-stock form-input" value="5" min="0" style="width:80px;" /></td>
    <td><button type="button" class="btn-table-action delete" onclick="this.closest('tr').remove()">×</button></td>
  `;
  container.appendChild(tr);
};

window.confirmDeleteProduct = (id) => {
  const p = store.getProductById(id);
  if (confirm(`¿Estás seguro de que deseas eliminar permanentemente el producto "${p ? p.name : id}"?`)) {
    store.deleteProduct(id);
    renderProductsTable();
  }
};

function populateCategorySelects() {
  const filterSelect = document.getElementById('adminProductCategoryFilter');
  const modalSelect = document.getElementById('pFormCategory');
  const categories = store.getCategories();

  if (filterSelect) {
    filterSelect.innerHTML = `<option value="all">Todas las Categorías</option>` +
      categories.map(c => `<option value="${c.slug}">${c.name}</option>`).join('');
  }

  if (modalSelect) {
    modalSelect.innerHTML = categories.map(c => `<option value="${c.slug}">${c.name}</option>`).join('');
  }
}

// 5. Categories CRUD
export function renderCategoriesTable() {
  const tbody = document.getElementById('adminCategoriesTbody');
  if (!tbody) return;

  const categories = store.getCategories();
  tbody.innerHTML = categories.map(c => `
    <tr>
      <td><strong>${c.name}</strong></td>
      <td><code>/${c.slug}/</code></td>
      <td>${c.badge ? `<span class="badge-tag sale" style="font-size:9px;">${c.badge}</span>` : '-'}</td>
      <td>
        <div class="table-actions">
          <button class="btn-table-action delete" onclick="window.confirmDeleteCategory('${c.id}')" ${c.id === 'todos' ? 'disabled style="opacity:0.4"' : ''}>Eliminar</button>
        </div>
      </td>
    </tr>
  `).join('');
}

window.addNewCategoryPrompt = () => {
  const name = prompt('Nombre de la nueva categoría (ej: CAMISAS):');
  if (!name || !name.trim()) return;
  store.addCategory({ name: name.trim() });
  renderCategoriesTable();
};

window.confirmDeleteCategory = (id) => {
  if (confirm('¿Eliminar esta categoría?')) {
    store.deleteCategory(id);
    renderCategoriesTable();
  }
};

// 6. Banners & Announcements CMS
export function renderBannersCMS() {
  const announcementsList = document.getElementById('adminAnnouncementsList');
  const slidesList = document.getElementById('adminHeroSlidesList');

  // Announcements
  if (announcementsList) {
    const announcements = store.getAnnouncements();
    announcementsList.innerHTML = announcements.map((msg, idx) => `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:4px; margin-bottom:8px;">
        <span style="font-weight:600; font-size:12px;">${msg}</span>
        <button class="btn-table-action delete" onclick="window.deleteAnnouncement(${idx})">Eliminar</button>
      </div>
    `).join('');
  }

  // Hero Slides
  if (slidesList) {
    const slides = store.getHeroSlides();
    slidesList.innerHTML = slides.map((slide, idx) => `
      <div style="display:flex; gap:16px; align-items:center; padding:14px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; margin-bottom:12px;">
        <img src="${slide.image}" style="width:100px; height:56px; object-fit:cover; border-radius:4px;" />
        <div style="flex-grow:1;">
          <strong style="font-size:14px; color:#0f172a;">${slide.title}</strong>
          <p style="font-size:12px; color:#64748b; margin-top:2px;">${slide.subtitle}</p>
        </div>
        <button class="btn-table-action delete" onclick="window.deleteHeroSlide(${idx})">Eliminar</button>
      </div>
    `).join('');
  }
}

window.addAnnouncementPrompt = () => {
  const msg = prompt('Escribí el texto para la barra de promociones superior:');
  if (!msg || !msg.trim()) return;
  const list = store.getAnnouncements();
  list.push(msg.trim().toUpperCase());
  store.saveAnnouncements(list);
};

window.deleteAnnouncement = (idx) => {
  const list = store.getAnnouncements();
  list.splice(idx, 1);
  store.saveAnnouncements(list);
};

window.addHeroSlidePrompt = () => {
  const title = prompt('Título del Banner Hero:');
  if (!title) return;
  const subtitle = prompt('Subtítulo del Banner:');
  const imgUrl = prompt('URL de la imagen (1920x1080 o similar):', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop');

  const slides = store.getHeroSlides();
  slides.push({
    id: 'slide-' + Date.now(),
    title: title.toUpperCase(),
    subtitle: subtitle || '',
    buttonText: 'VER COLECCIÓN',
    categoryLink: 'todos',
    image: imgUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop'
  });
  store.saveHeroSlides(slides);
};

window.deleteHeroSlide = (idx) => {
  const slides = store.getHeroSlides();
  slides.splice(idx, 1);
  store.saveHeroSlides(slides);
};

// 7. Orders Management
export function renderOrdersTable() {
  const tbody = document.getElementById('adminOrdersTbody');
  if (!tbody) return;

  const orders = store.getOrders();
  tbody.innerHTML = orders.map(o => `
    <tr>
      <td><strong>#${o.id}</strong></td>
      <td>${new Date(o.date).toLocaleDateString('es-AR')}</td>
      <td>
        <strong>${o.customer.name}</strong><br/>
        <span style="font-size:11px; color:#64748b;">${o.customer.phone}</span>
      </td>
      <td><strong>$${o.total.toLocaleString('es-AR')}</strong></td>
      <td>${o.payment.name}</td>
      <td>
        <select class="form-select" style="padding:4px 8px; font-size:11px; font-weight:700;" onchange="window.changeOrderStatus('${o.id}', this.value)">
          <option value="Pendiente" ${o.status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
          <option value="Pagado" ${o.status === 'Pagado' ? 'selected' : ''}>Pagado</option>
          <option value="En preparación" ${o.status === 'En preparación' ? 'selected' : ''}>En preparación</option>
          <option value="Enviado" ${o.status === 'Enviado' ? 'selected' : ''}>Enviado</option>
          <option value="Entregado" ${o.status === 'Entregado' ? 'selected' : ''}>Entregado</option>
          <option value="Cancelado" ${o.status === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
        </select>
      </td>
      <td>
        <button class="btn-table-action" onclick="window.viewOrderDetail('${o.id}')">Ver Detalle</button>
      </td>
    </tr>
  `).join('');
}

window.changeOrderStatus = (orderId, newStatus) => {
  store.updateOrderStatus(orderId, newStatus);
};

window.viewOrderDetail = (orderId) => {
  const orders = store.getOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  const itemsDesc = order.items.map(i => `• ${i.name} (Talle ${i.size}) × ${i.quantity} = $${(i.unitPrice * i.quantity).toLocaleString('es-AR')}`).join('\n');

  const waMsg = encodeURIComponent(`Hola ${order.customer.name}! Nos comunicamos de Moscú Showroom sobre tu pedido #${order.id}.`);
  const waUrl = `https://wa.me/${order.customer.phone.replace(/[^0-9]/g, '')}?text=${waMsg}`;

  alert(
    `DETALLES DEL PEDIDO #${order.id}\n` +
    `-----------------------------------------\n` +
    `Cliente: ${order.customer.name}\n` +
    `Email: ${order.customer.email}\n` +
    `Teléfono: ${order.customer.phone}\n` +
    `Dirección: ${order.customer.address ? `${order.customer.address.street} ${order.customer.address.number || ''}, ${order.customer.address.city}` : 'Showroom'}\n` +
    `Estado: ${order.status}\n\n` +
    `PRENDAS:\n${itemsDesc}\n\n` +
    `TOTAL: $${order.total.toLocaleString('es-AR')}\n` +
    `Medio de Pago: ${order.payment.name}`
  );
};

// 8. Settings Form
export function renderSettingsForm() {
  const settings = store.getSettings();
  const form = document.getElementById('adminSettingsForm');
  if (!form) return;

  const fCuotas = document.getElementById('setCuotas');
  const fDiscount = document.getElementById('setTransferDiscount');
  const fThreshold = document.getElementById('setShippingThreshold');
  const fCorreo = document.getElementById('setCostCorreo');
  const fAndreani = document.getElementById('setCostAndreani');
  const fPhone = document.getElementById('setPhoneWhatsapp');
  const fAddress = document.getElementById('setShowroomAddress');

  if (fCuotas) fCuotas.value = settings.cuotasSinInteres || 6;
  if (fDiscount) fDiscount.value = settings.transferDiscountPct || 15;
  if (fThreshold) fThreshold.value = settings.freeShippingThreshold || 150000;
  if (fCorreo) fCorreo.value = settings.shippingCosts.correoArgentino || 5400;
  if (fAndreani) fAndreani.value = settings.shippingCosts.andreani || 6800;
  if (fPhone) fPhone.value = settings.phoneWhatsapp || '5492494123456';
  if (fAddress) fAddress.value = settings.showroomAddress || '9 de Julio 837, Ayacucho, Buenos Aires';
}

window.saveSettings = (e) => {
  if (e) e.preventDefault();
  const newSettings = {
    cuotasSinInteres: Number(document.getElementById('setCuotas').value) || 6,
    transferDiscountPct: Number(document.getElementById('setTransferDiscount').value) || 15,
    freeShippingThreshold: Number(document.getElementById('setShippingThreshold').value) || 150000,
    shippingCosts: {
      correoArgentino: Number(document.getElementById('setCostCorreo').value) || 5400,
      andreani: Number(document.getElementById('setCostAndreani').value) || 6800,
      showroom: 0
    },
    phoneWhatsapp: document.getElementById('setPhoneWhatsapp').value.trim(),
    showroomAddress: document.getElementById('setShowroomAddress').value.trim()
  };

  store.updateSettings(newSettings);
  alert('¡Configuración de la tienda guardada con éxito!');
};

window.resetStoreToDefaults = () => {
  if (confirm('¿Restablecer el catálogo y pedidos con los datos semilla iniciales de Moscú Showroom?')) {
    store.resetToDefaults();
    alert('Catálogo restablecido con éxito.');
    window.location.reload();
  }
};
