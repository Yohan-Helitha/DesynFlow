
const express = require("express");
const dotenv = require("dotenv");
const { connectDB, disconnectedDB } = require("./config/db.js");

const { logger } = require("./config/logger.js");
const { app } = require("./app.js");
const { env } = require("./config/env.js");

dotenv.config();

const onShutdown = async (signal) => {
  
    logger.warn(`${signal} received : shutting down gracefully....`);

    try {
        await disconnectedDB();

    } catch (error) {
        logger.error({error}, "Error during disconnection");
    }finally{
        process.exit(0);
    }

};

async function start() {
    try {
        await connectDB();
        const server = app.listen(env.PORT, () => {
            logger.info(`${env.APP_NAME} running on http://localhost:${env.PORT}`);
        });

        // Graceful shutdown
        ["SIGINT", "SIGTERM"].forEach((sig) => {
            process.on(sig, () => onShutdown(sig));
        });

        // Optional: handle unhandled errors
        process.on("unhandledRejection", (reason) => {
            logger.error({ reason }, "Unhandled Promise Rejection");
        });
        process.on("uncaughtException", (err) => {
            logger.error({ err }, "Uncaught Exception");
            process.exit(1);
        });
    } catch (error) {
        logger.error({ error }, "Error during server startup");
        process.exit(1);
    }
}

start();