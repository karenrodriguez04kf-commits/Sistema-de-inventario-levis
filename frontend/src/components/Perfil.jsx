import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

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
                    // ACTUALIZACIÓN INMEDIATA: Guardamos el nuevo token
                    localStorage.setItem('token', res.data.Token);
                    
                    alert("¡Perfil actualizado con éxito! ✨");
                    setPassword(''); 

                    // Redirección forzada para refrescar el nombre en la Bienvenida
                    window.location.href = '/home'; 
                }
            })
            .catch(err => alert("Error al actualizar datos"));
    };

    return (
        <div style={{ padding: '30px', backgroundColor: '#f9f9f9', borderRadius: '8px', maxWidth: '500px', margin: '20px auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h2 style={{ borderBottom: '2px solid #c41230', paddingBottom: '10px', color: '#333' }}>Configuración de Perfil</h2>
            
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
                <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Nombre de Usuario:</label>
                    <input 
                        type="text" 
                        value={nombre || ''} 
                        onChange={e => setNombre(e.target.value)} 
                        required 
                        style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} 
                    />
                </div>

                <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Nueva Contraseña:</label>
                    <input 
                        type="password" 
                        value={password || ''} 
                        onChange={e => setPassword(e.target.value)} 
                        placeholder="Dejar en blanco para no cambiar" 
                        style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} 
                    />
                </div>

                <button type="submit" style={{ backgroundColor: 'black', color: 'white', padding: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold', textTransform: 'uppercase', borderRadius: '4px' }}>
                    GUARDAR CAMBIOS
                </button>
            </form>
        </div>
    );
};

export default Perfil;