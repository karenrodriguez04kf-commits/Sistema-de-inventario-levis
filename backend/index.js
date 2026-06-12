const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'gestion_clientes'
});

app.get('/ciudades', (req, res) => {
  db.query('SELECT * FROM ciudades', (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
});

app.get('/clientes', (req, res) => {
  const sql = `SELECT c.id_cliente, c.nombre, c.apellido, c.email, c.id_ciudad, ciu.nombre_ciudad as ciudad 
               FROM clientes c LEFT JOIN ciudades ciu ON c.id_ciudad = ciu.id_ciudad`;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
});

app.post('/clientes', (req, res) => {
  const { nombre, apellido, email, id_ciudad } = req.body;
  db.query('INSERT INTO clientes (nombre, apellido, email, id_ciudad) VALUES (?,?,?,?)', 
  [nombre, apellido, email, id_ciudad], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
});

app.put('/clientes/:id', (req, res) => {
  const { nombre, apellido, email, id_ciudad } = req.body;
  db.query('UPDATE clientes SET nombre=?, apellido=?, email=?, id_ciudad=? WHERE id_cliente=?', 
  [nombre, apellido, email, id_ciudad, req.params.id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
});

app.delete('/clientes/:id', (req, res) => {
  db.query('DELETE FROM clientes WHERE id_cliente = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
});

app.listen(3001, () => console.log("Servidor en puerto 3001"));