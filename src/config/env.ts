import "dotenv/config";
import { isAbsolute, join, resolve } from "path";

function numberFromEnv(name: string, fallback: number): number {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? value : fallback;
}

const dataPath = process.env.DATA_PATH || "data";
const rawDbPath = process.env.DATABASE_PATH || "notas.sqlite";

const resolvedDbPath = isAbsolute(rawDbPath)
  ? rawDbPath
  : resolve(join(dataPath, rawDbPath));

export const env = {
  appName: process.env.APP_NAME || "Sistema de Notas",
  nodeEnv: process.env.NODE_ENV || "development",
  port: numberFromEnv("PORT", 3000),
  dataPath,
  databasePath: resolvedDbPath,
  passingScore: numberFromEnv("PASSING_SCORE", 6),
  minScore: numberFromEnv("MIN_SCORE", 0),
  maxScore: numberFromEnv("MAX_SCORE", 10),
};
