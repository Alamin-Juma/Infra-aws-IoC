describe("External users requests submission page", () => {
  beforeEach(() => {
    cy.visit("/");
  });
  it("Display request submission form on the landing page", () => {
    cy.contains("Welcome to our Inventory Management System.");
    cy.url().should("include", "/");
    cy.get('input[id="email"]');
    cy.get('select[id="requestType"]');
    cy.get('select[id="device"]');
    cy.get('textarea[id="description"]');
    cy.get('button[id="submitRequest"]');
  });

  it("Ensure all required fields are validated", () => {
    cy.get('input[id="email"]');
    cy.get('select[id="requestType"]');
    cy.get('select[id="device"]');
    cy.get('textarea[id="description"]');
    cy.get('button[id="submitRequest"]').click();
    cy.contains("Email is required");
    cy.contains("Request type is required");
    cy.contains("Device selection is required");
    cy.contains("Description is required");
  });

  it("Validate email address format and domain", () => {
    cy.log("TEST_EMAIL", Cypress.env("TEST_EMAIL"));
    cy.get('input[id="email"]').type(Cypress.env("TEST_EMAIL"));
    cy.contains("Only official company email addresses are allowed!");
  });

  it("Check if the email exists in the company's user database", () => {
    cy.get('input[id="email"]').type(Cypress.env("UNKNOWN_USER_EMAIL"));
    cy.get('select[id="requestType"]').should("not.be.disabled");
    cy.get('select[id="requestType"]').select("Requesting a new device");
    cy.get('select[id="device"]').select("Monitor");
    cy.get('textarea[id="description"]').type("I need a new monitor.");
    cy.get('button[id="submitRequest"]').click();   
    cy.contains(`Your email is not recognized in our system. Please contact IT support at ${Cypress.env("SUPPORT_EMAIL")} for assistance.`).should("be.visible");
    cy.contains("OK").click();
    cy.contains(`Your email is not recognized in our system. Please contact IT support at ${Cypress.env("SUPPORT_EMAIL")} for assistance.`).should("not.exist");
  });

  it("Submit the request form successfully", () => {
    cy.get('input[id="email"]').type(`stephen.wahome${Cypress.env("COMPANY_DOMAIN")}`);
    cy.get('select[id="requestType"]').should("not.be.disabled");
    cy.get('select[id="requestType"]').select("Requesting a new device");
    cy.get('select[id="device"]').select("Laptop");
    cy.get('textarea[id="description"]').type("I need a new laptop.");
    cy.get('button[id="submitRequest"]').click();  
    cy.contains("A similar request already exists. Please wait while it is processed.").should("be.visible");
    cy.contains("OK").click();
    cy.contains("A similar request already exists. Please wait while it is processed.").should("not.exist");
  });
});
