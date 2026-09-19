import React from 'react';

/* ==========================================================================
   Moscú Showroom - Admin Topbar Component
   ========================================================================== */

interface AdminTopbarProps {
  title: string;
  onNewProduct?: () => void;
  ctaText?: string;
  onCtaClick?: () => void;
}

export default function AdminTopbar({ title, onNewProduct, ctaText, onCtaClick }: AdminTopbarProps) {
  return (
    <div className="admin-topbar">
      <h2 className="admin-topbar-title">{title}</h2>
      <div className="admin-topbar-actions">
        {onNewProduct && (
          <button type="button" className="btn-admin-cta" onClick={onNewProduct}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>+ Nuevo Producto</span>
          </button>
        )}
        {ctaText && onCtaClick && (
          <button type="button" className="btn-admin-cta" onClick={onCtaClick}>
            <span>{ctaText}</span>
          </button>
        )}
      </div>
    </div>
  );
}
