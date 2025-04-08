import React, { useEffect } from "react";
import { Modal, Button, Form, Image } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// Form validation schema
const schema = yup.object().shape({
  img: yup
    .mixed()
    .test("fileSize", "El archivo es muy grande (máx. 2MB)", (value) => {
      if (value && value[0]) {
        return value[0].size <= 2000000;
      }
      return true; // Skip validation if no file selected (for edit mode)
    })
    .test("fileType", "Formato no soportado (solo JPG/PNG)", (value) => {
      if (value && value[0]) {
        return ["image/jpeg", "image/png", "image/jpg"].includes(value[0].type);
      }
      return true; // Skip validation if no file selected (for edit mode)
    }),
  mesa: yup.string().required("El nombre de la mesa es obligatorio").min(3, "Debe tener al menos 3 caracteres"),
  capacidad: yup
    .number()
    .typeError("Debe ser un número")
    .required("La capacidad es obligatoria")
    .min(1, "Debe ser al menos 1 persona")
    .max(20, "Máximo 20 personas"),
  estado: yup.string().required("El estado es obligatorio"),
});

/**
 * MesaForm - Componente para agregar o editar una mesa
 */
function MesaForm({ show, onHide, onSave = () => {}, mesa, editMode = false }) {
  // Form setup with validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      mesa: '',
      capacidad: '',
      estado: 'Activo'
    }
  });

  // Efecto para actualizar el formulario cuando cambia la mesa en modo edición
  useEffect(() => {
    if (editMode && mesa) {
      reset({
        mesa: mesa.nombre || '',
        capacidad: mesa.capacidad || '',
        estado: mesa.estado ? 'Activo' : 'Inactivo'
      });
    } else if (!editMode) {
      reset({
        mesa: '',
        capacidad: '',
        estado: 'Activo'
      });
    }
  }, [mesa, editMode, reset]);

  /**
   * Maneja el envío del formulario
   */
  const submitForm = (data) => {
    // Verificar que onSubmit sea una función antes de llamarla
    if (typeof onSave === 'function') {
      onSave(data);
    } else {
      console.error('Error: onSubmit prop is not a function');
    }
    reset();
  };

  /**
   * Maneja el cierre del modal
   */
  const handleClose = () => {
    if (typeof onHide === 'function') {
      onHide();
    }
    reset();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{editMode ? 'Editar Mesa' : 'Agregar Mesa'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit(submitForm)}>
          {/* Mostrar imagen existente en modo edición */}
          {editMode && mesa && mesa.imagen && (
            <div className="d-flex justify-content-center mb-3">
              <Image
                src={mesa.imagen}
                alt="Imagen de la mesa"
                className="rounded"
                width="80"
                height="80"
              />
            </div>
          )}

          {/* Campos para información de la mesa */}
          <Form.Group className="mb-3">
            <Form.Label>Imagen</Form.Label>
            <Form.Control 
              type="file" 
              accept="image/*" 
              {...register("img", { required: !editMode })} 
            />
            {errors.img && <div className="text-danger small">{errors.img.message}</div>}
            {editMode && <small className="text-muted">Deje vacío para mantener la imagen actual</small>}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Nombre de la Mesa</Form.Label>
            <Form.Control type="text" placeholder="Ej: Mesa_05" {...register("mesa")} />
            {errors.mesa && <div className="text-danger small">{errors.mesa.message}</div>}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Capacidad</Form.Label>
            <Form.Control type="number" placeholder="Ej: 4" {...register("capacidad")} />
            {errors.capacidad && <div className="text-danger small">{errors.capacidad.message}</div>}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Estado</Form.Label>
            <Form.Select {...register("estado")}>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </Form.Select>
            {errors.estado && <div className="text-danger small">{errors.estado.message}</div>}
          </Form.Group>

          {/* Botones del modal */}
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
            <Button variant="danger" type="submit">
              {editMode ? 'Actualizar' : 'Agregar'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default MesaForm;