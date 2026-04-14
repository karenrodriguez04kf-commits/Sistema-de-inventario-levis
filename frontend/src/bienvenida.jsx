import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode"; 
import './Bienvenida.css';

const Bienvenida = () => {
    const [nombreUsuario, setNombreUsuario] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Buscamos el nombre en el token, si no, usamos 'USUARIO'
                const displayUser = decoded.nombre || decoded.email || 'USUARIO';
                setNombreUsuario(displayUser);
            } catch (error) {
                console.error("Error al leer token:", error);
                setNombreUsuario('USUARIO');
            }
        }
    }, []);

    return (
        <div className="bienvenida-container">
            <h1 className="bienvenida-titulo">
                BIENVENIDO AL PANEL {nombreUsuario.toUpperCase()}
            </h1>
            
            <p className="bienvenida-subtitulo">
                ¿Qué deseas gestionar hoy? Selecciona una opción:
            </p>

            <div className="bienvenida-botones">
                {/* BOTÓN PARA EL CATÁLOGO */}
                <button 
                    onClick={() => navigate('/home/catalogo')}
                    className="btn-gestion"
                >
                    🛒 VER CATÁLOGO
                </button>

                {/* BOTÓN PARA EL INVENTARIO */}
                <button 
                    onClick={() => navigate('/home/inventario')}
                    className="btn-gestion"
                >
                    📦 GESTIONAR INVENTARIO
                </button>
                
                {/* BOTÓN PARA LOS CLIENTES */}
                <button 
                    onClick={() => navigate('/home/clientes')}
                    className="btn-gestion"
                >
                    👥 GESTIONAR CLIENTES
                </button>
                
                {/* BOTÓN PARA SALIR */}
                <button 
                    onClick={() => {
                        localStorage.removeItem('token');
                        navigate('/');
                    }}
                    className="btn-logout"
                >
                    🚪 CERRAR SESIÓN
                </button>
            </div>
        </div>
    );
};

// ESTO ES LO MÁS IMPORTANTE PARA QUE APP.JSX NO DE ERROR:
export default Bienvenida;