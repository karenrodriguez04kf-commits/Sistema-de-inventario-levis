describe('Módulo de Gestión de Proveedores - Levis', () => {

  it('Debería permitir crear, modificar y eliminar un proveedor correctamente', () => {

    // 1. Iniciar sesión como administrador
    cy.visit('http://localhost:5173/');
    cy.get('button').contains('INGRESAR A LA TIENDA').click();
    cy.url().should('include', '/login');

    cy.get("input[type='email']").type('gabriel@gmail.com');
    cy.get("input[type='password']").type('123456');
    cy.get('button.btn-login').click();

    // 2. Navegar al módulo de Proveedores desde la barra superior
    cy.url({ timeout: 10000 }).should('include', '/home');
    cy.contains('PROVEEDORES').click();
    cy.url().should('include', '/home/proveedores'); // Ajusta si la ruta es diferente

    // Interceptar alertas nativas para evitar bloqueos
    cy.on('window:alert', (texto) => {
      expect(texto).to.be.a('string');
    });

    // 3. CREAR un nuevo proveedor
    const correoUnico = `proveedor_${Date.now()}@correo.com`;
    cy.get("input[placeholder='NOMBRE']").type('Textiles del Norte S.A.');
    cy.get("input[placeholder='CORREO']").type(correoUnico);
    cy.get("input[placeholder='ROL DEL PROVEEDOR']").type('Distribuidor de Telas');

    cy.get('button.btn-agregar').click();

    // Validar que el proveedor aparece en la tabla
    cy.contains(correoUnico).should('be.visible');

    // 4. MODIFICAR el proveedor recién creado
    cy.contains('tr', correoUnico)
      .find('button.btn-edit')
      .click();

    // Editar los campos de nombre y rol
    cy.get("input[placeholder='NOMBRE']").clear().type('Textiles del Norte Modificado');
    cy.get("input[placeholder='ROL DEL PROVEEDOR']").clear().type('Proveedor Senior Denim');

    // Guardar cambios
    cy.get('button.btn-editar').click();

    // Validar los cambios en la tabla
    cy.contains('tr', correoUnico).should('contain', 'Textiles del Norte Modificado');
    cy.contains('tr', correoUnico).should('contain', 'Proveedor Senior Denim');

    // 5. ELIMINAR el proveedor
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(true);
    });

    cy.contains('tr', correoUnico)
      .find('button.btn-delete')
      .click();

    // Validar que ya no existe en la tabla
    cy.contains(correoUnico).should('not.exist');

    cy.log('¡Prueba E2E de Proveedores completada al 100%! 🛠️');

  });

});