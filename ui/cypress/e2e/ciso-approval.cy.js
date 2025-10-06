

describe('CISO Approval - Procurement Request', () => {
  const baseUrl = Cypress.env('baseUrl');
  const emails = Cypress.env('emails');
  const commentText = "Approved for enhanced productivity";

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();

    cy.visit(`${baseUrl}/auth/login`);
    cy.get('input[name="email"]').type(emails.legitMail);
    cy.get('input[name="password"]').type(emails.password);
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/app/dashboard');
  });

  it('should approve a pending procurement request with comment', () => {
   
    cy.intercept('GET', '**/procurements-requests*').as('getRequests');
    cy.contains('Procurement Management').click({ force: true });
    cy.get('[data-test="stateProcurement Requests"]').click();


    cy.wait('@getRequests').its('response.statusCode').should('eq', 200);

    cy.contains('h2', 'Procurements Requests').should('be.visible');

    cy.get('table.min-w-full', { timeout: 10000 })
      .should('be.visible')
      .within(() => {

        cy.contains('span.bg-gray-200', 'Draft', { timeout: 5000 })
          .should('exist')
          .parents('tr')
          .click({ force: true });
      });

    cy.contains('button', 'Approve').click({ force: true });

    cy.get('textarea').type(commentText);

    cy.contains('button', 'Accept').click({ force: true });


cy.get('span.bg-green-200:contains("Approved")')
  .should('exist');
  });
});
