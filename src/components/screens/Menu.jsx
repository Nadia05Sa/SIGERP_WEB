import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Sidebar from './Sidebar';

const API_URL = 'http://localhost:8080/api/producto';

function Menu() {
  const [menuData, setMenuData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newProducto, setNewProducto] = useState({ nombre: '', precio: '', descripcion: '', categorias: '', imagen: null });

  useEffect(() => {
    axios.get(API_URL, { headers: { 'Content-Type': 'application/json' } })
      .then(response => setMenuData(response.data))
      .catch(error => console.error('Error al obtener los productos:', error));
  }, []);

  const handleInputChange = (e) => {
    setNewProducto({ ...newProducto, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setNewProducto({ ...newProducto, imagen: e.target.files[0] });
  };

  const agregarProducto = () => {
    const formData = new FormData();
    formData.append('nombre', newProducto.nombre);
    formData.append('precio', newProducto.precio);
    formData.append('descripcion', newProducto.descripcion);
    formData.append('categorias', newProducto.categorias);
    formData.append('imagen', newProducto.imagen);

    axios.post(API_URL, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(response => {
        setMenuData([...menuData, response.data]);
        setShowModal(false);
        setNewProducto({ nombre: '', precio: '', descripcion: '', categorias: '', imagen: null });
      })
      .catch(error => console.error('Error al agregar producto:', error));
  };

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="container-fluid p-4">
        <div className="d-flex justify-content-between align-items-center">
          <h3>Menú</h3>
          <button className="btn btn-danger" onClick={() => setShowModal(true)}>+ Agregar</button>
        </div>

        <table className="table table-bordered mt-4">
          <thead className="table-danger">
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Descripción</th>
              <th>Categorías</th>
            </tr>
          </thead>
          <tbody>
            {menuData.map((item) => (
              <tr key={item.id}>
                <td><img src={item.imagen} alt={item.nombre} className="rounded" width="50" /></td>
                <td>{item.nombre}</td>
                <td>${item.precio.toFixed(2)}</td>
                <td>{item.descripcion}</td>
                <td>
                  {item.categorias.map((categoria) => (
                    <span key={categoria.id} className="badge bg-primary me-1">
                      {categoria.nombre}
                    </span>
                  ))}
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
                  <h5 className="modal-title">Agregar Producto</h5>
                  <button className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  <input type="text" name="nombre" className="form-control mb-2" placeholder="Nombre" value={newProducto.nombre} onChange={handleInputChange} />
                  <input type="number" name="precio" className="form-control mb-2" placeholder="Precio" value={newProducto.precio} onChange={handleInputChange} />
                  <textarea name="descripcion" className="form-control mb-2" placeholder="Descripción" value={newProducto.descripcion} onChange={handleInputChange}></textarea>
                  <input type="text" name="categorias" className="form-control mb-2" placeholder="Categorías" value={newProducto.categorias} onChange={handleInputChange} />
                  <input type="file" name="imagen" className="form-control mb-2" onChange={handleFileChange} />
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button className="btn btn-danger" onClick={agregarProducto} disabled={!newProducto.nombre || !newProducto.precio || !newProducto.descripcion || !newProducto.categorias || !newProducto.imagen}>Agregar</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Menu;
