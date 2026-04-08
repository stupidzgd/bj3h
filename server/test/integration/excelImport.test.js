const request = require('supertest');
const express = require('express');
const sequelize = require('../../config/database');
const MediaPublishData = require('../../models/MediaPublishData');
const ProvinceRatio = require('../../models/ProvinceRatio');

// 导入路由
const excelDataRoutes = require('../../routes/excelData');

// 创建测试应用
const app = express();
app.use(express.json());
app.use('/api/excel', excelDataRoutes);

// 测试数据
const testExcelData = [
  {
    platform: '微信订阅号',
    article_id: 'test001',
    title: '测试文章1',
    is_first_release: '是',
    publish_time: '2025-06-01',
    reading_count: 1000,
    share_count: 100,
    link: 'http://example.com/1',
    complete_rate: '20%',
    avg_play_time: '120秒',
    like_count: 50,
    collect_count: 20,
    content_category: '2',
    genre_category: '图文',
    department_name: '内科',
    department_category: '内科',
    author: '测试作者1',
    source: '原创',
    special_planning: '否',
    video_duration: '02:00',
    hot_search_platform: '微博',
    hot_search_position: '5',
    hot_search_duration: '24',
    hot_search_reading_count: 10000,
    reporter: '测试记者1',
    media_column: '测试栏目1',
    user_region_distribution: '北京',
    beijing_ratio: '50%',
    non_beijing_ratio: '50%',
    '北京': '30%',
    '上海': '20%',
    '广东': '15%'
  },
  {
    platform: '微信视频号',
    article_id: 'test002',
    title: '测试文章2',
    is_first_release: '否',
    publish_time: '2025-06-02',
    reading_count: 2000,
    share_count: 200,
    link: 'http://example.com/2',
    complete_rate: '30%',
    avg_play_time: '180秒',
    like_count: 100,
    collect_count: 40,
    content_category: '1',
    genre_category: '视频',
    department_name: '外科',
    department_category: '外科',
    author: '测试作者2',
    source: '央视新闻',
    special_planning: '是',
    video_duration: '03:00',
    hot_search_platform: '抖音',
    hot_search_position: '3',
    hot_search_duration: '48',
    hot_search_reading_count: 20000,
    reporter: '测试记者2',
    media_column: '测试栏目2',
    user_region_distribution: '全国',
    beijing_ratio: '30%',
    non_beijing_ratio: '70%',
    '北京': '30%',
    '上海': '25%',
    '广东': '20%'
  }
];

describe('Excel数据导入集成测试', () => {
  beforeAll(async () => {
    // 确保数据库连接
    await sequelize.authenticate();
    // 同步模型
    await MediaPublishData.sync({ alter: true });
    await ProvinceRatio.sync({ alter: true });
  });

  afterAll(async () => {
    // 清理测试数据
    await ProvinceRatio.destroy({ where: {} });
    await MediaPublishData.destroy({ where: {} });
    // 关闭数据库连接
    await sequelize.close();
  });

  test('导入Excel数据', async () => {
    // 发送导入请求
    const response = await request(app)
      .post('/api/excel/import')
      .send({ data: testExcelData })
      .set('Content-Type', 'application/json');
    
    // 验证响应
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.total).toBe(testExcelData.length);
    expect(response.body.created).toBe(testExcelData.length);
  });

  test('获取所有数据', async () => {
    // 先导入数据
    await request(app)
      .post('/api/excel/import')
      .send({ data: testExcelData })
      .set('Content-Type', 'application/json');
    
    // 获取所有数据
    const response = await request(app).get('/api/excel/all');
    
    // 验证响应
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test('按条件查询数据', async () => {
    // 先导入数据
    await request(app)
      .post('/api/excel/import')
      .send({ data: testExcelData })
      .set('Content-Type', 'application/json');
    
    // 按条件查询
    const response = await request(app)
      .post('/api/excel/query')
      .send({
        platform: '微信订阅号',
        startDate: '2025-05-01',
        endDate: '2025-07-01'
      })
      .set('Content-Type', 'application/json');
    
    // 验证响应
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].platform).toBe('微信订阅号');
  });

  test('删除数据', async () => {
    // 先导入数据
    await request(app)
      .post('/api/excel/import')
      .send({ data: testExcelData })
      .set('Content-Type', 'application/json');
    
    // 获取数据ID
    const getDataResponse = await request(app).get('/api/excel/all');
    const dataId = getDataResponse.body[0].id;
    
    // 删除数据
    const deleteResponse = await request(app).delete(`/api/excel/delete/${dataId}`);
    
    // 验证响应
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.success).toBe(true);
  });

  test('批量删除数据', async () => {
    // 先导入数据
    await request(app)
      .post('/api/excel/import')
      .send({ data: testExcelData })
      .set('Content-Type', 'application/json');
    
    // 获取文章ID列表
    const getDataResponse = await request(app).get('/api/excel/all');
    const articleIds = getDataResponse.body.map(item => item.article_id);
    
    // 批量删除数据
    const deleteResponse = await request(app)
      .post('/api/excel/delete')
      .send({ articleIds })
      .set('Content-Type', 'application/json');
    
    // 验证响应
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.message).toBe(`成功删除 ${articleIds.length} 条数据`);
  });

  test('清空所有数据', async () => {
    // 先导入数据
    await request(app)
      .post('/api/excel/import')
      .send({ data: testExcelData })
      .set('Content-Type', 'application/json');
    
    // 清空数据
    const clearResponse = await request(app).delete('/api/excel/clear');
    
    // 验证响应
    expect(clearResponse.status).toBe(200);
    expect(clearResponse.body.success).toBe(true);
    
    // 验证数据已清空
    const getDataResponse = await request(app).get('/api/excel/all');
    expect(getDataResponse.body.length).toBe(0);
  });
});
