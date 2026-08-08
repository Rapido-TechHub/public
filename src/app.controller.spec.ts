import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { env } from "./config/env";

describe("AppController", () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe("getConfig", () => {
    it("should return appName from env", () => {
      expect(appController.getConfig()).toEqual({
        appName: env.appName,
      });
    });
  });

  describe("getHealth", () => {
    it("should return status ok", () => {
      expect(appController.getHealth()).toEqual({
        status: "ok",
      });
    });
  });
});
