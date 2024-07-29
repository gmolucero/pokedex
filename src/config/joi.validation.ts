import * as joi from 'joi';

export const joiValidationSchema = joi.object({
    PORT: joi.number().default(3000),
    NODE_ENV: joi.string().default('dev'),
    MONGO_URI: joi.string().required(),
    DEFAULT_LIMIT: joi.number().default(10),
    DEFAULT_OFFSET: joi.number().default(0),
});