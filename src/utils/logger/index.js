import winston from 'winston';

export default function Logger(options) {
    let transports = [];
    if(typeof options.file !== 'undefined') {
        transports.push(new (winston.transports.File)({ filename: options.file }));
    }

    if(options.console) {
        transports.push(new (winston.transports.Console)());
    }

    let logger = new (winston.Logger)({ transports });
    return logger;
}