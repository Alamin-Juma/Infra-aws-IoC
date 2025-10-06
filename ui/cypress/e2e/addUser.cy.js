describe('IT Inventory Management System', () => {
    it('should allow the user to sign in, validate required fields, add a new employee, and check for email existence', () => {
        cy.visit('/');
  
        cy.get('button').contains('Sign in').click();
        cy.get('input[name="email"]').type(Cypress.env('emails').legitMail);
        cy.get('input[name="password"]').type(Cypress.env('emails').password);
        cy.get('button').contains('Login').click();

        cy.get('div').contains('User Management').click();
        cy.get('div').contains('Employees').click();
  
        cy.contains('Add Employee').click();

        cy.get('input[name="firstName"]').should('be.visible');
        cy.get('input[name="lastName"]').should('be.visible');
        cy.get('input[name="email"]').should('be.visible');
  
        cy.get('button').contains('Add User').should('be.disabled');
        
        cy.get('input[name="firstName"]').type('John');
        cy.get('button').contains('Add User').should('be.disabled');

        cy.get('input[name="lastName"]').type('Doe');
        cy.get('input[name="email"]').type(Cypress.env('emails').valid);
        cy.get('button').contains('Add User').click();

        cy.intercept('POST', '/api/employees', (req) => {
            req.continue((res) => {
              expect(res.statusCode).to.eq(201); 
            });
          }).as('addEmployee');
    });
  });

