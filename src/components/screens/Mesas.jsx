import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Modal, Form, Table, InputGroup } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Sidebar from "./Sidebar";
import authService from "../../service/authService";

const API_URL = "http://localhost:8080/api/mesas";

// Esquema de validación con Yup
const schema = yup.object().shape({
  img: yup
    .mixed()
    .required('La imagen es obligatoria')
    .test('fileSize', 'El archivo es muy grande (máx. 2MB)', (value) => 
      value && value[0] && value[0].size <= 2000000
    )
    .test('fileType', 'Formato no soportado (solo JPG/PNG)', (value) =>
      value && value[0] && ['image/jpeg', 'image/png', 'image/jpg'].includes(value[0].type)
    ),
  mesa: yup.string().required('El nombre de la mesa es obligatorio').min(3, 'Debe tener al menos 3 caracteres'),
  capacidad: yup
    .number()
    .typeError('Debe ser un número')
    .required('La capacidad es obligatoria')
    .min(1, 'Debe ser al menos 1 persona')
    .max(20, 'Máximo 20 personas'),
  estado: yup.string().required('El estado es obligatorio'),
});

function GestionMesas() {
  const [mesasData, setMesasData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema)
  });

  // Configuración común para las peticiones HTTP usando el token dinámico
  const getRequestConfig = (method, endpoint = '', data = null) => {
    const config = {
      method: method,
      maxBodyLength: Infinity,
      url: `${API_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'JSESSIONID=8FE6B9C2F132610E351180A686659C3B'
      }
    };
    
    // El token se maneja automáticamente por el interceptor de axios
    // configurado en authService, ya no necesitamos añadirlo manualmente
    
    if (data) {
      config.data = JSON.stringify(data);
    }
    
    return config;
  };

  const fetchMesas = () => {
    axios
      .request(getRequestConfig('get'))
      .then((response) => {
        setMesasData(response.data);
      })
      .catch((error) => {
        console.error("Error al obtener las mesas:", error);
        // Si el error es por autenticación y el refresh token no funcionó
        if (error.response && error.response.status === 401) {
          // Redireccionar al login si es necesario
          // authService.logout();
          // window.location.href = '/login';
        }
      });
  };

  useEffect(() => {
    // Asegurarnos de que el interceptor de axios está configurado
    // Esto es útil si el componente se carga directamente sin pasar por el login
    authService.initializeAuth();
    fetchMesas();
  }, []);

  const handleToggleEstado = (mesa) => {
    const config = getRequestConfig('patch', `/${mesa.id}/estado`, { estado: !mesa.estado });

    axios.request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
        fetchMesas(); // Recargar las mesas después de actualizar el estado
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const onSubmit = (data) => {
    const processSubmission = (imageUrl) => {
      const newMesaData = {
        nombre: data.mesa,
        capacidad: parseInt(data.capacidad),
        imagen: imageUrl,
        estado: data.estado === "Activo"
      };

      const config = getRequestConfig('post', '', newMesaData);

      axios.request(config)
        .then((response) => {
          console.log(JSON.stringify(response.data));
          fetchMesas();
          setShowModal(false);
          reset();
        })
        .catch((error) => {
          console.log(error);
        });
    };

    if (data.img && data.img[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        processSubmission(reader.result);
      };
      reader.readAsDataURL(data.img[0]);
    } else {
      processSubmission("https://placehold.co/100x100.png");
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filtrar mesas basado en el término de búsqueda
  const filteredMesas = mesasData.filter(mesa => 
    mesa.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="d-flex">
      <Sidebar />
      {/* Header con título y botón para agregar */}
      <div className="container-fluid p-4">
        <div className="d-flex justify-content-between align-items-center">
          <h3>Mesas</h3>
          <Button className="btn btn-danger" onClick={() => setShowModal(true)}>+ Agregar</Button>
        </div>
        <hr/>

        <InputGroup className="mb-3">
          <InputGroup.Text className="bg-danger text-white">
            <FaSearch />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Buscar Mesa por nombre..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </InputGroup>

        {/* Tabla de MESAS */}
        <Table striped bordered hover responsive>
          <thead className="table-danger">
            <tr>
              <th>Imagen</th>
              <th>Mesa</th>
              <th>Capacidad</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {filteredMesas.length > 0 ? (
              filteredMesas.map((mesa) => (
                <tr key={mesa.id}>
                  <td>
                    <img src={mesa.imagen || "https://placehold.co/100x100.png"} alt={mesa.nombre} className="rounded" width="50" />
                  </td>
                  <td>{mesa.nombre}</td>
                  <td>{mesa.capacidad}</td>
                  <td>
                    <Button 
                      variant={mesa.estado ? "success" : "secondary"}
                      size="sm"
                      onClick={() => handleToggleEstado(mesa)}
                    >
                      {mesa.estado ? 'Activo' : 'Inactivo'}
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">No se encontraron mesas con ese nombre</td>
              </tr>
            )}
          </tbody>
        </Table>

        {/* Modal para agregar una mesa */}
        <Modal show={showModal} onHide={() => {
          setShowModal(false);
          reset(); // Resetear el formulario al cerrar el modal
        }}>
          <Modal.Header closeButton>
            <Modal.Title>Agregar Mesa</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Form.Group className="mb-3">
                <Form.Label>Imagen</Form.Label>
                <Form.Control type="file" accept="image/*" {...register('img')} />
                {errors.img && <div className="text-danger small">{errors.img.message}</div>}
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Nombre de la Mesa</Form.Label>
                <Form.Control type="text" placeholder="Ej: Mesa_05" {...register('mesa')} />
                {errors.mesa && <div className="text-danger small">{errors.mesa.message}</div>}
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Capacidad</Form.Label>
                <Form.Control type="number" placeholder="Ej: 4" {...register('capacidad')} />
                {errors.capacidad && <div className="text-danger small">{errors.capacidad.message}</div>}
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Estado</Form.Label>
                <Form.Select {...register('estado')}>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </Form.Select>
                {errors.estado && <div className="text-danger small">{errors.estado.message}</div>}
              </Form.Group>
              <Modal.Footer>
                <Button 
                  variant="secondary" 
                  onClick={() => {
                    setShowModal(false);
                    reset();
                  }}
                >
                  Cancelar
                </Button>
                <Button variant="danger" type="submit">Agregar</Button>
              </Modal.Footer>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
}

export default GestionMesas;