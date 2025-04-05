import React from "react";
import { Button, Col, Modal, Row } from "react-bootstrap";

const DEFAULT_IMAGE_URL = "https://placehold.co/100x100.png";

const MesaDetail = ({ mesa, show, onClose }) => {
  if (!mesa) return null;

  const getMesasNombres = () => {
    if (mesa.mesas && Array.isArray(mesa.mesas)) {
      return mesa.mesas.map((mesa) =>
        mesa.nombre || `Mesa ${mesa.id}`
      ).join(", ");
    }

    if (typeof mesa.mesa === "string") {
      return mesa.mesa
        .split(",")
        .map((id) => id.trim())
        .map((id) => mesa[id] || `Mesa ${id}`)
        .join(", ");
    }

    return "";
  };

  const getImageUrl = (fotoId) => {
    return fotoId
      ? `http://localhost:8080/api/mesas/image/${fotoId}`
      : DEFAULT_IMAGE_URL;
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Detalles Mesas</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="mb-4">
          <Col xs={12} className="text-center mb-3">
            <img
              src={getImageUrl(mesa?.foto)}
              alt="Mesa"
              className="rounded-circle"
              width={100}
              height={100}
            />
          </Col>
        </Row>
        <Row className="mb-3">
          <Col xs={12} md={6}>
            <h5>Información de la Mesa</h5>
            <p><strong>ID:</strong> {mesa.id}</p>
            <p><strong>Nombre:</strong> {mesa.nombre}</p>
            <p><strong>Capacidad:</strong> {mesa.capacidad}</p>
            <p><strong>Estado:</strong> {mesa.estado ? 'Activo' : 'Inactivo'}</p>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
};

export default MesaDetail;
