const productController = require('../../controllers/productController');
const db = require('../../config/db');

jest.mock('../../config/db');

describe('Pruebas unitarias para productController', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Debe obtener las categorías correctamente', () => {
        const categoriasFalsas = [{ id_categoria: 1, nombre: 'Jeans' }];
        db.query.mockImplementation((sql, callback) => {
            callback(null, categoriasFalsas);
        });

        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        productController.getCategorias(req, res);

        expect(res.json).toHaveBeenCalledWith(categoriasFalsas);
    });

    test('Debe retornar error 500 si falla la base de datos al obtener categorías', () => {
        const errorBD = new Error('Error de conexión');
        db.query.mockImplementation((sql, callback) => {
            callback(errorBD, null);
        });

        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        productController.getCategorias(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: errorBD.message });
    });
});