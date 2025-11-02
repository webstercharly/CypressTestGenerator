// core/validator.ts - Framework-agnostic validation (v2 with error classes and sanitization)

import { Step, Scenario, STEP_REQUIRED_PARAMS } from './types';
import { ValidationError, SecurityError } from '../utils/errors';
import { InputSanitizer } from '../utils/sanitizer';

/**
 * Validates and sanitizes a step
 * Throws ValidationError or SecurityError
 */
export function validateStep(step: Step, index: number, availableStepTypes: string[]): void {
  // Check step has type
  if (!step || !step.type) {
    throw new ValidationError(
      `Step at index ${index} is missing a 'type' property`,
      'MISSING_TYPE',
      { index, step }
    );
  }

  // Check step type is valid
  if (!availableStepTypes.includes(step.type)) {
    throw new ValidationError(
      `Step at index ${index} has invalid type '${step.type}'`,
      'INVALID_TYPE',
      { index, type: step.type, availableTypes: availableStepTypes }
    );
  }

  // Validate required parameters
  const required = STEP_REQUIRED_PARAMS[step.type] || [];
  for (const param of required) {
    if (step[param] === undefined || step[param] === null || step[param] === '') {
      throw new ValidationError(
        `Step at index ${index} (type: '${step.type}') is missing required parameter '${param}'`
,
        'MISSING_PARAMETER',
        { index, type: step.type, parameter: param }
      );
    }
  }

  // Sanitize and validate specific parameter types
  try {
    if (step.selector !== undefined) {
      InputSanitizer.sanitizeSelector(step.selector);
    }

    if (step.url !== undefined) {
      InputSanitizer.sanitizeUrl(step.url);
    }

    if (step.text !== undefined) {
      InputSanitizer.sanitizeText(step.text);
    }

    if (step.value !== undefined && typeof step.value === 'string') {
      InputSanitizer.sanitizeText(step.value);
    }

    if (step.attribute !== undefined) {
      InputSanitizer.validateAttributeName(step.attribute);
    }

    if (step.property !== undefined) {
      InputSanitizer.validateCssProperty(step.property);
    }

    if (step.className !== undefined) {
      InputSanitizer.sanitizeClassName(step.className);
    }

    if (step.milliseconds !== undefined) {
      InputSanitizer.validateNumber(step.milliseconds, 0, 300000); // Max 5 minutes
    }

    if (step.timeout !== undefined) {
      InputSanitizer.validateNumber(step.timeout, 0, 300000);
    }

    if (step.count !== undefined) {
      InputSanitizer.validateNumber(step.count, 0, 10000);
    }

    // Validate custom code (security risk!)
    if (step.type === 'custom' && step.code) {
      // Custom code is dangerous - validate strictly
      if (typeof step.code !== 'string') {
        throw new SecurityError(
          'Custom code must be a string',
          'INVALID_CUSTOM_CODE',
          { step }
        );
      }

      if (step.code.length > 5000) {
        throw new SecurityError(
          'Custom code too long (max 5000 characters)',
          'CUSTOM_CODE_TOO_LONG',
          { length: step.code.length }
        );
      }

      // Check for dangerous patterns
      const dangerousPatterns = [
        /eval\(/i,
        /Function\(/i,
        /require\(/i,
        /import\(/i,
        /process\.env/i,
        /child_process/i,
        /fs\./i,
      ];

      for (const pattern of dangerousPatterns) {
        if (pattern.test(step.code)) {
          throw new SecurityError(
            `Custom code contains dangerous pattern: ${pattern.source}`,
            'DANGEROUS_CUSTOM_CODE',
            { code: step.code, pattern: pattern.source }
          );
        }
      }
    }
  } catch (error) {
    // Re-throw our errors
    if (error instanceof ValidationError || error instanceof SecurityError) {
      throw error;
    }

    // Wrap other errors
    throw new ValidationError(
      `Invalid parameter in step at index ${index}: ${error.message}`,
      'INVALID_PARAMETER',
      { index, step, originalError: error }
    );
  }

  // Recursively validate nested steps in conditionals
  if (step.thenSteps && Array.isArray(step.thenSteps)) {
    step.thenSteps.forEach((nestedStep, nestedIndex) => {
      validateStep(nestedStep, nestedIndex, availableStepTypes);
    });
  }

  if (step.elseSteps && Array.isArray(step.elseSteps)) {
    step.elseSteps.forEach((nestedStep, nestedIndex) => {
      validateStep(nestedStep, nestedIndex, availableStepTypes);
    });
  }
}

/**
 * Validates the entire scenario
 */
export function validateScenario(scenario: Scenario, availableStepTypes: string[]): void {
  if (!scenario) {
    throw new ValidationError('Scenario is null or undefined', 'NULL_SCENARIO');
  }

  if (!scenario.name) {
    throw new ValidationError('Scenario must have a name', 'MISSING_NAME', { scenario });
  }

  if (typeof scenario.name !== 'string') {
    throw new ValidationError(
      'Scenario name must be a string',
      'INVALID_NAME_TYPE',
      { name: scenario.name }
    );
  }

  if (scenario.name.length === 0) {
    throw new ValidationError('Scenario name cannot be empty', 'EMPTY_NAME');
  }

  if (scenario.name.length > 500) {
    throw new ValidationError(
      'Scenario name too long (max 500 characters)',
      'NAME_TOO_LONG',
      { length: scenario.name.length }
    );
  }

  if (!scenario.steps || !Array.isArray(scenario.steps)) {
    throw new ValidationError(
      'Scenario must have a steps array',
      'INVALID_STEPS',
      { scenario }
    );
  }

  if (scenario.steps.length === 0) {
    throw new ValidationError(
      'Scenario must have at least one step',
      'EMPTY_STEPS',
      { scenario }
    );
  }

  if (scenario.steps.length > 1000) {
    throw new ValidationError(
      'Scenario has too many steps (max 1000)',
      'TOO_MANY_STEPS',
      { count: scenario.steps.length }
    );
  }

  // Validate description if present
  if (scenario.description !== undefined) {
    if (typeof scenario.description !== 'string') {
      throw new ValidationError(
        'Scenario description must be a string',
        'INVALID_DESCRIPTION_TYPE',
        { description: scenario.description }
      );
    }

    if (scenario.description.length > 1000) {
      throw new ValidationError(
        'Scenario description too long (max 1000 characters)',
        'DESCRIPTION_TOO_LONG',
        { length: scenario.description.length }
      );
    }
  }

  // Validate each step
  scenario.steps.forEach((step, index) => validateStep(step, index, availableStepTypes));
}
