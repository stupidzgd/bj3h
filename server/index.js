// 禁用Node.js更新通知，避免访问缓存文件
process.env.NODE_NO_WARNINGS = '1';
process.env.NPM_CONFIG_UPDATE_NOTIFIER = 'false';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/database');
const excelDataRoutes = require('./routes/excelData');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 路由
app.use('/api/excel', excelDataRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log('数据库连接已建立，请手动执行 sql/create_tables.sql 文件创建表结构');
});