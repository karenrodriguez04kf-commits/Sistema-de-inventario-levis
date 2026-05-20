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
import MisPedidos from './MisPedidos'; // No olvides importar el componente nuevo

function App() {
  const getRol = () => localStorage.getItem('rol');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar" element={<Recuperar />} />
        
        <Route path="/home" element={<Home />}>
          <Route index element={<Bienvenida />} /> 
          <Route path="perfil" element={<Perfil />} />
          <Route path="catalogo" element={<Catalogo />} />
          
          {/* AÑADIMOS ESTA RUTA AQUÍ */}
          <Route path="mis-pedidos" element={<MisPedidos />} />

          <Route 
            path="clientes" 
            element={localStorage.getItem('rol') === 'admin' ? <Clientes /> : <Navigate to="/home/catalogo" />} 
          />
          <Route 
            path="inventario" 
            element={localStorage.getItem('rol') === 'admin' ? <Inventario /> : <Navigate to="/home/catalogo" />} 
          />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App; 