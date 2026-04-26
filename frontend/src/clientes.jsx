import React, { useState, useEffect } from 'react';
import api from './api'; // Usamos tu instancia configurada
import './Clientes.css'; 

const Clientes = () => {
    const [clientes, setClientes] = useState([]);
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [telefono, setTelefono] = useState('');
    const [direccion, setDireccion] = useState(''); // Agregamos dirección
    const [editandoId, setEditandoId] = useState(null);

    useEffect(() => {
        cargarClientes();
    }, []);

    const cargarClientes = async () => {
        try {
            // La instancia api ya sabe que la base es http://localhost:3002/api
            const res = await api.get('/clientes');
            setClientes(res.data);
        } catch (err) {
            console.error("Error al cargar clientes:", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!nombre || !email) return alert("Mano, llena los campos obligatorios");

        const datosCliente = { 
            nombre, 
            email, 
            telefono, 
            direccion, 
            rol: 'cliente' // Forzamos el rol aquí
        };

        try {
            if (editandoId) {
                await api.put(`/clientes/${editandoId}`, datosCliente);
                setEditandoId(null);
                alert("Cliente actualizado ✨");
            } else {
                await api.post('/clientes', datosCliente);
                alert("Cliente registrado ✅");
            }
            // Limpiar formulario
            setNombre(''); setEmail(''); setTelefono(''); setDireccion('');
            cargarClientes();
        } catch (err) {
            console.error("Error en la operación:", err);
            alert("Error: revisa si el email ya existe");
        }
    };

    const iniciarEdicion = (cliente) => {
        // Importante: usar id_usuario que viene de la DB
        setEditandoId(cliente.id_usuario);
        setNombre(cliente.nombre);
        setEmail(cliente.email);
        setTelefono(cliente.telefono || '');
        setDireccion(cliente.direccion || '');
    };

    const eliminarCliente = async (id) => {
        if (window.confirm("¿Mano, seguro que quieres borrar este cliente?")) {
            try {
                await api.delete(`/clientes/${id}`);
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
                <input type="text" placeholder="DIRECCIÓN" value={direccion} onChange={e => setDireccion(e.target.value)} />
                
                <button type="submit" className={`btn-submit ${editandoId ? 'btn-editar' : 'btn-agregar'}`}>
                    {editandoId ? 'GUARDAR CAMBIOS' : '+ AGREGAR CLIENTE'}
                </button>
                {editandoId && <button type="button" onClick={() => {setEditandoId(null); setNombre(''); setEmail('');}} className="btn-cancelar">Cancelar</button>}
            </form>

            <div className="tabla-container">
                <table className="tabla-clientes">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>NOMBRE</th>
                            <th>EMAIL</th>
                            <th>TELÉFONO</th>
                            <th>DIRECCIÓN</th>
                            <th>ACCIONES</th>
                        
                        </tr>
                    </thead>
                    <tbody>
                        {clientes.map(cliente => (
                            <tr key={cliente.id_usuario}>
                                <td>#{cliente.id_usuario}</td>
                                <td className="bold">{cliente.nombre}</td>
                                <td>{cliente.email}</td>
                                <td>{cliente.telefono || 'N/A'}</td>
                                <td>{cliente.direccion || 'N/A'}</td>
                                <td>

                                    <button onClick={() => iniciarEdicion(cliente)} className="btn-tabla btn-edit">Editar</button>
                                    <button onClick={() => eliminarCliente(cliente.id_usuario)} className="btn-tabla btn-delete">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Clientes;