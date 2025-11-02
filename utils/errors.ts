// utils/errors.ts - Custom error classes

export enum ErrorCategory {
  VALIDATION = 'validation',
  GENERATION = 'generation',
  IO = 'io',
  SECURITY = 'security',
}

/**
 * Base error class for test generator
 */
export class TestGeneratorError extends Error {
  constructor(
    message: string,
    public code: string,
    public category: ErrorCategory,
    public details?: any
  ) {
    super(message);
    this.name = 'TestGeneratorError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation errors (invalid input, missing parameters, etc.)
 */
export class ValidationError extends TestGeneratorError {
  constructor(message: string, code: string = 'VALIDATION_ERROR', details?: any) {
    super(message, code, ErrorCategory.VALIDATION, details);
    this.name = 'ValidationError';
  }
}

/**
 * Code generation errors (unable to generate valid code)
 */
export class GenerationError extends TestGeneratorError {
  constructor(message: string, code: string = 'GENERATION_ERROR', details?: any) {
    super(message, code, ErrorCategory.GENERATION, details);
    this.name = 'GenerationError';
  }
}

/**
 * File I/O errors (unable to read/write files)
 */
export class IOError extends TestGeneratorError {
  constructor(message: string, code: string = 'IO_ERROR', details?: any) {
    super(message, code, ErrorCategory.IO, details);
    this.name = 'IOError';
  }
}

/**
 * Security errors (injection attempts, dangerous input)
 */
export class SecurityError extends TestGeneratorError {
  constructor(message: string, code: string = 'SECURITY_ERROR', details?: any) {
    super(message, code, ErrorCategory.SECURITY, details);
    this.name = 'SecurityError';
  }
}
