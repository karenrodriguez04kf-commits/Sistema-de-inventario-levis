import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Catalogo from "./catalogo"; // En minúscula como tus archivos
import Inventario from "./inventario"; 
import Login from './login';
import Home from './home';
import Clientes from './clientes';
import Bienvenida from './bienvenida';
import Registro from './registro'; 
import Recuperar from './recuperar';
import Perfil from './perfil'; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Ruta inicial: Login */}
        <Route path="/" element={<Login />} />
        
        {/* 2. Rutas de Auth */}
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar" element={<Recuperar />} />
        
        {/* 3. Rutas protegidas dentro del Home */}
        <Route path="/home" element={<Home />}>
          <Route index element={<Bienvenida />} /> 
          <Route path="clientes" element={<Clientes />} />
          <Route path="perfil" element={<Perfil />} />
          <Route path="catalogo" element={<Catalogo />} />
          <Route path="inventario" element={<Inventario />} />
        </Route>

        {/* 4. Ruta directa para admin si la necesitas */}
        <Route path="/admin" element={<Inventario />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App; 