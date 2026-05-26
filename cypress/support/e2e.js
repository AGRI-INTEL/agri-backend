require('./commands')

// Optional: add testing-library commands if available
try {
  require('@testing-library/cypress/add-commands')
} catch (e) {
  // optional
}

Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  return false
})
