import React, { useState } from "react";
import "./inventario.css";
import { useNavigate } from "react-router-dom";
function App() {
  const [view, setView] = useState("login");
  const [productos, setProductos] = useState([]);
  const [auth, setAuth] = useState({ username: "", pass: "" });
 const navigate = useNavigate();
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(false);
  const [productoEditandoId, setProductoEditandoId] = useState(null);

  const [form, setForm] = useState({
    nombreProducto: "",
    precioProducto: "",
    stockProducto: "",
    categoria: "",
    talla: "",
    color: "",
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
        body: JSON.stringify({ username: auth.username, password: auth.pass }),
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

    await fetch(url, {
      method,
      headers: getAuthHeader(),
      body: JSON.stringify({
        nombreProducto: form.nombreProducto,
        descripcionProducto: "Levis Original",
        precioProducto: form.precioProducto,
        stockProducto: form.stockProducto,
        estadoProducto: "Activo",
        categoria: form.categoria,
        talla: form.talla,
        color: form.color,
        genero: form.genero,
        imagen: form.imagen,
      }),
    });

    setMostrarModal(false);
    setEditando(false);
    setProductoEditandoId(null);

    setForm({
      nombreProducto: "",
      precioProducto: "",
      stockProducto: "",
      categoria: "",
      talla: "",
      color: "",
      genero: "",
    });

    fetchProductos();
  };

  const editarProducto = (p) => {
    setForm({
      nombreProducto: p.nombreProducto,
      precioProducto: p.precioProducto,
      stockProducto: p.stockProducto,
      categoria: p.categoria || "",
      talla: p.talla || "",
      color: p.color || "",
      genero: p.genero || "",
      imagen: p.imagen || "",
    });

    setProductoEditandoId(p.id_producto);
    setEditando(true);
    setMostrarModal(true);
  };

  const eliminarProducto = async (id) => {
    if (!window.confirm("¿Eliminar?")) return;

    await fetch(`http://localhost:3001/api/productos/${id}`, {
      method: "DELETE",
      headers: getAuthHeader(),
    });

    fetchProductos();
  };

  // 🔥 FILTRO Y ORDEN
  let productosFiltrados = [...productos];

  if (filtroCategoria) {
    productosFiltrados = productosFiltrados.filter(
      (p) => p.categoria === filtroCategoria,
    );
  }

  if (ordenPrecio === "asc") {
    productosFiltrados.sort((a, b) => a.precioProducto - b.precioProducto);
  }

  if (ordenPrecio === "desc") {
    productosFiltrados.sort((a, b) => b.precioProducto - a.precioProducto);
  }
  if (filtroGenero) {
    productosFiltrados = productosFiltrados.filter(
      (p) => p.genero === filtroGenero,
    );
  }

  return (
    <div className="App">
      {/* LOGIN */}
      {view === "login" && (
        <div className="container">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Levi%27s_logo.svg/2560px-Levi%27s_logo.svg.png"
            alt="Levis"
            style={{ width: "100px", marginBottom: "20px" }}
          />
          <h2>login de inventario</h2>
          <input
            type="text"
            placeholder="Username"
            onChange={(e) => setAuth({ ...auth, username: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setAuth({ ...auth, pass: e.target.value })}
          />
          <button className="levis-button" onClick={handleLogin}>
            Ingresar
          </button>
        </div>
      )}

      {/* HOME */}
{view === "home" && (
  <div className="container" style={{ textAlign: "center" }}>
    <h1>Sistema de inventario de productos de Levis</h1>

    <button className="levis-button" onClick={fetchProductos}>
      Gestionar Productos
    </button>
    <button 
      className="levis-button"
      style={{ marginTop: "10px" }}
      onClick={() => navigate("/")}
    >
      Ver tienda
    </button>

    <button
      className="btn-back"
      style={{ marginTop: "20px", width: "100%" }}
      onClick={() => setView("login")}
    >
      Cerrar Sesión
    </button>
  </div>
)}

      {/* LISTADO */}
      {view === "listar" && (
        <div className="container">
          <button className="btn-back" onClick={() => setView("home")}>
            ← Volver
          </button>
          <h2>Inventario Actual</h2>

          <button
            className="levis-button"
            style={{ marginBottom: "20px" }}
            onClick={() => {
              setForm({
                nombreProducto: "",
                precioProducto: "",
                stockProducto: "",
                categoria: "",
                talla: "",
                color: "",
                genero: "",
              });
              setEditando(false);
              setMostrarModal(true);
            }}
          >
            + Añadir Producto
          </button>

          {/* FILTROS */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            <select onChange={(e) => setFiltroCategoria(e.target.value)}>
              <option value="">Todas</option>
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
                <th>Precio</th>
                <th>Stock</th>
                <th>Categoría</th>
                <th>Talla</th>
                <th>Color</th>
                <th>Género</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map((p) => (
                <tr key={p.id_producto}>
                  <td>{p.id_producto}</td>
                  <td>
                    <strong>{p.nombreProducto}</strong>
                  </td>
                  <td>${p.precioProducto}</td>
                  <td>
                    <span className="badge-insumo">{p.stockProducto} und</span>
                  </td>
                  <td>{p.categoria}</td>
                  <td>{p.talla || "-"}</td>
                  <td>{p.color || "-"}</td>
                  <td>{p.genero || "-"}</td>
                  <td>
                    <button
                      className="btn-edit"
                      onClick={() => editarProducto(p)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => eliminarProducto(p.id_producto)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL */}
      {mostrarModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3>{editando ? "Editar Producto" : "Nuevo Producto"}</h3>

            <input
              placeholder="Nombre"
              value={form.nombreProducto}
              onChange={(e) =>
                setForm({ ...form, nombreProducto: e.target.value })
              }
            />

            <input
              placeholder="Precio"
              value={form.precioProducto}
              onChange={(e) =>
                setForm({ ...form, precioProducto: e.target.value })
              }
            />

            <input
              placeholder="Stock"
              value={form.stockProducto}
              onChange={(e) =>
                setForm({ ...form, stockProducto: e.target.value })
              }
            />
                      <input
            placeholder="Ruta imagen (ej: /img/camiseta1.jpg)"
            value={form.imagen}
            onChange={e => setForm({...form, imagen: e.target.value})}
          />

            <select
              value={form.talla}
              onChange={(e) => setForm({ ...form, talla: e.target.value })}
            >
              <option value="">Talla</option>

              {form.categoria === "Calzado" ? (
                <>
                  <option value="36">36</option>
                  <option value="37">37</option>
                  <option value="38">38</option>
                  <option value="39">39</option>
                  <option value="40">40</option>
                  <option value="41">41</option>
                  <option value="42">42</option>
                  <option value="43">43</option>
                </>
              ) : (
                <>
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                </>
              )}
            </select>
            <select
              value={form.genero}
              onChange={e => setForm({...form, genero: e.target.value})}
            >
              <option value="">Género</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Niño">Niño</option>
            </select>

            <input
              placeholder="Color"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
            />

            <select
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            >
              <option value="">Categoría</option>
              <option value="Camiseta">Camiseta</option>
              <option value="Pantalon">Pantalón</option>
              <option value="Chaqueta">Chaqueta</option>
              <option value="Accesorio">Accesorio</option>
              <option value="Calzado">Calzado</option>
            </select>

            <button onClick={guardarProducto}>
              {editando ? "Actualizar" : "Guardar"}
            </button>

            <button onClick={() => setMostrarModal(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    minWidth: "300px",
  },
};

export default App;
