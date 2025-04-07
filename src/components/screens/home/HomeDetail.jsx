import React from 'react';
import { Modal, Button, Table } from 'react-bootstrap';

function HomeDetail({ ventas, show, onHide }) {
  if (!ventas || ventas.length === 0) {
    return null;
  }

  // Formatear la fecha para mostrarla más legible
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Detalle de Ventas - {formatDate(ventas[0].fecha)}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Ingresos Día</th>
              <th>Ingresos Tarde</th>
              <th>Gastos Empleados</th>
              <th>Gastos Productos</th>
              <th>Beneficio</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((venta, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>${Number(venta.ingresos_dia || 0).toFixed(2)}</td>
                <td>${Number(venta.ingresos_tarde || 0).toFixed(2)}</td>
                <td>${Number(venta.gastos_empleados || 0).toFixed(2)}</td>
                <td>${Number(venta.gastos_productos || 0).toFixed(2)}</td>
                <td>${Number(venta.beneficios || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="table-dark">
              <th>Total</th>
              <th>
                ${ventas.reduce((sum, v) => sum + Number(v.ingresos_dia || 0), 0).toFixed(2)}
              </th>
              <th>
                ${ventas.reduce((sum, v) => sum + Number(v.ingresos_tarde || 0), 0).toFixed(2)}
              </th>
              <th>
                ${ventas.reduce((sum, v) => sum + Number(v.gastos_empleados || 0), 0).toFixed(2)}
              </th>
              <th>
                ${ventas.reduce((sum, v) => sum + Number(v.gastos_productos || 0), 0).toFixed(2)}
              </th>
              <th>
                ${ventas.reduce((sum, v) => sum + Number(v.beneficios || 0), 0).toFixed(2)}
              </th>
            </tr>
          </tfoot>
        </Table>

        <div className="mt-3">
          <h6>Resumen:</h6>
          <ul className="list-group">
            <li className="list-group-item d-flex justify-content-between align-items-center">
              Total Ingresos Día
              <span className="badge bg-primary rounded-pill">
                ${ventas.reduce((sum, v) => sum + Number(v.ingresos_dia || 0), 0).toFixed(2)}
              </span>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center">
              Total Ingresos Tarde
              <span className="badge bg-primary rounded-pill">
                ${ventas.reduce((sum, v) => sum + Number(v.ingresos_tarde || 0), 0).toFixed(2)}
              </span>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center">
              Total Gastos Empleados
              <span className="badge bg-danger rounded-pill">
                ${ventas.reduce((sum, v) => sum + Number(v.gastos_empleados || 0), 0).toFixed(2)}
              </span>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center">
              Total Gastos Productos
              <span className="badge bg-danger rounded-pill">
                ${ventas.reduce((sum, v) => sum + Number(v.gastos_productos || 0), 0).toFixed(2)}
              </span>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center">
              Beneficio Total
              <span className="badge bg-success rounded-pill">
                ${ventas.reduce((sum, v) => sum + Number(v.beneficios || 0), 0).toFixed(2)}
              </span>
            </li>
          </ul>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default HomeDetail;