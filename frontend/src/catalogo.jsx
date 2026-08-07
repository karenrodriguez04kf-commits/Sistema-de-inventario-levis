import React, { useEffect, useState } from "react";
import api, { BASE_URL } from "./api"; 
import "./catalogo.css";
import { FaShoppingCart, FaTrash, FaSearch, FaPlus, FaMinus, FaReceipt, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [categoriasDB, setCategoriasDB] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [generosSeleccionados, setGenerosSeleccionados] = useState([]);
  const [tallasSeleccionadas, setTallasSeleccionadas] = useState([]);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);
  const [coloresSeleccionados, setColoresSeleccionados] = useState([]);
  const [carrito, setCarrito]  = useState([]);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  
  // Estados para controlar los menús desplegables de los filtros
  const [desplegadoCat, setDesplegadoCat] = useState(true);
  const [desplegadoGen, setDesplegadoGen] = useState(true);
  const [desplegadoCol, setDesplegadoCol] = useState(true);
  const [desplegadoTal, setDesplegadoTal] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchProductos();
    fetchCategorias();
  }, []);

  const fetchProductos = async () => {
    try {
      const response = await api.get("/productos/catalogo");
      setProductos(response.data);
    } catch (err) {
      console.error("Error al traer productos:", err);
    }
  };

  const fetchCategorias = async () => {
    try {
      const response = await api.get("/categorias"); // Asumiendo este endpoint, o usa el que tengas en tu backend
      setCategoriasDB(response.data);
    } catch (err) {
      console.error("Error al traer categorías de BD:", err);
    }
  };

  const agregarAlCarrito = (p) => {
    setCarrito((prev) => {
      const existe = prev.find((item) => item.id_producto === p.id_producto);
      if (existe) {
        return prev.map((item) =>
          item.id_producto === p.id_producto
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prev, { ...p, cantidad: 1 }];
    });
  };

  const modificarCantidad = (id, accion) => {
    setCarrito((prev) =>
      prev.map((item) => {
        if (item.id_producto === id) {
          const nuevaCant = accion === "mas" ? item.cantidad + 1 : item.cantidad - 1;
          return { ...item, cantidad: Math.max(1, nuevaCant) };
        }
        return item;
      })
    );
  };

  const calcularTotal = () => {
    return carrito.reduce((acc, p) => acc + (p.precioProducto * p.cantidad), 0);
  };

  const finalizarCompra = async () => {
    if (carrito.length === 0) return alert("El carrito está vacío");

    const idUsuarioLogueado = localStorage.getItem("id_usuario") || localStorage.getItem("usuario_id");

    if (!idUsuarioLogueado) {
      alert("Debes iniciar sesión para realizar la compra");
      navigate("/login");
      return;
    }

    try {
      const datosParaEnviar = { 
        id_usuario: !isNaN(idUsuarioLogueado) ? Number(idUsuarioLogueado) : idUsuarioLogueado,
        total: calcularTotal(),
        productos: carrito.map(item => ({
          id_producto: item.id_producto,
          cantidad: item.cantidad,
          precioProducto: item.precioProducto,
          talla: item.talla || "Única"
        }))
      };

      const response = await api.post("/productos/finalizar-compra", datosParaEnviar);

      if (response.status === 200 || response.status === 201) {
        alert("¡Compra finalizada con éxito! ✨");
        setCarrito([]);
        setMostrarCarrito(false);
        fetchProductos(); 
        navigate("/home/mis-pedidos");
      }
    } catch (error) {
      console.error("Error en el pago:", error);
      alert(error.response?.data?.Message || error.response?.data?.error || "Error al procesar la compra");
    }
  };

  const normalizarTexto = (texto) =>
    texto?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() || "";

  const obtenerTallasProducto = (p) => {
    if (!p.tallas) return [p.talla || "Única"];
    try {
      const parsed = typeof p.tallas === 'string' ? JSON.parse(p.tallas) : p.tallas;
      if (Array.isArray(parsed)) {
        return parsed.filter(t => t.stock > 0).map(t => t.talla);
      }
    } catch (e) {
      return [p.talla || "Única"];
    }
    return [p.talla || "Única"];
  };

  // Filtrado general
  let productosFiltrados = productos.filter((p) =>
    normalizarTexto(p.nombreProducto).includes(normalizarTexto(busqueda))
  );

  if (generosSeleccionados.length > 0) {
    productosFiltrados = productosFiltrados.filter((p) =>
      generosSeleccionados.some((g) => normalizarTexto(g) === normalizarTexto(p.genero))
    );
  }

  if (categoriasSeleccionadas.length > 0) {
    productosFiltrados = productosFiltrados.filter((p) =>
      categoriasSeleccionadas.some((c) => normalizarTexto(c) === normalizarTexto(p.categoria))
    );
  }

  if (tallasSeleccionadas.length > 0) {
    productosFiltrados = productosFiltrados.filter((p) => {
      const tallasProd = obtenerTallasProducto(p);
      return tallasSeleccionadas.some((t) => 
        tallasProd.some(tp => normalizarTexto(tp) === normalizarTexto(t))
      );
    });
  }

  if (coloresSeleccionados.length > 0) {
    productosFiltrados = productosFiltrados.filter((p) =>
      coloresSeleccionados.some((col) => normalizarTexto(col) === normalizarTexto(p.color))
    );
  }

  // Listas únicas capitalizadas y limpias para evitar duplicados por mayúsculas/minúsculas
  const limpiarYCapitalizar = (arr) => {
    const unicos = new Set();
    arr.forEach(item => {
      if (item) {
        let limpio = item.trim();
        limpio = limpio.charAt(0).toUpperCase() + limpio.slice(1).toLowerCase();
        unicos.add(limpio);
      }
    });
    return Array.from(unicos).sort();
  };

  // Usamos las categorías de la BD si están disponibles, si no, del catálogo
  const listaCatRaw = categoriasDB.length > 0 
    ? categoriasDB.map(c => c.nombre) 
    : productos.map(p => p.categoria);

  const categoriasDisponibles = limpiarYCapitalizar(listaCatRaw);
  const generosDisponibles = limpiarYCapitalizar(productos.map(p => p.genero));
  const coloresDisponibles = limpiarYCapitalizar(productos.map(p => p.color));

  const tallasDisponibles = Array.from(
    new Set(productos.flatMap((p) => obtenerTallasProducto(p)))
  ).filter(Boolean).sort();

  const toggleFiltro = (valor, lista, setLista) => {
    if (lista.includes(valor)) {
      setLista(lista.filter((i) => i !== valor));
    } else {
      setLista([...lista, valor]);
    }
  };

  return (
    <div className="catalogo-page">
      <div className="catalogo-tools">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="¿Qué estás buscando hoy?"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="header-actions">
          <button className="btn-orders" onClick={() => navigate("/home/mis-pedidos")}>
            <FaReceipt size={18} /> <span>Mis Pedidos</span>
          </button>
          <div className="cart-trigger" onClick={() => setMostrarCarrito(!mostrarCarrito)}>
            <FaShoppingCart size={22} />
            {carrito.length > 0 && (
              <span className="cart-badge">
                {carrito.reduce((acc, p) => acc + p.cantidad, 0)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="catalogo-layout">
        {/* SIDEBAR CON MENÚS DESPLEGABLES */}
        <aside className="catalogo-sidebar">
          <div className="sidebar-header-filter">
            <h3>Filtros de Búsqueda</h3>
          </div>

          {/* Categoría Desplegable */}
          <div className="filter-section">
            <div className="accordion-header" onClick={() => setDesplegadoCat(!desplegadoCat)}>
              <h4 className="sidebar-title">Categoría</h4>
              {desplegadoCat ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
            </div>
            {desplegadoCat && (
              <div className="filter-options-list">
                {categoriasDisponibles.map((cat) => (
                  <label key={cat} className={`custom-checkbox-label ${categoriasSeleccionadas.includes(cat) ? 'active' : ''}`}>
                    <input
                      type="checkbox"
                      checked={categoriasSeleccionadas.includes(cat)}
                      onChange={() => toggleFiltro(cat, categoriasSeleccionadas, setCategoriasSeleccionadas)}
                    />
                    <span className="checkbox-custom"></span>
                    <span className="checkbox-text">{cat}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Género Desplegable */}
          <div className="filter-section">
            <div className="accordion-header" onClick={() => setDesplegadoGen(!desplegadoGen)}>
              <h4 className="sidebar-title">Género</h4>
              {desplegadoGen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
            </div>
            {desplegadoGen && (
              <div className="filter-options-list">
                {generosDisponibles.map((g) => (
                  <label key={g} className={`custom-checkbox-label ${generosSeleccionados.includes(g) ? 'active' : ''}`}>
                    <input
                      type="checkbox"
                      checked={generosSeleccionados.includes(g)}
                      onChange={() => toggleFiltro(g, generosSeleccionados, setGenerosSeleccionados)}
                    />
                    <span className="checkbox-custom"></span>
                    <span className="checkbox-text">{g}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Color Desplegable */}
          {coloresDisponibles.length > 0 && (
            <div className="filter-section">
              <div className="accordion-header" onClick={() => setDesplegadoCol(!desplegadoCol)}>
                <h4 className="sidebar-title">Color</h4>
                {desplegadoCol ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
              </div>
              {desplegadoCol && (
                <div className="filter-options-list">
                  {coloresDisponibles.map((color) => (
                    <label key={color} className={`custom-checkbox-label ${coloresSeleccionados.includes(color) ? 'active' : ''}`}>
                      <input
                        type="checkbox"
                        checked={coloresSeleccionados.includes(color)}
                        onChange={() => toggleFiltro(color, coloresSeleccionados, setColoresSeleccionados)}
                      />
                      <span className="checkbox-custom"></span>
                      <span className="checkbox-text">{color}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tallas Desplegable */}
          <div className="filter-section">
            <div className="accordion-header" onClick={() => setDesplegadoTal(!desplegadoTal)}>
              <h4 className="sidebar-title">Tallas</h4>
              {desplegadoTal ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
            </div>
            {desplegadoTal && (
              <div className="tallas-flex">
                {tallasDisponibles.map((talla) => (
                  <button
                    type="button"
                    key={talla}
                    className={`talla-chip-btn ${tallasSeleccionadas.includes(talla) ? "active" : ""}`}
                    onClick={() => toggleFiltro(talla, tallasSeleccionadas, setTallasSeleccionadas)}
                  >
                    {talla}
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        <main className="productos-container">
          {productosFiltrados.length > 0 ? (
            <div className="productos-grid">
              {productosFiltrados.map((p) => (
                <div className="producto-card" key={p.id_producto}>
                  <div className="img-wrapper">
                    <img 
                      src={p.imagen ? `${BASE_URL}${p.imagen}` : "/img/default.jpg"} 
                      alt={p.nombreProducto} 
                      onError={(e) => { e.target.src = "/img/default.jpg"; }} 
                    />
                  </div>
                  <div className="producto-info">
                    <h4>{p.nombreProducto}</h4>
                    <p className="p-talla">Color: {p.color || "N/A"} | Gen: {p.genero || "N/A"}</p>
                    <p className="p-precio">${(p.precioProducto || 0).toLocaleString()} COP</p>
                    <button className="btn-add-cart" onClick={() => agregarAlCarrito(p)}>
                      Añadir al carrito
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results-box">
              <p className="no-results">No se encontraron productos con estos filtros.</p>
            </div>
          )}
        </main>
      </div>

      <div className={`cart-drawer ${mostrarCarrito ? "open" : ""}`}>
        <div className="cart-drawer-header">
          <h3>TU CARRITO ({carrito.length})</h3>
          <button className="btn-close-cart" onClick={() => setMostrarCarrito(false)}>✕</button>
        </div>
        <div className="cart-drawer-body">
          {carrito.length === 0 ? (
            <p className="empty-msg">El carrito está vacío</p>
          ) : (
            carrito.map(item => (
              <div key={item.id_producto} className="cart-item-pro">
                <div className="cart-item-info">
                  <p className="item-name">{item.nombreProducto}</p>
                  <div className="qty-controls">
                    <button onClick={() => modificarCantidad(item.id_producto, "menos")}><FaMinus size={10}/></button>
                    <span>{item.cantidad}</span>
                    <button onClick={() => modificarCantidad(item.id_producto, "mas")}><FaPlus size={10}/></button>
                  </div>
                  <span className="item-subtotal">
                    Subtotal: ${(item.precioProducto * item.cantidad).toLocaleString()}
                  </span>
                </div>
                <FaTrash className="btn-remove" onClick={() => setCarrito(carrito.filter(i => i.id_producto !== item.id_producto))} />
              </div>
            ))
          )}
        </div>
        {carrito.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-total-section">
              <span>TOTAL A PAGAR:</span>
              <span className="total-amount">${calcularTotal().toLocaleString()} COP</span>
            </div>
            <button className="btn-checkout-pro" onClick={finalizarCompra}>PAGAR</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Catalogo;