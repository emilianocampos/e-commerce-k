import React from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';

export const metadata = {
  title: 'Panel de Administración | TuTienda',
  description: 'Gestión integral de personalización, productos, stock por talle, categorías, banners y pedidos para TuTienda.'
};

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main-wrapper">
        {children}
      </main>
    </div>
  );
}
