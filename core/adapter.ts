// core/adapter.ts - Framework adapter interface (v2 with conditional extraction)

import { Step, Scenario } from './types';

/**
 * Framework adapter interface
 * Each testing framework (Cypress, Playwright, Puppeteer, etc.) implements this
 */
export interface FrameworkAdapter {
  /**
   * Name of the framework (e.g., 'cypress', 'playwright')
   */
  name: string;

  /**
   * File extension for generated test files (e.g., '.spec.ts', '.test.ts')
   */
  fileExtension: string;

  /**
   * List of supported step types
   */
  getSupportedStepTypes(): string[];

  /**
   * Generate code for a single step
   */
  generateStepCode(step: Step, indent: number): string;

  /**
   * Generate code for multiple steps (handles nesting)
   */
  generateStepsCode(steps: Step[], indent: number): string;

  /**
   * Wrap steps in a test structure (describe/it, test(), etc.)
   */
  wrapInTestStructure(scenario: Scenario, stepsCode: string): string;

  /**
   * Get any file header (imports, reference comments, etc.)
   */
  getFileHeader(): string;
}

/**
 * Conditional wrapper strategies
 */
export interface ConditionalStrategy {
  wrapElementCheck(selector: string, thenCode: string, elseCode: string): string;
  wrapVisibilityCheck(selector: string, thenCode: string, elseCode: string): string;
  wrapTextCheck(selector: string, text: string, thenCode: string, elseCode: string): string;
  wrapUrlCheck(text: string, thenCode: string, elseCode: string): string;
  wrapAttributeCheck(selector: string, attribute: string, value: string, thenCode: string, elseCode: string): string;
  wrapClassCheck(selector: string, className: string, thenCode: string, elseCode: string): string;
}

/**
 * Abstract base class with common functionality
 * Extracts conditional logic to reduce 200+ lines of duplication
 */
export abstract class BaseFrameworkAdapter implements FrameworkAdapter {
  abstract name: string;
  abstract fileExtension: string;

  protected abstract stepGenerators: Record<string, (step: Step) => string>;
  protected abstract conditionalStrategy: ConditionalStrategy;

  getSupportedStepTypes(): string[] {
    return Object.keys(this.stepGenerators);
  }

  generateStepCode(step: Step, indent: number = 4): string {
    const generator = this.stepGenerators[step.type];
    if (!generator) {
      throw new Error(`Unknown step type: ${step.type}`);
    }
    return generator(step);
  }

  generateStepsCode(steps: Step[], indent: number = 4): string {
    const indentStr = ' '.repeat(indent);
    return steps
      .map((step) => {
        const code = this.generateStepCode(step, indent);
        // Handle multi-line code from conditionals
        return code.split('\n').map(line => `${indentStr}${line}`).join('\n');
      })
      .join('\n');
  }

  /**
   * Shared conditional logic - reduces duplication across adapters
   */
  protected generateConditional(
    wrapperFn: (thenCode: string, elseCode: string) => string,
    step: Step
  ): string {
    const thenCode = step.thenSteps
      ? this.generateStepsCode(step.thenSteps, 6)
      : '';

    const elseCode = step.elseSteps
      ? this.generateStepsCode(step.elseSteps, 6)
      : '';

    return wrapperFn(thenCode, elseCode);
  }

  /**
   * Common conditional generators
   * Uses strategy pattern to delegate framework-specific wrapping
   */
  protected createConditionalGenerators(): Record<string, (step: Step) => string> {
    return {
      ifExists: (step) => this.generateConditional(
        (thenCode, elseCode) => this.conditionalStrategy.wrapElementCheck(
          step.selector,
          thenCode,
          elseCode
        ),
        step
      ),

      ifVisible: (step) => this.generateConditional(
        (thenCode, elseCode) => this.conditionalStrategy.wrapVisibilityCheck(
          step.selector,
          thenCode,
          elseCode
        ),
        step
      ),

      ifContainsText: (step) => this.generateConditional(
        (thenCode, elseCode) => this.conditionalStrategy.wrapTextCheck(
          step.selector,
          step.text,
          thenCode,
          elseCode
        ),
        step
      ),

      ifUrlContains: (step) => this.generateConditional(
        (thenCode, elseCode) => this.conditionalStrategy.wrapUrlCheck(
          step.text,
          thenCode,
          elseCode
        ),
        step
      ),

      ifHasAttribute: (step) => this.generateConditional(
        (thenCode, elseCode) => this.conditionalStrategy.wrapAttributeCheck(
          step.selector,
          step.attribute,
          step.value,
          thenCode,
          elseCode
        ),
        step
      ),

      ifHasClass: (step) => this.generateConditional(
        (thenCode, elseCode) => this.conditionalStrategy.wrapClassCheck(
          step.selector,
          step.className,
          thenCode,
          elseCode
        ),
        step
      ),
    };
  }

  abstract wrapInTestStructure(scenario: Scenario, stepsCode: string): string;
  abstract getFileHeader(): string;
}
