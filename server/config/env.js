// database URI configuration using .env file

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load from current working directory first (if present)
dotenv.config();

// Also load server/.env so seeds run from subfolders still find MONGO_URI
try {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const serverEnvPath = path.resolve(__dirname, '..', '.env');
    dotenv.config({ path: serverEnvPath, override: false });
} catch {}

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
    // Optional: company location and pricing for inspections
    COMPANY_LAT: process.env.COMPANY_LAT ? Number(process.env.COMPANY_LAT) : undefined,
    COMPANY_LNG: process.env.COMPANY_LNG ? Number(process.env.COMPANY_LNG) : undefined,
    COMPANY_ADDRESS: process.env.COMPANY_ADDRESS || undefined,
    INSPECTION_BASE_FARE: process.env.INSPECTION_BASE_FARE ? Number(process.env.INSPECTION_BASE_FARE) : 0,
    INSPECTION_COST_PER_KM: process.env.INSPECTION_COST_PER_KM ? Number(process.env.INSPECTION_COST_PER_KM) : 0,
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || undefined,
};
