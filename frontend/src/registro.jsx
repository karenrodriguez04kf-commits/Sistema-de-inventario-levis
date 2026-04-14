import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Registro.css'; // Importación del CSS

const Registro = () => {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegistro = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3001/register', {
                nombre,
                email,
                password
            });

            if (response.data.Status === "Exito") {
                alert("¡Usuario registrado con éxito en Levi's! ✅");
                navigate('/'); 
            }
        } catch (error) {
            console.error("Error al registrar:", error);
            alert(error.response?.data?.Message || "Error al conectar con el servidor");
        }
    };

    return (
        <div className="registro-container">
            <div className="registro-logo">
                LEVI'S
            </div>
            
            <form onSubmit={handleRegistro} className="registro-form">
                <input 
                    type="text" 
                    placeholder="NOMBRE COMPLETO" 
                    onChange={e => setNombre(e.target.value)} 
                    required 
                />
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
                <button type="submit" className="btn-registro">
                    CREAR CUENTA
                </button>

                <div className="registro-footer">
                    <Link to="/">
                        ¿Ya tienes cuenta? <b>Inicia sesión</b>
                    </Link>
                </div>
            </form>
        </div>
    );
}

export default Registro;