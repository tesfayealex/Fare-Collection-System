const {createLogger , format, transports} = require('winston');
const env = require('./index');
require('winston-daily-rotate-file');
const { combine, timestamp, label, printf } = format;
//var fs = require('fs')
//var morgan = require('morgan')
var path = require('path')
var rfs = require('rotating-file-stream');
var config = require('./index');
// const logger = createLogger({
//     transports: [
//          new transports.File({
//              filename: 'Information.log',
//              level: 'info',
//              format: format.combine(format.timestamp(),format.json())
//          }),
//          new transports.File({
//             filename: 'Error.log',
//             level: 'error',
//             format: format.combine(format.timestamp(),format.json())
//         }),
//         new transports.File({
//             filename: 'debug.log',
//             level: 'debug',
//             format: format.combine(format.timestamp(),format.json())
//         }),

//     ]
// })
var logger = new createLogger();

//console.log(env.APP_NODE_ENV)

if(env.APP_NODE_ENV == 'production'){
   // console.log(path.join(config.FILE_DIRECTORY, 'logs/Information','Information.log'))
   // console.log('come on')
  logger.add(
    new transports.DailyRotateFile({
       // path: ,
        filename: path.join(config.FILE_DIRECTORY, 'logs/Information','Information.log'),
        datePattern: 'DD-MM-YYYY',
        level: 'info',
        format: format.combine(format.timestamp(),format.json())
    }) )
   logger.add( 
   new  transports.DailyRotateFile({
       filename: path.join(config.FILE_DIRECTORY, 'logs/Error','Error.log'),
       datePattern: 'DD-MM-YYYY',
       level: 'error',
      format: format.combine(format.timestamp(),format.splat()),
      handleExceptions: true,
      handleRejections: true
   })
             )
}
if( env.APP_NODE_ENV == 'development'){
   logger.add(
       new transports.Console({
           // filename: 'debug.log',
            level: 'debug',
            format: format.simple(),
           handleExceptions: true,
           handleRejections: true
        })
    )
}


// logger.add(
//     new transports.File({
//         filename: 'exceptions.log', 
//         format: format.splat(),
//         handleExceptions: true,
//     }) ) 
// logger.add(
//         new transports.Console({
//          //   filename: 'rejections.log', 
//             format: format.simple(),
//            handleRejections: true,
//         }) )   
// logger.exceptions.handle(
//     new transports.File({ 
//         filename: 'exceptions.log', 
//         format: format.simple()
//                         })
//                      )
// logger.rejections.handle(
//     new transports.File({ 
//         filename: 'exceptions.log',
//         format: format.simple()
//                         })
//     ) 
    logger.exitOnError = false;   
    
var accessLogStream = rfs.createStream('access.log', {
        interval: '1d', // rotate daily
        path: path.join(config.FILE_DIRECTORY, '/logs/log')
      })    

module.exports = {
    logger,
    accessLogStream
}

