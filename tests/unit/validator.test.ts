import { validateScenario, validateStep } from '../../core/validator.v2';
import { Scenario, Step } from '../../core/types';
import { ValidationError, SecurityError } from '../../utils/errors';

describe('Validator', () => {
  const availableStepTypes = ['navigate', 'click', 'fillInput', 'assertVisible', 'custom'];

  describe('validateStep', () => {
    it('should validate a valid step', () => {
      const step: Step = { type: 'navigate', url: 'http://example.com' };
      expect(() => validateStep(step, 0, availableStepTypes)).not.toThrow();
    });

    it('should throw ValidationError for missing type', () => {
      const step: any = { url: 'http://example.com' };
      expect(() => validateStep(step, 0, availableStepTypes)).toThrow(ValidationError);
      expect(() => validateStep(step, 0, availableStepTypes)).toThrow('missing a \'type\' property');
    });

    it('should throw ValidationError for invalid type', () => {
      const step: Step = { type: 'invalidType' };
      expect(() => validateStep(step, 0, availableStepTypes)).toThrow(ValidationError);
      expect(() => validateStep(step, 0, availableStepTypes)).toThrow('invalid type');
    });

    it('should throw ValidationError for missing required parameter', () => {
      const step: Step = { type: 'navigate' }; // Missing url
      expect(() => validateStep(step, 0, availableStepTypes)).toThrow(ValidationError);
      expect(() => validateStep(step, 0, availableStepTypes)).toThrow('missing required parameter');
    });

    it('should reject dangerous selectors', () => {
      const step: Step = { type: 'click', selector: 'javascript:alert(1)' };
      expect(() => validateStep(step, 0, availableStepTypes)).toThrow();
    });

    it('should reject dangerous custom code', () => {
      const step: Step = { type: 'custom', code: 'eval("malicious")' };
      expect(() => validateStep(step, 0, availableStepTypes)).toThrow(SecurityError);
    });

    it('should validate nested conditionals', () => {
      const step: Step = {
        type: 'ifExists',
        selector: '.banner',
        thenSteps: [
          { type: 'click', selector: '.accept' }
        ]
      };
      expect(() => validateStep(step, 0, [...availableStepTypes, 'ifExists'])).not.toThrow();
    });
  });

  describe('validateScenario', () => {
    it('should validate a valid scenario', () => {
      const scenario: Scenario = {
        name: 'Test Scenario',
        steps: [
          { type: 'navigate', url: 'http://example.com' },
          { type: 'click', selector: '.button' }
        ]
      };
      expect(() => validateScenario(scenario, availableStepTypes)).not.toThrow();
    });

    it('should throw ValidationError for missing name', () => {
      const scenario: any = { steps: [] };
      expect(() => validateScenario(scenario, availableStepTypes)).toThrow(ValidationError);
      expect(() => validateScenario(scenario, availableStepTypes)).toThrow('must have a name');
    });

    it('should throw ValidationError for empty steps', () => {
      const scenario: Scenario = { name: 'Test', steps: [] };
      expect(() => validateScenario(scenario, availableStepTypes)).toThrow(ValidationError);
      expect(() => validateScenario(scenario, availableStepTypes)).toThrow('at least one step');
    });

    it('should throw ValidationError for non-array steps', () => {
      const scenario: any = { name: 'Test', steps: 'not-an-array' };
      expect(() => validateScenario(scenario, availableStepTypes)).toThrow(ValidationError);
    });

    it('should reject scenarios with too many steps', () => {
      const steps = Array(1001).fill({ type: 'navigate', url: 'http://example.com' });
      const scenario: Scenario = { name: 'Test', steps };
      expect(() => validateScenario(scenario, availableStepTypes)).toThrow(ValidationError);
      expect(() => validateScenario(scenario, availableStepTypes)).toThrow('too many steps');
    });

    it('should reject scenarios with name too long', () => {
      const scenario: Scenario = {
        name: 'a'.repeat(501),
        steps: [{ type: 'navigate', url: 'http://example.com' }]
      };
      expect(() => validateScenario(scenario, availableStepTypes)).toThrow(ValidationError);
    });
  });
});
