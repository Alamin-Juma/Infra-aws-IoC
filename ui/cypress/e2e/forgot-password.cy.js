describe('Forgot Password Page', () => {
    beforeEach(() => {
        cy.visit(`${Cypress.env('baseUrl')}${Cypress.env('forgotPasswordPath')}`);
    });

    it('should display the forgot password form', () => {
        cy.contains('Forgot Password?').should('be.visible');
        cy.get('input[type="email"]').should('be.visible');
        cy.get('button').contains('Submit').should('be.visible');
    });

    it('should show error for empty email submission', () => {
        cy.get('button').contains('Submit').click();
        cy.contains('Please enter your email address.').should('be.visible');
    });

    it('should show error for invalid email format', () => {
        cy.get('input[type="email"]').type(Cypress.env('emails').invalidFormat);
        cy.get('button').contains('Submit').click();
        cy.contains('Please enter a valid email address.').should('be.visible');
    });

    it('should show error for incorrect domain', () => {
        cy.get('input[type="email"]').type(Cypress.env('emails').invalidDomain);
        cy.get('button').contains('Submit').click();
        cy.contains('Please use a valid company email address').should('be.visible');
    });

    it('should submit the form with valid email and show success message', () => {
        cy.intercept('POST', '**/forgot-password', {
            statusCode: 201,
            body: {}
        }).as('forgotPasswordRequest');
        
        cy.get('input[type="email"]').type(Cypress.env('emails').valid);
        cy.get('button').contains('Submit').click();

        cy.wait('@forgotPasswordRequest');
        cy.contains('Request submitted successfully').should('be.visible');
    });

    it('should show error if account does not exist', () => {
        cy.intercept('POST', '**/forgot-password', {
            statusCode: 404,
            body: {}
        }).as('forgotPasswordRequest');
        
        cy.get('input[type="email"]').type(Cypress.env('emails').nonExistent);
        cy.get('button').contains('Submit').click();

        cy.wait('@forgotPasswordRequest');
        cy.contains('The account does not exist. Please contact the system administrator.').should('be.visible');
    });
});

