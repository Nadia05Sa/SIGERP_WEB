import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Form, InputGroup, Toast, ToastContainer } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import authService from '../../service/authService';
import MenuList from './menu/MenuList';
import MenuForm from './menu/MenuForm';
import MenuDetails from './menu/MenuDetail';


const API_URL = 'http://localhost:8080/api';

function Menu() {
  const [menuData, setMenuData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMenu, setFilteredMenu] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showDetailView, setShowDetailView] = useState(false);

  // Authentication check
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      window.location.href = '/login';
    } else {
      authService.initializeAuth();
      fetchData();
    }
  }, []);
  
  // Fetch products and categories
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [productResponse, categoryResponse] = await Promise.all([
        axios.get(`${API_URL}/producto`),
        axios.get(`${API_URL}/categoria`)
      ]);
      
      setMenuData(productResponse.data);
      setFilteredMenu(productResponse.data);
      setCategorias(categoryResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Error al cargar los datos. Intente nuevamente.', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter menu when search term changes
  useEffect(() => {
    const filtered = menuData.filter(item => 
      item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMenu(filtered);
  }, [searchTerm, menuData]);

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  // Process image - returns a promise with the processed image URL
  const processImage = (imageFile, currentImageUrl = null) => {
    return new Promise((resolve) => {
      if (!imageFile) {
        // If no new image was selected, use the current one or a placeholder
        resolve(currentImageUrl || "https://placehold.co/100x100.png");
        return;
      }
      
      // Check image size before processing
      if (imageFile.size > 1024 * 1024) { // 1MB
        showToast('La imagen es demasiado grande. Máximo 1MB.', 'warning');
        resolve(currentImageUrl || "https://placehold.co/100x100.png");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(imageFile);
    });
  };

  // Add or update product
  const handleSubmit = async (data, imagenFile, selectedCategorias) => {
    setIsLoading(true);
    try {
      // Process categories consistently for both create and update
      const categoriasSeleccionadas = selectedCategorias.map(cat => {
        // If cat is an object with an id, use it; otherwise find the id from categorias
        if (typeof cat === 'object' && cat.id) {
          return { id: cat.id };
        } else {
          const categoriaObj = categorias.find(c => c.nombre === cat || c.id === cat);
          return { id: categoriaObj.id };
        }
      });
      
      // Process image
      const imageUrl = await processImage(
        imagenFile, 
        editMode ? menuData.find(p => p.id === currentProductId)?.imagen : null
      );
      
      const productoData = {
        nombre: data.nombre,
        precio: parseFloat(data.precio),
        descripcion: data.descripcion,
        imagen: imageUrl,
        estado: true,
        categorias: categoriasSeleccionadas
      };
      
      let response;
      
      if (editMode) {
        // Update existing product
        response = await axios.patch(
          `${API_URL}/producto/${currentProductId}`, 
          { ...productoData, id: currentProductId }
        );
        
        setMenuData(prevData => prevData.map(item => 
          item.id === currentProductId ? response.data : item
        ));
        
        showToast('Producto actualizado correctamente');
      } else {
        // Add new product
        response = await axios.post(`${API_URL}/producto`, productoData);
        setMenuData(prevData => [...prevData, response.data]);
        showToast('Producto añadido correctamente');
      }
      
      closeModal();
    } catch (error) {
      console.error('Error al procesar el producto:', error);
      showToast('Error al guardar el producto. Intente nuevamente.', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle product status
  const handleToggleEstado = async (producto) => {
    const nuevoEstado = !producto.estado;
    setIsLoading(true);
    
    try {
      await axios.patch(`${API_URL}/producto/${producto.id}/estado`, { estado: nuevoEstado });
      
      // Update status in product list
      setMenuData(prevData => prevData.map(item => 
        item.id === producto.id ? { ...item, estado: nuevoEstado } : item
      ));
      
      showToast(`Producto ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`);
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      showToast('Error al cambiar el estado del producto', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle product edit
  const handleEdit = (producto) => {
    setEditMode(true);
    setCurrentProductId(producto.id);
    setCurrentProduct(producto);
    setShowModal(true);
  };

  // Close modal and reset state
  const closeModal = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentProductId(null);
    setCurrentProduct(null);
  };

  return (
    <div className="d-flex">
      <div className="container-fluid p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3>Menú</h3>
          <Button 
            variant="danger" 
            onClick={() => setShowModal(true)}
            disabled={isLoading}
          >
            + Agregar
          </Button>
        </div>
        <hr/>

        {/* Search bar */}
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

        {/* Loading indicator */}
        {isLoading && (
          <div className="text-center my-3">
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        )}

        {/* Menu list - using only one component to display data */}
        <MenuList 
          menu={filteredMenu} 
          onEdit={handleEdit}
          onToggleStatus={handleToggleEstado}
          isLoading={isLoading}
        />

        {/* Form modal for adding/editing products */}
        <MenuForm 
          showModal={showModal} 
          closeModal={closeModal}
          onSubmit={handleSubmit}
          editMode={editMode}
          currentProduct={currentProduct}
          categorias={categorias}
          isLoading={isLoading}
        />

        {showDetailView && currentProduct && (
          <MenuDetails
            menu={currentProduct}
            categorias={categorias}
            categoriasporProductos={[]}
            onClose={() => setShowDetailView(false)}
          />
        )}

        {/* Toast notifications */}
        <ToastContainer position="top-end" className="p-3">
          <Toast 
            show={toast.show} 
            onClose={() => setToast({...toast, show: false})}
            bg={toast.type}
            delay={3000}
            autohide
          >
            <Toast.Header closeButton>
              <strong className="me-auto">Notificación</strong>
            </Toast.Header>
            <Toast.Body className={toast.type === 'danger' ? 'text-white' : ''}>
              {toast.message}
            </Toast.Body>
          </Toast>
        </ToastContainer>
      </div>
    </div>
  );
}

export default Menu;