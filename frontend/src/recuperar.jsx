import React, { useState } from 'react';
import api from './api';
import { useNavigate, Link } from 'react-router-dom';
import './Recuperar.css';

const Recuperar = () => {
    const [email, setEmail] = useState('');
    const [codigo, setCodigo] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const navigate = useNavigate();

    const handleRecuperar = async (e) => {
        e.preventDefault();
        
        if (codigo !== "123456") {
            alert("Código de verificación incorrecto. Usa 123456 (Modo de prueba)");
            return;
        }

        try {
            const res = await api.post('/auth/recuperar', { email, codigo, newPassword });
            if (res.data.Status === "Exito") {
                alert("¡Contraseña actualizada correctamente! ✅");
                navigate('/login');
            }
        } catch (err) {
            alert(err.response?.data?.Message || "Los datos no coinciden con nuestros registros o el servidor falló");
        }
    };

    return (
        <div className="recuperar-container">
            <div className="recuperar-box">
                <div className="recuperar-logo">LEVI'S</div>
                <h2 className="recuperar-titulo">RECUPERAR CONTRASEÑA</h2>
                
                <form onSubmit={handleRecuperar} className="recuperar-form">
                    <input 
                        type="email" 
                        placeholder="CORREO ELECTRÓNICO" 
                        value={email}
                        onChange={e => setEmail(e.target.value)} 
                        required 
                    />
                    
                    <input 
                        type="text" 
                        maxLength="6"
                        placeholder="INGRESE CÓDIGO DE VERIFICACIÓN" 
                        value={codigo}
                        onChange={e => setCodigo(e.target.value)} 
                        style={{ textAlign: 'center', letterSpacing: '2px', fontFamily: 'monospace' }}
                        required 
                    />
                    
                    <input 
                        type="password" 
                        placeholder="NUEVA CONTRASEÑA" 
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)} 
                        required 
                    />
                    
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