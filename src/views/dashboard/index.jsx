import React, { useState, useEffect } from "react";
import { Row, Col, Card, Statistic, Button, Select, DatePicker, Spin, message } from "antd";
import moment from "moment";
import "./index.less";
import LineChart from "./components/LineChart";
import BarChart from "./components/BarChart";
import RaddarChart from "./components/RaddarChart";
import PieChart from "./components/PieChart";
import TransactionTable from "./components/TransactionTable";
import { getAnalysisData } from "@/api/excel";
import { CONTENT_CATEGORY_MAP, PLATFORM_REVERSE_MAP } from "@/config/dictionaries";
import NoData from "@/components/NoData";

const { Option } = Select;
const { RangePicker } = DatePicker;

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalArticles: 0,
    totalReads: 0,
    totalShares: 0,
    totalLikes: 0,
    avgReads: 0,
    interactionRate: 0
  });
  const [chartData, setChartData] = useState({
    platformDistribution: [],
    contentCategory: [],
    readingTrend: [],
    regionDistribution: [],
    departmentContribution: [],
    interactionStats: []
  });
  const [hotArticles, setHotArticles] = useState([]);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  useEffect(() => {
    fetchData();
  }, [timeRange, dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let params = {};
      if (dateRange) {
        params.startDate = moment(dateRange[0]).format('YYYY-MM-DD');
        params.endDate = moment(dateRange[1]).format('YYYY-MM-DD');
      }
      const response = await getAnalysisData(params);
      if (response.data && response.data.data && response.data.data.length > 0) {
        processData(response.data.data);
        setLastUpdateTime(response.data.lastUpdateTime || null);
      } else {
        // 当没有数据时，重置所有状态
        setStats({
          totalArticles: 0,
          totalReads: 0,
          totalShares: 0,
          totalLikes: 0,
          avgReads: 0,
          interactionRate: 0
        });
        setChartData({
          platformDistribution: [],
          contentCategory: [],
          readingTrend: [],
          regionDistribution: [],
          departmentContribution: [],
          interactionStats: []
        });
        setHotArticles([]);
        setLastUpdateTime(null);
      }
    } catch (error) {
      console.error('获取数据失败:', error);
      message.error('获取数据失败，请检查后端服务是否正常');
    } finally {
      setLoading(false);
    }
  };

  const processData = (data) => {
    setLoading(true);
    
    try {
      console.log('后端返回的数据:', data);
      
      // 1. 计算核心指标
      const totalArticles = data.length;
      const totalReads = data.reduce((sum, item) => sum + (item.reading_count || item['阅读量'] || 0), 0);
      const totalShares = data.reduce((sum, item) => sum + (item.share_count || item['分享量'] || 0), 0);
      const totalLikes = data.reduce((sum, item) => sum + (item.like_count || item['点赞量'] || 0), 0);
      const totalCollections = data.reduce((sum, item) => sum + (item.collect_count || item['收藏量'] || 0), 0);
      const avgReads = totalArticles > 0 ? Math.round(totalReads / totalArticles) : 0;
      const totalInteractions = totalShares + totalLikes + totalCollections;
      const interactionRate = totalReads > 0 ? (totalInteractions / totalReads * 100).toFixed(2) : 0;

      // 2. 平台分布分析
      const platformMap = {};
      data.forEach(item => {
        const platform = item.platform || item['平台'] || '未知';
        platformMap[platform] = (platformMap[platform] || 0) + 1;
      });
      const platformDistribution = Object.entries(platformMap).map(([name, value]) => ({
        name,
        value
      }));

      // 3. 内容分类分析
      const contentMap = {};
      // 内容分类映射表（使用统一配置）
      const contentCategoryMap = CONTENT_CATEGORY_MAP;
      data.forEach(item => {
        let category = item.content_category || item['内容分类'] || '未知';
        // 将数字分类转换为具体名称
        if (contentCategoryMap[category]) {
          category = contentCategoryMap[category];
        }
        contentMap[category] = (contentMap[category] || 0) + 1;
      });
      const contentCategory = Object.entries(contentMap).map(([name, value]) => ({
        name,
        value
      })).sort((a, b) => b.value - a.value);

      // 4. 阅读量趋势
      const dateMap = {};
      data.forEach(item => {
        const publishTime = item.publish_time || item['发布时间'];
        if (publishTime) {
          const date = moment(publishTime).format('YYYY-MM-DD');
          dateMap[date] = (dateMap[date] || 0) + (item.reading_count || item['阅读量'] || 0);
        }
      });
      const readingTrend = Object.entries(dateMap)
        .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
        .map(([date, value]) => ({
          date,
          value
        }));

      // 5. 地域分布分析
      const regionMap = {};
      data.forEach(item => {
        const beijingRatio = item.beijing_ratio || item['京内占比'] || 0;
        const nonBeijingRatio = item.non_beijing_ratio || item['京外占比'] || 0;
        regionMap['京内'] = (regionMap['京内'] || 0) + parseFloat(beijingRatio) || 0;
        regionMap['京外'] = (regionMap['京外'] || 0) + parseFloat(nonBeijingRatio) || 0;
      });
      const regionDistribution = Object.entries(regionMap).map(([name, value]) => ({
        name,
        value: Math.round(value)
      }));

      // 6. 科室贡献分析
      const departmentMap = {};
      data.forEach(item => {
        let department = item.department_category || item['科室分类'] || '未知';
        // 按顿号分割科室名称，分别计算每个科室的贡献
        if (department && department.includes('、')) {
          const departments = department.split('、');
          departments.forEach(dept => {
            if (dept.trim()) {
              departmentMap[dept.trim()] = (departmentMap[dept.trim()] || 0) + 1;
            }
          });
        } else {
          departmentMap[department] = (departmentMap[department] || 0) + 1;
        }
      });
      const departmentContribution = Object.entries(departmentMap).map(([name, value]) => ({
        name,
        value
      }));
      // 确保科室贡献数据至少有2个数据点，避免ECharts雷达图错误
      if (departmentContribution.length < 2) {
        departmentContribution.push({ name: '其他', value: 0 });
      }

      // 7. 互动数据统计
      const interactionStats = [
        { name: '分享量', value: totalShares },
        { name: '点赞量', value: totalLikes },
        { name: '收藏量', value: totalCollections }
      ];

      // 8. 热门文章排行榜
      const hotArticlesList = data
        .sort((a, b) => (b.reading_count || b['阅读量'] || 0) - (a.reading_count || a['阅读量'] || 0))
        .slice(0, 10)
        .map((item, index) => {
          let publishTime = item.publish_time || item['发布时间'] || '';
          // 格式化时间，去除末尾的000Z
          if (publishTime) {
            try {
              publishTime = moment(publishTime).format('YYYY-MM-DD HH:mm:ss');
            } catch (error) {
              console.error('时间格式化错误:', error);
            }
          }
          return {
            key: index + 1,
            rank: index + 1,
            title: item.title || item['标题'] || '',
            platform: item.platform || item['平台'] || '',
            publishTime: publishTime,
            reads: item.reading_count || item['阅读量'] || 0,
            shares: item.share_count || item['分享量'] || 0
          };
        });

      // 更新状态
      setStats({
        totalArticles,
        totalReads,
        totalShares,
        totalLikes,
        avgReads,
        interactionRate
      });

      setChartData({
        platformDistribution,
        contentCategory,
        readingTrend,
        regionDistribution,
        departmentContribution,
        interactionStats
      });

      setHotArticles(hotArticlesList);
    } catch (error) {
      console.error('数据处理失败:', error);
      message.error('数据处理失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeRangeChange = (value) => {
    setTimeRange(value);
    if (value === 'all') {
      // 选择"全部"时，不设置日期范围，查询所有数据
      setDateRange(null);
    } else {
      const end = moment();
      let start;
      switch (value) {
        case '7d':
          start = end.clone().subtract(6, 'days');
          break;
        case '30d':
          start = end.clone().subtract(29, 'days');
          break;
        case '90d':
          start = end.clone().subtract(89, 'days');
          break;
        default:
          start = end.clone().subtract(6, 'days');
      }
      setDateRange([start, end]);
    }
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  return (
    <div className="app-container">
      <Spin spinning={loading} tip="正在处理数据...">
        {/* 数据概览卡片 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic 
                title="总文章数" 
                value={stats.totalArticles} 
                prefix="📝"
                suffix="篇"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic 
                title="总阅读量" 
                value={stats.totalReads} 
                prefix="👁️"
                suffix="次"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic 
                title="总分享量" 
                value={stats.totalShares} 
                prefix="🔗"
                suffix="次"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic 
                title="总点赞量" 
                value={stats.totalLikes} 
                prefix="👍"
                suffix="个"
              />
            </Card>
          </Col>
        </Row>

        {/* 数据趋势选择器 */}
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>数据分析概览</h2>
          <div style={{ display: 'flex', gap: 16 }}>
            <Select 
              value={timeRange} 
              onChange={handleTimeRangeChange}
              style={{ width: 120 }}
            >
              <Option value="all">全部</Option>
              <Option value="7d">最近7天</Option>
              <Option value="30d">最近30天</Option>
              <Option value="90d">最近90天</Option>
            </Select>
            <RangePicker 
              value={dateRange}
              onChange={handleDateRangeChange}
              style={{ width: 300 }}
            />
          </div>
        </div>

        {/* 核心分析图表 */}
        <Row gutter={32} style={{ marginBottom: 32 }}>
          <Col xs={24} sm={24} lg={8}>
            <Card title="平台分布分析">
              <PieChart 
                chartData={chartData.platformDistribution}
                styles={{ height: '300px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={24} lg={8}>
            <Card title="内容分类分析">
              <BarChart 
                chartData={chartData.contentCategory}
                styles={{ height: '300px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={24} lg={8}>
            <Card title="阅读量趋势">
              <LineChart 
                chartData={{
                  expectedData: chartData.readingTrend.map(item => item.value),
                  actualData: chartData.readingTrend.map(item => item.value)
                }}
                styles={{ height: '300px' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={32} style={{ marginBottom: 32 }}>
          <Col xs={24} sm={24} lg={8}>
            <Card title="地域分布分析">
              <PieChart 
                chartData={chartData.regionDistribution}
                styles={{ height: '300px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={24} lg={8}>
            <Card title="科室贡献分析">
              {chartData.departmentContribution.length >= 2 ? (
                <RaddarChart 
                  chartData={chartData.departmentContribution}
                  styles={{ height: '300px' }}
                />
              ) : (
                <NoData style={{ height: '300px' }} />
              )}
            </Card>
          </Col>
          <Col xs={24} sm={24} lg={8}>
            <Card title="互动数据统计">
              <BarChart 
                chartData={chartData.interactionStats}
                styles={{ height: '300px' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 热门文章排行榜 */}
        <Card title="热门文章排行榜" style={{ marginBottom: 32 }}>
          <TransactionTable 
            dataSource={hotArticles}
            columns={[
              { title: '排名', dataIndex: 'rank', key: 'rank' },
              { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true },
              { title: '平台', dataIndex: 'platform', key: 'platform' },
              { title: '发布时间', dataIndex: 'publishTime', key: 'publishTime' },
              { title: '阅读量', dataIndex: 'reads', key: 'reads' },
              { title: '分享量', dataIndex: 'shares', key: 'shares' }
            ]}
          />
        </Card>

        {/* 统计信息 */}
        <Row gutter={16}>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic 
                title="平均阅读量" 
                value={stats.avgReads} 
                prefix="📊"
                suffix="次/篇"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic 
                title="互动率" 
                value={stats.interactionRate} 
                prefix="💬"
                suffix="%"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic 
                title="数据更新时间" 
                value={lastUpdateTime || moment().format('YYYY-MM-DD HH:mm:ss')} 
                prefix="⏰"
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default Dashboard;
