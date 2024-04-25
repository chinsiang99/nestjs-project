import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Winston from 'winston';
import 'winston-daily-rotate-file';
import DailyRotateFile from 'winston-daily-rotate-file';

@Injectable()
export class LoggerService {
  constructor(
    private readonly configService: ConfigService, // @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  private logger: Winston.Logger;
  data = Winston.format;

  private myFormat = Winston.format.printf(
    ({ level, message, label, timestamp, stack, body, params }) => {
      return `${timestamp} [${label}] ${level}: ${message}  ${
        params ? `\n params: ${params}` : ''
      } ${body ? `\n body: ${body}` : ''} ${
        stack ? `\n stack-trace: ${stack}` : ''
      }`;
    },
  );

  fileTransport = new Winston.transports.DailyRotateFile({
    filename: 'logs/applications/application-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '7d',
  });

  errorFileTransport = new Winston.transports.DailyRotateFile({
    filename: 'logs/errors/error-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '7d',
    level: 'error',
  });

  expTransport = new Winston.transports.DailyRotateFile({
    filename: 'logs/exceptions/exceptions-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '7d',
  });

  onModuleInit(): void {
    const transportArray = [this.fileTransport, this.errorFileTransport];
    // as it is not recommend to have error printed out in the console, hence we only printed it out to console when it is not in production, we can have code below:
    // if (this.configService.getOrThrow('NODE_ENV') !== 'production') {
    //   transportArray.push(
    //     new Winston.transports.Console({
    //       handleExceptions: true,
    //     }) as unknown as DailyRotateFile,
    //   );
    // }

    // but if we want to have logs in console for further processing its ok as well, because maybe we need them to be collected from other logging monitoring service, below code will instead have log output no matter what
    transportArray.push(
      new Winston.transports.Console({
        handleExceptions: true,
      }) as unknown as DailyRotateFile,
    );

    // here we specify log level env, so we can decide which level based on the environment
    const logLevel = this.configService.getOrThrow('LOG_LEVEL');
    this.logger = Winston.createLogger({
      level: logLevel,
      format: Winston.format.combine(Winston.format.timestamp(), this.myFormat),
      transports: transportArray,
      exceptionHandlers: [this.expTransport],
      exitOnError: false,
    });
  }

  public getLogger(): Winston.Logger {
    return this.logger;
  }
}
