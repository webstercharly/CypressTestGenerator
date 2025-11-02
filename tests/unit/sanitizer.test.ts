import { InputSanitizer } from '../../utils/sanitizer';

describe('InputSanitizer', () => {
  describe('escapeString', () => {
    it('should escape single quotes', () => {
      expect(InputSanitizer.escapeString("it's")).toBe("it\\'s");
    });

    it('should escape double quotes', () => {
      expect(InputSanitizer.escapeString('say "hello"')).toBe('say \\"hello\\"');
    });

    it('should escape backslashes', () => {
      expect(InputSanitizer.escapeString('C:\\path')).toBe('C:\\\\path');
    });

    it('should escape newlines and tabs', () => {
      expect(InputSanitizer.escapeString('line1\nline2\ttab')).toBe('line1\\nline2\\ttab');
    });

    it('should throw on non-string input', () => {
      expect(() => InputSanitizer.escapeString(123 as any)).toThrow('Expected string');
    });
  });

  describe('sanitizeSelector', () => {
    it('should accept valid selectors', () => {
      expect(InputSanitizer.sanitizeSelector('.class')).toBeTruthy();
      expect(InputSanitizer.sanitizeSelector('#id')).toBeTruthy();
      expect(InputSanitizer.sanitizeSelector('[data-test="value"]')).toBeTruthy();
    });

    it('should reject empty selectors', () => {
      expect(() => InputSanitizer.sanitizeSelector('')).toThrow('cannot be empty');
    });

    it('should reject selectors with javascript:', () => {
      expect(() => InputSanitizer.sanitizeSelector('javascript:alert(1)')).toThrow('dangerous pattern');
    });

    it('should reject selectors with <script', () => {
      expect(() => InputSanitizer.sanitizeSelector('<script>alert(1)</script>')).toThrow('dangerous pattern');
    });

    it('should reject selectors with event handlers', () => {
      expect(() => InputSanitizer.sanitizeSelector('img onclick=alert(1)')).toThrow('dangerous pattern');
    });

    it('should reject selectors that are too long', () => {
      const longSelector = 'a'.repeat(501);
      expect(() => InputSanitizer.sanitizeSelector(longSelector)).toThrow('too long');
    });

    it('should escape quotes in selectors', () => {
      const result = InputSanitizer.sanitizeSelector(".it's-class");
      expect(result).toContain("\\'");
    });
  });

  describe('sanitizeUrl', () => {
    it('should accept valid HTTP URLs', () => {
      expect(InputSanitizer.sanitizeUrl('http://example.com')).toBeTruthy();
      expect(InputSanitizer.sanitizeUrl('https://example.com/path')).toBeTruthy();
    });

    it('should accept relative URLs', () => {
      expect(InputSanitizer.sanitizeUrl('/path')).toBeTruthy();
      expect(InputSanitizer.sanitizeUrl('./relative')).toBeTruthy();
      expect(InputSanitizer.sanitizeUrl('../parent')).toBeTruthy();
    });

    it('should reject empty URLs', () => {
      expect(() => InputSanitizer.sanitizeUrl('')).toThrow('cannot be empty');
    });

    it('should reject javascript: URLs', () => {
      expect(() => InputSanitizer.sanitizeUrl('javascript:alert(1)')).toThrow('Dangerous URL protocol');
    });

    it('should reject data: URLs', () => {
      expect(() => InputSanitizer.sanitizeUrl('data:text/html,<script>alert(1)</script>')).toThrow('Dangerous URL protocol');
    });

    it('should reject invalid URL formats', () => {
      expect(() => InputSanitizer.sanitizeUrl('not-a-url')).toThrow('Invalid URL format');
    });

    it('should reject URLs that are too long', () => {
      const longUrl = 'http://example.com/' + 'a'.repeat(2000);
      expect(() => InputSanitizer.sanitizeUrl(longUrl)).toThrow('too long');
    });
  });

  describe('validateNumber', () => {
    it('should accept valid numbers', () => {
      expect(InputSanitizer.validateNumber(42)).toBe(42);
      expect(InputSanitizer.validateNumber(0)).toBe(0);
      expect(InputSanitizer.validateNumber(1000)).toBe(1000);
    });

    it('should reject non-numbers', () => {
      expect(() => InputSanitizer.validateNumber('42' as any)).toThrow('Expected number');
      expect(() => InputSanitizer.validateNumber(NaN)).toThrow('Expected number');
    });

    it('should enforce min/max bounds', () => {
      expect(() => InputSanitizer.validateNumber(5, 10, 20)).toThrow('out of range');
      expect(() => InputSanitizer.validateNumber(25, 10, 20)).toThrow('out of range');
      expect(InputSanitizer.validateNumber(15, 10, 20)).toBe(15);
    });
  });

  describe('validateAttributeName', () => {
    it('should accept valid attribute names', () => {
      expect(InputSanitizer.validateAttributeName('data-test')).toBe('data-test');
      expect(InputSanitizer.validateAttributeName('href')).toBe('href');
      expect(InputSanitizer.validateAttributeName('aria-label')).toBe('aria-label');
    });

    it('should reject invalid attribute names', () => {
      expect(() => InputSanitizer.validateAttributeName('123invalid')).toThrow('Invalid attribute name');
      expect(() => InputSanitizer.validateAttributeName('has spaces')).toThrow('Invalid attribute name');
      expect(() => InputSanitizer.validateAttributeName('has@symbol')).toThrow('Invalid attribute name');
    });
  });

  describe('sanitizeClassName', () => {
    it('should accept valid class names', () => {
      expect(InputSanitizer.sanitizeClassName('btn')).toBe('btn');
      expect(InputSanitizer.sanitizeClassName('btn-primary')).toBe('btn-primary');
      expect(InputSanitizer.sanitizeClassName('btn_large')).toBe('btn_large');
    });

    it('should reject invalid class names', () => {
      expect(() => InputSanitizer.sanitizeClassName('123invalid')).toThrow('Invalid class name');
      expect(() => InputSanitizer.sanitizeClassName('has spaces')).toThrow('Invalid class name');
      expect(() => InputSanitizer.sanitizeClassName('-starts-with-dash')).toThrow('Invalid class name');
    });
  });
});
