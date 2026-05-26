describe('Authentication - Login', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should login with valid email and password', () => {
    cy.get('[data-testid="identifier-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('Password123!');
    cy.get('[data-testid="login-submit"]').click();
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="user-menu"]').should('be.visible');
  });

  it('should login with valid username and password', () => {
    cy.get('[data-testid="identifier-input"]').type('john_doe');
    cy.get('[data-testid="password-input"]').type('Password123!');
    cy.get('[data-testid="login-submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should show error for invalid credentials', () => {
    cy.get('[data-testid="identifier-input"]').type('wrong@example.com');
    cy.get('[data-testid="password-input"]').type('wrongpassword');
    cy.get('[data-testid="login-submit"]').click();
    cy.get('[data-testid="error-message"]').should('contain', 'Identifiants incorrects');
  });

  it('should show error for empty fields', () => {
    cy.get('[data-testid="login-submit"]').click();
    cy.get('[data-testid="identifier-error"]').should('be.visible');
    cy.get('[data-testid="password-error"]').should('be.visible');
  });

  it('should toggle password visibility', () => {
    cy.get('[data-testid="password-input"]').type('secret');
    cy.get('[data-testid="password-input"]').should('have.attr', 'type', 'password');
    cy.get('[data-testid="toggle-password"]').click();
    cy.get('[data-testid="password-input"]').should('have.attr', 'type', 'text');
  });

  it('should handle network errors gracefully', () => {
    cy.intercept('POST', '/api/v1/auth/login', { forceNetworkError: true }).as('loginError');
    cy.get('[data-testid="identifier-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('Password123!');
    cy.get('[data-testid="login-submit"]').click();
    cy.get('[data-testid="error-message"]').should('contain', 'Erreur de connexion au serveur');
  });
});
