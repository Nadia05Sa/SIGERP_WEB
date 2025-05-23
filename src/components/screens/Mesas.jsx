import React, { useEffect, useState } from "react";
import "../../App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Form, InputGroup } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import axios from "axios";
import MesaList from "./mesas/MesaList";
import MesaForm from "./mesas/MesaForm";
import MesaDetail from "./mesas/MesaDetail";
import authService from "../../service/authService";
import Swal from 'sweetalert2';

const API_URL = "http://localhost:8080/api/mesas";

function GestionMesas() {
  const [mesasData, setMesasData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDetailView, setShowDetailView] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentMesa, setCurrentMesa] = useState(null);
  const [authToken, setAuthToken] = useState("");

  useEffect(() => {
    const token = authService.getCurrentToken(); 
    setAuthToken(token);
    fetchMesas(token);
  }, []);

  const getRequestConfig = (method, endpoint = "", data = null) => {
    const config = {
      method,
      maxBodyLength: Infinity,
      url: `${API_URL}${endpoint}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    };
    if (data) config.data = JSON.stringify(data);
    return config;
  };

  const fetchMesas = (token = authToken) => {
    axios
      .get(API_URL, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setMesasData(Array.isArray(response.data) ? response.data : []);
      })
      .catch((error) =>
        console.error("Error al obtener las mesas:", error.message)
      );
  };

  const getMesaById = async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 403) {
        console.error("Acceso denegado: Token no autorizado o expirado.");
        alert("No tienes permisos para ver esta mesa. Por favor inicia sesión nuevamente.");
      } else {
        console.error("Error al obtener la mesa:", error);
      }
      return null;
    }
  };

  const handleViewDetails = async (mesaId) => {
    const mesa = await getMesaById(mesaId);
    if (mesa) {
      setCurrentMesa(mesa);
      setShowDetailView(true);
    }
  };

  const handleEdit = async (mesaId) => {
    const mesa = await getMesaById(mesaId);
    if (mesa) {
      setCurrentMesa(mesa);
      setEditMode(true);
      setShowModal(true);
    }
  };

  const handleAddNew = () => {
    setEditMode(false);
    setCurrentMesa(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentMesa(null);
  };

  const handleCloseDetailView = () => {
    setShowDetailView(false);
    setCurrentMesa(null);
  };

  const handleToggleEstado = (mesa) => {
    const newEstado = !mesa.estado;
    const config = getRequestConfig("patch", `/${mesa.id}/estado`, {
      estado: newEstado,
    });

    Swal.fire({
      title: 'Cambiar estado',
      text: `¿Estás seguro de que deseas cambiar el estado a ${newEstado ? 'Activo' : 'Inactivo'}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .request(config)
          .then(() => {
            fetchMesas();
            Swal.fire(
              'Estado cambiado!',
              `El estado de la mesa ha sido cambiado a ${newEstado ? 'Activo' : 'Inactivo'}.`,
              'success'
            );
          })
          .catch((error) => {
            console.error("Error al cambiar el estado:", error.message);
            Swal.fire(
              'Error!',
              'No se pudo cambiar el estado de la mesa.',
              'error'
            );
          });
      }
    });
  };

  const handleSubmitForm = (data) => {
    const processSubmission = (imageUrl) => {
      const newMesaData = {
        nombre: data.mesa,
        capacidad: parseInt(data.capacidad),
        imagen: imageUrl,
        estado: data.estado === "Activo",
      };
      const config = getRequestConfig(editMode ? "put" : "post", editMode ? `/${currentMesa.id}` : "", newMesaData);
      axios
        .request(config)
        .then(() => {
          fetchMesas();
          setShowModal(false);
        })
        .catch((error) => {
          // Verifica si el error es debido a un nombre duplicado
          if (error.response && error.response.status === 400 && error.response.data.message.includes("Ya existe una mesa con el nombre: ", data.mesa)) {
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: 'Ya existe una mesa con el mismo nombre. Por favor, elige otro.',
            });
          } else {
            console.error(error);
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: 'Ocurrió un error al intentar guardar la mesa.',
            });
          }
        });
    };

    if (data.img && data.img[0]) {
      const reader = new FileReader();
      reader.onloadend = () => processSubmission(reader.result);
      reader.readAsDataURL(data.img[0]);
    } else {
      processSubmission("https://placehold.co/100x100.png");
    }
  };

  // Filtrado
  const filteredMesas = mesasData.filter((mesa) =>
    mesa.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="d-flex">
      <div className="container-fluid p-4">
        <div className="d-flex justify-content-between align-items-center">
          <h3>Mesas</h3>
          <Button className="btn btn-danger" onClick={handleAddNew}>
            + Agregar
          </Button>
        </div>
        <hr />

        <InputGroup className="mb-3">
          <InputGroup.Text className="bg-danger text-white">
            <FaSearch />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Buscar Mesa por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>

        <MesaList
          mesas={filteredMesas}
          searchTerm={searchTerm}
          onView={handleViewDetails}
          onEdit={handleEdit}
          onToggleEstado={handleToggleEstado}
        />

        <MesaDetail
          mesa={currentMesa}
          show={showDetailView}
          onClose={handleCloseDetailView}
        />

        <MesaForm
          show={showModal}
          onHide={handleCloseModal}
          onSave={handleSubmitForm}
          mesa={currentMesa}
          editMode={editMode}
        />
      </div>
    </div>
  );
}

export default GestionMesas;