import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';


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
        <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'Arial' }}>
            <div style={{ backgroundColor: '#c41230', color: 'white', padding: '15px', display: 'inline-block', fontWeight: 'bold', fontSize: '24px' }}>
                LEVI'S
            </div>
            
            <form onSubmit={handleRegistro} style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '15px', width: '320px', margin: '30px auto' }}>
                <input 
                    type="text" 
                    placeholder="NOMBRE COMPLETO" 
                    onChange={e => setNombre(e.target.value)} 
                    required 
                    style={{padding: '10px', border: '1px solid #ccc'}}
                />
                <input 
                    type="email" 
                    placeholder="EMAIL" 
                    onChange={e => setEmail(e.target.value)} 
                    required 
                    style={{padding: '10px', border: '1px solid #ccc'}}
                />
                <input 
                    type="password" 
                    placeholder="PASSWORD" 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                    style={{padding: '10px', border: '1px solid #ccc'}}
                />
                <button type="submit" style={{ backgroundColor: 'black', color: 'white', padding: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                    CREAR CUENTA
                </button>

                <div style={{ marginTop: '10px' }}>
                    <Link to="/" style={{ color: 'black', textDecoration: 'none', fontSize: '14px' }}>
                        ¿Ya tienes cuenta? <b>Inicia sesión</b>
                    </Link>
                </div>
            </form>
        </div>
    );
}
export default Registro;