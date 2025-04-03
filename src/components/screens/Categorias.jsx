import React, { useState, useEffect } from 'react';
import '../../App.css'
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Sidebar from './Sidebar';
import { Button, Form, Modal, Table, InputGroup } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import authService from '../../service/authService';

const API_URL = 'http://localhost:8080/api/categoria';

function Categorias() {
  const [categoriasData, setCategoriasData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ 
    nombre: '', 
    estado: 'Activo',
    imagen: null
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCategorias();
  }, []);

  const getRequestConfig = (method, endpoint = '', data = null) => {
    // Obtener el token del servicio de autenticación
    const token = authService.getCurrentToken();
    
    const config = {
      method: method,
      maxBodyLength: Infinity,
      url: `${API_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Usar el token dinámico
      }
    };
    
    if (data) {
      config.data = JSON.stringify(data);
    }
    
    return config;
  };

  const fetchCategorias = () => {
    const config = getRequestConfig('get');

    axios.request(config)
      .then(response => {
        console.log('Categorías obtenidas:', response.data);
        setCategoriasData(response.data);
      })
      .catch(error => {
        console.error('Error al obtener las categorías:', error);
        // Si el error es 401 (Unauthorized), redirigir al login
        if (error.response && error.response.status === 401) {
          authService.logout();
          window.location.href = '/'; // Redirigir al login
        }
      });
  };

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'imagen' && files && files[0]) {
      // Almacenar el archivo para procesarlo al enviar
      setFormData({ 
        ...formData, 
        imagen: files[0]
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es obligatorio";
    
    // Comprobar si ya existe una categoría con el mismo nombre
    const exists = categoriasData.some(cat => 
      cat.nombre.toLowerCase() === formData.nombre.toLowerCase()
    );
    if (exists) newErrors.nombre = "Ya existe una categoría con este nombre";
    
    // Validar imagen si es requerida
    if (!formData.imagen) {
      newErrors.imagen = "La imagen es obligatoria";
    } else {
      // Validar tamaño y formato de la imagen
      const file = formData.imagen;
      if (file.size > 2000000) {
        newErrors.imagen = "El archivo es muy grande (máx. 2MB)";
      }
      
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        newErrors.imagen = "Formato no soportado (solo JPG/PNG)";
      }
    }
    
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      agregarCategoria();
    } else {
      setErrors(newErrors);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '', 
      estado: 'Activo',
      imagen: null
    });
    setErrors({});
  };

  const agregarCategoria = () => {
    // Procesar la imagen usando FileReader
    const processSubmission = (imageUrl) => {
      const categoriaData = {
        nombre: formData.nombre,
        estado: formData.estado,
        imagen: imageUrl
      };

      const config = getRequestConfig('post', '', categoriaData);

      axios.request(config)
        .then((response) => {
          console.log('Categoría agregada con éxito:', response.data);
          fetchCategorias();
          setShowModal(false);
          resetForm();
        })
        .catch(error => {
          console.error('Error al agregar categoría:', error);
          // Mostrar más detalles del error para depuración
          if (error.response) {
            console.error('Datos de error:', error.response.data);
            console.error('Estado HTTP:', error.response.status);
            
            // Si el error es 401 (Unauthorized), redirigir al login
            if (error.response.status === 401) {
              authService.logout();
              window.location.href = '/';
            }
          } else if (error.request) {
            console.error('No se recibió respuesta:', error.request);
          } else {
            console.error('Error de configuración:', error.message);
          }
        });
    };

    if (formData.imagen) {
      const reader = new FileReader();
      reader.onloadend = () => {
        processSubmission(reader.result);
      };
      reader.readAsDataURL(formData.imagen);
    } else {
      // Si no hay imagen, usar placeholder
      processSubmission("https://placehold.co/100x100.png");
    }
  };

  const handleToggleEstado = (categoria) => {
    // Cambiar entre Activo/Inactivo
    const isActive = categoria.estado === 'Activo';
    const newEstado = isActive ? 'Inactivo' : 'Activo';
    
    const categoriaData = {
      nombre: categoria.nombre,
      estado: newEstado,
      imagen: categoria.imagen
    };

    const config = getRequestConfig('put', `/${categoria.id}`, categoriaData);

    axios.request(config)
      .then((response) => {
        console.log('Categoría actualizada:', response.data);
        fetchCategorias();
      })
      .catch(error => {
        console.error('Error al actualizar categoría:', error);
        // Si el error es 401 (Unauthorized), redirigir al login
        if (error.response && error.response.status === 401) {
          authService.logout();
          window.location.href = '/';
        }
      });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const filteredCategorias = categoriasData.filter(categoria =>
    categoria.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Función para previsualizar imagen
  const renderImagePreview = () => {
    if (!formData.imagen) return null;
    
    return (
      <div className="mt-2 text-center">
        <img 
          src={URL.createObjectURL(formData.imagen)} 
          alt="Vista previa" 
          className="rounded" 
          style={{ maxHeight: "100px" }} 
          onLoad={(e) => {
            // Liberar el objeto URL una vez cargada la imagen para evitar pérdidas de memoria
            return () => URL.revokeObjectURL(e.target.src);
          }}
        />
      </div>
    );
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Categorías</h3>
        <Button className="btn btn-danger" onClick={() => setShowModal(true)}>+ Agregar</Button>
      </div>
      <hr/>
      
      <InputGroup className="mb-3">
        <InputGroup.Text className="bg-danger text-white">
          <FaSearch />
        </InputGroup.Text>
        <Form.Control
          type="text"
          placeholder="Buscar categoría por nombre..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </InputGroup>

      <Table striped bordered hover responsive>
        <thead className="table-danger">
          <tr>
            <th>Imagen</th>
            <th>Nombre</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {filteredCategorias.length > 0 ? (
            filteredCategorias.map((categoria) => (
              <tr key={categoria.id} className="table-row">
                <td>
                  <img 
                    src={categoria.imagen || "https://placehold.co/100x100.png"} 
                    alt={categoria.nombre} 
                    className="rounded" 
                    width="50" 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/100x100.png";
                    }}
                  />
                </td>
                <td>{categoria.nombre}</td>
                <td>
                  <Button 
                    variant={categoria.estado === 'Activo' ? "success" : "secondary"}
                    size="sm"
                    onClick={() => handleToggleEstado(categoria)}
                  >
                    {categoria.estado}
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center">No hay categorías para mostrar</td>
            </tr>
          )}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Categoría</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Imagen</Form.Label>
              <Form.Control 
                type="file" 
                name="imagen"
                accept="image/*"
                onChange={handleFormChange}
              />
              {errors.imagen && <div className="text-danger small">{errors.imagen}</div>}
              {formData.imagen && renderImagePreview()}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control 
                type="text" 
                name="nombre"
                value={formData.nombre}
                onChange={handleFormChange}
                placeholder="Nombre de la Categoría" 
              />
              {errors.nombre && <div className="text-danger small">{errors.nombre}</div>}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Estado</Form.Label>
              <Form.Select 
                name="estado"
                value={formData.estado}
                onChange={handleFormChange}
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </Form.Select>
              {errors.estado && <div className="text-danger small">{errors.estado}</div>}
            </Form.Group>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
              <Button variant="danger" type="submit">Agregar</Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Categorias;