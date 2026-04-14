import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import './Perfil.css'; // Importación del CSS

const Perfil = () => {
    const [nombre, setNombre] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setEmail(decoded.email || '');
                
                // Traemos los datos actuales para llenar el formulario
                axios.get(`http://localhost:3001/perfil/${decoded.email}`)
                    .then(res => {
                        setNombre(res.data.nombre || '');
                    })
                    .catch(err => console.log("Error al obtener datos:", err));
            } catch (error) {
                console.error("Error al decodificar:", error);
            }
        }
    }, []);

    const handleUpdate = (e) => {
        e.preventDefault();
        axios.put('http://localhost:3001/perfil/actualizar', { nombre, password, email })
            .then(res => {
                if (res.data.Status === "Exito") {
                    // Guardamos el nuevo token (que contiene el nombre actualizado)
                    localStorage.setItem('token', res.data.Token);
                    
                    alert("¡Perfil actualizado con éxito! ✨");
                    setPassword(''); 

                    // Refrescamos para que el Header y Bienvenida lean el nuevo nombre
                    window.location.href = '/home'; 
                }
            })
            .catch(err => alert("Error al actualizar datos"));
    };

    return (
        <div className="perfil-card">
            <h2 className="perfil-titulo">Configuración de Perfil</h2>
            
            <form onSubmit={handleUpdate} className="perfil-form">
                <div className="form-group">
                    <label>Nombre de Usuario:</label>
                    <input 
                        type="text" 
                        value={nombre || ''} 
                        onChange={e => setNombre(e.target.value)} 
                        required 
                    />
                </div>

                <div className="form-group">
                    <label>Nueva Contraseña:</label>
                    <input 
                        type="password" 
                        value={password || ''} 
                        onChange={e => setPassword(e.target.value)} 
                        placeholder="Dejar en blanco para no cambiar" 
                    />
                </div>

                <button type="submit" className="btn-save-perfil">
                    GUARDAR CAMBIOS
                </button>
            </form>
        </div>
    );
};

export default Perfil;