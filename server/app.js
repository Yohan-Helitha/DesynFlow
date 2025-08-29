//Bootstrap express, middlewares and a health route

import express from 'express';
import cors from 'cors';
import pinoHttp from "pino-http";
import { logger } from './config/logger.js';
import { env } from './config/env.js';

const app = express();

app.use(
  pinoHttp({
    logger,
    customLogLevel: function (res, err) {
      if (res.statusCode >= 500 || err) return "error";
      if (res.statusCode >= 400) return "warn";
      return "info";
    },
  })
);

app.use(cors()); // from allowing cors API can request different origins(not restrcit to one port)
app.use(express.json({limit: '2mb'})); // parse json body
app.use(express.urlencoded({ extended: true })); // parse urlencoded body

import authRouter from "./modules/auth/routes/authRouter.js";
// If you have a userRouter, import it as well:
// import userRouter from "./modules/auth/routes/userRouter.js";

app.use("/api/auth", authRouter);
// app.use("/api/user", userRouter); // Uncomment and import if userRouter exists

app.get("/health", (req, res) => {
  res.json({
    name: env.APP_NAME,
    env: env.NODE_ENV,
    status: "ok",
    time: new Date().toISOString(),
  });
});

export { app };
