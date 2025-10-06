describe('Login Functionality Tests', () => {
  const validUser = {
    email: 'valid.user@example.com',
    password: 'ValidPass123!'
  };

  beforeEach(() => {
    cy.visit(`${Cypress.env('baseUrl')}${Cypress.env('loginPath')}`);
  });

  it('should redirect to dashboard on successful login', () => {
    cy.intercept('POST', '/login', {
      statusCode: 200,
      body: {
        token: 'test-token',
        role: { name: 'user' },
        user: {
          userId: 1,
          firstName: 'Test',
          lastName: 'User',
          email: validUser.email
        }
      }
    }).as('loginRequest');

    cy.get('#email').type(validUser.email);
    cy.get('#password').type(validUser.password);
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/app/dashboard');
    cy.contains('Dashboard').should('be.visible');
  });


  it('should show error for non-existent email', () => {
    const nonExistentEmail = 'nonexistent@example.com';
    
    cy.intercept('POST', '/login', {
      statusCode: 404,
      body: { message: 'Account not found' }
    }).as('loginRequest');

    cy.get('#email').type(nonExistentEmail);
    cy.get('#password').type('anypassword');
    cy.get('button[type="submit"]').click();

    cy.get('.alert-error')
      .should('contain', 'The account does not exist. Please contact the system administrator.');
    cy.get('@loginRequest').its('response.statusCode').should('eq', 404);
  });

  it('should lock account after 5 failed attempts', () => {
    let attemptCount = 0;

    cy.intercept('POST', '/login', (req) => {
      attemptCount++;
      if (attemptCount >= 6) {
        req.reply({
          statusCode: 400,
          body: { message: 'Account locked' }
        });
      } else {
        req.reply({
          statusCode: 400,
          body: { message: 'Invalid credentials' }
        });
      }
    }).as('loginRequest');

    Cypress._.times(6, (index) => {
      cy.get('#email').clear().type(validUser.email);
      cy.get('#password').clear().type(`wrongpass${index}`);
      cy.get('button[type="submit"]').click();
      cy.wait('@loginRequest');
    });


    cy.get('.alert-error span.text-content2')
      .should('contain', 'Your account has been locked. Please contact the system administrator.');
    cy.get('#email').should('not.exist');
    cy.get('#password').should('not.exist');
  });

  
  it('should have disabled login button when form is empty', () => {
    
    cy.get('button[type="submit"]')
      .should('be.disabled');


    cy.get('#email').type('test@example.com');
    cy.get('button[type="submit"]')
      .should('be.disabled');
      
    cy.get('#email').clear();
    cy.get('#password').type('password');
    cy.get('button[type="submit"]')
      .should('be.disabled');
  });

 
});

