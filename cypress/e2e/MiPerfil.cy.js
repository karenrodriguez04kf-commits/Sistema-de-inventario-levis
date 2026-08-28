describe('Pruebas E2E - CRUD Configuración de Perfil', () => {
  const usuarioConfig = {
    credenciales: {
      correo: 'gabriel@gmail.com',
      password: '123456',
      nombre: 'Gabriel'
    },
    nuevosDatos: {
      telefono: '3001234567',
      direccion: 'Calle Falsa 123, Bogotá, Colombia'
    }
  };

  beforeEach(() => {
    // Manejar automáticamente las alertas emergentes del navegador
    cy.on('window:alert', () => true);

    // 1. Iniciar sesión
    cy.visit('/login');
    cy.get('input[type="email"]').type(usuarioConfig.credenciales.correo);
    cy.get('input[type="password"]').type(usuarioConfig.credenciales.password);
    cy.get('button[type="submit"]').click();

    // 2. Navegar a Mi Perfil
    cy.contains('MI PERFIL').click();

    // 3. Confirmar que la vista cargó correctamente
    cy.contains('Configuración de Perfil').should('be.visible');
  });

  it('R - Debería leer y verificar la información actual del perfil', () => {
    cy.contains('Configuración de Perfil').should('be.visible');
    cy.contains(usuarioConfig.credenciales.correo).should('be.visible');

    // Validar datos precargados en el formulario
    cy.get('input').eq(0).should('have.value', usuarioConfig.credenciales.nombre);
    cy.get('input').eq(2).should('have.value', usuarioConfig.credenciales.correo);
  });

  it('U - Debería actualizar la información del perfil y mantener la persistencia', () => {
    // Interceptar la ruta PUT exacta del servidor
    cy.intercept('PUT', '**/api/auth/perfil/actualizar').as('actualizarPerfil');

    // Validar el texto del mensaje emergente al guardar
    cy.on('window:alert', (mensaje) => {
      expect(mensaje).to.include('¡Perfil actualizado con éxito!');
    });

    // 1. Llenar los campos de contraseña, teléfono y dirección
    cy.get('input[type="password"]').clear().type(usuarioConfig.credenciales.password);
    cy.get('input[placeholder="Escribe tu teléfono"]').clear().type(usuarioConfig.nuevosDatos.telefono);
    cy.get('input[placeholder="Escribe tu dirección"]').clear().type(usuarioConfig.nuevosDatos.direccion);

    // 2. Guardar Cambios
    cy.contains('button', 'GUARDAR CAMBIOS').click();

    // 3. Confirmar que la API en el puerto 3002 responde Status 200 OK
    cy.wait('@actualizarPerfil').its('response.statusCode').should('eq', 200);

    // 4. Validar que la interfaz mantenga los nuevos datos guardados
    cy.get('input[placeholder="Escribe tu teléfono"]').should('have.value', usuarioConfig.nuevosDatos.telefono);
    cy.get('input[placeholder="Escribe tu dirección"]').should('have.value', usuarioConfig.nuevosDatos.direccion);
  });
});