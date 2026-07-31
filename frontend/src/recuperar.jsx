import React, { useState } from 'react';
import api from './api';
import { useNavigate, Link } from 'react-router-dom';
import './Recuperar.css';

const Recuperar = () => {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const navigate = useNavigate();

    const handleRecuperar = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/recuperar', { nombre, email, newPassword });
            if (res.data.Status === "Exito") {
                alert("¡Contraseña actualizada correctamente! ✅");
                navigate('/login');
            }
        } catch (err) {
            alert(err.response?.data?.Message || "Los datos no coinciden con nuestros registros");
        }
    };

    return (
        <div className="recuperar-container">
            <div className="recuperar-box">
                <div className="recuperar-logo">LEVI'S</div>
                <h2 className="recuperar-titulo">RECUPERAR CONTRASEÑA</h2>
                <p className="recuperar-instrucciones">Ingresa tus datos para restablecer tu cuenta</p>
                <form onSubmit={handleRecuperar} className="recuperar-form">
                    <input type="text" placeholder="NOMBRE COMPLETO REGISTRADO" onChange={e => setNombre(e.target.value)} required />
                    <input type="email" placeholder="CORREO ELECTRÓNICO" onChange={e => setEmail(e.target.value)} required />
                    <input type="password" placeholder="NUEVA CONTRASEÑA" onChange={e => setNewPassword(e.target.value)} required />
                    <button type="submit" className="btn-actualizar">ACTUALIZAR CONTRASEÑA</button>
                    <div className="recuperar-footer">
                        <span style={{ color: '#666', fontSize: '13px' }}>¿Recordaste tu clave? </span>
                        <Link to="/login" className="link-login">Inicia sesión</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Recuperar;