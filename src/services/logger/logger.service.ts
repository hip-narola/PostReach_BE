import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';
import 'winston-daily-rotate-file';

@Injectable()
export class Logger implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.ensureLogFolderExists();

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, message, stack, level }) => {
          return `${timestamp} | ${level} | ${message} ${stack ? '| ' + stack : ''}`;
        })
      ),
      transports: [
        new winston.transports.DailyRotateFile({
          filename: 'log-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          dirname: path.join(process.cwd(), 'src', 'logs', this.getMonthFolderName()),
          maxFiles: '30d',
        }),
      ],
    });

    this.logger.add(new winston.transports.Console({
      format: winston.format.simple(),
    }));
  }

  private getMonthFolderName(): string {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  }

  private ensureLogFolderExists(): void {
    const logDir = path.join(process.cwd(), 'src', 'logs');
    const monthFolder = path.join(logDir, this.getMonthFolderName());

    if (!fs.existsSync(monthFolder)) {
      fs.mkdirSync(monthFolder, { recursive: true });
    }
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace: string, context?: string) {
    this.logger.error(message, { context, trace });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }
}
