'use client';

/* ==========================================================================
   Moscú Showroom - Admin Dashboard (Next.js App Router)
   ========================================================================== */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminTopbar from '../../components/admin/AdminTopbar';
import SalesChart from '../../components/admin/SalesChart';
import ProductFormModal from '../../components/admin/ProductFormModal';
import { getOrders, getProducts, getSettings, ensureInitialData } from '../../lib/supabaseClient';
import { Order, Product, StoreSettings } from '../../lib/types';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  useEffect(() => {
    ensureInitialData();
    const loadData = async () => {
      const [ord, prod, sett] = await Promise.all([
        getOrders(),
        getProducts(),
        getSettings()
      ]);
      setOrders(ord);
      setProducts(prod);
      setSettings(sett);
    };
    loadData();
  }, []);

  const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrders = orders.length;
  const avgTicket = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;

  // Critical stock calculation: products with any size having stock <= 2
  const lowStockCount = products.filter(p =>
    p.sizes && p.sizes.some(s => s.stock <= 2)
  ).length;

  return (
    <div>
      <AdminTopbar
        title="Dashboard & Métricas"
        onNewProduct={() => setIsProductModalOpen(true)}
      />

      <div style={{ padding: '24px 30px' }}>
        {/* KPIs Grid */}
        <div className="admin-kpis-grid">
          <div className="kpi-card">
            <div className="kpi-card-top">
              <span className="kpi-title">Ventas Totales</span>
              <div className="kpi-icon-wrap">💵</div>
            </div>
            <div className="kpi-value">${totalSales.toLocaleString('es-AR')}</div>
            <div className="kpi-sub">↑ +18.4% vs período anterior</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-card-top">
              <span className="kpi-title">Total Pedidos</span>
              <div className="kpi-icon-wrap">📦</div>
            </div>
            <div className="kpi-value">{totalOrders}</div>
            <div className="kpi-sub">↑ Órdenes registradas</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-card-top">
              <span className="kpi-title">Ticket Promedio</span>
              <div className="kpi-icon-wrap">🎯</div>
            </div>
            <div className="kpi-value">${avgTicket.toLocaleString('es-AR')}</div>
            <div className="kpi-sub">Objetivo: $98.500</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-card-top">
              <span className="kpi-title">Stock Crítico</span>
              <div className="kpi-icon-wrap">⚠️</div>
            </div>
            <div className="kpi-value">{lowStockCount}</div>
            <div className="kpi-sub warning">Prendas con talles ≤ 2 unid.</div>
          </div>
        </div>

        {/* Analytics & Summary Grid */}
        <div className="admin-analytics-grid">
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title">Evolución Semanal de Ventas</h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Moneda: ARS ($)</span>
            </div>
            <SalesChart />
          </div>

          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title">Resumen de Tienda</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Financiación activa:</span>
                <strong>{settings?.cuotasSinInteres || 6} Cuotas Sin Interés</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Descuento Transferencia:</span>
                <strong style={{ color: '#15803d' }}>{settings?.transferDiscountPct || 15}% OFF</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Envío gratis desde:</span>
                <strong>${(settings?.freeShippingThreshold || 150000).toLocaleString('es-AR')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Showroom Físico:</span>
                <span>Ayacucho, 9 de Julio 837</span>
              </div>
              <Link
                href="/admin/configuracion"
                className="btn-table-action"
                style={{ textAlign: 'center', marginTop: '10px', padding: '10px' }}
              >
                Editar Configuración
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="admin-card" style={{ marginTop: '24px' }}>
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">Últimos Pedidos Registrados</h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                Control y estado de despachos de clientes
              </p>
            </div>
            <Link href="/admin/pedidos" className="section-view-all" style={{ fontSize: '13px' }}>
              Ver Todos los Pedidos →
            </Link>
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID Pedido</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Método de Pago</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map(order => (
                  <tr key={order.id}>
                    <td>
                      <strong style={{ fontFamily: 'monospace' }}>#{order.id}</strong>
                    </td>
                    <td style={{ fontSize: '12px', color: '#64748b' }}>
                      {new Date(order.date).toLocaleDateString('es-AR')}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{order.customer?.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{order.customer?.phone}</div>
                    </td>
                    <td>
                      <strong>${order.total.toLocaleString('es-AR')}</strong>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', textTransform: 'capitalize' }}>
                        {order.payment?.method === 'transferencia' ? '💵 Transferencia' : '💳 Mercado Pago'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${order.status === 'Pagado' ? 'success' : order.status === 'Enviado' ? 'info' : 'warning'}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Product CRUD Modal */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSaved={async () => {
          const prods = await getProducts();
          setProducts(prods);
        }}
      />
    </div>
  );
}
