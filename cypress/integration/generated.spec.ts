/// <reference types="cypress" />

describe("User Login Flow", () => {
  it("Test user can login with valid credentials", () => {
    cy.visit("http://example.com/login");
    cy.get("#username").type("testuser");
    cy.get("#password").type("password123");
    cy.get("#login-button").click();
    cy.url().should("eq", "http://example.com/dashboard");
    cy.get(".welcome-message").should("be.visible");
    cy.get(".welcome-message").should(
      "contain.text",
      "Welcome back, testuser!"
    );
  });
});
