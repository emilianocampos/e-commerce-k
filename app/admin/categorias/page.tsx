'use client';

/* ==========================================================================
   Moscú Showroom - Admin Categories Page (Next.js App Router)
   ========================================================================== */

import React, { useState, useEffect } from 'react';
import AdminTopbar from '../../../components/admin/AdminTopbar';
import { getCategories, saveCategory, deleteCategory } from '../../../lib/supabaseClient';
import { Category } from '../../../lib/types';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catBadge, setCatBadge] = useState('');
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  const loadData = async () => {
    const cats = await getCategories();
    setCategories(cats);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingCat(null);
    setCatName('');
    setCatSlug('');
    setCatBadge('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCat(cat);
    setCatName(cat.name);
    setCatSlug(cat.slug);
    setCatBadge(cat.badge || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    await saveCategory({
      id: editingCat ? editingCat.id : undefined,
      name: catName.trim().toUpperCase(),
      slug: catSlug.trim() || catName.trim().toLowerCase().replace(/\s+/g, '-'),
      badge: catBadge.trim()
    });

    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de eliminar la categoría "${name}"?`)) {
      await deleteCategory(id);
      loadData();
    }
  };

  return (
    <div>
      <AdminTopbar
        title="Gestión de Categorías"
        ctaText="+ Nueva Categoría"
        onCtaClick={handleOpenAdd}
      />

      <div style={{ padding: '24px 30px' }}>
        <div className="admin-card">
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nombre Categoría</th>
                  <th>Slug Identificador</th>
                  <th>Badge Destacado</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat.id}>
                    <td>
                      <strong style={{ fontSize: '14px', color: '#0f172a' }}>{cat.name}</strong>
                    </td>
                    <td>
                      <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>
                        {cat.slug}
                      </code>
                    </td>
                    <td>
                      {cat.badge ? (
                        <span className="cat-pill-badge">{cat.badge}</span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>Sin etiqueta</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn-table-action"
                          onClick={() => handleOpenEdit(cat)}
                        >
                          ✏️ Editar
                        </button>
                        <button
                          type="button"
                          className="btn-table-action danger"
                          onClick={() => handleDelete(cat.id, cat.name)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Nueva / Editar Categoría */}
      {isModalOpen && (
        <div className="admin-modal-overlay active" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="admin-modal-header">
              <h3>{editingCat ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
              <button type="button" className="cart-close-btn" onClick={() => setIsModalOpen(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleSave} style={{ padding: '20px' }}>
              <div className="admin-form-group">
                <label className="admin-form-label">Nombre de la Categoría *</label>
                <input
                  type="text"
                  className="admin-form-input"
                  required
                  placeholder="ej: BERMUDAS, CAMPERAS"
                  value={catName}
                  onChange={(e) => {
                    setCatName(e.target.value);
                    if (!editingCat) {
                      setCatSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                    }
                  }}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Slug de URL</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="ej: bermudas"
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Badge Destacado (opcional)</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="HOT, NUEVO, 20% OFF"
                  value={catBadge}
                  onChange={(e) => setCatBadge(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn-table-action"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-admin-cta">
                  Guardar Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
