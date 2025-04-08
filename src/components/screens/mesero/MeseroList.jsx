import React, { useState } from 'react';
import { Table, Pagination } from 'react-bootstrap';
import { IoEyeOutline, IoCreateOutline, IoCheckmarkCircleOutline, IoCloseCircleOutline } from 'react-icons/io5';
import "../../../App.css";

/**
 * MeseroList - Componente que muestra la tabla de meseros con acciones y paginación simplificada
 */
const MeseroList = ({ meseros, onView, onEdit, onToggleStatus }) => {
    // Estado para la paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5); // Número de meseros por página

    // Calcular índices para slicing
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    
    // Obtener los meseros de la página actual
    const currentMeseros = meseros.slice(indexOfFirstItem, indexOfLastItem);
    
    // Calcular número total de páginas
    const totalPages = Math.ceil(meseros.length / itemsPerPage);

    // Cambiar de página
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <>
            <Table striped bordered hover responsive>
                <thead className="table-danger">
                    <tr>
                        <th>Id</th>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Correo</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {currentMeseros.map((mesero, index) => (
                        <tr key={index} className="table-row">
                            <td>{indexOfFirstItem + index + 1}</td>
                            <td>{mesero.nombre}</td>
                            <td>{mesero.apellido}</td>
                            <td>{mesero.correo}</td>
                            <td>
                                <div className="d-flex justify-content-around">
                                    {/* Ver detalles */}
                                    <IoEyeOutline 
                                        size={20} 
                                        className="text-primary cursor-pointer" 
                                        onClick={() => onView(mesero.id)}
                                        style={{ cursor: 'pointer' }}
                                        title="Ver detalles"
                                    />
                                    
                                    {/* Editar */}
                                    <IoCreateOutline 
                                        size={20} 
                                        className="text-warning cursor-pointer" 
                                        onClick={() => onEdit(mesero.id)}
                                        style={{ cursor: 'pointer' }}
                                        title="Editar"
                                    />
                                    
                                    {/* Cambiar estado (activo/inactivo) */}
                                    {mesero.estado ? (
                                        <IoCheckmarkCircleOutline 
                                            size={20} 
                                            className="text-success cursor-pointer" 
                                            onClick={() => onToggleStatus(mesero)}
                                            style={{ cursor: 'pointer' }}
                                            title="Activo - Click para desactivar"
                                        />
                                    ) : (
                                        <IoCloseCircleOutline 
                                            size={20} 
                                            className="text-danger cursor-pointer" 
                                            onClick={() => onToggleStatus(mesero)}
                                            style={{ cursor: 'pointer' }}
                                            title="Inactivo - Click para activar"
                                        />
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Paginación simplificada alineada a la derecha */}
            <div className="d-flex justify-content-end mt-3">
                <Pagination className="pagination-danger">
                    <Pagination.Prev 
                        onClick={() => handlePageChange(currentPage - 1)} 
                        disabled={currentPage === 1}
                        className="page-item"
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
                                    className={pageNum === currentPage ? "bg-danger border-danger active" : ""}
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
};

export default MeseroList;