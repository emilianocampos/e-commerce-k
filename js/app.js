/* ==========================================================================
   Moscú Showroom - Application Bootstrap & View Routing
   ========================================================================== */

// Top-level global mode switcher
window.setAppMode = (mode) => {
  const storefrontView = document.getElementById('storefrontView');
  const adminView = document.getElementById('adminView');
  const modeSwitcherText = document.getElementById('modeSwitcherText');

  if (mode === 'admin') {
    if (storefrontView) storefrontView.style.display = 'none';
    if (adminView) adminView.classList.add('active');
    if (modeSwitcherText) modeSwitcherText.textContent = 'Ver Tienda Online';
    window.location.hash = '#admin';
    window.scrollTo(0, 0);
  } else {
    if (storefrontView) storefrontView.style.display = 'block';
    if (adminView) adminView.classList.remove('active');
    if (modeSwitcherText) modeSwitcherText.textContent = 'Panel Admin';
    window.location.hash = '#tienda';
    window.scrollTo(0, 0);
  }
};

window.toggleAppMode = () => {
  const adminView = document.getElementById('adminView');
  const isCurrentlyAdmin = adminView && adminView.classList.contains('active');
  window.setAppMode(isCurrentlyAdmin ? 'storefront' : 'admin');
};

// Global Escape Key Listener for any open modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (window.closeProductDetail) window.closeProductDetail();
    if (window.closeCart) window.closeCart();
    if (window.closeCheckout) window.closeCheckout();
    if (window.closeSizeGuide) window.closeSizeGuide();
    if (window.closeMobileMenu) window.closeMobileMenu();
    if (window.closeProductModal) window.closeProductModal();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Submodules
  initStorefront();
  initProductDetail();
  initCart();
  initCheckout();
  initAdmin();

  // Mode View Switcher button binding
  const modeSwitcherBtn = document.getElementById('modeSwitcherPill');
  if (modeSwitcherBtn) {
    modeSwitcherBtn.addEventListener('click', window.toggleAppMode);
  }

  // Check URL Hash for initial route
  if (window.location.hash === '#admin') {
    window.setAppMode('admin');
  } else {
    window.setAppMode('storefront');
  }

  // Mobile Menu Drawer Controls
  const mobileMenu = document.getElementById('mobileMenuDrawer');
  const mobileMenuBackdrop = document.getElementById('mobileMenuBackdrop');
  window.openMobileMenu = () => {
    if (mobileMenu && mobileMenuBackdrop) {
      mobileMenu.classList.add('active');
      mobileMenuBackdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };
  window.closeMobileMenu = () => {
    if (mobileMenu && mobileMenuBackdrop) {
      mobileMenu.classList.remove('active');
      mobileMenuBackdrop.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  // Newsletter Submit Feedback
  const newsForm = document.getElementById('newsletterForm');
  if (newsForm) {
    newsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('¡Gracias por suscribirte a Moscú Showroom! Te enviamos tu código de descuento por email.');
      newsForm.reset();
    });
  }

  console.log('✨ Moscú Showroom E-Commerce & Admin Panel Initialized Successfully.');
});

