import React from 'react';
import { Table, Button, Badge } from 'react-bootstrap';
import { FaEdit, FaToggleOn, FaToggleOff } from 'react-icons/fa';

function MenuDetails({ menuData, onToggleStatus, onEdit }) {
  return (
    <div className="table-responsive">
      <Table striped hover>
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Descripción</th>
            <th>Categorías</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {menuData.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center">No hay productos disponibles</td>
            </tr>
          ) : (
            menuData.map((producto) => (
              <tr key={producto.id}>
                <td>
                  <img 
                    src={producto.imagen || "https://placehold.co/100x100.png"} 
                    alt={producto.nombre} 
                    className="img-thumbnail" 
                    style={{ width: '60px', height: '60px', objectFit: 'cover' }} 
                  />
                </td>
                <td>{producto.nombre}</td>
                <td>${producto.precio.toFixed(2)}</td>
                <td>
                  {producto.descripcion.length > 50 
                    ? `${producto.descripcion.substring(0, 50)}...` 
                    : producto.descripcion}
                </td>
                <td>
                  {producto.categorias && producto.categorias.map((cat, index) => (
                    <Badge key={index} bg="danger" className="me-1">
                      {cat.nombre}
                    </Badge>
                  ))}
                </td>
                <td>
                  <Badge bg={producto.estado ? "success" : "secondary"}>
                    {producto.estado ? "Activo" : "Inactivo"}
                  </Badge>
                </td>
                <td>
                  <Button 
                    variant="link" 
                    className="p-0 me-2" 
                    onClick={() => onEdit(producto)}
                  >
                    <FaEdit className="text-primary" />
                  </Button>
                  <Button 
                    variant="link" 
                    className="p-0" 
                    onClick={() => onToggleStatus(producto)}
                  >
                    {producto.estado ? (
                      <FaToggleOn className="text-success" size={20} />
                    ) : (
                      <FaToggleOff className="text-secondary" size={20} />
                    )}
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
}

export default MenuDetails;