import React, { useState } from "react";
import "./inventario.css";
import "./app.css"; 
import { useNavigate } from "react-router-dom";

function Inventario() {
  const [view, setView] = useState("login");
  const [productos, setProductos] = useState([
    { id: 1, nombre: "Jeans 501 Original", categoria: "pantalon", precio: 250000, talla: "32", stock: 50, genero: "Hombre", color: "Azul", imagen: "/img/calcetinesrojos.jpg" },
    { id: 2, nombre: "Chaqueta Trucker", categoria: "chaqueta", precio: 320000, talla: "M", stock: 20, genero: "Mujer", color: "Negro", imagen: "/img/relojnegro.jpg" }
  ]);
  const [auth, setAuth] = useState({ email: "", pass: "" });
  const navigate = useNavigate();

  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(false);
  const [idActual, setIdActual] = useState(null);
  const [form, setForm] = useState({
    nombre: "", precio: "", stock: "", imagen: "", talla: "", genero: "", color: "", categoria: ""
  });

  const handleLogin = () => {
    if (auth.email === "admin@levis.com" && auth.pass === "12345") {
        setView("home");
    } else {
        alert("Acceso Denegado");
    }
  };

  const abrirModal = (prod = null) => {
    if (prod) {
      setEditando(true);
      setIdActual(prod.id);
      setForm({ ...prod });
    } else {
      setEditando(false);
      setForm({ nombre: "", precio: "", stock: "", imagen: "/img/", talla: "", genero: "", color: "", categoria: "" });
    }
    setMostrarModal(true);
  };

  const guardarProducto = () => {
    if (editando) {
      setProductos(productos.map(p => p.id === idActual ? { ...form, id: idActual, precio: Number(form.precio), stock: Number(form.stock) } : p));
    } else {
      // ID CORTO: Toma el último ID y le suma 1 para que sea limpio (Ej: 3, 4, 5...)
      const nuevoId = productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1;
      const nuevoProd = { ...form, id: nuevoId, precio: Number(form.precio), stock: Number(form.stock) };
      setProductos([...productos, nuevoProd]);
    }
    setMostrarModal(false);
  };

  const eliminarProducto = (id) => {
    if (window.confirm("¿Estás seguro de eliminar este producto?")) {
      setProductos(productos.filter(p => p.id !== id));
    }
  };

  return (
    <div className="admin-wrapper">
      
      {view === "login" && (
        <div className="login-container">
          <div className="login-card">
            <div className="brand-header">
              <h1 className="brand-logo-text">LEVI'S</h1>
              <p className="brand-tagline">ADMINISTRACIÓN DE INVENTARIO</p>
            </div>
            <div className="login-form">
              <div className="input-field">
                <input type="text" placeholder="Usuario" onChange={(e) => setAuth({ ...auth, email: e.target.value })} />
              </div>
              <div className="input-field">
                <input type="password" placeholder="Contraseña" onChange={(e) => setAuth({ ...auth, pass: e.target.value })} />
              </div>
              <button className="btn-login-pro" onClick={handleLogin}>ENTRAR</button>
            </div>
          </div>
        </div>
      )}

      {view === "home" && (
        <div className="admin-dashboard">
          <nav className="admin-nav">
             <h2 className="logo-small">LEVI'S <span>Admin</span></h2>
             <button className="btn-logout" onClick={() => setView("login")}>Cerrar Sesión</button>
          </nav>
          <div className="dashboard-content">
             <h1>Bienvenido al Panel de Control</h1>
             <div className="admin-cards-grid">
                <div className="admin-option-card" onClick={() => setView("listar")}>
                   <h3>Gestionar Productos</h3>
                   <p>Ver, editar y eliminar stock</p>
                </div>
                <div className="admin-option-card" onClick={() => navigate("/")}>
                   <h3>Ir a la Tienda</h3>
                   <p>Ver como cliente</p>
                </div>
             </div>
          </div>
        </div>
      )}

      {view === "listar" && (
        <div className="inventory-panel">
          <div className="panel-header-pro">
            <button className="btn-back-pro" onClick={() => setView("home")}>← VOLVER</button>
            <div className="header-title-group">
              <h2>INVENTARIO ACTUAL</h2>
            </div>
            <button className="btn-add-pro" onClick={() => abrirModal()}>+ AÑADIR PRODUCTO</button>
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
                  <th>GÉNERO</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((prod) => (
                  <tr key={prod.id}>
                    <td>#{prod.id}</td>
                    <td className="bold">{prod.nombre}</td>
                    <td><span className="cat-tag">{prod.categoria}</span></td>
                    <td>${prod.precio.toLocaleString()} COP</td>
                    <td><span className="talla-badge">{prod.talla}</span></td>
                    <td>
                      <span className={`stock-status ${prod.stock < 10 ? 'low' : ''}`}>
                        {prod.stock} und
                      </span>
                    </td>
                    <td>{prod.genero}</td>
                    <td>
                      <button className="btn-action edit" onClick={() => abrirModal(prod)}>Editar</button>
                      <button className="btn-action delete" onClick={() => eliminarProducto(prod.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL CORREGIDO: Ahora usa contenedores para no verse amontonado */}
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
                <h3>{editando ? "EDITAR PRODUCTO" : "NUEVO PRODUCTO"}</h3>
            </div>
            <div className="modal-form-body">
              <div className="input-field">
                <label>Nombre</label>
                <input type="text" placeholder="Ej: Jeans 501" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
              </div>
              <div className="form-row-pro">
                  <div className="input-field">
                    <label>Precio</label>
                    <input type="number" value={form.precio} onChange={e => setForm({...form, precio: e.target.value})} />
                  </div>
                  <div className="input-field">
                    <label>Stock</label>
                    <input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} />
                  </div>
              </div>
              <div className="input-field">
                <label>Ruta de Imagen</label>
                <input type="text" placeholder="/img/nombre.jpg" value={form.imagen} onChange={e => setForm({...form, imagen: e.target.value})} />
              </div>
              <div className="form-row-pro">
                  <div className="input-field">
                    <label>Talla</label>
                    <input type="text" value={form.talla} onChange={e => setForm({...form, talla: e.target.value})} />
                  </div>
                  <div className="input-field">
                    <label>Color</label>
                    <input type="text" value={form.color} onChange={e => setForm({...form, color: e.target.value})} />
                  </div>
              </div>
              <div className="form-row-pro">
                  <div className="input-field">
                    <label>Género</label>
                    <select value={form.genero} onChange={e => setForm({...form, genero: e.target.value})}>
                        <option value="">Seleccionar</option>
                        <option value="Hombre">Hombre</option>
                        <option value="Mujer">Mujer</option>
                        <option value="Unisex">Unisex</option>
                    </select>
                  </div>
                  <div className="input-field">
                    <label>Categoría</label>
                    <select value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})}>
                        <option value="">Seleccionar</option>
                        <option value="pantalon">Pantalón</option>
                        <option value="camiseta">Camiseta</option>
                        <option value="chaqueta">Chaqueta</option>
                    </select>
                  </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-login-pro" onClick={guardarProducto}>{editando ? "ACTUALIZAR" : "GUARDAR"}</button>
              <button className="btn-cancel-pro" onClick={() => setMostrarModal(false)}>CANCELAR</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventario;