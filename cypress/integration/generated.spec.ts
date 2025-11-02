/// <reference types="cypress" />

describe("User Login Flow", () => {
  it("Test user can login with valid credentials", () => {
    cy.visit("http://example.com/login");
    cy.get("body").then(($body) => {
      if ($body.find(".cookie-banner").length > 0) {
        cy.get(".accept-cookies").click();
      }
    });
    cy.get("#username").type("testuser");
    cy.get("#password").type("password123");
    cy.get("#login-button").click();
    cy.url().then((url) => {
      if (url.includes("/dashboard")) {
        cy.get(".welcome-message").should("be.visible");
        cy.get(".welcome-message").should("contain.text", "Welcome back!");
      } else {
        cy.get(".error-message").should("be.visible");
        cy.screenshot("login-error");
      }
    });
  });
});
