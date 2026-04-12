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


const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: "PROYECTO LEVI'S",
      version: '1.0.0',
      description: 'Documentación completa del sistema de gestión'
    },
    servers: [{ url: 'http://localhost:3001' }],
    paths: {
      '/login': {
        post: {
          summary: 'Iniciar sesión',
          responses: { 200: { description: 'Login exitoso' }, 401: { description: 'Error de credenciales' } }
        }
      },
      '/register': {
        post: {
          summary: 'Registrar usuario',
          responses: { 200: { description: 'Usuario creado' } }
        }
      },
      '/recuperar': {
        post: {
          summary: 'Recuperar contraseña',
          responses: { 200: { description: 'Actualización exitosa' } }
        }
      },
      '/perfil/{email}': {
        get: {
          summary: 'Obtener datos del perfil',
          parameters: [{ name: 'email', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Datos del usuario' } }
        }
      },
      '/clientes': {
        get: {
          summary: 'Listar todos los clientes',
          responses: { 200: { description: 'Lista obtenida' } }
        },
        post: {
          summary: 'Crear nuevo cliente',
          responses: { 200: { description: 'Cliente guardado' } }
        }
      },
      '/clientes/{id}': {
        put: {
          summary: 'Actualizar cliente existente',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Cambios guardados' } }
        },
        delete: {
          summary: 'Eliminar cliente',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Cliente borrado' } }
        }
      }
    }
  },
  apis: [] 
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


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
    const sql = "INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)";
    db.query(sql, [nombre, email, hash, userRol], (err) => {
      if (err) return res.status(500).send({ Status: "Error" });
      res.status(200).send({ Status: "Exito" });
    });
  });
});


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


app.get('/perfil/:email', (req, res) => {
  const sql = "SELECT nombre, email, rol FROM usuarios WHERE email = ?";
  db.query(sql, [req.params.email], (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(200).send(result[0]);
  });
});

app.listen(3001, () => {
  console.log("-----------------------------------------");
  console.log("Servidor de LEVI'S corriendo en puerto 3001 🎀");
  console.log("-----------------------------------------");
});