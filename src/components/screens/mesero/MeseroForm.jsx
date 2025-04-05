// MeseroForm.js
import React from 'react';
import { Modal, Button, Form, Image } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Default image URL
const DEFAULT_IMAGE_URL = 'https://placehold.co/100x100.png';

// Form validation schema
const schema = yup.object().shape({
    nombre: yup.string().required('El nombre es obligatorio'),
    apellidos: yup.string().required('Los apellidos son obligatorios'),
    correo: yup.string().email('Correo inválido').required('El correo es obligatorio'),
    contrasena: yup.string().min(4, 'Mínimo 4 caracteres').required('La contraseña es obligatoria'),
    confirmarContrasena: yup.string()
        .oneOf([yup.ref('contrasena')], 'Las contraseñas no coinciden')
        .required('Debes confirmar la contraseña'),
    estado: yup.boolean().required('El estado es obligatorio'),
    mesas: yup.array().min(1, 'Selecciona al menos una mesa')
});

/**
 * MeseroForm - Componente para agregar o editar un mesero
 */
const MeseroForm = ({ show, onHide, onSave, empleado, editMode, mesas }) => {
    // Form setup with validation
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: yupResolver(schema),
        defaultValues: editMode && empleado ? {
            nombre: empleado.nombre || '',
            apellidos: empleado.apellido || '',
            correo: empleado.correo || '',
            contrasena: '', // Por seguridad, no mostramos la contraseña actual
            confirmarContrasena: '',
            estado: empleado.estado?.toString() || 'true',
            mesas: Array.isArray(empleado.mesas) 
                ? empleado.mesas.map(mesa => mesa.id) 
                : []
        } : {
            estado: 'true'
        }
    });
    
    /**
     * Maneja el envío del formulario
     */
    const submitForm = (data) => {
        onSave(data);
        reset();
    };
    
    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>{editMode ? 'Editar Mesero' : 'Registrar Mesero'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit(submitForm)}>
                    {/* Imagen fija */}
                    <div className="d-flex justify-content-center mb-3">
                        <Image 
                            src={DEFAULT_IMAGE_URL} 
                            alt="Imagen predeterminada" 
                            className="rounded" 
                            width="80" 
                            height="80"
                        />
                    </div>
                    <p className="text-center text-muted mb-4">Imagen predeterminada de empleado</p>
                    
                    {/* Campos para información personal */}
                    <Form.Group className="mb-3">
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control type="text" {...register('nombre')} />
                        <p className="text-danger">{errors.nombre?.message}</p>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Apellidos</Form.Label>
                        <Form.Control type="text" {...register('apellidos')} />
                        <p className="text-danger">{errors.apellidos?.message}</p>
                    </Form.Group>
                    
                    {/* Campos para información de acceso */}
                    <Form.Group className="mb-3">
                        <Form.Label>Correo</Form.Label>
                        <Form.Control type="email" {...register('correo')} />
                        <p className="text-danger">{errors.correo?.message}</p>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Contraseña</Form.Label>
                        <Form.Control type="password" {...register('contrasena')} />
                        <p className="text-danger">{errors.contrasena?.message}</p>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Confirmar Contraseña</Form.Label>
                        <Form.Control type="password" {...register('confirmarContrasena')} />
                        <p className="text-danger">{errors.confirmarContrasena?.message}</p>
                    </Form.Group>
                    
                    {/* Campos para información laboral */}
                    <Form.Group className="mb-3">
                        <Form.Label>Estado</Form.Label>
                        <Form.Select {...register('estado')}>
                            <option value="true">Activo</option>
                            <option value="false">Inactivo</option>
                        </Form.Select>
                    </Form.Group>
                    
                    {/* Selección de mesas asignadas */}
                    <Form.Group className="mb-3">
                        <Form.Label>Mesas</Form.Label>
                        <Form.Select multiple {...register('mesas')} style={{ height: '150px' }}>
                            {mesas.map(mesa => (
                                <option key={mesa.id} value={mesa.id}>
                                    {mesa.nombre || `Mesa ${mesa.id}`}
                                </option>
                            ))}
                        </Form.Select>
                        <small className="text-muted">Mantenga presionado Ctrl (o Cmd en Mac) para seleccionar múltiples mesas</small>
                        <p className="text-danger">{errors.mesas?.message}</p>
                    </Form.Group>
                    
                    {/* Botones del modal */}
                    <Modal.Footer>
                        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
                        <Button variant="danger" type="submit">
                            {editMode ? 'Actualizar' : 'Agregar'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default MeseroForm;