// index.ts - Main entry point demonstrating multi-framework support

import { TestGenerator } from './core/generator';
import { CypressAdapter } from './adapters/cypress.adapter';
import { PlaywrightAdapter } from './adapters/playwright.adapter';
import { Scenario } from './core/types';

/**
 * Example scenario - framework-agnostic
 */
const scenario: Scenario = {
  name: 'User Login Flow',
  description: 'Test user can login with valid credentials',
  steps: [
    { type: 'navigate', url: 'http://example.com/login' },

    // Handle optional cookie banner
    {
      type: 'ifExists',
      selector: '.cookie-banner',
      thenSteps: [
        { type: 'click', selector: '.accept-cookies' },
      ],
    },

    { type: 'fillInput', selector: '#username', value: 'testuser' },
    { type: 'fillInput', selector: '#password', value: 'password123' },
    { type: 'click', selector: '#login-button' },

    // Check if login was successful
    {
      type: 'ifUrlContains',
      text: '/dashboard',
      thenSteps: [
        { type: 'assertVisible', selector: '.welcome-message' },
        { type: 'assertText', selector: '.welcome-message', text: 'Welcome back!' },
      ],
      elseSteps: [
        { type: 'assertVisible', selector: '.error-message' },
        { type: 'screenshot', name: 'login-error' },
      ],
    },
  ],
};

// Generate Cypress test
const cypressGenerator = new TestGenerator(new CypressAdapter());
cypressGenerator.generateFile(scenario, './cypress/integration/generated.spec.ts');

// Generate Playwright test
const playwrightGenerator = new TestGenerator(new PlaywrightAdapter());
playwrightGenerator.generateFile(scenario, './playwright/tests/generated.spec.ts');

console.log('\n✓ Generated tests for both Cypress and Playwright!');
console.log('  - Cypress: ./cypress/integration/generated.spec.ts');
console.log('  - Playwright: ./playwright/tests/generated.spec.ts');

// Export for use as module
export { TestGenerator };
export { CypressAdapter, PlaywrightAdapter };
export { Scenario, Step } from './core/types';
