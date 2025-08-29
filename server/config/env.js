
// database URI configuration using .env file

import dotenv from 'dotenv';

dotenv.config();

//validation
const required = (key, fallback = undefined) => {

    const val = process.env[key] ?? fallback;

    if(val == undefined || val == ""){

        throw new Error(`Missing environment variable: ${key}`);
    }

    return val;

};

export const env = {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: parseInt(process.env.PORT || "4000", 10),
    MONGO_URI: required("MONGO_URI"), // cluster URI or local later
    LOG_LEVEL: process.env.LOG_LEVEL || "info",
    APP_NAME: process.env.APP_NAME || "DesynFlow",
};
