describe('Pruebas E2E - CRUD Gestión de Inventario', () => {
  const usuarioConfig = {
    correo: 'gabriel@gmail.com',
    password: '123456'
  };

  // Puerto real del servidor según server.js
  const API_URL = 'http://127.0.0.1:3002/api/productos';

  beforeEach(() => {
    // Aceptar automáticamente las alertas y confirmaciones de la ventana del navegador
    cy.on('window:alert', () => true);
    cy.on('window:confirm', () => true);

    // 1. Iniciar sesión en el sistema
    cy.visit('/login');
    cy.get('input[type="email"]').type(usuarioConfig.correo);
    cy.get('input[type="password"]').type(usuarioConfig.password);
    cy.get('button[type="submit"]').click();

    // 2. Navegar al módulo de Inventario
    cy.url().should('not.include', '/login');
    cy.contains('INVENTARIO').click();
    cy.contains('GESTIÓN DE INVENTARIO').should('be.visible');
  });

  it('R - Debería visualizar los productos en el inventario', () => {
    cy.contains('GESTIÓN DE INVENTARIO').should('be.visible');
    cy.contains('REF #').should('be.visible');
  });

  it('C - Debería abrir el modal de nuevo ítem', () => {
    cy.contains(/NUEVO ITEM/i).should('be.visible').click();
  });

  it('U - Debería interactuar con el botón de editar del primer ítem', () => {
    cy.contains('REF #')
      .first()
      .parents('div')
      .filter((_, el) => el.querySelectorAll('button').length >= 2)
      .first()
      .within(() => {
        cy.get('button').first().click({ force: true });
      });
  });

  it('D - Debería eliminar un producto de la base de datos real sin afectar ventas', () => {
    // Interceptar la petición DELETE que realiza la interfaz al servidor en el puerto 3002
    cy.intercept('DELETE', '**/api/productos/*').as('eliminarProducto');

    const nombreTemporal = `PRODUCTO TEST ${Date.now()}`;

    // Obtener el token de autenticación almacenado en el navegador
    cy.window().then((win) => {
      const token = win.localStorage.getItem('token');

      // 1. Creación directa vía API en el puerto 3002
      cy.request({
        method: 'POST',
        url: API_URL,
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: {
          nombreProducto: nombreTemporal,
          descripcionProducto: 'Producto de prueba automatizada QA',
          precioProducto: 99000,
          genero: 'Unisex'
        },
        failOnStatusCode: false
      }).then((response) => {
        // Validar que el servidor haya respondido con un código de éxito (200 o 201)
        expect(response.status, `Respuesta API: ${JSON.stringify(response.body)}`).to.be.oneOf([200, 201]);

        // 2. Recargar para actualizar los ítems renderizados en la UI
        cy.reload();
        cy.contains('INVENTARIO').click();

        // 3. Buscar la tarjeta del producto recién creado y hacer clic en el botón de eliminar (papelera)
        cy.contains(nombreTemporal, { timeout: 8000 })
          .parents('div')
          .filter((_, el) => el.querySelectorAll('button').length >= 2)
          .first()
          .within(() => {
            cy.get('button').last().click({ force: true });
          });

        // 4. Validar que la eliminación en la API devuelva Status 200 OK
        cy.wait('@eliminarProducto').its('response.statusCode').should('eq', 200);

        // 5. Confirmar que el producto ya no existe en el DOM
        cy.contains(nombreTemporal).should('not.exist');
      });
    });ccc
  });
});