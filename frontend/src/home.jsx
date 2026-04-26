import React, { useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import './Home.css'; 

const Home = () => {
    const navigate = useNavigate();
    
    // 1. Obtenemos el rol y el token
    const rol = localStorage.getItem('rol');
    const token = localStorage.getItem('token');

    // 2. Seguridad: Si no hay token, lo mandamos al login de una
    useEffect(() => {
        if (!token) {
            navigate('/');
        }
    }, [token, navigate]);

    const handleLogout = () => {
        localStorage.clear(); // Borra Token, Rol e ID de usuario
        navigate('/');
    };

    return (
        <div className="home-wrapper">
            <nav className="navbar">
                {/* Logo: al darle click vuelve al inicio del home */}
                <div className="nav-logo" onClick={() => navigate('/home')}>
                    LEVI'S
                </div>
                
                <div className="nav-links">
                    {/* ACCESO UNIVERSAL: Todos ven el catálogo */}
                    <Link to="/home/catalogo" className="nav-item">CATÁLOGO</Link>
                    
                    {/* ACCESO RESTRINGIDO: Solo si el rol guardado es 'admin' */}
                    {rol === 'admin' && (
                        <>
                            <Link to="/home/inventario" className="nav-item">INVENTARIO</Link>
                            <Link to="/home/clientes" className="nav-item">CLIENTES</Link>
                        </>
                    )}
                    
                    {/* ACCESO DE USUARIO: Ver su propio perfil */}
                    <Link to="/home/perfil" className="nav-item">MI PERFIL</Link>
                    
                    <button onClick={handleLogout} className="btn-logout-nav">
                        CERRAR SESIÓN
                    </button>
                </div>
            </nav>

            <main className="main-content">
                <div className="content-container">
                    {/* Aquí React Router renderiza el componente hijo (Catalogo, Inventario, etc.) */}
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Home;