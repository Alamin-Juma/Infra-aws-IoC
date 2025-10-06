describe("Device Management", () => {
  const email = Cypress.env("ADMIN_EMAIL");
  const password = Cypress.env("ADMIN_PASSWORD");
  const serialNumber = Cypress.env("SERIAL_NUMBER");
  const selectedManufacturer = Cypress.env("SELECTED_MANUFACTURER");
  const not_selectedManufacturer = Cypress.env("NOT_SELECTED_MANUFACTURER");
  const selectedDeviceType = Cypress.env("SELECTED_DEVICE_TYPE");
  const not_selectedDeviceType = Cypress.env("NOT_SELECTED_DEVICE_TYPE");
  const deviceToAdd = Cypress.env("DEVICE_TO_ADD");
  const randomSerialNumber = "SN" + Math.random().toString(36).substring(2, 10).toUpperCase();
  const userToAssign = Cypress.env("USER_TO_ASSIGN");

  beforeEach(() => {
    cy.adminLogin(email, password);
  });

  it("Should navigate to devices page", () => {
    cy.visit("/app/inventory/devices");
    cy.url().should("include", "/app/inventory/devices");
  });

  it("List all devices in the system", () => {
    cy.visit("/app/inventory/devices");
    cy.get("table").should("exist");
    cy.get("tbody tr").should("have.length.greaterThan", 0);
    cy.get("thead tr th").should("have.length.greaterThan", 0);
    cy.get("thead tr th").eq(0).should("contain", "Serial No.");
    cy.get("thead tr th").eq(1).should("contain", "Manufacturer");
    cy.get("thead tr th").eq(2).should("contain", "Type");
    cy.get("thead tr th").eq(3).should("contain", "Status");
    cy.get("thead tr th").eq(4).should("contain", "Condition");
    cy.get("thead tr th").eq(5).should("contain", "Actions");
  });

  it("Should search for a device by serial number", () => {
    cy.visit("/app/inventory/devices");
    cy.get('input[placeholder="Search serial number..."]').type(serialNumber);
    cy.get("table tbody tr").should("have.length", 1);
    cy.get("table tbody tr")
      .eq(0)
      .find("td")
      .eq(0)
      .should("contain", serialNumber);
  });

  it("Filter Devices by Manufacturer", () => {
    cy.visit("/app/inventory/devices");
    cy.get('select[id="manufacturerFilter"]').select(selectedManufacturer);
    cy.get("#manufacturerFilter").select(selectedManufacturer);
    cy.get("table tbody tr").should("have.length.greaterThan", 0);
    cy.get("table tbody tr").each((row) => {
      cy.wrap(row).contains("td", selectedManufacturer);
    });
    cy.get("table tbody tr").each((row) => {
      cy.wrap(row)
        .find("td")
        .eq(1)
        .should("not.contain", not_selectedManufacturer);
    });
  });

  it("Filter devices by device type", () => {
    cy.visit("/app/inventory/devices");
    cy.get('select[id="deviceTypeFilter"]').select(selectedDeviceType);
    cy.get("table tbody tr").should("have.length.greaterThan", 0);
    cy.get("table tbody tr").each((row) => {
      cy.wrap(row)
        .find("td")
        .eq(2)
        .should("not.contain", not_selectedDeviceType);
    });
  });

  it("Pagination", () => {
    cy.visit("/app/inventory/devices");
    cy.get('[data-test="devicesPagination-select"]').select("10");
    cy.get("table tbody tr").should("have.length.lte", 10);

    cy.get('[data-test="devicesPagination-select"]').select("20");
    cy.get("table tbody tr").should("have.length.lte", 20);

    cy.get('[data-test="devicesPagination-select"]').select("50");
    cy.get("table tbody tr").should("have.length.lte", 50);

    cy.get('[data-test="devicesPagination-select"]').select("100");
    cy.get("table tbody tr").should("have.length.lte", 100);
  });

  it("Add a Device", () => {
    cy.visit("/app/inventory/devices");
    cy.get('[data-test="addDeviceButton"]').click();
    cy.mockITDeviceData();

    cy.get('[data-test="deviceType"]').select('1');
    cy.get('[data-test="serialNumber"]').type(randomSerialNumber);
    cy.get('select[name="manufacturer"]').select('Dell');

    cy.fillDeviceSpec('Battery capacity','100W');
    cy.fillDeviceSpec('RAM','16GB');
    cy.fillDeviceSpec('Screen size','32"');

    cy.get('[data-test="submitAddDeviceForm"]').click();
    cy.contains('Device registered successfully!');
  });

  it("Edit a Device",()=>{
    cy.visit("/app/inventory/devices");
    cy.get('table tbody tr:first-child [data-test="editDeviceDetails"]').click();
    cy.get('[data-test="serialNumberInput"]').clear({force:true}).type(randomSerialNumber);
    cy.get('[data-test="editDeviceDetailsButton"]').click();
    cy.contains('Device updated successfully');
  });

  it("View Device Details", () => {
    cy.visit("/app/inventory/devices");
    cy.get("table tbody tr:first-child td:nth-child(1)")
      .invoke("text")
      .then((deviceSerialNumber) => {
        deviceSerialNumber = deviceSerialNumber.trim();
        cy.get(
          'table tbody tr:first-child [data-test="viewDeviceDetails"]'
        ).click();
        cy.url().should('include','/app/inventory/device-details');
    });
  });

  it('Check Active State Highlighting',()=>{
    cy.visit("/app/inventory/devices");
    cy.get('[data-test="stateDevices"]').should('have.class','active');
  });

  it.skip('Assign and Unassign a device',()=>{
    cy.visit("/app/inventory/devices");
    cy.get(`table tbody tr:first-child [data-test="viewDeviceDetails"]`).click();
    cy.url().should('include','/app/inventory/device-details');
    cy.get('[data-test="assignDevicesButton"]').invoke('text').then((buttonLabel)=>{
        if (buttonLabel !== 'Assign User') {
            cy.get('[data-test="assignDevicesButton"]').click();
            cy.get('[data-test="confirmDeviceUnAssignment"]').click();
            cy.wait(3000);  
            cy.contains('OK').click();
        }
    });
    cy.get('[data-test="assignDevicesButton"]').click();
    cy.get('[data-test="searchUserInput"]').type(userToAssign).get('[data-test="individualAssignee"]').eq(0).click();
    cy.get('[data-test="assignButton"]').click();
    cy.contains('Are you sure?');
    cy.contains(`This device will be assigned to ${userToAssign} as the current user!`);
    cy.get('[data-test="cancelDeviceAssignment"]').click();
    cy.contains("Are you sure?").should('not.exist');

    cy.get('[data-test="searchUserInput"]').clear({force:true}).type(userToAssign).get('[data-test="individualAssignee"]').eq(0).click();
    cy.get('[data-test="assignButton"]').click();
    cy.get('[data-test="confirmDeviceAssignment"]').click();
    cy.contains('Please wait while the device is being assigned.');
    cy.contains('Device Assigned successfully.');

    cy.get('[data-test="assignDevicesButton"]').invoke('text').should('eq','Unassign Device');
    cy.get('[data-test="assignDevicesButton"]').click();
    cy.contains('Are you sure?');
    cy.contains(`This will remove`);
    cy.get('[data-test="confirmDeviceUnAssignment"]').click();
    cy.contains('Please wait while the device is being unassigned.');
    cy.contains('Device unassigned successfully.');
  });

  it('Click on Back Button to Devices Page', () => {
    cy.visit("/app/inventory/devices");
    cy.get('table tbody tr:first-child [data-test="viewDeviceDetails"]').click();
    cy.url().should('contain','/app/inventory/device-details');
    cy.get('[data-test="backButton"]').click();
    cy.url().should('not.contain','/app/inventory/device-details');
    cy.url().should('contain','/app/inventory/devices');
  });

  it('View Device Assignment/Unassignment History', () => {
    cy.visit("/app/inventory/devices");
    cy.get('table tbody tr:first-child [data-test="viewDeviceDetails"]').click();
    cy.url().should('contain','/app/inventory/device-details');
    cy.get('[data-test="historyTable"]');
    cy.get("table tbody tr").should("have.length.gte", 0);

    cy.get('table tbody tr')?.its('length').then((rowCount)=>{
      console.log(rowCount);      
      if (rowCount > 1) {
        cy.get('thead tr th').eq(0).should('contain','Action');
        cy.get('thead tr th').eq(1).should('contain','Notes');
        cy.get('thead tr th').eq(2).should('contain','Performed By');
        cy.get('thead tr th').eq(4).should('contain','Date');
      }else{
        cy.contains("No History Found");
      }
    });
  });
});
