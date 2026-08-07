import { Controller, Get } from "@nestjs/common";
import { env } from "./config/env";

@Controller()
export class AppController {
  @Get("config")
  getConfig(): { appName: string } {
    return {
      appName: env.appName,
    };
  }
}
