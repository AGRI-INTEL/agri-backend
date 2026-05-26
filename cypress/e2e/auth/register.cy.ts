describe('Authentication - Register', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it('should complete full registration flow', () => {
    // Étape 1: Informations de compte
    cy.get('[data-testid="username-input"]').type('new_farmer_2024');
    cy.get('[data-testid="email-input"]').type('new@farmer.com');
    cy.get('[data-testid="password-input"]').type('SecurePass123!');
    cy.get('[data-testid="confirm-password-input"]').type('SecurePass123!');
    cy.get('[data-testid="step-1-next"]').click();

    // Étape 2: Informations personnelles
    cy.get('[data-testid="firstname-input"]').type('Jean');
    cy.get('[data-testid="lastname-input"]').type('Dupont');
    cy.get('[data-testid="phone-input"]').type('+33612345678');
    cy.get('[data-testid="step-2-next"]').click();

    // Étape 3: Informations professionnelles
    cy.get('[data-testid="user-type-select"]').select('Agriculteur');
    cy.get('[data-testid="farm-name-input"]').type('Ferme du Soleil');
    cy.get('[data-testid="location-input"]').type('Lyon, France');
    cy.get('[data-testid="step-3-next"]').click();

    // Étape 4: Confirmation
    cy.get('[data-testid="terms-checkbox"]').check();
    cy.get('[data-testid="register-submit"]').click();

    cy.url().should('include', '/verify-email');
    cy.get('[data-testid="success-message"]').should('contain', 'Vérifiez votre email');
  });

  it('should validate password strength', () => {
    cy.get('[data-testid="password-input"]').type('weak');
    cy.get('[data-testid="password-strength"]').should('contain', 'Faible');
    cy.get('[data-testid="password-input"]').clear().type('StrongPass123!');
    cy.get('[data-testid="password-strength"]').should('contain', 'Fort');
  });

  it('should validate matching passwords', () => {
    cy.get('[data-testid="password-input"]').type('Password123!');
    cy.get('[data-testid="confirm-password-input"]').type('DifferentPass123!');
    cy.get('[data-testid="password-match-error"]').should('be.visible');
  });

  it('should validate unique username and email', () => {
    // Mock API pour simuler un utilisateur existant
    cy.intercept('GET', '/api/v1/auth/check-username*', { exists: true });
    cy.get('[data-testid="username-input"]').type('existing_user');
    cy.get('[data-testid="username-error"]').should('contain', "Nom d'utilisateur déjà pris");
  });
});
