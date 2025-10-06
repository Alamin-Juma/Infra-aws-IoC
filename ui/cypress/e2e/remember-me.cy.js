describe('Remember Me Functionality', () => {
    const email = Cypress.env('emails').legitMail;
    const password = Cypress.env('emails').password;

    beforeEach(() => {
        cy.visit(`${Cypress.env('baseUrl')}${Cypress.env('loginPath')}`);
    });

    const performLogin = () => {
        cy.get('input[id="email"]').clear().type(email);
        cy.get('input[id="password"]').clear().type(password);
        cy.get('input[type="checkbox"]').check({ force: true });
        cy.get('button[type="submit"]').click();
        cy.contains('Dashboard').should('be.visible');
    };

    const performLogout = () => {
        cy.get('.avatar').click();
        cy.contains('Logout').click();
        cy.url().should('include', `${Cypress.env('loginPath')}`);
    };

    it('should retain email after logout when "Remember Me" is checked', () => {
        performLogin();
        performLogout();
        cy.get('input[id="email"]').should('have.value', email);
    });

    it('should retain password after logout when "Remember Me" is checked', () => {
        performLogin();
        performLogout();
        cy.get('input[id="password"]').should('have.value', password);
    });

    it('should keep "Remember Me" checkbox checked after logout', () => {
        performLogin();
        performLogout();
        cy.get('input[type="checkbox"]').should('be.checked');
    });

    it('should persist credentials after page reload', () => {
        performLogin();
        performLogout();
        cy.reload();
        cy.get('input[id="email"]').should('have.value', email);
        cy.get('input[id="password"]').should('have.value', password);
        cy.get('input[type="checkbox"]').should('be.checked');
    });
});



