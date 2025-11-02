import { TestGenerator } from '../../core/generator.v2';
import { Scenario } from '../../core/types';
import { MemoryFileSystem } from '../../utils/filesystem';
import { NoOpFormatter } from '../../utils/formatter';
import { MockLogger } from '../../utils/logger';
import { FrameworkAdapter } from '../../core/adapter.v2';

// Mock adapter for testing
class MockAdapter implements FrameworkAdapter {
  name = 'mock';
  fileExtension = '.test.ts';

  getSupportedStepTypes(): string[] {
    return ['navigate', 'click', 'assertVisible'];
  }

  generateStepCode(step: any): string {
    return `// ${step.type}`;
  }

  generateStepsCode(steps: any[]): string {
    return steps.map(s => this.generateStepCode(s)).join('\n');
  }

  wrapInTestStructure(scenario: Scenario, code: string): string {
    return `test('${scenario.name}', () => {\n${code}\n});`;
  }

  getFileHeader(): string {
    return '// Mock Test\n';
  }
}

describe('TestGenerator', () => {
  let filesystem: MemoryFileSystem;
  let formatter: NoOpFormatter;
  let logger: MockLogger;
  let adapter: MockAdapter;

  beforeEach(() => {
    filesystem = new MemoryFileSystem();
    filesystem.mkdir('.');
    formatter = new NoOpFormatter();
    logger = new MockLogger();
    adapter = new MockAdapter();
  });

  describe('generate', () => {
    it('should generate test code from a valid scenario', () => {
      const generator = new TestGenerator({ adapter, filesystem, formatter, logger });

      const scenario: Scenario = {
        name: 'Login Test',
        steps: [
          { type: 'navigate', url: 'http://example.com' },
          { type: 'click', selector: '.button' }
        ]
      };

      const code = generator.generate(scenario);

      expect(code).toContain('Login Test');
      expect(code).toContain('// navigate');
      expect(code).toContain('// click');
      expect(logger.logs.some(l => l.message.includes('Generated'))).toBe(true);
    });

    it('should throw error for invalid scenario', () => {
      const generator = new TestGenerator({ adapter, filesystem, formatter, logger });

      const scenario: any = {
        name: 'Invalid',
        steps: [
          { type: 'invalidStep' }  // Not in supported types
        ]
      };

      expect(() => generator.generate(scenario)).toThrow();
      expect(logger.hasError('Failed')).toBe(true);
    });
  });

  describe('generateFile', () => {
    it('should write generated code to file', () => {
      const generator = new TestGenerator({ adapter, filesystem, formatter, logger });

      const scenario: Scenario = {
        name: 'Login Test',
        steps: [
          { type: 'navigate', url: 'http://example.com' }
        ]
      };

      generator.generateFile(scenario, './test.spec.ts');

      const content = filesystem.getFileContent('./test.spec.ts');
      expect(content).toBeTruthy();
      expect(content).toContain('Login Test');
    });

    it('should log success message', () => {
      const generator = new TestGenerator({ adapter, filesystem, formatter, logger });

      const scenario: Scenario = {
        name: 'Test',
        steps: [{ type: 'navigate', url: 'http://example.com' }]
      };

      generator.generateFile(scenario, './test.spec.ts');

      expect(logger.logs.some(l => l.message.includes('written to'))).toBe(true);
    });
  });

  describe('getFrameworkName', () => {
    it('should return adapter name', () => {
      const generator = new TestGenerator({ adapter, filesystem, formatter, logger });
      expect(generator.getFrameworkName()).toBe('mock');
    });
  });
});
