import React, { useState } from "react";
import "./inventario.css";
import { useNavigate } from "react-router-dom";

function App() {
  const [view, setView] = useState("login");
  const [productos, setProductos] = useState([]);
  const [auth, setAuth] = useState({ email: "", pass: "" });
  const navigate = useNavigate();
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(false);
  const [productoEditandoId, setProductoEditandoId] = useState(null);
  const [idTallaEditando, setIdTallaEditando] = useState(null);

  const [form, setForm] = useState({
    nombreProducto: "",
    precioProducto: "",
    stockProducto: "", 
    categoria: "",
    talla: "",
    genero: "",
    imagen: "",
  });

  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [ordenPrecio, setOrdenPrecio] = useState("");
  const [filtroGenero, setFiltroGenero] = useState("");

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: auth.email, password: auth.pass }),
      });
      const data = await response.json();
      if (data.auth) {
        localStorage.setItem("token", data.token);
        setView("home");
      } else {
        alert(data.message || "Credenciales incorrectas");
      }
    } catch (error) {
      alert("No se pudo conectar con el servidor");
    }
  };

  const fetchProductos = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/productos", {
        headers: getAuthHeader(),
      });
      if (response.status === 403 || response.status === 401) {
        setView("login");
        return;
      }
      const data = await response.json();
      setProductos(Array.isArray(data) ? data : []);
      setView("listar");
    } catch (error) {
      console.error(error);
    }
  };

  const guardarProducto = async () => {
    const url = editando
      ? `http://localhost:3001/api/productos/${productoEditandoId}`
      : "http://localhost:3001/api/productos";

    const method = editando ? "PUT" : "POST";

    const payload = {
      nombreProducto: form.nombreProducto,
      precioProducto: parseFloat(form.precioProducto),
      stockProducto: parseInt(form.stockProducto), 
      categoria: form.categoria,
      talla: form.talla,
      genero: form.genero,
      imagen: form.imagen,
      id_talla: idTallaEditando 
    };

    try {
      const response = await fetch(url, {
        method,
        headers: getAuthHeader(),
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setMostrarModal(false);
        setEditando(false);
        setProductoEditandoId(null);
        setIdTallaEditando(null);
        setForm({
          nombreProducto: "", precioProducto: "", stockProducto: "",
          categoria: "", talla: "", genero: "", imagen: "",
        });
        fetchProductos();
        alert("¡Guardado correctamente!");
      } else {
        const errorData = await response.json();
        alert("Error: " + (errorData.error || "No se pudo guardar"));
      }
    } catch (error) {
      alert("Error de conexión");
    }
  };

  const editarProducto = (p) => {
    setForm({
      nombreProducto: p.nombreProducto,
      precioProducto: p.precioProducto,
      stockProducto: p.stockProducto, 
      categoria: p.categoria || "",
      talla: p.talla || "",
      genero: p.genero || "",
      imagen: p.imagen || "",
    });
    setProductoEditandoId(p.id_producto);
    setIdTallaEditando(p.id_talla);
    setEditando(true);
    setMostrarModal(true);
  };

  const eliminarProducto = async (id) => {
    if (!window.confirm("¿Eliminar este producto?")) return;
    try {
      const response = await fetch(`http://localhost:3001/api/productos/${id}`, {
        method: "DELETE",
        headers: getAuthHeader(),
      });
      if(response.ok) fetchProductos();
    } catch (error) {
      console.error(error);
    }
  };

  let productosFiltrados = [...productos];
  if (filtroCategoria) {
    productosFiltrados = productosFiltrados.filter(
      (p) => p.categoria?.toLowerCase() === filtroCategoria.toLowerCase()
    );
  }
  if (ordenPrecio === "asc") productosFiltrados.sort((a, b) => a.precioProducto - b.precioProducto);
  if (ordenPrecio === "desc") productosFiltrados.sort((a, b) => b.precioProducto - a.precioProducto);
  if (filtroGenero) productosFiltrados = productosFiltrados.filter((p) => p.genero === filtroGenero);

  return (
    <div className="App">
      {view === "login" && (
        <div className="container">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Levi%27s_logo.svg/2560px-Levi%27s_logo.svg.png" alt="Levis" style={{ width: "100px", marginBottom: "20px" }} />
          <h2>Login de Inventario</h2>
          <input type="text" placeholder="Email" onChange={(e) => setAuth({ ...auth, email: e.target.value })} />
          <input type="password" placeholder="Password" onChange={(e) => setAuth({ ...auth, pass: e.target.value })} />
          <button className="levis-button" onClick={handleLogin}>Ingresar</button>
        </div>
      )}

      {view === "home" && (
        <div className="container" style={{ textAlign: "center" }}>
          <h1>Sistema de inventario de productos de Levis</h1>
          <button className="levis-button" onClick={fetchProductos}>Gestionar Productos</button>
          <button className="levis-button" style={{ marginTop: "10px" }} onClick={() => navigate("/")}>Ver tienda</button>
          <button className="btn-back" style={{ marginTop: "20px", width: "100%" }} onClick={() => { localStorage.removeItem("token"); setView("login"); }}>Cerrar Sesión</button>
        </div>
      )}

      {view === "listar" && (
        <div className="container">
          <button className="btn-back" onClick={() => setView("home")}>← Volver</button>
          <h2>Inventario Actual (Desglosado por Tallas)</h2>
          <button className="levis-button" style={{ marginBottom: "20px" }} onClick={() => { 
            setForm({ nombreProducto: "", precioProducto: "", stockProducto: "", categoria: "", talla: "", genero: "", imagen: "" });
            setEditando(false); setMostrarModal(true); 
          }}>+ Añadir Producto / Talla</button>

          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <select onChange={(e) => setFiltroCategoria(e.target.value)}>
              <option value="">Todas las Categorías</option>
              <option value="Camiseta">Camiseta</option>
              <option value="Pantalon">Pantalón</option>
              <option value="Chaqueta">Chaqueta</option>
              <option value="Accesorio">Accesorio</option>
              <option value="Calzado">Calzado</option>
            </select>
            <select onChange={(e) => setOrdenPrecio(e.target.value)}>
              <option value="">Ordenar precio</option>
              <option value="asc">Menor a mayor</option>
              <option value="desc">Mayor a menor</option>
            </select>
            <select onChange={e => setFiltroGenero(e.target.value)}>
              <option value="">Género</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Niño">Niño</option>
            </select>
          </div>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Talla</th>
                <th>Stock</th>
                <th>Género</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map((p, index) => (
                <tr key={p.id_talla || index}>
                  <td>{p.id_producto}</td>
                  <td><strong>{p.nombreProducto}</strong></td>
                  <td>{p.categoria}</td>
                  <td>${p.precioProducto}</td>
                  <td><span className="badge-talla">{p.talla || "U"}</span></td>
                  <td>
                    <span className={`badge-insumo ${p.stockProducto <= 5 ? 'bajo-stock' : ''}`}>
                      {p.stockProducto} und
                    </span>
                  </td>
                  <td>{p.genero}</td>
                  <td>
                    <button className="btn-edit" onClick={() => editarProducto(p)}>Editar</button>
                    <button className="btn-delete" onClick={() => eliminarProducto(p.id_producto)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {mostrarModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3>{editando ? "Editar Existencia" : "Nuevo Producto / Talla"}</h3>
            <input placeholder="Nombre" value={form.nombreProducto} onChange={(e) => setForm({ ...form, nombreProducto: e.target.value })} />
            <input placeholder="Precio" type="number" value={form.precioProducto} onChange={(e) => setForm({ ...form, precioProducto: e.target.value })} />
            <input placeholder="Cantidad Stock" type="number" value={form.stockProducto} onChange={(e) => setForm({ ...form, stockProducto: e.target.value })} />
            <input placeholder="URL Imagen" value={form.imagen} onChange={e => setForm({...form, imagen: e.target.value})} />
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <select style={{ flex: 1 }} value={form.talla} onChange={(e) => setForm({ ...form, talla: e.target.value })}>
                <option value="">Talla</option>
                {form.categoria === "Calzado" ? ["36","37","38","39","40","41","42","43"].map(t => <option key={t} value={t}>{t}</option>) : ["XS","S","M","L","XL","30","32","34","36"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select style={{ flex: 1 }} value={form.genero} onChange={e => setForm({...form, genero: e.target.value})}>
                <option value="">Género</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Niño">Niño</option>
              </select>
            </div>

            <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
              <option value="">Categoría</option>
              <option value="Camiseta">Camiseta</option>
              <option value="Pantalon">Pantalón</option>
              <option value="Chaqueta">Chaqueta</option>
              <option value="Accesorio">Accesorio</option>
              <option value="Calzado">Calzado</option>
            </select>

            <button className="levis-button" onClick={guardarProducto}>{editando ? "Guardar Cambios" : "Crear Producto"}</button>
            <button className="btn-back" onClick={() => setMostrarModal(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  overlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  modal: { background: "#fff", padding: "30px", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "15px", minWidth: "400px", boxShadow: "0 5px 15px rgba(0,0,0,0.3)" }
};

export default App;