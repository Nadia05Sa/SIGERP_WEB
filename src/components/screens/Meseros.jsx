import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Sidebar from './Sidebar';

const API_URL = 'http://localhost:8080/api/empleado';

function GestionMeseros() {
  const [meserosData, setMeserosData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newMesero, setNewMesero] = useState({ nombre: '', correo: '', contraseña: '', rol: '', foto: null });

  useEffect(() => {
    axios.get(API_URL)
      .then((response) => {
        setMeserosData(response.data);
      })
      .catch((error) => {
        console.error('Error al obtener meseros:', error);
      });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMesero({ ...newMesero, [name]: value });
  };

  const handleFileChange = (e) => {
    setNewMesero({ ...newMesero, foto: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('nombre', newMesero.nombre);
    formData.append('correo', newMesero.correo);
    formData.append('contraseña', newMesero.contraseña);
    formData.append('rol', newMesero.rol);
    formData.append('foto', newMesero.foto);

    axios.post(API_URL, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
      .then((response) => {
        setMeserosData([...meserosData, response.data]);
        setShowModal(false);
        setNewMesero({ nombre: '', correo: '', contraseña: '', rol: '', foto: null });
      })
      .catch((error) => {
        console.error('Error al agregar mesero:', error);
      });
  };

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="container-fluid p-4">
        <div className="d-flex justify-content-between align-items-center">
          <h3>Gestión de Meseros</h3>
          <button className="btn btn-danger" onClick={() => setShowModal(true)}>+ Agregar</button>
        </div>

        <table className="table table-bordered mt-4">
          <thead className="table-danger">
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Contraseña</th>
              <th>Tipo</th>
            </tr>
          </thead>
          <tbody>
            {meserosData.map((mesero) => (
              <tr key={mesero.id}>
                <td><img src={mesero.foto} alt={mesero.nombre} className="rounded" width="50" /></td>
                <td>{mesero.nombre}</td>
                <td>{mesero.correo}</td>
                <td>******</td>
                <td>{mesero.rol}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {showModal && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Agregar Mesero</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label">Nombre</label>
                      <input type="text" className="form-control" name="nombre" value={newMesero.nombre} onChange={handleInputChange} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Correo</label>
                      <input type="email" className="form-control" name="correo" value={newMesero.correo} onChange={handleInputChange} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Contraseña</label>
                      <input type="password" className="form-control" name="contraseña" value={newMesero.contraseña} onChange={handleInputChange} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Rol</label>
                      <input type="text" className="form-control" name="rol" value={newMesero.rol} onChange={handleInputChange} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Foto</label>
                      <input type="file" className="form-control" onChange={handleFileChange} required />
                    </div>
                    <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                    <button className="btn btn-danger" type="submit" disabled={!newMesero.nombre || !newMesero.foto}>Agregar</button>                  
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

export default GestionMeseros;