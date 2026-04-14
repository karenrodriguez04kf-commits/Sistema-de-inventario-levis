import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Clientes.css'; // Importación del CSS

const Clientes = () => {
    const [clientes, setClientes] = useState([]);
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [telefono, setTelefono] = useState('');
    const [editandoId, setEditandoId] = useState(null);

    useEffect(() => {
        cargarClientes();
    }, []);

    const cargarClientes = async () => {
        try {
            const res = await axios.get('http://localhost:3001/clientes');
            setClientes(res.data);
        } catch (err) {
            console.error("Error al cargar clientes:", err);
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
            console.error("Error en la operación:", err);
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
                console.error("Error al eliminar:", err);
            }
        }
    };

    return (
        <div className="clientes-page">
            <div className="clientes-header">
                <div className="logo-levis">LEVI'S</div>
                <div><span>GESTIÓN DE CLIENTES</span></div>
            </div>

            <h2 className="seccion-titulo">Administración de Base de Datos</h2>

            <form onSubmit={handleSubmit} className="clientes-form">
                <input type="text" placeholder="NOMBRE" value={nombre} onChange={e => setNombre(e.target.value)} />
                <input type="email" placeholder="EMAIL" value={email} onChange={e => setEmail(e.target.value)} />
                <input type="text" placeholder="TELÉFONO" value={telefono} onChange={e => setTelefono(e.target.value)} />
                <button type="submit" className={`btn-submit ${editandoId ? 'btn-editar' : 'btn-agregar'}`}>
                    {editandoId ? 'GUARDAR CAMBIOS' : '+ AGREGAR CLIENTE'}
                </button>
            </form>

            <table className="tabla-clientes">
                <thead>
                    <tr>
                        <th>NOMBRE</th>
                        <th>EMAIL</th>
                        <th>TELÉFONO</th>
                        <th>ACCIONES</th>
                    </tr>
                </thead>
                <tbody>
                    {clientes.map(cliente => (
                        <tr key={cliente.id}>
                            <td>{cliente.nombre}</td>
                            <td>{cliente.email}</td>
                            <td>{cliente.telefono || 'N/A'}</td>
                            <td>
                                <button onClick={() => iniciarEdicion(cliente)} className="btn-tabla btn-edit">Editar</button>
                                <button onClick={() => eliminarCliente(cliente.id)} className="btn-tabla btn-delete">Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Clientes;