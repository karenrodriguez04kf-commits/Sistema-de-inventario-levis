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
                // Sanitización estricta para SonarQube
                const rawToken = res.data.Token;
                const rawRol = res.data.Rol;
                const rawId = res.data.id_usuario;

                // Validamos y sanitizamos el token
                const safeToken = typeof rawToken === 'string' ? rawToken.trim() : '';
                
                // Validamos el rol (restringiendo estrictamente a valores permitidos)
                const safeRol = (rawRol === 'admin' || rawRol === 'cliente') ? rawRol : 'cliente';
                
                // Sanitizamos el ID convirtiéndolo a entero seguro en texto
                const safeId = rawId ? String(parseInt(rawId, 10)) : '';

                localStorage.setItem('token', safeToken);
                localStorage.setItem('rol', safeRol);
                localStorage.setItem('id_usuario', safeId);

                navigate(safeRol === 'admin' ? '/home' : '/home/catalogo');
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
        </div>git status
    );
};

export default Login;