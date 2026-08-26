const usuariosController = require('../../controllers/usuariosController');
const db = require('../../config/db');

// Mockeamos la base de datos para que devuelva un objeto con la función promise().query
jest.mock('../config/db', () => ({
    promise: jest.fn().mockReturnValue({
        query: jest.fn()
    })
}));

describe('Pruebas unitarias para usuariosController (Admin)', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Debe listar los usuarios internos correctamente', async () => {
        const listaUsuarios = [{ id_usuario: 1, nombre: 'Admin', rol: 'admin' }];
        
        // MySQL con .promise().query() devuelve un array donde la primera posición son los registros [rows, fields]
        db.promise().query.mockResolvedValueOnce([listaUsuarios]);

        const req = {};
        const res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };

        await usuariosController.getUsuarios(req, res);

        expect(res.json).toHaveBeenCalledWith(listaUsuarios);
    });

    test('Debe retornar un error 500 si falla al obtener usuarios', async () => {
        db.promise().query.mockRejectedValueOnce(new Error('DB Error'));

        const req = {};
        const res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };

        await usuariosController.getUsuarios(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ mensaje: 'Error al obtener usuarios' });
    });
});