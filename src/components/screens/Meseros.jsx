// EmpleadoForm.js (Main Container Component)
import React, { useState, useEffect } from 'react';
import { Button, InputGroup, Form } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import axios from 'axios';
import MeseroList from './mesero/MeseroList';
import MeseroDetail from './mesero/MeseroDetail';
import MeseroForm from './mesero/MeseroForm';
import { useDebounce } from 'use-debounce'; // Importar useDebounce
import Swal from 'sweetalert2'; // Importar SweetAlert2
import '../../App.css';
import authService from '../../service/authService';

// API endpoints
const API_URL = 'http://localhost:8080/api/empleado';
const MESAS_API_URL = 'http://localhost:8080/api/mesas';

// Default image URL
const DEFAULT_IMAGE_URL = 'https://placehold.co/100x100.png';

/**
 * EmpleadoForm - Componente principal para gestionar meseros (empleados)
 * Coordina los componentes hijos y mantiene el estado global
 */
const EmpleadoForm = () => {
    // Component state
    const [meseros, setMeseros] = useState([]);
    const [mesas, setMesas] = useState([]);
    const [mesasPorEmpleado, setMesasPorEmpleado] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 300); // Debounce para la búsqueda
    const [showModal, setShowModal] = useState(false);
    const [showDetailView, setShowDetailView] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentEmpleado, setCurrentEmpleado] = useState(null);
    const [authToken, setAuthToken] = useState("");

    // In a real app, this should come from an auth context or environment variable

    /**
     * Carga las mesas disponibles al iniciar el componente
     */
    useEffect(() => {
        const token = authService.getCurrentToken(); 
        setAuthToken(token);
    
        if (authToken) {
            loadEmpleados();
            // Obtener todas las mesas
            axios.get(MESAS_API_URL, { 
                headers: { 
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                const mesasData = Array.isArray(response.data) ? response.data : [];
                setMesas(mesasData);
                
                // Crear un mapa de ids a nombres de mesa para referencias rápidas
                const mesasMap = {};
                mesasData.forEach(mesa => {
                    mesasMap[mesa.id] = mesa.nombre || `Mesa ${mesa.id}`;
                });
                setMesasPorEmpleado(mesasMap);
            })
            .catch(error => {
                console.error('Error al obtener mesas', error);
            });
        }
    }, [authToken]); // Solo se ejecuta cuando authToken cambia

    /**
     * Carga la lista de empleados desde la API
     */
    const loadEmpleados = async () => {
        try {
            const response = await axios.get(API_URL, {
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            });
            
            setMeseros(Array.isArray(response.data) ? response.data : []);
            console.log("Lista de empleados:", response.data);
        } catch (error) {
            console.error("Error al obtener empleados:", error.response ? error.response.data : error.message);
        }
    };

    /**
     * Obtiene un empleado específico por ID
     */
    const getEmpleadoById = async (id) => {
        try {
            const response = await axios({
                method: 'get',
                url: `${API_URL}/id/${id}`,
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${authToken}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error al obtener datos del empleado:", error);
            return null;
        }
    };

    /**
     * Abre el modal en modo visualización y carga los datos del empleado
     */
    const handleViewDetails = async (empleadoId) => {
        const empleado = await getEmpleadoById(empleadoId);
        if (empleado) {
            setCurrentEmpleado(empleado);
            setShowDetailView(true);
        }
    };

    /**
     * Abre el modal en modo de edición y carga los datos del empleado
     */
    const handleEdit = async (empleadoId) => {
        const empleado = await getEmpleadoById(empleadoId);
        if (empleado) {
            setCurrentEmpleado(empleado);
            setEditMode(true);
            setShowModal(true);
        }
    };

    /**
     * Abre el modal para agregar un nuevo empleado
     */
    const handleAddNew = () => {
        setEditMode(false);
        setCurrentEmpleado(null);
        setShowModal(true);
    };

    /**
     * Cierra el modal de detalles
     */
    const handleCloseDetailView = () => {
        setShowDetailView(false);
        setCurrentEmpleado(null);
    };

    /**
     * Cierra el modal de formulario
     */
    const handleCloseModal = () => {
        setShowModal(false);
        setEditMode(false);
        setCurrentEmpleado(null);
    };

    /**
     * Maneja el cambio de estado (activo/inactivo) de un empleado
     */
    const handleToggleEstado = async (empleado) => {
        const nuevoEstado = !empleado.estado;
        const confirmResult = await Swal.fire({
            title: 'Cambiar estado',
            text: `¿Estás seguro de que deseas cambiar el estado a ${nuevoEstado ? 'Activo' : 'Inactivo'}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, cambiar',
            cancelButtonText: 'Cancelar'
        });

        if (confirmResult.isConfirmed) {
            try {
                // Preparar datos para la solicitud
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
                await axios(config);
                
                // Actualizar el estado local
                setMeseros(meseros.map(mesero => 
                    mesero.id === empleado.id 
                        ? { ...mesero, estado: nuevoEstado } 
                        : mesero
                ));
                
                // Mostrar mensaje de éxito
                Swal.fire(
                    'Estado cambiado!',
                    `El estado del empleado ${empleado.nombre} ha sido cambiado a ${nuevoEstado ? 'Activo' : 'Inactivo'}.`,
                    'success'
                );
                
            } catch (error) {
                console.error("Error al cambiar el estado:", error);
                Swal.fire(
                    'Error!',
                    'No se pudo cambiar el estado del empleado.',
                    'error'
                );
            }
        }
    };

    /**
     * Guarda un nuevo empleado o actualiza uno existente
     */
    const handleSaveEmpleado = async (formData) => {
        try {
            // Preparar los datos en el formato requerido por la API
            const mesasArray = Array.isArray(formData.mesas) 
                ? formData.mesas.map(id => ({ id }))
                : [{ id: formData.mesas }];
                
            const data = JSON.stringify({
                foto: DEFAULT_IMAGE_URL, // Valor por defecto
                nombre: formData.nombre,
                apellido: formData.apellidos,
                correo: formData.correo,
                contrasena: formData.contrasena,
                estado: formData.estado === "true" || formData.estado === true,
                mesas: mesasArray
            });
            
            if (editMode && currentEmpleado) {
                // Actualizar un empleado existente
                await axios({
                    method: 'patch',
                    url: `${API_URL}/id/${currentEmpleado.id}`,
                    headers: { 
                        'Content-Type': 'application/json', 
                        'Authorization': `Bearer ${authToken}`
                    },
                    data: data
                });
            } else {
                // Agregar un nuevo empleado
                await axios({
                    method: 'post',
                    url: API_URL,
                    headers: { 
                        'Content-Type': 'application/json', 
                        'Authorization': `Bearer ${authToken}`
                    },
                    data: data
                });
            }
            
            // Recargar la lista de empleados para mostrar los cambios
            loadEmpleados();
            
            // Cerrar modal
            handleCloseModal();
        } catch (error) {
            console.error(`Error al ${editMode ? 'actualizar' : 'registrar'} mesero`, error);
            Swal.fire(
                'Error!',
                `Error al ${editMode ? 'actualizar' : 'registrar'} mesero: ${error.response?.data?.message || error.message}`,
                'error'
            );
        }
    };

    // Filtrar meseros basado en el término de búsqueda
    const filteredMeseros = meseros.filter(mesero => 
        `${mesero.nombre || ''} ${mesero.apellido || ''}`.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
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

            {/* Lista de meseros */}
            <MeseroList 
                meseros={filteredMeseros} 
                onView={handleViewDetails}
                onEdit={handleEdit}
                onToggleStatus={handleToggleEstado}
            />
            
            {/* Modal para ver detalles de un mesero */}
            {showDetailView && currentEmpleado && (
                <MeseroDetail
                    empleado={currentEmpleado}
                    mesas={mesas}
                    mesasPorEmpleado={mesasPorEmpleado}
                    onClose={handleCloseDetailView}
                />
            )}
            
            {/* Modal para agregar/editar mesero */}
            {showModal && (
                <MeseroForm 
                    show={showModal}
                    onHide={handleCloseModal}
                    onSave={handleSaveEmpleado}
                    empleado={currentEmpleado}
                    editMode={editMode}
                    mesas={mesas}
                />
            )}
        </div>
    );
};

export default EmpleadoForm;