// frontend/src/Inventario.jsx
import React, { useState, useEffect } from "react";
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
        imagen: null,
        talla: "", 
        genero: "", 
        categoria: "pantalon" 
    });

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

    const eliminarProducto = async (id) => {
        if (window.confirm("¿Estás seguro de borrar este producto de Levi's?")) {
            try {
                const response = await api.delete(`/productos/${id}`);
                if (response.status === 200) {
                    alert("Producto eliminado con éxito");
                    cargarProductos();
                }
            } catch (error) {
                alert("Error al eliminar");
            }
        }
    };

    const abrirModal = (prod = null) => {
        if (prod) {
            setEditando(true);
            setIdActual(prod.id_producto);
            setForm({ ...prod, imagen: null });
        } else {
            setEditando(false);
            setForm({ 
                nombreProducto: "", 
                precioProducto: "", 
                stockProducto: "", 
                imagen: null, 
                talla: "", 
                genero: "", 
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

        if (form.imagen) {
            data.append("imagen", form.imagen);
        }

        const endpoint = editando ? `/productos/${idActual}` : "/productos";
        const metodo = editando ? 'put' : 'post';

        try {
            const response = await api[metodo](endpoint, data);
            if (response.status === 200 || response.status === 201) {
                alert(editando ? "¡Producto actualizado!" : "¡Producto guardado!");
                setMostrarModal(false);
                cargarProductos();
            }
        } catch (error) {
            alert("Error en la operación");
        }
    };

    const URL_IMAGENES = "http://localhost:3002"; 

    return (
        <div className="admin-main-wrapper">
            <div className="glass-panel">
                {view === "home" && (
                    <div className="dashboard-home">
                        <div className="welcome-box">
                            <span className="brand-badge-red">PANEL ADMINISTRADOR</span>
                            <h1>Bienvenid@</h1>
                            
                            <button onClick={() => { cargarProductos(); setView("listar"); }} className="btn-primary-levis">
                                GESTIONAR PRODUCTOS →
                            </button>
                        </div>
                    </div>
                )}

                {view === "listar" && (
                    <div className="inventory-list-view">
                        <header className="inventory-header">
                            <button className="btn-back" onClick={() => setView("home")}>← PANEL</button>
                            <h2>EXISTENCIAS ACTUALES</h2>
                            <button className="btn-add-item" onClick={() => abrirModal()}>+ NUEVO ITEM</button>
                        </header>

                        <div className="table-responsive">
                            <table className="levis-table">
                                <thead>
                                    <tr>
                                        <th>REF</th>
                                        <th>IMG</th>
                                        <th>PRODUCTO</th>
                                        <th>CATEGORÍA</th>
                                        <th>PRECIO</th>
                                        <th>STOCK</th>
                                        <th>ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productos.map((prod) => (
                                        <tr key={prod.id_producto}>
                                            <td>#{prod.id_producto}</td>
                                            <td>
                                                <img 
                                                    src={`${URL_IMAGENES}${prod.imagen}`} 
                                                    alt={prod.nombreProducto} 
                                                    className="product-img-mini"
                                                    onError={(e) => e.target.src="/img/placeholder.png"}
                                                />
                                            </td>
                                            <td className="product-name">{prod.nombreProducto}</td>
                                            <td><span className="tag">{prod.categoria}</span></td>
                                            <td>${Number(prod.precioProducto).toLocaleString()}</td>
                                            <td>
                                                <span className={`stock-tag ${prod.stockProducto < 10 ? 'stock-low' : 'stock-ok'}`}>
                                                    {prod.stockProducto} und
                                                </span>
                                            </td>
                                            <td>
                                                <button className="btn-icon edit" onClick={() => abrirModal(prod)}>✎</button>
                                                <button className="btn-icon delete" onClick={() => eliminarProducto(prod.id_producto)}>✕</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {mostrarModal && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <h3>{editando ? "EDITAR PRODUCTO" : "AÑADIR A COLECCIÓN"}</h3>
                        
                        <div className="modal-form-body">
                            <div className="form-group">
                                <label>Nombre de la Referencia</label>
                                <input 
                                    type="text" 
                                    value={form.nombreProducto} 
                                    onChange={e => setForm({...form, nombreProducto: e.target.value})} 
                                    placeholder="Ej: Jeans 501 Original" 
                                />
                            </div>

                            <div className="row-inputs" style={{display: 'flex', gap: '15px'}}>
                                <div className="form-group" style={{flex: 1}}>
                                    <label>Precio (COP)</label>
                                    <input 
                                        type="number" 
                                        value={form.precioProducto} 
                                        onChange={e => setForm({...form, precioProducto: e.target.value})} 
                                    />
                                </div>
                                <div className="form-group" style={{flex: 1}}>
                                    <label>Unidades en Stock</label>
                                    <input 
                                        type="number" 
                                        value={form.stockProducto} 
                                        onChange={e => setForm({...form, stockProducto: e.target.value})} 
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Talla</label>
                                <input 
                                    type="text" 
                                    value={form.talla} 
                                    onChange={e => setForm({...form, talla: e.target.value})} 
                                    placeholder="S, M, L, XL..."
                                />
                            </div>

                            <div className="form-group">
                                <label>Categoría</label>
                                <select 
                                    value={form.categoria} 
                                    onChange={e => setForm({...form, categoria: e.target.value})}
                                    className="form-select"
                                >
                                    <option value="pantalon">Pantalón</option>
                                    <option value="camiseta">Camiseta</option>
                                    <option value="chaqueta">Chaqueta</option>
                                    <option value="accesorio">Accesorio</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Género</label>
                                <select 
                                    value={form.genero} 
                                    onChange={e => setForm({...form, genero: e.target.value})}
                                    className="form-select"
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="Hombre">Hombre</option>
                                    <option value="Mujer">Mujer</option>
                                    <option value="Niños">Niños</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Imagen del Producto</label>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={(e) => setForm({...form, imagen: e.target.files[0]})}
                                    id="file-upload"
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="file-upload" className="btn-upload-styled">
                                    {form.imagen ? `✅ ${form.imagen.name}` : "📁 SELECCIONAR ARCHIVO"}
                                </label>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-save" onClick={guardarProducto}>GUARDAR</button>
                            <button className="btn-cancel" onClick={() => setMostrarModal(false)}>CANCELAR</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Inventario;