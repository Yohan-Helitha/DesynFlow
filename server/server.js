import { app } from './app.js';
import { env } from './config/env.js';
import { connectDB, disconnectedDB } from './config/db.js';
import { logger } from './config/logger.js';

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

        const { app } = await import('./app.js');
        const PORT = env.PORT || 3000;
        const server = app.listen(PORT, () => {
            logger.info(`${env.APP_NAME} running on http://localhost:${PORT}`);   

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