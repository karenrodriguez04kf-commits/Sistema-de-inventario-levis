import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode"; 

const Bienvenida = () => {
    const [nombreUsuario, setNombreUsuario] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Prioridad: 1. Nombre actualizado, 2. Email, 3. 'USUARIO' por defecto
                const displayUser = decoded.nombre || decoded.email || 'USUARIO';
                setNombreUsuario(displayUser);
            } catch (error) {
                console.error("Error al leer token:", error);
                setNombreUsuario('USUARIO');
            }
        }
    }, []);

    return (
        <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'Arial' }}>
            <h1 style={{ color: '#c41230', fontSize: '36px', fontWeight: 'bold' }}>
                BIENVENIDA AL PANEL {nombreUsuario.toUpperCase()}
            </h1>
            
            <p style={{ color: '#666', fontSize: '18px', marginTop: '10px' }}>
                Selecciona una opción para comenzar:
            </p>

            <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
                <button 
                    onClick={() => navigate('/home/clientes')}
                    style={{ backgroundColor: 'black', color: 'white', padding: '15px 30px', border: 'none', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px' }}
                >
                    📁 GESTIONAR CLIENTES
                </button>
                
                <button 
                    onClick={() => {
                        localStorage.removeItem('token');
                        navigate('/');
                    }}
                    style={{ backgroundColor: '#c41230', color: 'white', padding: '15px 30px', border: 'none', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px' }}
                >
                    🚪 CERRAR SESIÓN
                </button>
            </div>
        </div>
    );
};

export default Bienvenida;