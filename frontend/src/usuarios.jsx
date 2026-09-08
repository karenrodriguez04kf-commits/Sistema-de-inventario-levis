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

    const handleTelefonoChange = (e) => {
        const valorLimpio = e.target.value.replace(/\D/g, '');
        if (valorLimpio.length <= 10) {
            setTelefono(valorLimpio);
        }
    };

    // Función de apoyo para validar la calidad de la dirección
    const validarDireccion = (texto) => {
        const direccionLimpia = texto.trim();

        // 1. Es obligatoria
        if (!direccionLimpia) {
            alert(" La dirección es obligatoria.");
            return false;
        }

        // 2. Mínimo 10 y máximo 100 caracteres
        if (direccionLimpia.length < 10 || direccionLimpia.length > 100) {
            alert(" La dirección debe tener entre 10 y 100 caracteres.");
            return false;
        }

        // 3. Debe incluir al menos un número (ej. Casa, Edificio, Calle)
        if (!/\d/.test(direccionLimpia)) {
            alert(" La dirección debe incluir al menos un número (ej. Calle 10 #4-20).");
            return false;
        }

        // 4. Debe incluir espacios para separar palabras (evita textos de una sola palabra como "dddddddddd1")
        if (!/\s/.test(direccionLimpia)) {
            alert(" Ingresa una dirección válida con espacios entre calles y números.");
            return false;
        }

        // 5. Bloquea caracteres iguales repetidos 4 o más veces seguidas (ej: "dddd", "aaaa", "1111")
        if (/(.)\1{3,}/i.test(direccionLimpia)) {
            alert(" Ingresa una dirección real. No uses caracteres repetidos.");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar nombre (mínimo 6 y máximo 20 caracteres)
        if (!nombre.trim()) return alert("El nombre es obligatorio");
        if (nombre.trim().length < 6 || nombre.trim().length > 20) {
            return alert("❌ El nombre debe tener entre 6 y 20 caracteres.");
        }

        if (!email.trim()) return alert("El email es obligatorio");
        
        // Validar contraseña
        if (!editandoId) {
            if (!password.trim()) {
                return alert("La contraseña es obligatoria para nuevos usuarios");
            }
            if (password.length < 6 || password.length > 20) {
                return alert(" La contraseña debe tener entre 6 y 20 caracteres.");
            }
        } else {
            if (password.trim() !== '') {
                if (password.length < 6 || password.length > 20) {
                    return alert(" La contraseña debe tener entre 6 y 20 caracteres.");
                }
            }
        }

        // Validar teléfono (exactamente 10 dígitos)
        if (telefono.length !== 10) {
            return alert(" El teléfono debe contener exactamente 10 números.");
        }

        // Validar dirección con todos los filtros de seguridad
        if (!validarDireccion(direccion)) {
            return;
        }

        const datosUsuario = { 
            nombre, 
            email, 
            ...(password && { password }), 
            rol, 
            telefono, 
            direccion: direccion.trim() 
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
                <input 
                    type="text" 
                    placeholder="NOMBRE (6-20 caracteres)" 
                    value={nombre} 
                    onChange={e => setNombre(e.target.value)} 
                    minLength={6}
                    maxLength={20}
                    required 
                />
                
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

                <input 
                    type="text" 
                    inputMode="numeric"
                    placeholder="TELÉFONO (10 DIGITOS)" 
                    value={telefono} 
                    onChange={handleTelefonoChange} 
                    maxLength={10}
                    required
                />

                <input 
                    type="text" 
                    placeholder="DIRECCIÓN (Ej: Calle 10 #4-20)" 
                    value={direccion} 
                    onChange={e => setDireccion(e.target.value)} 
                    minLength={10}
                    maxLength={100}
                    required
                />
                
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