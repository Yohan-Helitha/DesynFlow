// server/config/logger.js
import pino from "pino";
import { env } from "./env.js";

const isDev = env.NODE_ENV !== "production";

export const logger = pino({
  name: env.APP_NAME,
  level: env.LOG_LEVEL,
  transport: isDev
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined,
});