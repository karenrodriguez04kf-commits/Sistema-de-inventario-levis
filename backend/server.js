const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path'); // Solo una vez

// 1. IMPORTACIÓN DE RUTAS
const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();

// 2. MIDDLEWARES GLOBALES
app.use(cors());
app.use(express.json());

// CONFIGURACIÓN DE CARPETA PÚBLICA PARA IMÁGENES
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// 3. CONFIGURACIÓN DE SWAGGER
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: "PROYECTO LEVI'S API",
            version: '1.0.0',
            description: 'Sistema de gestión de inventario y ventas'
        },
        servers: [{ url: 'http://localhost:3002' }]
    },
    apis: ['./routes/*.js'] 
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// 4. REGISTRO DE RUTAS
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientRoutes);
app.use('/api/productos', productRoutes);

// 5. RUTA DE PRUEBA INICIAL
app.get('/', (req, res) => {
    res.send(`
        <div style="text-align:center; font-family: sans-serif; margin-top: 50px;">
            <h1 style="color: #c41230;">LEVI'S BACKEND ACTIVE 🚀</h1>
            <p>El servidor está funcionando correctamente en el puerto 3002.</p>
            <a href="/api-docs" style="color: blue;">Ver Documentación (Swagger)</a>
        </div>
    `);
});

// 6. MANEJO DE ERRORES GLOBAL
app.use((err, req, res, next) => {
    console.error("❌ Error interno:", err.stack);
    res.status(500).json({ Status: "Error", Message: "Ocurrió un error en el servidor" });
});

// 7. ARRANQUE DEL SERVIDOR
const PORT = 3002;
app.listen(PORT, () => {
    console.log("-----------------------------------------");
    console.log(`✅ Servidor LEVI'S listo en http://localhost:${PORT}`);
    console.log(`📖 Documentación: http://localhost:${PORT}/api-docs`);
    console.log("-----------------------------------------");
});