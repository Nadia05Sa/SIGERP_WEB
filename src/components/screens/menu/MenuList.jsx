import React, { useState, useEffect } from 'react';
import { Table, Pagination } from 'react-bootstrap';
import { IoEyeOutline, IoCreateOutline, IoCheckmarkCircleOutline, IoCloseCircleOutline } from 'react-icons/io5';

/**
 * MenuList - Componente que muestra la tabla de menú con acciones y paginación simplificada
 */
const MenuList = ({ menu, onView, onEdit, onToggleStatus, isLoading }) => {
    // Estado para la paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5); // Número de items por página
    const [currentMenu, setCurrentMenu] = useState([]);
    const [totalPages, setTotalPages] = useState(0);

    // Efecto para actualizar los datos cuando cambia el menú o la página
    useEffect(() => {
        if (menu && menu.length > 0) {
            // Calcular índices para slicing
            const indexOfLastItem = currentPage * itemsPerPage;
            const indexOfFirstItem = indexOfLastItem - itemsPerPage;
            
            // Obtener los items de la página actual
            setCurrentMenu(menu.slice(indexOfFirstItem, indexOfLastItem));
            
            // Calcular número total de páginas
            setTotalPages(Math.ceil(menu.length / itemsPerPage));
        } else {
            setCurrentMenu([]);
            setTotalPages(0);
        }
    }, [menu, currentPage, itemsPerPage]);

    // Cambiar de página
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Manejadores de eventos con comprobación de errores
    const handleView = (id) => {
        if (onView && typeof onView === 'function') {
            try {
                onView(id);
            } catch (error) {
                console.error("Error al ver detalles:", error);
            }
        } else {
            console.warn("La función onView no está definida correctamente");
        }
    };

    const handleEdit = (id) => {
        if (onEdit && typeof onEdit === 'function') {
            try {
                onEdit(id);
            } catch (error) {
                console.error("Error al editar:", error);
            }
        } else {
            console.warn("La función onEdit no está definida correctamente");
        }
    };

    const handleToggleStatus = (producto) => {
        if (onToggleStatus && typeof onToggleStatus === 'function') {
            try {
                onToggleStatus(producto);
            } catch (error) {
                console.error("Error al cambiar estado:", error);
            }
        } else {
            console.warn("La función onToggleStatus no está definida correctamente");
        }
    };

    // Verificar si hay datos para mostrar
    if (!menu || menu.length === 0) {
        return <div className="alert alert-info">No hay productos disponibles.</div>;
    }

    // Verificar si está cargando
    if (isLoading) {
        return <div className="alert alert-warning">Cargando productos...</div>;
    }

    return(
        <>
            <Table striped bordered hover responsive>
                <thead className="table-danger">
                    <tr>
                        <th>Id</th>
                        <th>Nombre</th>
                        <th>Precio</th>
                        <th>Descripción</th>
                        <th>Categorías</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {currentMenu.map((producto, index) => {
                        // Indexación para la columna ID
                        const itemId = (currentPage - 1) * itemsPerPage + index + 1;
                        
                        return (
                            <tr key={producto.id || index} className="table-row">
                                <td>{itemId}</td>
                                <td>{producto.nombre || 'Sin nombre'}</td>
                                <td>${producto.precio ? producto.precio.toFixed(2) : '0.00'}</td>
                                <td>{producto.descripcion || 'Sin descripción'}</td>
                                <td>
                                    {producto.categorias && producto.categorias.length > 0 ? (
                                        producto.categorias.map((categoria) => (
                                            <span key={categoria.id || index} className="badge bg-primary me-1">
                                                {categoria.nombre}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-muted">Sin categorías</span>
                                    )}
                                </td>
                                <td>
                                    <div className="d-flex justify-content-around">
                                        {/* Ver detalles */}
                                        <IoEyeOutline 
                                            size={20} 
                                            className="text-primary" 
                                            onClick={() => handleView(producto.id)}
                                            style={{ cursor: 'pointer' }}
                                            title="Ver detalles"
                                            data-testid={`view-${producto.id}`}
                                        />
                                        
                                        {/* Editar */}
                                        <IoCreateOutline 
                                            size={20} 
                                            className="text-warning" 
                                            onClick={() => handleEdit(producto.id)}
                                            style={{ cursor: 'pointer' }}
                                            title="Editar"
                                            data-testid={`edit-${producto.id}`}
                                        />
                                        
                                        {/* Cambiar estado (activo/inactivo) */}
                                        {producto.estado ? (
                                            <IoCheckmarkCircleOutline 
                                                size={20} 
                                                className="text-success" 
                                                onClick={() => handleToggleStatus(producto)}
                                                style={{ cursor: 'pointer' }}
                                                title="Activo - Click para desactivar"
                                                data-testid={`toggle-${producto.id}`}
                                            />
                                        ) : (
                                            <IoCloseCircleOutline 
                                                size={20} 
                                                className="text-danger" 
                                                onClick={() => handleToggleStatus(producto)}
                                                style={{ cursor: 'pointer' }}
                                                title="Inactivo - Click para activar"
                                                data-testid={`toggle-${producto.id}`}
                                            />
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>

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

            {/* Estilos CSS en línea */}
            <style type="text/css">
                {`
                    .custom-active-page .page-link {
                        background-color: #dc3545 !important;
                        border-color: #dc3545 !important;
                        color: white !important;
                    }
                    
                    .pagination .page-link {
                        color: #dc3545;
                    }
                    
                    .pagination .page-link:focus {
                        box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25);
                    }
                `}
            </style>
        </>
    );
};

export default MenuList;