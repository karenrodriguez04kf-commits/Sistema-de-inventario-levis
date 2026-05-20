const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Volvemos a tu ruta específica para evitar errores de carga en el frontend
app.use('/images', express.static(path.join(__dirname, 'public/images')));

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

app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientRoutes);
app.use('/api/productos', productRoutes);

app.get('/', (req, res) => {
    res.send(`
        <div style="text-align:center; font-family: sans-serif; margin-top: 50px;">
            <h1 style="color: #c41230;">LEVI'S BACKEND ACTIVE 🚀</h1>
            <p>Servidor en puerto 3002.</p>
        </div>
    `);
});

app.use((err, req, res, next) => {
    console.error("❌ Error interno:", err.stack);
    res.status(500).json({ Status: "Error", Message: "Error en el servidor" });
});

const PORT = 3002;
app.listen(PORT, () => {
    console.log(`✅ Servidor LEVI'S en http://localhost:${PORT}`);
});