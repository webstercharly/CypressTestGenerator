// adapters/playwright.adapter.ts - Playwright-specific implementation

import { BaseFrameworkAdapter } from '../core/adapter';
import { Step, Scenario } from '../core/types';

export class PlaywrightAdapter extends BaseFrameworkAdapter {
  name = 'playwright';
  fileExtension = '.spec.ts';

  protected stepGenerators: Record<string, (step: Step) => string> = {
    // Navigation
    navigate: (step) => `await page.goto('${step.url}');`,

    // Input actions
    fillInput: (step) => `await page.locator('${step.selector}').fill('${step.value}');`,
    clearInput: (step) => `await page.locator('${step.selector}').clear();`,

    // Click actions
    click: (step) => `await page.locator('${step.selector}').click();`,
    doubleClick: (step) => `await page.locator('${step.selector}').dblclick();`,
    rightClick: (step) => `await page.locator('${step.selector}').click({ button: 'right' });`,

    // Select/Checkbox actions
    select: (step) => `await page.locator('${step.selector}').selectOption('${step.value}');`,
    check: (step) => `await page.locator('${step.selector}').check();`,
    uncheck: (step) => `await page.locator('${step.selector}').uncheck();`,

    // Wait actions
    wait: (step) => `await page.waitForTimeout(${step.milliseconds});`,
    waitForSelector: (step) => `await page.locator('${step.selector}').waitFor({ timeout: ${step.timeout || 10000} });`,

    // Visibility assertions
    assertVisible: (step) => `await expect(page.locator('${step.selector}')).toBeVisible();`,
    assertHidden: (step) => `await expect(page.locator('${step.selector}')).toBeHidden();`,
    assertExists: (step) => `await expect(page.locator('${step.selector}')).toHaveCount(1);`,
    assertNotExists: (step) => `await expect(page.locator('${step.selector}')).toHaveCount(0);`,

    // Text assertions
    assertText: (step) => `await expect(page.locator('${step.selector}')).toContainText('${step.text}');`,
    assertExactText: (step) => `await expect(page.locator('${step.selector}')).toHaveText('${step.text}');`,
    assertValue: (step) => `await expect(page.locator('${step.selector}')).toHaveValue('${step.value}');`,

    // State assertions
    assertEnabled: (step) => `await expect(page.locator('${step.selector}')).toBeEnabled();`,
    assertDisabled: (step) => `await expect(page.locator('${step.selector}')).toBeDisabled();`,
    assertChecked: (step) => `await expect(page.locator('${step.selector}')).toBeChecked();`,
    assertUnchecked: (step) => `await expect(page.locator('${step.selector}')).not.toBeChecked();`,
    assertFocused: (step) => `await expect(page.locator('${step.selector}')).toBeFocused();`,

    // Attribute assertions
    assertAttribute: (step) => `await expect(page.locator('${step.selector}')).toHaveAttribute('${step.attribute}', '${step.value}');`,
    assertClass: (step) => `await expect(page.locator('${step.selector}')).toHaveClass(/${step.className}/);`,
    assertCss: (step) => `await expect(page.locator('${step.selector}')).toHaveCSS('${step.property}', '${step.value}');`,

    // URL assertions
    assertUrl: (step) => `await expect(page).toHaveURL('${step.url}');`,
    assertUrlContains: (step) => `await expect(page).toHaveURL(/${step.text}/);`,

    // Alert handling
    assertAlert: (step) => `page.on('dialog', async dialog => { expect(dialog.message()).toBe('${step.text}'); await dialog.accept(); });`,

    // Count assertions
    assertCount: (step) => `await expect(page.locator('${step.selector}')).toHaveCount(${step.count});`,

    // Scroll actions
    scrollTo: (step) => `await page.locator('${step.selector}').scrollIntoViewIfNeeded();`,
    scrollToTop: () => `await page.evaluate(() => window.scrollTo(0, 0));`,
    scrollToBottom: () => `await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));`,

    // Screenshot
    screenshot: (step) => `await page.screenshot({ path: '${step.name || 'screenshot'}.png' });`,

    // Custom Playwright code
    custom: (step) => step.code,

    // Conditional execution - if element exists
    ifExists: (step) => {
      const thenCode = step.thenSteps ? this.generateStepsCode(step.thenSteps, 4) : '';
      const elseCode = step.elseSteps ? this.generateStepsCode(step.elseSteps, 4) : '';

      return `const elementCount = await page.locator('${step.selector}').count();
  if (elementCount > 0) {
${thenCode}
  }${elseCode ? ` else {
${elseCode}
  }` : ''}`;
    },

    // Conditional execution - if element visible
    ifVisible: (step) => {
      const thenCode = step.thenSteps ? this.generateStepsCode(step.thenSteps, 4) : '';
      const elseCode = step.elseSteps ? this.generateStepsCode(step.elseSteps, 4) : '';

      return `const isVisible = await page.locator('${step.selector}').isVisible().catch(() => false);
  if (isVisible) {
${thenCode}
  }${elseCode ? ` else {
${elseCode}
  }` : ''}`;
    },

    // Conditional execution - if element contains text
    ifContainsText: (step) => {
      const thenCode = step.thenSteps ? this.generateStepsCode(step.thenSteps, 4) : '';
      const elseCode = step.elseSteps ? this.generateStepsCode(step.elseSteps, 4) : '';

      return `const text = await page.locator('${step.selector}').textContent();
  if (text && text.includes('${step.text}')) {
${thenCode}
  }${elseCode ? ` else {
${elseCode}
  }` : ''}`;
    },

    // Conditional execution - if URL contains text
    ifUrlContains: (step) => {
      const thenCode = step.thenSteps ? this.generateStepsCode(step.thenSteps, 4) : '';
      const elseCode = step.elseSteps ? this.generateStepsCode(step.elseSteps, 4) : '';

      return `const url = page.url();
  if (url.includes('${step.text}')) {
${thenCode}
  }${elseCode ? ` else {
${elseCode}
  }` : ''}`;
    },

    // Conditional execution - if element has attribute
    ifHasAttribute: (step) => {
      const thenCode = step.thenSteps ? this.generateStepsCode(step.thenSteps, 4) : '';
      const elseCode = step.elseSteps ? this.generateStepsCode(step.elseSteps, 4) : '';

      return `const attrValue = await page.locator('${step.selector}').getAttribute('${step.attribute}');
  if (attrValue === '${step.value}') {
${thenCode}
  }${elseCode ? ` else {
${elseCode}
  }` : ''}`;
    },

    // Conditional execution - if element has class
    ifHasClass: (step) => {
      const thenCode = step.thenSteps ? this.generateStepsCode(step.thenSteps, 4) : '';
      const elseCode = step.elseSteps ? this.generateStepsCode(step.elseSteps, 4) : '';

      return `const className = await page.locator('${step.selector}').getAttribute('class');
  if (className && className.includes('${step.className}')) {
${thenCode}
  }${elseCode ? ` else {
${elseCode}
  }` : ''}`;
    },
  };

  getFileHeader(): string {
    return `import { test, expect } from '@playwright/test';\n`;
  }

  wrapInTestStructure(scenario: Scenario, stepsCode: string): string {
    const description = scenario.description || scenario.name;
    return `
test.describe('${scenario.name}', () => {
  test('${description}', async ({ page }) => {
${stepsCode}
  });
});
`;
  }
}
