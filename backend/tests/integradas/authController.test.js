const authController = require('../../controllers/authController');
const db = require('../../config/db');
const bcrypt = require('bcrypt');

jest.mock('../config/db');
jest.mock('bcrypt');

describe('Pruebas para authController', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Debe registrar un usuario correctamente (Caso Exitoso)', () => {

        db.query
            .mockImplementationOnce((sql, params, callback) => {
                callback(null, []); 
            })
            .mockImplementationOnce((sql, params, callback) => {
                callback(null, { insertId: 1 });
            });

        bcrypt.hash.mockImplementation((pass, rounds, callback) => {
            callback(null, 'falsedhash');
        });

        const req = {
            body: { nombre: 'Mauro', email: 'mauro@levis.com', password: 'password123' }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        authController.register(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ Status: "Exito" }));
    });

    test('Debe iniciar sesión correctamente con credenciales válidas', () => {
        const usuarioFalso = [{ 
            id_usuario: 1, 
            email: 'mauro@levis.com', 
            password: '$2b$10$falschash', 
            rol: 'cliente', 
            nombre: 'Mauro' 
        }];
        
        db.query.mockImplementation((sql, params, callback) => {
            callback(null, usuarioFalso);
        });

        bcrypt.compare.mockImplementation((pass, hash, callback) => {
            callback(null, true);
        });

        const req = { body: { email: 'mauro@levis.com', password: 'password123' } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        authController.login(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ Status: "Exito" }));
    });
}); 