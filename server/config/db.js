// db configuration

import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

mongoose.set('strictQuery', true);

export async function connectDB() {

    const uri = env.MONGO_URI;

    try {
        
        await mongoose.connect(uri, {
            autoIndex: true,
            serverSelectionTimeoutMS: 20000,
            socketTimeoutMS: 45000,
            maxPoolSize : 10, 
        });

        logger.info("Mongo DB connected successfully.")

    } catch (error) {

        logger.error({ error }, "MongoDB connection failed");
        throw error;
    }

    mongoose.connection.on("error", (error) => {
        logger.error({ error }, "MongoDB connection error");
    });

    mongoose.connection.on("disconnected", () => {
        logger.warn("MongoDB disconnected");
    });

}


export async function disconnectedDB() {
    await mongoose.connection.close();
    logger.info("MongoDB disconnected");
}