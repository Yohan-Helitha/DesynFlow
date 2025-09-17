//Bootstrap express, middlewares and a health route

import express from 'express';
import cors from 'cors';
import pinoHttp from "pino-http";
import { logger } from './config/logger.js';
import { env } from './config/env.js';


// Import finance routes
import expensesRoute from './modules/finance/routes/expensesRoutes.js';
import inspectionEstimationRoute from './modules/finance/routes/inspectionEstimationRoutes.js';
import projectEstimationRoute from './modules/finance/routes/projectEstimationRoutes.js';
import paymentRoute from './modules/finance/routes/paymentRoutes.js';

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

app.get("/health", (req, res) => {
  res.json({
    name: env.APP_NAME,
    env: env.NODE_ENV,
    status: "ok",
    time: new Date().toISOString(),
  });
});

// Finance module routes

app.use('/api/expenses', expensesRoute);
app.use('/api/inspection-estimation', inspectionEstimationRoute);

app.use('/api/project-estimation', projectEstimationRoute);
app.use('/api/payments', paymentRoute);

export { app };