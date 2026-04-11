import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Catalogo from "./catalogo";
import Inventario from "./inventario";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Catalogo />} />
        <Route path="/admin" element={<Inventario />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;