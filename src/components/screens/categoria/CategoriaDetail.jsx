import React from "react";
import { Button, Col, Modal, Row } from "react-bootstrap";

const DEFAULT_IMAGE_URL = "https://placehold.co/100x100.png";

const CategoriaDetail = ({ categoria, show, onClose }) => {
  // Si no hay categoría, no renderizar nada
  if (!categoria) return null;

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Detalles de la Categoría</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={4} className="text-center mb-3">
            <img
              src={categoria.imagen || DEFAULT_IMAGE_URL}
              alt={categoria.nombre}
              className="img-fluid rounded"
              style={{ maxHeight: '250px', objectFit: 'cover' }}
            />
          </Col>
          <Col md={8}>
            <h5>Información de la Categoría</h5>
            <h5 className="mt-3">Nombre:</h5>
            <p>{categoria.nombre}</p>

            <h5 className="mt-3">Estado:</h5>
            <p>{categoria.estado}</p>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
};

export default CategoriaDetail;