const loggly = require('loggly-jslogger');

const logger = new loggly.LogglyTracker();

logger.push({ 'logglyKey': process.env.LOGLY_KEY });

logger.push({
  tag: 'info',
  pageName: 'util',
  details: 'logger successfully initialized'
});

export default logger;