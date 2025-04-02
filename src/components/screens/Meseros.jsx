import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Table, Image, InputGroup } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';
import { FaSearch } from 'react-icons/fa';

// API endpoints
const API_URL = 'http://localhost:8080/api/empleado';
const MESAS_API_URL = 'http://localhost:8080/api/mesas';

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
 * EmpleadoForm - Componente para gestionar meseros (empleados)
 * Permite listar, agregar, editar y visualizar meseros con sus respectivas mesas asignadas
 */
const EmpleadoForm = () => {
    // Form setup with validation
    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
        resolver: yupResolver(schema)
    });
    
    // Component state
    const [showModal, setShowModal] = useState(false);
    const [meseros, setMeseros] = useState([]);
    const [mesas, setMesas] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [currentEmpleadoId, setCurrentEmpleadoId] = useState(null);
    // In a real app, this should come from an auth context or environment variable
    const authToken = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTc0MzU0Mjc5NywiZXhwIjoxNzQzNjI5MTk3fQ.3yb8aXpMifKe0WFTUj-W-BR_oKZmpKThS1EbQuCacQbg-B-_vDXCXLBMmrb7BfCymSoMVlc5G2yWVuMSkYsp0w';
    const [mesasPorEmpleado, setMesasPorEmpleado] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    

    /**
     * Carga las mesas disponibles al iniciar el componente
     */
    useEffect(() => {
        let isMounted = true;
        
        // Obtener todas las mesas
        axios.get(MESAS_API_URL, { 
            headers: { 
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (isMounted) {
                const mesasData = Array.isArray(response.data) ? response.data : [];
                setMesas(mesasData);
                
                // Crear un mapa de ids a nombres de mesa para referencias rápidas
                const mesasMap = {};
                mesasData.forEach(mesa => {
                    mesasMap[mesa.id] = mesa.nombre || `Mesa ${mesa.id}`;
                });
                setMesasPorEmpleado(mesasMap);
            }
        })
        .catch(error => {
            if (isMounted) {
                console.error('Error al obtener mesas', error);
            }
        });
        
        return () => {
            isMounted = false;
        };
    }, [authToken]);

    /**
     * Carga la lista de empleados al iniciar el componente
     */
    useEffect(() => {
        let isMounted = true;
        
        const obtenerEmpleados = async () => {
            try {
                const response = await axios.get(API_URL, {
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    }
                });
                
                if (isMounted) {
                    setMeseros(Array.isArray(response.data) ? response.data : []);
                    console.log("Lista de empleados:", response.data);
                }
            } catch (error) {
                if (isMounted) {
                    console.error("Error al obtener empleados:", error.response ? error.response.data : error.message);
                }
            }
        };

        obtenerEmpleados();
        
        return () => {
            isMounted = false;
        };
    }, [authToken]);

    /**
     * Obtiene la URL de la imagen de un empleado
     * @param {string} empleadoId - ID del empleado
     * @returns {string} URL de la imagen
     */
    const getEmpleadoImageUrl = (empleadoId) => {
        return `http://localhost:8080/api/empleado/image/${empleadoId}`;
    };

    /**
     * Abre el modal en modo de edición y carga los datos del empleado
     * @param {Object} empleado - Datos del empleado a editar
     */
    const handleEdit = (empleado) => {
        setEditMode(true);
        setCurrentEmpleadoId(empleado.id);
        
        // Cargar los datos del empleado en el formulario
        setValue('nombre', empleado.nombre);
        setValue('apellidos', empleado.apellido);
        setValue('correo', empleado.correo);
        setValue('contrasena', ''); // Por seguridad, no mostramos la contraseña actual
        setValue('confirmarContrasena', '');
        setValue('estado', empleado.estado.toString());
        
        // Si las mesas vienen como un array de objetos, extraemos solo los IDs
        if (Array.isArray(empleado.mesas)) {
            setValue('mesas', empleado.mesas.map(mesa => mesa.id));
        } else if (typeof empleado.mesa === 'string') {
            // Si viene como string, intentamos dividirlo (dependiendo del formato)
            const mesaIds = empleado.mesa.split(',').map(id => id.trim());
            setValue('mesas', mesaIds);
        }
        
        setShowModal(true);
    };

    /**
     * Maneja el envío del formulario para agregar o editar un mesero
     * @param {Object} formData - Datos del formulario
     */
    const onSubmit = async (formData) => {
        try {
            // Preparar los datos en el formato requerido por la API
            const mesasArray = Array.isArray(formData.mesas) 
                ? formData.mesas.map(id => ({ id }))
                : [{ id: formData.mesas }];
                
            const data = JSON.stringify({
                foto: "https://placehold.co/100x100.png", // Valor por defecto
                nombre: formData.nombre,
                apellido: formData.apellidos,
                correo: formData.correo,
                contrasena: formData.contrasena,
                estado: formData.estado === "true" || formData.estado === true,
                mesas: mesasArray
            });
            
            let response;
            
            if (editMode) {
                // Configuración para actualizar un empleado existente
                response = await axios({
                    method: 'patch',
                    url: `${API_URL}/id/${currentEmpleadoId}`,
                    headers: { 
                        'Content-Type': 'application/json', 
                        'Authorization': `Bearer ${authToken}`
                    },
                    data: data
                });
            } else {
                // Configuración para agregar un nuevo empleado
                response = await axios({
                    method: 'post',
                    url: API_URL,
                    headers: { 
                        'Content-Type': 'application/json', 
                        'Authorization': `Bearer ${authToken}`
                    },
                    data: data
                });
            }
            
            console.log(JSON.stringify(response.data));
            
            // Actualizar la lista de meseros
            if (editMode) {
                // Actualizar el empleado en la lista
                setMeseros(meseros.map(mesero => 
                    mesero.id === currentEmpleadoId ? response.data : mesero
                ));
            } else {
                // Agregar el nuevo empleado a la lista
                setMeseros([...meseros, response.data]);
            }
            
            // Cerrar modal y limpiar formulario
            handleCloseModal();
        } catch (error) {
            console.error(`Error al ${editMode ? 'actualizar' : 'registrar'} mesero`, error);
            alert(`Error al ${editMode ? 'actualizar' : 'registrar'} mesero: ${error.response?.data?.message || error.message}`);
        }
    };

    /**
     * Cierra el modal y reinicia el formulario
     */
    const handleCloseModal = () => {
        setShowModal(false);
        setEditMode(false);
        setCurrentEmpleadoId(null);
        reset();
    };

    /**
     * Abre el modal para agregar un nuevo empleado
     */
    const handleAddNew = () => {
        setEditMode(false);
        setCurrentEmpleadoId(null);
        reset();
        setShowModal(true);
    };
    
    /**
     * Obtiene los nombres de las mesas asignadas a un empleado
     * @param {Object} empleado - Datos del empleado
     * @returns {string} Nombres de las mesas separados por coma
     */
    const getMesasNombres = (empleado) => {
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

    /**
     * Obtiene la URL de la imagen para mostrar en la tabla
     * @param {Object} mesero - Datos del mesero
     * @returns {string} URL de la imagen
     */
    const getImageToDisplay = (mesero) => {
        if (mesero.foto) {
            return mesero.foto;
        } else if (mesero.id) {
            return getEmpleadoImageUrl(mesero.id);
        }
        return DEFAULT_IMAGE_URL;
    };

    /**
     * Maneja el cambio de estado (activo/inactivo) de un empleado
     * @param {Object} empleado - Datos del empleado a actualizar
     */
    const handleToggleEstado = async (empleado) => {
        try {
            // Preparar datos para la solicitud
            const nuevoEstado = !empleado.estado;
            const data = JSON.stringify({
                "estado": nuevoEstado
            });
            
            // Configuración de la solicitud
            const config = {
                method: 'patch',
                url: `${API_URL}/${empleado.id}/estado`,
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${authToken}`
                },
                data: data
            };
            
            // Realizar la solicitud
            const response = await axios(config);
            console.log("Estado actualizado:", JSON.stringify(response.data));
            
            // Actualizar el estado local
            setMeseros(meseros.map(mesero => 
                mesero.id === empleado.id 
                    ? { ...mesero, estado: nuevoEstado } 
                    : mesero
            ));
            
        } catch (error) {
            console.error("Error al cambiar el estado:", error);
            alert(`Error al cambiar el estado: ${error.response?.data?.message || error.message}`);
        }
    };

    // Filtrar meseros basado en el término de búsqueda
    const filteredMeseros = meseros.filter(mesero => 
        `${mesero.nombre || ''} ${mesero.apellido || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container-fluid p-4">
            {/* Header con título y botón para agregar */}
            <div className="d-flex justify-content-between align-items-center">
                <h3>Gestión de Meseros</h3>
                <Button className="btn btn-danger" onClick={handleAddNew}>+ Agregar</Button>
            </div>
            <hr/>

            {/* Barra de búsqueda */}
            <InputGroup className="mb-3">
                <InputGroup.Text className="bg-danger text-white">
                    <FaSearch />
                </InputGroup.Text>
                <Form.Control
                    type="text"
                    placeholder="Buscar por nombre de Meseros..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </InputGroup>
            
            {/* Tabla de meseros */}
            <Table striped bordered hover responsive>
                <thead className="table-danger">
                    <tr>
                        <th>Foto</th>
                        <th>Nombre</th>
                        <th>Correo</th>
                        <th>Estado</th>
                        <th>Mesas</th>
                        <th>Editar</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredMeseros.map((mesero, index) => (
                        <tr key={index}>
                            <td>
                                <Image 
                                    src={getImageToDisplay(mesero)} 
                                    alt={mesero.nombre} 
                                    className="rounded" 
                                    width="50" 
                                    onError={(e) => {
                                        e.target.onerror = null; 
                                        e.target.src = DEFAULT_IMAGE_URL;
                                    }}
                                />
                            </td>
                            <td>{`${mesero.nombre || ''} ${mesero.apellido || ''}`}</td>
                            <td>{mesero.correo}</td>
                            <td>
                                <Button 
                                    variant={mesero.estado ? "success" : "secondary"}
                                    size="sm"
                                    onClick={() => handleToggleEstado(mesero)}
                                >
                                    {mesero.estado ? 'Activo' : 'Inactivo'}
                                </Button>
                            </td>
                            <td>{getMesasNombres(mesero)}</td>
                            <td>
                                <Button 
                                    className="btn btn-danger" 
                                    onClick={() => handleEdit(mesero)}
                                >
                                    Editar
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            
            {/* Modal para agregar/editar mesero */}
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{editMode ? 'Editar Mesero' : 'Registrar Mesero'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit(onSubmit)}>
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
                            <Button variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
                            <Button variant="danger" type="submit">
                                {editMode ? 'Actualizar' : 'Agregar'}
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default EmpleadoForm;