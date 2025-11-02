# CypressTestGenerator

## Overview

CypressTestGenerator is a tool designed to create Cypress tests using simple, object-based step definitions. It's perfect for building UI-driven test builders (similar to Pingdom) where non-technical users can visually construct synthetic tests without writing code.

**Key Advantages:**
- **UI-Friendly**: Steps are simple JSON objects that can be generated from dropdown menus and form inputs
- **No Syntax to Learn**: Clean, readable structure - no angle brackets, no parsing
- **Type-Safe**: Full TypeScript support with clear interfaces
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

This generates clean, executable Cypress code automatically.

## Features

- **30+ Step Types**: Navigate, fill inputs, click, select, check, wait, assert visibility, assert text, and more
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

Edit `generateCypressTest.ts` and modify the scenario object:

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

### Generate Cypress Test

```bash
npm run tsc    # Compile TypeScript
npm start      # Generate test file
```

The generated test will be written to `./cypress/integration/generated.spec.ts`.

## Available Step Types

See the complete list in [Usage Guide](docs/usage.md), including:

- **Navigation**: `navigate`
- **Input**: `fillInput`, `clearInput`
- **Click**: `click`, `doubleClick`, `rightClick`
- **Select/Check**: `select`, `check`, `uncheck`
- **Wait**: `wait`, `waitForSelector`
- **Assertions**: `assertVisible`, `assertText`, `assertUrl`, `assertEnabled`, and many more
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

## Example: E-commerce Checkout

```typescript
const scenario = {
  name: 'E-commerce Checkout',
  description: 'Test complete purchase flow',
  steps: [
    { type: 'navigate', url: 'https://shop.example.com/products/laptop' },
    { type: 'click', selector: '.add-to-cart' },
    { type: 'assertVisible', selector: '.cart-notification' },
    { type: 'click', selector: '.checkout-button' },
    { type: 'fillInput', selector: '#name', value: 'John Doe' },
    { type: 'fillInput', selector: '#email', value: 'john@example.com' },
    { type: 'select', selector: '#country', value: 'USA' },
    { type: 'check', selector: '#terms' },
    { type: 'click', selector: '#submit-order' },
    { type: 'waitForSelector', selector: '.success-message', timeout: 5000 },
    { type: 'assertText', selector: '.success-message', text: 'Order placed!' },
    { type: 'screenshot', name: 'order-confirmation' },
  ],
};
```

## Contributing

Contributions are welcome! Areas where help is needed:
- Additional step types
- Validation improvements
- Example UI implementations
- Documentation

## License

ISC License
