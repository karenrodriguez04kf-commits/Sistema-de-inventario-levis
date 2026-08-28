const proveedorController = require('../../controllers/proveedorController');
const db = require('../../config/db');

jest.mock('../../config/db');

describe('Pruebas unitarias para proveedorController', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Debe obtener la lista de proveedores correctamente', () => {
        const proveedoresFalsos = [{ id_proveedor: 1, nombre: 'Proveedor A' }];
        db.query.mockImplementation((sql, callback) => {
            callback(null, proveedoresFalsos);
        });

        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        proveedorController.getProveedores(req, res);

        expect(res.json).toHaveBeenCalledWith(proveedoresFalsos);
    });

    test('Debe registrar un nuevo proveedor exitosamente', () => {
        db.query.mockImplementation((sql, params, callback) => {
            callback(null, { insertId: 1 });
        });

        const req = { body: { nombre: 'Prov 1', rol_proveedor: 'Mayorista', correo: 'prov@levis.com' } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        proveedorController.createProveedor(req, res);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ Status: "Exito" }));
    });
});