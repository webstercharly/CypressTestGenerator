// utils/filesystem.ts - File system abstraction for testability

import * as fs from 'fs';
import * as path from 'path';
import { IOError } from './errors';

/**
 * File system interface for dependency injection
 * Makes code testable by allowing mock file systems
 */
export interface FileSystem {
  writeFile(filePath: string, content: string): void;
  readFile(filePath: string): string;
  exists(filePath: string): boolean;
  mkdir(dirPath: string): void;
}

/**
 * Real file system implementation
 */
export class RealFileSystem implements FileSystem {
  writeFile(filePath: string, content: string): void {
    try {
      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(filePath, content, 'utf-8');
    } catch (error) {
      throw new IOError(
        `Failed to write file: ${filePath}`,
        'WRITE_ERROR',
        { filePath, originalError: error }
      );
    }
  }

  readFile(filePath: string): string {
    try {
      return fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
      throw new IOError(
        `Failed to read file: ${filePath}`,
        'READ_ERROR',
        { filePath, originalError: error }
      );
    }
  }

  exists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  mkdir(dirPath: string): void {
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    } catch (error) {
      throw new IOError(
        `Failed to create directory: ${dirPath}`,
        'MKDIR_ERROR',
        { dirPath, originalError: error }
      );
    }
  }
}

/**
 * In-memory file system for testing
 */
export class MemoryFileSystem implements FileSystem {
  private files: Map<string, string> = new Map();
  private directories: Set<string> = new Set();

  writeFile(filePath: string, content: string): void {
    // Normalize path
    const normalized = path.normalize(filePath);

    // Ensure parent directory exists
    const dir = path.dirname(normalized);
    if (!this.directories.has(dir) && dir !== '.') {
      throw new IOError(
        `Directory does not exist: ${dir}`,
        'DIR_NOT_FOUND',
        { filePath: normalized }
      );
    }

    this.files.set(normalized, content);
  }

  readFile(filePath: string): string {
    const normalized = path.normalize(filePath);
    const content = this.files.get(normalized);

    if (content === undefined) {
      throw new IOError(
        `File not found: ${filePath}`,
        'FILE_NOT_FOUND',
        { filePath: normalized }
      );
    }

    return content;
  }

  exists(filePath: string): boolean {
    const normalized = path.normalize(filePath);
    return this.files.has(normalized) || this.directories.has(normalized);
  }

  mkdir(dirPath: string): void {
    const normalized = path.normalize(dirPath);
    this.directories.add(normalized);

    // Add parent directories
    let current = path.dirname(normalized);
    while (current !== '.' && current !== '/') {
      this.directories.add(current);
      current = path.dirname(current);
    }
  }

  /**
   * Test helper: get all files
   */
  getAllFiles(): Map<string, string> {
    return new Map(this.files);
  }

  /**
   * Test helper: clear all files
   */
  clear(): void {
    this.files.clear();
    this.directories.clear();
    this.directories.add('.');  // Root always exists
  }

  /**
   * Test helper: get file content without error
   */
  getFileContent(filePath: string): string | undefined {
    return this.files.get(path.normalize(filePath));
  }
}
