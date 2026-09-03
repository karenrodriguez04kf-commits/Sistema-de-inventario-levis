describe('Módulo de Reporte de Ventas - Levis', () => {

  it('Debería iniciar sesión, ir a reporte de ventas y desplegar la primera venta', () => {

    // 1. Iniciar sesión como administrador
    cy.visit('http://localhost:5173/');
    cy.get('button').contains('INGRESAR A LA TIENDA').click();
    cy.url().should('include', '/login');

    cy.get("input[type='email']").type('gabriel@gmail.com');
    cy.get("input[type='password']").type('123456');
    cy.get('button.btn-login').click();

    // 2. Navegar a la sección de Reporte de Ventas
    cy.url({ timeout: 10000 }).should('include', '/home');
    cy.contains('REPORTE DE VENTAS').click();
    cy.url().should('include', '/home/reporte-ventas'); // Ajusta la ruta si es distinta

    // 3. Seleccionar (hacer clic en) la primera venta de la lista para desplegar su información
    cy.get('.rv-card-header').first().click();

    // 4. Validar que la sección de productos detallados de esa venta se despliegue correctamente
    cy.get('.rv-productos').should('be.visible');

    cy.log('¡Prueba E2E de Reporte de Ventas completada con éxito! 📈');

  });

});