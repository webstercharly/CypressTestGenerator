// utils/sanitizer.ts - Input sanitization and validation

/**
 * Escapes special characters in strings to prevent code injection
 */
export class InputSanitizer {
  /**
   * Escapes single quotes, double quotes, and backslashes
   * Used for selector and value strings in generated code
   */
  static escapeString(input: string): string {
    if (typeof input !== 'string') {
      throw new Error(`Expected string, got ${typeof input}`);
    }

    return input
      .replace(/\\/g, '\\\\')  // Escape backslashes first
      .replace(/'/g, "\\'")     // Escape single quotes
      .replace(/"/g, '\\"')     // Escape double quotes
      .replace(/\n/g, '\\n')    // Escape newlines
      .replace(/\r/g, '\\r')    // Escape carriage returns
      .replace(/\t/g, '\\t');   // Escape tabs
  }

  /**
   * Validates and sanitizes CSS selectors
   * Prevents injection attacks through selectors
   */
  static sanitizeSelector(selector: string): string {
    if (typeof selector !== 'string') {
      throw new Error(`Expected string, got ${typeof selector}`);
    }

    if (selector.length === 0) {
      throw new Error('Selector cannot be empty');
    }

    if (selector.length > 500) {
      throw new Error('Selector too long (max 500 characters)');
    }

    // Check for dangerous patterns
    const dangerousPatterns = [
      /javascript:/i,
      /<script/i,
      /on\w+\s*=/i,  // Event handlers like onclick=
      /eval\(/i,
      /expression\(/i,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(selector)) {
        throw new Error(`Selector contains dangerous pattern: ${selector}`);
      }
    }

    return this.escapeString(selector);
  }

  /**
   * Validates and sanitizes URLs
   */
  static sanitizeUrl(url: string): string {
    if (typeof url !== 'string') {
      throw new Error(`Expected string, got ${typeof url}`);
    }

    if (url.length === 0) {
      throw new Error('URL cannot be empty');
    }

    if (url.length > 2000) {
      throw new Error('URL too long (max 2000 characters)');
    }

    // Block javascript: and data: URLs FIRST (before format check)
    if (/^(javascript|data):/i.test(url)) {
      throw new Error(`Dangerous URL protocol: ${url}`);
    }

    // Allow http, https, and relative URLs
    const urlPattern = /^(https?:\/\/|\/|\.\/|\.\.\/)/;
    if (!urlPattern.test(url)) {
      throw new Error(`Invalid URL format: ${url}`);
    }

    return this.escapeString(url);
  }

  /**
   * Validates numeric values (timeouts, counts, etc.)
   */
  static validateNumber(value: number, min: number = 0, max: number = Number.MAX_SAFE_INTEGER): number {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error(`Expected number, got ${typeof value}`);
    }

    if (value < min || value > max) {
      throw new Error(`Number ${value} out of range [${min}, ${max}]`);
    }

    return value;
  }

  /**
   * Sanitizes text content (for assertions, etc.)
   */
  static sanitizeText(text: string): string {
    if (typeof text !== 'string') {
      throw new Error(`Expected string, got ${typeof text}`);
    }

    if (text.length > 10000) {
      throw new Error('Text too long (max 10000 characters)');
    }

    return this.escapeString(text);
  }

  /**
   * Validates attribute names
   */
  static validateAttributeName(name: string): string {
    if (typeof name !== 'string') {
      throw new Error(`Expected string, got ${typeof name}`);
    }

    // Attribute names should be alphanumeric with hyphens
    if (!/^[a-zA-Z][a-zA-Z0-9-]*$/.test(name)) {
      throw new Error(`Invalid attribute name: ${name}`);
    }

    return name;
  }

  /**
   * Validates CSS property names
   */
  static validateCssProperty(property: string): string {
    if (typeof property !== 'string') {
      throw new Error(`Expected string, got ${typeof property}`);
    }

    // CSS properties should be alphanumeric with hyphens
    if (!/^[a-zA-Z-]+$/.test(property)) {
      throw new Error(`Invalid CSS property: ${property}`);
    }

    return property;
  }

  /**
   * Sanitizes class names
   */
  static sanitizeClassName(className: string): string {
    if (typeof className !== 'string') {
      throw new Error(`Expected string, got ${typeof className}`);
    }

    // Class names should be alphanumeric with hyphens and underscores
    if (!/^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(className)) {
      throw new Error(`Invalid class name: ${className}`);
    }

    return className;
  }
}
