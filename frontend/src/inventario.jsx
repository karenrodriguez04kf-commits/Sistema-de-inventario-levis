import React, { useState, useEffect } from "react";
import "./inventario.css";
import "./app.css"; 
import { useNavigate } from "react-router-dom";

function Inventario() {
  const [view, setView] = useState("login");
  const [productos, setProductos] = useState([]);
  const [auth, setAuth] = useState({ email: "", pass: "" });
  const navigate = useNavigate();

  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(false);
  const [idActual, setIdActual] = useState(null);
  const [form, setForm] = useState({
    nombreProducto: "", 
    precioProducto: "", 
    stock: "", 
    imagen: "", 
    talla: "", 
    genero: "", 
    color: "", 
    categoria: ""
  });

  // --- CARGAR PRODUCTOS DESDE EL PUERTO 3002 ---
  const cargarProductos = () => {
    fetch("http://localhost:3002/api/catalogo")
      .then(res => res.json())
      .then(data => setProductos(data))
      .catch(err => console.error("Error cargando inventario:", err));
  };

  useEffect(() => {
    cargarProductos();
  }, []);

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
      setIdActual(prod.id_producto);
      setForm({ ...prod });
    } else {
      setEditando(false);
      setForm({ 
        nombreProducto: "", 
        precioProducto: "", 
        stock: "", 
        imagen: "/img/", 
        talla: "", 
        genero: "", 
        color: "", 
        categoria: "" 
      });
    }
    setMostrarModal(true);
  };

  // --- GUARDAR O ACTUALIZAR EN EL PUERTO 3002 ---
  const guardarProducto = async () => {
    const url = editando 
      ? `http://localhost:3002/api/productos/${idActual}` 
      : "http://localhost:3002/api/productos";
    
    const metodo = editando ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (response.ok) {
        alert(editando ? "Producto actualizado correctamente" : "Producto guardado con éxito");
        setMostrarModal(false);
        cargarProductos();
      }
    } catch (error) {
      alert("Error de conexión con el servidor 3002");
    }
  };

  // --- ELIMINAR DEL PUERTO 3002 ---
  const eliminarProducto = (id) => {
    if (window.confirm("¿Estás seguro de eliminar este producto?")) {
      fetch(`http://localhost:3002/api/productos/${id}`, { method: 'DELETE' })
        .then(res => {
          if(res.ok) {
            alert("Producto eliminado de la base de datos");
            cargarProductos();
          }
        })
        .catch(err => console.error("Error al eliminar:", err));
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
            <h2>INVENTARIO ACTUAL</h2>
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
                      <span className={`stock-status ${prod.stock < 10 ? 'low' : ''}`}>
                        {prod.stock} und
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
              <input type="text" placeholder="Nombre" value={form.nombreProducto} onChange={e => setForm({...form, nombreProducto: e.target.value})} />
              <input type="number" placeholder="Precio" value={form.precioProducto} onChange={e => setForm({...form, precioProducto: e.target.value})} />
              <input type="number" placeholder="Stock" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} />
              <input type="text" placeholder="Talla" value={form.talla} onChange={e => setForm({...form, talla: e.target.value})} />
              <select value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})}>
                <option value="pantalon">Pantalón</option>
                <option value="camiseta">Camiseta</option>
                <option value="chaqueta">Chaqueta</option>
              </select>
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