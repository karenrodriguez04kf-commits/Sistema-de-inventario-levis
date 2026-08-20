describe('Prueba E2E - CRUD de Clientes', () => {
  //CREAR CLIENTE
  it('Debe crear un cliente correctamente', () => {

    cy.visit('http://localhost:5173/');

    cy.get('button')
      .contains('INGRESAR A LA TIENDA')
      .click();

    cy.url().should('include', '/login');

    cy.get("input[placeholder='EMAIL']")
      .type('gabriel@gmail.com');

    cy.get("input[placeholder='CONTRASEÑA']")
      .type('123456');

    cy.get('button')
      .contains('INGRESAR')
      .click();

    cy.url().should('include', '/home');

    cy.contains('GESTIÓN DE USUARIOS')
      .click();

    cy.intercept('POST', '**/api/usuarios')
      .as('crearUsuario');

    cy.get("input[placeholder='NOMBRE']")
      .type('Cliente ejemplo');

    cy.get("input[placeholder='EMAIL']")
      .type('cliente.ejemplo@gmail.com');

    cy.get("input[placeholder='CONTRASEÑA']")
      .type('123456');

    cy.get('.select-rol')
      .select('cliente');

    cy.get("input[placeholder='TELÉFONO']")
      .type('3001234567');

    cy.get("input[placeholder='DIRECCIÓN']")
      .type('Calle 123');

    cy.get('button')
      .contains('+ AGREGAR USUARIO')
      .click();

    cy.wait('@crearUsuario').then((interception) => {

      expect(interception.response.statusCode)
        .to.equal(200);

      expect(interception.response.body.mensaje)
        .to.equal('Usuario creado exitosamente');

    });

    cy.contains('Cliente ejemplo')
      .should('be.visible');

    cy.contains('cliente.ejemplo@gmail.com')
      .should('be.visible');

  });
  // ACTUALIZAR CLIENTE
  it('Debe actualizar correctamente los datos de un cliente', () => {

    cy.visit('http://localhost:5173/');

    cy.get('button')
      .contains('INGRESAR A LA TIENDA')
      .click();

    cy.url().should('include', '/login');

    cy.get("input[placeholder='EMAIL']")
      .type('gabriel@gmail.com');

    cy.get("input[placeholder='CONTRASEÑA']")
      .type('123456');

    cy.get('button')
      .contains('INGRESAR')
      .click();

    cy.url().should('include', '/home');

    cy.contains('GESTIÓN DE USUARIOS')
      .click();

    // Buscar el cliente creado
    cy.contains('cliente.ejemplo@gmail.com')
      .parents('tr')
      .within(() => {

        cy.get('.btn-edit')
          .click();

      });

    // Modificar nombre
    cy.get("input[placeholder='NOMBRE']")
      .clear()
      .type('Cliente ejemplo Actualizado');

    // Modificar correo
    cy.get("input[placeholder='EMAIL']")
      .clear()
      .type('cliente.ejemplo.actualizado@gmail.com');

    // Modificar teléfono
    cy.get("input[placeholder='TELÉFONO']")
      .clear()
      .type('3119876543');

    // Modificar dirección
    cy.get("input[placeholder='DIRECCIÓN']")
      .clear()
      .type('Carrera 456');

    cy.intercept('PUT', '**/api/usuarios/*')
      .as('actualizarUsuario');

    cy.get('button')
      .contains('GUARDAR CAMBIOS')
      .click();

    cy.wait('@actualizarUsuario').then((interception) => {

      expect(interception.response.statusCode)
        .to.equal(200);

      expect(interception.response.body.mensaje)
        .to.equal('Usuario actualizado exitosamente');

    });

    cy.contains('Cliente ejemplo Actualizado')
      .should('be.visible');

    cy.contains('cliente.ejemplo.actualizado@gmail.com')
      .should('be.visible');

    cy.contains('3119876543')
      .should('be.visible');

    cy.contains('Carrera 456')
      .should('be.visible');

  });
// ELIMINAR CLIENTE
  it('Debe eliminar correctamente un cliente', () => {

    cy.visit('http://localhost:5173/');

    cy.get('button')
      .contains('INGRESAR A LA TIENDA')
      .click();

    cy.url().should('include', '/login');

    cy.get("input[placeholder='EMAIL']")
      .type('gabriel@gmail.com');

    cy.get("input[placeholder='CONTRASEÑA']")
      .type('123456');

    cy.get('button')
      .contains('INGRESAR')
      .click();

    cy.url().should('include', '/home');

    cy.contains('GESTIÓN DE USUARIOS')
      .click();

    // Interceptar eliminación
    cy.intercept('DELETE', '**/api/usuarios/*')
      .as('eliminarUsuario');

    // Aceptar confirmación
    cy.on('window:confirm', () => true);

    // Buscar cliente
    cy.contains('cliente.ejemplo.actualizado@gmail.com')
      .parents('tr')
      .within(() => {

        cy.get('.btn-delete')
          .click();

      });

    // Verificar respuesta
    cy.wait('@eliminarUsuario').then((interception) => {

      expect(interception.response.statusCode)
        .to.equal(200);

      expect(interception.response.body.mensaje)
        .to.equal('Usuario eliminado exitosamente');

    });

   
    cy.contains('cliente.ejemplo.actualizado@gmail.com')
      .should('not.exist');

  });

});