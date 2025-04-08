import React, { useState } from 'react';
import { IoEyeOutline } from 'react-icons/io5';
import { InputGroup, Form, Pagination } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import "../../../App.css";

function HomeList({ data, isLoading, onViewVenta }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Número de elementos por página

  // Filtrar los datos según el término de búsqueda
  const filteredData = data.filter(row => 
    row.dia.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular el índice de los elementos a mostrar en la página actual
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Calcular el número de páginas
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  
  // Función para manejar el cambio de página
  const handlePageChange = (pageNumber) => {
    // Verificar que la página esté dentro del rango válido
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="table-responsive mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>Registro de Ventas</h5>
        {/* Barra de búsqueda */}
        <InputGroup className="w-50">
          <InputGroup.Text className="bg-danger text-white">
            <FaSearch />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Buscar venta por fecha..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
      </div>
      <table className="table table-striped table-bordered">
        <thead className="table-danger">
          <tr>
            <th>#</th>
            <th>Día</th>
            <th>Ventas Totales</th>
            <th>Gastos Totales</th>
            <th>Beneficio</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            // Mensaje de carga
            <tr>
              <td colSpan="6" className="text-center">Cargando datos...</td>
            </tr>
          ) : currentItems.length === 0 ? (
            // Mensaje cuando no hay ventas
            <tr>
              <td colSpan="6" className="text-center">No hay ventas registradas</td>
            </tr>
          ) : (
            // Renderizar filas de datos filtrados
            currentItems.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.dia}</td>
                <td>${row.ingresos.toFixed(2)}</td>
                <td>${row.gastos.toFixed(2)}</td>
                <td>${row.beneficios.toFixed(2)}</td>
                <td>
                  <div
                    className="d-flex justify-content-around"
                    onClick={() => onViewVenta(row.ventas)}
                    title="Ver detalles"
                    data-testid={`view-${row.id}`}
                  >
                    <IoEyeOutline size={16} className="text-primary" />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      {/* Paginación simplificada alineada a la derecha */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-end mt-3">
          <Pagination>
            <Pagination.Prev 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 1}
            />
            
            {/* Mostrar máximo 3 páginas cercanas a la actual */}
            {Array.from({ length: Math.min(3, totalPages) }).map((_, idx) => {
              let pageNum;
              if (currentPage <= 2) {
                pageNum = idx + 1;
              } else if (currentPage >= totalPages - 1) {
                pageNum = totalPages - 2 + idx;
              } else {
                pageNum = currentPage - 1 + idx;
              }
              
              if (pageNum > 0 && pageNum <= totalPages) {
                return (
                  <Pagination.Item 
                    key={pageNum} 
                    active={pageNum === currentPage}
                    onClick={() => handlePageChange(pageNum)}
                    className={pageNum === currentPage ? "active custom-active-page" : ""}
                  >
                    {pageNum}
                  </Pagination.Item>
                );
              }
              return null;
            })}
            
            <Pagination.Next 
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      )}
      
    </div>
  );
}

export default HomeList;