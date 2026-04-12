
DROP DATABASE IF EXISTS levis_db;
CREATE DATABASE levis_db;
USE levis_db;


CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(50) DEFAULT 'admin'
);


CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    telefono VARCHAR(20),
    direccion VARCHAR(255),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE productos (
  id_producto INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombreProducto VARCHAR(100) NOT NULL,
  descripcionProducto TEXT DEFAULT NULL,
  precioProducto DECIMAL(10,2) NOT NULL,
  talla VARCHAR(10) DEFAULT NULL,
  color VARCHAR(50) DEFAULT NULL,
  stockProducto INT UNSIGNED DEFAULT 0,
  estadoProducto VARCHAR(20) DEFAULT 'Activo',
  id_proveedor INT UNSIGNED DEFAULT NULL,
  genero varchar(20),
  imagen varchar(255)
);

INSERT INTO usuarios (nombre, email, password, rol) 
VALUES ('Karen', 'admin@levis.com', '12345', 'admin');


INSERT INTO clientes (nombre, email, telefono, direccion) VALUES 
('Carlos Pérez', 'carlos@mail.com', '12345', 'N/A'),
('Ana Gómez', 'ana@mail.com', '123456', 'N/A');