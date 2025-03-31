import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "./Sidebar";

const API_URL = "http://localhost:8080/api/mesas";

function GestionMesas() {
  const [mesasData, setMesasData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newMesa, setNewMesa] = useState({ nombre: "", capacidad: "", estado: true, img: "" });

  useEffect(() => {
    axios
      .get(API_URL, { headers: { "Content-Type": "application/json" } })
      .then((response) => {
        const mesasFormatted = response.data.map((mesa) => ({
          ...mesa,
          estado: mesa.estado ? "Habilitada" : "Inhabilitada",
        }));
        setMesasData(mesasFormatted);
      })
      .catch((error) => console.error("Error al obtener las mesas:", error));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMesa({ ...newMesa, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post(API_URL, newMesa, { headers: { "Content-Type": "application/json" } })
      .then((response) => {
        setMesasData([...mesasData, response.data]);
        setShowModal(false);
      })
      .catch((error) => console.error("Error al agregar mesa:", error));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewMesa({ ...newMesa, img: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="container-fluid p-4">
        <div className="d-flex justify-content-between align-items-center">
          <h3>Mesas</h3>
          <button className="btn btn-danger" onClick={() => setShowModal(true)}>+ Agregar</button>
        </div>

        <table className="table table-bordered mt-4">
          <thead className="table-danger">
            <tr>
              <th>Imagen</th>
              <th>Mesa</th>
              <th>Capacidad</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {mesasData.map((mesa) => (
              <tr key={mesa.id}>
                <td>
                  <img src={mesa.img || "https://via.placeholder.com/50"} alt={mesa.nombre} className="rounded" width="50" />
                </td>
                <td>{mesa.nombre}</td>
                <td>{mesa.capacidad}</td>
                <td>{mesa.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {showModal && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Agregar Mesa</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label">Nombre</label>
                      <input type="text" className="form-control" name="nombre" value={newMesa.nombre} onChange={handleInputChange} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Capacidad</label>
                      <input type="number" className="form-control" name="capacidad" value={newMesa.capacidad} onChange={handleInputChange} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Foto</label>
                      <input type="file" className="form-control" onChange={handleFileChange} required />
                    </div>
                    <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                    <button className="btn btn-danger" type="submit" disabled={!newMesa.nombre || !newMesa.capacidad || !newMesa.img}>Agregar</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GestionMesas;