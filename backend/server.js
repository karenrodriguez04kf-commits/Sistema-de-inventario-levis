const express = require('express');
const cors = require('cors');
// Importar conexión a la base de datos
const db = require('./config/db');

// Importar todas las rutas del proyecto
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const userRoutes = require('./routes/user.routes');
const inventoryRoutes = require('./routes/inventory.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// 1. CONFIGURACIÓN DE MIDDLEWARES BASE
// ==========================================

// Configuración completa de CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Lectura de cuerpo en formato JSON y URL Encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logger para monitorear cada petición recibida en los logs de Railway
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} -> ${req.url}`);
    next();
});

// ==========================================
// 2. RUTAS Y ENDPOINTS DE LA API
// ==========================================

// Ruta raíz de verificación de estado (Health Check)
app.get('/', (req, res) => {
    res.status(200).json({
        ok: true,
        message: 'API del Sistema de Inventario funcionando correctamente',
        environment: process.env.NODE_ENV || 'production'
    });
});

// Registro de las rutas de la aplicación
app.use('/api/auth', authRoutes);
app.use('/api/productos', productRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/inventario', inventoryRoutes);

// Manejador para rutas no encontradas (404)
app.use((req, res) => {
    res.status(404).json({
        error: true,
        message: `La ruta solicitada [${req.method} ${req.url}] no existe en este servidor.`
    });
});

// ==========================================
// 3. CAPTURA Y CONTROL DE ERRORES GLOBAL
// ==========================================

// Middleware global de manejo de errores HTTP (Evita el desplome con HTTP 502)
app.use((err, req, res, next) => {
    console.error('🔥 Error no controlado en la petición:', err.stack || err);
    
    res.status(err.status || 500).json({
        error: true,
        message: err.message || 'Ocurrió un error interno en el servidor.',
        details: process.env.NODE_ENV === 'development' ? err.stack : null
    });
});

// Capturadores globales del proceso de Node.js (Impiden la caída del contenedor)
process.on('uncaughtException', (error) => {
    console.error('🚨 Excepción no capturada en el proceso (uncaughtException):', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 Promesa rechazada no manejada (unhandledRejection):', reason);
});

// ==========================================
// 4. INICIALIZACIÓN DEL SERVIDOR
// ==========================================

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor ejecutándose exitosamente en el puerto ${PORT}`);
    console.log(`📡 Aceptando conexiones públicas en http://0.0.0.0:${PORT}`);
});