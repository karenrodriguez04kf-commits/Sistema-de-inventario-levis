import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

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
        <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'Arial' }}>
            
            <div style={{ backgroundColor: '#c41230', color: 'white', padding: '15px', display: 'inline-block', fontWeight: 'bold', fontSize: '24px' }}>
                LEVI'S
            </div>
            
            <form onSubmit={handleLogin} style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '15px', width: '320px', margin: '30px auto' }}>
                <input type="email" placeholder="EMAIL" onChange={e => setEmail(e.target.value)} required style={{padding: '10px'}}/>
                <input type="password" placeholder="PASSWORD" onChange={e => setPassword(e.target.value)} required style={{padding: '10px'}}/>
                
                <button type="submit" style={{ backgroundColor: 'black', color: 'white', padding: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                    INGRESAR
                </button>

                <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    
                    <div>
                        <span style={{ fontSize: '14px' }}>¿No tienes cuenta? </span>
                        <Link to="/registro" style={{ color: '#c41230', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>
                            Regístrate aquí
                        </Link>
                    </div>

                    
                    <div>
                        <Link to="/recuperar" style={{ color: '#666', textDecoration: 'none', fontSize: '13px' }}>
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Login;