const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'tu_clave_secreta_super_segura_123'; 
const saltRounds = 10;

// --- CONFIGURACIÓN SWAGGER ---
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: "PROYECTO LEVI'S",
      version: '1.0.0',
      description: 'Documentación completa del sistema de gestión'
      
    },
    servers: [{ url: 'http://localhost:3001' }]
    
  },
  apis: [ './src/app.jsx', './src/bienvenida.jsx' ] 
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// --- CONEXIÓN BASE DE DATOS ---
const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'levis_db'
});

db.connect((err) => {
  if (err) return console.error("Error conectando a DB:", err);
  console.log("-----------------------------------------");
  console.log("Conectado con éxito a levis_db 🚀");
  console.log("-----------------------------------------");
});

// --- RUTA RAIZ (PARA SOLUCIONAR EL CANNOT GET /) ---
app.get('/', (req, res) => {
    res.send(`
        <div style="text-align:center; margin-top:50px; font-family:Arial;">
            <h1 style="color:#c41230;">Servidor de LEVI'S Activo 🚀</h1>
            <p>La API está funcionando correctamente.</p>
            <p>Documentación: <a href="/api-docs">/api-docs</a></p>
        </div>
    `);
});

// --- AUTENTICACIÓN ---

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM usuarios WHERE email = ?";
  db.query(sql, [email], (err, result) => {
    if (err) return res.status(500).send({ Status: "Error", Message: err });
    if (result.length > 0) {
      bcrypt.compare(password, result[0].password, (err, coinciden) => {
        if (coinciden) {
          const token = jwt.sign({ 
            email: result[0].email, 
            rol: result[0].rol, 
            nombre: result[0].nombre 
          }, JWT_SECRET, { expiresIn: '1h' });
          res.status(200).send({ Status: "Exito", Token: token });
        } else {
          res.status(401).send({ Status: "Error", Message: "Contraseña incorrecta" });
        }
      });
    } else {
      res.status(401).send({ Status: "Error", Message: "Usuario no encontrado" });
    }
  });
});

app.post('/register', (req, res) => {
  const { nombre, email, password, rol } = req.body;
  const userRol = rol || 'admin';
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) return res.status(500).send({ Status: "Error" });
    const sql = "INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)";
    db.query(sql, [nombre, email, hash, userRol], (err) => {
      if (err) return res.status(500).send({ Status: "Error" });
      res.status(200).send({ Status: "Exito" });
    });
  });
});

app.post('/recuperar', (req, res) => {
    const { nombre, email, newPassword } = req.body;
    bcrypt.hash(newPassword, saltRounds, (err, hash) => {
        const sql = "UPDATE usuarios SET password = ? WHERE email = ? AND nombre = ?";
        db.query(sql, [hash, email, nombre], (err, result) => {
            if (err) return res.status(500).send({ Status: "Error" });
            if (result.affectedRows === 0) return res.status(404).send({ Status: "Error", Message: "Datos no coinciden" });
            res.status(200).send({ Status: "Exito" });
        });
    });
});

// --- GESTIÓN DE CLIENTES ---

app.get('/clientes', (req, res) => {
  db.query('SELECT * FROM clientes', (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(200).send(result);
  });
});

app.post('/clientes', (req, res) => {
  const { nombre, email, telefono, direccion } = req.body;
  const sql = 'INSERT INTO clientes (nombre, email, telefono, direccion) VALUES (?, ?, ?, ?)';
  db.query(sql, [nombre, email, telefono, direccion || 'N/A'], (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(200).send(result);
  });
});

app.put('/clientes/:id', (req, res) => {
  const { nombre, email, telefono, direccion } = req.body;
  const sql = 'UPDATE clientes SET nombre=?, email=?, telefono=?, direccion=? WHERE id=?';
  db.query(sql, [nombre, email, telefono, direccion || 'N/A', req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.status(200).send({ Status: "Actualizado" });
  });
});

app.delete('/clientes/:id', (req, res) => {
  db.query('DELETE FROM clientes WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.status(200).send({ Status: "Eliminado" });
  });
});

// --- PERFIL DE USUARIO ---

app.get('/perfil/:email', (req, res) => {
  const sql = "SELECT nombre, email, rol FROM usuarios WHERE email = ?";
  db.query(sql, [req.params.email], (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(200).send(result[0]);
  });
});

app.put('/perfil/actualizar', (req, res) => {
    const { nombre, password, email } = req.body;
    if (password) {
        bcrypt.hash(password, saltRounds, (err, hash) => {
            const sql = "UPDATE usuarios SET nombre = ?, password = ? WHERE email = ?";
            db.query(sql, [nombre, hash, email], (err) => {
                if (err) return res.status(500).send(err);
                const token = jwt.sign({ email, nombre }, JWT_SECRET, { expiresIn: '1h' });
                res.status(200).send({ Status: "Exito", Token: token });
            });
        });
    } else {
        const sql = "UPDATE usuarios SET nombre = ? WHERE email = ?";
        db.query(sql, [nombre, email], (err) => {
            if (err) return res.status(500).send(err);
            const token = jwt.sign({ email, nombre }, JWT_SECRET, { expiresIn: '1h' });
            res.status(200).send({ Status: "Exito", Token: token });
        });
    }
});

// --- CATÁLOGO E INVENTARIO ---

app.get('/api/catalogo', (req, res) => {
    db.query('SELECT * FROM productos', (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(200).send(result);
    });
});

app.delete('/api/productos/:id', (req, res) => {
    db.query('DELETE FROM productos WHERE id_producto = ?', [req.params.id], (err) => {
        if (err) return res.status(500).send(err);
        res.status(200).send({ Status: "Eliminado" });
    });
});

app.post('/api/finalizar-compra', (req, res) => {
    console.log("Compra recibida:", req.body.productos);
    res.status(200).send({ Status: "Exito" });
});

// --- INICIO DEL SERVIDOR ---
app.listen(3001, () => {
  console.log("-----------------------------------------");
  console.log("Servidor de LEVI'S corriendo en puerto 3001 🎀");
  console.log("-----------------------------------------");
});