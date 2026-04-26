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

            // 2. CORRECCIÓN DE DIRECCIONES AQUÍ:
            if (res.data.Rol === 'admin') {
                // Le pones el "/home/" adelante porque en App.jsx son rutas hijas
                navigate('/home/inventario'); 
            } else {
                navigate('/home/catalogo'); 
            }
        }
    } catch (err) {
        const mensaje = err.response?.data?.Message || "Error al conectar con el servidor";
        alert(mensaje);
    }
};

    return (
        <div className="login-container">
            <div className="login-logo">
                LEVI'S
            </div>
            
            <form onSubmit={handleLogin} className="login-form">
                <input 
                    type="email" 
                    placeholder="EMAIL" 
                    onChange={e => setEmail(e.target.value)} 
                    required 
                />
                <input 
                    type="password" 
                    placeholder="PASSWORD" 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                />
                
                <button type="submit" className="btn-login">
                    INGRESAR
                </button>

                <div className="login-footer">
                    <div>
                        <span style={{ fontSize: '14px' }}>¿No tienes cuenta? </span>
                        <Link to="/registro" className="link-registro">
                            Regístrate aquí
                        </Link>
                    </div>

                    <div>
                        <Link to="/recuperar" className="link-recuperar">
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Login;