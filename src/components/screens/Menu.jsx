import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Form, Table, InputGroup } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import Sidebar from './Sidebar';
import authService from '../../service/authService';

const API_URL = 'http://localhost:8080/api';

// Esquema de validación con Yup actualizado para imagen
const schema = yup.object().shape({
  nombre: yup.string().required('El nombre es obligatorio'),
  precio: yup.number().required('El precio es obligatorio').positive('Debe ser un número positivo'),
  descripcion: yup.string().required('La descripción es obligatoria'),
  categorias: yup.array().of(yup.string()).min(1, 'Selecciona al menos una categoría')
});  

function Menu() {
  const [menuData, setMenuData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [selectedCategorias, setSelectedCategorias] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMenu, setFilteredMenu] = useState([]);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [imagenFile, setImagenFile] = useState(null);
  const [imageError, setImageError] = useState('');
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  // Inicializar la autenticación al cargar el componente
  useEffect(() => {
    // Verificar si el usuario está autenticado
    if (!authService.isAuthenticated()) {
      // Redirigir al login si no está autenticado
      window.location.href = '/login';
    } else {
      // Inicializar los interceptores de axios para usar el token
      authService.initializeAuth();
    }
  }, []);
  
  // Obtener productos
  useEffect(() => {
    // No necesitamos pasar el token en cada solicitud, ya que está configurado en los interceptores
    axios.get(`${API_URL}/producto`, { 
      headers: { 
        'Content-Type': 'application/json',
      } 
    })
      .then((response) => {
        setMenuData(response.data);
        setFilteredMenu(response.data);
      })
      .catch(error => {
        console.error('Error al obtener los productos:', error);
        // Si hay un error de autenticación y no se pudo refrescar el token, el interceptor redirigirá al login
      });
  }, []);

  // Obtener categorías
  useEffect(() => {
    axios.get(`${API_URL}/categoria`, { 
      headers: { 
        'Content-Type': 'application/json',
      } 
    })
      .then(response => setCategorias(response.data))
      .catch(error => console.error('Error al obtener las categorías:', error));
  }, []);

  // Filtrar menú al cambiar el término de búsqueda
  useEffect(() => {
    const filtered = menuData.filter(item => 
      item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMenu(filtered);
  }, [searchTerm, menuData]);

  // Validar la imagen
  const validateImage = (file) => {
    if (!file) {
      return 'La imagen es obligatoria';
    }
    
    if (file.size > 2000000) {
      return 'El archivo es muy grande (máx. 2MB)';
    }
    
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      return 'Formato no soportado (solo JPG/PNG)';
    }
    
    return '';
  };

  // Manejar cambio de imagen
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const error = validateImage(file);
      if (error) {
        setImageError(error);
        setImagenFile(null);
        setImagenPreview(null);
      } else {
        setImageError('');
        setImagenFile(file);
        setImagenPreview(URL.createObjectURL(file));
      }
    }
  };

  // Función para manejar la selección de categorías
  const toggleCategoria = (categoria) => {
    if (editMode) {
      // En modo edición, trabajamos con objetos de categoría completos
      setSelectedCategorias(prev => {
        const catId = categoria.id;
        if (prev.some(cat => cat.id === catId)) {
          return prev.filter(cat => cat.id !== catId);
        } else {
          return [...prev, categoria];
        }
      });
    } else {
      // En modo agregar, trabajamos con nombres de categoría
      setSelectedCategorias(prev => {
        const catNombre = categoria.nombre;
        if (prev.includes(catNombre)) {
          return prev.filter(cat => cat !== catNombre);
        } else {
          return [...prev, catNombre];
        }
      });
    }
  };

  // Agregar o actualizar producto
  const onSubmit = (data) => {
    // Validar que haya una imagen seleccionada
    if (!editMode && !imagenFile) {
      setImageError('La imagen es obligatoria');
      return;
    }

    const processSubmission = (imageUrl) => {
      if (editMode) {
        // Actualizar producto existente
        const categoriasSeleccionadas = selectedCategorias.map(cat => ({ id: cat.id }));

        const productoActualizado = {
          id: currentProductId,
          nombre: data.nombre,
          precio: parseFloat(data.precio),
          descripcion: data.descripcion,
          imagen: imageUrl,
          estado: true,
          categorias: categoriasSeleccionadas
        };

        axios.patch(`${API_URL}/producto/${currentProductId}`, productoActualizado, {
          headers: { 
            'Content-Type': 'application/json',
          }
        })
          .then((response) => {
            // Actualizar la lista de productos
            setMenuData(prevData => prevData.map(item => 
              item.id === currentProductId ? response.data : item
            ));
            closeModal();
          })
          .catch(error => console.error('Error al actualizar producto:', error));
      } else {
        // Agregar nuevo producto
        const categoriasSeleccionadas = selectedCategorias.map(catNombre => {
          const categoriaObj = categorias.find(c => c.nombre === catNombre);
          return { id: categoriaObj.id };
        });

        const nuevoProducto = {
          nombre: data.nombre,
          precio: parseFloat(data.precio),
          descripcion: data.descripcion,
          imagen: imageUrl,
          estado: true,
          categorias: categoriasSeleccionadas
        };

        axios.post(`${API_URL}/producto`, nuevoProducto, {
          headers: { 
            'Content-Type': 'application/json',
          }
        })
          .then((response) => {
            // Añadir el nuevo producto a la lista
            setMenuData(prevData => [...prevData, response.data]);
            closeModal();
          })
          .catch(error => console.error('Error al agregar producto:', error));
      }
    };

    // Procesar la imagen si existe
    if (imagenFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        processSubmission(reader.result);
      };
      reader.readAsDataURL(imagenFile);
    } else if (editMode) {
      // Si estamos editando y no se seleccionó una nueva imagen, mantener la actual
      const productoActual = menuData.find(p => p.id === currentProductId);
      processSubmission(productoActual.imagen);
    } else {
      // Usar placeholder como fallback
      processSubmission("https://placehold.co/100x100.png");
    }
  };

  // Manejar cambio de estado del producto
  const handleToggleEstado = (producto) => {
    const nuevoEstado = !producto.estado;
    
    axios.patch(`${API_URL}/producto/${producto.id}/estado`, { estado: nuevoEstado }, {
      headers: { 
        'Content-Type': 'application/json',
      }
    })
      .then(() => {
        // Actualizar el estado en la lista de productos
        setMenuData(prevData => prevData.map(item => 
          item.id === producto.id ? { ...item, estado: nuevoEstado } : item
        ));
      })
      .catch(error => console.error('Error al actualizar estado:', error));
  };

  // Manejar edición de producto
  const handleEdit = (producto) => {
    setEditMode(true);
    setCurrentProductId(producto.id);
    
    // Establecer valores en el formulario
    setValue('nombre', producto.nombre);
    setValue('precio', producto.precio);
    setValue('descripcion', producto.descripcion);
    
    // Establecer categorías seleccionadas
    setSelectedCategorias(producto.categorias || []);

    // Limpiar la imagen previa
    setImagenFile(null);
    setImagenPreview(null);
    
    setShowModal(true);
  };

  // Renderizar previsualización de imagen
  const renderImagePreview = () => {
    if (!imagenPreview) return null;
    
    return (
      <div className="mt-2 text-center">
        <img 
          src={imagenPreview} 
          alt="Vista previa" 
          className="rounded" 
          style={{ maxHeight: "100px" }} 
          onLoad={() => {
            // Este callback se ejecutará cuando la imagen se cargue
            return () => URL.revokeObjectURL(imagenPreview);
          }}
        />
      </div>
    );
  };

  // Cerrar modal y resetear estado
  const closeModal = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentProductId(null);
    setSelectedCategorias([]);
    setImagenFile(null);
    setImagenPreview(null);
    setImageError('');
    reset();
  };

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="container-fluid p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3>Menú</h3>
          <Button variant="danger" onClick={() => setShowModal(true)}>+ Agregar</Button>
        </div>
        <hr/>

        {/* Barra de búsqueda */}
        <InputGroup className="mb-3">
          <InputGroup.Text className="bg-danger text-white">
            <FaSearch />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Buscar por nombre de producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>

        <Table striped bordered hover responsive>
          <thead className="table-danger">
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Descripción</th>
              <th>Categorías</th>
              <th>Estado</th>
              <th>Editar</th>
            </tr>
          </thead>
          <tbody>
            {filteredMenu.map((item) => (
              <tr key={item.id}>
                <td>
                  <img 
                    src={item.imagen || "https://placehold.co/100x100.png"} 
                    alt={item.nombre} 
                    className="rounded" 
                    width="50" 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/100x100.png";
                    }}
                  />
                </td>
                <td>{item.nombre}</td>
                <td>${item.precio.toFixed(2)}</td>
                <td>{item.descripcion}</td>
                <td>
                  {item.categorias && item.categorias.map((categoria) => (
                    <span key={categoria.id} className="badge bg-primary me-1">
                      {categoria.nombre}
                    </span>
                  ))}
                </td>
                <td>
                  <Button 
                    variant={item.estado ? "success" : "secondary"}
                    size="sm"
                    onClick={() => handleToggleEstado(item)}
                  >
                    {item.estado ? 'Activo' : 'Inactivo'}
                  </Button>
                </td>
                <td>
                  <Button 
                    className="btn btn-danger" 
                    onClick={() => handleEdit(item)}
                  >
                    Editar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* Modal para agregar o editar producto */}
        <Modal show={showModal} onHide={closeModal}>
          <Modal.Header closeButton>
            <Modal.Title>{editMode ? 'Editar Platillo' : 'Agregar Platillo'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Form.Group className="mb-3">
                <Form.Label>Imagen</Form.Label>
                <Form.Control 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                />
                {imageError && <small className="text-danger">{imageError}</small>}
                {renderImagePreview()}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control type="text" placeholder="Nombre del platillo" {...register('nombre')} />
                {errors.nombre && <small className="text-danger">{errors.nombre.message}</small>}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Precio</Form.Label>
                <Form.Control type="number" step="0.01" placeholder="Precio" {...register('precio')} />
                {errors.precio && <small className="text-danger">{errors.precio.message}</small>}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control as="textarea" rows={3} placeholder="Descripción" {...register('descripcion')} />
                {errors.descripcion && <small className="text-danger">{errors.descripcion.message}</small>}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Categorías</Form.Label>
                <div className="row">
                  {categorias.map((cat) => (
                    <div key={cat.id} className="col-6 mb-2">
                      <Button
                        variant={
                          editMode
                            ? selectedCategorias.some(c => c.id === cat.id) ? 'danger' : 'outline-danger'
                            : selectedCategorias.includes(cat.nombre) ? 'danger' : 'outline-danger'
                        }
                        className="w-100 rounded-pill"
                        onClick={() => toggleCategoria(cat)}
                        type="button"
                      >
                        {cat.nombre}
                      </Button>
                    </div>
                  ))}
                </div>
                {errors.categorias && <small className="text-danger">{errors.categorias.message}</small>}
              </Form.Group>

              <Modal.Footer>
                <Button variant="secondary" onClick={closeModal} type="button">Cancelar</Button>
                <Button variant="danger" type="submit">{editMode ? 'Actualizar' : 'Agregar'}</Button>
              </Modal.Footer>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
}

export default Menu;