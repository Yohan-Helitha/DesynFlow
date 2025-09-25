//Bootstrap express, middlewares and a health route

import express from 'express';
import cors from 'cors';
import pinoHttp from "pino-http";
import { logger } from './config/logger.js';
import { env } from './config/env.js';


// Import finance routes

// Ensure finance models are registered before using routes
import './modules/finance/model/index.js';

import expensesRoute from './modules/finance/routes/expensesRoutes.js';
import inspectionEstimationRoute from './modules/finance/routes/inspectionEstimationRoutes.js';
import projectEstimationRoute from './modules/finance/routes/projectEstimationRoutes.js';
import paymentRoute from './modules/finance/routes/paymentRoutes.js';

import quotationRoute from './modules/finance/routes/quotationRoutes.js';
import purchaseOrderRoute from './modules/finance/routes/purchaseOrderRoutes.js';
import warrantyRoute from './modules/finance/routes/warrantyRoutes.js';
import claimRoute from './modules/finance/routes/claimRoutes.js';
import notificationRoute from './modules/finance/routes/notificationRoutes.js';

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
app.use('/api/quotations', quotationRoute);
app.use('/api/purchase-orders', purchaseOrderRoute);
app.use('/api/warranties', warrantyRoute);
app.use('/api/claims', claimRoute);
app.use('/api/notifications', notificationRoute);

export { app };