import React from 'react';
import { Link, useLocation } from 'react-router-dom'; // Importa useLocation para obtener la ruta actual
import 'bootstrap/dist/css/bootstrap.min.css';
import mesero from './../img/mesero.png';
import categorias from './../img/categorias.png';
import Home from './../img/home.png';
import menu from './../img/menu.png';
import mesa from './../img/mesas.png';
import reseñas from './../img/reseña.png';
import logo from './../img/LogoBlanco.png';

function Sidebar() {
  const location = useLocation(); // Obtén la ruta actual

  // Función para determinar si la ruta está activa
  const isActive = (path) => location.pathname === path ;
  console.log(location.pathname); // Para depuración, puedes ver la ruta actual en la consola

  return (
    <div
      className="d-flex flex-column text-white"
      style={{
        width: '250px',
        height: '100vh', // Ocupa toda la altura de la ventana
        backgroundColor: '#a4113a', // Color de fondo del Sidebar
        position: 'fixed', // Fija el Sidebar en la página
        top: 0,
        left: 0,
      }}
    >
      <div className="pt-3 px-3">
        <div className='d-flex justify-content-center align-items-end'>
          <img src={logo} alt='Logo' style={{width:50}}/>
          <h4 className="text-center">RESTAURANT</h4>
        </div>
        <hr />
      </div>
      <ul className="nav nav-pills flex-column mb-auto" style={{fontSize: 20}}>
        <li>
          <Link
            to="/home"
            className="nav-link text-white"
            style={{ backgroundColor: isActive('/home') ? '#F47497' : 'transparent' }}
          >
            <img
              src={Home}
              alt="Dashboard"
              style={{ width: '40px', height: '40px', marginRight: '8px' }}
            />
            Dashboard
          </Link>
        </li>
        <li>
          <Link
            to="/meseros"
            className="nav-link text-white"
            style={{ backgroundColor: isActive('/meseros') ? '#F47497' : 'transparent' }}
          >
            <img
              src={mesero}
              alt="Meseros"
              style={{ width: '40px', height: '40px', marginRight: '8px' }}
            />
            Meseros
          </Link>
        </li>
        <li>
          <Link
            to="/mesas"
            className="nav-link text-white"
            style={{ backgroundColor: isActive('/mesas') ? '#F47497' : 'transparent' }}
          >
            <img
              src={mesa}
              alt="Mesas"
              style={{ width: '40px', height: '40px', marginRight: '8px' }}
            />
            Mesas
          </Link>
        </li>
        <li>
          <Link
            to="/categorias"
            className="nav-link text-white"
            style={{ backgroundColor: isActive('/categorias') ? '#F47497' : 'transparent' }}
          >
            <img
              src={categorias}
              alt="Categorías"
              style={{ width: '40px', height: '40px', marginRight: '8px' }}
            />
            Categorías
          </Link>
        </li>
        <li>
          <Link
            to="/productos"
            className="nav-link text-white"
            style={{ backgroundColor: isActive('/productos') ? '#F47497' : 'transparent' }}
          >
            <img
              src={menu}
              alt="Productos"
              style={{ width: '40px', height: '40px', marginRight: '8px' }}
            />
            Productos
          </Link>
        </li>
        <li>
          <Link
            to="/resenas"
            className="nav-link text-white"
            style={{ backgroundColor: isActive('/resenas') ? '#F47497' : 'transparent' }}
          >
            <img
              src={reseñas}
              alt="Reseñas"
              style={{ width: '40px', height: '40px', marginRight: '8px' }}
            />
            Reseñas
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;