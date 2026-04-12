import React, { useEffect, useState } from "react";
import "./catalogo.css";
import { FaShoppingCart, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();
  const [generosSeleccionados, setGenerosSeleccionados] = useState([]);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);
  const [tallasSeleccionadas, setTallasSeleccionadas] = useState([]);

  // ESTADOS DEL CARRITO
  const [carrito, setCarrito] = useState([]);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = () => {
    fetch("http://localhost:3001/api/catalogo")
      .then(res => res.json())
      .then(data => setProductos(data))
      .catch(err => console.error(err));
  };

  const agregarAlCarrito = (p) => {
    setCarrito(prev => {
      const existe = prev.find(item => item.id_producto === p.id_producto);
      if (existe) {
        return prev.map(item =>
          item.id_producto === p.id_producto ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...prev, { ...p, cantidad: 1 }];
    });
  };

  const modificarCantidad = (id, accion) => {
    setCarrito(prev => prev.map(item => {
      if (item.id_producto === id) {
        const nuevaCant = accion === 'mas' ? item.cantidad + 1 : item.cantidad - 1;
        return { ...item, cantidad: Math.max(1, nuevaCant) };
      }
      return item;
    }));
  };

  const finalizarCompra = async () => {
    if (carrito.length === 0) return alert("El carrito está vacío");
    try {
      const response = await fetch("http://localhost:3001/api/finalizar-compra", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productos: carrito }),
      });
      if (response.ok) {
        alert("¡Compra finalizada con éxito!");
        setCarrito([]);
        setMostrarCarrito(false);
        fetchProductos(); // Actualiza el stock visualmente
      } else {
        alert("Error al procesar la compra");
      }
    } catch (error) {
      alert("Error de conexión con el servidor");
    }
  };

  const normalizarTexto = (texto) =>
    texto?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || "";

  // FILTROS
  let productosFiltrados = productos.filter(p => normalizarTexto(p.nombreProducto).includes(normalizarTexto(busqueda)));

  if (generosSeleccionados.length > 0) {
    productosFiltrados = productosFiltrados.filter(p => generosSeleccionados.some(g => normalizarTexto(g) === normalizarTexto(p.genero)));
  }

  if (categoriasSeleccionadas.length > 0) {
    productosFiltrados = productosFiltrados.filter(p => categoriasSeleccionadas.some(c => normalizarTexto(c) === normalizarTexto(p.categoria)));
  }

  const tallasDisponibles = Array.from(new Set(productos.map(p => p.talla?.trim()).filter(Boolean))).sort();

  if (tallasSeleccionadas.length > 0) {
    productosFiltrados = productosFiltrados.filter(p => tallasSeleccionadas.some(t => normalizarTexto(t) === normalizarTexto(p.talla)));
  }

  return (
    <div className="catalogo-container">
      <div className="header">
        <div className="logo">👤</div>
        <div className="buscador">
          <input type="text" placeholder="Buscar productos..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        </div>
        
        <div className="carrito-icono-wrapper" onClick={() => setMostrarCarrito(!mostrarCarrito)}>
          <FaShoppingCart size={24} />
          {carrito.length > 0 && <span className="badge">{carrito.reduce((acc, p) => acc + p.cantidad, 0)}</span>}
        </div>
        
        <button className="btn-admin" onClick={() => navigate("/admin")}>Admin</button>
      </div>

      <div className="contenido">
        <div className="sidebar">
          <h3>Género</h3>
          <label><input type="checkbox" onChange={(e) => e.target.checked ? setGenerosSeleccionados([...generosSeleccionados, "Masculino"]) : setGenerosSeleccionados(generosSeleccionados.filter(g => g !== "Masculino"))} /> Hombre</label>
          <label><input type="checkbox" onChange={(e) => e.target.checked ? setGenerosSeleccionados([...generosSeleccionados, "Femenino"]) : setGenerosSeleccionados(generosSeleccionados.filter(g => g !== "Femenino"))} /> Mujer</label>
          
          <h4>Tallas</h4>
          <div className="tallas-grid">
            {tallasDisponibles.map(talla => (
              <label key={talla}><input type="checkbox" onChange={(e) => e.target.checked ? setTallasSeleccionadas([...tallasSeleccionadas, talla]) : setTallasSeleccionadas(tallasSeleccionadas.filter(t => t !== talla))} /> {talla}</label>
            ))}
          </div>

          <h4>Categorías</h4>
          <label><input type="checkbox" onChange={(e) => e.target.checked ? setCategoriasSeleccionadas([...categoriasSeleccionadas, "pantalon"]) : setCategoriasSeleccionadas(categoriasSeleccionadas.filter(c => c !== "pantalon"))} /> Pantalones</label>
          <label><input type="checkbox" onChange={(e) => e.target.checked ? setCategoriasSeleccionadas([...categoriasSeleccionadas, "camiseta"]) : setCategoriasSeleccionadas(categoriasSeleccionadas.filter(c => c !== "camiseta"))} /> Camisetas</label>
        </div>

        <div className="productos-grid">
          {productosFiltrados.map(p => (
            <div className="card" key={p.id_producto}>
              <img src={p.imagen || "/img/default.jpg"} alt="producto" />
              <h4>{p.nombreProducto}</h4>
              <p className="precio">${p.precioProducto} COP</p>
              <button className="comprar-btn" onClick={() => agregarAlCarrito(p)}>Añadir</button>
            </div>
          ))}
        </div>
      </div>

      {/* CUADRO DEL CARRITO (ESQUINA DERECHA) */}
      {mostrarCarrito && (
        <div className="carrito-floating-panel">
          <div className="carrito-header">
            <h3>🛒 Mi Carrito</h3>
            <button className="close-btn" onClick={() => setMostrarCarrito(false)}>X</button>
          </div>

          <div className="carrito-items">
            {carrito.length === 0 ? <p className="empty-msg">El carrito está vacío</p> : (
              carrito.map(item => (
                <div key={item.id_producto} className="item-fila">
                  <div className="item-info">
                    <p className="item-nombre">{item.nombreProducto}</p>
                    <p className="item-detalle">Talla: {item.talla} | ${item.precioProducto}</p>
                  </div>
                  <div className="item-controles">
                    <button onClick={() => modificarCantidad(item.id_producto, 'menos')}>-</button>
                    <span>{item.cantidad}</span>
                    <button onClick={() => modificarCantidad(item.id_producto, 'mas')}>+</button>
                    <FaTrash className="trash-icon" onClick={() => setCarrito(carrito.filter(i => i.id_producto !== item.id_producto))} />
                  </div>
                </div>
              ))
            )}
          </div>

          {carrito.length > 0 && (
            <div className="carrito-footer">
              <div className="total-div">
                <span>Total:</span>
                <span>${carrito.reduce((acc, i) => acc + (i.precioProducto * i.cantidad), 0)}</span>
              </div>
              <button className="btn-vaciar" onClick={() => setCarrito([])}>Vaciar Carrito</button>
              <button className="btn-finalizar" onClick={finalizarCompra}>FINALIZAR COMPRA</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Catalogo;