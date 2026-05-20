import React, { useState, useEffect } from 'react';
import api from './api'; 
import { jwtDecode } from "jwt-decode";
import './Perfil.css';

const Perfil = () => {
    const [nombre, setNombre] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Extraemos el email del token
                const userEmail = decoded.email;
                setEmail(userEmail);
                
                // Traemos los datos actuales desde la base de datos
                api.get(`/auth/perfil/${userEmail}`)
                    .then(res => {
                        setNombre(res.data.nombre || '');
                    })
                    .catch(err => console.error("Error al obtener datos:", err));
            } catch (error) {
                console.error("Error al decodificar token:", error);
            }
        }
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setCargando(true);
        try {
            const response = await api.put('/auth/perfil/actualizar', { 
               nombre: nombre, 
               password: password, 
               email: email
            });
            
            if (response.data.Status === "Exito") {
                // GUARDAMOS EL NUEVO TOKEN (Contiene el nombre actualizado)
                if (response.data.Token) {
                    localStorage.setItem('token', response.data.Token);
                }
                
                alert("✨ ¡Perfil actualizado con éxito! ✨");
                
                // Redirigir a Home para ver el cambio en el mensaje de bienvenida
                window.location.href = '/home'; 
            }
        } catch (err) {
            console.error(err);
            alert("❌ Error al actualizar: Verifica la conexión con el servidor");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="perfil-full-screen">
            <div className="perfil-glass-card">
                <div className="perfil-avatar">
                    {nombre ? nombre.charAt(0).toUpperCase() : 'U'}
                </div>
                <h2 className="perfil-main-title">Configuración de Perfil</h2>
                <p className="perfil-user-email">{email}</p>

                <form onSubmit={handleUpdate} className="perfil-modern-form">
                    <div className="modern-input-group">
                        <label>Nombre de Usuario</label>
                        <input 
                            type="text" 
                            value={nombre} 
                            onChange={e => setNombre(e.target.value)} 
                            placeholder="Escribe tu nombre"
                            required 
                        />
                    </div>

                    <div className="modern-input-group">
                        <label>Nueva Contraseña</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            placeholder="Dejar en blanco para no cambiar"
                        />
                        <span className="input-hint">Solo si deseas cambiarla</span>
                    </div>

                    <button type="submit" className="btn-perfil-submit" disabled={cargando}>
                        {cargando ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Perfil;