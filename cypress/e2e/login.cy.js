describe('Prueba End-to-End - Sistema de Inventario Levis (Compra Talla M)', () => {
  it('Debe iniciar sesión, agregar 1 unidad en talla M al carrito, finalizar compra y verificar mis pedidos', () => {
    
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

    // 5. Validar que ingresó al home y hacer clic en el botón para ver el catálogo
    cy.url().should('include', '/home');
    cy.contains('VER CATÁLOGO').click();

    // 6. Validar que estamos en el catálogo
    cy.url().should('include', '/home/catalogo');

    // 7. Seleccionar el primer producto haciendo clic en Añadir al carrito
    cy.get('.producto-card').first().find('.btn-add-cart').click();

    // 8. En el modal q busque la talla M y hacer clic en el botón + 
    cy.contains('.modal-content div', 'Talla M').parent().find('button').last().click();

    // 9. Confirmar la adición haciendo clic en el botón AÑADIR AL CARRITO
    cy.get('.modal-content').contains('AÑADIR AL CARRITO').click();

    // 10. Abrir el carrito
    cy.get('.cart-trigger').click();

    // 11. Hacer clic en el botón PAGAR dentro del carrito
    cy.get('button').contains('PAGAR').click();

    // 12. Validar con un tiempo de espera la compra procesa y redirige a Mis Pedidos
    cy.url({ timeout: 10000 }).should('include', '/home/mis-pedidos');

    // 13. Verificar que se visualiza los pedidos registrados
    cy.get('.pedido-card-neon').should('exist');

    // Mensaje de éxito visible en el panel de Cypress
    cy.log('Prueba E2E completada al 100% con éxito :D');
  });
});