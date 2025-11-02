// adapters/cypress.adapter.ts - Cypress-specific implementation

import { BaseFrameworkAdapter } from '../core/adapter';
import { Step, Scenario } from '../core/types';

export class CypressAdapter extends BaseFrameworkAdapter {
  name = 'cypress';
  fileExtension = '.spec.ts';

  protected stepGenerators: Record<string, (step: Step) => string> = {
    // Navigation
    navigate: (step) => `cy.visit('${step.url}');`,

    // Input actions
    fillInput: (step) => `cy.get('${step.selector}').type('${step.value}');`,
    clearInput: (step) => `cy.get('${step.selector}').clear();`,

    // Click actions
    click: (step) => `cy.get('${step.selector}').click();`,
    doubleClick: (step) => `cy.get('${step.selector}').dblclick();`,
    rightClick: (step) => `cy.get('${step.selector}').rightclick();`,

    // Select/Checkbox actions
    select: (step) => `cy.get('${step.selector}').select('${step.value}');`,
    check: (step) => `cy.get('${step.selector}').check();`,
    uncheck: (step) => `cy.get('${step.selector}').uncheck();`,

    // Wait actions
    wait: (step) => `cy.wait(${step.milliseconds});`,
    waitForSelector: (step) => `cy.get('${step.selector}', { timeout: ${step.timeout || 10000} });`,

    // Visibility assertions
    assertVisible: (step) => `cy.get('${step.selector}').should('be.visible');`,
    assertHidden: (step) => `cy.get('${step.selector}').should('not.be.visible');`,
    assertExists: (step) => `cy.get('${step.selector}').should('exist');`,
    assertNotExists: (step) => `cy.get('${step.selector}').should('not.exist');`,

    // Text assertions
    assertText: (step) => `cy.get('${step.selector}').should('contain.text', '${step.text}');`,
    assertExactText: (step) => `cy.get('${step.selector}').should('have.text', '${step.text}');`,
    assertValue: (step) => `cy.get('${step.selector}').should('have.value', '${step.value}');`,

    // State assertions
    assertEnabled: (step) => `cy.get('${step.selector}').should('not.be.disabled');`,
    assertDisabled: (step) => `cy.get('${step.selector}').should('be.disabled');`,
    assertChecked: (step) => `cy.get('${step.selector}').should('be.checked');`,
    assertUnchecked: (step) => `cy.get('${step.selector}').should('not.be.checked');`,
    assertFocused: (step) => `cy.get('${step.selector}').should('have.focus');`,

    // Attribute assertions
    assertAttribute: (step) => `cy.get('${step.selector}').should('have.attr', '${step.attribute}', '${step.value}');`,
    assertClass: (step) => `cy.get('${step.selector}').should('have.class', '${step.className}');`,
    assertCss: (step) => `cy.get('${step.selector}').should('have.css', '${step.property}', '${step.value}');`,

    // URL assertions
    assertUrl: (step) => `cy.url().should('eq', '${step.url}');`,
    assertUrlContains: (step) => `cy.url().should('include', '${step.text}');`,

    // Alert handling
    assertAlert: (step) => `cy.on('window:alert', (text) => { expect(text).to.equal('${step.text}'); });`,

    // Count assertions
    assertCount: (step) => `cy.get('${step.selector}').should('have.length', ${step.count});`,

    // Scroll actions
    scrollTo: (step) => `cy.get('${step.selector}').scrollIntoView();`,
    scrollToTop: () => `cy.scrollTo('top');`,
    scrollToBottom: () => `cy.scrollTo('bottom');`,

    // Screenshot
    screenshot: (step) => `cy.screenshot('${step.name || 'screenshot'}');`,

    // Custom Cypress command
    custom: (step) => step.code,

    // Conditional execution - if element exists
    ifExists: (step) => {
      const thenCode = step.thenSteps ? this.generateStepsCode(step.thenSteps, 6) : '';
      const elseCode = step.elseSteps ? this.generateStepsCode(step.elseSteps, 6) : '';

      return `cy.get('body').then(($body) => {
      if ($body.find('${step.selector}').length > 0) {
${thenCode}
      }${elseCode ? ` else {
${elseCode}
      }` : ''}
    });`;
    },

    // Conditional execution - if element visible
    ifVisible: (step) => {
      const thenCode = step.thenSteps ? this.generateStepsCode(step.thenSteps, 6) : '';
      const elseCode = step.elseSteps ? this.generateStepsCode(step.elseSteps, 6) : '';

      return `cy.get('body').then(($body) => {
      if ($body.find('${step.selector}:visible').length > 0) {
${thenCode}
      }${elseCode ? ` else {
${elseCode}
      }` : ''}
    });`;
    },

    // Conditional execution - if element contains text
    ifContainsText: (step) => {
      const thenCode = step.thenSteps ? this.generateStepsCode(step.thenSteps, 6) : '';
      const elseCode = step.elseSteps ? this.generateStepsCode(step.elseSteps, 6) : '';

      return `cy.get('${step.selector}').then(($el) => {
      if ($el.text().includes('${step.text}')) {
${thenCode}
      }${elseCode ? ` else {
${elseCode}
      }` : ''}
    });`;
    },

    // Conditional execution - if URL contains text
    ifUrlContains: (step) => {
      const thenCode = step.thenSteps ? this.generateStepsCode(step.thenSteps, 6) : '';
      const elseCode = step.elseSteps ? this.generateStepsCode(step.elseSteps, 6) : '';

      return `cy.url().then((url) => {
      if (url.includes('${step.text}')) {
${thenCode}
      }${elseCode ? ` else {
${elseCode}
      }` : ''}
    });`;
    },

    // Conditional execution - if element has attribute
    ifHasAttribute: (step) => {
      const thenCode = step.thenSteps ? this.generateStepsCode(step.thenSteps, 6) : '';
      const elseCode = step.elseSteps ? this.generateStepsCode(step.elseSteps, 6) : '';

      return `cy.get('${step.selector}').then(($el) => {
      if ($el.attr('${step.attribute}') === '${step.value}') {
${thenCode}
      }${elseCode ? ` else {
${elseCode}
      }` : ''}
    });`;
    },

    // Conditional execution - if element has class
    ifHasClass: (step) => {
      const thenCode = step.thenSteps ? this.generateStepsCode(step.thenSteps, 6) : '';
      const elseCode = step.elseSteps ? this.generateStepsCode(step.elseSteps, 6) : '';

      return `cy.get('${step.selector}').then(($el) => {
      if ($el.hasClass('${step.className}')) {
${thenCode}
      }${elseCode ? ` else {
${elseCode}
      }` : ''}
    });`;
    },
  };

  getFileHeader(): string {
    return `/// <reference types="cypress" />\n`;
  }

  wrapInTestStructure(scenario: Scenario, stepsCode: string): string {
    const description = scenario.description || scenario.name;
    return `
describe('${scenario.name}', () => {
  it('${description}', () => {
${stepsCode}
  });
});
`;
  }
}
