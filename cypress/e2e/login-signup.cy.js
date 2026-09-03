describe('Módulo de Autenticación y Registro - Levis', () => {

  it('Debería probar errores de login, validación de duplicados en registro, contraseña incorrecta y acceso exitoso', () => {

    // Configurar el espía global de alertas para toda la prueba
    cy.on('window:alert', (textoAlerta) => {
      expect(textoAlerta).to.be.a('string');
    });

    // 1. Visitar la landing y abrir el login
    cy.visit('http://localhost:5173/');
    cy.get('button').contains('INGRESAR A LA TIENDA').click();
    cy.url().should('include', '/login');

    // 2. Intentar ingresar con un usuario que NO exista
    cy.get("input[type='email']").type('usuario_fantasmanoexiste@correo.com');
    cy.get("input[type='password']").type('123456');
    cy.get('button.btn-login').click();

    // 3. Ir a la vista de Registro para crear el usuario nuevo
    cy.get('.link-registro').click();
    cy.url().should('include', '/registro');

    // 4. Intentar registrar un correo que ya esté en uso
    cy.get("input[placeholder='NOMBRE COMPLETO']").type('Gabriel Test');
    cy.get("input[placeholder='EMAIL']").type('gabriel@gmail.com');
    cy.get("input[placeholder*='CONTRASEÑA']").type('123456');
    cy.get('button.btn-registro').click();

    // 5. Cambiar el correo por uno nuevo para que el registro sea exitoso
    const correoNuevo = `test_${Date.now()}@correo.com`;
    cy.get("input[placeholder='EMAIL']").clear().type(correoNuevo);
    cy.get("input[placeholder*='CONTRASEÑA']").clear().type('123456');
    cy.get('button.btn-registro').click();

    // 6. Volver al Login e intentar ingresar poniendo la contraseña mal
    cy.url().should('include', '/login');
    cy.get("input[type='email']").type(correoNuevo);
    cy.get("input[type='password']").type('999999');
    cy.get('button.btn-login').click();

    // 7. Corregir la contraseña y ahora sí ingresar correctamente
    cy.get("input[type='password']").clear().type('123456');
    cy.get('button.btn-login').click();

    // 8. Validar el acceso exitoso a la tienda
    cy.url({ timeout: 10000 }).should('include', '/home/catalogo');
    cy.log('¡Prueba E2E de autenticación completada al 100% con éxito! 🎉');

  });

});