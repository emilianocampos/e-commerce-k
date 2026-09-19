'use client';

/* ==========================================================================
   Moscú Showroom - Admin Sales Visualizer Chart
   ========================================================================== */

import React from 'react';

export default function SalesChart() {
  const days = [
    { name: 'Lun', value: 145000 },
    { name: 'Mar', value: 210000 },
    { name: 'Mié', value: 280000 },
    { name: 'Jue', value: 390000 },
    { name: 'Vie', value: 340000 },
    { name: 'Sáb', value: 520000 },
    { name: 'Dom', value: 430000 }
  ];

  const maxVal = Math.max(...days.map(d => d.value));

  return (
    <div className="sales-chart-container">
      {days.map(d => {
        const heightPct = Math.round((d.value / maxVal) * 85);
        return (
          <div key={d.name} className="chart-bar-group">
            <div
              className="chart-bar"
              style={{ height: `${heightPct}%` }}
              data-tooltip={`$${d.value.toLocaleString('es-AR')}`}
            />
            <span className="chart-bar-label">{d.name}</span>
          </div>
        );
      })}
    </div>
  );
}
