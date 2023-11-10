import winston from 'winston';
import config from '../config/config';

const logger = winston.createLogger(config.logger);

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
// if (!config.isProd) {
//   logger.add(new winston.transports.Console({
//     format: winston.format.simple(),
//   }));
// }

export default logger;