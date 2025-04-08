import React, { useState } from "react";
import { Table, Pagination } from "react-bootstrap";
import {
  IoEyeOutline,
  IoCreateOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
} from "react-icons/io5";
import "../../../App.css";

function MesaList({ mesas, searchTerm, onView, onEdit, onToggleEstado }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Filtrado por búsqueda
  const filteredMesas = mesas.filter((mesa) =>
    mesa.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular paginación sobre las mesas filtradas
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMesas = filteredMesas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMesas.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <>
      <Table striped bordered hover responsive>
        <thead className="table-danger">
          <tr>
            <th>Id</th>
            <th>Mesa</th>
            <th>Capacidad</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentMesas.map((mesa, index) => (
            <tr key={mesa.id} className="table-row">
              <td>{indexOfFirstItem + index + 1}</td>
              <td>{mesa.nombre}</td>
              <td>{mesa.capacidad}</td>
              <td>
                <div className="d-flex justify-content-around">
                  <IoEyeOutline
                    size={20}
                    className="text-primary cursor-pointer"
                    onClick={() => onView(mesa.id)}
                    style={{ cursor: "pointer" }}
                    title="Ver detalles"
                  />

<IoCreateOutline
  size={20}
  className="text-warning cursor-pointer"
  onClick={() => onEdit(mesa.id)} // Asegúrate de que esto se esté llamando correctamente
  style={{ cursor: "pointer" }}
  title="Editar"
/>

                  {mesa.estado ? (
                    <IoCheckmarkCircleOutline
                      size={20}
                      className="text-success cursor-pointer"
                      onClick={() => onToggleEstado(mesa)}
                      style={{ cursor: "pointer" }}
                      title="Activo - Click para desactivar"
                    />
                  ) : (
                    <IoCloseCircleOutline
                      size={20}
                      className="text-danger cursor-pointer"
                      onClick={() => onToggleEstado(mesa)}
                      style={{ cursor: "pointer" }}
                      title="Inactivo - Click para activar"
                    />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Paginación */}
      <div className="d-flex justify-content-end mt-3">
        <Pagination className="pagination-danger">
          <Pagination.Prev
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="page-item"
          />

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
                  className={
                    pageNum === currentPage
                      ? "bg-danger border-danger active"
                      : ""
                  }
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
            className="page-item"
          />
        </Pagination>
      </div>
    </>
  );
}

export default MesaList;
