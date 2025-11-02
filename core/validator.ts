// core/validator.ts - Framework-agnostic validation

import { Step, Scenario, STEP_REQUIRED_PARAMS } from './types';

/**
 * Validates that a step has a valid type and required parameters
 */
export function validateStep(step: Step, index: number, availableStepTypes: string[]): void {
  if (!step.type) {
    throw new Error(`Step at index ${index} is missing a 'type' property`);
  }

  if (!availableStepTypes.includes(step.type)) {
    const available = availableStepTypes.join(', ');
    throw new Error(
      `Step at index ${index} has invalid type '${step.type}'. Available types: ${available}`
    );
  }

  // Validate required parameters based on step type
  const required = STEP_REQUIRED_PARAMS[step.type] || [];
  for (const param of required) {
    if (step[param] === undefined || step[param] === null || step[param] === '') {
      throw new Error(
        `Step at index ${index} (type: '${step.type}') is missing required parameter '${param}'`
      );
    }
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
  if (!scenario.name) {
    throw new Error('Scenario must have a name');
  }

  if (!scenario.steps || !Array.isArray(scenario.steps)) {
    throw new Error('Scenario must have a steps array');
  }

  if (scenario.steps.length === 0) {
    throw new Error('Scenario must have at least one step');
  }

  scenario.steps.forEach((step, index) => validateStep(step, index, availableStepTypes));
}
