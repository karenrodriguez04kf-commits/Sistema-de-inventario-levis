import React, { useEffect, useState } from "react";
import "./catalogo.css"; // Asegúrate de que el nombre coincida con tu archivo físico
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

  // --- 1. CARGA DE DATOS DESDE PUERTO 3002 ---
  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = () => {
    fetch("http://localhost:3002/api/catalogo")
      .then((res) => res.json())
      .then((data) => setProductos(data))
      .catch((err) => console.error("Error al traer productos:", err));
  };

  // --- 2. LÓGICA DEL CARRITO ---
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
      const response = await fetch("http://localhost:3002/api/finalizar-compra", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productos: carrito }),
      });
      if (response.ok) {
        alert("¡Compra finalizada con éxito! ✨");
        setCarrito([]);
        setMostrarCarrito(false);
        fetchProductos();
      } else {
        alert("Error al procesar la compra");
      }
    } catch (error) {
      alert("Error de conexión con el servidor");
    }
  };

  // --- 3. LÓGICA DE FILTROS ---
  const normalizarTexto = (texto) =>
    texto?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || "";

  let productosFiltrados = productos.filter((p) =>
    normalizarTexto(p.nombreProducto).includes(normalizarTexto(busqueda))
  );

  if (generosSeleccionados.length > 0) {
    productosFiltrados = productosFiltrados.filter((p) =>
      generosSeleccionados.some(
        (g) => normalizarTexto(g) === normalizarTexto(p.genero)
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
                    ? setGenerosSeleccionados([...generosSeleccionados, "Masculino"])
                    : setGenerosSeleccionados(generosSeleccionados.filter((g) => g !== "Masculino"))
                }
              />{" "}
              Masculino
            </label>
            <label>
              <input
                type="checkbox"
                onChange={(e) =>
                  e.target.checked
                    ? setGenerosSeleccionados([...generosSeleccionados, "Femenino"])
                    : setGenerosSeleccionados(generosSeleccionados.filter((g) => g !== "Femenino"))
                }
              />{" "}
              Femenino
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

          <h3 className="sidebar-title">Categorías</h3>
          <div className="filter-group">
            <label>
              <input
                type="checkbox"
                onChange={(e) =>
                  e.target.checked
                    ? setCategoriasSeleccionadas([...categoriasSeleccionadas, "pantalon"])
                    : setCategoriasSeleccionadas(categoriasSeleccionadas.filter((c) => c !== "pantalon"))
                }
              />{" "}
              Pantalones
            </label>
            <label>
              <input
                type="checkbox"
                onChange={(e) =>
                  e.target.checked
                    ? setCategoriasSeleccionadas([...categoriasSeleccionadas, "camiseta"])
                    : setCategoriasSeleccionadas(categoriasSeleccionadas.filter((c) => c !== "camiseta"))
                }
              />{" "}
              Camisetas
            </label>
          </div>
        </aside>

        <main className="productos-container">
          {productosFiltrados.length > 0 ? (
            <div className="productos-grid">
              {productosFiltrados.map((p) => (
                <div className="producto-card" key={p.id_producto}>
                  <div className="img-wrapper">
                    <img src={p.imagen || "/img/default.jpg"} alt={p.nombreProducto} />
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

      {/* --- CARRITO FLOTANTE --- */}
      {mostrarCarrito && (
        <div className="cart-drawer open">
          <div className="cart-drawer-header">
            <h3>TU CARRITO ({carrito.length})</h3>
            <button className="btn-close-cart" onClick={() => setMostrarCarrito(false)}>✕</button>
          </div>

          <div className="cart-drawer-body">
            {carrito.length === 0 ? (
              <div className="cart-empty-state">
                <p>Aún no has añadido nada.</p>
              </div>
            ) : (
              carrito.map((item) => (
                <div key={item.id_producto} className="cart-item-pro">
                  <img src={item.imagen || "/img/default.jpg"} alt={item.nombreProducto} className="cart-item-img" />
                  <div className="cart-item-main">
                    <div className="cart-item-info">
                      <p className="cart-item-name">{item.nombreProducto}</p>
                      <p className="cart-item-meta">Talla: {item.talla} | {item.genero}</p>
                    </div>
                    <div className="cart-item-actions-row">
                      <div className="qty-controls-pro">
                        <button onClick={() => modificarCantidad(item.id_producto, "menos")}>-</button>
                        <span>{item.cantidad}</span>
                        <button onClick={() => modificarCantidad(item.id_producto, "mas")}>+</button>
                      </div>
                      <div className="cart-item-subtotal">
                        <span>${((item.precioProducto || 0) * item.cantidad).toLocaleString()}</span>
                      </div>
                      <FaTrash
                        className="btn-remove-item"
                        onClick={() => setCarrito(carrito.filter((i) => i.id_producto !== item.id_producto))}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {carrito.length > 0 && (
            <div className="cart-drawer-footer">
              <div className="cart-total-section">
                <div className="total-row">
                  <span>Total:</span>
                  <strong>
                    ${carrito.reduce((acc, i) => acc + (i.precioProducto || 0) * i.cantidad, 0).toLocaleString()} COP
                  </strong>
                </div>
              </div>
              <button className="btn-checkout-pro" onClick={finalizarCompra}>
                FINALIZAR COMPRA
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Catalogo;