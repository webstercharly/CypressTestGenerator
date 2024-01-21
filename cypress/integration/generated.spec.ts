/// <reference types="cypress" />
describe("visit example website", () => {
  it("<visit_url http://example.com>", () => {
    cy.visit("http://example.com");

    cy.get("input.username").type("testuser");
    if (cy.get("welcome_message").should("exist")) {
      cy.get("#submit").click();
    }

    cy.get("page_title").should("contain.text", "Welcome to Example");
  });
});
