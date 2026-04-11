const express = require('express');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tienda_SQL' 
});

db.connect(err => {
    if (err) {
        console.error('Error conectando a MySQL:', err);
        return;
    }
    console.log('Conectado exitosamente a tienda_SQL...');
});

const SECRET_KEY = "mi_clave_secreta_super_segura";

// Middleware
const validarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ mensaje: "Acceso denegado. No hay token." });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ mensaje: "Token expirado o inválido" });
        }
        req.user = user;
        next();
    });
};

//  LOGIN
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const sql = 'SELECT * FROM usuarios WHERE username = ? AND password = ?';
    db.query(sql, [username, password], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (results.length > 0) {
            const token = jwt.sign({ id: results[0].id }, SECRET_KEY, { expiresIn: '2h' });
            res.json({ auth: true, token });
        } else {
            res.status(401).json({ auth: false, message: "Usuario o contraseña incorrectos" });
        }
    });
});

// =============================
// CRUD PRODUCTOS
// =============================

//  LISTAR
app.get('/api/productos', validarToken, (req, res) => {
    const sql = `
        SELECT id_producto, nombreProducto, precioProducto, stockProducto, categoria, talla, color, genero, imagen 
        FROM productos
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

//  AGREGAR
app.post('/api/productos', validarToken, (req, res) => {
    const { 
        nombreProducto, descripcionProducto, precioProducto, 
        stockProducto, estadoProducto, categoria, talla, color, genero, imagen
    } = req.body;

    const sql = `
        INSERT INTO productos 
        (nombreProducto, descripcionProducto, precioProducto, stockProducto, estadoProducto, categoria, talla, color, genero, imagen) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [
        nombreProducto, descripcionProducto, precioProducto,
        stockProducto, estadoProducto, categoria, talla, color, genero, imagen
    ], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Producto guardado" });
    });
});

// EDITAR
app.put('/api/productos/:id', validarToken, (req, res) => {
    const { id } = req.params;

    const { 
        nombreProducto, precioProducto, stockProducto, 
        categoria, talla, color, genero, imagen 
    } = req.body;

    const sql = `
        UPDATE productos SET 
        nombreProducto = ?, 
        precioProducto = ?, 
        stockProducto = ?, 
        categoria = ?, 
        talla = ?, 
        color = ?, 
        genero = ?, 
        imagen = ?
        WHERE id_producto = ?
    `;
    
    db.query(
        sql, 
        [nombreProducto, precioProducto, stockProducto, categoria, talla, color, genero, imagen, id], 
        (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: "Producto actualizado" });
        }
    );
});

//  ELIMINAR
app.delete('/api/productos/:id', validarToken, (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM productos WHERE id_producto = ?';
    db.query(sql, [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Producto eliminado" });
    });
});

// CATÁLOGO (PÚBLICO)
app.get('/api/catalogo', (req, res) => {
    const sql = `
        SELECT id_producto, nombreProducto, precioProducto, stockProducto, categoria, talla, color, genero, imagen
        FROM productos 
        WHERE estadoProducto = 'Activo'
    `;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});
// 🚀 SERVIDOR
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});