import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { logger } from "../../logger";

@Injectable()
export class LogRequestsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const t0 = process.hrtime.bigint();

    res.on("finish", () => {
      const duration_ms = Number(process.hrtime.bigint() - t0) / 1e6;

      const rawRequestId = req.headers["x-request-id"];
      const requestId = Array.isArray(rawRequestId)
        ? rawRequestId[0]
        : rawRequestId;

      const logData: Record<string, any> = {
        duration_ms: Math.round(duration_ms * 10) / 10,
        status_code: res.statusCode,
      };

      if (requestId) {
        logData.request_id = requestId;
      }

      const path = req.originalUrl || req.url || req.path;
      logger.info(logData, `${req.method} ${path}`);
    });

    next();
  }
}
