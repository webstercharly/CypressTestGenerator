// core/generator.ts - Framework-agnostic test generator (v2 with DI and error handling)

import { FrameworkAdapter } from './adapter.v2';
import { Scenario } from './types';
import { validateScenario } from './validator.v2';
import { FileSystem, RealFileSystem } from '../utils/filesystem';
import { CodeFormatter, PrettierFormatter } from '../utils/formatter';
import { Logger, ConsoleLogger } from '../utils/logger';
import { GenerationError, IOError } from '../utils/errors';

export interface TestGeneratorConfig {
  adapter: FrameworkAdapter;
  fileSystem?: FileSystem;
  formatter?: CodeFormatter;
  logger?: Logger;
}

/**
 * Test generator with dependency injection for testability
 */
export class TestGenerator {
  private adapter: FrameworkAdapter;
  private fileSystem: FileSystem;
  private formatter: CodeFormatter;
  private logger: Logger;

  constructor(config: TestGeneratorConfig) {
    this.adapter = config.adapter;
    this.fileSystem = config.fileSystem || new RealFileSystem();
    this.formatter = config.formatter || new PrettierFormatter(config.logger);
    this.logger = config.logger || new ConsoleLogger();
  }

  /**
   * Generate test code from a scenario
   */
  generate(scenario: Scenario): string {
    try {
      this.logger.debug(`Generating test for scenario: ${scenario.name}`);

      // Validate using framework's supported step types
      validateScenario(scenario, this.adapter.getSupportedStepTypes());

      // Generate steps code
      const stepsCode = this.adapter.generateStepsCode(scenario.steps, 4);

      // Wrap in test structure
      const testCode = this.adapter.wrapInTestStructure(scenario, stepsCode);

      // Add header
      const fullCode = this.adapter.getFileHeader() + testCode;

      // Format code
      const formattedCode = this.formatter.format(fullCode);

      this.logger.info(`Generated ${this.adapter.name} test successfully`);

      return formattedCode;
    } catch (error) {
      this.logger.error(`Failed to generate test: ${error.message}`);

      throw new GenerationError(
        `Failed to generate ${this.adapter.name} test: ${error.message}`,
        'GENERATION_FAILED',
        { scenario: scenario.name, originalError: error }
      );
    }
  }

  /**
   * Generate and write test file
   */
  generateFile(scenario: Scenario, outputPath: string): void {
    try {
      this.logger.info(`Generating ${this.adapter.name} test file: ${outputPath}`);

      const code = this.generate(scenario);

      this.fileSystem.writeFile(outputPath, code);

      this.logger.info(`✓ ${this.adapter.name} test file written to ${outputPath}`);
    } catch (error) {
      this.logger.error(`✗ Error writing test file: ${error.message}`);
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
