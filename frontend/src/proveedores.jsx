import React, { useState, useEffect } from 'react';
import api from './api';
import './Proveedores.css';

const Proveedores = () => {
    const [proveedores, setProveedores] = useState([]);
    const [nombre, setNombre] = useState('');
    const [rol_proveedor, setRolProveedor] = useState('');
    const [correo, setCorreo] = useState('');
    const [editandoId, setEditandoId] = useState(null); 

    useEffect(() => {
        cargarProveedores();
    }, []);

    const cargarProveedores = async () => {
        try {
            const res = await api.get('/proveedores');
            setProveedores(res.data);
        } catch (err) {
            console.error("Error al cargar proveedores:", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!nombre.trim()) return alert("El nombre es obligatorio");
        if (!correo.trim()) return alert("El correo es obligatorio");
        if (!rol_proveedor.trim()) return alert("El rol del proveedor es obligatorio");

        const datosProveedor = { nombre, correo, rol_proveedor };
        try {
            if (editandoId) {
                await api.put(`/proveedores/${editandoId}`, datosProveedor);
                setEditandoId(null);
                alert("✅ Proveedor actualizado");
            } else {
                await api.post('/proveedores', datosProveedor);
                alert("✅ Proveedor registrado");
            }
            setNombre('');
            setCorreo('');
            setRolProveedor('');
            cargarProveedores();
        } catch (err) {
            console.error("Error:", err);
            alert("❌ Error en la operación");
        }
    };

    const iniciarEdicion = (proveedor) => {
        setNombre(proveedor.nombre);
        setCorreo(proveedor.correo);
        setRolProveedor(proveedor.rol_proveedor);
        setEditandoId(proveedor.id_proveedor);
    };

    const eliminarProveedor = async (id) => {
        if (window.confirm("¿Estás seguro de eliminar este proveedor?")) {
            try {
                await api.delete(`/proveedores/${id}`);
                cargarProveedores();
            } catch (err) {
                alert("❌ Error al eliminar");
            }
        }
    };

    return (
        <div className="clientes-page">
            <div className="clientes-header">
                <div className="logo-levis">LEVI'S</div>
                <div><span>GESTIÓN DE PROVEEDORES</span></div>
            </div>

            <h2 className="seccion-titulo">Administración de Proveedores</h2>

            <form onSubmit={handleSubmit} className="clientes-form">
                <input
                    type="text"
                    placeholder="NOMBRE"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="CORREO"
                    value={correo}
                    onChange={e => setCorreo(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="ROL DEL PROVEEDOR"
                    value={rol_proveedor}
                    onChange={e => setRolProveedor(e.target.value)}
                    required
                />
                <button type="submit" className={`btn-submit ${editandoId ? 'btn-editar' : 'btn-agregar'}`}>
                    {editandoId ? 'GUARDAR CAMBIOS' : '+ AGREGAR PROVEEDOR'}
                </button>
                {editandoId && (
                    <button type="button" onClick={() => {
                        setEditandoId(null);
                        setNombre('');
                        setCorreo('');
                        setRolProveedor('');
                    }} className="btn-cancelar">
                        Cancelar
                    </button>
                )}
            </form>

            <div className="tabla-container">
                <table className="tabla-clientes">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>NOMBRE</th>
                            <th>CORREO</th>
                            <th>ROL</th>
                            <th>ACCIONES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {proveedores.map(proveedor => (
                            <tr key={proveedor.id_proveedor}>
                                <td>#{proveedor.id_proveedor}</td>
                                <td>{proveedor.nombre}</td>
                                <td>{proveedor.correo}</td>
                                <td>{proveedor.rol_proveedor}</td>
                                <td>
                                    <button onClick={() => iniciarEdicion(proveedor)} className="btn-tabla btn-edit">Editar</button>
                                    <button onClick={() => eliminarProveedor(proveedor.id_proveedor)} className="btn-tabla btn-delete">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Proveedores;