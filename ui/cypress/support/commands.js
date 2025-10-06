/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
Cypress.Commands.add('adminLogin', (email,password)=>{
    cy.visit('/');
    cy.contains('Sign in').click();
    cy.url().should('include', '/auth/login');
    cy.get('input[id="password"]').type(Cypress.env('ADMIN_PASSWORD'));
    cy.get('input[id="email"]').type(Cypress.env('ADMIN_EMAIL'));
    cy.get('button[type="submit"]').click();
    // cy.url().should('not.include', '/auth/login');   
    cy.window().should(win => {
        expect(win.localStorage.getItem('user')).to.exist;
      }); 
});

Cypress.Commands.add('mockITDeviceData',()=>{
  cy.intercept('GET','/deviceTypes*',{
    statusCode: 200,
    body: {
      data: [
        {
          id: 1,
          name: 'Laptop',
          specifications: JSON.stringify([
            {
              specification_id: 1,
              name: 'RAM',
              fieldType: 'select',
              selectOptions: ['8GB','16GB','32GB']
            },
            {
              specification_id: 2,
              name: 'Battery capacity',
              fieldType: 'text'
            },
            {
              specification_id: 3,
              name: 'Screen size',
              fieldType: 'text'
            }
          ])
        },
        {
          id: 2,
          name: 'Monitor',
          specifications: JSON.stringify([
            {
              specification_id: 1,
              name: 'Resolution',
              fieldType: 'select',
              selectOptions: ['1080p','1440p','4K']
            },
            {
              specification_id: 2,
              name: 'Screen size',
              fieldType: 'select',
              selectOptions: ['24"','27"','32"']
            },
            {
              specification_id: 3,
              name: 'Refresh Rate',
              fieldType: 'text'
            }
          ])
        }
      ]
    }
  }).as('getDeviceTypes');

  cy.intercept('GET','/manufacturer',{
    statusCode: 200,
    body:{
      manufacturers: [
        {
          manufacturersId: 1,
          name: 'Dell'
        },
        {
          manufacturersId: 2,
          name: 'Apple'
        },
        {
          manufacturersId: 3,
          name: 'Lenovo'
        }
      ]
    }
  }).as('getManufacturers');
});

Cypress.Commands.add('fillDeviceSpec', (label, value) => {
  cy.contains('label', label).then(($label) => {
    const field = cy.wrap($label.next());
    
    if ($label.next().is('input[type="text"]')) {
      field.clear({ force: true }).type(value);
    } 
    else if ($label.next().is('select')) {
      field.select(value);
    }
    else if ($label.next().is('input[type="checkbox"]')) {
      value ? field.check() : field.uncheck();
    }
  });
});

Cypress.Commands.add('submitDeviceForm', () => {
  cy.get('button').contains('Submit').click();
  cy.get('[data-test="submitAddDeviceForm"]');
});

Cypress.Commands.add('verifySuccessToast', (message) => {
  cy.contains(message).should('be.visible');
});

Cypress.Commands.add('navigateToEditDevice', (serialNumber) => {
  cy.get('table').contains('tr', serialNumber)
    .find('[data-test="editDeviceButton"]')
    .click();
});
