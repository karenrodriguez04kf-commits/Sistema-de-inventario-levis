const productController = require('../controllers/productController');
const db = require('../config/db');

// 1. Simulamos el módulo de la base de datos
jest.mock('../config/db');

describe('Pruebas unitarias para productController', () => {
    
    // Limpiamos los mocks después de cada prueba
    afterEach(() => {
        jest.clearAllMocks();
    });

    // 🟢 CASO POSITIVO: Obtener categorías correctamente
    test('Debe obtener las categorías correctamente (Caso Exitoso)', () => {
        // Arrange (Preparar)
        const categoriasFalsas = [
            { id_categoria: 1, nombre: 'Jeans' },
            { id_categoria: 2, nombre: 'Camisas' }
        ];

        db.query.mockImplementation((sql, callback) => {
            callback(null, categoriasFalsas); // error = null, resultados = categoriasFalsas
        });

        const req = {};
        const res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };

        // Act (Ejecutar)
        productController.getCategorias(req, res);

        // Assert (Comprobar)
        expect(res.json).toHaveBeenCalledWith(categoriasFalsas);
    });

    // 🔴 CASO NEGATIVO: Error en la base de datos al obtener categorías
    test('Debe retornar un error 500 si falla la base de datos (Caso Negativo)', () => {
        // Arrange (Preparar)
        const errorBD = new Error('Error de conexión con MySQL');

        db.query.mockImplementation((sql, callback) => {
            callback(errorBD, null); // error = errorBD, resultados = null
        });

        const req = {};
        const res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };

        // Act (Ejecutar)
        productController.getCategorias(req, res);

        // Assert (Comprobar)
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: errorBD.message });
    });

});
