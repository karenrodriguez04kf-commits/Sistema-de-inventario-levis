import React, { useEffect, useState } from "react";
import api, { BASE_URL } from "./api"; 
import "./catalogo.css";
import { FaShoppingCart, FaTrash, FaSearch, FaPlus, FaMinus, FaReceipt, FaChevronDown, FaChevronUp, FaTimes } from "react-icons/fa";
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
  
  // Estados para el Modal de Selección Múltiple de Tallas
  const [productoModal, setProductoModal] = useState(null);
  const [cantidadesModal, setCantidadesModal] = useState({});

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
      const response = await api.get("/categorias");
      setCategoriasDB(response.data);
    } catch (err) {
      console.error("Error al traer categorías de BD:", err);
    }
  };

  const abrirModalSeleccion = (producto) => {
    setProductoModal(producto);
    setCantidadesModal({});
  };

  const modificarCantidad = (id_producto, talla, accion) => {
    setCarrito((prev) =>
      prev.map((item) => {
        if (item.id_producto === id_producto && item.talla === talla) {
          const nuevaCant = accion === "mas" ? item.cantidad + 1 : item.cantidad - 1;
          const stockMax = item.stockMaximoTalla || 999;

          if (nuevaCant > stockMax) {
            alert(`Lo sentimos, solo hay ${stockMax} unidades disponibles para la talla ${talla}`);
            return item;
          }

          return { ...item, cantidad: Math.max(1, nuevaCant) };
        }
        return item;
      })
    );
  };

  const calcularTotal = () => {
    return carrito.reduce((acc, p) => acc + ((p.precioProducto || p.precio || 0) * p.cantidad), 0);
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
          precioProducto: item.precioProducto || item.precio,
          talla: item.talla
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

  // FILTRADO PRINCIPAL (Oculta inactivos y aplica búsqueda/filtros)
  let productosFiltrados = productos.filter((p) => {
    const esActivo = p.estado === undefined || p.estado === 1 || p.estado === true;
    if (!esActivo) return false;

    return normalizarTexto(p.nombreProducto).includes(normalizarTexto(busqueda));
  });

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
      if (!p.tallas) return false;
      return tallasSeleccionadas.some((t) => {
        const encontrada = p.tallas.find(item => item.talla.toUpperCase() === t.toUpperCase());
        return encontrada && Number(encontrada.stock) > 0;
      });
    });
  }

  if (coloresSeleccionados.length > 0) {
    productosFiltrados = productosFiltrados.filter((p) =>
      coloresSeleccionados.some((col) => normalizarTexto(col) === normalizarTexto(p.color))
    );
  }

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

  const listaCatRaw = categoriasDB.length > 0 
    ? categoriasDB.map(c => c.nombre) 
    : productos.map(p => p.categoria);

  const categoriasDisponibles = limpiarYCapitalizar(listaCatRaw);
  const generosDisponibles = limpiarYCapitalizar(productos.map(p => p.genero));
  const coloresDisponibles = limpiarYCapitalizar(productos.map(p => p.color));
  const tallasDisponibles = ["S", "M", "L", "XL", "XXL"];

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
        {/* SIDEBAR DE FILTROS */}
        <aside className="catalogo-sidebar">
          <div className="sidebar-header-filter">
            <h3>Filtros de Búsqueda</h3>
          </div>

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

        {/* LISTADO DE PRODUCTOS */}
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
                    
                    <div className="tallas-badges-catalogo" style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', margin: '8px 0' }}>
                      {p.tallas && p.tallas.length > 0 ? (
                        p.tallas.map((tItem) => {
                          if (Number(tItem.stock) <= 0) return null;
                          return (
                            <span key={tItem.talla} style={{ background: '#121212', color: '#ff4d4d', border: '1px solid rgba(229, 9, 20, 0.4)', padding: '2px 6px', fontSize: '11px', borderRadius: '4px', fontWeight: 'bold' }}>
                              {tItem.talla}: {tItem.stock}
                            </span>
                          );
                        })
                      ) : (
                        <span style={{ fontSize: '11px', color: '#888' }}>Sin stock</span>
                      )}
                    </div>

                    <p className="p-precio">${(p.precioProducto || p.precio || 0).toLocaleString()} COP</p>
                    
                    <button className="btn-add-cart" onClick={() => abrirModalSeleccion(p)}>
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

      {/* MODAL PARA SELECCIONAR TALLAS */}
      {productoModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="modal-content" style={{ background: '#121212', padding: '30px', borderRadius: '16px', width: '420px', color: '#fff', position: 'relative', border: '1px solid #e50914', boxShadow: '0 0 25px rgba(229, 9, 20, 0.4)' }}>
            <button onClick={() => setProductoModal(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer' }}>
              <FaTimes size={18} />
            </button>
            
            <h3 style={{ marginBottom: '8px', fontSize: '20px', color: '#fff', textShadow: '0 0 10px rgba(229, 9, 20, 0.5)' }}>Seleccionar Tallas y Cantidades</h3>
            <p style={{ fontSize: '13px', color: '#aaa', marginBottom: '20px' }}>{productoModal.nombreProducto}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '250px', overflowY: 'auto', paddingRight: '5px', marginBottom: '20px' }}>
              {productoModal.tallas && productoModal.tallas.length > 0 ? (
                productoModal.tallas.map((tItem) => {
                  const stockMax = Number(tItem.stock) || 0;
                  if (stockMax <= 0) return null;

                  const cantActual = cantidadesModal[tItem.talla] || 0;

                  return (
                    <div key={tItem.talla} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1a1a1a', padding: '10px 15px', borderRadius: '8px', border: '1px solid #2a2a2a' }}>
                      <div>
                        <span style={{ fontWeight: 'bold', fontSize: '15px', color: '#fff' }}>Talla {tItem.talla}</span>
                        <span style={{ display: 'block', fontSize: '11px', color: '#888' }}>Stock disponible: {stockMax}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button 
                          type="button"
                          onClick={() => {
                            setCantidadesModal(prev => ({
                              ...prev,
                              [tItem.talla]: Math.max(0, (prev[tItem.talla] || 0) - 1)
                            }));
                          }}
                          style={{ width: '28px', height: '28px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <FaMinus size={10} />
                        </button>
                        
                        <input 
                          type="number" 
                          min="0"
                          max={stockMax}
                          value={cantActual}
                          onChange={(e) => {
                            const val = Math.max(0, Math.min(stockMax, Number(e.target.value)));
                            setCantidadesModal(prev => ({ ...prev, [tItem.talla]: val }));
                          }}
                          style={{ width: '45px', textAlign: 'center', background: '#0a0a0a', border: '1px solid #444', color: '#fff', borderRadius: '4px', padding: '4px', fontSize: '14px', outline: 'none' }}
                        />

                        <button 
                          type="button"
                          onClick={() => {
                            if (cantActual < stockMax) {
                              setCantidadesModal(prev => ({
                                ...prev,
                                [tItem.talla]: (prev[tItem.talla] || 0) + 1
                              }));
                            }
                          }}
                          style={{ width: '28px', height: '28px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <FaPlus size={10} />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p style={{ fontSize: '13px', color: '#e50914', textAlign: 'center' }}>No hay tallas disponibles para este producto.</p>
              )}
            </div>

            <button 
              onClick={() => {
                const seleccionadas = Object.entries(cantidadesModal).filter(([talla, cantidad]) => cantidad > 0);

                if (seleccionadas.length === 0) {
                  alert("Por favor selecciona al menos una cantidad mayor a 0 en alguna talla.");
                  return;
                }

                setCarrito((prev) => {
                  let nuevoCarrito = [...prev];

                  seleccionadas.forEach(([talla, cantidad]) => {
                    const tItemEncontrado = productoModal.tallas.find(t => t.talla === talla);
                    const stockMaximoTalla = tItemEncontrado ? Number(tItemEncontrado.stock) : 999;

                    const indexExistente = nuevoCarrito.findIndex(
                      (item) => item.id_producto === productoModal.id_producto && item.talla === talla
                    );

                    if (indexExistente >= 0) {
                      const itemActual = nuevoCarrito[indexExistente];
                      const nuevaCantidadTotal = itemActual.cantidad + cantidad;

                      if (nuevaCantidadTotal > stockMaximoTalla) {
                        alert(`La cantidad total para la talla ${talla} excede el stock disponible (${stockMaximoTalla})`);
                        return;
                      }

                      nuevoCarrito[indexExistente] = { ...itemActual, cantidad: nuevaCantidadTotal };
                    } else {
                      nuevoCarrito.push({
                        ...productoModal,
                        talla: talla,
                        cantidad: cantidad,
                        stockMaximoTalla: stockMaximoTalla
                      });
                    }
                  });

                  return nuevoCarrito;
                });

                setProductoModal(null);
              }}
              style={{ width: '100%', padding: '12px', background: '#e50914', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 15px rgba(229, 9, 20, 0.6)', transition: '0.2s' }}
            >
              AÑADIR AL CARRITO
            </button>
          </div>
        </div>
      )}

      {/* CARRITO DRAWER */}
      <div className={`cart-drawer ${mostrarCarrito ? "open" : ""}`}>
        <div className="cart-drawer-header">
          <h3>TU CARRITO ({carrito.reduce((acc, i) => acc + i.cantidad, 0)})</h3>
          <button className="btn-close-cart" onClick={() => setMostrarCarrito(false)}>✕</button>
        </div>
        <div className="cart-drawer-body">
          {carrito.length === 0 ? (
            <p className="empty-msg">El carrito está vacío</p>
          ) : (
            carrito.map(item => (
              <div key={`${item.id_producto}-${item.talla}`} className="cart-item-pro">
                <div className="cart-item-info">
                  <p className="item-name">{item.nombreProducto}</p>
                  <p style={{ fontSize: '12px', color: '#aaa', margin: '2px 0' }}>Talla: <strong>{item.talla}</strong></p>
                  <div className="qty-controls">
                    <button onClick={() => modificarCantidad(item.id_producto, item.talla, "menos")}><FaMinus size={10}/></button>
                    <span>{item.cantidad}</span>
                    <button onClick={() => modificarCantidad(item.id_producto, item.talla, "mas")}><FaPlus size={10}/></button>
                  </div>
                  <span className="item-subtotal">
                    Subtotal: ${((item.precioProducto || item.precio || 0) * item.cantidad).toLocaleString()}
                  </span>
                </div>
                <FaTrash className="btn-remove" onClick={() => setCarrito(carrito.filter(i => !(i.id_producto === item.id_producto && i.talla === item.talla)))} />
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