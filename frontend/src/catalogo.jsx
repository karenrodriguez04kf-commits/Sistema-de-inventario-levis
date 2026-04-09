import React, { useEffect, useState } from "react";
import "./catalogo.css";
import { FaShoppingCart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();
  const [generosSeleccionados, setGenerosSeleccionados] = useState([]);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);
  const [tallasSeleccionadas, setTallasSeleccionadas] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/api/catalogo")
      .then(res => res.json())
      .then(data => {
        setProductos(data);
        console.log(data); // Para debug
      })
      .catch(err => console.error(err));
  }, []);

  const normalizarTexto = (texto) =>
    texto
      ?.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") || "";

  let productosFiltrados = productos.filter(p => normalizarTexto(p.nombreProducto).includes(normalizarTexto(busqueda)));

  if (generosSeleccionados.length > 0) {
    productosFiltrados = productosFiltrados.filter(p => {
      const generoProducto = normalizarTexto(p.genero);
      return generosSeleccionados.some(g => normalizarTexto(g) === generoProducto);
    });
  }

  if (categoriasSeleccionadas.length > 0) {
    productosFiltrados = productosFiltrados.filter(p => {
      const categoriaProducto = normalizarTexto(p.categoria);
      return categoriasSeleccionadas.some(c => normalizarTexto(c) === categoriaProducto);
    });
  }

  const tallasDisponibles = Array.from(
    productos.reduce((set, p) => {
      const talla = p.talla?.trim();
      if (talla) set.add(talla);
      return set;
    }, new Set())
  ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));

  if (tallasSeleccionadas.length > 0) {
    productosFiltrados = productosFiltrados.filter(p => {
      const tallaProducto = normalizarTexto(p.talla);
      return tallasSeleccionadas.some(t => normalizarTexto(t) === tallaProducto);
    });
  }

  return (
    <div className="catalogo">
      <div className="header">
        <div className="logo">👤</div>
        

        <div className="buscador">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>

        <div className="carrito">
          <FaShoppingCart />
          <span>Carrito</span>
        </div>
        <button onClick={() => navigate("/admin")}>
    Ir a Inventario
  </button>
      </div>

      <div className="contenido">

        {/* 🧾 SIDEBAR */}
        <div className="sidebar">
          <h3>Categoría</h3>

          <label><input type="checkbox" checked={generosSeleccionados.includes("Masculino")} onChange={(e) => {

            if (e.target.checked) {

              setGenerosSeleccionados(prev => [...prev, "Masculino"]);

            } else {

              setGenerosSeleccionados(prev => prev.filter(g => g !== "Masculino"));

            }

          }} /> Hombre</label>

          <label><input type="checkbox" checked={generosSeleccionados.includes("Femenino")} onChange={(e) => {

            if (e.target.checked) {

              setGenerosSeleccionados(prev => [...prev, "Femenino"]);

            } else {

              setGenerosSeleccionados(prev => prev.filter(g => g !== "Femenino"));

            }

          }} /> Mujer</label>

          <label><input type="checkbox" checked={generosSeleccionados.includes("Niño")} onChange={(e) => {

            if (e.target.checked) {

              setGenerosSeleccionados(prev => [...prev, "Niño"]);

            } else {

              setGenerosSeleccionados(prev => prev.filter(g => g !== "Niño"));

            }

          }} /> Niños</label>

          <h4>Filtros</h4>
          <h5>Tallas</h5>
          <div className="tallas-filtro">
            {tallasDisponibles.length === 0 ? (
              <p>No hay tallas disponibles</p>
            ) : (
              tallasDisponibles.map(talla => (
                <label key={talla}>
                  <input
                    type="checkbox"
                    checked={tallasSeleccionadas.includes(talla)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setTallasSeleccionadas(prev => [...prev, talla]);
                      } else {
                        setTallasSeleccionadas(prev => prev.filter(t => t !== talla));
                      }
                    }}
                  /> {talla}
                </label>
              ))
            )}
          </div>
          <ul>
            <li><label><input type="checkbox" checked={categoriasSeleccionadas.includes("chaqueta")} onChange={(e) => {

              if (e.target.checked) {

                setCategoriasSeleccionadas(prev => [...prev, "chaqueta"]);

              } else {

                setCategoriasSeleccionadas(prev => prev.filter(c => c !== "chaqueta"));

              }

            }} /> Chaquetas</label></li>

            <li><label><input type="checkbox" checked={categoriasSeleccionadas.includes("zapato")} onChange={(e) => {

              if (e.target.checked) {

                setCategoriasSeleccionadas(prev => [...prev, "zapato"]);

              } else {

                setCategoriasSeleccionadas(prev => prev.filter(c => c !== "zapato"));

              }

            }} /> Zapatos</label></li>

            <li><label><input type="checkbox" checked={categoriasSeleccionadas.includes("pantalon")} onChange={(e) => {

              if (e.target.checked) {

                setCategoriasSeleccionadas(prev => [...prev, "pantalon"]);

              } else {

                setCategoriasSeleccionadas(prev => prev.filter(c => c !== "pantalon"));

              }

            }} /> Pantalones</label></li>

            <li><label><input type="checkbox" checked={categoriasSeleccionadas.includes("camiseta")} onChange={(e) => {

              if (e.target.checked) {

                setCategoriasSeleccionadas(prev => [...prev, "camiseta"]);

              } else {

                setCategoriasSeleccionadas(prev => prev.filter(c => c !== "camiseta"));

              }

            }} /> Camisetas</label></li>

            <li><label><input type="checkbox" checked={categoriasSeleccionadas.includes("Accesorio")} onChange={(e) => {

              if (e.target.checked) {

                setCategoriasSeleccionadas(prev => [...prev, "Accesorio"]);

              } else {

                setCategoriasSeleccionadas(prev => prev.filter(c => c !== "Accesorio"));

              }

            }} /> Accesorios</label></li>
          </ul>
        </div>

        {/* PRODUCTOS */}
        <div className="productos">
          {productosFiltrados.map(p => (
            <div className="card" key={p.id_producto}>
              <img src={p.imagen || "/img/default.jpg"} alt="producto" />

              <h4>{p.nombreProducto}</h4>

              <p className="precio">
                ${p.precioProducto} <span>cop</span>
              </p>              <button className="comprar-btn">Comprar</button>            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default Catalogo;