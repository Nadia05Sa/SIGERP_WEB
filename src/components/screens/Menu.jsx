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
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMenu, setFilteredMenu] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showDetailView, setShowDetailView] = useState(false);
  const [currentMenuItem, setCurrentMenuItem] = useState(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      window.location.href = '/login';
    } else {
      authService.initializeAuth();
      fetchData();
    }
  }, []);

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

  useEffect(() => {
    const filtered = menuData.filter(item => 
      item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMenu(filtered);
  }, [searchTerm, menuData]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const handleViewDetails = (productoId) => {
    const producto = menuData.find(item => item.id === productoId);
    if (producto) {
      setCurrentMenuItem(producto);
      setShowDetailView(true);
    }
  };

  const handleCloseDetailView = () => {
    setShowDetailView(false);
    setCurrentMenuItem(null);
  };

  const processImage = (imageFile, currentImageUrl = null) => {
    return new Promise((resolve) => {
      if (!imageFile) {
        resolve(currentImageUrl || "https://placehold.co/100x100.png");
        return;
      }

      if (imageFile.size > 1024 * 1024) {
        showToast('La imagen es demasiado grande. Máximo 1MB.', 'warning');
        resolve(currentImageUrl || "https://placehold.co/100x100.png");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(imageFile);
    });
  };

  const handleSubmit = async (data, imagenFile, selectedCategorias) => {
    setIsLoading(true);
    try {
      const categoriasSeleccionadas = selectedCategorias.map(cat => {
        if (typeof cat === 'object' && cat.id) return { id: cat.id };
        const categoriaObj = categorias.find(c => c.nombre === cat || c.id === cat);
        return { id: categoriaObj.id };
      });

      const imageUrl = await processImage(
        imagenFile,
        editingProduct?.imagen || null
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

      if (editingProduct) {
        response = await axios.patch(
          `${API_URL}/producto/${editingProduct.id}`,
          productoData
        );
        setMenuData(prev =>
          prev.map(p => (p.id === editingProduct.id ? response.data : p))
        );
        showToast('Producto actualizado correctamente');
      } else {
        response = await axios.post(`${API_URL}/producto`, productoData);
        setMenuData(prev => [...prev, response.data]);
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

  const handleToggleEstado = async (producto) => {
    const nuevoEstado = !producto.estado;
    setIsLoading(true);

    try {
      await axios.patch(`${API_URL}/producto/${producto.id}/estado`, { estado: nuevoEstado });

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

  const handleEdit = (producto) => {
    setEditMode(true);
    setEditingProduct({
      ...producto,
      selectedCategories: producto.categorias?.map(cat => cat.id) || []
    });
    setShowModal(true); // <-- ¡Esto estaba faltando!
  };
  
  

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setEditMode(false); // <- importante resetear esto
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

        {isLoading && (
          <div className="text-center my-3">
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        )}

        <MenuList 
          menu={filteredMenu} 
          onView={handleViewDetails}
          onEdit={handleEdit}
          onToggleStatus={handleToggleEstado}
          isLoading={isLoading}
        />

<MenuForm 
  showModal={showModal} 
  closeModal={closeModal}
  onSubmit={handleSubmit}
  editMode={editMode}
  currentProduct={editingProduct}
  categorias={categorias}
  isLoading={isLoading}
  selectedCategories={editingProduct?.selectedCategories || []}
  setSelectedCategories={(cats) =>
    setEditingProduct(prev => ({ ...prev, selectedCategories: cats }))
  }
/>


        {showDetailView && currentMenuItem && (
          <MenuDetails
            menu={currentMenuItem}
            onClose={handleCloseDetailView}
          />
        )}

        <ToastContainer position="top-end" className="p-3">
          <Toast 
            show={toast.show} 
            onClose={() => setToast(prev => ({...prev, show: false}))}
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
