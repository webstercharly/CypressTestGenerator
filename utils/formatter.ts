// utils/formatter.ts - Code formatter abstraction

import * as prettier from 'prettier';
import { GenerationError } from './errors';
import { Logger, SilentLogger } from './logger';

/**
 * Code formatter interface for dependency injection
 */
export interface CodeFormatter {
  format(code: string): string;
}

/**
 * Prettier-based formatter
 */
export class PrettierFormatter implements CodeFormatter {
  constructor(private logger: Logger = new SilentLogger()) {}

  format(code: string): string {
    try {
      return prettier.format(code, {
        parser: 'babel',
        singleQuote: true,
        trailingComma: 'es5',
        printWidth: 100,
      });
    } catch (error) {
      this.logger.warn('Prettier formatting failed, returning unformatted code', error);

      // Return unformatted code rather than failing
      // This makes the generator more resilient
      return code;
    }
  }
}

/**
 * Pass-through formatter (no formatting) for tests
 */
export class NoOpFormatter implements CodeFormatter {
  format(code: string): string {
    return code;
  }
}
