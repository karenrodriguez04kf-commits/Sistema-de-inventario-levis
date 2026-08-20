describe('Prueba E2E - Registro de Usuario', () => {

  it('Debe rechazar el registro cuando la contraseña tiene menos de 6 caracteres', () => {

    cy.visit('http://localhost:5173/');

    cy.get('button').contains('INGRESAR A LA TIENDA').click();

    cy.url().should('include', '/login');

    cy.get('.link-registro').click();

    cy.url().should('include', '/registro');

    cy.intercept('POST', '**/api/auth/register').as('register');

    cy.get("input[placeholder='NOMBRE COMPLETO']")
      .type('Usuario Prueba');

    cy.get("input[placeholder='EMAIL']")
      .type('usuario.prueba@gmail.com');

    cy.get("input[placeholder='CONTRASEÑA']")
      .type('123');

    cy.get('button').contains('CREAR CUENTA').click();

    cy.wait('@register').then((interception) => {

      expect(interception.response.statusCode).to.equal(400);

      expect(interception.response.body.Message)
        .to.equal('La contraseña debe tener mínimo 6 caracteres');

    });

  });


  it('Debe rechazar el registro cuando la contraseña tiene más de 20 caracteres', () => {

    cy.visit('http://localhost:5173/');

    cy.get('button').contains('INGRESAR A LA TIENDA').click();

    cy.url().should('include', '/login');

    cy.get('.link-registro').click();

    cy.url().should('include', '/registro');

    cy.intercept('POST', '**/api/auth/register').as('register');

    cy.get("input[placeholder='NOMBRE COMPLETO']")
      .type('Usuario Prueba');

    cy.get("input[placeholder='EMAIL']")
      .type('usuario.prueba2@gmail.com');

    // 21 caracteres
    cy.get("input[placeholder='CONTRASEÑA']")
      .type('123456789012345678901');

    cy.get('button').contains('CREAR CUENTA').click();

    cy.wait('@register').then((interception) => {

      expect(interception.response.statusCode).to.equal(400);

      expect(interception.response.body.Message)
        .to.equal('La contraseña no puede tener más de 20 caracteres');

    });

  });
  it('Debe rechazar el registro cuando el correo ya está registrado', () => {

  // 1. Visitar la Landing
  cy.visit('http://localhost:5173/');

  // 2. Ir al Login
  cy.get('button').contains('INGRESAR A LA TIENDA').click();

  // 3. Verificar que estamos en Login
  cy.url().should('include', '/login');

  // 4. Ir al formulario de registro
  cy.get('.link-registro').click();

  // 5. Verificar que estamos en Registro
  cy.url().should('include', '/registro');

  // 6. Interceptar la petición de registro
  cy.intercept('POST', '**/api/auth/register').as('register');

  // 7. Ingresar nombre completo
  cy.get("input[placeholder='NOMBRE COMPLETO']")
    .type('rivera');

  // 8. Ingresar un correo que ya existe
  cy.get("input[placeholder='EMAIL']")
    .type('gabriel@gmail.com');

  // 9. Ingresar una contraseña válida
  cy.get("input[placeholder='CONTRASEÑA']")
    .type('12345678');

  // 10. Intentar crear la cuenta
  cy.get('button').contains('CREAR CUENTA').click();

  // 11. Esperar la respuesta del backend
  cy.wait('@register').then((interception) => {

    // 12. Verificar código HTTP
    expect(interception.response.statusCode).to.equal(400);

    // 13. Verificar mensaje de error
    expect(interception.response.body.Message)
      .to.equal('Este correo ya está registrado');

  });

});

});