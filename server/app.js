//Bootstrap express, middlewares and a health route

import express from 'express';
import cors from 'cors';
import pinoHttp from "pino-http";
import { logger } from './config/logger.js';
import { env } from './config/env.js';

// Import models to register them with Mongoose
import './modules/project/model/project.model.js';
import './modules/project/model/task.model.js';
import './modules/project/model/team.model.js';
import './modules/project/model/milestone.model.js';
import './modules/project/model/material.model.js';
import './modules/project/model/meeting.model.js';
import './modules/project/model/progressupdate.model.js';

// Import route modules
import projectRoutes from './modules/project/routes/project.routes.js';
import taskRoutes from './modules/project/routes/task.routes.js';
import teamRoutes from './modules/project/routes/team.routes.js';
import kpiRoutes from './modules/project/routes/kpi.routes.js';
import viewReportRoutes from './modules/project/routes/viewReport.routes.js';
import downloadReportRoutes from './modules/project/routes/downloadReport.routes.js';
import completeArchiveRoutes from './modules/project/routes/completeArchive.routes.js';
import milestoneTimelineRoutes from './modules/project/routes/milestoneTimeline.routes.js';

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

// Register API routes
app.use('/api', projectRoutes);
app.use('/api', taskRoutes);
app.use('/api', teamRoutes);
app.use('/api', kpiRoutes);
app.use('/api', viewReportRoutes);
app.use('/api', downloadReportRoutes);
app.use('/api', completeArchiveRoutes);
app.use('/api', milestoneTimelineRoutes);

export { app };
