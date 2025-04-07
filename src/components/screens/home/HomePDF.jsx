import React from 'react';
import { Button } from 'react-bootstrap';
import autoTable from 'jspdf-autotable';
import { jsPDF } from 'jspdf';

function HomePDF({ ventas }) {
  async function generatePDF() {
    const post = ventas;

    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Registros de ventas de la semana", 14, 15);

    const columns = [
      "Fecha",
      "Ingresos del día",
      "Ingresos de la tarde",
      "Gastos de empleados",
      "Gastos de productos",
      "Beneficios totales"
    ];

    const rows = [];

    for (let i = 0; i < post.length; i++) {
      const data = [
        new Date(post[i].fecha).toLocaleDateString(),
        post[i].ingresos_dia,
        post[i].ingresos_tarde,
        post[i].gastos_empleados,
        post[i].gastos_productos,
        post[i].beneficios
      ];
      rows.push(data);
    }

    autoTable(doc, {
      head: [columns],
      body: rows,
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 3,
        halign: 'center',
        valign: 'middle'
      },
      startY: 20
    });

    doc.save("reporte-ventas.pdf");
  }

  return (
    <Button
      variant="danger"
      onClick={generatePDF}
      title="Generar PDF"
    >
      Generar PDF
    </Button>
  );
}

export default HomePDF;