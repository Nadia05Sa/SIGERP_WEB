import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import authService from '../../service/authService';
import MenuList from './menu/MenuList';
import MenuForm from './menu/MenuForm';
import MenuDetails from './menu/MenuDetail';
import Swal from 'sweetalert2';

const API_URL = 'http://localhost:8080/api';

function Menu() {
  const [menuData, setMenuData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMenu, setFilteredMenu] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetailView, setShowDetailView] = useState(false);
  const [currentMenuItem, setCurrentMenuItem] = useState(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      window.location.href = '/login';
      return;
    }
    
    authService.initializeAuth();
    fetchData();
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (Array.isArray(menuData)) {
      const filtered = menuData.filter(item =>
        item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMenu(filtered);
    }
  }, [searchTerm, menuData]);

  const handleViewDetails = (productoId) => {
    const producto = menuData.find(item => item.id === productoId);
    if (producto) {
      setCurrentMenuItem(producto);
      setShowDetailView(true);
      
      Swal.fire({
        icon: 'info',
        title: 'Detalle del producto',
        text: `Visualizando ${producto.nombre}`,
        timer: 1500,
        showConfirmButton: false
      });
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
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          text: 'La imagen es demasiado grande. Máximo 1MB.',
          confirmButtonText: 'Aceptar'
        });
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
      const imageUrl = await processImage(
        imagenFile,
        editingProduct?.imagen || null
      );

      const productoData = {
        nombre: data.nombre,
        precio: parseFloat(data.precio),
        descripcion: data.descripcion,
        imagen: imageUrl,
        estado: editingProduct ? editingProduct.estado : true,
        categorias: selectedCategorias.map(cat => typeof cat === 'object' ? { id: cat.id } : { id: cat })
      };

      let response;

      if (editingProduct && editingProduct.id) {
        response = await axios.patch(
          `${API_URL}/producto/${editingProduct.id}`,
          productoData
        );
        setMenuData(prev => prev.map(p => (p.id === editingProduct.id ? response.data : p)));
        
        Swal.fire({
          icon: 'success',
          title: 'Producto actualizado',
          text: 'Producto actualizado correctamente',
          confirmButtonText: 'Aceptar'
        });
      } else {
        response = await axios.post(`${API_URL}/producto`, productoData);
        setMenuData(prev => [...prev, response.data]);
        
        Swal.fire({
          icon: 'success',
          title: 'Producto añadido',
          text: 'Producto añadido correctamente',
          confirmButtonText: 'Aceptar'
        });
      }

      await fetchData();
      closeModal();
    } catch (error) {
      console.error('Error al procesar el producto:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al guardar el producto. Intente nuevamente.',
        confirmButtonText: 'Aceptar'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleEstado = async (producto) => {
    const nuevoEstado = !producto.estado;

    const confirmResult = await Swal.fire({
      title: 'Cambiar estado',
      text: `¿Estás seguro de que deseas cambiar el estado a ${nuevoEstado ? 'Activo' : 'Inactivo'}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar'
    });

    if (confirmResult.isConfirmed) {
      setIsLoading(true);
      try {
        await axios.patch(`${API_URL}/producto/${producto.id}/estado`, { estado: nuevoEstado });

        setMenuData(prevData => prevData.map(item => 
          item.id === producto.id ? { ...item, estado: nuevoEstado } : item
        ));

        Swal.fire({
          icon: 'success',
          title: nuevoEstado ? 'Producto activado' : 'Producto desactivado',
          text: `Producto ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`,
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error al actualizar estado:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al cambiar el estado del producto',
          confirmButtonText: 'Aceptar'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEdit = (productoIdOrObject) => {
    if (typeof productoIdOrObject === 'string') {
      const productoId = productoIdOrObject;
      const producto = menuData.find(item => item.id === productoId);
      
      if (!producto) {
        console.error(`Producto con ID ${productoId} no encontrado`);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `No se encontró el producto con ID: ${productoId}`,
          confirmButtonText: 'Aceptar'
        });
        return;
      }
      
      setEditingProduct(producto);
    } else {
      setEditingProduct(productoIdOrObject);
    }
    
    setEditMode(true);
    setShowModal(true);
    
    Swal.fire({
      icon: 'info',
      title: 'Modo edición',
      text: `Editando producto`,
      timer: 1500,
      showConfirmButton: false
    });
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setEditMode(false);
  };

  return (
    <div className="d-flex">
      <div className="container-fluid p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3>Menú</h3>
          <Button 
            variant="danger" 
            onClick={() => {
              setEditMode(false);
              setEditingProduct(null);
              setShowModal(true);
            }}
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
        />

        {showDetailView && currentMenuItem && (
          <MenuDetails
            menu={currentMenuItem}
            onClose={handleCloseDetailView}
          />
        )}
      </div>
    </div>
  );
}

export default Menu;