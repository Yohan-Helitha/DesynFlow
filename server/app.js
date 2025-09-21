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
import userRouter from "./modules/auth/routes/userRouter.js";
import paymentReceiptRoutes from "./modules/auth/routes/paymentReceiptRoutes.js";
import inspectorLocationRoutes from "./modules/auth/routes/inspectorLocationRoutes.js";
import assignmentRoutes from "./modules/auth/routes/assignmentRoutes.js";
import reportRoutes from "./modules/auth/routes/reportRoutes.js";
import inspectionRequestRoutes from "./modules/auth/routes/inspectionRequestRoutes.js";


app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/payment-receipt", paymentReceiptRoutes);
app.use("/api/inspector-location", inspectorLocationRoutes);
app.use("/api/assignment", assignmentRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/inspection-request", inspectionRequestRoutes);

app.get("/health", (req, res) => {
  res.json({
    name: env.APP_NAME,
    env: env.NODE_ENV,
    status: "ok",
    time: new Date().toISOString(),
  });
});

export { app };
