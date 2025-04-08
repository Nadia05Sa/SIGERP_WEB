import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';

function HomeForm({ show, onHide, onVentaAdded, isLoading, setIsLoading }) {
  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().slice(0, 10), // Fecha actual en formato YYYY-MM-DD
    ingresos_dia: 0,
    ingresos_tarde: 0,
    gastos_empleados: 0,
    gastos_productos: 0
  });

  // Estado para manejo de errores del formulario
  const [error, setError] = useState('');

  // Manejador para cambios en los campos del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      // Convertir a número para campos numéricos, mantener como string para fecha
      [name]: name === 'fecha' ? value : Number(value)
    });
  };

  // Función para reiniciar el formulario
  const resetForm = () => {
    setFormData({
      fecha: new Date().toISOString().slice(0, 10),
      ingresos_dia: 0,
      ingresos_tarde: 0,
      gastos_empleados: 0,
      gastos_productos: 0
    });
    setError('');
  };

  // Manejador para el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const config = {
        method: 'post',
        url: 'http://localhost:8080/api/ventas/nueva',
        headers: {
          'Content-Type': 'application/json'
        },
        data: formData
      };
      
      await axios.request(config);
      onHide(); // Cerrar el modal
      resetForm(); // Reiniciar formulario
      onVentaAdded(); // Notificar que se agregó una venta
      
    } catch (error) {
      console.error("Error al registrar venta:", error);
      setError(error.response?.data?.message || 'Error al registrar la venta');
    } finally {
      setIsLoading(false);
    }
  };

  // Manejador para cerrar el modal
  const handleClose = () => {
    resetForm();
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Registrar Nueva Venta</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          {/* Campo para fecha */}
          <Form.Group className="mb-3">
            <Form.Label>Fecha</Form.Label>
            <Form.Control 
              type="date" 
              name="fecha" 
              value={formData.fecha} 
              onChange={handleInputChange} 
              required 
            />
          </Form.Group>
          
          {/* Campo para ingresos del día */}
          <Form.Group className="mb-3">
            <Form.Label>Ingresos (Día)</Form.Label>
            <Form.Control 
              type="number" 
              name="ingresos_dia" 
              value={formData.ingresos_dia} 
              onChange={handleInputChange} 
              required 
              min="0" 
              step="0.01"
            />
            <Form.Text className="text-muted">
              Ventas realizadas antes de las 18:00 horas.
            </Form.Text>
          </Form.Group>
          
          {/* Campo para ingresos de la tarde */}
          <Form.Group className="mb-3">
            <Form.Label>Ingresos (Tarde)</Form.Label>
            <Form.Control 
              type="number" 
              name="ingresos_tarde" 
              value={formData.ingresos_tarde} 
              onChange={handleInputChange} 
              required 
              min="0" 
              step="0.01"
            />
            <Form.Text className="text-muted">
              Ventas realizadas después de las 18:00 horas.
            </Form.Text>
          </Form.Group>
          
          {/* Campo para gastos de empleados */}
          <Form.Group className="mb-3">
            <Form.Label>Gastos (Empleados)</Form.Label>
            <Form.Control 
              type="number" 
              name="gastos_empleados" 
              value={formData.gastos_empleados} 
              onChange={handleInputChange} 
              required 
              min="0" 
              step="0.01"
            />
          </Form.Group>
          
          {/* Campo para gastos de productos */}
          <Form.Group className="mb-3">
            <Form.Label>Gastos (Productos)</Form.Label>
            <Form.Control 
              type="number" 
              name="gastos_productos" 
              value={formData.gastos_productos} 
              onChange={handleInputChange} 
              required 
              min="0" 
              step="0.01"
            />
          </Form.Group>
          
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
            <Button variant="danger" type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Registrar Venta'}
            </Button>
          </Modal.Footer>
         
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default HomeForm;