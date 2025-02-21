import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, body } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    this.logger.log(
      `[${method}] ${originalUrl} - Body: ${JSON.stringify(body)} - User Agent: ${userAgent}`,
    );

    res.on('finish', () => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      this.logger.log(
        `[${method}] ${originalUrl} - ${res.statusCode} - ${responseTime}ms`,
      );
    });

    next();
  }
}
