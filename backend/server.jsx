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
    database: 'levis_db' ,
    port: 3307
});

db.connect(err => {
    if (err) {
        console.error('Error conectando a MySQL:', err);
        return;
    }
    console.log('Conectado exitosamente a levis_db...');
});

const SECRET_KEY = "mi_clave_secreta_super_segura";

// Middleware para validar el token
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

// LOGIN
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT * FROM usuarios WHERE email = ? AND password = ?';
    db.query(sql, [email, password], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (results.length > 0) {
            const token = jwt.sign({ id: results[0].id }, SECRET_KEY, { expiresIn: '2h' });
            res.json({ auth: true, token });
        } else {
            res.status(401).json({ auth: false, message: "Usuario o contraseña incorrectos" });
        }
    });
});

// LISTAR
app.get('/api/productos', validarToken, (req, res) => {
    const sql = `
        SELECT id_producto, nombreProducto, precioProducto, stockProducto, categoria, talla, genero, imagen 
        FROM productos
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// AGREGAR
app.post('/api/productos', validarToken, (req, res) => {
    const { 
        nombreProducto, descripcionProducto, precioProducto, 
        stockProducto, categoria, talla, genero, imagen
    } = req.body;

    const sql = `
        INSERT INTO productos 
        (nombreProducto, descripcionProducto, precioProducto, stockProducto, categoria, talla, genero, imagen) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [
        nombreProducto, descripcionProducto, precioProducto,
        stockProducto, categoria, talla, genero, imagen
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
        categoria, talla, genero, imagen 
    } = req.body;

    const sql = `
        UPDATE productos SET 
        nombreProducto = ?, 
        precioProducto = ?, 
        stockProducto = ?, 
        categoria = ?, 
        talla = ?,   
        genero = ?, 
        imagen = ?
        WHERE id_producto = ?
    `;
    
    db.query(
        sql, 
        [nombreProducto, precioProducto, stockProducto, categoria, talla, genero, imagen, id], 
        (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: "Producto actualizado" });
        }
    );
});

// ELIMINAR
app.delete('/api/productos/:id', validarToken, (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM productos WHERE id_producto = ?';
    db.query(sql, [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Producto eliminado" });
    });
});

app.get('/api/catalogo', (req, res) => {
    const sql = `
        SELECT id_producto, nombreProducto, precioProducto, stockProducto, categoria, talla, genero, imagen
        FROM productos
        WHERE stockProducto > 0

    `;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});
// RUTA PARA FINALIZAR COMPRA Y DESCONTAR STOCK
app.post('/api/finalizar-compra', (req, res) => {
    const { productos } = req.body; // El carrito que viene del front

    if (!productos || productos.length === 0) {
        return res.status(400).json({ error: "Carrito vacío" });
    }

    // Iniciamos una conexión para manejar múltiples queries
    db.getConnection((err, connection) => {
        if (err) return res.status(500).json({ error: "Error de conexión" });

        // EMPEZAMOS UNA TRANSACCIÓN (Para que sea seguro)
        connection.beginTransaction(err => {
            if (err) { connection.release(); return res.status(500).json({ error: err }); }

            // 1. Descontar Stock de cada producto
            const queries = productos.map(p => {
                return new Promise((resolve, reject) => {
                    const sqlUpdate = 'UPDATE productos SET stockProducto = stockProducto - ? WHERE id_producto = ?';
                    connection.query(sqlUpdate, [p.cantidad, p.id_producto], (err, result) => {
                        if (err) return reject(err);
                        resolve(result);
                    });
                });
            });

            Promise.all(queries)
                .then(() => {
                    /* --- ESPACIO PARA REGISTRO DE VENTAS ---
                       Mano, aquí es donde más adelante haremos:
                       INSERT INTO ventas (total, fecha) VALUES (...)
                       Y luego registraremos el detalle de cada prenda.
                    */
                    
                    connection.commit(err => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                res.status(500).json({ error: "Error al confirmar la compra" });
                            });
                        }
                        connection.release();
                        res.json({ message: "Stock actualizado correctamente" });
                    });
                })
                .catch(err => {
                    connection.rollback(() => {
                        connection.release();
                        res.status(500).json({ error: "Error procesando productos: " + err.message });
                    });
                });
        });
    });
});

// SERVIDOR
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});