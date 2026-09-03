import React, { useState, useEffect } from 'react';
import api from './api'; 
import './usuarios.css'; 

const Usuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState(''); 
    const [rol, setRol] = useState('cliente'); 
    const [telefono, setTelefono] = useState('');
    const [direccion, setDireccion] = useState('');
    const [editandoId, setEditandoId] = useState(null);

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const cargarUsuarios = async () => {
        try {
            const res = await api.get('/usuarios');
            setUsuarios(res.data);
        } catch (err) {
            console.error("Error al cargar usuarios:", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!nombre.trim()) return alert("El nombre es obligatorio");
        if (!email.trim()) return alert("El email es obligatorio");
        
        // Validamos longitud de contraseña permitiendo cualquier carácter
        if (!editandoId) {
            if (!password.trim()) {
                return alert("La contraseña es obligatoria para nuevos usuarios");
            }
            if (password.length < 6 || password.length > 20) {
                return alert("❌ La contraseña debe tener entre 6 y 20 caracteres.");
            }
        } else {
            if (password.trim() !== '') {
                if (password.length < 6 || password.length > 20) {
                    return alert("❌ La contraseña debe tener entre 6 y 20 caracteres.");
                }
            }
        }

        const datosUsuario = { 
            nombre, 
            email, 
            ...(password && { password }), 
            rol, 
            telefono, 
            direccion 
        };

        try {
            if (editandoId) {
                await api.put(`/usuarios/${editandoId}`, datosUsuario);
                setEditandoId(null);
                alert("Usuario actualizado exitosamente ✨");
            } else {
                await api.post('/usuarios', datosUsuario);
                alert("Usuario registrado exitosamente ✅");
            }
            
            setNombre(''); 
            setEmail(''); 
            setPassword('');
            setRol('cliente');
            setTelefono(''); 
            setDireccion('');
            cargarUsuarios();
        } catch (err) {
            console.error("Error en la operación:", err);
            alert("Error: revisa los datos o si el email ya existe");
        }
    };

    const iniciarEdicion = (usuario) => {
        setEditandoId(usuario.id_usuario);
        setNombre(usuario.nombre);
        setEmail(usuario.email);
        setPassword(''); 
        setRol(usuario.rol || 'cliente');
        setTelefono(usuario.telefono || '');
        setDireccion(usuario.direccion || '');
    };

    const eliminarUsuario = async (id) => {
        if (window.confirm("¿Mano, seguro que quieres borrar este usuario del sistema?")) {
            try {
                await api.delete(`/usuarios/${id}`);
                cargarUsuarios();
            } catch (err) {
                console.error("Error al eliminar:", err);
                alert("No se pudo eliminar el usuario");
            }
        }
    };

    return (
        <div className="clientes-page">
            <div className="clientes-header">
                <div className="logo-levis">LEVI'S</div>
                <div><span>GESTIÓN DE USUARIOS Y ADMINISTRADORES</span></div>
            </div>

            <h2 className="seccion-titulo">Administración General de Cuentas</h2>

            <form onSubmit={handleSubmit} className="clientes-form">
                <input type="text" placeholder="NOMBRE" value={nombre} onChange={e => setNombre(e.target.value)} required />
                <input type="email" placeholder="EMAIL" value={email} onChange={e => setEmail(e.target.value)} required />
                
                <input 
                    type="password" 
                    placeholder={editandoId ? "NUEVA CONTRASEÑA (Opcional)" : "CONTRASEÑA (6-20 caracteres)"} 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    {...(!editandoId && { required: true })}
                />

                <select value={rol} onChange={e => setRol(e.target.value)} required className="select-rol">
                    <option value="cliente">Cliente</option>
                    <option value="admin">Administrador</option>
                </select>

                <input type="text" placeholder="TELÉFONO" value={telefono} onChange={e => setTelefono(e.target.value)} />
                <input type="text" placeholder="DIRECCIÓN" value={direccion} onChange={e => setDireccion(e.target.value)} />
                
                <button type="submit" className={`btn-submit ${editandoId ? 'btn-editar' : 'btn-agregar'}`}>
                    {editandoId ? 'GUARDAR CAMBIOS' : '+ AGREGAR USUARIO'}
                </button>
                
                {editandoId && (
                    <button 
                        type="button" 
                        onClick={() => { 
                            setEditandoId(null); 
                            setNombre(''); 
                            setEmail(''); 
                            setPassword('');
                            setRol('cliente');
                            setTelefono(''); 
                            setDireccion(''); 
                        }} 
                        className="btn-cancelar"
                    >
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
                            <th>EMAIL</th>
                            <th>ROL</th>
                            <th>TELÉFONO</th>
                            <th>DIRECCIÓN</th>
                            <th>ACCIONES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.map(usuario => (
                            <tr key={usuario.id_usuario}>
                                <td>#{usuario.id_usuario}</td>
                                <td className="bold">{usuario.nombre}</td>
                                <td>{usuario.email}</td>
                                <td>
                                    <span className={`badge-rol ${usuario.rol === 'admin' ? 'badge-admin' : 'badge-cliente'}`}>
                                        {usuario.rol.toUpperCase()}
                                    </span>
                                </td>
                                <td>{usuario.telefono || 'N/A'}</td>
                                <td>{usuario.direccion || 'N/A'}</td>
                                <td>
                                    <button onClick={() => iniciarEdicion(usuario)} className="btn-tabla btn-edit">Editar</button>
                                    <button onClick={() => eliminarUsuario(usuario.id_usuario)} className="btn-tabla btn-delete">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Usuarios;