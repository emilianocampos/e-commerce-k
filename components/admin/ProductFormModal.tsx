'use client';

/* ==========================================================================
   Moscú Showroom - Admin Product Form Modal (Create & Edit with Supabase)
   ========================================================================== */

import React, { useState, useEffect } from 'react';
import { Product, Category, ProductSize } from '../../lib/types';
import { saveProduct, uploadProductImage, getCategories } from '../../lib/supabaseClient';

interface ProductFormModalProps {
  isOpen: boolean;
  productToEdit?: Product | null;
  product?: Product | null;
  categories?: Category[];
  onClose: () => void;
  onSaved?: (savedProduct?: Product) => void;
}

export default function ProductFormModal({
  isOpen,
  productToEdit,
  product,
  categories,
  onClose,
  onSaved
}: ProductFormModalProps) {
  const activeProduct = productToEdit || product || null;
  const [internalCats, setInternalCats] = useState<Category[]>(categories || []);

  useEffect(() => {
    if (categories && categories.length > 0) {
      setInternalCats(categories);
    } else {
      getCategories().then(cats => {
        if (cats && cats.length > 0) {
          setInternalCats(cats);
        }
      });
    }
  }, [categories ? categories.length : 0]);

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('todos');
  const [price, setPrice] = useState<number>(0);
  const [comparePrice, setComparePrice] = useState<number | ''>('');
  const [transferDiscountPct, setTransferDiscountPct] = useState<number>(15);
  const [description, setDescription] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [sizes, setSizes] = useState<ProductSize[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Synchronize form values only when modal opens or activeProduct ID changes
  useEffect(() => {
    if (!isOpen) return;

    if (activeProduct) {
      setName(activeProduct.name || '');
      setSku(activeProduct.sku || '');
      setCategory(activeProduct.category || 'todos');
      setPrice(activeProduct.price || 0);
      setComparePrice(activeProduct.comparePrice || '');
      setTransferDiscountPct(activeProduct.transferDiscountPct || 15);
      setDescription(activeProduct.description || '');
      setTagsStr(activeProduct.tags ? activeProduct.tags.join(', ') : '');
      setImages(activeProduct.images || []);
      setSizes(activeProduct.sizes || [
        { size: 'S', stock: 5 },
        { size: 'M', stock: 8 },
        { size: 'L', stock: 6 }
      ]);
    } else {
      setName('');
      setSku('');
      setCategory(internalCats[0]?.slug || 'todos');
      setPrice(0);
      setComparePrice('');
      setTransferDiscountPct(15);
      setDescription('');
      setTagsStr('');
      setImages([]);
      setSizes([
        { size: 'S', stock: 5 },
        { size: 'M', stock: 8 },
        { size: 'L', stock: 6 }
      ]);
    }
  }, [isOpen, activeProduct?.id]);

  if (!isOpen) return null;

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImages(prev => [...prev, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadedUrl = await uploadProductImage(file);
      setImages(prev => [...prev, uploadedUrl]);
    } catch (err) {
      alert('Error al procesar la imagen.');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddSizeRow = () => {
    setSizes(prev => [...prev, { size: '42', stock: 5 }]);
  };

  const handleUpdateSize = (idx: number, field: 'size' | 'stock', val: string | number) => {
    setSizes(prev => {
      const copy = [...prev];
      copy[idx] = {
        ...copy[idx],
        [field]: field === 'stock' ? Number(val) || 0 : String(val)
      };
      return copy;
    });
  };

  const handleRemoveSize = (idx: number) => {
    setSizes(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) {
      alert('Por favor, ingresá el nombre y precio del producto.');
      return;
    }

    setIsSaving(true);
    const matchedCategory = internalCats.find(c => c.slug === category);
    const categoryName = matchedCategory ? matchedCategory.name : 'Indumentaria';

    const tags = tagsStr
      ? tagsStr.split(',').map(t => t.trim().toUpperCase()).filter(Boolean)
      : [];

    const productPayload: Partial<Product> = {
      id: activeProduct ? activeProduct.id : undefined,
      name: name.trim(),
      sku: sku.trim() || 'MSC-' + Math.floor(1000 + Math.random() * 9000),
      category,
      categoryName,
      price: Number(price),
      comparePrice: comparePrice ? Number(comparePrice) : null,
      transferDiscountPct: Number(transferDiscountPct) || 15,
      description: description.trim(),
      tags,
      images: images.length ? images : [
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop'
      ],
      sizes: sizes.filter(s => s.size.trim())
    };

    try {
      const saved = await saveProduct(productPayload);
      if (onSaved) onSaved(saved);
      onClose();
    } catch (err) {
      alert('Error al guardar el producto.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="admin-modal-overlay active" onClick={onClose}>
      <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">
            {activeProduct ? `Editar: ${activeProduct.name}` : 'Crear Nuevo Producto'}
          </h3>
          <button type="button" className="cart-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body">
            <div className="form-row-2">
              <div className="admin-form-group">
                <label className="admin-form-label">Nombre de la Prenda *</label>
                <input
                  type="text"
                  className="admin-form-input"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ej: Baggy Denim Raw Black"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Código SKU</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="ej: MSC-BER-01"
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="admin-form-group">
                <label className="admin-form-label">Categoría *</label>
                <select
                  className="admin-form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {internalCats.map(c => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Precio Regular ($) *</label>
                <input
                  type="number"
                  className="admin-form-input"
                  value={price || ''}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="95000"
                  required
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="admin-form-group">
                <label className="admin-form-label">Precio Tachado de Comparación ($)</label>
                <input
                  type="number"
                  className="admin-form-input"
                  value={comparePrice}
                  onChange={(e) => setComparePrice(e.target.value ? Number(e.target.value) : '')}
                  placeholder="112000"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">% Descuento por Transferencia</label>
                <input
                  type="number"
                  className="admin-form-input"
                  value={transferDiscountPct}
                  onChange={(e) => setTransferDiscountPct(Number(e.target.value))}
                  min="0"
                  max="50"
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Descripción</label>
              <textarea
                className="admin-form-textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalles de corte, tela y calce..."
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Etiquetas / Badges (separadas por coma)</label>
              <input
                type="text"
                className="admin-form-input"
                value={tagsStr}
                onChange={(e) => setTagsStr(e.target.value)}
                placeholder="NUEVO DROP, 15% OFF, DESTACADO"
              />
            </div>

            {/* Image Manager */}
            <div className="admin-form-group">
              <label className="admin-form-label">Fotos del Producto</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input
                  type="url"
                  className="admin-form-input"
                  placeholder="Pegar URL de imagen (https://...)"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                />
                <button
                  type="button"
                  className="btn-admin-cta"
                  onClick={handleAddImageUrl}
                  style={{ flexShrink: 0 }}
                >
                  + Añadir URL
                </button>
              </div>

              <label className="admin-image-upload-box">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: '0 auto 6px', color: '#64748b' }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                  {isUploading ? 'Subiendo imagen a Supabase Storage...' : 'Hacé clic para subir una foto desde tu computadora'}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>PNG, JPG, WEBP</div>
              </label>

              <div className="admin-thumbs-preview">
                {images.map((img, idx) => (
                  <div key={idx} className="preview-thumb-card">
                    <img src={img} alt={`Foto ${idx + 1}`} />
                    <button
                      type="button"
                      className="preview-thumb-remove"
                      onClick={() => handleRemoveImage(idx)}
                      title="Quitar foto"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Sizes & Stock Matrix */}
            <div className="admin-form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="admin-form-label" style={{ marginBottom: 0 }}>Talles y Stock Disponible</label>
                <button
                  type="button"
                  className="btn-table-action"
                  onClick={handleAddSizeRow}
                >
                  + Agregar Talle
                </button>
              </div>

              <table className="size-stock-table">
                <thead>
                  <tr style={{ textAlign: 'left', fontSize: '11px', color: '#64748b' }}>
                    <th>Talle</th>
                    <th>Stock (unid.)</th>
                    <th>Quitar</th>
                  </tr>
                </thead>
                <tbody>
                  {sizes.map((s, idx) => (
                    <tr key={idx}>
                      <td>
                        <input
                          type="text"
                          className="form-input"
                          value={s.size}
                          onChange={(e) => handleUpdateSize(idx, 'size', e.target.value)}
                          style={{ width: '70px' }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-input"
                          value={s.stock}
                          onChange={(e) => handleUpdateSize(idx, 'stock', e.target.value)}
                          min="0"
                          style={{ width: '80px' }}
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-table-action delete"
                          onClick={() => handleRemoveSize(idx)}
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

          <div className="admin-modal-footer">
            <button
              type="button"
              className="btn-table-action"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-admin-cta"
              style={{ background: '#10b981' }}
              disabled={isSaving}
            >
              {isSaving ? 'Guardando en Supabase...' : 'Guardar Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
