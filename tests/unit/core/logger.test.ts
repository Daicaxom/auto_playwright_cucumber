import { Logger } from '../../../src/core/utilities/logger';
import * as fs from 'fs';
import * as path from 'path';

describe('Logger', () => {
  let logger: Logger;
  const testLogDir = path.join(process.cwd(), 'results', 'test-logs');

  beforeEach(() => {
    // Clean up test log directory
    if (fs.existsSync(testLogDir)) {
      fs.rmSync(testLogDir, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    // Clean up test log directory
    if (fs.existsSync(testLogDir)) {
      fs.rmSync(testLogDir, { recursive: true, force: true });
    }
  });

  describe('Initialization', () => {
    it('should create a logger instance', () => {
      logger = new Logger({ level: 'info' });
      expect(logger).toBeInstanceOf(Logger);
    });

    it('should set default log level to info', () => {
      logger = new Logger({});
      expect(logger.getLevel()).toBe('info');
    });

    it('should accept custom log level', () => {
      logger = new Logger({ level: 'debug' });
      expect(logger.getLevel()).toBe('debug');
    });
  });

  describe('Log Levels', () => {
    beforeEach(() => {
      logger = new Logger({ level: 'debug', console: true });
    });

    it('should log debug messages', () => {
      const consoleSpy = jest.spyOn(console, 'debug').mockImplementation();
      logger.debug('Debug message');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should log info messages', () => {
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();
      logger.info('Info message');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should log warn messages', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      logger.warn('Warning message');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should log error messages', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      logger.error('Error message');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should not log debug when level is info', () => {
      logger = new Logger({ level: 'info', console: true });
      const consoleSpy = jest.spyOn(console, 'debug').mockImplementation();
      logger.debug('Should not appear');
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Metadata', () => {
    beforeEach(() => {
      logger = new Logger({ level: 'info', console: true });
    });

    it('should log with metadata object', () => {
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();
      logger.info('Message with metadata', { key: 'value' });
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle complex metadata', () => {
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();
      logger.info('Complex metadata', {
        nested: { key: 'value' },
        array: [1, 2, 3],
      });
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Child Logger', () => {
    it('should create child logger with context', () => {
      logger = new Logger({ level: 'info' });
      const childLogger = logger.child({ component: 'TestComponent' });
      expect(childLogger).toBeInstanceOf(Logger);
    });

    it('should inherit parent log level', () => {
      logger = new Logger({ level: 'debug' });
      const childLogger = logger.child({ component: 'TestComponent' });
      expect(childLogger.getLevel()).toBe('debug');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      logger = new Logger({ level: 'error', console: true });
    });

    it('should log Error objects', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Test error');
      logger.error('Error occurred', error);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle undefined metadata', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      expect(() => {
        logger.error('Error without metadata');
      }).not.toThrow();
      consoleSpy.mockRestore();
    });
  });

  describe('Format', () => {
    it('should format as JSON when configured', () => {
      logger = new Logger({ level: 'info', format: 'json', console: true });
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();
      logger.info('JSON message');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should format as text when configured', () => {
      logger = new Logger({ level: 'info', format: 'text', console: true });
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();
      logger.info('Text message');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
