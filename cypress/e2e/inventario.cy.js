describe('Gestión de Inventario - Levis', () => {

  it('Debería crear una nueva prenda con todos sus campos, editarla y finalmente eliminarla', () => {

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

    // 2. Navegar a "INVENTARIO" desde la barra superior
    cy.url({ timeout: 10000 }).should('include', '/home');
    cy.contains('INVENTARIO').click();
    cy.url().should('include', '/home/inventario');

    // 3. CREAR NUEVA PRENDA
    cy.contains('button', 'NUEVO ITEM').click();
    cy.get('.modal-card').should('be.visible');

    // Llenar datos básicos
    cy.contains('label', 'Nombre de la Referencia').parent().find('input').type('Jeans Test Cypress');
    cy.contains('label', 'Precio (COP)').parent().find('input').type('85000');
    cy.contains('label', 'Color').parent().find('input').type('Azul Oscuro');
    
    // Seleccionar Categoría (usando el índice 1 para elegir la primera opción disponible que no sea "Seleccionar...")
    cy.contains('label', 'Categoría').parent().find('select').select(1);

    // Seleccionar Género
    cy.contains('label', 'Género').parent().find('select').select('Hombre');

    // Seleccionar Proveedor (eligiendo la primera opción disponible en el listado)
    cy.contains('label', 'Proveedor').parent().find('select').select(1);

    // Asignar stock numérico a todas las tallas (L, M, S, XL, XXL según el orden visual)
    cy.contains('label', 'Stock por Talla').parent().within(() => {
      cy.get('input[type="number"]').eq(0).clear().type('10'); // Talla L
      cy.get('input[type="number"]').eq(1).clear().type('15'); // Talla M
      cy.get('input[type="number"]').eq(2).clear().type('20'); // Talla S
      cy.get('input[type="number"]').eq(3).clear().type('5');  // Talla XL
      cy.get('input[type="number"]').eq(4).clear().type('8');  // Talla XXL
    });

    // Guardar creación
    cy.get('.modal-footer').contains('GUARDAR').click();
    cy.wait(1000);

    // 4. EDITAR LA PRENDA CREADA
    cy.contains('.pedido-card-neon', 'Jeans Test Cypress').within(() => {
      cy.get('button.btn-icon.edit').click();
    });

    cy.get('.modal-card').should('be.visible');
    
    // Modificar nombre, precio y actualizar un stock
    cy.contains('label', 'Nombre de la Referencia').parent().find('input').clear().type('Jeans Test Editado');
    cy.contains('label', 'Precio (COP)').parent().find('input').clear().type('90000');

    cy.contains('label', 'Stock por Talla').parent().within(() => {
      cy.get('input[type="number"]').eq(0).clear().type('25'); 
    });

    // Guardar cambios de edición
    cy.get('.modal-footer').contains('GUARDAR').click();
    cy.wait(1000);

    // Verificar actualización visual
    cy.contains('.pedido-card-neon', 'Jeans Test Editado').should('be.visible');

    // 5. ELIMINAR LA PRENDA
    cy.on('window:confirm', () => true);

    cy.contains('.pedido-card-neon', 'Jeans Test Editado').within(() => {
      cy.get('button.btn-icon.delete').click();
    });

    // Verificar que la prenda ya no exista
    cy.contains('Jeans Test Editado').should('not.exist');

    cy.log('¡Prueba E2E completa de Inventario (Crear, Editar, Eliminar con todos los selectores) ejecutada con éxito! 📦🚀');

  });

});