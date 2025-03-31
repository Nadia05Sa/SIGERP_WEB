import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Sidebar from './Sidebar';

const API_URL = 'http://localhost:8080/api/categoria';

function Categorias() {
  const [categoriasData, setCategoriasData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newCategoria, setNewCategoria] = useState({ nombre: '', estado: 'Activo', imagen: null });

  useEffect(() => {
    axios.get(API_URL)
      .then(response => setCategoriasData(response.data))
      .catch(error => console.error('Error al obtener las categorías:', error));
  }, []);

  const toggleEstado = (id, currentEstado) => {
    const newEstado = currentEstado === 'Activo' ? 'Inhabilitada' : 'Activo';
    axios.put(`${API_URL}/${id}`, { estado: newEstado })
      .then(() => {
        setCategoriasData(prev => prev.map(cat => cat.id === id ? { ...cat, estado: newEstado } : cat));
      })
      .catch(error => console.error('Error al actualizar el estado:', error));
  };

  const handleInputChange = (e) => {
    setNewCategoria({ ...newCategoria, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setNewCategoria({ ...newCategoria, imagen: e.target.files[0] });
  };

  const agregarCategoria = () => {
    const formData = new FormData();
    formData.append('nombre', newCategoria.nombre);
    formData.append('estado', newCategoria.estado);
    formData.append('imagen', newCategoria.imagen);

    axios.post(API_URL, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(response => {
        setCategoriasData([...categoriasData, response.data]);
        setShowModal(false);
        setNewCategoria({ nombre: '', estado: 'Activo', imagen: null });
      })
      .catch(error => console.error('Error al agregar categoría:', error));
  };

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="container-fluid p-4">
        <div className="d-flex justify-content-between align-items-center">
          <h3>Categorías</h3>
          <button className="btn btn-danger" onClick={() => setShowModal(true)}>+ Agregar</button>
        </div>

        <table className="table table-bordered mt-4">
          <thead className="table-danger">
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {categoriasData.map((categoria) => (
              <tr key={categoria.id}>
                <td>
                  <img src={categoria.imagen} alt={categoria.nombre} className="rounded" width="50" />
                </td>
                <td>{categoria.nombre}</td>
                <td>
                  <button className={`btn ${categoria.estado === 'Activo' ? 'btn-outline-success' : 'btn-outline-secondary'}`} onClick={() => toggleEstado(categoria.id, categoria.estado)}>
                    {categoria.estado}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Modal */}
        {showModal && (
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Agregar Categoría</h5>
                  <button className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  <input type="text" name="nombre" className="form-control mb-2" placeholder="Nombre" value={newCategoria.nombre} onChange={handleInputChange} />
                  <select name="estado" className="form-control mb-2" value={newCategoria.estado} onChange={handleInputChange}>
                    <option value="Activo">Activo</option>
                    <option value="Inhabilitada">Inhabilitada</option>
                  </select>
                  <input type="file" name="imagen" className="form-control mb-2" onChange={handleFileChange} />
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button className="btn btn-danger" onClick={agregarCategoria} disabled={!newCategoria.nombre || !newCategoria.imagen}>Agregar</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Categorias;