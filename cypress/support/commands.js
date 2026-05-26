// Custom Cypress commands

Cypress.Commands.add('loginByUI', (identifier, password) => {
  cy.visit('/login')
  cy.get('[data-testid="identifier-input"]').type(identifier)
  cy.get('[data-testid="password-input"]').type(password)
  cy.get('[data-testid="login-submit"]').click()
})

Cypress.Commands.add('loginByApi', (email, password) => {
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/api/v1/auth/login`,
    body: { identifier: email, password },
    failOnStatusCode: false,
  })
})
