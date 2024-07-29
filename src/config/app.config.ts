export const appConfig = () => ({
    environment: process.env.NODE_ENV || 'development',
    mongoUri: process.env.MONGO_URI,
    port: parseInt(process.env.PORT, 10) || 3000,
    defaultLimit: parseInt(process.env.DEFAULT_LIMIT, 10) || 10,
    defaultOffset: parseInt(process.env.DEFAULT_OFFSET, 10) || 0,
});