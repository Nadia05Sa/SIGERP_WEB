import './App.css';
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './components/screens/Sidebar';
import Login from './components/screens/Login';
import Home from './components/screens/Home';
import Meseros from './components/screens/Meseros';
import Mesas from './components/screens/Mesas';
import Categorias from './components/screens/Categorias';
import Productos from './components/screens/Menu';
import Reseñas from './components/screens/Reseñas';
import authService from './service/authService';
import Resena from './components/screens/reseña/Reseña';

// Custom ProtectedRoute component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  useEffect(() => {
    // Initialize authentication on app startup
    authService.initializeAuth();
  }, []); // Cerrar correctamente el useEffect

  return (
    <Router>
      <MainLayout />
    </Router>
  );
}

function MainLayout() {
  const location = useLocation(); // Obtén la ruta actual

  // Rutas donde NO quieres mostrar el sidebar (puedes añadir más si es necesario)
  const hideSidebarRoutes = ['/', '/resena'];
  const showSidebar = !hideSidebarRoutes.includes(location.pathname);

  return (
    <div className="d-flex" style={{ height: '100%' }}>
      {/* Sidebar */}
      {showSidebar && <Sidebar />}

      {/* Main Content */}
      <div style={{ marginLeft: showSidebar ? '250px' : '0', width: '100%' }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/resena" element={<Resena />} />

          <Route path="/home" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/meseros" element={
            <ProtectedRoute>
              <Meseros />
            </ProtectedRoute>
          } />
          <Route path="/mesas" element={
            <ProtectedRoute>
              <Mesas />
            </ProtectedRoute>
          } />
          <Route path="/categorias" element={
            <ProtectedRoute>
              <Categorias />
            </ProtectedRoute>
          } />
          <Route path="/productos" element={
            <ProtectedRoute>
              <Productos />
            </ProtectedRoute>
          } />
          <Route path="/resenas" element={
            <ProtectedRoute>
              <Reseñas />
            </ProtectedRoute>
          } />            
        </Routes>
      </div>
    </div>
  );
}

export default App;
