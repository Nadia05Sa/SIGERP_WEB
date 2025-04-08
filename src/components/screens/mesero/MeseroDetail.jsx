// MeseroDetail.js
import React from 'react';
import { Modal, Button, Row, Col, Image } from 'react-bootstrap';

/**
 * MeseroDetail - Componente para visualizar los detalles de un mesero
 */
const MeseroDetail = ({ empleado, mesasPorEmpleado, onClose }) => {
    const DEFAULT_IMAGE_URL = 'https://placehold.co/100x100.png';
    
    /**
     * Obtiene los nombres de las mesas asignadas a un empleado
     */
    const getMesasNombres = () => {
        // Si mesas es un array de objetos
        if (empleado.mesas && Array.isArray(empleado.mesas)) {
            return empleado.mesas.map(mesa => 
                mesasPorEmpleado[mesa.id] || `Mesa ${mesa.id}`
            ).join(', ');
        }
        
        // Si mesa es un string de IDs separados por coma
        if (typeof empleado.mesa === 'string') {
            return empleado.mesa.split(',')
                .map(id => id.trim())
                .map(id => mesasPorEmpleado[id] || `Mesa ${id}`)
                .join(', ');
        }
        
        return '';
    };
    
    return (
        <Modal show={true} onHide={onClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Detalles del Mesero</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row className="mb-4">
                    <Col xs={12} className="text-center mb-3">
                        <Image 
                            src={empleado.foto || DEFAULT_IMAGE_URL} 
                            roundedCircle 
                            width={100} 
                            height={100} 
                        />
                    </Col>
                </Row>
                
                <Row className="mb-3">
                    <Col xs={12} md={6}>
                        <h5>Información Personal</h5>
                        <p><strong>Nombre:</strong> {empleado.nombre}</p>
                        <p><strong>Apellido:</strong> {empleado.apellido}</p>
                        <p><strong>Correo:</strong> {empleado.correo}</p>
                        <p><strong>Estado:</strong> {empleado.estado ? 'Activo' : 'Inactivo'}</p>
                    </Col>
                    
                    <Col xs={12} md={6}>
                        <h5>Mesas Asignadas</h5>
                        <p>{getMesasNombres() || 'Sin mesas asignadas'}</p>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Regresar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default MeseroDetail;