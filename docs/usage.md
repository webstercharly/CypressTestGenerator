# Usage Guide

## Overview

CypressTestGenerator allows you to create Cypress tests using simple, object-based step definitions. This approach is designed to be:

- **UI-friendly**: Easy to generate from a web interface
- **Readable**: No complex syntax to learn
- **Maintainable**: Clear structure that's easy to modify
- **Type-safe**: Full TypeScript support

## Quick Start

### 1. Define Your Scenario

Open `generateCypressTest.ts` and locate the scenario object. A scenario consists of:
- **name**: A descriptive name for your test
- **description** (optional): What the test validates
- **steps**: An array of step objects

Example:

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
    { type: 'assertText', selector: '.welcome-message', text: 'Welcome back, testuser!' },
  ],
};
```

### 2. Run the Generator

```bash
npm run tsc    # Compile TypeScript
npm start      # Generate Cypress test
```

The generator will create a Cypress test file at `./cypress/integration/generated.spec.ts`.

## Available Step Types

### Navigation

```typescript
// Navigate to a URL
{ type: 'navigate', url: 'https://example.com' }
```

### Input Actions

```typescript
// Fill an input field
{ type: 'fillInput', selector: '#email', value: 'user@example.com' }

// Clear an input field
{ type: 'clearInput', selector: '#search' }
```

### Click Actions

```typescript
// Click an element
{ type: 'click', selector: '.submit-button' }

// Double-click
{ type: 'doubleClick', selector: '.item' }

// Right-click
{ type: 'rightClick', selector: '.context-menu-trigger' }
```

### Select & Checkbox

```typescript
// Select from dropdown
{ type: 'select', selector: '#country', value: 'USA' }

// Check a checkbox
{ type: 'check', selector: '#terms' }

// Uncheck a checkbox
{ type: 'uncheck', selector: '#newsletter' }
```

### Wait Actions

```typescript
// Wait for milliseconds
{ type: 'wait', milliseconds: 2000 }

// Wait for element (with optional timeout)
{ type: 'waitForSelector', selector: '.loading-complete', timeout: 5000 }
```

### Visibility Assertions

```typescript
// Assert element is visible
{ type: 'assertVisible', selector: '.success-message' }

// Assert element is hidden
{ type: 'assertHidden', selector: '.error-message' }

// Assert element exists (in DOM but may not be visible)
{ type: 'assertExists', selector: '#hidden-field' }

// Assert element doesn't exist
{ type: 'assertNotExists', selector: '.removed-element' }
```

### Text Assertions

```typescript
// Assert element contains text
{ type: 'assertText', selector: '.title', text: 'Welcome' }

// Assert element has exact text
{ type: 'assertExactText', selector: '.count', text: '5' }

// Assert input/select value
{ type: 'assertValue', selector: '#email', value: 'user@example.com' }
```

### State Assertions

```typescript
// Assert element is enabled
{ type: 'assertEnabled', selector: '#submit-button' }

// Assert element is disabled
{ type: 'assertDisabled', selector: '#disabled-button' }

// Assert checkbox is checked
{ type: 'assertChecked', selector: '#agree' }

// Assert checkbox is unchecked
{ type: 'assertUnchecked', selector: '#disagree' }

// Assert element has focus
{ type: 'assertFocused', selector: '#active-input' }
```

### Attribute Assertions

```typescript
// Assert element has attribute with value
{ type: 'assertAttribute', selector: 'a', attribute: 'href', value: '/home' }

// Assert element has CSS class
{ type: 'assertClass', selector: '.button', className: 'active' }

// Assert element has CSS property
{ type: 'assertCss', selector: '.header', property: 'color', value: 'rgb(255, 0, 0)' }
```

### URL Assertions

```typescript
// Assert exact URL
{ type: 'assertUrl', url: 'https://example.com/dashboard' }

// Assert URL contains text
{ type: 'assertUrlContains', text: '/dashboard' }
```

### Other Assertions

```typescript
// Assert alert text
{ type: 'assertAlert', text: 'Are you sure?' }

// Assert element count
{ type: 'assertCount', selector: '.list-item', count: 5 }
```

### Scroll Actions

```typescript
// Scroll element into view
{ type: 'scrollTo', selector: '#footer' }

// Scroll to top
{ type: 'scrollToTop' }

// Scroll to bottom
{ type: 'scrollToBottom' }
```

### Utility Actions

```typescript
// Take screenshot
{ type: 'screenshot', name: 'login-page' }

// Custom Cypress code (for advanced users)
{ type: 'custom', code: "cy.get('.custom').invoke('show')" }
```

## Complete Example

```typescript
const scenario = {
  name: 'E-commerce Checkout',
  description: 'Test complete purchase flow',
  steps: [
    // Navigate to product page
    { type: 'navigate', url: 'https://shop.example.com/products/laptop' },

    // Add to cart
    { type: 'click', selector: '.add-to-cart' },
    { type: 'assertVisible', selector: '.cart-notification' },

    // Go to checkout
    { type: 'click', selector: '.cart-icon' },
    { type: 'assertUrl', url: 'https://shop.example.com/cart' },
    { type: 'click', selector: '.checkout-button' },

    // Fill shipping info
    { type: 'fillInput', selector: '#name', value: 'John Doe' },
    { type: 'fillInput', selector: '#email', value: 'john@example.com' },
    { type: 'fillInput', selector: '#address', value: '123 Main St' },
    { type: 'select', selector: '#country', value: 'USA' },

    // Submit order
    { type: 'check', selector: '#terms' },
    { type: 'click', selector: '#submit-order' },

    // Verify success
    { type: 'waitForSelector', selector: '.success-message', timeout: 5000 },
    { type: 'assertText', selector: '.success-message', text: 'Order placed successfully!' },
    { type: 'screenshot', name: 'order-confirmation' },
  ],
};
```

## Building a UI

This step-based approach is perfect for building a UI where users can:

1. **Select step type from dropdown** - All types are listed in `stepGenerators`
2. **Fill in parameters via form fields** - Each step type has specific required fields
3. **Reorder steps** - Simple array manipulation
4. **Save/load scenarios** - JSON-compatible structure
5. **Preview generated code** - Call `generateCypressTest(scenario)`

Example UI workflow:
```
1. User clicks "Add Step"
2. Dropdown shows: navigate, fillInput, click, assertVisible, etc.
3. User selects "fillInput"
4. Form shows fields: selector, value
5. User enters: selector="#email", value="test@example.com"
6. Step is added to scenario.steps array
```

## Validation

The generator automatically validates:
- ✓ Scenario has a name
- ✓ Steps array is not empty
- ✓ Each step has a valid type
- ✓ Required parameters are present
- ✓ Clear error messages for debugging

## Tips

- **Use meaningful selectors**: Prefer IDs and data attributes over complex CSS selectors
- **Group related steps**: Keep login, navigation, and assertions organized
- **Add descriptions**: Help others understand what each scenario tests
- **Take screenshots**: Document important states with `screenshot` steps
- **Start simple**: Build basic flows first, then add complexity

## Next Steps

- Review generated tests in `./cypress/integration/generated.spec.ts`
- Run tests with Cypress: `npx cypress open`
- Build a web UI to generate scenarios visually
- Integrate with CI/CD for automated testing
