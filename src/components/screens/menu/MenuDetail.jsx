import React from 'react';
import { Modal, Button, Row, Col, Badge } from 'react-bootstrap';

/**
 * MenuDetails - Componente para visualizar los detalles de un producto del menú
 * @param {Object} props.menu - El producto a mostrar
 * @param {Function} props.onClose - Función para cerrar el modal
 */
function MenuDetails({ menu, onClose }) {
  // Si no hay producto, no renderizar nada
  if (!menu) return null;
  
  return (
    <Modal show={true} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Detalles del Producto</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={4} className="text-center mb-3">
            <img
              src={menu.imagen || "https://placehold.co/300x300.png"}
              alt={menu.nombre}
              className="img-fluid rounded"
              style={{ maxHeight: '250px', objectFit: 'cover' }}
            />
          </Col>
          <Col md={8}>
            <h3>{menu.nombre || 'Sin nombre'}</h3>
            
            <h5 className="mt-3">Precio:</h5>
            <p className="text-danger fw-bold">${menu.precio ? menu.precio.toFixed(2) : '0.00'}</p>
            
            <h5 className="mt-3">Descripción:</h5>
            <p>{menu.descripcion || 'Sin descripción'}</p>
            
            <h5 className="mt-3">Estado:</h5>
            <Badge bg={menu.estado ? "success" : "secondary"} className="mb-3">
              {menu.estado ? "Activo" : "Inactivo"}
            </Badge>
            
            <h5 className="mt-3">Categorías:</h5>
            <div>
              {menu.categorias && menu.categorias.length > 0 ? (
                menu.categorias.map((cat, index) => (
                  <Badge key={cat.id || index} bg="danger" className="me-1 mb-1">
                    {cat.nombre}
                  </Badge>
                ))
              ) : (
                <span className="text-muted">Sin categorías</span>
              )}
            </div>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default MenuDetails;