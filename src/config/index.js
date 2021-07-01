require("dotenv").config();
module.exports = {
    DB: process.env.APP_DB,
    PORT: process.env.APP_PORT,
    JWT_SECRET: process.env.APP_SECRET,
    JWT_SECRET_REFRESH: process.env.APP_SECRET_REFRESH,
    CRYPTO_ALGORITHM : process.env.APP_CRYPTOGRAPHIC_ALGORITHM,
    CRYPTO_PASSWORD: process.env.APP_CRYPTOGRAPHIC_PASSWORD,
    APP_NODE_ENV: process.env.APP_NODE_ENV,
    APP_GEOCODER_PROVIDER: process.env.APP_GEOCODER_PROVIDER,
    APP_GEOCODER_API: process.env.APP_GEOCODER_API,
    APP_OPENROUTESERVICE_API_KEY: process.env.APP_OPENROUTESERVICE_API_KEY,
    FILE_DIRECTORY: process.cwd()
}