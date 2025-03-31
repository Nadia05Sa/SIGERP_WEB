import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/screens/Sidebar';
import Login from './components/screens/Login';
import Home from './components/screens/Home';
import Meseros from './components/screens/Meseros';
import Mesas from './components/screens/Mesas';
import Categorias from './components/screens/Categorias';
import Productos from './components/screens/Menu';
import Reseñas from './components/screens/Reseñas';

function App() {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
}

function MainLayout() {
  const location = useLocation(); // Obtén la ruta actual

  // Condiciona la visualización del Sidebar
  const showSidebar = location.pathname !== '/';

  return (
    <div className="d-flex" style={{ height: '100vh' }}>
      {/* Sidebar */}
      {showSidebar && <Sidebar />}

      {/* Main Content */}
      <div style={{ marginLeft: showSidebar ? '250px' : '0', width: '100%' }}>
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/meseros" element={<Meseros />} />
            <Route path="/mesas" element={<Mesas />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/reseñas" element={<Reseñas />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;