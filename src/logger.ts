import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",

  // Format level as label string ("info", "error") instead of numeric (30, 50)
  formatters: {
    level: (label: string) => ({ level: label }),
  },
});
