const { Op } = require('sequelize');
const sequelize = require('../../config/database');
const MediaPublishData = require('../../models/MediaPublishData');
const ProvinceRatio = require('../../models/ProvinceRatio');

// 生成唯一的测试数据
const generateTestData = (id) => {
  return {
    platform: '微信订阅号',
    article_id: `test${id.toString().padStart(3, '0')}`,
    title: `测试文章${id}`,
    is_first_release: '是',
    publish_time: new Date('2025-06-01'),
    reading_count: 1000,
    share_count: 100,
    link: `http://example.com/${id}`,
    complete_rate: '20%',
    avg_play_time: '120秒',
    like_count: 50,
    collect_count: 20,
    content_category: '2', // 医学科普
    genre_category: '图文',
    department_name: '内科',
    department_category: '内科',
    author: '测试作者',
    source: '原创',
    special_planning: '否',
    video_duration: '02:00',
    hot_search_platform: '微博',
    hot_search_position: '5',
    hot_search_duration: '24',
    hot_search_reading_count: 10000,
    reporter: '测试记者',
    media_column: '测试栏目',
    user_region_distribution: '北京',
    beijing_ratio: '50%',
    non_beijing_ratio: '50%'
  };
};

// 省份数据
const provinceData = [
  { province_name: '北京', ratio: '30%' },
  { province_name: '上海', ratio: '20%' },
  { province_name: '广东', ratio: '15%' }
];

describe('ExcelData 模型测试', () => {
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

  test('创建媒体发布数据', async () => {
    // 创建媒体发布数据
    const testData = generateTestData(1);
    const mediaData = await MediaPublishData.create(testData);
    
    // 验证数据创建成功
    expect(mediaData).toBeDefined();
    expect(mediaData.article_id).toBe(testData.article_id);
    expect(mediaData.title).toBe(testData.title);
    expect(mediaData.platform).toBe(testData.platform);
  });

  test('创建省份数据', async () => {
    // 创建媒体发布数据
    const testData = generateTestData(2);
    const mediaData = await MediaPublishData.create(testData);
    
    // 创建省份数据
    for (const province of provinceData) {
      const provinceRatio = await ProvinceRatio.create({
        ...province,
        media_publish_id: mediaData.id
      });
      
      expect(provinceRatio).toBeDefined();
      expect(provinceRatio.province_name).toBe(province.province_name);
      expect(provinceRatio.ratio).toBe(province.ratio);
      expect(provinceRatio.media_publish_id).toBe(mediaData.id);
    }
  });

  test('查询媒体发布数据', async () => {
    // 创建测试数据
    const testData = generateTestData(3);
    await MediaPublishData.create(testData);
    
    // 查询数据
    const data = await MediaPublishData.findAll({
      where: {
        platform: testData.platform
      }
    });
    
    expect(data.length).toBeGreaterThan(0);
    expect(data[0].platform).toBe(testData.platform);
  });

  test('按日期范围查询', async () => {
    // 创建测试数据
    const testData = generateTestData(4);
    await MediaPublishData.create(testData);
    
    // 按日期范围查询
    const startDate = '2025-05-01';
    const endDate = '2025-07-01';
    
    const data = await MediaPublishData.findAll({
      where: {
        publish_time: {
          [Op.between]: [new Date(startDate), new Date(endDate + ' 23:59:59')]
        }
      }
    });
    
    expect(data.length).toBeGreaterThan(0);
  });

  test('更新媒体发布数据', async () => {
    // 创建测试数据
    const testData = generateTestData(5);
    const mediaData = await MediaPublishData.create(testData);
    
    // 更新数据
    const updatedData = await mediaData.update({
      title: '更新后的标题'
    });
    
    expect(updatedData.title).toBe('更新后的标题');
  });

  test('删除媒体发布数据', async () => {
    // 创建测试数据
    const testData = generateTestData(6);
    const mediaData = await MediaPublishData.create(testData);
    const id = mediaData.id;
    
    // 删除数据
    await mediaData.destroy();
    
    // 验证数据已删除
    const deletedData = await MediaPublishData.findByPk(id);
    expect(deletedData).toBeNull();
  });
});
