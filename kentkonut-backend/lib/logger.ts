import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type LogLevel = 'info' | 'warn' | 'error';

interface LogOptions {
  context?: string;
  details?: any;
}

async function writeLogToDb(level: LogLevel, message: string, options?: LogOptions) {
  try {
    await prisma.applicationLog.create({
      data: {
        level,
        message,
        context: options?.context,
        details: options?.details ? JSON.stringify(options.details) : null,
      },
    });
  } catch (dbError) {
    console.error('Failed to write log to database:', dbError);
  }
}

export const logger = {
  info: (message: string, options?: LogOptions) => {
    console.log(`[INFO] ${options?.context ? `(${options.context}) ` : ''}${message}`);
    writeLogToDb('info', message, options);
  },
  warn: (message: string, options?: LogOptions) => {
    console.warn(`[WARN] ${options?.context ? `(${options.context}) ` : ''}${message}`);
    writeLogToDb('warn', message, options);
  },
  error: (message: string, options?: LogOptions) => {
    console.error(`[ERROR] ${options?.context ? `(${options.context}) ` : ''}${message}`);
    writeLogToDb('error', message, options);
  },
};
