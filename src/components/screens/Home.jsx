import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { VictoryBar, VictoryPie, VictoryChart, VictoryAxis, VictoryTheme } from 'victory';
import axios from 'axios';
import HomeList from './home/HomeList';
import HomeForm from './home/HomeForm';
import HomePDF from './home/HomePDF';
import Sidebar from './Sidebar';

// Componente principal del panel de administración
function Home() {
  // Estado para almacenar todas las ventas cargadas desde la API
  const [ventas, setVentas] = useState([]);
  // Estado para controlar la visibilidad del modal de nueva venta
  const [showModal, setShowModal] = useState(false);
  // Estado para indicar si hay operaciones en curso (carga de datos, envío de formulario)
  const [isLoading, setIsLoading] = useState(false);
  // Estado para controlar errores en la generación de gráficos
  const [chartError, setChartError] = useState(false);
  // Estado para la venta seleccionada para detalles - CORREGIDO
  const [selectedVenta, setSelectedVenta] = useState(null);
  // Estado para controlar la visibilidad del modal de detalles
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Hook que se ejecuta al montar el componente
  useEffect(() => {
    fetchVentas();
  }, []);

  const fetchVentas = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/api/ventas/todas');
      setVentas(response.data || []);
    } catch (error) {
      console.error("Error fetching sales data:", error);
      alert("Error al cargar ventas");
      setVentas([]);
    } finally {
      setIsLoading(false);
    }
  };
      

  const generateChartData = () => {
    // Días de la semana en español
    const diasDisponibles = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];
  
    // Datos de respaldo en caso de que no haya ventas
    let barData = diasDisponibles.map(dia => ({ day: dia, earnings: 0 }));
  
    try {
      if (ventas.length > 0) {
        // Transformar datos de ventas para el gráfico de barras
        const ventasTransformadas = ventas
          .filter(venta => venta && venta.fecha) // Validar objetos de venta
          .map(venta => ({
            day: new Date(venta.fecha).toLocaleDateString('es-ES', { weekday: 'short' }).toLowerCase(), // Día abreviado
            earnings: Number(venta.beneficios || 0) // Beneficios de la venta
          }));
  
        // Crear un mapa de días con ganancias acumuladas
        const gananciasPorDia = new Map();
        ventasTransformadas.forEach(venta => {
          if (gananciasPorDia.has(venta.day)) {
            gananciasPorDia.set(venta.day, gananciasPorDia.get(venta.day) + venta.earnings);
          } else {
            gananciasPorDia.set(venta.day, venta.earnings);
          }
        });
  
        // Actualizar barData con los valores obtenidos de las ventas
        barData = diasDisponibles.map(dia => ({
          day: dia,
          earnings: gananciasPorDia.get(dia) || 0 // Si no hay datos, mantener ganancias en 0
        }));
      }
    } catch (error) {
      console.error("Error generating bar chart data:", error);
      setChartError(true); // Marcar error en la gráfica
    }
  
    // Datos para el gráfico circular
    const pieData = [
      { x: "Día", y: ventas.reduce((sum, venta) => sum + Number(venta.ingresos_dia || 0), 0) || 60 },
      { x: "Tarde", y: ventas.reduce((sum, venta) => sum + Number(venta.ingresos_tarde || 0), 0) || 40 }
    ];
  
    return { barData, pieData };
  };

  // Calcular total de ventas de forma segura usando los campos del modelo
  const totalVentas = ventas.reduce((sum, venta) => {
    return sum + (venta ? Number(venta.ingresos || 0) : 0);
  }, 0);

  // Obtener datos procesados para las gráficas
  const { barData, pieData } = generateChartData();

  // Formatear datos para la tabla
  const formatTableData = () => {
    if (!ventas || ventas.length === 0) {
      return [];
    }
    
    try {
      // Agrupar por día
      const groupedByDay = ventas.reduce((acc, venta) => {
        if (!venta || !venta.fecha) return acc;
        
        const date = new Date(venta.fecha).toLocaleDateString(); // Formato de fecha local
        
        // Inicializar acumulador para el día si no existe
        if (!acc[date]) {
          acc[date] = {
            dia: date,
            ingresos: 0,
            gastos: 0,
            beneficios: 0,
            ventas: []
          };
        }
        
        // Acumular valores según los campos del modelo
        acc[date].ingresos += Number(venta.ingresos_dia || 0) + Number(venta.ingresos_tarde || 0);
        acc[date].gastos += Number(venta.gastos_empleados || 0) + Number(venta.gastos_productos || 0);
        acc[date].beneficios += Number(venta.beneficios || 0);
        acc[date].ventas.push(venta);
        
        return acc;
      }, {});
      
      // Convertir objeto agrupado en array y añadir ID
      return Object.values(groupedByDay).map((day, index) => ({
        id: index + 1,
        ...day
      }));
    } catch (error) {
      console.error("Error formatting table data:", error);
      return []; // Devolver array vacío en caso de error
    }
  };

  // Obtener datos formateados para la tabla
  const tableData = formatTableData();

  // Manejador para visualizar detalle de una venta
  const handleViewVenta = (ventasArray) => {
    setSelectedVenta(ventasArray);
    setShowDetailModal(true);
  };

  // Manejador para cerrar detalle de venta
  const handleCloseDetail = () => {
    setSelectedVenta(null);
    setShowDetailModal(false);
  };

  // Renderizado del componente
  return (
    <div className="d-flex bg-light">
      {/* Barra lateral de navegación */}
      <Sidebar />
      
      {/* Contenido principal */}
      <div className="container-fluid p-4" id="adminPanel">
        <div className="d-flex justify-content-between align-items-center">
          <h3>Panel de Administración</h3>
          <div>
            {/* Botones de acción */}
            <button className="btn  btn-danger me-2" onClick={() => setShowModal(true)}>
              Nueva Venta
            </button>
            <HomePDF elementId="adminPanel" ventas={ventas} />
          </div>
        </div>
        <hr/>
        
        {/* Sección de gráficos */}
        <div className="d-flex flex-wrap justify-content-between mt-4">
          {/* Gráfico de barras: Beneficios por día */}
          <div className="p-3 rounded mt-3">
            <h5>Beneficios por Día</h5>
            {chartError ? (
              <div className="alert alert-warning">Error al cargar gráfica</div>
            ) : (
              <VictoryChart
                theme={VictoryTheme.material}
                domainPadding={20}
                width={400}
                height={300}
              >
                <VictoryAxis
                  tickFormat={(x) => x} // Formato para eje X (días)
                />
                <VictoryAxis
                  dependentAxis
                  tickFormat={(x) => `$${x}`} // Formato para eje Y (dinero)
                />
                <VictoryBar
                  data={barData}
                  x="day"
                  y="earnings"
                  style={{ data: { fill: "#D81B60" } }} // Color de las barras
                />
              </VictoryChart>
            )}
          </div>
          
          {/* Gráfico circular: Ventas día vs tarde */}
          <div className="p-3 rounded mt-3">
            <h5>Ventas Totales: <strong>${totalVentas.toFixed(2)}</strong></h5>
            {chartError ? (
              <div className="alert alert-warning">Error al cargar gráfica</div>
            ) : (
              <VictoryPie
                data={pieData}
                colorScale={["#D81B60", "#F06292"]} // Colores para los segmentos
                radius={80}
                width={300}
                height={300}
                labelRadius={({ innerRadius }) => innerRadius + 30} // Posición de las etiquetas
                style={{
                  labels: { fill: "white", fontSize: 14, fontWeight: "bold" } // Estilo de etiquetas
                }}
              />
            )}
          </div>
        </div>
        
        {/* Tabla de ventas */}
        <HomeList 
          data={tableData} 
          isLoading={isLoading} 
          onViewVenta={handleViewVenta} 
        />
      </div>
      
      {/* Modal para añadir nueva venta */}
      <HomeForm
        show={showModal}
        onHide={() => setShowModal(false)}
        onVentaAdded={fetchVentas}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />

      {/* Modal para mostrar detalles (necesitas crear este componente) */}
      {showDetailModal && selectedVenta && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detalles de Ventas</h5>
                <button type="button" className="btn-close" onClick={handleCloseDetail}></button>
              </div>
              <div className="modal-body">
                {selectedVenta.length > 0 ? (
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Ingresos Día</th>
                        <th>Ingresos Tarde</th>
                        <th>Gastos Empleados</th>
                        <th>Gastos Productos</th>
                        <th>Beneficios</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedVenta.map((venta, index) => (
                        <tr key={index}>
                          <td>{new Date(venta.fecha).toLocaleDateString()}</td>
                          <td>${Number(venta.ingresos_dia || 0).toFixed(2)}</td>
                          <td>${Number(venta.ingresos_tarde || 0).toFixed(2)}</td>
                          <td>${Number(venta.gastos_empleados || 0).toFixed(2)}</td>
                          <td>${Number(venta.gastos_productos || 0).toFixed(2)}</td>
                          <td>${Number(venta.beneficios || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-center">No hay detalles disponibles</p>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseDetail}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;