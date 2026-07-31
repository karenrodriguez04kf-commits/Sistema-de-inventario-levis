import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="landing-container">
            <div className="landing-content">
                <div className="landing-logo">LEVI'S®</div>
                <div className="landing-divider" />
                <h2 className="landing-titulo">DESDE 1853</h2>
                <p className="landing-descripcion">
                    Somos un almacén de ropa con más de 170 años vistiendo al mundo.<br />
                    Jeans, chaquetas y accesorios con el estilo auténtico que nunca pasa de moda.
                </p>
                <div className="landing-divider" />
                <p className="landing-slogan">QUALITY NEVER GOES OUT OF STYLE.</p>
                <button className="btn-landing-login" onClick={() => navigate('/login')}>
                    INGRESAR A LA TIENDA
                </button>
            </div>
        </div>
    );
};

export default Landing;