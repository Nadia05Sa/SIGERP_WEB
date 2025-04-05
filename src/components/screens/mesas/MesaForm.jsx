import React from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object().shape({
  img: yup
    .mixed()
    .required("La imagen es obligatoria")
    .test("fileSize", "El archivo es muy grande (máx. 2MB)", (value) =>
      value && value[0] && value[0].size <= 2000000
    )
    .test("fileType", "Formato no soportado (solo JPG/PNG)", (value) =>
      value && value[0] && ["image/jpeg", "image/png", "image/jpg"].includes(value[0].type)
    ),
  mesa: yup.string().required("El nombre de la mesa es obligatorio").min(3, "Debe tener al menos 3 caracteres"),
  capacidad: yup
    .number()
    .typeError("Debe ser un número")
    .required("La capacidad es obligatoria")
    .min(1, "Debe ser al menos 1 persona")
    .max(20, "Máximo 20 personas"),
  estado: yup.string().required("El estado es obligatorio"),
});

function MesaForm({ show, onHide, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ resolver: yupResolver(schema) });

  const handleClose = () => {
    onHide();
    reset();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Agregar Mesa</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Form.Group className="mb-3">
            <Form.Label>Imagen</Form.Label>
            <Form.Control type="file" accept="image/*" {...register("img")} />
            {errors.img && <div className="text-danger small">{errors.img.message}</div>}
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
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
            <Button variant="danger" type="submit">
              Agregar
            </Button>
          </Modal.Footer>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default MesaForm;
