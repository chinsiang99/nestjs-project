// import { ConfigService } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from './logger.service';
import { Test, TestingModule } from '@nestjs/testing';

// Mock ConfigService
const mockConfigService = {
  getOrThrow: jest.fn((key: string) => {
    if (key === 'NODE_ENV') return 'test';
    if (key === 'LOG_LEVEL') return 'info'; // Mock log level for testing
    throw new Error(`Key ${key} not found`);
  }),
};

describe('LoggerService', () => {
  let loggerService: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggerService,
        {
          provide: ConfigService,
          useFactory: jest.fn(() => ({
            getOrThrow: jest.fn((key: string) => {
              if (key === 'NODE_ENV') return 'test';
              if (key === 'LOG_LEVEL') return 'info'; // Mock log level for testing
              throw new Error(`Key ${key} not found`);
            }),
          }))
        }
      ],
    }).compile();

    loggerService = module.get<LoggerService>(LoggerService);
  });

  beforeEach(async () => {
    process.env = {

    }
  });

  it('should be defined', () => {
    expect(loggerService).toBeDefined();
  });

  it('should initialize logger with proper transports', () => {
    loggerService.onModuleInit();

    // Ensure logger is initialized with fileTransport and errorFileTransport
    expect(loggerService['logger'].transports).toContain(loggerService['fileTransport']);
    expect(loggerService['logger'].transports).toContain(loggerService['errorFileTransport']);
  });

  it('should return logger instance', () => {
    loggerService.onModuleInit();
    const logger = loggerService.getLogger();
    expect(logger).toBeDefined();
  });

  it('should log messages of different levels', () => {
    // Initialize loggerService and get the logger instance
    loggerService.onModuleInit();
    const logger = loggerService.getLogger();
  
    // Spy on the log method of the logger instance
    const logErrorSpy = jest.spyOn(logger, 'error');
    const logWarnSpy = jest.spyOn(logger, 'warn');
    const logInfoSpy = jest.spyOn(logger, 'info');
    const logDebugSpy = jest.spyOn(logger, 'debug');
    
    const logMessageParameter = {
      label: 'TestLabel',
      params: { param1: 'value1', param2: 'value2' },
      body: 'Test body',
      stack: 'Test stack',
    };
  
    // Log messages of different levels
    logger.error('Test error message');
    logger.warn('Test warning message', logMessageParameter);
    logger.info('Test info message', logMessageParameter);
    logger.debug('Test debug message');
  
    // Verify that log method is called with proper arguments
    expect(logErrorSpy).toHaveBeenNthCalledWith(1, 'Test error message');
    expect(logWarnSpy).toHaveBeenNthCalledWith(1, 'Test warning message', logMessageParameter);
    expect(logInfoSpy).toHaveBeenNthCalledWith(1, 'Test info message', logMessageParameter);
    expect(logDebugSpy).toHaveBeenNthCalledWith(1, 'Test debug message');
  });
});