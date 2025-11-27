import { config as dotenvConfig } from "dotenv";

dotenvConfig();

const _config = {
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
};

export default Object.freeze(_config);
