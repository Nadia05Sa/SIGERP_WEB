import React from "react";
import { Button, Col, Modal, Row } from "react-bootstrap";

const DEFAULT_IMAGE_URL = "https://placehold.co/100x100.png";

const MesaDetail = ({ mesa, show, onClose }) => {
  // Si no hay mesa, no renderizar nada
  if (!mesa) return null;

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Detalles de la Mesa</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={4} className="text-center mb-3">
            <img
              src={mesa.imagen || DEFAULT_IMAGE_URL} // Cambia 'image' a 'imagen'
              alt={mesa.nombre}
              className="img-fluid rounded"
              style={{ maxHeight: '250px', objectFit: 'cover' }}
            />
          </Col>
          <Col md={8}>
            <h5>Información de la Mesa</h5>
            <h5 className="mt-3">Nombre:</h5>
            <p>{mesa.nombre}</p>

            <h5 className="mt-3">Capacidad:</h5>
            <p>{mesa.capacidad}</p>
            
            <h5 className="mt-3">Estado:</h5>
            <p>{mesa.estado ? "Activo" : "Inactivo"}</p>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
};

export default MesaDetail;