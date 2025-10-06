describe('IT Inventory Management System', () => {
    it('should attempt to add an existing user and display the error message', () => {
      cy.visit('/');
  

      cy.get('button').contains('Sign in').click();
      cy.get('input[name="email"]').type(Cypress.env('emails').legitMail);
      cy.get('input[name="password"]').type(Cypress.env('emails').password);
      cy.get('button').contains('Login').click();
  
      cy.get('div').contains('User Management').click();
      cy.get('div').contains('Employees').click();  

      cy.contains('Add Employee').click();
  
      cy.intercept('POST', '/users', {
        statusCode: 500, 
        body: { error: 'User already exists.' },
        delay: 500
      }).as('addExistingUser'); 
  
      cy.get('input[name="firstName"]').type('John');
      cy.get('input[name="lastName"]').type('Doe');
      cy.get('input[name="email"]').type(Cypress.env('emails').valid);
      cy.get('button').contains('Add User').click();
  
      cy.wait('@addExistingUser').then((interception) => {
        expect(interception.response.statusCode).to.equal(500);
        expect(interception.response.body.error).to.equal('User already exists.');
      });
  
      cy.get('.Toastify__toast--error', { timeout: 10000 })
        .should('be.visible')
        .and('contain', 'User already exists.');
    });
  });

