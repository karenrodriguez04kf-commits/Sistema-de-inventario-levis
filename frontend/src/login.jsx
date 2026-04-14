import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css'; // Importación del CSS

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:3001/login', { email, password });
            
            if (res.data.Status === "Exito") {
                localStorage.setItem('token', res.data.Token);
                navigate('/home'); 
            }
        } catch (err) {
            alert("Correo o contraseña incorrectos");
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