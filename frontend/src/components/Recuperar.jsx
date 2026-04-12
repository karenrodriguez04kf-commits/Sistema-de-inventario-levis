import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Recuperar = () => {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const navigate = useNavigate();

    const handleRecuperar = async (e) => {
        e.preventDefault();
        try {
            
            const res = await axios.post('http://localhost:3001/recuperar', { 
                nombre, 
                email, 
                newPassword 
            });

            if (res.data.Status === "Exito") {
                alert("¡Contraseña de Levi's actualizada correctamente! ✅");
                navigate('/'); 
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.Message || "Los datos no coinciden con nuestros registros");
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'Arial' }}>
            
            <div style={{ backgroundColor: '#c41230', color: 'white', padding: '15px', display: 'inline-block', fontWeight: 'bold', fontSize: '24px' }}>
                LEVI'S
            </div>
            
            <h2 style={{ marginTop: '20px', fontSize: '18px' }}>RECUPERAR CONTRASEÑA</h2>
            <p style={{ fontSize: '14px', color: '#666' }}>Ingresa tus datos para restablecer tu cuenta</p>

            <form onSubmit={handleRecuperar} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px', width: '320px', margin: '20px auto' }}>
                
                <input 
                    type="text" 
                    placeholder="NOMBRE COMPLETO REGISTRADO" 
                    onChange={e => setNombre(e.target.value)} 
                    required 
                    style={{padding: '10px', border: '1px solid #ccc'}}
                />
                
                <input 
                    type="email" 
                    placeholder="CORREO ELECTRÓNICO" 
                    onChange={e => setEmail(e.target.value)} 
                    required 
                    style={{padding: '10px', border: '1px solid #ccc'}}
                />
                
                <input 
                    type="password" 
                    placeholder="NUEVA CONTRASEÑA" 
                    onChange={e => setNewPassword(e.target.value)} 
                    required 
                    style={{padding: '10px', border: '1px solid #ccc'}}
                />
                
                <button type="submit" style={{ backgroundColor: 'black', color: 'white', padding: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                    ACTUALIZAR CONTRASEÑA
                </button>

                <div style={{ marginTop: '10px' }}>
                    <Link to="/" style={{ color: 'black', textDecoration: 'none', fontSize: '14px' }}>
                        ¿Recordaste tu clave? <b>Inicia sesión</b>
                    </Link>
                </div>
            </form>
        </div>
    );
};


export default Recuperar;