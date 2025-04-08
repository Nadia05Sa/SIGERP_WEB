import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import Swal from 'sweetalert2';

// Esquema de validación con Yup
const schema = yup.object().shape({
  nombre: yup.string().required('El nombre es obligatorio'),
  precio: yup.number().required('El precio es obligatorio').positive('Debe ser un número positivo'),
  descripcion: yup.string().required('La descripción es obligatoria')
});

function MenuForm({ 
  showModal, 
  closeModal, 
  onSubmit, 
  editMode, 
  currentProduct, 
  categorias,
  isLoading 
}) {
  const [selectedCategorias, setSelectedCategorias] = useState([]);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [imagenFile, setImagenFile] = useState(null);
  const [imageError, setImageError] = useState('');
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  // Inicializar formulario cuando se edita un producto
  useEffect(() => {
    if (showModal) {
      if (editMode && currentProduct) {
        console.log("Setting up form for edit mode with product:", currentProduct);
        
        // Establecer valores del formulario
        setValue('nombre', currentProduct.nombre || '');
        setValue('precio', currentProduct.precio || '');
        setValue('descripcion', currentProduct.descripcion || '');
        
        // Establecer la imagen de vista previa
        if (currentProduct.imagen) {
          setImagenPreview(currentProduct.imagen);
        } else {
          setImagenPreview(null);
        }
        
        // Establecer categorías seleccionadas
        setSelectedCategorias(currentProduct.categorias || []);
      } else {
        // Limpiar el formulario para un nuevo producto
        reset({
          nombre: '',
          precio: '',
          descripcion: ''
        });
        setSelectedCategorias([]);
        setImagenPreview(null);
        setImagenFile(null);
      }
    }
  }, [showModal, editMode, currentProduct, setValue, reset]);

  // Validar la imagen
  const validateImage = (file) => {
    if (!file) {
      return editMode ? '' : 'La imagen es obligatoria';
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
        // No mostramos SweetAlert aquí
      } else {
        setImageError('');
        setImagenFile(file);
        setImagenPreview(URL.createObjectURL(file));
      }
    }
  };

  // Función para verificar si una categoría está seleccionada
  const isCategoriaSelected = (categoria) => {
    return selectedCategorias.some(cat => 
      (typeof cat === 'object' ? cat.id === categoria.id : cat === categoria.id)
    );
  };

  // Función para manejar la selección de categorías
  const toggleCategoria = (categoria) => {
    setSelectedCategorias(prev => {
      if (isCategoriaSelected(categoria)) {
        return prev.filter(cat => 
          (typeof cat === 'object' ? cat.id !== categoria.id : cat !== categoria.id)
        );
      } else {
        return [...prev, categoria];
      }
    });
  };

  // Manejar envío del formulario
  const handleFormSubmit = (data) => {
    // En modo edición, no requerimos una nueva imagen
    if (!editMode && !imagenFile && !imagenPreview) {
      setImageError('La imagen es obligatoria');
      return;
    }
    
    // Validar que haya al menos una categoría seleccionada
    if (selectedCategorias.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Categorías requeridas',
        text: 'Selecciona al menos una categoría'
      });
      return;
    }

    onSubmit(data, imagenFile, selectedCategorias);
  };

  // Manejar cierre del modal y resetear estados
  const handleClose = () => {
    reset();
    setImagenFile(null);
    setImageError('');
    closeModal();
  };

  return (
    <Modal show={showModal} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{editMode ? 'Editar Platillo' : 'Agregar Platillo'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit(handleFormSubmit)}>
          <Form.Group className="mb-3">
            <Form.Label>Imagen</Form.Label>
            <Form.Control 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
            />
            {imageError && <small className="text-danger">{imageError}</small>}
            
            {/* Mostrar imagen actual o previsualización */}
            {(imagenPreview || (editMode && currentProduct?.imagen)) && (
              <div className="mt-2 text-center">
                <img 
                  src={imagenPreview || currentProduct?.imagen} 
                  alt="Vista previa" 
                  className="rounded" 
                  style={{ maxHeight: "100px" }}
                />
                {imagenPreview && !imagenFile && editMode && (
                  <div className="mt-1">
                    <small className="text-muted">Imagen actual</small>
                  </div>
                )}
              </div>
            )}
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
                    variant={isCategoriaSelected(cat) ? 'danger' : 'outline-danger'}
                    className="w-100 rounded-pill"
                    onClick={() => toggleCategoria(cat)}
                    type="button"
                  >
                    {cat.nombre}
                  </Button>
                </div>
              ))}
            </div>
            {selectedCategorias.length === 0 && (
              <small className="text-danger">Selecciona al menos una categoría</small>
            )}
          </Form.Group>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose} type="button" disabled={isLoading}>
              Cancelar
            </Button>
            <Button variant="danger" type="submit" disabled={isLoading}>
              {isLoading ? 'Procesando...' : (editMode ? 'Actualizar' : 'Agregar')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default MenuForm;