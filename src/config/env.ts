import "dotenv/config";

function numberFromEnv(name: string, fallback: number): number {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? value : fallback;
}

export const env = {
  appName: process.env.APP_NAME || "Sistema de Notas",
  nodeEnv: process.env.NODE_ENV || "development",
  port: numberFromEnv("PORT", 3000),
  databasePath: process.env.DATABASE_PATH || "data/notas.sqlite",
  passingScore: numberFromEnv("PASSING_SCORE", 6),
  minScore: numberFromEnv("MIN_SCORE", 0),
  maxScore: numberFromEnv("MAX_SCORE", 10),
};
