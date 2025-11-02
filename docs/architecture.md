# Architecture

## Overview

The test generator uses a **framework-agnostic architecture** that separates test logic from framework-specific code generation. This makes it easy to add support for new automation frameworks like Playwright, Puppeteer, Selenium, etc.

## Architecture Layers

```
┌─────────────────────────────────────────┐
│         User-Defined Scenario           │
│  (Framework-agnostic step definitions)  │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────┴──────────────────────┐
│          Core Layer                     │
│  - Step types and validation            │
│  - Scenario structure                   │
│  - Test generator logic                 │
└──────────────────┬──────────────────────┘
                   │
         ┌─────────┴─────────┐
         │                   │
┌────────┴────────┐  ┌──────┴────────┐
│ Cypress Adapter │  │Playwright     │
│                 │  │Adapter        │
│ - Cypress code  │  │               │
│ - cy.* commands │  │- Playwright   │
│ - describe/it   │  │  code         │
└─────────────────┘  │- page.* API   │
                     │- test()       │
                     └───────────────┘
```

## Core Components

### 1. Framework-Agnostic Core (`core/`)

#### `types.ts`
Defines the fundamental data structures:
- **Step**: Describes WHAT to do, not HOW (navigate, click, assertVisible, etc.)
- **Scenario**: A collection of steps with a name and description
- **STEP_REQUIRED_PARAMS**: Maps step types to their required parameters

```typescript
interface Step {
  type: string;
  thenSteps?: Step[];  // For conditionals
  elseSteps?: Step[];
  [key: string]: any;  // Framework-agnostic parameters
}
```

#### `validator.ts`
Framework-agnostic validation logic:
- Validates step types against available types
- Checks required parameters
- Recursively validates nested conditionals
- Works with any framework adapter

#### `adapter.ts`
Defines the adapter interface and base class:
- **FrameworkAdapter**: Interface that all adapters must implement
- **BaseFrameworkAdapter**: Abstract base class with common logic

```typescript
interface FrameworkAdapter {
  name: string;
  fileExtension: string;
  getSupportedStepTypes(): string[];
  generateStepCode(step: Step, indent: number): string;
  generateStepsCode(steps: Step[], indent: number): string;
  wrapInTestStructure(scenario: Scenario, stepsCode: string): string;
  getFileHeader(): string;
}
```

#### `generator.ts`
The main test generator that orchestrates everything:
- Takes any FrameworkAdapter
- Validates scenarios
- Generates test code
- Writes formatted files

### 2. Framework Adapters (`adapters/`)

Each adapter translates framework-agnostic steps into framework-specific code.

#### `cypress.adapter.ts`
Generates Cypress-specific code:
- `navigate` → `cy.visit('url')`
- `click` → `cy.get('selector').click()`
- `assertVisible` → `cy.get('selector').should('be.visible')`
- Conditionals use `cy.get('body').then()` pattern
- Wraps in `describe()/it()` blocks

#### `playwright.adapter.ts`
Generates Playwright-specific code:
- `navigate` → `await page.goto('url')`
- `click` → `await page.locator('selector').click()`
- `assertVisible` → `await expect(page.locator('selector')).toBeVisible()`
- Conditionals use `await page.locator().count()` pattern
- Wraps in `test.describe()/test()` blocks

## Adding a New Framework

To add support for a new framework (e.g., Puppeteer, Selenium, WebdriverIO):

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
    // ... implement all step types
  };

  getFileHeader(): string {
    return `// Your framework's imports\n`;
  }

  wrapInTestStructure(scenario: Scenario, stepsCode: string): string {
    return `// Your framework's test structure\n${stepsCode}`;
  }
}
```

### Step 2: Use the Adapter

```typescript
import { TestGenerator } from './core/generator';
import { YourFrameworkAdapter } from './adapters/yourframework.adapter';

const generator = new TestGenerator(new YourFrameworkAdapter());
generator.generateFile(scenario, './tests/generated.test.ts');
```

That's it! The same scenario will now generate tests for your framework.

## Benefits of This Architecture

### 1. **Single Source of Truth**
Define a scenario once, generate tests for multiple frameworks:

```typescript
const scenario = {
  name: 'Login Test',
  steps: [
    { type: 'navigate', url: 'http://example.com' },
    { type: 'click', selector: '#login' },
  ]
};

// Generate for multiple frameworks
new TestGenerator(new CypressAdapter()).generateFile(scenario, 'cypress.spec.ts');
new TestGenerator(new PlaywrightAdapter()).generateFile(scenario, 'playwright.spec.ts');
new TestGenerator(new PuppeteerAdapter()).generateFile(scenario, 'puppeteer.test.js');
```

### 2. **Framework Flexibility**
- Switch frameworks without rewriting tests
- Compare framework performance with identical tests
- Gradually migrate from one framework to another

### 3. **Easy Extension**
Adding a new step type requires:
1. Add to `STEP_REQUIRED_PARAMS` in `types.ts`
2. Implement in each adapter's `stepGenerators`

### 4. **UI Builder Compatibility**
The UI doesn't need to know about frameworks:
- User builds scenario visually
- User selects target framework(s)
- Generator produces appropriate code

### 5. **Testable**
- Core logic is framework-agnostic (easy to unit test)
- Adapters are isolated (can test code generation separately)
- Validation is centralized

## Example: Multi-Framework Generation

```typescript
const scenario: Scenario = {
  name: 'E-commerce Checkout',
  steps: [
    { type: 'navigate', url: 'https://shop.example.com' },
    {
      type: 'ifExists',
      selector: '.cookie-banner',
      thenSteps: [
        { type: 'click', selector: '.accept' }
      ]
    },
    { type: 'click', selector: '.buy-now' },
    { type: 'assertUrl', url: 'https://shop.example.com/checkout' },
  ]
};

// Generate for all supported frameworks
const adapters = [
  new CypressAdapter(),
  new PlaywrightAdapter(),
  // new PuppeteerAdapter(),
  // new SeleniumAdapter(),
];

adapters.forEach(adapter => {
  const generator = new TestGenerator(adapter);
  generator.generateFile(
    scenario,
    `./${adapter.name}/tests/checkout${adapter.fileExtension}`
  );
});
```

## Design Principles

1. **Separation of Concerns**: Test logic separate from code generation
2. **Open/Closed**: Open for extension (new adapters), closed for modification (core stays stable)
3. **Interface Segregation**: Adapters only implement what they need
4. **Dependency Inversion**: Core depends on adapter interface, not concrete implementations

This architecture makes the test generator truly **framework-agnostic** and **future-proof**!
