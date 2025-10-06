describe('IT Request', () => {
  const baseUrl = Cypress.env('baseUrl');
  const emails = Cypress.env('emails');

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit(baseUrl);
  });

  it('Should allow IT Support submit a procurement request to CISO', () => {
    
    cy.contains('Sign in').click();

    cy.get('input[name="email"]').type(emails.legitMail);
    cy.get('input[name="password"]').type(emails.password);

    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/dashboard');
    cy.contains('Procurement Management').click();
    cy.contains('IT Requests').click();
    cy.contains('Add Request').click();
    cy.get('#deviceType').select('Laptops');
    cy.get('#category').select('Category1');
    cy.contains('Save Request').click();
    cy.get('tbody tr').should('be.visible');

    cy.contains('tbody tr', 'Laptops', { matchCase: false }).within(() => {
        
    cy.get('input[type="checkbox"]')
          .should('exist')
          .check()
          .should('be.checked');
      });
    cy.get('button').contains('Submit To Procurement').should('be.visible');

      cy.contains('button', 'Submit To Procurement').click();
      cy.contains('Create Procurement Request').should('be.visible');

      cy.get('textarea')
      .should('be.visible')
      .type('This procurement is necessary for upgrading our IT infrastructure to support increased workload demands.');

    const futureDate = '2025-06-30'; 
    cy.get('input[type="date"]')
      .should('be.visible')
      .clear()
      .type(futureDate);

    cy.contains('Submit Request').click();
  

  });
});
