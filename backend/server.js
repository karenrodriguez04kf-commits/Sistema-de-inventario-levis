const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');
const productRoutes = require('./routes/productRoutes');
const proveedorRoutes = require('./routes/proveedorRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');
const ventaRoutes = require('./routes/ventaRoutes');

const app = express();

app.disable('x-powered-by');

app.use(cors({
    origin: [
        'http://localhost:5173', 
        'https://flourishing-pithivier-e57a20.netlify.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use('/images', express.static(path.join(__dirname, 'public/images')));

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: "PROYECTO LEVI'S API",
            version: '1.0.0',
            description: 'Sistema de gestión de inventario y ventas'
        },
        servers: [
            { url: 'http://localhost:3002', description: 'Servidor Local' },
            { url: 'https://' + (process.env.RAILWAY_STATIC_URL || 'tu-backend.railway.app'), description: 'Servidor de Producción' }
        ]
    },
    apis: ['./routes/*.js'] 
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientRoutes);
app.use('/api/productos', productRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/ventas', ventaRoutes);

app.get('/', (req, res) => {
    res.send(`
        <div style="text-align:center; font-family: sans-serif; margin-top: 50px;">
            <h1 style="color: #c41230;">LEVI'S BACKEND ACTIVE 🚀</h1>
            <p>Servidor en puerto ${process.env.PORT || 3002}.</p>
        </div>
    `);
});

app.use((err, req, res, next) => {
    console.error("❌ Error interno:", err.stack);
    res.status(500).json({ Status: "Error", Message: "Ocurrió un error en el servidor" });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, '0.0.0.0', () => {
    console.log("-----------------------------------------");
    console.log(`✅ Servidor LEVI'S listo en el puerto: ${PORT}`);
    console.log(`🚀 Documentación lista`);
    console.log("-----------------------------------------");
});