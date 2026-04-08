const fs = require('fs');
const path = require('path');

// 确保日志目录存在
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 日志文件路径
const logFile = path.join(logDir, 'app.log');

// 日志级别
const levels = {
  info: 'INFO',
  error: 'ERROR',
  warn: 'WARN',
  debug: 'DEBUG'
};

// 写入日志到文件
function writeLog(level, message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${level}] ${message}\n`;
  
  fs.appendFile(logFile, logEntry, (err) => {
    if (err) {
      console.error('写入日志文件失败:', err);
    }
  });
  
  // 同时输出到控制台
  console.log(`[${timestamp}] [${level}] ${message}`);
}

// 日志中间件
function loggerMiddleware(req, res, next) {
  const start = Date.now();
  const { method, url, body, headers } = req;
  
  // 记录请求信息
  writeLog(levels.info, `Request: ${method} ${url} - IP: ${headers['x-forwarded-for'] || req.ip}`);
  
  // 监听响应结束事件
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    // 记录响应信息
    writeLog(levels.info, `Response: ${method} ${url} - Status: ${statusCode} - Duration: ${duration}ms`);
  });
  
  next();
}

// 导出日志方法和中间件
module.exports = {
  info: (message) => writeLog(levels.info, message),
  error: (message) => writeLog(levels.error, message),
  warn: (message) => writeLog(levels.warn, message),
  debug: (message) => writeLog(levels.debug, message),
  loggerMiddleware
};