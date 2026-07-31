import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import './bienvenida.css';

const Bienvenida = () => {
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [visible, setVisible] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const displayUser = decoded.nombre || decoded.email || 'USUARIO';
                setNombreUsuario(displayUser);
            } catch (error) {
                setNombreUsuario('USUARIO');
            }
        }
        setTimeout(() => setVisible(true), 100);
    }, []);

    return (
        <div className="bienvenida-container">
            {/* Luces neon de fondo */}
            <div className="neon-orb orb-1" />
            <div className="neon-orb orb-2" />
            <div className="neon-orb orb-3" />

            <div className={`bienvenida-card ${visible ? 'visible' : ''}`}>
                <div className="bienvenida-badge">LEVI'S®</div>

                <p className="bienvenida-saludo">Bienvenid@,</p>
                <h1 className="bienvenida-nombre">{nombreUsuario.toUpperCase()}</h1>
                <div className="bienvenida-divider" />
                <p className="bienvenida-subtexto">
                    Explora nuestra colección y encuentra tu estilo
                </p>

                <div className="bienvenida-botones">
                    <button onClick={() => navigate('/home/catalogo')} className="btn-catalogo">
                        VER CATÁLOGO →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Bienvenida;