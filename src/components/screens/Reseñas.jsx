import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Sidebar from './Sidebar';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme } from 'victory';
import '../../App.css';

// Componente de estrella individual optimizado
const Star = ({ marked, starId }) => {
  return (
    <span 
      data-star-id={starId} 
      className="star" 
      role="button"
      style={{ 
        color: marked ? '#FFD700' : '#C5C5C5',
        fontSize: '24px',
        cursor: 'pointer',
        marginRight: '2px',
        transition: 'color 0.2s ease-in-out'
      }}
    >
      {marked ? "\u2605" : "\u2606"}
    </span>
  );
};

// Componente de calificación por estrellas mejorado
const StarRating = ({ value, editable = false, onChange = () => {} }) => {
  const [rating, setRating] = useState(parseInt(value) || 0);
  const [selection, setSelection] = useState(0);
  
  // Actualizar rating cuando cambia el valor externo
  useEffect(() => {
    setRating(parseInt(value) || 0);
  }, [value]);
  
  const hoverOver = (event) => {
    if (!editable) return;
    let val = 0;
    if (event && event.target && event.target.getAttribute("data-star-id"))
      val = parseInt(event.target.getAttribute("data-star-id"));
    setSelection(val);
  };
  
  const handleClick = (e) => {
    if (!editable) return;
    const newRating = parseInt(e.target.getAttribute("data-star-id") || rating);
    setRating(newRating);
    onChange(newRating);
  };
  
  return (
    <div
      className="star-rating"
      onMouseLeave={() => hoverOver(null)}
      onMouseOver={hoverOver}
      onClick={handleClick}
      aria-label={`Calificación: ${rating} de 5 estrellas`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          starId={i + 1}
          key={`star_${i + 1}`}
          marked={selection ? selection >= i + 1 : rating >= i + 1}
        />
      ))}
    </div>
  );
};

// Componente de carrusel de imágenes mejorado con manejo de errores
const ImageCarousel = ({ index }) => {
  const [imageError, setImageError] = useState(false);
  
  // Arreglo de imágenes predeterminadas con fallback
  const images = [
    "../img/usuario1.jpg",
    "../img/usuario2.jpg",
    "../img/usuario3.jpg",
  ];
  
  // Imagen de fallback en caso de error
  const fallbackImage = "https://placehold.co/100x100/gray/white.png?text=Usuario";
  
  // Selecciona una imagen basada en el índice de la reseña
  const selectedImage = images[index % images.length];
  
  const handleImageError = () => {
    setImageError(true);
  };
  
  return (
    <img 
      src={imageError ? fallbackImage : selectedImage} 
      alt={`Usuario ${index + 1}`}
      className="rounded-circle shadow-sm" 
      width="64" 
      height="64"
      onError={handleImageError}
      loading="lazy"
    />
  );
};

// Componente de reseña individual para mejorar la modularidad
const ReseñaItem = ({ reseña, index }) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  // Adaptación para trabajar con la estructura de datos de la API
  const nombre = reseña.cliente?.nombre || reseña.empleado?.nombre || 'Cliente';
  const fecha = reseña.fecha || new Date().toISOString().split('T')[0];
  const calificacion = reseña.puntuacion || 0;
  const comentario = reseña.comentario || '';

  return (
    <div className="mb-4 border p-3 rounded shadow-sm table-row hover-effect">
      <div className="d-flex justify-content-between align-items-end">
               
        <div className="d-flex pt-4">
          {/* Imagen de perfil con carrusel */}
          <div className="me-3">
            <ImageCarousel index={index} />
          </div>
          <div className="w-100">
            <div className="d-flex justify-content-between align-items-center">
              <p>Mesero: {nombre}</p>
            </div>
            <p className="mt-2">{comentario}</p>
          </div>
        </div>

        {/* Estrella en la esquina superior derecha */}
        <div className="d-flex flex-column align-items-end">
          <StarRating value={calificacion} editable={false} />
          <small className="text-muted px-1">{formatDate(fecha)}</small>
          {/*<span className="text-muted">{calificacion} de 5</span>*/}
        </div>
      </div>
    </div>
  );
};

function Reseñas() {
  const [reseñas, setReseñas] = useState([]);
  const [filtro, setFiltro] = useState('todas');
  const [reseñasFiltradas, setReseñasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Cargar reseñas desde la API
  useEffect(() => {
    const fetchReseñas = async () => {
      try {
        setLoading(true);
        
        const config = {
          method: 'get',
          url: 'http://localhost:8080/api/resena',
          headers: { 
            'Content-Type': 'application/json'
          }
        };
        
        const response = await axios.request(config);
        setReseñas(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar las reseñas:", err);
        setError("No se pudieron cargar las reseñas. Por favor, intente nuevamente más tarde.");
        setLoading(false);
      }
    };
    
    fetchReseñas();
  }, []);
  
  // Efecto para filtrar reseñas
  useEffect(() => {
    if (filtro === 'todas') {
      setReseñasFiltradas(reseñas);
    } else {
      const estrellas = parseInt(filtro);
      setReseñasFiltradas(reseñas.filter(reseña => reseña.puntuacion === estrellas));
    }
  }, [filtro, reseñas]);
  
  // Calcular calificación promedio
  const calificacionPromedio = reseñas.length > 0 
    ? (reseñas.reduce((acc, curr) => acc + (curr.puntuacion || 0), 0) / reseñas.length).toFixed(1) 
    : 0;
  
  // Calcular datos para la gráfica basados en las reseñas reales
  const calcularDatosGrafica = () => {
    // Inicializar contador para cada calificación
    const conteo = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    // Contar reseñas por calificación
    reseñas.forEach(reseña => {
      const puntuacion = reseña.puntuacion || 0;
      if (puntuacion >= 1 && puntuacion <= 5) {
        conteo[puntuacion]++;
      }
    });
    
    // Convertir a formato para VictoryBar (de 5 estrellas a 1 estrella)
    return [5, 4, 3, 2, 1].map(estrellas => ({
      x: `${estrellas} ★`,
      y: conteo[estrellas]
    }));
  };
  
  // Datos dinámicos para la gráfica de barras
  const calificacionesData = calcularDatosGrafica();
  
  // Renderizado condicional según el estado de carga
  if (loading) {
    return (
      <div className="d-flex">
        <Sidebar />
        <div className="container-fluid p-4 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="d-flex">
        <Sidebar />
        <div className="container-fluid p-4">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="d-flex">
      
      {/* Contenido principal */}
      <div className="container-fluid p-4">
        <h3 className="mb-4">Reseñas</h3>
        
        
        
        {/* Calificaciones */}
        <div className="shadow-sm mb-4 d-flex justify-content-center align-items-center">
          {/* Panel de información general */}
          <div className="p-4">
            <h1 className="display-4 mb-0">{calificacionPromedio}</h1>
            <div className="align-items-center mb-4">
              <StarRating value={calificacionPromedio} editable={false} />
              <div className="mx-2">
                <p className="mb-0">Basado en {reseñas.length.toLocaleString()} reseñas</p>
              </div>
            </div>
          </div>
          {/* Gráfica de barras */}
          <div className="card-body">
            <h5 className="card-title text-center mb-4 text-danger">Distribución de Calificaciones</h5>
            <div style={{ height: "250px" }}>
              <VictoryChart
                theme={VictoryTheme.material}
                domainPadding={20}
                height={250}
              >
                <VictoryAxis
                  tickFormat={(x) => x}
                  style={{
                    tickLabels: { fontSize: 12, padding: 5 }
                  }}
                />
                <VictoryAxis
                  dependentAxis
                  tickFormat={(y) => `${y}`}
                  style={{
                    tickLabels: { fontSize: 12, padding: 5 }
                  }}
                />
                <VictoryBar
                  data={calificacionesData}
                  x="x"
                  y="y"
                  style={{
                    data: { fill: '#D81B60', width: 30 },
                  }}
                  animate={{
                    duration: 2000,
                    onLoad: { duration: 1000 }
                  }}
                />
              </VictoryChart>
            </div>
          </div>
        </div>
        
        {/* Filtros de reseñas */}
        <div className="mb-4">
          <div className="btn-group">
            <button 
              className={`btn ${filtro === 'todas' ? 'btn-danger' : 'btn-outline-danger'}`}
              onClick={() => setFiltro('todas')}
            >
              Todas
            </button>
            {[5, 4, 3, 2, 1].map(estrellas => (
              <button 
                key={estrellas}
                className={`btn ${filtro === estrellas.toString() ? 'btn-danger' : 'btn-outline-danger'}`}
                onClick={() => setFiltro(estrellas.toString())}
              >
                {estrellas} ★
              </button>
            ))}
          </div>
          <small className="ms-2 text-muted">
            Mostrando {reseñasFiltradas.length} {reseñasFiltradas.length === 1 ? 'reseña' : 'reseñas'}
          </small>
        </div>
        
        {/* Lista de reseñas individuales */}
        <div className="mt-4">
          <h5 className="mb-3">Reseñas de Clientes</h5>
          {reseñasFiltradas.length > 0 ? (
            reseñasFiltradas.map((reseña, index) => (
              <ReseñaItem key={reseña.id || index} reseña={reseña} index={index} />
            ))
          ) : (
            <div className="alert alert-info">
              No hay reseñas que coincidan con el filtro seleccionado.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Reseñas;