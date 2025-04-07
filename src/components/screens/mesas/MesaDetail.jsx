import React from "react";
import { Button, Col, Modal, Row } from "react-bootstrap";

const DEFAULT_IMAGE_URL = "https://placehold.co/100x100.png";

const MesaDetail = ({ mesa, show, onClose }) => {
  // Si no hay mesa, no renderizar nada
  if (!mesa) return null;

  // Función para obtener los nombres de las mesas
  const getMesasNombres = () => {
    if (mesa.mesas && Array.isArray(mesa.mesas)) {
      return mesa.mesas.map((mesa) =>
        mesa.nombre || `Mesa ${mesa.id}`
      ).join(", ");
    }

    // Si mesa.mesa es una cadena, procesarla
    if (typeof mesa.mesa === "string") {
      return mesa.mesa
        .split(",")
        .map((id) => id.trim())
        .map((id) => mesa[id] || `Mesa ${id}`)
        .join(", ");
    }

    return "";
  };

  // Función para obtener la URL de la imagen
  const getImageUrl = (fotoId) => {
    return fotoId
      ? `http://localhost:8080/api/mesas/image/${fotoId}`
      : DEFAULT_IMAGE_URL;
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Detalles de la Mesa</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="mb-4">
          <Col xs={12} className="text-center mb-3">
            <img
              src={getImageUrl(mesa.foto)} // Asegúrate de que 'foto' sea la propiedad correcta
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
            {/* Mostrar los nombres de las mesas relacionadas */}
            <p><strong>Mesas Relacionadas:</strong> {getMesasNombres()}</p>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
};

export default MesaDetail;