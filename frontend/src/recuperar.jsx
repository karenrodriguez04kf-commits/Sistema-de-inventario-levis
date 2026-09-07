import React, { useState } from 'react';
import api from './api';
import { useNavigate, Link } from 'react-router-dom';
import './Recuperar.css';

const Recuperar = () => {
    const [paso, setPaso] = useState(1);
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [nuevaPassword, setNuevaPassword] = useState('');
    const [mensajesBandeja, setMensajesBandeja] = useState([]);
    const [mostrarBandeja, setMostrarBandeja] = useState(false);
    const navigate = useNavigate();

    const handleEnviarCorreo = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/recuperar', { email });
            alert(res.data.message || "Instrucciones procesadas.");
            setPaso(2);
        } catch (err) {
            alert(err.response?.data?.mensaje || "Error al solicitar la recuperación.");
        }
    };

    const handleVerBandeja = async () => {
        try {
            const res = await api.get(`/auth/bandeja/${email}`);
            setMensajesBandeja(res.data);
            setMostrarBandeja(!mostrarBandeja);
        } catch (err) {
            alert("No se pudo cargar la bandeja interna.");
        }
    };

    const handleCambiarPassword = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/cambiar-password', { email, token, nuevaPassword });
            if (res.data.success) {
                alert("¡Contraseña actualizada correctamente! ✅");
                navigate('/login');
            }
        } catch (err) {
            alert(err.response?.data?.mensaje || "Código inválido o error en el servidor.");
        }
    };

    return (
        <div className="recuperar-container">
            {/* 📩 BANDEJA FLOTANTE EN LA ESQUINA SUPERIOR */}
            {paso === 2 && (
                <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000 }}>
                    <button 
                        type="button" 
                        onClick={handleVerBandeja}
                        style={{ 
                            backgroundColor: '#1a1a1a', 
                            color: '#fff', 
                            border: '1px solid #c41230', 
                            padding: '10px 16px', 
                            cursor: 'pointer', 
                            fontSize: '12px',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <span>📩 Buzón del Sistema</span>
                        <span style={{ background: '#c41230', padding: '2px 6px', borderRadius: '10px', fontSize: '10px' }}>Simulador</span>
                    </button>

                    {mostrarBandeja && (
                        <div style={{ 
                            position: 'absolute', 
                            right: '0', 
                            marginTop: '8px', 
                            width: '280px', 
                            background: '#121212', 
                            border: '1px solid #333', 
                            boxShadow: '0 8px 24px rgba(0,0,0,0.8)',
                            padding: '12px',
                            textAlign: 'left'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #222', paddingBottom: '6px', marginBottom: '8px' }}>
                                <span style={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>Notificaciones Internas</span>
                                <span style={{ color: '#777', fontSize: '10px' }}>BD Local</span>
                            </div>

                            {mensajesBandeja.length === 0 ? (
                                <p style={{ color: '#777', fontSize: '11px', textAlign: 'center', margin: '10px 0' }}>No hay códigos pendientes.</p>
                            ) : (
                                mensajesBandeja.map((msg, index) => {
                                    const fechaFormateada = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                                    
                                    return (
                                        <div key={msg.id} style={{ 
                                            background: index === 0 ? 'rgba(196, 18, 48, 0.15)' : '#1a1a1a', 
                                            borderLeft: index === 0 ? '3px solid #c41230' : '3px solid #444',
                                            padding: '8px', 
                                            marginBottom: '6px' 
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#888', marginBottom: '3px' }}>
                                                <span>{index === 0 ? '🔥 Más reciente' : 'Anterior'}</span>
                                                <span>{fechaFormateada}</span>
                                            </div>
                                            <span style={{ color: '#fff', fontSize: '12px', display: 'block', fontFamily: 'monospace' }}>{msg.mensaje}</span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            )}

            <div className="recuperar-box">
                <div className="recuperar-logo">LEVI'S</div>
                <h2 className="recuperar-titulo">RECUPERAR CONTRASEÑA</h2>
                
                {paso === 1 ? (
                    <form onSubmit={handleEnviarCorreo} className="recuperar-form">
                        <p className="recuperar-instrucciones">Ingresa tu correo registrado para generar el código de verificación.</p>
                        <input 
                            type="email" 
                            placeholder="CORREO ELECTRÓNICO" 
                            value={email}
                            onChange={e => setEmail(e.target.value)} 
                            required 
                        />
                        <button type="submit" className="btn-actualizar">ENVIAR CÓDIGO</button>
                        <div className="recuperar-footer">
                            <span style={{ color: '#666', fontSize: '13px' }}>¿Recordaste tu clave? </span>
                            <Link to="/login" className="link-login">Inicia sesión</Link>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleCambiarPassword} className="recuperar-form">
                        <p className="recuperar-instrucciones">Revisa el buzón flotante arriba a la derecha para ver tu código.</p>
                        
                        <input 
                            type="email" 
                            value={email} 
                            disabled 
                            style={{ opacity: 0.7, cursor: 'not-allowed' }}
                        />

                        <input 
                            type="text" 
                            maxLength="6"
                            placeholder="INGRESE CÓDIGO DE 6 DÍGITOS" 
                            value={token}
                            onChange={e => setToken(e.target.value)} 
                            style={{ textAlign: 'center', letterSpacing: '2px', fontFamily: 'monospace' }}
                            required 
                        />
                        
                        <input 
                            type="password" 
                            placeholder="NUEVA CONTRASEÑA" 
                            value={nuevaPassword}
                            onChange={e => setNuevaPassword(e.target.value)} 
                            required 
                        />
                        
                        <button type="submit" className="btn-actualizar">ACTUALIZAR CONTRASEÑA</button>
                        
                        <div className="recuperar-footer">
                            <button 
                                type="button" 
                                onClick={() => { setPaso(1); setMostrarBandeja(false); }} 
                                style={{ background: 'none', border: 'none', color: '#c41230', cursor: 'pointer', fontSize: '12px', marginTop: '10px' }}
                            >
                                ← Volver a intentar con otro correo
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Recuperar;