import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import Clientes from './components/Clientes';
import Bienvenida from './components/Bienvenida';
import Registro from './components/Registro'; 
import Recuperar from './components/Recuperar';
import Perfil from './components/Perfil'; // 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar" element={<Recuperar />} />
        
        <Route path="/home" element={<Home />}>
          <Route index element={<Bienvenida />} /> 
          <Route path="clientes" element={<Clientes />} />
          <Route path="perfil" element={<Perfil />} /> 
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;