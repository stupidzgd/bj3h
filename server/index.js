// 禁用Node.js更新通知，避免访问缓存文件
process.env.NODE_NO_WARNINGS = '1';
process.env.NPM_CONFIG_UPDATE_NOTIFIER = 'false';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/database');
const excelDataRoutes = require('./routes/excelData');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const { loggerMiddleware, info, error } = require('./config/logger');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());

// 日志中间件
app.use(loggerMiddleware);

// 处理原始请求体的中间件
app.use(bodyParser.json({ 
  strict: false, // 允许解析非严格的 JSON 格式
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (err) {
      // 如果 JSON 解析失败，使用原始字符串作为请求体
      req.rawBody = buf.toString();
      info(`JSON 解析失败，使用原始请求体: ${req.rawBody}`);
    }
  }
}));

app.use(bodyParser.urlencoded({ extended: true }));

// 处理原始请求体的中间件
app.use((req, res, next) => {
  if (req.rawBody && !req.body) {
    // 如果 bodyParser 解析失败，使用原始字符串作为请求体
    req.body = req.rawBody;
    info(`使用原始请求体: ${req.body}`);
  }
  next();
});

// 路由
app.use('/api/excel', excelDataRoutes);
app.use('/', authRoutes);
app.use('/api', userRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 启动服务器
app.listen(PORT, () => {
  info(`服务器运行在 http://localhost:${PORT}`);
});