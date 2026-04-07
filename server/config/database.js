const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

// 优先加载本地环境变量文件，如果不存在则使用服务器路径
const localEnvPath = path.join(__dirname, '../.env');
const serverEnvPath = '/www/wwwroot/bj3h/server/.env';

if (fs.existsSync(localEnvPath)) {
  require('dotenv').config({ path: localEnvPath });
} else if (fs.existsSync(serverEnvPath)) {
  require('dotenv').config({ path: serverEnvPath });
} else {
  // 如果都不存在，尝试默认加载（dotenv会在当前目录查找）
  require('dotenv').config();
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development'
  }
);

// 测试数据库连接
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');
  } catch (error) {
    console.error('数据库连接失败:', error);
  }
};

testConnection();

module.exports = sequelize;