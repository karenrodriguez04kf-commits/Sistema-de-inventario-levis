import React, { useState } from 'react';
import api from './api';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css'; // Importación del CSS

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

   const handleLogin = async (e) => {
    e.preventDefault();
    try {
        const res = await api.post('/auth/login', { email, password });
        
        if (res.data.Status === "Exito") {
            // 1. Guardas los datos
            localStorage.setItem('token', res.data.Token);
            localStorage.setItem('rol', res.data.Rol);
            localStorage.setItem('id_usuario', res.data.id_usuario);

// Si es administrador va a la bienvenida.
// Si es cliente va directamente al catálogo.
navigate(res.data.Rol === 'admin' ? '/home' : '/home/catalogo');

        }
    } catch (err) {
        const mensaje = err.response?.data?.Message || "Error al conectar con el servidor";
        alert(mensaje);
    }
};

  return (
    <div className="login-container">
        <div className="login-box">
            <div className="login-logo">LEVI'S</div>
            <form onSubmit={handleLogin} className="login-form">
                <input type="email" placeholder="EMAIL" onChange={e => setEmail(e.target.value)} required />
                <input type="password" placeholder="CONTRASEÑA" onChange={e => setPassword(e.target.value)} required />
                <button type="submit" className="btn-login">INGRESAR</button>
                <div className="login-footer">
                    <div>
                        <span style={{ color: '#666', fontSize: '13px' }}>¿No tienes cuenta? </span>
                        <Link to="/registro" className="link-registro">Regístrate aquí</Link>
                    </div>
                    <Link to="/recuperar" className="link-recuperar">¿Olvidaste tu contraseña?</Link>
                    <Link to="/" className="link-recuperar">← Volver al inicio</Link>
                </div>
            </form>
        </div>
    </div>
);
};

export default Login;