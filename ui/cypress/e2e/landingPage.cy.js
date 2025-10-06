describe("Test landing page",()=>{
    it("Test landing page",()=>{
        cy.visit("/");
        cy.contains("Welcome to our Inventory Management System.");
    });
});
