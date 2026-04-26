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

function App() {
  // Función para obtener el rol actual de forma segura
  const getRol = () => localStorage.getItem('rol');

  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Rutas Públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar" element={<Recuperar />} />
        
        {/* 2. Estructura de Home con Rutas Hijas */}
        <Route path="/home" element={<Home />}>
          {/* Al entrar a /home, se muestra Bienvenida */}
          <Route index element={<Bienvenida />} /> 
          <Route path="perfil" element={<Perfil />} />
          <Route path="catalogo" element={<Catalogo />} />

          {/* PROTECCIÓN DE RUTAS: 
              Usamos una función o comprobación directa para que React 
              valide el rol al momento de hacer click.
          */}
         <Route 
  path="clientes" 
  element={localStorage.getItem('rol') === 'admin' ? <Clientes /> : <Navigate to="/home/catalogo" />} 
/>
<Route 
  path="inventario" 
  element={localStorage.getItem('rol') === 'admin' ? <Inventario /> : <Navigate to="/home/catalogo" />} />
        </Route>

        {/* 3. Redirección por defecto para cualquier ruta no válida */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;