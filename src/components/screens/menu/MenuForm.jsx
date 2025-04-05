import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

// Esquema de validación con Yup
const schema = yup.object().shape({
  nombre: yup.string().required('El nombre es obligatorio'),
  precio: yup.number().required('El precio es obligatorio').positive('Debe ser un número positivo'),
  descripcion: yup.string().required('La descripción es obligatoria'),
  categorias: yup.array().of(yup.string()).min(1, 'Selecciona al menos una categoría')
});

function MenuForm({ 
  showModal, 
  closeModal, 
  onSubmit, 
  editMode, 
  currentProduct, 
  categorias 
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
    if (editMode && currentProduct) {
      setValue('nombre', currentProduct.nombre);
      setValue('precio', currentProduct.precio);
      setValue('descripcion', currentProduct.descripcion);
      setSelectedCategorias(currentProduct.categorias || []);
    } else {
      reset();
      setSelectedCategorias([]);
    }
    
    // Limpiar la imagen previa al abrir/cerrar el modal
    setImagenFile(null);
    setImagenPreview(null);
  }, [editMode, currentProduct, setValue, reset]);

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

  // Manejar envío del formulario
  const handleFormSubmit = (data) => {
    // Validar que haya una imagen seleccionada si no estamos editando
    if (!editMode && !imagenFile) {
      setImageError('La imagen es obligatoria');
      return;
    }

    onSubmit(data, imagenFile, selectedCategorias);
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

  // Manejar cierre del modal y resetear estados
  const handleClose = () => {
    reset();
    setImagenFile(null);
    setImagenPreview(null);
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
            <Button variant="secondary" onClick={handleClose} type="button">Cancelar</Button>
            <Button variant="danger" type="submit">{editMode ? 'Actualizar' : 'Agregar'}</Button>
          </Modal.Footer>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default MenuForm;