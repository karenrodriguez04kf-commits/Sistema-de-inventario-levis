describe(' Sistema de Inventario Levis (Compra Talla M)', () => {

  it('Debe iniciar sesión, agregar 1 unidad en talla M al carrito, finalizar compra y verificar reporte de ventas', () => {

    // 1. Visitar la raíz del proyecto (Landing)
    cy.visit('http://localhost:5173/');

    // 2. Hacer clic en el botón de la Landing para ir al Login
    cy.get('button').contains('INGRESAR A LA TIENDA').click();

    // 3. Validar que estamos en la ruta de login y rellenar las credenciales
    cy.url().should('include', '/login');

    cy.get("input[placeholder='EMAIL']").type('gabriel@gmail.com');
    cy.get("input[placeholder='CONTRASEÑA']").type('123456');

    // 4. Enviar el formulario haciendo clic en INGRESAR
    cy.get('button').contains('INGRESAR').click();

    // 5. Validar que ingresó al home
    cy.url().should('include', '/home');

    // 6. Hacer clic en el botón para ver el catálogo
    cy.contains('VER CATÁLOGO').click();

    // 7. Validar que estamos en el catálogo
    cy.url().should('include', '/home/catalogo');

    // 8. Seleccionar el primer producto y añadirlo al carrito
    cy.get('.producto-card')
      .first()
      .find('.btn-add-cart')
      .click();

    // 9. Buscar la talla M y hacer clic en el botón +
    cy.contains('.modal-content div', 'Talla M')
      .parent()
      .find('button')
      .last()
      .click();

    // 10. Confirmar la adición al carrito
    cy.get('.modal-content')
      .contains('AÑADIR AL CARRITO')
      .click();

    // 11. Abrir el carrito
    cy.get('.cart-trigger').click();

    // 12. Hacer clic en el botón PAGAR
    cy.get('button').contains('PAGAR').click();

    // 13. Validar que la compra redirige a mis pedidos
    cy.url({ timeout: 10000 })
      .should('include', '/home/mis-pedidos');

    // 14. Verificar que se visualizan los pedidos usando la clase correcta del componente
    cy.get('.pedido-card-neon').should('exist');

    // Mensaje de éxito
    cy.log('Prueba E2E completada al 100% con éxito :D');

  });

});