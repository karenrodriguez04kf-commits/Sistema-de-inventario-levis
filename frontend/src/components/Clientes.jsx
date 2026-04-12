import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Clientes = () => {
    const [clientes, setClientes] = useState([]);
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [telefono, setTelefono] = useState('');
    const [editandoId, setEditandoId] = useState(null); // Para saber si estamos editando

    useEffect(() => {
        cargarClientes();
    }, []);

    const cargarClientes = async () => {
        try {
            const res = await axios.get('http://localhost:3001/clientes');
            setClientes(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!nombre || !email) return alert("Llena los campos obligatorios");

        try {
            if (editandoId) {
                
                await axios.put(`http://localhost:3001/clientes/${editandoId}`, { nombre, email, telefono });
                setEditandoId(null);
            } else {
                
                await axios.post('http://localhost:3001/clientes', { nombre, email, telefono });
            }
            setNombre(''); setEmail(''); setTelefono('');
            cargarClientes();
        } catch (err) {
            console.error(err);
        }
    };

   
    const iniciarEdicion = (cliente) => {
        setEditandoId(cliente.id);
        setNombre(cliente.nombre);
        setEmail(cliente.email);
        setTelefono(cliente.telefono);
    };

    
    const eliminarCliente = async (id) => {
        if (window.confirm("¿Seguro que quieres eliminar este cliente?")) {
            try {
                await axios.delete(`http://localhost:3001/clientes/${id}`);
                cargarClientes();
            } catch (err) {
                console.error(err);
            }
        }
    };

    return (
        <div style={{ fontFamily: 'Arial', padding: '20px' }}>
            <div style={{ backgroundColor: 'black', color: 'white', padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ backgroundColor: '#c41230', padding: '5px 10px', fontWeight: 'bold' }}>LEVI'S</div>
                <div><span>CLIENTES</span></div>
            </div>

            <h2 style={{ borderLeft: '4px solid #c41230', paddingLeft: '10px', marginTop: '30px' }}>GESTIÓN DE CLIENTES</h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                <input type="text" placeholder="NOMBRE" value={nombre} onChange={e => setNombre(e.target.value)} style={{ padding: '10px', flex: '1' }} />
                <input type="email" placeholder="EMAIL" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: '10px', flex: '1' }} />
                <input type="text" placeholder="TELÉFONO" value={telefono} onChange={e => setTelefono(e.target.value)} style={{ padding: '10px', flex: '1' }} />
                <button type="submit" style={{ backgroundColor: editandoId ? '#ffc107' : '#28a745', color: 'black', padding: '10px 20px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                    {editandoId ? ' GUARDAR' : '+ AGREGAR'}
                </button>
            </form>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ backgroundColor: 'black', color: 'white' }}>
                        <th style={{ padding: '10px', textAlign: 'left' }}>NOMBRE</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>EMAIL</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>TELÉFONO</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>ACCIONES</th>
                    </tr>
                </thead>
                <tbody>
                    {clientes.map(cliente => (
                        <tr key={cliente.id} style={{ borderBottom: '1px solid #ccc' }}>
                            <td style={{ padding: '10px' }}>{cliente.nombre}</td>
                            <td style={{ padding: '10px' }}>{cliente.email}</td>
                            <td style={{ padding: '10px' }}>{cliente.telefono || 'N/A'}</td>
                            <td style={{ padding: '10px' }}>
                                <button onClick={() => iniciarEdicion(cliente)} style={{ backgroundColor: '#ffc107', border: 'none', padding: '5px 10px', cursor: 'pointer', marginRight: '5px' }}>Editar</button>
                                <button onClick={() => eliminarCliente(cliente.id)} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Clientes;