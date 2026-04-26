import React, { useEffect, useState } from "react";
// CORRECCIÓN: Importamos api (default) y BASE_URL (nombrada)
import api, { BASE_URL } from "./api"; 
import "./catalogo.css";
import { FaShoppingCart, FaTrash, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [generosSeleccionados, setGenerosSeleccionados] = useState([]);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);
  const [tallasSeleccionadas, setTallasSeleccionadas] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const navigate = useNavigate();

  // --- CARGA DE DATOS USANDO AXIOS (API) ---
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

  // --- LÓGICA DEL CARRITO ---
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

  const finalizarCompra = async () => {
    if (carrito.length === 0) return alert("El carrito está vacío");
    try {
      const response = await api.post("/productos/finalizar-compra", { 
        productos: carrito 
      });

      if (response.status === 200) {
        alert("¡Compra finalizada con éxito en Levi's! ✨");
        setCarrito([]);
        setMostrarCarrito(false);
        fetchProductos();
      }
    } catch (error) {
      console.error(error);
      alert("Error al procesar la compra");
    }
  };

  // --- LÓGICA DE FILTROS ---
  const normalizarTexto = (texto) =>
    texto?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || "";

  let productosFiltrados = productos.filter((p) =>
    normalizarTexto(p.nombreProducto).includes(normalizarTexto(busqueda))
  );

 if (generosSeleccionados.length > 0) {
  productosFiltrados = productosFiltrados.filter((p) =>
    // Comparamos el género del producto con los que el usuario seleccionó
    generosSeleccionados.some(
      (g) => g.toLowerCase() === p.genero?.toLowerCase()
    )
  );
}

  if (categoriasSeleccionadas.length > 0) {
    productosFiltrados = productosFiltrados.filter((p) =>
      categoriasSeleccionadas.some(
        (c) => normalizarTexto(c) === normalizarTexto(p.categoria)
      )
    );
  }

  const tallasDisponibles = Array.from(
    new Set(productos.map((p) => p.talla?.trim()).filter(Boolean))
  ).sort();

  if (tallasSeleccionadas.length > 0) {
    productosFiltrados = productosFiltrados.filter((p) =>
      tallasSeleccionadas.some(
        (t) => normalizarTexto(t) === normalizarTexto(p.talla)
      )
    );
  }

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

        <div className="cart-trigger" onClick={() => setMostrarCarrito(!mostrarCarrito)}>
          <FaShoppingCart size={22} />
          {carrito.length > 0 && (
            <span className="cart-badge">
              {carrito.reduce((acc, p) => acc + p.cantidad, 0)}
            </span>
          )}
        </div>
      </div>

      <div className="catalogo-layout">
  <aside className="catalogo-sidebar">
    <h3 className="sidebar-title">Género</h3>
<div className="filter-group">
  <label>
    <input
      type="checkbox"
      onChange={(e) =>
        e.target.checked
          ? setGenerosSeleccionados([...generosSeleccionados, "hombre"])
          : setGenerosSeleccionados(generosSeleccionados.filter((g) => g !== "hombre"))
      }
    />Hombre
  </label>
  
  <label>
    <input
      type="checkbox"
      onChange={(e) =>
        e.target.checked
          ? setGenerosSeleccionados([...generosSeleccionados, "mujer"])
          : setGenerosSeleccionados(generosSeleccionados.filter((g) => g !== "mujer"))
      }
    /> Mujer
  </label>

  <label>
    <input
      type="checkbox"
      onChange={(e) =>
        e.target.checked
          ? setGenerosSeleccionados([...generosSeleccionados, "niños"])
          : setGenerosSeleccionados(generosSeleccionados.filter((g) => g !== "niños"))
      }
    /> Niños
  </label>
</div>

          <h3 className="sidebar-title">Tallas</h3>
          <div className="tallas-flex">
            {tallasDisponibles.map((talla) => (
              <label key={talla} className="talla-chip">
                <input
                  type="checkbox"
                  onChange={(e) =>
                    e.target.checked
                      ? setTallasSeleccionadas([...tallasSeleccionadas, talla])
                      : setTallasSeleccionadas(tallasSeleccionadas.filter((t) => t !== talla))
                  }
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
                    {/* CORRECCIÓN: Concatenamos BASE_URL con la ruta de la imagen */}
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

      {/* --- CARRITO FLOTANTE (Drawer) --- */}
      {mostrarCarrito && (
        <div className="cart-drawer open">
          <div className="cart-drawer-header">
            <h3>TU CARRITO ({carrito.length})</h3>
            <button className="btn-close-cart" onClick={() => setMostrarCarrito(false)}>✕</button>
          </div>
          <div className="cart-drawer-body">
            {carrito.length === 0 ? (
              <p>El carrito está vacío</p>
            ) : (
              carrito.map(item => (
                <div key={item.id_producto} className="cart-item-pro">
                  <div className="cart-item-info">
                    <p>{item.nombreProducto} (x{item.cantidad})</p>
                    <span>${(item.precioProducto * item.cantidad).toLocaleString()}</span>
                  </div>
                  <FaTrash onClick={() => setCarrito(carrito.filter(i => i.id_producto !== item.id_producto))} />
                </div>
              ))
            )}
          </div>
          {carrito.length > 0 && (
            <div className="cart-drawer-footer">
              <button className="btn-checkout-pro" onClick={finalizarCompra}>PAGAR</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Catalogo;