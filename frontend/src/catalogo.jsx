import React, { useEffect, useState } from "react";
import api, { BASE_URL } from "./api"; 
import "./catalogo.css";
import { FaShoppingCart, FaTrash, FaSearch, FaPlus, FaMinus, FaReceipt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [generosSeleccionados, setGenerosSeleccionados] = useState([]);
  const [tallasSeleccionadas, setTallasSeleccionadas] = useState([]);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);
  const [carrito, setCarrito]   = useState([]);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const response = await api.get("/productos/catalogo");
      setProductos(response.data);
    } catch (err) {
      console.error("Error al traer productos:", err);
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

    const idUsuarioLogueado = localStorage.getItem("id_usuario");

    if (!idUsuarioLogueado) {
      alert("Debes iniciar sesión para realizar la compra");
      navigate("/login");
      return;
    }

    try {
      const datosParaEnviar = { 
        id_usuario: idUsuarioLogueado,
        total: calcularTotal(),
        productos: carrito 
      };

      const response = await api.post("/productos/finalizar-compra", datosParaEnviar);

      if (response.status === 200) {
        alert("¡Compra finalizada con éxito! ✨");
        setCarrito([]);
        setMostrarCarrito(false);
        fetchProductos(); 
        navigate("/home/mis-pedidos");
      }
    } catch (error) {
      console.error("Error en el pago:", error);
      alert(error.response?.data?.Message || "Error al procesar la compra");
    }
  };

  const normalizarTexto = (texto) =>
    texto?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || "";

  // ✅ Filtros aplicados en orden
  let productosFiltrados = productos.filter((p) =>
    normalizarTexto(p.nombreProducto).includes(normalizarTexto(busqueda))
  );

  if (generosSeleccionados.length > 0) {
    productosFiltrados = productosFiltrados.filter((p) =>
      generosSeleccionados.some((g) => g.toLowerCase() === p.genero?.toLowerCase())
    );
  }

  if (tallasSeleccionadas.length > 0) {
    productosFiltrados = productosFiltrados.filter((p) =>
      tallasSeleccionadas.some((t) => normalizarTexto(t) === normalizarTexto(p.talla))
    );
  }

  // ✅ Filtro de categoría
  if (categoriasSeleccionadas.length > 0) {
    productosFiltrados = productosFiltrados.filter((p) =>
      categoriasSeleccionadas.some((c) => normalizarTexto(c) === normalizarTexto(p.categoria))
    );
  }

  const tallasDisponibles = Array.from(
    new Set(productos.map((p) => p.talla?.trim()).filter(Boolean))
  ).sort();

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
            <FaReceipt size={20} /> <span>Mis Pedidos</span>
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
        <aside className="catalogo-sidebar">

          {/* ✅ Filtro de categoría */}
          <h3 className="sidebar-title">Categoría</h3>
          <div className="filter-group">
            {["pantalon", "camiseta", "chaqueta", "accesorio"].map((cat) => (
              <label key={cat}>
                <input
                  type="checkbox"
                  checked={categoriasSeleccionadas.includes(cat)}
                  onChange={() => toggleFiltro(cat, categoriasSeleccionadas, setCategoriasSeleccionadas)}
                />
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </label>
            ))}
          </div>

          <h3 className="sidebar-title">Género</h3>
          <div className="filter-group">
            {["Hombre", "Mujer", "Niños"].map((g) => (
              <label key={g}>
                <input
                  type="checkbox"
                  checked={generosSeleccionados.includes(g)}
                  onChange={() => toggleFiltro(g, generosSeleccionados, setGenerosSeleccionados)}
                /> {g}
              </label>
            ))}
          </div>

          <h3 className="sidebar-title">Tallas</h3>
          <div className="tallas-flex">
            {tallasDisponibles.map((talla) => (
              <label key={talla} className="talla-chip">
                <input
                  type="checkbox"
                  checked={tallasSeleccionadas.includes(talla)}
                  onChange={() => toggleFiltro(talla, tallasSeleccionadas, setTallasSeleccionadas)}
                />
                <span>{talla}</span>
              </label>
            ))}
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
                    <p className="p-talla">Talla: {p.talla}</p>
                    <p className="p-precio">${(p.precioProducto || 0).toLocaleString()} COP</p>
                    <button className="btn-add-cart" onClick={() => agregarAlCarrito(p)}>
                      Añadir al carrito
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-results">No se encontraron productos.</p>
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