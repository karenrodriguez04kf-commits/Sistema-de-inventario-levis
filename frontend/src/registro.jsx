import React, { useState } from 'react';
import api from './api';
import { useNavigate, Link } from 'react-router-dom';
import './Registro.css';

const Registro = () => {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegistro = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/register', { nombre, email, password });
            if (response.data.Status === "Exito") {
                alert("¡Usuario registrado con éxito en Levi's! ✅");
                navigate('/login');
            }
        } catch (error) {
            alert(error.response?.data?.Message || "Error al conectar con el servidor");
        }
    };

    return (
        <div className="registro-container">
            <div className="registro-box">
                <div className="registro-logo">LEVI'S</div>
                <form onSubmit={handleRegistro} className="registro-form">
                    <input type="text" placeholder="NOMBRE COMPLETO" onChange={e => setNombre(e.target.value)} required />
                    <input type="email" placeholder="EMAIL" onChange={e => setEmail(e.target.value)} required />
                    <input type="password" placeholder="CONTRASEÑA" onChange={e => setPassword(e.target.value)} required />
                    <button type="submit" className="btn-registro">CREAR CUENTA</button>
                    <div className="registro-footer">
                        <span style={{ color: '#666', fontSize: '13px' }}>¿Ya tienes cuenta? </span>
                        <Link to="/login" className="link-login">Inicia sesión</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Registro;