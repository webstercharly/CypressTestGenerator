# Multi-Framework Test Generator

## Overview

A **framework-agnostic** test generator that creates automated tests for **Cypress, Playwright, and more** from simple, object-based step definitions. Perfect for building UI-driven test builders (similar to Pingdom) where non-technical users can visually construct synthetic tests without writing code.

**Key Advantages:**
- **Multi-Framework**: Write once, generate tests for Cypress, Playwright, Puppeteer, Selenium, etc.
- **UI-Friendly**: Steps are simple JSON objects that can be generated from dropdown menus and form inputs
- **No Syntax to Learn**: Clean, readable structure - no angle brackets, no parsing
- **Type-Safe**: Full TypeScript support with clear interfaces
- **Framework-Agnostic Architecture**: Easily add support for new frameworks
- **Maintainable**: Easy to extend with new step types

## Quick Example

Instead of writing Cypress code or complex syntax, define tests as simple objects:

```typescript
const scenario = {
  name: 'User Login Flow',
  description: 'Test user can login with valid credentials',
  steps: [
    { type: 'navigate', url: 'http://example.com/login' },
    { type: 'fillInput', selector: '#username', value: 'testuser' },
    { type: 'fillInput', selector: '#password', value: 'password123' },
    { type: 'click', selector: '#login-button' },
    { type: 'assertUrl', url: 'http://example.com/dashboard' },
    { type: 'assertVisible', selector: '.welcome-message' },
    { type: 'assertText', selector: '.welcome-message', text: 'Welcome back!' },
  ],
};
```

### Generate for Multiple Frameworks

The **same scenario** generates tests for different frameworks:

```typescript
import { TestGenerator } from './core/generator';
import { CypressAdapter, PlaywrightAdapter } from './adapters';

// Generate Cypress test
new TestGenerator(new CypressAdapter())
  .generateFile(scenario, './cypress/integration/test.spec.ts');

// Generate Playwright test
new TestGenerator(new PlaywrightAdapter())
  .generateFile(scenario, './playwright/tests/test.spec.ts');
```

**Cypress Output:**
```javascript
cy.visit('http://example.com/login');
cy.get('#username').type('testuser');
cy.get('.welcome-message').should('contain.text', 'Welcome back!');
```

**Playwright Output:**
```javascript
await page.goto('http://example.com/login');
await page.locator('#username').fill('testuser');
await expect(page.locator('.welcome-message')).toContainText('Welcome back!');
```

## Features

- **30+ Step Types**: Navigate, fill inputs, click, select, check, wait, assert visibility, assert text, and more
- **Conditional Logic**: Support for if-then-else conditions (ifExists, ifVisible, ifContainsText, etc.)
- **Comprehensive Validation**: Automatic validation of step types and required parameters
- **Pretty Output**: Generated Cypress code is formatted with Prettier
- **Extensible**: Add custom step types easily
- **JSON-Compatible**: Perfect for storing scenarios in databases or config files

## Getting Started

### Installation

```bash
git clone <repository-url>
cd CypressTestGenerator
npm install
```

### Define a Scenario

Edit `index.ts` and modify the scenario object:

```typescript
const scenario = {
  name: 'My Test',
  steps: [
    { type: 'navigate', url: 'https://example.com' },
    { type: 'click', selector: '.button' },
    { type: 'assertVisible', selector: '.success' },
  ],
};
```

### Generate Tests

```bash
npm run generate    # Build and generate tests for all configured frameworks
```

This will generate tests for **both Cypress and Playwright**:
- Cypress: `./cypress/integration/generated.spec.ts`
- Playwright: `./playwright/tests/generated.spec.ts`

### Generate for Specific Framework

```typescript
import { TestGenerator } from './core/generator';
import { CypressAdapter } from './adapters/cypress.adapter';

const generator = new TestGenerator(new CypressAdapter());
generator.generateFile(scenario, './output/test.spec.ts');
```

## Available Step Types

See the complete list in [Usage Guide](docs/usage.md), including:

- **Navigation**: `navigate`
- **Input**: `fillInput`, `clearInput`
- **Click**: `click`, `doubleClick`, `rightClick`
- **Select/Check**: `select`, `check`, `uncheck`
- **Wait**: `wait`, `waitForSelector`
- **Assertions**: `assertVisible`, `assertText`, `assertUrl`, `assertEnabled`, and many more
- **Conditionals**: `ifExists`, `ifVisible`, `ifContainsText`, `ifUrlContains`, `ifHasAttribute`, `ifHasClass`
- **Utility**: `screenshot`, `scrollTo`, `custom`

## Use Cases

### 1. Visual Test Builder UI

Build a drag-and-drop interface where users:
1. Select step types from a dropdown
2. Fill in parameters via forms
3. Reorder steps
4. Preview generated Cypress code
5. Save/load scenarios as JSON

### 2. Automated Monitoring (like Pingdom)

Store synthetic test scenarios in a database and run them periodically:
```typescript
// Fetch from DB
const scenario = await db.getScenario('checkout-flow');

// Generate and run
const cypressCode = generateCypressTest(scenario);
runTest(cypressCode);
```

### 3. Non-Technical Test Creation

QA teams can create tests without knowing Cypress syntax - just fill out forms in a UI.

## Documentation

- [Usage Guide](docs/usage.md) - Complete step reference and examples
- [Building a UI](docs/usage.md#building-a-ui) - How to create a visual test builder

## Example: E-commerce Checkout with Conditionals

```typescript
const scenario = {
  name: 'E-commerce Checkout',
  description: 'Test complete purchase flow with conditional logic',
  steps: [
    { type: 'navigate', url: 'https://shop.example.com/products/laptop' },

    // Handle optional cookie banner
    {
      type: 'ifExists',
      selector: '.cookie-banner',
      thenSteps: [
        { type: 'click', selector: '.accept-cookies' },
      ],
    },

    { type: 'click', selector: '.add-to-cart' },
    { type: 'assertVisible', selector: '.cart-notification' },
    { type: 'click', selector: '.checkout-button' },

    // Check if login required
    {
      type: 'ifUrlContains',
      text: '/login',
      thenSteps: [
        { type: 'fillInput', selector: '#email', value: 'user@example.com' },
        { type: 'fillInput', selector: '#password', value: 'pass123' },
        { type: 'click', selector: '#login-button' },
      ],
    },

    { type: 'fillInput', selector: '#name', value: 'John Doe' },
    { type: 'fillInput', selector: '#email', value: 'john@example.com' },
    { type: 'select', selector: '#country', value: 'USA' },
    { type: 'check', selector: '#terms' },
    { type: 'click', selector: '#submit-order' },

    // Verify success or capture error
    {
      type: 'ifVisible',
      selector: '.success-message',
      thenSteps: [
        { type: 'assertText', selector: '.success-message', text: 'Order placed!' },
        { type: 'screenshot', name: 'order-confirmation' },
      ],
      elseSteps: [
        { type: 'screenshot', name: 'checkout-error' },
      ],
    },
  ],
};
```

## Adding a New Framework

The architecture makes it easy to add support for new frameworks. Here's how to add Puppeteer, Selenium, WebdriverIO, etc.:

### Step 1: Create Adapter

Create `adapters/yourframework.adapter.ts`:

```typescript
import { BaseFrameworkAdapter } from '../core/adapter';
import { Step, Scenario } from '../core/types';

export class YourFrameworkAdapter extends BaseFrameworkAdapter {
  name = 'yourframework';
  fileExtension = '.test.ts';

  protected stepGenerators: Record<string, (step: Step) => string> = {
    navigate: (step) => `// Your framework's navigation code`,
    click: (step) => `// Your framework's click code`,
    assertVisible: (step) => `// Your framework's assertion code`,
    // ... implement all 30+ step types
  };

  getFileHeader(): string {
    return `// Your framework's imports\n`;
  }

  wrapInTestStructure(scenario: Scenario, stepsCode: string): string {
    return `// Your framework's test structure\n${stepsCode}`;
  }
}
```

### Step 2: Use It

```typescript
import { TestGenerator } from './core/generator';
import { YourFrameworkAdapter } from './adapters/yourframework.adapter';

const generator = new TestGenerator(new YourFrameworkAdapter());
generator.generateFile(scenario, './tests/generated.test.ts');
```

That's it! The same scenario now generates tests for your framework.

See [Architecture Documentation](docs/architecture.md) for detailed information about the framework-agnostic design.

## Contributing

Contributions are welcome! Areas where help is needed:
- Additional framework adapters (Puppeteer, Selenium, WebdriverIO, etc.)
- Additional step types
- Validation improvements
- Example UI implementations
- Documentation

## License

ISC License
