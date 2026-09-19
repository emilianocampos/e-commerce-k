'use client';

/* ==========================================================================
   Moscú Showroom - Admin Products CRUD Page (Next.js App Router)
   ========================================================================== */

import React, { useState, useEffect, useMemo } from 'react';
import AdminTopbar from '../../../components/admin/AdminTopbar';
import ProductFormModal from '../../../components/admin/ProductFormModal';
import { getProducts, getCategories, deleteProduct } from '../../../lib/supabaseClient';
import { Product, Category } from '../../../lib/types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const loadData = async () => {
    const [p, c] = await Promise.all([getProducts(), getCategories()]);
    setProducts(p);
    setCategories(c);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;

      return matchesSearch && matchesCat;
    });
  }, [products, searchQuery, categoryFilter]);

  const handleCreateNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (prod: Product) => {
    setEditingProduct(prod);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el producto "${name}"? Esta acción no se puede deshacer.`)) {
      await deleteProduct(id);
      loadData();
    }
  };

  return (
    <div>
      <AdminTopbar
        title="Gestión de Productos (CRUD)"
        onNewProduct={handleCreateNew}
      />

      <div style={{ padding: '24px 30px' }}>
        {/* Filter Controls Card */}
        <div className="admin-card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flexGrow: 1, minWidth: '220px' }}>
              <input
                type="text"
                className="admin-form-input"
                placeholder="Buscar por nombre o SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ minWidth: '200px' }}>
              <select
                className="admin-form-input"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">Todas las Categorías</option>
                {categories.map(c => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <span style={{ fontSize: '13px', color: '#64748b', marginLeft: 'auto' }}>
              Mostrando {filteredProducts.length} de {products.length} productos
            </span>
          </div>
        </div>

        {/* Products Table */}
        <div className="admin-card">
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Foto</th>
                  <th>Nombre & SKU</th>
                  <th>Categoría</th>
                  <th>Precio Lista</th>
                  <th>Precio Transferencia (15% OFF)</th>
                  <th>Stock por Talle</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(prod => {
                  const transferPrice = Math.round(prod.price * (1 - ((prod.transferDiscountPct || 15) / 100)));
                  return (
                    <tr key={prod.id}>
                      <td>
                        <img
                          src={prod.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=200&auto=format&fit=crop'}
                          alt={prod.name}
                          style={{ width: '46px', height: '58px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#111827' }}>{prod.name}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                          SKU: {prod.sku || 'MSC-001'}
                        </div>
                      </td>
                      <td>
                        <span className="badge-cat-tag">{prod.categoryName || prod.category}</span>
                      </td>
                      <td>
                        <strong>${prod.price.toLocaleString('es-AR')}</strong>
                        {prod.comparePrice && (
                          <div style={{ fontSize: '11px', textDecoration: 'line-through', color: '#94a3b8' }}>
                            ${prod.comparePrice.toLocaleString('es-AR')}
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{ color: '#15803d', fontWeight: 700 }}>
                          ${transferPrice.toLocaleString('es-AR')}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {prod.sizes?.map(s => (
                            <span
                              key={s.size}
                              style={{
                                display: 'inline-block',
                                fontSize: '11px',
                                padding: '2px 6px',
                                borderRadius: '3px',
                                background: s.stock > 0 ? '#f1f5f9' : '#fee2e2',
                                color: s.stock > 0 ? '#334155' : '#dc2626',
                                fontWeight: 600
                              }}
                            >
                              {s.size}: {s.stock}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            type="button"
                            className="btn-table-action"
                            onClick={() => handleEdit(prod)}
                            title="Editar prenda"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            type="button"
                            className="btn-table-action danger"
                            onClick={() => handleDelete(prod.id, prod.name)}
                            title="Eliminar prenda"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Product Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        product={editingProduct}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSaved={loadData}
      />
    </div>
  );
}
