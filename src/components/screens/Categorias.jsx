import React, { useState, useEffect } from 'react';
import '../../App.css';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Form, Modal, Table, InputGroup, Pagination } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import { IoEyeOutline, IoCheckmarkCircleOutline, IoCloseCircleOutline } from 'react-icons/io5';
import authService from '../../service/authService';
import Swal from 'sweetalert2'; // Import SweetAlert2

const API_URL = 'http://localhost:8080/api/categoria';

function Categorias() {
  const [categoriasData, setCategoriasData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ 
    nombre: '', 
    estado: true,
    imagen: null
  });
  const [errors, setErrors] = useState({});
  const itemsPerPage = 5; // Categorías por página
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchCategorias();
  }, []);

  const getRequestConfig = (method, endpoint = '', data = null) => {
    const token = authService.getCurrentToken();
    
    const config = {
      method: method,
      maxBodyLength: Infinity,
      url: `${API_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
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
        let dataArray = [];
        if (Array.isArray(response.data)) {
          dataArray = response.data;
        } else if (response.data && typeof response.data === 'object') {
          const possibleArrayProps = ['data', 'items', 'results', 'categorias'];
          for (const prop of possibleArrayProps) {
            if (Array.isArray(response.data[prop])) {
              dataArray = response.data[prop];
              break;
            }
          }
          if (dataArray.length === 0 && !Array.isArray(response.data) && response.data !== null) {
            if (response.data.id && response.data.nombre) {
              dataArray = [response.data];
            }
          }
        }
        setCategoriasData(dataArray);
      })
      .catch(error => {
        console.error('Error al obtener las categorías:', error);
        setCategoriasData([]);
        if (error.response && error.response.status === 401) {
          authService.logout();
          window.location.href = '/';
        }
      });
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (name === 'imagen' && files && files[0]) {
      setFormData({ 
        ...formData, 
        imagen: files[0]
      });
    } else if (name === 'estado' && type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es obligatorio";
    
    if (Array.isArray(categoriasData)) {
      const exists = categoriasData.some(cat => 
        cat.nombre && cat.nombre.toLowerCase() === formData.nombre.toLowerCase()
      );
      if (exists) newErrors.nombre = "Ya existe una categoría con este nombre";
    }
    
    if (!formData.imagen) {
      newErrors.imagen = "La imagen es obligatoria";
    } else {
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
      estado: true,
      imagen: null
    });
    setErrors({});
  };

  const agregarCategoria = () => {
    const processSubmission = (imageUrl) => {
      const categoriaData = {
        nombre: formData.nombre,
        estado: formData.estado,
        imagen: imageUrl
      };

      const config = getRequestConfig('post', '', categoriaData);

      axios.request(config)
        .then(() => {
          fetchCategorias();
          setShowModal(false);
          resetForm();
          Swal.fire({
            icon: 'success',
            title: '¡Categoría agregada!',
            text: `La categoría ${formData.nombre} se ha agregado correctamente.`,
            confirmButtonColor: '#dc3545'
          });
        })
        .catch(error => {
          console.error('Error al agregar categoría:', error);
          if (error.response) {
            if (error.response.status === 401) {
              authService.logout();
              window.location.href = '/';
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo agregar la categoría. Inténtelo de nuevo.',
                confirmButtonColor: '#dc3545'
              });
            }
          } else if (error.request) {
            Swal.fire({
              icon: 'error',
              title: 'Error de conexión',
              text: 'No se recibió respuesta del servidor.',
              confirmButtonColor: '#dc3545'
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Ocurrió un error al procesar la solicitud.',
              confirmButtonColor: '#dc3545'
            });
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
      processSubmission("https://placehold.co/100x100.png");
    }
  };

  const handleToggleEstado = (categoria) => {
    const isActive = categoria.estado;
    const newEstado = !isActive;
    const estadoText = newEstado ? 'Activo' : 'Inactivo';
    
    Swal.fire({
      title: '¿Cambiar estado?',
      text: `¿Desea cambiar el estado de la categoría "${categoria.nombre}" a ${estadoText}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        toggleEstadoCategoria(categoria, newEstado);
      }
    });
  };
  
  const toggleEstadoCategoria = (categoria, newEstado) => {
    const categoriaData = {
      estado: newEstado // Solo se actualiza el estado
    };

    const config = {
      method: 'patch',
      maxBodyLength: Infinity,
      url: `http://localhost:8080/api/categoria/${categoria.id}/estado`, // Usar el ID de la categoría
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authService.getCurrentToken()}` // Asegúrate de incluir el token de autorización
      },
      data: JSON.stringify(categoriaData) // Convertir a JSON
    };

    axios.request(config)
      .then(() => {
        fetchCategorias(); // Refrescar la lista de categorías
        const estadoText = newEstado ? 'activada' : 'desactivada';
        Swal.fire({
          icon: 'success',
          title: 'Estado actualizado',
          text: `La categoría "${categoria.nombre}" ha sido ${estadoText}.`,
          confirmButtonColor: '#dc3545',
          timer: 2000,
          timerProgressBar: true
        });
      })
      .catch(error => {
        console.error('Error al actualizar categoría:', error);
        if (error.response && error.response.status === 401) {
          authService.logout();
          window.location.href = '/';
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo actualizar el estado de la categoría.',
            confirmButtonColor: '#dc3545'
          });
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

  const filteredCategorias = Array.isArray(categoriasData) 
    ? categoriasData.filter(categoria => 
        categoria.nombre && categoria.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategorias = filteredCategorias.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCategorias.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

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
            return () => URL.revokeObjectURL(e.target.src);
          }}
        />
      </div>
    );
  };

  const onView = (categoriaId) => {
    const categoria = Array.isArray(categoriasData) 
      ? categoriasData.find(cat => cat.id === categoriaId)
      : null;
    
    if (categoria) {
      const estadoText = categoria.estado ? 'Activo' : 'Inactivo';
      Swal.fire({
        title: categoria.nombre,
        html: `
          <div class="text-center">
            <img src="${categoria.imagen || "https://placehold.co/100x100.png"}" 
                 alt="${categoria.nombre}" 
                 class="rounded mb-3" 
                 style="max-height: 150px; max-width: 150px;">
            <p><strong>Estado:</strong> ${estadoText}</p>
            <p><strong>ID:</strong> ${categoria.id}</p>
          </div>
        `,
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Cerrar'
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se encontró la categoría',
        confirmButtonColor: '#dc3545'
      });
    }
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
            <th>Id</th>
            <th>Nombre</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredCategorias.length > 0 ? (
            currentCategorias.map((categoria, index) => (
              <tr key={categoria.id} className="table-row">
                <td>{indexOfFirstItem + index + 1}</td>
                <td>{categoria.nombre}</td>
                <td>
                  <div className="d-flex justify-content-around">
                    <IoEyeOutline 
                      size={20} 
                      className="text-primary cursor-pointer" 
                      onClick={() => onView(categoria.id)}
                      style={{ cursor: 'pointer' }}
                      title="Ver detalles"
                    />
                    
                    {categoria.estado ? (
                      <IoCheckmarkCircleOutline 
                        size={20} 
                        className="text-success cursor-pointer" 
                        onClick={() => handleToggleEstado(categoria)}
                        style={{ cursor: 'pointer' }}
                        title="Activo - Click para desactivar"
                      />
                    ) : (
                      <IoCloseCircleOutline 
                        size={20} 
                        className="text-danger cursor-pointer" 
                        onClick={() => handleToggleEstado(categoria)}
                        style={{ cursor: 'pointer' }}
                        title="Inactivo - Click para activar"
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">No hay categorías para mostrar</td>
            </tr>
          )}
        </tbody>
      </Table>

      <div className="d-flex justify-content-end mt-3">
        <Pagination>
          <Pagination.Prev
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          />
          {Array.from({ length: totalPages }, (_, idx) => (
            <Pagination.Item
              key={idx + 1}
              active={idx + 1 === currentPage}
              onClick={() => handlePageChange(idx + 1)}
            >
              {idx + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
          />
        </Pagination>
      </div>

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
              <Form.Check 
                type="checkbox" 
                id="estadoCheckbox"
                name="estado"
                checked={formData.estado}
                onChange={handleFormChange}
                label="Activo"
              />
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