describe('Módulo de Mi Perfil - Levis', () => {

  it('Debería modificar los datos del perfil, guardarlos, y luego restaurarlos a sus valores originales', () => {

    // 1. Iniciar sesión como administrador
    cy.visit('http://localhost:5173/');
    cy.get('button').contains('INGRESAR A LA TIENDA').click();
    cy.url().should('include', '/login');

    cy.get("input[type='email']").type('gabriel@gmail.com');
    cy.get("input[type='password']").type('123456');
    cy.get('button.btn-login').click();

    // Interceptar alertas nativas para evitar bloqueos
    cy.on('window:alert', (texto) => {
      expect(texto).to.be.a('string');
    });

    // 2. Navegar a "MI PERFIL" desde la barra superior
    cy.url({ timeout: 10000 }).should('include', '/home');
    cy.contains('MI PERFIL').click();
    cy.url().should('include', '/home/perfil');

    // 3. CAMBIAR TODOS LOS DATOS por unos temporales y guardar
    // Usamos los inputs según su etiqueta correspondiente en el DOM
    cy.contains('label', 'Nombre de Usuario').parent().find('input').clear().type('Gabriel Modificado');
    cy.contains('label', 'Correo Electrónico').parent().find('input').clear().type('gabriel_temporal@correo.com');
    cy.contains('label', 'Teléfono').parent().find('input').clear().type('3109998877');
    cy.contains('label', 'Dirección').parent().find('input').clear().type('Calle 100 # 50-20');

    cy.get('button.btn-perfil-submit').click();

    // Esperar a que redirija tras guardar y volver a entrar a Mi Perfil
    cy.url().should('include', '/home');
    cy.contains('MI PERFIL').click();

    // 4. RESTAURAR LOS DATOS ORIGINALES y volver a guardar
    cy.contains('label', 'Nombre de Usuario').parent().find('input').clear().type('Gabriel el best');
    cy.contains('label', 'Correo Electrónico').parent().find('input').clear().type('gabriel@gmail.com');
    cy.contains('label', 'Teléfono').parent().find('input').clear().type('3007801355');
    cy.contains('label', 'Dirección').parent().find('input').clear().type('carrera 78 # 4');

    cy.get('button.btn-perfil-submit').click();

    // Validar que se restauró correctamente volviendo a entrar al perfil
    cy.url().should('include', '/home');
    cy.contains('MI PERFIL').click();
    cy.contains('label', 'Correo Electrónico').parent().find('input').should('have.value', 'gabriel@gmail.com');

    cy.log('¡Prueba E2E de Mi Perfil completada y restaurada exitosamente! 👤✨');

  });

});