import { EventEmitter } from "events";
import { logger } from "../../logger";
import { LogRequestsMiddleware } from "./log-requests.middleware";

jest.mock("../../logger", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe("LogRequestsMiddleware", () => {
  let middleware: LogRequestsMiddleware;

  beforeEach(() => {
    middleware = new LogRequestsMiddleware();
    jest.clearAllMocks();
  });

  it("should call next() and log request details on res finish", () => {
    const req: any = {
      method: "GET",
      originalUrl: "/api/students",
      headers: {
        "x-request-id": "req_12345",
      },
    };

    const res: any = new EventEmitter();
    res.statusCode = 200;

    const next = jest.fn();

    middleware.use(req, res, next);

    expect(next).toHaveBeenCalled();

    // Trigger response finish event
    res.emit("finish");

    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        duration_ms: expect.any(Number),
        status_code: 200,
        request_id: "req_12345",
      }),
      "GET /api/students",
    );

    const loggedPayload = (logger.info as jest.Mock).mock.calls[0][0];
    expect(loggedPayload).not.toHaveProperty("service");
    expect(loggedPayload).not.toHaveProperty("environment");
    expect(loggedPayload).not.toHaveProperty("timestamp");
  });

  it("should log request details without request_id if header is missing", () => {
    const req: any = {
      method: "POST",
      url: "/api/students",
      headers: {},
    };

    const res: any = new EventEmitter();
    res.statusCode = 201;

    const next = jest.fn();

    middleware.use(req, res, next);
    res.emit("finish");

    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        duration_ms: expect.any(Number),
        status_code: 201,
      }),
      "POST /api/students",
    );

    const loggedPayload = (logger.info as jest.Mock).mock.calls[0][0];
    expect(loggedPayload).not.toHaveProperty("request_id");
  });
});
