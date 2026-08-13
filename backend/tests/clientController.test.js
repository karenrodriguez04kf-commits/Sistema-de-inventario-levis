const clientController = require('../controllers/clientController');
const db = require('../config/db');

jest.mock('../config/db');

describe('Pruebas unitarias para clientController', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Debe obtener solo los usuarios con rol cliente', () => {
        const clientesFalsos = [{ id_usuario: 1, nombre: 'Cliente 1', rol: 'cliente' }];
        db.query.mockImplementation((sql, callback) => {
            callback(null, clientesFalsos);
        });

        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        clientController.getAllClients(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(clientesFalsos);
    });

    test('Debe eliminar un cliente correctamente', () => {
        db.query.mockImplementation((sql, params, callback) => {
            callback(null, { affectedRows: 1 });
        });

        const req = { params: { id: 1 } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        clientController.deleteClient(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ Status: "Exito" }));
    });
});