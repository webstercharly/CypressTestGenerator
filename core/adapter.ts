// core/adapter.ts - Framework adapter interface

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
 * Abstract base class with common functionality
 */
export abstract class BaseFrameworkAdapter implements FrameworkAdapter {
  abstract name: string;
  abstract fileExtension: string;

  protected abstract stepGenerators: Record<string, (step: Step) => string>;

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

  abstract wrapInTestStructure(scenario: Scenario, stepsCode: string): string;
  abstract getFileHeader(): string;
}
