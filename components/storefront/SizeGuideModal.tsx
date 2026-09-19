import React from 'react';

/* ==========================================================================
   Moscú Showroom - Size Guide Modal Component
   ========================================================================== */

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="size-guide-modal active" onClick={onClose}>
      <div className="size-guide-box" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontFamily: 'var(--heading-font)', fontSize: '20px', fontWeight: 700 }}>
            Guía de Talles y Medidas
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', color: '#4b5563' }}
          >
            ×
          </button>
        </div>

        <p style={{ fontSize: '12px', color: '#64748b' }}>
          Medidas corporales de referencia expresadas en centímetros.
        </p>

        <table className="size-guide-table">
          <thead>
            <tr>
              <th>Talle</th>
              <th>Cintura (cm)</th>
              <th>Cadera (cm)</th>
              <th>Largo (cm)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>38 (S)</td><td>74 - 78</td><td>94 - 98</td><td>104</td></tr>
            <tr><td>40 (M)</td><td>79 - 83</td><td>99 - 103</td><td>106</td></tr>
            <tr><td>42 (L)</td><td>84 - 88</td><td>104 - 108</td><td>108</td></tr>
            <tr><td>44 (XL)</td><td>89 - 94</td><td>109 - 114</td><td>110</td></tr>
            <tr><td>46 (XXL)</td><td>95 - 100</td><td>115 - 120</td><td>112</td></tr>
          </tbody>
        </table>

        <div style={{ marginTop: '16px', fontSize: '11px', color: '#6b7280', lineHeight: 1.5 }}>
          * Tip: Nuestras prendas cuentan con moldería de corte holgado / baggy. Si preferís un calce más entallado, te sugerimos elegir un talle menor al habitual.
        </div>
      </div>
    </div>
  );
}
