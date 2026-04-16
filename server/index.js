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

// 导入数据库模型
const Platform = require('./models/Platform');
const ContentCategory = require('./models/ContentCategory');
const DepartmentCategory = require('./models/DepartmentCategory');
const Department = require('./models/Department');

// 导入路由
const platformRoutes = require('./routes/platform');
const contentCategoryRoutes = require('./routes/contentCategory');
const departmentCategoryRoutes = require('./routes/departmentCategory');
const departmentRoutes = require('./routes/department');
const dictionaryRoutes = require('./routes/dictionary');

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
app.use('/', userRoutes);
app.use('/', platformRoutes);
app.use('/', contentCategoryRoutes);
app.use('/', departmentCategoryRoutes);
app.use('/', departmentRoutes);
app.use('/', dictionaryRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 初始化数据
const initializeData = async () => {
  try {
    // 初始化平台数据
    // 先清空现有平台数据
    await Platform.destroy({ where: {} });
    
    const platformData = [
      { code: 'A', name: '微信订阅号', type: 1, description: '微信订阅号平台', status: 1, sort: 1 },
      { code: 'B', name: '微信服务号', type: 1, description: '微信服务号平台', status: 1, sort: 2 },
      { code: 'C', name: '微信视频号', type: 1, description: '微信视频号平台', status: 1, sort: 3 },
      { code: 'D', name: '抖音', type: 1, description: '抖音平台', status: 1, sort: 4 },
      { code: 'E', name: '快手', type: 1, description: '快手平台', status: 1, sort: 5 },
      { code: 'F', name: 'B站', type: 1, description: 'B站平台', status: 1, sort: 6 },
      { code: 'G', name: '小红书', type: 1, description: '小红书平台', status: 1, sort: 7 },
      { code: 'I', name: '喜马拉雅', type: 1, description: '喜马拉雅平台', status: 1, sort: 8 },
      { code: 'J', name: '媒体（电视）', type: 0, description: '电视媒体', status: 1, sort: 9 },
      { code: 'K', name: '媒体（报纸）', type: 0, description: '报纸媒体', status: 1, sort: 10 },
      { code: 'L', name: '媒体（网络）', type: 0, description: '网络媒体', status: 1, sort: 11 },
      { code: 'M', name: '媒体（音频）', type: 0, description: '音频媒体', status: 1, sort: 12 },
      { code: 'X', name: '院报', type: 0, description: '医院内部报纸', status: 1, sort: 13 }
    ];
    
    for (const platform of platformData) {
      await Platform.create(platform);
    }
    
    // 初始化内容分类数据
    const contentCategoryData = [
      { code: '1', name: '医院新闻', description: '医院相关新闻', status: 1, sort: 1 },
      { code: '2', name: '医学科普', description: '医学科普内容', status: 1, sort: 2 },
      { code: '3', name: '就诊信息', description: '就诊相关信息', status: 1, sort: 3 },
      { code: '4', name: '医学人文', description: '医学人文内容', status: 1, sort: 4 },
      { code: '5', name: '医疗技术', description: '医疗技术相关内容', status: 1, sort: 5 },
      { code: '6', name: '其他', description: '其他内容', status: 1, sort: 6 }
    ];
    
    for (const category of contentCategoryData) {
      await ContentCategory.findOrCreate({
        where: { code: category.code },
        defaults: category
      });
    }
    
    // 初始化科室分类数据
    const departmentCategoryData = [
      { code: '1', name: '医技科室', description: '医技科室', status: 1, sort: 1 },
      { code: '2', name: '内科', description: '内科', status: 1, sort: 2 },
      { code: '3', name: '外科', description: '外科', status: 1, sort: 3 },
      { code: '4', name: '职能处室', description: '职能处室', status: 1, sort: 4 },
      { code: '5', name: '急诊内科', description: '急诊内科', status: 1, sort: 5 },
      { code: '6', name: '分院区', description: '分院区', status: 1, sort: 6 },
      { code: '7', name: '医院', description: '医院', status: 1, sort: 7 }
    ];
    
    for (const category of departmentCategoryData) {
      await DepartmentCategory.findOrCreate({
        where: { code: category.code },
        defaults: category
      });
    }
    
    // 初始化科室数据
    const departmentData = [
      { code: '1', name: '药学部', departmentCategoryId: null, description: '药学部', status: 1, sort: 1 },
      { code: '2', name: '麻醉科', departmentCategoryId: null, description: '麻醉科', status: 1, sort: 2 },
      { code: '3', name: '内分泌科', departmentCategoryId: null, description: '内分泌科', status: 1, sort: 3 },
      { code: '4', name: '风湿免疫科', departmentCategoryId: null, description: '风湿免疫科', status: 1, sort: 4 },
      { code: '5', name: '呼吸与危重症医学科', departmentCategoryId: null, description: '呼吸与危重症医学科', status: 1, sort: 5 },
      { code: '6', name: '中医科', departmentCategoryId: null, description: '中医科', status: 1, sort: 6 },
      { code: '7', name: '耳鼻喉科', departmentCategoryId: null, description: '耳鼻喉科', status: 1, sort: 7 },
      { code: '8', name: '心血管内科', departmentCategoryId: null, description: '心血管内科', status: 1, sort: 8 },
      { code: '9', name: '消化科', departmentCategoryId: null, description: '消化科', status: 1, sort: 9 },
      { code: '10', name: '神经内科', departmentCategoryId: null, description: '神经内科', status: 1, sort: 10 },
      { code: '11', name: '儿科', departmentCategoryId: null, description: '儿科', status: 1, sort: 11 },
      { code: '12', name: '临床营养科', departmentCategoryId: null, description: '临床营养科', status: 1, sort: 12 },
      { code: '13', name: '骨科', departmentCategoryId: null, description: '骨科', status: 1, sort: 13 },
      { code: '14', name: '成形科', departmentCategoryId: null, description: '成形科', status: 1, sort: 14 },
      { code: '15', name: '运动医学科', departmentCategoryId: null, description: '运动医学科', status: 1, sort: 15 },
      { code: '16', name: '普通外科', departmentCategoryId: null, description: '普通外科', status: 1, sort: 16 },
      { code: '17', name: '生殖医学中心', departmentCategoryId: null, description: '生殖医学中心', status: 1, sort: 17 },
      { code: '18', name: '科研处', departmentCategoryId: null, description: '科研处', status: 1, sort: 18 },
      { code: '19', name: '宣传中心', departmentCategoryId: null, description: '宣传中心', status: 1, sort: 19 },
      { code: '20', name: '门诊部', departmentCategoryId: null, description: '门诊部', status: 1, sort: 20 },
      { code: '21', name: '信息管理与大数据中心', departmentCategoryId: null, description: '信息管理与大数据中心', status: 1, sort: 21 },
      { code: '22', name: '医务处', departmentCategoryId: null, description: '医务处', status: 1, sort: 22 },
      { code: '23', name: '互联网医院办公室', departmentCategoryId: null, description: '互联网医院办公室', status: 1, sort: 23 },
      { code: '24', name: '急诊科', departmentCategoryId: null, description: '急诊科', status: 1, sort: 24 },
      { code: '25', name: '海淀北部院区', departmentCategoryId: null, description: '海淀北部院区', status: 1, sort: 25 },
      { code: '26', name: '皮肤科', departmentCategoryId: null, description: '皮肤科', status: 1, sort: 26 },
      { code: '27', name: '医院', departmentCategoryId: null, description: '医院', status: 1, sort: 27 }
    ];
    
    for (const department of departmentData) {
      await Department.findOrCreate({
        where: { code: department.code },
        defaults: department
      });
    }
    
    info('初始化数据成功');
  } catch (err) {
    error('初始化数据失败:', err);
  }
};

// 同步数据库模型
sequelize.sync({ alter: true })
  .then(() => {
    info('数据库模型同步成功');
    // 初始化数据
    return initializeData();
  })
  .then(() => {
    // 启动服务器
    app.listen(PORT, () => {
      info(`服务器运行在 http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    error('数据库模型同步失败:', err);
  });