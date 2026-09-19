'use client';

/* ==========================================================================
   Moscú Showroom - Admin Orders Management Page (Next.js App Router)
   ========================================================================== */

import React, { useState, useEffect } from 'react';
import AdminTopbar from '../../../components/admin/AdminTopbar';
import { getOrders, updateOrderStatus } from '../../../lib/supabaseClient';
import { Order } from '../../../lib/types';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const loadData = async () => {
    const ords = await getOrders();
    setOrders(ords);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    await updateOrderStatus(orderId, newStatus);
    loadData();
  };

  const filteredOrders = orders.filter(o => {
    if (statusFilter === 'all') return true;
    return o.status === statusFilter;
  });

  return (
    <div>
      <AdminTopbar title="Gestión de Pedidos & Despachos" />

      <div style={{ padding: '24px 30px' }}>
        {/* Filters Card */}
        <div className="admin-card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Filtrar por Estado:</span>
            {['all', 'Pendiente', 'Pagado', 'En preparación', 'Enviado', 'Entregado', 'Cancelado'].map(st => (
              <button
                key={st}
                type="button"
                className={`cat-pill ${statusFilter === st ? 'active' : ''}`}
                onClick={() => setStatusFilter(st)}
                style={{ textTransform: 'capitalize' }}
              >
                {st === 'all' ? 'Todos los Pedidos' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="admin-card">
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID Pedido & Fecha</th>
                  <th>Cliente</th>
                  <th>Prendas</th>
                  <th>Total</th>
                  <th>Método Pago & Envío</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id}>
                    <td>
                      <strong style={{ fontFamily: 'monospace', fontSize: '13px' }}>#{order.id}</strong>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {new Date(order.date).toLocaleString('es-AR')}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{order.customer?.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {order.customer?.email} • {order.customer?.phone}
                      </div>
                      {order.customer?.dni && (
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>DNI: {order.customer.dni}</div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: '12px' }}>
                        {order.items?.map((item, idx) => (
                          <div key={idx} style={{ color: '#334155' }}>
                            • {item.quantity}x {item.name} <strong>({item.size})</strong>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <strong style={{ fontSize: '14px' }}>${order.total.toLocaleString('es-AR')}</strong>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', fontWeight: 600 }}>
                        {order.payment?.method === 'transferencia' ? '💵 Transferencia 15% OFF' : '💳 Mercado Pago'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        🚚 {order.shipping?.name}
                      </div>
                    </td>
                    <td>
                      <select
                        className="admin-form-input"
                        style={{ padding: '4px 8px', fontSize: '12px', width: 'auto', fontWeight: 600 }}
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="Pagado">Pagado</option>
                        <option value="En preparación">En preparación</option>
                        <option value="Enviado">Enviado</option>
                        <option value="Entregado">Entregado</option>
                        <option value="Cancelado">Cancelado</option>
                      </select>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn-table-action"
                          onClick={() => setSelectedOrder(order)}
                          title="Ver detalle completo"
                        >
                          👁️ Detalle
                        </button>
                        {order.customer?.phone && (
                          <a
                            href={`https://wa.me/${order.customer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `Hola ${order.customer.name}! Nos comunicamos de TuTienda sobre tu pedido #${order.id}.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-table-action"
                            style={{ background: '#dcfce7', color: '#166534', borderColor: '#86efac' }}
                            title="Contactar por WhatsApp"
                          >
                            💬 WhatsApp
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="admin-modal-overlay active" onClick={() => setSelectedOrder(null)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="admin-modal-header">
              <h3>Detalle del Pedido #{selectedOrder.id}</h3>
              <button type="button" className="cart-close-btn" onClick={() => setSelectedOrder(null)}>
                ×
              </button>
            </div>
            <div style={{ padding: '20px', fontSize: '13px', lineHeight: 1.6 }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>Datos del Comprador</h4>
                <div><strong>Nombre:</strong> {selectedOrder.customer.name}</div>
                <div><strong>Email:</strong> {selectedOrder.customer.email}</div>
                <div><strong>Teléfono:</strong> {selectedOrder.customer.phone}</div>
                <div><strong>DNI:</strong> {selectedOrder.customer.dni}</div>
                {selectedOrder.customer.address?.street && (
                  <div style={{ marginTop: '6px' }}>
                    <strong>Dirección de Entrega:</strong> {selectedOrder.customer.address.street} {selectedOrder.customer.address.number || ''}
                    {selectedOrder.customer.address.floor ? ` (Piso/Dpto: ${selectedOrder.customer.address.floor})` : ''},{' '}
                    {selectedOrder.customer.address.city}, {selectedOrder.customer.address.province} (CP {selectedOrder.customer.address.postalCode})
                  </div>
                )}
              </div>

              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Prendas Pedidas</h4>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden', marginBottom: '14px' }}>
                {selectedOrder.items?.map((it, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      borderBottom: idx < selectedOrder.items.length - 1 ? '1px solid #f1f5f9' : 'none'
                    }}
                  >
                    <img src={it.image} alt={it.name} style={{ width: '38px', height: '48px', objectFit: 'cover', borderRadius: '3px' }} />
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ fontWeight: 600 }}>{it.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Talle: {it.size} • Cantidad: {it.quantity}</div>
                    </div>
                    <strong>${(it.price * it.quantity).toLocaleString('es-AR')}</strong>
                  </div>
                ))}
              </div>

              <div style={{ background: '#f1f5f9', padding: '12px', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal:</span>
                  <span>${selectedOrder.subtotal.toLocaleString('es-AR')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Envío ({selectedOrder.shipping?.name}):</span>
                  <span>${(selectedOrder.shipping?.cost || 0).toLocaleString('es-AR')}</span>
                </div>
                {selectedOrder.payment?.discountAmount ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#15803d' }}>
                    <span>Descuento aplicado:</span>
                    <span>-${selectedOrder.payment.discountAmount.toLocaleString('es-AR')}</span>
                  </div>
                ) : null}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '15px', borderTop: '1px solid #cbd5e1', paddingTop: '6px', marginTop: '6px' }}>
                  <span>Total Final:</span>
                  <span>${selectedOrder.total.toLocaleString('es-AR')}</span>
                </div>
              </div>

              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn-admin-cta"
                  onClick={() => setSelectedOrder(null)}
                >
                  Cerrar Detalle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
