import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Recuperar.css'; // Importación del CSS

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
        <div className="recuperar-container">
            <div className="recuperar-logo">
                LEVI'S
            </div>
            
            <h2 className="recuperar-titulo">RECUPERAR CONTRASEÑA</h2>
            <p className="recuperar-instrucciones">Ingresa tus datos para restablecer tu cuenta</p>

            <form onSubmit={handleRecuperar} className="recuperar-form">
                <input 
                    type="text" 
                    placeholder="NOMBRE COMPLETO REGISTRADO" 
                    onChange={e => setNombre(e.target.value)} 
                    required 
                />
                
                <input 
                    type="email" 
                    placeholder="CORREO ELECTRÓNICO" 
                    onChange={e => setEmail(e.target.value)} 
                    required 
                />
                
                <input 
                    type="password" 
                    placeholder="NUEVA CONTRASEÑA" 
                    onChange={e => setNewPassword(e.target.value)} 
                    required 
                />
                
                <button type="submit" className="btn-actualizar">
                    ACTUALIZAR CONTRASEÑA
                </button>

                <Link to="/" className="link-volver">
                    ¿Recordaste tu clave? <b>Inicia sesión</b>
                </Link>
            </form>
        </div>
    );
};

export default Recuperar;