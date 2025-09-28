describe('Authentication Flow', () => {
  it('should load the login page and allow a user to attempt login', () => {
    // 1. Vizitează pagina principală (presupunem că pornește pe /auth)
    cy.visit('http://localhost:3000');

    // 2. Găsește câmpurile de email și parolă și introduce date
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');

    // 3. Găsește butonul de login și apasă-l
    cy.contains('button', 'Login').click();
  });
});