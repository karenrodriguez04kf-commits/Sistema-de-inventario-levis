import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api, { BASE_URL } from "./api";
import { FaBoxes, FaPlus, FaEdit, FaTrash, FaArrowLeft, FaUpload, FaTag } from "react-icons/fa";
import "./inventario.css";

const TALLAS_DEFAULT = ["S", "M", "L", "XL", "XXL"];

function Inventario() {
  const navigate = useNavigate();
  const [view, setView] = useState("listar");
  const [productos, setProductos] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(false);
  const [idActual, setIdActual] = useState(null);
  const [proveedores, setProveedores] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const [form, setForm] = useState({
    nombreProducto: "",
    precioProducto: "",
    color: "",
    genero: "",
    id_categoria: "",
    id_proveedor: "",
    imagen: null,
    tallas: TALLAS_DEFAULT.map(t => ({ talla: t, stock: 0 }))
  });

  const cargarProductos = async () => {
    try {
      const res = await api.get("/productos");
      setProductos(res.data);
    } catch (err) {
      console.error("Error cargando inventario:", err);
    }
  };

  const cargarProveedores = async () => {
    try {
      const res = await api.get("/proveedores");
      setProveedores(res.data);
    } catch (err) {
      console.error("Error cargando proveedores:", err);
    }
  };

  const cargarCategorias = async () => {
    try {
      const res = await api.get("/productos/categorias");
      setCategorias(res.data);
    } catch (err) {
      console.error("Error cargando categorias:", err);
    }
  };

  useEffect(() => {
    cargarProductos();
    cargarProveedores();
    cargarCategorias();
  }, []);

  const stockTotal = (prod) => {
    if (!prod.tallas) return 0;
    const tallas = typeof prod.tallas === 'string' ? JSON.parse(prod.tallas) : prod.tallas;
    return tallas.reduce((sum, t) => sum + (t.stock || 0), 0);
  };

  const eliminarProducto = async (id) => {
    if (window.confirm("¿Estás seguro de borrar este producto?")) {
      try {
        await api.delete(`/productos/${id}`);
        alert("Producto eliminado con éxito");
        cargarProductos();
      } catch (error) {
        alert("Error al eliminar");
      }
    }
  };

  const abrirModal = (prod = null) => {
    if (prod) {
      setEditando(true);
      setIdActual(prod.id_producto);
      const tallasExistentes = prod.tallas
        ? (typeof prod.tallas === 'string' ? JSON.parse(prod.tallas) : prod.tallas)
        : TALLAS_DEFAULT.map(t => ({ talla: t, stock: 0 }));
      setForm({
        nombreProducto: prod.nombreProducto || "",
        precioProducto: prod.precioProducto || "",
        color: prod.color || "",
        genero: prod.genero || "",
        id_categoria: prod.id_categoria || "",
        id_proveedor: prod.id_proveedor || "",
        imagen: null,
        tallas: tallasExistentes
      });
    } else {
      setEditando(false);
      setForm({
        nombreProducto: "",
        precioProducto: "",
        color: "",
        genero: "",
        id_categoria: "",
        id_proveedor: "",
        imagen: null,
        tallas: TALLAS_DEFAULT.map(t => ({ talla: t, stock: 0 }))
      });
    }
    setMostrarModal(true);
  };

  const actualizarStockTalla = (index, valor) => {
    const nuevasTallas = [...form.tallas];
    nuevasTallas[index].stock = parseInt(valor) || 0;
    setForm({ ...form, tallas: nuevasTallas });
  };

  const guardarProducto = async () => {
    if (!form.nombreProducto.trim()) return alert("El nombre es obligatorio");
    if (!form.precioProducto) return alert("El precio es obligatorio");
    if (!form.genero) return alert("El género es obligatorio");

    const data = new FormData();
    data.append("nombreProducto", form.nombreProducto);
    data.append("precioProducto", form.precioProducto);
    data.append("color", form.color);
    data.append("genero", form.genero);
    data.append("id_categoria", form.id_categoria);
    data.append("id_proveedor", form.id_proveedor || "");
    data.append("tallas", JSON.stringify(form.tallas));

    if (form.imagen) data.append("imagen", form.imagen);

    const endpoint = editando ? `/productos/${idActual}` : "/productos";
    const metodo = editando ? "put" : "post";

    try {
      const response = await api[metodo](endpoint, data);
      if (response.status === 200 || response.status === 201) {
        alert(editando ? "¡Producto actualizado!" : "¡Producto guardado!");
        setMostrarModal(false);
        cargarProductos();
      }
    } catch (error) {
      const mensaje = error.response?.data?.error || "Error en la operación";
      alert(mensaje);
    }
  };

  const URL_IMAGENES = BASE_URL || "http://localhost:3002";

  return (
    <div className="admin-main-wrapper pedidos-page-wrapper">
      {view === "listar" && (
        <div className="inventory-list-view">
          
          <div className="history-header-neon">
            <div className="header-title-box">
              <h2>GESTIÓN DE INVENTARIO <FaBoxes className="icon-pulse" /></h2>
              <p>Control de existencias, tallas y referencias en tiempo real.</p>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button className="btn-return-neon" onClick={() => navigate("/home/catalogo")}>
                <FaArrowLeft /> PANEL
              </button>
              <button className="btn-explore-neon" onClick={() => abrirModal()}>
                <FaPlus /> NUEVO ITEM
              </button>
            </div>
          </div>

          {productos.length === 0 ? (
            <div className="empty-history-neon">
              <FaBoxes size={50} className="empty-icon-glow" />
              <p>No hay productos registrados en el inventario.</p>
              <button onClick={() => abrirModal()} className="btn-explore-neon">
                Añadir Primer Producto
              </button>
            </div>
          ) : (
            <div className="pedidos-grid-neon">
              {productos.map((prod) => {
                const tallas = prod.tallas
                  ? (typeof prod.tallas === 'string' ? JSON.parse(prod.tallas) : prod.tallas)
                  : [];
                const totalStk = stockTotal(prod);

                return (
                  <div key={prod.id_producto} className="pedido-card-neon">
                    
                    <div className="card-neon-top">
                      <span className="order-tag">REF #{prod.id_producto}</span>
                      <span className="order-date-tag">
                        <FaTag /> {prod.categoria || "Sin categoría"}
                      </span>
                    </div>

                    <div className="card-neon-body">
                      <div className="product-row-neon">
                        <div className="img-container-neon">
                          <img 
                            src={`${URL_IMAGENES}${prod.imagen}`} 
                            alt={prod.nombreProducto} 
                            onError={(e) => { e.target.src = "/img/placeholder.png"; }}
                          />
                        </div>
                        <div className="product-info-neon">
                          <h4>{prod.nombreProducto}</h4>
                          <span className="prod-qty-price">Color: {prod.color || "N/A"} | Gen: {prod.genero || "N/A"}</span>
                          <div style={{ marginTop: "6px", display: "flex", gap: "4px", flexWrap: "wrap" }}>
                            {tallas.filter(t => t.stock > 0).map((t, i) => (
                              <span key={i} style={{ background: "#222", color: "#aaa", padding: "1px 5px", borderRadius: "3px", fontSize: "10px", border: "1px solid #333" }}>
                                {t.talla}: <strong style={{ color: "#fff" }}>{t.stock}</strong>
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="product-subtotal-neon">
                          ${Number(prod.precioProducto).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="card-neon-footer">
                      <div className={`status-neon-pill ${totalStk < 10 ? "stock-warning" : ""}`} style={{ color: totalStk < 10 ? "#c41230" : "#2ecc71", background: totalStk < 10 ? "rgba(196, 18, 48, 0.1)" : "rgba(46, 204, 113, 0.1)", borderColor: totalStk < 10 ? "rgba(196, 18, 48, 0.3)" : "rgba(46, 204, 113, 0.3)" }}>
                        <span className="dot-pulse" style={{ backgroundColor: totalStk < 10 ? "#c41230" : "#2ecc71", boxShadow: `0 0 8px ${totalStk < 10 ? "#c41230" : "#2ecc71"}` }}></span> 
                        STOCK: {totalStk} UND
                      </div>
                      
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button 
                          className="btn-icon edit" 
                          onClick={() => abrirModal(prod)}
                          title="Editar producto"
                          style={{ background: "#222", border: "1px solid #444", color: "#3498db", padding: "6px 10px", borderRadius: "6px", cursor: "pointer" }}
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="btn-icon delete" 
                          onClick={() => eliminarProducto(prod.id_producto)}
                          title="Eliminar producto"
                          style={{ background: "#222", border: "1px solid #444", color: "#c41230", padding: "6px 10px", borderRadius: "6px", cursor: "pointer" }}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>{editando ? "EDITAR REFERENCIA" : "AÑADIR A COLECCIÓN"}</h3>
            <div className="modal-form-body">

              <div className="form-group">
                <label>Nombre de la Referencia</label>
                <input type="text" value={form.nombreProducto}
                  onChange={(e) => setForm({ ...form, nombreProducto: e.target.value })}
                  placeholder="Ej: Jeans 501 Original" />
              </div>

              <div style={{ display: "flex", gap: "15px" }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Precio (COP)</label>
                  <input type="number" value={form.precioProducto}
                    onChange={(e) => setForm({ ...form, precioProducto: e.target.value })} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Color</label>
                  <input type="text" value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    placeholder="Ej: Azul, Negro..." />
                </div>
              </div>

              <div className="form-group">
                <label>Stock por Talla</label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", background: "#111", padding: "10px", borderRadius: "8px", border: "1px solid #333" }}>
                  {form.tallas.map((t, i) => (
                    <div key={i} style={{ textAlign: "center", minWidth: "50px" }}>
                      <div style={{ fontWeight: "bold", fontSize: "11px", color: "#888", marginBottom: "4px" }}>{t.talla}</div>
                      <input
                        type="number"
                        min="0"
                        value={t.stock}
                        onChange={(e) => actualizarStockTalla(i, e.target.value)}
                        style={{ width: "50px", textAlign: "center", background: "#1a1a1a", border: "1px solid #444", color: "#fff", borderRadius: "4px", padding: "4px", outline: "none", MozAppearance: "textfield" }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: "15px" }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Categoría</label>
                  <select value={form.id_categoria}
                    onChange={(e) => setForm({ ...form, id_categoria: e.target.value })}
                    className="form-select">
                    <option value="">Seleccionar...</option>
                    {categorias.map(cat => (
                      <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Género</label>
                  <select value={form.genero}
                    onChange={(e) => setForm({ ...form, genero: e.target.value })}
                    className="form-select">
                    <option value="">Seleccionar...</option>
                    <option value="Hombre">Hombre</option>
                    <option value="Mujer">Mujer</option>
                    <option value="Niños">Niños</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Proveedor</label>
                <select value={form.id_proveedor || ""}
                  onChange={(e) => setForm({ ...form, id_proveedor: e.target.value })}
                  className="form-select">
                  <option value="">Sin proveedor</option>
                  {proveedores.map((prov) => (
                    <option key={prov.id_proveedor} value={prov.id_proveedor}>{prov.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Imagen del Producto</label>
                <input type="file" accept="image/*"
                  onChange={(e) => setForm({ ...form, imagen: e.target.files[0] })}
                  id="file-upload" style={{ display: "none" }} />
                <label htmlFor="file-upload" className="btn-upload-styled">
                  <UploadIconWrapper /> {form.imagen ? form.imagen.name : "SELECCIONAR ARCHIVO"}
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-save" onClick={guardarProducto}>GUARDAR</button>
              <button className="btn-cancel" onClick={() => setMostrarModal(false)}>CANCELAR</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UploadIconWrapper() {
  return <FaUpload />;
}

export default Inventario;