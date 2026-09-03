describe('Módulo de Gestión de Usuarios - Levis', () => {

  it('Debería permitir crear, modificar y eliminar un usuario correctamente', () => {

    // 1. Iniciar sesión como administrador para tener permisos en la gestión de usuarios
    cy.visit('http://localhost:5173/');
    cy.get('button').contains('INGRESAR A LA TIENDA').click();
    cy.url().should('include', '/login');

    // Usamos una cuenta admin conocida (como 'gabriel@gmail.com' o la que prefieras)
    cy.get("input[type='email']").type('gabriel@gmail.com');
    cy.get("input[type='password']").type('123456');
    cy.get('button.btn-login').click();

    // 2. Navegar al módulo de Gestión de Usuarios desde la barra superior
    cy.url().should('include', '/home');
    cy.contains('GESTIÓN DE USUARIOS').click();
    cy.url().should('include', '/home/usuarios'); // Ajusta la ruta si es distinta en tu router

    // Interceptar alertas nativas para que no bloqueen la prueba
    cy.on('window:alert', (texto) => {
      expect(texto).to.be.a('string');
    });

    // 3. CREAR un nuevo usuario
    const emailUnico = `test_crud_${Date.now()}@correo.com`;
    cy.get("input[placeholder='NOMBRE']").type('Usuario Prueba CRUD');
    cy.get("input[placeholder='EMAIL']").type(emailUnico);
    cy.get("input[placeholder*='CONTRASEÑA']").type('123456');
    cy.get('.select-rol').select('cliente');
    cy.get("input[placeholder='TELÉFONO']").type('3101234567');
    cy.get("input[placeholder='DIRECCIÓN']").type('Calle Falsa 123');

    cy.get('button.btn-agregar').click();

    // Validar que el usuario nuevo aparece en la tabla
    cy.contains(emailUnico).should('be.visible');

    // 4. MODIFICAR el usuario recién creado
    // Localizamos la fila que contiene el email único, buscamos su botón "Editar" y hacemos clic
    cy.contains('tr', emailUnico)
      .find('button.btn-edit')
      .click();

    // Cambiar el nombre y la dirección en el formulario de edición
    cy.get("input[placeholder='NOMBRE']").clear().type('Usuario Editado Levis');
    cy.get("input[placeholder='DIRECCIÓN']").clear().type('Avenida Siempre Viva 742');

    // Guardar los cambios
    cy.get('button.btn-editar').click();

    // Validar que los cambios se reflejan en la tabla
    cy.contains('tr', emailUnico).should('contain', 'Usuario Editado Levis');
    cy.contains('tr', emailUnico).should('contain', 'Avenida Siempre Viva 742');

    // 5. ELIMINAR el usuario
    // Stubear el window.confirm para aceptar automáticamente la confirmación de borrado
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(true);
    });

    cy.contains('tr', emailUnico)
      .find('button.btn-delete')
      .click();

    // Validar que el usuario ya no se encuentra listado en la tabla
    cy.contains(emailUnico).should('not.exist');

    cy.log('¡Prueba E2E de CRUD de Usuarios superada con éxito! 🚀');

  });

});