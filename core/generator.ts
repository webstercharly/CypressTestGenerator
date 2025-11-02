// core/generator.ts - Framework-agnostic test generator

import * as fs from 'fs';
import * as prettier from 'prettier';
import { FrameworkAdapter } from './adapter';
import { Scenario } from './types';
import { validateScenario } from './validator';

/**
 * Test generator that works with any framework adapter
 */
export class TestGenerator {
  constructor(private adapter: FrameworkAdapter) {}

  /**
   * Generate test code from a scenario
   */
  generate(scenario: Scenario): string {
    // Validate using framework's supported step types
    validateScenario(scenario, this.adapter.getSupportedStepTypes());

    // Generate steps code
    const stepsCode = this.adapter.generateStepsCode(scenario.steps, 4);

    // Wrap in test structure
    const testCode = this.adapter.wrapInTestStructure(scenario, stepsCode);

    // Add header
    const fullCode = this.adapter.getFileHeader() + testCode;

    return fullCode;
  }

  /**
   * Generate and write test file
   */
  generateFile(scenario: Scenario, outputPath: string): void {
    try {
      const code = this.generate(scenario);
      const formattedCode = prettier.format(code, { parser: 'babel' });
      fs.writeFileSync(outputPath, formattedCode);
      console.log(`✓ ${this.adapter.name} test file written to ${outputPath}`);
    } catch (error) {
      console.error(`✗ Error generating ${this.adapter.name} test: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get the framework name
   */
  getFrameworkName(): string {
    return this.adapter.name;
  }
}
