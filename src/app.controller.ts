import { Controller, Get, InternalServerErrorException } from "@nestjs/common";
import { env } from "./config/env";
import { logger } from "./logger";

@Controller()
export class AppController {
  @Get("config")
  getConfig(): { appName: string } {
    return {
      appName: env.appName,
    };
  }

  @Get(["infra/health", "api/infra/health"])
  getHealth(): { status: string } {
    return {
      status: "ok",
    };
  }

  @Get("test-error")
  triggerTestError(): never {
    const errorDetails = {
      simulated: true,
      error_code: "ERR_TEST_SIMULATED_500",
      category: "TEST_LOGGING",
      details:
        "Erro de teste intencional disparado via interface para validação dos logs estruturados no servidor.",
      timestamp: new Date().toISOString(),
      service: "public-api",
      environment: env.nodeEnv,
    };

    logger.error(
      errorDetails,
      "Simulated server endpoint error triggered for logging verification",
    );

    throw new InternalServerErrorException({
      statusCode: 500,
      error_code: "ERR_TEST_SIMULATED_500",
      message: "Erro simulado no servidor para teste de logs.",
      details: errorDetails.details,
      timestamp: errorDetails.timestamp,
    });
  }
}
