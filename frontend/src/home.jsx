import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import './Home.css'; 

const Home = () => {
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <div className="home-wrapper">
            <nav className="navbar">
                <div className="nav-logo" onClick={() => navigate('/home')}>LEVI'S</div>
                <div className="nav-links">
                    <Link to="/home/catalogo" className="nav-item">CATÁLOGO</Link>
                    <Link to="/home/inventario" className="nav-item">INVENTARIO</Link>
                    <Link to="/home/clientes" className="nav-item">CLIENTES</Link>
                    <Link to="/home/perfil" className="nav-item">MI PERFIL</Link>
                    <button onClick={handleLogout} className="btn-logout-nav">CERRAR SESIÓN</button>
                </div>
            </nav>

            <main className="main-content">
                <div className="content-container">
                    {/* AQUÍ es donde se van a intercambiar Bienvenida e Inventario */}
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Home;