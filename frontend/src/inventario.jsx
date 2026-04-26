import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "./api"; 
import "./inventario.css";

function Inventario() {
    const [view, setView] = useState("home"); 
    const [productos, setProductos] = useState([]);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [editando, setEditando] = useState(false);
    const [idActual, setIdActual] = useState(null);
    
    const [form, setForm] = useState({
        nombreProducto: "", 
        precioProducto: "", 
        stockProducto: "", 
        imagen: "", 
        talla: "", 
        genero: "", 
        color: "", 
        categoria: "pantalon" 
    });

    // --- CARGAR PRODUCTOS ---
    const cargarProductos = async () => {
        try {
            const res = await api.get("/productos/catalogo");
            setProductos(res.data);
        } catch (err) {
            console.error("Error cargando inventario:", err);
        }
    };

    useEffect(() => {
        cargarProductos();
    }, []);

    // --- ELIMINAR PRODUCTO-
    const eliminarProducto = async (id) => {
        if (window.confirm("Estás seguro de borrar este producto de Levi's?")) {
            try {
             
                const response = await api.delete(`/productos/${id}`);
                
                if (response.status === 200) {
                    alert("Producto eliminado con éxito ");
                    cargarProductos();
                }
            } catch (error) {
                console.error("Error al eliminar:", error);
                alert("Error: Revisa si el producto está en una venta o si el token expiró");
            }
        }
    };

    const abrirModal = (prod = null) => {
        if (prod) {
            setEditando(true);
            setIdActual(prod.id_producto);
            setForm({ ...prod });
        } else {
            setEditando(false);
            setForm({ 
                nombreProducto: "", 
                precioProducto: "", 
                stockProducto: "", 
                imagen: "/img/", 
                talla: "", 
                genero: "", 
                color: "", 
                categoria: "pantalon" 
            });
        }
        setMostrarModal(true);
    };

    const guardarProducto = async () => {
        const data = new FormData();
        data.append("nombreProducto", form.nombreProducto);
        data.append("precioProducto", form.precioProducto);
        data.append("stockProducto", form.stockProducto); 
        data.append("talla", form.talla);
        data.append("categoria", form.categoria);
        data.append("genero", form.genero);
        data.append("color", form.color);
        data.append("descripcionProducto", form.descripcionProducto || "");
        if (form.imagen) {
            data.append("imagen", form.imagen);
        }

        const endpoint = editando ? `/productos/${idActual}` : "/productos";
        const metodo = editando ? 'put' : 'post';

        try {
            const response = await api[metodo](endpoint, data);
            if (response.status === 200 || response.status === 201) {
                alert(editando ? "¡Producto actualizado! ✨" : "¡Producto e imagen guardados! ✅");
                setMostrarModal(false);
                cargarProductos();
            }
        } catch (error) {
            console.error("Error en la petición:", error);
            alert("Error en la operación");
        }
    };

    return (
        <div className="admin-wrapper">
            {view === "home" && (
                <div className="inventory-page-container">
                    <h2 className="admin-title">Panel de Control Levi's</h2>
                    <p className="p-meta">¿Qué deseas gestionar hoy? Selecciona una opción:</p>
                    <div className="panel-acciones">
                        <button onClick={() => { cargarProductos(); setView("listar"); }} className="btn-gestion-negro">
                             📦 GESTIONAR INVENTARIO
                        </button>
                        <Link to="/home/catalogo" className="btn-gestion-negro">
                             🛒 VISTA DEL CATÁLOGO
                        </Link>
                        <Link to="/home/clientes" className="btn-gestion-negro">
                             👥 GESTIONAR CLIENTES
                        </Link>
                    </div>
                </div>
            )}

            {view === "listar" && (
                <div className="inventory-panel">
                    <div className="panel-header-pro">
                        <button className="btn-back-pro" onClick={() => setView("home")}>
                            ← VOLVER AL PANEL
                        </button>
                        <h2>INVENTARIO ACTUAL</h2>
                        <button className="btn-add-pro" onClick={() => abrirModal()}>
                            + AÑADIR PRODUCTO
                        </button>
                    </div>

                    <div className="table-container-pro">
                        <table className="levis-admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>PRODUCTO</th>
                                    <th>CATEGORÍA</th>
                                    <th>PRECIO</th>
                                    <th>TALLA</th>
                                    <th>STOCK</th>
                                    <th>ACCIONES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productos.map((prod) => (
                                    <tr key={prod.id_producto}>
                                        <td>#{prod.id_producto}</td>
                                        <td className="bold">{prod.nombreProducto}</td>
                                        <td><span className="cat-tag">{prod.categoria}</span></td>
                                        <td>${Number(prod.precioProducto || 0).toLocaleString()} COP</td>
                                        <td><span className="talla-badge">{prod.talla}</span></td>
                                        <td>
                                            <span className={`stock-status ${prod.stockProducto < 10 ? 'low' : ''}`}>
                                                {prod.stockProducto} und
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn-action edit" onClick={() => abrirModal(prod)}>Editar</button>
                                            <button className="btn-action delete" onClick={() => eliminarProducto(prod.id_producto)}>Eliminar</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {mostrarModal && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <h3>{editando ? "EDITAR PRODUCTO" : "NUEVO PRODUCTO"}</h3>
                        <div className="modal-form-body">
                            <label>Nombre</label>
                            <input type="text" value={form.nombreProducto} onChange={e => setForm({...form, nombreProducto: e.target.value})} />
                            <label>Precio (COP)</label>
                            <input type="number" value={form.precioProducto} onChange={e => setForm({...form, precioProducto: e.target.value})} />
                            <label>Stock</label>
                            <input type="number" value={form.stockProducto} onChange={e => setForm({...form, stockProducto: e.target.value})} />
                            <label>Talla</label>
                            <input type="text" value={form.talla} onChange={e => setForm({...form, talla: e.target.value})} />
                            <label>Categoría</label>
                            <select value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})}>
                                <option value="pantalon">Pantalón</option>
                                <option value="camiseta">Camiseta</option>
                                <option value="chaqueta">Chaqueta</option>
                                <option value="accesorios">Accesorios</option>
                            </select>
                                                      <label>Género</label>
                            <select value={form.genero} onChange={e => setForm({...form, genero: e.target.value})}>
                                <option value="">Seleccionar...</option>
                                <option value="hombre">Hombre</option>
                                <option value="mujer">Mujer</option>
                                <option value="niños">Niños</option>
                            </select>
                            <div className="file-select-container">
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => setForm({...form, imagen: e.target.files[0]})} 
                                id="file-upload"
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="file-upload" className="btn-upload-disenado">
                                {form.imagen?.name ? `✅ ${form.imagen.name}` : "📁 SELECCIONAR IMAGEN"}
                            </label>
                        </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-login-pro" onClick={guardarProducto}>GUARDAR</button>
                            <button className="btn-cancel-pro" onClick={() => setMostrarModal(false)}>CANCELAR</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Inventario;