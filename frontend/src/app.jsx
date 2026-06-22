import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Catalogo from "./catalogo"; 
import Inventario from "./inventario"; 
import Login from './login';
import Home from './home';
import Clientes from './clientes';
import Bienvenida from './bienvenida';
import Registro from './registro'; 
import Recuperar from './recuperar';
import Perfil from './perfil'; 
import MisPedidos from "./MisPedidos";
import ReporteVentas from "./ReporteVentas";
import Proveedores from './proveedores';

    
// ✅ Componente que verifica el rol en cada render
const RutaAdmin = ({ children }) => {
  const rol = localStorage.getItem('rol');
  return rol === 'admin' ? children : <Navigate to="/home/catalogo" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Rutas Públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar" element={<Recuperar />} />
        
        {/* 2. Estructura de Home con Rutas Hijas */}
        <Route path="/home" element={<Home />}>
          <Route index element={<Bienvenida />} /> 
          <Route path="perfil" element={<Perfil />} />
          <Route path="catalogo" element={<Catalogo />} />
          <Route path="mis-pedidos" element={<MisPedidos />} />

          {/* ✅ Rutas protegidas solo para admin */}
          <Route path="clientes" element={
            <RutaAdmin><Clientes /></RutaAdmin>
          } />
          <Route path="inventario" element={
            <RutaAdmin><Inventario /></RutaAdmin>
          } />
          <Route path="reporte-ventas" element={
            <RutaAdmin><ReporteVentas /></RutaAdmin>
          } />
          <Route path="proveedores" element={
    <RutaAdmin><Proveedores /></RutaAdmin>
} />
        </Route>

        {/* 3. Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;