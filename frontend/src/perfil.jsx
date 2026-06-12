import React, { useState, useEffect } from 'react';
import api from './api'; 
import { jwtDecode } from "jwt-decode";
import './Perfil.css';

const Perfil = () => {
    const [nombre, setNombre] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [cargando, setCargando] = useState(false);
    const [telefono, setTelefono] = useState('');
    const [direccion, setDireccion] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const userEmail = decoded.email;
                setEmail(userEmail);
                
                api.get(`/auth/perfil/${userEmail}`)
                    .then(res => {
                        setNombre(res.data.nombre || '');
                        setTelefono(res.data.telefono || '');
                        setDireccion(res.data.direccion || '');     
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
                email: email,
                telefono: telefono,
                direccion: direccion
            });
            
            if (response.data.Status === "Exito") {
                if (response.data.Token) {
                    localStorage.setItem('token', response.data.Token);
                }
                alert("✨ ¡Perfil actualizado con éxito! ✨");
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

                    <div className="modern-input-group">
                        <label>Correo Electrónico</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            placeholder="Escribe tu email"
                            required 
                        />
                    </div>

                    <div className="modern-input-group">
                        <label>Teléfono</label>
                        <input 
                            type="text" 
                            value={telefono} 
                            onChange={e => setTelefono(e.target.value)} 
                            placeholder="Escribe tu teléfono"
                        />
                    </div>

                    <div className="modern-input-group">
                        <label>Dirección</label>
                        <input 
                            type="text" 
                            value={direccion} 
                            onChange={e => setDireccion(e.target.value)} 
                            placeholder="Escribe tu dirección"
                        />
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