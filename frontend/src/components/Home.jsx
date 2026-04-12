import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <div style={{ minHeight: '100vh', fontFamily: 'Arial' }}>
            
            <nav style={{ 
                backgroundColor: 'black', 
                color: 'white', 
                padding: '10px 20px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    
                    <div 
                        onClick={() => navigate('/home')} 
                        style={{ 
                            backgroundColor: '#c41230', 
                            padding: '5px 15px', 
                            fontWeight: 'bold', 
                            cursor: 'pointer',
                            userSelect: 'none'
                        }}
                    >
                        LEVI'S
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
                    <Link to="/home/clientes" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>
                        CLIENTES
                    </Link>

                    
                    <Link to="/home/perfil" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>
                        MI PERFIL
                    </Link>

                    <button 
                        onClick={handleLogout} 
                        style={{ 
                            backgroundColor: 'white', 
                            color: 'black', 
                            border: 'none', 
                            padding: '8px 15px', 
                            fontWeight: 'bold', 
                            cursor: 'pointer' 
                        }}
                    >
                        CERRAR SESIÓN
                    </button>
                </div>
            </nav>

            {/* Contenido dinámico */}
            <div style={{ padding: '20px' }}>
                <Outlet />
            </div>
        </div>
    );
};

export default Home;