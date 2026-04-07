import React, { Component } from "react";
import { Tabs, Card, Button, message, Table, Row, Col, DatePicker, Spin } from "antd";
import { connect } from "react-redux";
import echarts from "@/lib/echarts";
import { debounce } from "@/utils";
import moment from "moment";
import * as XLSX from "xlsx";
import { getAnalysisData } from "@/api/excel";

const { TabPane } = Tabs;

class DataAnalysis extends Component {
  state = {
    analysisData: [],
    loading: true,
    charts: {},
    activeTab: 'time',
    dateRange: null
  };

  // 图表容器引用
  chartRefs = {
    'time-chart': null,
    'platform-bar-chart': null,
    'platform-chart': null,
    'first-release-chart': null,
    'content-chart': null,
    'influence-chart': null,
    'user-chart': null,
    'creation-chart': null,
    'department-category-chart': null,
    'genre-category-chart': null
  };

  componentDidMount() {
    // 从后端获取数据
    this.fetchData();
    
    // 监听窗口大小变化
    window.addEventListener("resize", () => this.resizeCharts());
  }

  // 从后端获取数据
  fetchData = async () => {
    this.setState({ loading: true });
    try {
      // 准备请求参数，包含日期范围
      const params = {
        startDate: this.state.dateRange && this.state.dateRange[0] ? this.state.dateRange[0].format('YYYY-MM-DD') : undefined,
        endDate: this.state.dateRange && this.state.dateRange[1] ? this.state.dateRange[1].format('YYYY-MM-DD') : undefined
      };
      
      const response = await getAnalysisData(params);
      console.log('从后端获取的数据长度:', response.data.length);
      console.log('从后端获取的数据前5条:', response.data.slice(0, 5));
      
      // 转换数据格式，适配前端需要的格式
      const formattedData = response.data.map(item => {
        // 转换字段名，从 snake_case 转换为 中文
        const formattedItem = {
          '平台': item.platform || '',
          '文章ID': item.article_id || '',
          '标题': item.title || '',
          '是否首发': item.is_first_release || '',
          '发布时间': item.publish_time ? moment(item.publish_time).format('YYYY-MM-DD HH:mm:ss') : '',
          '阅读量': item.reading_count || 0,
          '分享量': item.share_count || 0,
          '链接': item.link || '',
          '完播率': item.complete_rate || '',
          '平均播放时长': item.avg_play_time || '',
          '点赞量': item.like_count || 0,
          '收藏量': item.collect_count || 0,
          '内容分类': item.content_category || '',
          '体裁分类': item.genre_category || '',
          '科室名称': item.department_name || '',
          '科室分类': item.department_category || '',
          '作者': item.author || '',
          '来源': item.source || '',
          '专项策划': item.special_planning || '',
          '视频时长': item.video_duration || '',
          '热搜平台': item.hot_search_platform || '',
          '热搜榜最高位置': item.hot_search_position || '',
          '在榜时长': item.hot_search_duration || '',
          '热搜阅读量': item.hot_search_reading_count || 0,
          '记者': item.reporter || '',
          '具体栏目': item.media_column || '',
          '用户地域分布': item.user_region_distribution || '',
          '京内占比': item.beijing_ratio || '',
          '京外占比': item.non_beijing_ratio || '',
          '导入时间': item.import_time ? moment(item.import_time).format('YYYY-MM-DD HH:mm:ss') : ''
        };
        
        // 如果有省份占比数据，添加到 formattedItem 中
        if (item.provinceRatios && item.provinceRatios.length > 0) {
          item.provinceRatios.forEach(provinceRatio => {
            formattedItem[provinceRatio.province_name] = provinceRatio.ratio;
          });
        }
        
        return formattedItem;
      });
      
      this.setState({ analysisData: formattedData }, () => {
        // 数据加载完成后初始化图表
        this.initCharts();
      });
    } catch (error) {
      console.error('获取数据失败:', error);
      message.error('获取数据失败，请检查后端服务是否正常');
      this.setState({ loading: false });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // 当日期范围变化时，重新初始化图表
    if (prevState.dateRange !== this.state.dateRange) {
      this.initCharts();
    }
  }

  // 初始化所有图表
  initCharts() {
    if (this.state.analysisData.length > 0) {
      // 检查数据结构
      console.log('数据长度:', this.state.analysisData.length);
      console.log('第一条数据:', this.state.analysisData[0]);
      console.log('是否包含平台字段:', '平台' in this.state.analysisData[0]);
      
      // 确保DOM已渲染完成
      setTimeout(() => {
        console.log('开始初始化所有图表');
        this.initTimeChart();
        this.initPlatformChart();
        this.initPlatformBarChart();
        this.initFirstReleaseChart();
        this.initContentChart();
        this.initUserChart();
        this.initCreationChart();
        console.log('图表初始化完成');
        // 数据加载完成，设置 loading 为 false
        this.setState({ loading: false });
      }, 500); // 增加延迟时间
    } else {
      // 没有数据，设置 loading 为 false
      this.setState({ loading: false });
    }
  }

  // 处理日期范围变化
  handleDateRangeChange = (dates) => {
    this.setState({ dateRange: dates }, () => {
      // 重新从后端获取数据
      this.fetchData();
    });
  };

  // 处理Tab切换
  handleTabChange = (activeKey) => {
    this.setState({ activeTab: activeKey }, () => {
      // 当切换到不同维度时，重新初始化对应的图表
      setTimeout(() => {
        console.log('切换到维度:', activeKey);
        switch (activeKey) {
          case 'time':
            this.initTimeChart();
            break;
          case 'platform':
            this.initPlatformChart();
            this.initPlatformBarChart();
            break;
          case 'first-release':
            this.initFirstReleaseChart();
            break;
          case 'content':
            this.initContentChart();
            break;
          case 'user':
            this.initUserChart();
            break;
          case 'creation':
            this.initCreationChart();
            break;

          default:
            break;
        }
      }, 100);
    });
  }

  componentWillUnmount() {
    window.removeEventListener("resize", () => this.resizeCharts());
    this.disposeCharts();
  }

  // 销毁所有图表
  disposeCharts() {
    Object.values(this.state.charts).forEach(chart => {
      if (chart) {
        try {
          chart.dispose();
        } catch (error) {
          console.warn('销毁图表时出错:', error);
        }
      }
    });
  }

  // 调整所有图表大小
  resizeCharts() {
    Object.values(this.state.charts).forEach(chart => {
      if (chart) {
        debounce(chart.resize.bind(chart), 300)();
      }
    });
  }

  // 根据日期范围过滤数据
  getFilteredData() {
    const { analysisData, dateRange } = this.state;
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      return analysisData;
    }
    
    const startDate = moment(dateRange[0]).startOf('day');
    const endDate = moment(dateRange[1]).endOf('day');
    
    return analysisData.filter(item => {
      if (item['发布时间']) {
        const itemDate = moment(item['发布时间']);
        return itemDate.isBetween(startDate, endDate, null, '[]');
      }
      return false;
    });
  }

  // 初始化图表
  initChart(containerId, options) {
    console.log('初始化图表:', containerId);
    let container = null;
    
    // 优先使用ref获取容器
    if (this.chartRefs[containerId]) {
      container = this.chartRefs[containerId];
      console.log('通过ref找到容器');
    } else {
      // 其次使用getElementById
      container = document.getElementById(containerId);
      console.log('通过getElementById找到容器:', container);
    }
    
    if (container) {
      console.log('找到容器，开始初始化');
      try {
        // 先销毁已存在的图表
        if (this.state.charts[containerId]) {
          try {
            this.state.charts[containerId].dispose();
          } catch (error) {
            console.warn('销毁图表时出错:', error);
          }
        }
        const chart = echarts.init(container, "macarons");
        chart.setOption(options);
        this.setState(prevState => ({
          charts: {
            ...prevState.charts,
            [containerId]: chart
          }
        }));
        console.log('图表初始化成功:', containerId);
      } catch (error) {
        console.error('图表初始化失败:', error);
      }
    } else {
      console.error('找不到图表容器:', containerId);
    }
  }

  // 时间维度分析
  analyzeByTime() {
    const analysisData = this.getFilteredData();
    if (!analysisData.length) return null;

    console.log('时间维度分析 - 数据长度:', analysisData.length);
    
    // 按月份统计
    const monthlyData = {};
    let validCount = 0;
    let invalidCount = 0;
    
    analysisData.forEach((item, index) => {
      if (item['发布时间']) {
        // 处理完整的日期时间格式，提取YYYY-MM部分
        const month = item['发布时间'].substring(0, 7); // YYYY-MM
        if (!monthlyData[month]) {
          monthlyData[month] = 0;
        }
        monthlyData[month]++;
        validCount++;
      } else {
        invalidCount++;
        console.log('第', index, '条数据缺少发布时间:', item);
      }
    });
    
    console.log('时间维度分析 - 有效数据:', validCount, '无效数据:', invalidCount);
    console.log('时间维度分析 - 月度数据:', monthlyData);

    const tableData = Object.keys(monthlyData).map(month => ({
      key: month,
      month,
      count: monthlyData[month]
    })).sort((a, b) => a.month.localeCompare(b.month));

    // 添加总计行
    const total = tableData.reduce((sum, item) => sum + item.count, 0);
    tableData.push({
      key: 'total',
      month: '总计',
      count: total
    });

    const columns = [
      {
        title: '月份',
        dataIndex: 'month',
        key: 'month',
        render: (text, record) => record.key === 'total' ? <strong>{text}</strong> : text
      },
      {
        title: '发布数量',
        dataIndex: 'count',
        key: 'count',
        render: (text, record) => record.key === 'total' ? <strong>{text}</strong> : text
      },
    ];

    return <Table columns={columns} dataSource={tableData} pagination={false} />;
  }

  // 初始化时间维度图表
  initTimeChart() {
    const analysisData = this.getFilteredData();
    if (!analysisData.length) return;

    // 按月份统计
    const monthlyData = {};
    analysisData.forEach(item => {
      if (item['发布时间']) {
        const month = item['发布时间'].substring(0, 7); // YYYY-MM
        if (!monthlyData[month]) {
          monthlyData[month] = 0;
        }
        monthlyData[month]++;
      }
    });

    const months = Object.keys(monthlyData).sort();
    const counts = months.map(month => monthlyData[month]);

    const options = {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow"
        }
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true
      },
      xAxis: [
        {
          type: "category",
          data: months,
          axisLabel: {
            rotate: 45
          }
        }
      ],
      yAxis: [
        {
          type: "value"
        }
      ],
      series: [
        {
          name: "发布数量",
          type: "bar",
          data: counts,
          itemStyle: {
            color: "#5470c6"
          }
        }
      ]
    };

    this.initChart('time-chart', options);
  }

  // 平台维度分析
  analyzeByPlatform() {
    const analysisData = this.getFilteredData();
    if (!analysisData.length) return null;

    // 按平台统计
    const platformData = {};
    analysisData.forEach(item => {
      if (item['平台']) {
        const platform = item['平台'];
        if (!platformData[platform]) {
          platformData[platform] = 0;
        }
        platformData[platform]++;
      }
    });

    const total = analysisData.length;
    const tableData = Object.keys(platformData).map(platform => ({
      key: platform,
      platform,
      count: platformData[platform],
      percentage: ((platformData[platform] / total) * 100).toFixed(2) + '%'
    })).sort((a, b) => b.count - a.count);

    // 添加总和行
    tableData.push({
      key: 'total',
      platform: '总计',
      count: total,
      percentage: '100.00%'
    });

    const columns = [
      {
        title: '平台',
        dataIndex: 'platform',
        key: 'platform',
        render: (text, record) => record.key === 'total' ? <strong>{text}</strong> : text
      },
      {
        title: '发布数量',
        dataIndex: 'count',
        key: 'count',
        render: (text, record) => record.key === 'total' ? <strong>{text}</strong> : text
      },
      {
        title: '占比',
        dataIndex: 'percentage',
        key: 'percentage',
        render: (text, record) => record.key === 'total' ? <strong>{text}</strong> : text
      },
    ];

    return <Table columns={columns} dataSource={tableData} pagination={false} />;
  }

  // 初始化平台维度柱状图
  initPlatformBarChart() {
    const analysisData = this.getFilteredData();
    if (!analysisData.length) return;

    console.log('初始化平台维度柱状图，数据长度:', analysisData.length);

    // 按平台统计
    const platformData = {};
    analysisData.forEach(item => {
      if (item['平台']) {
        const platform = item['平台'];
        if (!platformData[platform]) {
          platformData[platform] = 0;
        }
        platformData[platform]++;
      }
    });

    console.log('平台数据:', platformData);

    const platforms = Object.keys(platformData).sort((a, b) => platformData[b] - platformData[a]);
    const counts = platforms.map(platform => platformData[platform]);

    console.log('平台列表:', platforms);
    console.log('发布数量:', counts);

    const options = {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow"
        }
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true
      },
      xAxis: [
        {
          type: "category",
          data: platforms,
          axisLabel: {
            rotate: 45
          }
        }
      ],
      yAxis: [
        {
          type: "value"
        }
      ],
      series: [
        {
          name: "发布数量",
          type: "bar",
          data: counts,
          itemStyle: {
            color: "#5470c6"
          }
        }
      ]
    };

    console.log('图表容器是否存在:', document.getElementById('platform-bar-chart'));
    this.initChart('platform-bar-chart', options);
  }

  // 初始化平台维度图表
  initPlatformChart() {
    const analysisData = this.getFilteredData();
    if (!analysisData.length) return;

    console.log('初始化平台维度饼图，数据长度:', analysisData.length);

    // 按平台统计
    const platformData = {};
    analysisData.forEach(item => {
      if (item['平台']) {
        const platform = item['平台'];
        if (!platformData[platform]) {
          platformData[platform] = 0;
        }
        platformData[platform]++;
      }
    });

    const data = Object.keys(platformData).map(platform => ({
      name: platform,
      value: platformData[platform]
    }));

    console.log('饼图数据:', data);

    const options = {
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b}: {c} ({d}%)"
      },
      legend: {
        orient: "vertical",
        left: "left",
        data: Object.keys(platformData)
      },
      series: [
        {
          name: "平台分布",
          type: "pie",
          radius: "60%",
          center: ["60%", "50%"],
          data: data,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)"
            }
          }
        }
      ]
    };

    console.log('饼图容器是否存在:', document.getElementById('platform-chart'));
    this.initChart('platform-chart', options);
  }

  // 是否首发维度分析
  analyzeByFirstRelease() {
    const analysisData = this.getFilteredData();
    if (!analysisData.length) return null;

    // 按是否首发统计
    const firstReleaseData = {
      '是': 0,
      '否': 0
    };

    analysisData.forEach(item => {
      if (item['是否首发']) {
        const status = item['是否首发'].toString().trim();
        if (firstReleaseData.hasOwnProperty(status)) {
          firstReleaseData[status]++;
        }
      }
    });

    const total = analysisData.length;
    const tableData = Object.keys(firstReleaseData).map(status => ({
      key: status,
      status,
      count: firstReleaseData[status],
      percentage: ((firstReleaseData[status] / total) * 100).toFixed(2) + '%'
    }));

    // 添加总和行
    tableData.push({
      key: 'total',
      status: '总计',
      count: total,
      percentage: '100.00%'
    });

    const columns = [
      {
        title: '是否首发',
        dataIndex: 'status',
        key: 'status',
        render: (text, record) => record.key === 'total' ? <strong>{text}</strong> : text
      },
      {
        title: '发布数量',
        dataIndex: 'count',
        key: 'count',
        render: (text, record) => record.key === 'total' ? <strong>{text}</strong> : text
      },
      {
        title: '占比',
        dataIndex: 'percentage',
        key: 'percentage',
        render: (text, record) => record.key === 'total' ? <strong>{text}</strong> : text
      },
    ];

    return <Table columns={columns} dataSource={tableData} pagination={false} />;
  }

  // 初始化是否首发维度图表
  initFirstReleaseChart() {
    const analysisData = this.getFilteredData();
    if (!analysisData.length) return;

    // 按是否首发统计
    const firstReleaseData = {
      '是': 0,
      '否': 0
    };

    analysisData.forEach(item => {
      if (item['是否首发']) {
        const status = item['是否首发'].toString().trim();
        if (firstReleaseData.hasOwnProperty(status)) {
          firstReleaseData[status]++;
        }
      }
    });

    const data = Object.keys(firstReleaseData).map(status => ({
      name: status,
      value: firstReleaseData[status]
    }));

    const options = {
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b}: {c} ({d}%)"
      },
      legend: {
        orient: "vertical",
        left: "left",
        data: Object.keys(firstReleaseData)
      },
      series: [
        {
          name: "是否首发",
          type: "pie",
          radius: "60%",
          center: ["60%", "50%"],
          data: data,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)"
            }
          }
        }
      ]
    };

    this.initChart('first-release-chart', options);
  }

  // 内容维度分析
  analyzeByContent() {
    const analysisData = this.getFilteredData();
    if (!analysisData.length) return null;

    // 按内容分类统计
    const contentData = {};
    analysisData.forEach(item => {
      if (item['内容分类']) {
        const content = item['内容分类'];
        if (!contentData[content]) {
          contentData[content] = 0;
        }
        contentData[content]++;
      }
    });

    const tableData = Object.keys(contentData).map(content => ({
      key: content,
      content,
      count: contentData[content]
    })).sort((a, b) => b.count - a.count);

    // 添加总计行
    const total = tableData.reduce((sum, item) => sum + item.count, 0);
    tableData.push({
      key: 'total',
      content: '总计',
      count: total
    });

    const columns = [
      {
        title: '内容分类',
        dataIndex: 'content',
        key: 'content',
        render: (text, record) => record.key === 'total' ? <strong>{text}</strong> : text
      },
      {
        title: '发布数量',
        dataIndex: 'count',
        key: 'count',
        render: (text, record) => record.key === 'total' ? <strong>{text}</strong> : text
      },
    ];

    return <Table columns={columns} dataSource={tableData} pagination={false} />;
  }

  // 初始化内容维度图表
  initContentChart() {
    const analysisData = this.getFilteredData();
    if (!analysisData.length) return;

    // 按内容分类统计
    const contentData = {};
    analysisData.forEach(item => {
      if (item['内容分类']) {
        const content = item['内容分类'];
        if (!contentData[content]) {
          contentData[content] = 0;
        }
        contentData[content]++;
      }
    });

    const categories = Object.keys(contentData).sort((a, b) => contentData[b] - contentData[a]);
    const counts = categories.map(category => contentData[category]);

    const options = {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow"
        }
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true
      },
      xAxis: [
        {
          type: "value"
        }
      ],
      yAxis: [
        {
          type: "category",
          data: categories,
          axisLabel: {
            interval: 0
          }
        }
      ],
      series: [
        {
          name: "发布数量",
          type: "bar",
          data: counts,
          itemStyle: {
            color: "#91cc75"
          }
        }
      ]
    };

    this.initChart('content-chart', options);
  }

  // 影响力维度分析
  analyzeByInfluence() {
    const analysisData = this.getFilteredData();
    if (!analysisData.length) return null;

    // 计算各平台的各项指标
    const platformData = {};
    analysisData.forEach(item => {
      if (item['平台']) {
        const platform = item['平台'];
        if (!platformData[platform]) {
          platformData[platform] = {
            reading: { total: 0, count: 0 },
            share: { total: 0, count: 0 },
            completeRate: { total: 0, count: 0 },
            coverClickRate: { total: 0, count: 0 },
            avgPlayTime: { total: 0, count: 0 },
            like: { total: 0, count: 0 },
            collect: { total: 0, count: 0 },
            hotSearch: {
              platforms: new Set(),
              minPosition: 0,
              durationTotal: 0,
              durationCount: 0,
              readingTotal: 0,
              readingCount: 0
            }
          };
        }

        // 阅读量
        if (item['阅读量']) {
          platformData[platform].reading.total += Number(item['阅读量']) || 0;
          platformData[platform].reading.count++;
        }

        // 分享量
        if (item['分享量']) {
          platformData[platform].share.total += Number(item['分享量']) || 0;
          platformData[platform].share.count++;
        }

        // 完播率
        if (item['完播率']) {
          const rate = parseFloat(item['完播率'].replace('%', '')) || 0;
          platformData[platform].completeRate.total += rate;
          platformData[platform].completeRate.count++;
        }

        // 封面点击率
        if (item['封面点击率']) {
          const rate = parseFloat(item['封面点击率'].replace('%', '')) || 0;
          platformData[platform].coverClickRate.total += rate;
          platformData[platform].coverClickRate.count++;
        }

        // 平均播放时长
        if (item['平均播放时长']) {
          // 处理不同格式的时长
          let duration = 0;
          const timeStr = item['平均播放时长'].toString();
          if (timeStr.includes('秒')) {
            duration = parseFloat(timeStr.replace('秒', '')) || 0;
          } else {
            duration = parseFloat(timeStr) || 0;
          }
          platformData[platform].avgPlayTime.total += duration;
          platformData[platform].avgPlayTime.count++;
        }

        // 点赞量
        if (item['点赞量']) {
          platformData[platform].like.total += Number(item['点赞量']) || 0;
          platformData[platform].like.count++;
        }

        // 收藏量
        if (item['收藏量']) {
          platformData[platform].collect.total += Number(item['收藏量']) || 0;
          platformData[platform].collect.count++;
        }

        // 热搜上榜情况
        if (item['热搜平台']) {
          platformData[platform].hotSearch.platforms.add(item['热搜平台']);
        }
        if (item['热搜榜最高位置']) {
          const position = parseInt(item['热搜榜最高位置']) || 0;
          if (position > 0) {
            if (platformData[platform].hotSearch.minPosition === 0 || position < platformData[platform].hotSearch.minPosition) {
              platformData[platform].hotSearch.minPosition = position;
            }
          }
        }
        if (item['在榜时长']) {
          const duration = parseFloat(item['在榜时长']) || 0;
          platformData[platform].hotSearch.durationTotal += duration;
          platformData[platform].hotSearch.durationCount++;
        }
        if (item['热搜阅读量']) {
          platformData[platform].hotSearch.readingTotal += Number(item['热搜阅读量']) || 0;
          platformData[platform].hotSearch.readingCount++;
        }
      }
    });

    const tableData = Object.keys(platformData).map(platform => {
      const data = platformData[platform];
      return {
        key: platform,
        platform,
        readingTotal: data.reading.total,
        readingAvg: data.reading.count > 0 ? Math.round(data.reading.total / data.reading.count) : 0,
        shareTotal: data.share.total,
        shareAvg: data.share.count > 0 ? Math.round(data.share.total / data.share.count) : 0,
        completeRateAvg: data.completeRate.count > 0 ? (data.completeRate.total / data.completeRate.count).toFixed(2) + '%' : '0%',
        coverClickRateAvg: data.coverClickRate.count > 0 ? (data.coverClickRate.total / data.coverClickRate.count).toFixed(2) + '%' : '0%',
        avgPlayTimeAvg: data.avgPlayTime.count > 0 ? (data.avgPlayTime.total / data.avgPlayTime.count).toFixed(2) + '秒' : '0秒',
        likeTotal: data.like.total,
        likeAvg: data.like.count > 0 ? Math.round(data.like.total / data.like.count) : 0,
        collectTotal: data.collect.total,
        collectAvg: data.collect.count > 0 ? Math.round(data.collect.total / data.collect.count) : 0,
        hotSearchPlatforms: Array.from(data.hotSearch.platforms).join(', '),
        hotSearchMinPosition: data.hotSearch.minPosition > 0 ? data.hotSearch.minPosition : '-',
        hotSearchDurationAvg: data.hotSearch.durationCount > 0 ? (data.hotSearch.durationTotal / data.hotSearch.durationCount).toFixed(2) + '小时' : '0小时',
        hotSearchReadingTotal: data.hotSearch.readingTotal
      };
    }).sort((a, b) => b.readingTotal - a.readingTotal); // 按阅读量总和排序

    // 计算总计
    const totalData = {
      readingTotal: 0,
      readingAvg: 0,
      shareTotal: 0,
      shareAvg: 0,
      completeRateAvg: 0,
      coverClickRateAvg: 0,
      avgPlayTimeAvg: 0,
      likeTotal: 0,
      likeAvg: 0,
      collectTotal: 0,
      collectAvg: 0,
      hotSearchPlatforms: '',
      hotSearchMinPosition: '-',
      hotSearchDurationAvg: '0小时',
      hotSearchReadingTotal: 0
    };

    let totalCount = 0;
    const allPlatforms = new Set();
    let minPosition = 0;
    let totalDuration = 0;
    let durationCount = 0;

    tableData.forEach(item => {
      totalData.readingTotal += item.readingTotal;
      totalData.shareTotal += item.shareTotal;
      totalData.likeTotal += item.likeTotal;
      totalData.collectTotal += item.collectTotal;
      totalData.hotSearchReadingTotal += item.hotSearchReadingTotal;
      
      // 收集所有热搜平台
      if (item.hotSearchPlatforms) {
        item.hotSearchPlatforms.split(', ').forEach(platform => {
          allPlatforms.add(platform);
        });
      }
      
      // 找出最小的热搜榜位置
      if (item.hotSearchMinPosition && item.hotSearchMinPosition !== '-') {
        const position = parseInt(item.hotSearchMinPosition);
        if (position > 0 && (minPosition === 0 || position < minPosition)) {
          minPosition = position;
        }
      }
      
      // 累计在榜时长
      if (item.hotSearchDurationAvg && item.hotSearchDurationAvg !== '0小时') {
        const duration = parseFloat(item.hotSearchDurationAvg.replace('小时', '')) || 0;
        totalDuration += duration;
        durationCount++;
      }
      
      totalCount++;
    });

    // 计算总计的热搜平台
    totalData.hotSearchPlatforms = Array.from(allPlatforms).join(', ');
    
    // 计算总计的热搜榜最高位置
    totalData.hotSearchMinPosition = minPosition > 0 ? minPosition : '-';
    
    // 计算总计的平均在榜时长
    totalData.hotSearchDurationAvg = durationCount > 0 ? (totalDuration / durationCount).toFixed(2) + '小时' : '0小时';

    // 计算平均值
    totalData.readingAvg = totalCount > 0 ? Math.round(totalData.readingTotal / totalCount) : 0;
    totalData.shareAvg = totalCount > 0 ? Math.round(totalData.shareTotal / totalCount) : 0;
    totalData.likeAvg = totalCount > 0 ? Math.round(totalData.likeTotal / totalCount) : 0;
    totalData.collectAvg = totalCount > 0 ? Math.round(totalData.collectTotal / totalCount) : 0;

    // 添加总计行
    tableData.push({
      key: 'total',
      platform: '总计',
      readingTotal: totalData.readingTotal,
      readingAvg: totalData.readingAvg,
      shareTotal: totalData.shareTotal,
      shareAvg: totalData.shareAvg,
      completeRateAvg: '0%', // 总计的百分比需要特殊计算，暂时设为0
      coverClickRateAvg: '0%', // 总计的百分比需要特殊计算，暂时设为0
      avgPlayTimeAvg: '0秒', // 总计的时长需要特殊计算，暂时设为0
      likeTotal: totalData.likeTotal,
      likeAvg: totalData.likeAvg,
      collectTotal: totalData.collectTotal,
      collectAvg: totalData.collectAvg,
      hotSearchPlatforms: totalData.hotSearchPlatforms,
      hotSearchMinPosition: totalData.hotSearchMinPosition,
      hotSearchDurationAvg: totalData.hotSearchDurationAvg,
      hotSearchReadingTotal: totalData.hotSearchReadingTotal
    });

    const columns = [
      {
        title: '平台',
        dataIndex: 'platform',
        key: 'platform',
        render: (text, record) => record.key === 'total' ? <strong>{text}</strong> : text
      },
      {
        title: '阅读量',
        children: [
          { title: '总和', dataIndex: 'readingTotal', key: 'readingTotal' },
          { title: '平均值', dataIndex: 'readingAvg', key: 'readingAvg' }
        ],
        render: (text, record) => record.key === 'total' ? <strong>{text}</strong> : text
      },
      {
        title: '分享量',
        children: [
          { title: '总和', dataIndex: 'shareTotal', key: 'shareTotal' },
          { title: '平均值', dataIndex: 'shareAvg', key: 'shareAvg' }
        ],
        render: (text, record) => record.key === 'total' ? <strong>{text}</strong> : text
      },
      {
        title: '完播率',
        dataIndex: 'completeRateAvg',
        key: 'completeRateAvg',
        render: (text, record) => record.key === 'total' ? <strong>{text}</strong> : text
      },
      {
        title: '封面点击率',
        dataIndex: 'coverClickRateAvg',
        key: 'coverClickRateAvg',
        render: (text, record) => record.key === 'total' ? <strong>{text}</strong> : text
      },
      {
        title: '平均播放时长',
        dataIndex: 'avgPlayTimeAvg',
        key: 'avgPlayTimeAvg',
        render: (text, record) => record.key === 'total' ? <strong>{text}</strong> : text
      },
      {
        title: '点赞量',
        children: [
          { title: '总和', dataIndex: 'likeTotal', key: 'likeTotal' },
          { title: '平均值', dataIndex: 'likeAvg', key: 'likeAvg' }
        ],
        render: (text, record) => record.key === 'total' ? <strong>{text}</strong> : text
      },
      {
        title: '收藏量',
        children: [
          { title: '总和', dataIndex: 'collectTotal', key: 'collectTotal' },
          { title: '平均值', dataIndex: 'collectAvg', key: 'collectAvg' }
        ],
        render: (text, record) => record.key === 'total' ? <strong>{text}</strong> : text
      },
      {
        title: '热搜上榜情况',
        children: [
          { title: '热搜平台', dataIndex: 'hotSearchPlatforms', key: 'hotSearchPlatforms' },
          { title: '热搜榜最高位置', dataIndex: 'hotSearchMinPosition', key: 'hotSearchMinPosition' },
          { title: '在榜时长', dataIndex: 'hotSearchDurationAvg', key: 'hotSearchDurationAvg' },
          { title: '热搜阅读量', dataIndex: 'hotSearchReadingTotal', key: 'hotSearchReadingTotal' }
        ],
        render: (text, record) => record.key === 'total' ? <strong>{text}</strong> : text
      }
    ];

    return <Table columns={columns} dataSource={tableData} pagination={false} />;
  }

  // 初始化影响力维度图表
  initInfluenceChart() {
    const analysisData = this.getFilteredData();
    if (!analysisData.length) return;

    // 计算各平台的阅读量总和
    const platformReadings = {};
    analysisData.forEach(item => {
      if (item['平台'] && item['阅读量']) {
        const platform = item['平台'];
        if (!platformReadings[platform]) {
          platformReadings[platform] = 0;
        }
        platformReadings[platform] += Number(item['阅读量']) || 0;
      }
    });

    const platforms = Object.keys(platformReadings).sort((a, b) => platformReadings[b] - platformReadings[a]);
    const readingData = platforms.map(platform => platformReadings[platform]);

    const options = {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow"
        }
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true
      },
      xAxis: [
        {
          type: "category",
          data: platforms,
          axisLabel: {
            rotate: 45
          }
        }
      ],
      yAxis: [
        {
          type: "value",
          name: "阅读量总和"
        }
      ],
      series: [
        {
          name: "阅读量总和",
          type: "bar",
          data: readingData,
          itemStyle: {
            color: "#fac858"
          }
        }
      ]
    };

    this.initChart('influence-chart', options);
  }

  // 用户维度分析
  analyzeByUser() {
    const analysisData = this.getFilteredData();
    if (!analysisData.length) return null;

    // 统计地域分布
    const regionData = {
      '北京': 0,
      '京外': 0
    };

    analysisData.forEach(item => {
      if (item['京内占比']) {
        const beijingRatio = parseFloat(item['京内占比'].replace('%', '')) || 0;
        regionData['北京'] += beijingRatio;
        regionData['京外'] += 100 - beijingRatio;
      }
    });

    const total = regionData['北京'] + regionData['京外'];
    const tableData = Object.keys(regionData).map(region => ({
      key: region,
      region,
      value: regionData[region].toFixed(2),
      percentage: ((regionData[region] / total) * 100).toFixed(2) + '%'
    }));

    // 添加总计行
    tableData.push({
      key: 'total',
      region: '总计',
      value: total.toFixed(2),
      percentage: '100.00%'
    });

    const columns = [
      {
        title: '地域',
        dataIndex: 'region',
        key: 'region',
        render: (text, record) => record.key === 'total' ? <strong>{text}</strong> : text
      },
      {
        title: '占比',
        dataIndex: 'percentage',
        key: 'percentage',
        render: (text, record) => record.key === 'total' ? <strong>{text}</strong> : text
      },
    ];

    return <Table columns={columns} dataSource={tableData} pagination={false} />;
  }

  // 初始化用户维度图表
  initUserChart() {
    const analysisData = this.getFilteredData();
    if (!analysisData.length) return;

    // 统计地域分布
    const regionData = {
      '北京': 0,
      '京外': 0
    };

    analysisData.forEach(item => {
      if (item['京内占比']) {
        const beijingRatio = parseFloat(item['京内占比'].replace('%', '')) || 0;
        regionData['北京'] += beijingRatio;
        regionData['京外'] += 100 - beijingRatio;
      }
    });

    const data = Object.keys(regionData).map(region => ({
      name: region,
      value: regionData[region]
    }));

    const options = {
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b}: {c} ({d}%)"
      },
      legend: {
        orient: "vertical",
        left: "left",
        data: Object.keys(regionData)
      },
      series: [
        {
          name: "地域分布",
          type: "pie",
          radius: "60%",
          center: ["60%", "50%"],
          data: data,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)"
            }
          }
        }
      ]
    };

    this.initChart('user-chart', options);
  }

  // 创作维度分析
  analyzeByCreation() {
    const analysisData = this.getFilteredData();
    if (!analysisData.length) return null;

    // 按科室统计
    const departmentData = {};
    analysisData.forEach(item => {
      if (item['科室名称']) {
        const departments = item['科室名称'].split('、');
        departments.forEach(dept => {
          if (!departmentData[dept]) {
            departmentData[dept] = 0;
          }
          departmentData[dept]++;
        });
      }
    });

    const tableData = Object.keys(departmentData)
      .map(dept => ({
        key: dept,
        department: dept,
        count: departmentData[dept]
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // 只显示前10个科室

    // 添加总计行
    const total = Object.values(departmentData).reduce((sum, count) => sum + count, 0);
    tableData.push({
      key: 'total',
      department: '总计',
      count: total
    });

    const columns = [
      {
        title: '科室',
        dataIndex: 'department',
        key: 'department',
        render: (text, record) => record.key === 'total' ? <strong>{text}</strong> : text
      },
      {
        title: '发布数量',
        dataIndex: 'count',
        key: 'count',
        render: (text, record) => record.key === 'total' ? <strong>{text}</strong> : text
      },
    ];

    return <Table columns={columns} dataSource={tableData} pagination={false} />;
  }

  // 科室名称分类分析
  analyzeByDepartmentName() {
    const analysisData = this.getFilteredData();
    if (!analysisData.length) return null;

    // 按科室名称统计
    const departmentData = {};
    analysisData.forEach(item => {
      if (item['科室名称']) {
        const departments = item['科室名称'].split('、');
        departments.forEach(dept => {
          if (!departmentData[dept]) {
            departmentData[dept] = 0;
          }
          departmentData[dept]++;
        });
      }
    });

    const tableData = Object.keys(departmentData)
      .map(dept => ({
        key: dept,
        department: dept,
        count: departmentData[dept]
      }))
      .sort((a, b) => b.count - a.count);

    // 添加总计行
    const total = Object.values(departmentData).reduce((sum, count) => sum + count, 0);
    tableData.push({
      key: 'total',
      department: '总计',
      count: total
    });

    const columns = [
      {
        title: '科室名称',
        dataIndex: 'department',
        key: 'department',
        render: (text, record) => record.key === 'total' ? <strong>{text}</strong> : text
      },
      {
        title: '发布数量',
        dataIndex: 'count',
        key: 'count',
        render: (text, record) => record.key === 'total' ? <strong>{text}</strong> : text
      },
    ];

    return <Table columns={columns} dataSource={tableData} pagination={false} />;
  }

  // 科室分类分析
  analyzeByDepartmentCategory() {
    const analysisData = this.getFilteredData();
    if (!analysisData.length) return null;

    // 按科室分类统计
    const categoryData = {};
    analysisData.forEach(item => {
      if (item['科室分类']) {
        const categories = item['科室分类'].split('、');
        categories.forEach(category => {
          if (!categoryData[category]) {
            categoryData[category] = 0;
          }
          categoryData[category]++;
        });
      }
    });

    const tableData = Object.keys(categoryData)
      .map(category => ({
        key: category,
        category,
        count: categoryData[category]
      }))
      .sort((a, b) => b.count - a.count);

    // 添加总计行
    const total = Object.values(categoryData).reduce((sum, count) => sum + count, 0);
    tableData.push({
      key: 'total',
      category: '总计',
      count: total
    });

    const columns = [
      {
        title: '科室分类',
        dataIndex: 'category',
        key: 'category',
        render: (text, record) => record.key === 'total' ? <strong>{text}</strong> : text
      },
      {
        title: '涉及数量',
        dataIndex: 'count',
        key: 'count',
        render: (text, record) => record.key === 'total' ? <strong>{text}</strong> : text
      },
    ];

    return <Table columns={columns} dataSource={tableData} pagination={false} />;
  }

  // 作者分析
  analyzeByAuthor() {
    const analysisData = this.getFilteredData();
    if (!analysisData.length) return null;

    // 按作者统计
    const authorData = {};
    analysisData.forEach(item => {
      if (item['作者']) {
        // 先按顿号分割，再按空格分割
        let authors = item['作者'].split('、');
        // 处理每个作者中的空格
        authors = authors.flatMap(author => author.split(/\s+/).filter(a => a));
        authors.forEach(author => {
          if (!authorData[author]) {
            authorData[author] = 0;
          }
          authorData[author]++;
        });
      }
    });

    const tableData = Object.keys(authorData)
      .map(author => ({
        key: author,
        author,
        count: authorData[author]
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20); // 只显示前20个作者

    // 添加总计行
    const total = Object.values(authorData).reduce((sum, count) => sum + count, 0);
    tableData.push({
      key: 'total',
      author: '总计',
      count: total
    });

    const columns = [
      {
        title: '作者',
        dataIndex: 'author',
        key: 'author',
        render: (text, record) => record.key === 'total' ? <strong>{text}</strong> : text
      },
      {
        title: '涉及数量',
        dataIndex: 'count',
        key: 'count',
        render: (text, record) => record.key === 'total' ? <strong>{text}</strong> : text
      },
    ];

    return <Table columns={columns} dataSource={tableData} pagination={false} />;
  }

  // 记者分析
  analyzeByReporter() {
    const analysisData = this.getFilteredData();
    if (!analysisData.length) return null;

    // 按记者统计
    const reporterData = {};
    analysisData.forEach(item => {
      if (item['记者']) {
        // 先按顿号分割，再按空格分割
        let reporters = item['记者'].split('、');
        // 处理每个记者中的空格
        reporters = reporters.flatMap(reporter => reporter.split(/\s+/).filter(r => r));
        reporters.forEach(reporter => {
          if (!reporterData[reporter]) {
            reporterData[reporter] = 0;
          }
          reporterData[reporter]++;
        });
      }
    });

    const tableData = Object.keys(reporterData)
      .map(reporter => ({
        key: reporter,
        reporter,
        count: reporterData[reporter]
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20); // 只显示前20个记者

    // 添加总计行
    const total = Object.values(reporterData).reduce((sum, count) => sum + count, 0);
    tableData.push({
      key: 'total',
      reporter: '总计',
      count: total
    });

    const columns = [
      {
        title: '记者',
        dataIndex: 'reporter',
        key: 'reporter',
        render: (text, record) => record.key === 'total' ? <strong>{text}</strong> : text
      },
      {
        title: '涉及数量',
        dataIndex: 'count',
        key: 'count',
        render: (text, record) => record.key === 'total' ? <strong>{text}</strong> : text
      },
    ];

    return <Table columns={columns} dataSource={tableData} pagination={false} />;
  }

  // 媒体具体栏目分析
  analyzeByMediaColumn() {
    const analysisData = this.getFilteredData();
    if (!analysisData.length) return null;

    // 按具体栏目统计
    const columnData = {};
    analysisData.forEach(item => {
      if (item['具体栏目']) {
        const column = item['具体栏目'];
        if (!columnData[column]) {
          columnData[column] = 0;
        }
        columnData[column]++;
      }
    });

    const tableData = Object.keys(columnData)
      .map(column => ({
        key: column,
        column,
        count: columnData[column]
      }))
      .sort((a, b) => b.count - a.count);

    // 添加总计行
    const total = Object.values(columnData).reduce((sum, count) => sum + count, 0);
    tableData.push({
      key: 'total',
      column: '总计',
      count: total
    });

    const columns = [
      {
        title: '具体栏目',
        dataIndex: 'column',
        key: 'column',
        render: (text, record) => record.key === 'total' ? <strong>{text}</strong> : text
      },
      {
        title: '涉及数量',
        dataIndex: 'count',
        key: 'count',
        render: (text, record) => record.key === 'total' ? <strong>{text}</strong> : text
      },
    ];

    return <Table columns={columns} dataSource={tableData} pagination={false} />;
  }

  // 体裁分类分析
  analyzeByGenreCategory() {
    const analysisData = this.getFilteredData();
    if (!analysisData.length) return null;

    // 按体裁分类统计
    const genreData = {};
    analysisData.forEach(item => {
      if (item['体裁分类']) {
        const genre = item['体裁分类'];
        if (!genreData[genre]) {
          genreData[genre] = 0;
        }
        genreData[genre]++;
      }
    });

    const tableData = Object.keys(genreData)
      .map(genre => ({
        key: genre,
        genre,
        count: genreData[genre]
      }))
      .sort((a, b) => b.count - a.count);

    // 添加总计行
    const total = Object.values(genreData).reduce((sum, count) => sum + count, 0);
    tableData.push({
      key: 'total',
      genre: '总计',
      count: total
    });

    const columns = [
      {
        title: '体裁分类',
        dataIndex: 'genre',
        key: 'genre',
        render: (text, record) => record.key === 'total' ? <strong>{text}</strong> : text
      },
      {
        title: '涉及数量',
        dataIndex: 'count',
        key: 'count',
        render: (text, record) => record.key === 'total' ? <strong>{text}</strong> : text
      },
    ];

    return <Table columns={columns} dataSource={tableData} pagination={false} />;
  }

  // 视频时长分析
  analyzeByVideoDuration() {
    const analysisData = this.getFilteredData();
    if (!analysisData.length) return null;

    // 按渠道统计视频时长
    const channelData = {};

    analysisData.forEach(item => {
      if (item['平台']) {
        const platform = item['平台'];
        if (!channelData[platform]) {
          channelData[platform] = {
            totalSeconds: 0,
            count: 0, // 总视频数量
            validCount: 0, // 有有效时长的视频数量
            originalValues: []
          };
        }

        // 处理视频时长
        let duration = 0;
        let hasDuration = false;
        let videoDurationValue = item['视频时长'] || item['视频长度'] || item['时长'];
        
        if (videoDurationValue) {
          // 处理不同格式的时长
          const timeStr = videoDurationValue.toString().trim();
          
          // 检查是否包含'/'，如果包含则视为空字段
          if (timeStr.includes('/')) {
            videoDurationValue = '无';
          } else if (timeStr.includes(':')) {
            // 格式：mm:ss 或 hh:mm:ss
            const parts = timeStr.split(':').map(Number);
            if (parts.length === 2) {
              duration = parts[0] * 60 + parts[1]; // 转换为秒
              hasDuration = true;
            } else if (parts.length === 3) {
              duration = parts[0] * 3600 + parts[1] * 60 + parts[2]; // 转换为秒
              hasDuration = true;
            }
          } else {
            // 直接数值，小红书单位为秒
            const parsedDuration = parseFloat(timeStr);
            if (!isNaN(parsedDuration)) {
              duration = parsedDuration;
              hasDuration = true;
            }
          }
        }
        
        // 无论是否有有效时长，都统计视频数量
        channelData[platform].count++;
        
        // 只有有有效时长时才计算总时长和有效视频数量
        if (hasDuration && duration > 0) {
          channelData[platform].totalSeconds += duration;
          channelData[platform].validCount++;
        }
        
        // 记录原始值，即使时长无效
        channelData[platform].originalValues.push(videoDurationValue || '无');
      }
    });

    // 生成表格数据
    const tableData = Object.keys(channelData).map(platform => {
      const data = channelData[platform];
      // 计算平均时长，只考虑有有效时长的视频
      const avgSeconds = data.validCount > 0 ? data.totalSeconds / data.validCount : 0;
      // 转换平均时长为 mm:ss 格式
      const avgMinutes = Math.floor(avgSeconds / 60);
      const avgSecs = Math.round(avgSeconds % 60);
      const avgDurationStr = `${avgMinutes}:${avgSecs.toString().padStart(2, '0')}`;
      
      return {
        key: platform,
        platform,
        avgDuration: avgDurationStr,
        originalValues: data.originalValues.join(', '),
        count: data.count,
        validCount: data.validCount
      };
    }).sort((a, b) => b.count - a.count);

    // 添加总计行
    let totalSeconds = 0;
    let totalCount = 0;
    let totalValidCount = 0;
    Object.values(channelData).forEach(data => {
      totalSeconds += data.totalSeconds;
      totalCount += data.count;
      totalValidCount += data.validCount;
    });

    const totalAvgSeconds = totalValidCount > 0 ? totalSeconds / totalValidCount : 0;
    const totalAvgMinutes = Math.floor(totalAvgSeconds / 60);
    const totalAvgSecs = Math.round(totalAvgSeconds % 60);
    const totalAvgDurationStr = `${totalAvgMinutes}:${totalAvgSecs.toString().padStart(2, '0')}`;

    tableData.push({
      key: 'total',
      platform: '总计',
      avgDuration: totalAvgDurationStr,
      originalValues: '',
      count: totalCount,
      validCount: totalValidCount
    });

    const columns = [
      {
        title: '渠道',
        dataIndex: 'platform',
        key: 'platform',
        render: (text, record) => record.key === 'total' ? <strong>{text}</strong> : text
      },
      {
        title: '平均时长',
        dataIndex: 'avgDuration',
        key: 'avgDuration',
        render: (text, record) => record.key === 'total' ? <strong>{text}</strong> : text
      },
      {
        title: '原始数值',
        dataIndex: 'originalValues',
        key: 'originalValues',
        ellipsis: true,
        render: (text, record) => record.key === 'total' ? <strong>{text}</strong> : text
      },
      {
        title: '视频数量',
        dataIndex: 'count',
        key: 'count',
        render: (text, record) => record.key === 'total' ? <strong>{text}</strong> : text
      },
      {
        title: '有效时长数量',
        dataIndex: 'validCount',
        key: 'validCount',
        render: (text, record) => record.key === 'total' ? <strong>{text}</strong> : text
      },
    ];

    return <Table columns={columns} dataSource={tableData} pagination={false} />;
  }

  // 专项策划分析
  analyzeBySpecialPlanning() {
    const analysisData = this.getFilteredData();
    if (!analysisData.length) return null;

    // 按专项策划统计
    const planningData = {};
    analysisData.forEach(item => {
      if (item['专项策划']) {
        const planning = item['专项策划'];
        if (!planningData[planning]) {
          planningData[planning] = 0;
        }
        planningData[planning]++;
      }
    });

    const tableData = Object.keys(planningData)
      .map(planning => ({
        key: planning,
        planning,
        count: planningData[planning]
      }))
      .sort((a, b) => b.count - a.count);

    // 添加总计行
    const total = Object.values(planningData).reduce((sum, count) => sum + count, 0);
    tableData.push({
      key: 'total',
      planning: '总计',
      count: total
    });

    const columns = [
      {
        title: '专项策划',
        dataIndex: 'planning',
        key: 'planning',
        render: (text, record) => record.key === 'total' ? <strong>{text}</strong> : text
      },
      {
        title: '涉及数量',
        dataIndex: 'count',
        key: 'count',
        render: (text, record) => record.key === 'total' ? <strong>{text}</strong> : text
      },
    ];

    return <Table columns={columns} dataSource={tableData} pagination={false} />;
  }

  // 初始化创作维度图表
  initCreationChart() {
    const analysisData = this.getFilteredData();
    if (!analysisData.length) return;

    // 按科室统计
    const departmentData = {};
    analysisData.forEach(item => {
      if (item['科室名称']) {
        const departments = item['科室名称'].split('、');
        departments.forEach(dept => {
          if (!departmentData[dept]) {
            departmentData[dept] = 0;
          }
          departmentData[dept]++;
        });
      }
    });

    const topDepartments = Object.keys(departmentData)
      .sort((a, b) => departmentData[b] - departmentData[a])
      .slice(0, 10);
    const counts = topDepartments.map(dept => departmentData[dept]);

    const options = {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow"
        }
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true
      },
      xAxis: [
        {
          type: "value"
        }
      ],
      yAxis: [
        {
          type: "category",
          data: topDepartments,
          axisLabel: {
            interval: 0,
            rotate: 30
          }
        }
      ],
      series: [
        {
          name: "发布数量",
          type: "bar",
          data: counts,
          itemStyle: {
            color: "#ee6666"
          }
        }
      ]
    };

    this.initChart('creation-chart', options);
  }

  // 初始化科室分类图表
  initDepartmentCategoryChart() {
    const analysisData = this.getFilteredData();
    if (!analysisData.length) return;

    // 检查容器是否存在
    if (!this.chartRefs['department-category-chart']) {
      console.log('科室分类图表容器不存在');
      return;
    }

    // 按科室分类统计
    const categoryData = {};
    analysisData.forEach(item => {
      if (item['科室分类']) {
        const categories = item['科室分类'].split('、');
        categories.forEach(category => {
          if (!categoryData[category]) {
            categoryData[category] = 0;
          }
          categoryData[category]++;
        });
      }
    });

    const categories = Object.keys(categoryData)
      .sort((a, b) => categoryData[b] - categoryData[a]);
    const counts = categories.map(category => categoryData[category]);

    const options = {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow"
        }
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true
      },
      xAxis: [
        {
          type: "value"
        }
      ],
      yAxis: [
        {
          type: "category",
          data: categories,
          axisLabel: {
            interval: 0,
            rotate: 30
          }
        }
      ],
      series: [
        {
          name: "涉及数量",
          type: "bar",
          data: counts,
          itemStyle: {
            color: "#5470c6"
          }
        }
      ]
    };

    // 直接初始化图表，不需要延迟
    this.initChart('department-category-chart', options);
  }

  // 初始化体裁分类图表
  initGenreCategoryChart() {
    const analysisData = this.getFilteredData();
    if (!analysisData.length) return;

    // 检查容器是否存在
    if (!this.chartRefs['genre-category-chart']) {
      console.log('体裁分类图表容器不存在');
      return;
    }

    // 按体裁分类统计
    const genreData = {};
    analysisData.forEach(item => {
      if (item['体裁分类']) {
        const genre = item['体裁分类'];
        if (!genreData[genre]) {
          genreData[genre] = 0;
        }
        genreData[genre]++;
      }
    });

    const genres = Object.keys(genreData)
      .sort((a, b) => genreData[b] - genreData[a]);
    const counts = genres.map(genre => genreData[genre]);

    const options = {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow"
        }
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true
      },
      xAxis: [
        {
          type: "value"
        }
      ],
      yAxis: [
        {
          type: "category",
          data: genres,
          axisLabel: {
            interval: 0,
            rotate: 30
          }
        }
      ],
      series: [
        {
          name: "涉及数量",
          type: "bar",
          data: counts,
          itemStyle: {
            color: "#91cc75"
          }
        }
      ]
    };

    // 直接初始化图表，不需要延迟
    this.initChart('genre-category-chart', options);
  }

  // 互动外延维度分析
  analyzeByInteraction() {
    const analysisData = this.getFilteredData();
    if (!analysisData.length) return null;

    // 统计各项指标
    const interactionData = [];
    
    // 获取所有平台种类
    const allPlatforms = new Set(analysisData.map(item => item['平台']).filter(Boolean));
    
    // 计算自媒体总数：平台种类减去以媒体开头的平台
    const mediaPlatforms = Array.from(allPlatforms).filter(platform => platform.startsWith('媒体'));
    const selfMediaTotal = allPlatforms.size - mediaPlatforms.length;
    
    // 计算自媒体首发平台ID数：通过是否首发字段判断
    const selfMediaFirstPublishItems = analysisData.filter(item => 
      item['平台'] && !item['平台'].startsWith('媒体') && item['是否首发'] === '是'
    );
    const selfMediaFirstPublishIds = new Set(selfMediaFirstPublishItems.map(item => item['平台']));
    const selfMediaFirstPublishCount = selfMediaFirstPublishIds.size;
    
    // 内部媒体推广率 = 自媒体首发平台ID数 / 自媒体总数
    const internalMediaPromotionRate = selfMediaTotal > 0 ? (selfMediaFirstPublishCount / selfMediaTotal * 100).toFixed(2) + '%' : '0%';
    
    // 自媒体被媒体引用数量 = 自媒体被平台引用数（该媒体在自媒体出现）
    const selfMediaCitedByMedia = analysisData.filter(item => 
      item['平台'] && !item['平台'].startsWith('媒体') && 
      item['被引用情况'] && item['被引用情况'].includes('媒体')
    ).length;
    
    // 自媒体被媒体引用率 = 自媒体被平台引用数 / 自媒体总数
    const selfMediaCitedByMediaRate = selfMediaTotal > 0 ? (selfMediaCitedByMedia / selfMediaTotal * 100).toFixed(2) + '%' : '0%';
    
    // 媒体总数：以媒体开头的平台种类
    const mediaTotal = mediaPlatforms.length;
    
    // 媒体被媒体引用率 = 媒体被平台引用数 / 媒体总数
    const mediaCitedByMedia = analysisData.filter(item => 
      item['平台'] && item['平台'].startsWith('媒体') && 
      item['被引用情况'] && item['被引用情况'].includes('媒体')
    ).length;
    const mediaCitedByMediaRate = mediaTotal > 0 ? (mediaCitedByMedia / mediaTotal * 100).toFixed(2) + '%' : '0%';
    
    // 媒体被自媒体引用数量 = 媒体被自媒体引用数（该自媒体在媒体出现）
    const mediaCitedBySelfMedia = analysisData.filter(item => 
      item['平台'] && item['平台'].startsWith('媒体') && 
      item['被引用情况'] && item['被引用情况'].includes('自媒体')
    ).length;
    
    // 媒体被自媒体引用率 = 媒体被自媒体引用数 / 媒体总数
    const mediaCitedBySelfMediaRate = mediaTotal > 0 ? (mediaCitedBySelfMedia / mediaTotal * 100).toFixed(2) + '%' : '0%';
    
    // 构建表格数据
    interactionData.push(
      {
        key: 'internalMediaPromotionRate',
        indicator: '内部媒体推广率',
        formula: '自媒体首发平台ID数 / 自媒体总数',
        value: internalMediaPromotionRate
      },
      {
        key: 'selfMediaCitedByMedia',
        indicator: '自媒体被媒体引用数量',
        formula: '自媒体被平台引用数（该媒体在自媒体出现）',
        value: selfMediaCitedByMedia
      },
      {
        key: 'selfMediaCitedByMediaRate',
        indicator: '自媒体被媒体引用率',
        formula: '自媒体被平台引用数 / 自媒体总数',
        value: selfMediaCitedByMediaRate
      },
      {
        key: 'mediaCitedByMediaRate',
        indicator: '媒体被媒体引用率',
        formula: '媒体被平台引用数 / 媒体总数',
        value: mediaCitedByMediaRate
      },
      {
        key: 'mediaCitedBySelfMedia',
        indicator: '媒体被自媒体引用数量',
        formula: '媒体被自媒体引用数（该自媒体在媒体出现）',
        value: mediaCitedBySelfMedia
      },
      {
        key: 'mediaCitedBySelfMediaRate',
        indicator: '媒体被自媒体引用率',
        formula: '媒体被自媒体引用数 / 媒体总数',
        value: mediaCitedBySelfMediaRate
      }
    );

    const columns = [
      {
        title: '二级指标',
        dataIndex: 'indicator',
        key: 'indicator'
      },
      {
        title: '赋值',
        dataIndex: 'formula',
        key: 'formula'
      },
      {
        title: '单指标分析',
        dataIndex: 'value',
        key: 'value'
      },
    ];

    return <Table columns={columns} dataSource={interactionData} pagination={false} />;
  }

  // 导出数据为Excel
  exportToExcel = (tabKey) => {
    try {
      // 创建一个工作簿
      const wb = XLSX.utils.book_new();
      
      switch (tabKey) {
        case 'time':
          // 时间维度数据
          const timeData = this.analyzeByTime();
          if (timeData) {
            // 获取表格数据
            const timeTableData = timeData.props.dataSource;
            const timeColumns = timeData.props.columns;
            
            // 转换为Excel格式
            const timeSheetData = timeTableData.map(item => {
              const row = {};
              timeColumns.forEach(col => {
                row[col.title] = item[col.dataIndex] || '';
              });
              return row;
            });
            
            // 创建工作表
            const timeSheet = XLSX.utils.json_to_sheet(timeSheetData);
            XLSX.utils.book_append_sheet(wb, timeSheet, '时间维度');
          }
          break;
          
        case 'platform':
          // 平台维度数据
          const platformData = this.analyzeByPlatform();
          if (platformData) {
            // 获取表格数据
            const platformTableData = platformData.props.dataSource;
            const platformColumns = platformData.props.columns;
            
            // 转换为Excel格式
            const platformSheetData = platformTableData.map(item => {
              const row = {};
              platformColumns.forEach(col => {
                row[col.title] = item[col.dataIndex] || '';
              });
              return row;
            });
            
            // 创建工作表
            const platformSheet = XLSX.utils.json_to_sheet(platformSheetData);
            XLSX.utils.book_append_sheet(wb, platformSheet, '平台维度');
          }
          break;
          
        case 'first-release':
          // 是否首发维度数据
          const firstReleaseData = this.analyzeByFirstRelease();
          if (firstReleaseData) {
            // 获取表格数据
            const firstReleaseTableData = firstReleaseData.props.dataSource;
            const firstReleaseColumns = firstReleaseData.props.columns;
            
            // 转换为Excel格式
            const firstReleaseSheetData = firstReleaseTableData.map(item => {
              const row = {};
              firstReleaseColumns.forEach(col => {
                row[col.title] = item[col.dataIndex] || '';
              });
              return row;
            });
            
            // 创建工作表
            const firstReleaseSheet = XLSX.utils.json_to_sheet(firstReleaseSheetData);
            XLSX.utils.book_append_sheet(wb, firstReleaseSheet, '是否首发');
          }
          break;
          
        case 'content':
          // 内容维度数据
          const contentData = this.analyzeByContent();
          if (contentData) {
            // 获取表格数据
            const contentTableData = contentData.props.dataSource;
            const contentColumns = contentData.props.columns;
            
            // 转换为Excel格式
            const contentSheetData = contentTableData.map(item => {
              const row = {};
              contentColumns.forEach(col => {
                row[col.title] = item[col.dataIndex] || '';
              });
              return row;
            });
            
            // 创建工作表
            const contentSheet = XLSX.utils.json_to_sheet(contentSheetData);
            XLSX.utils.book_append_sheet(wb, contentSheet, '内容分类');
          }
          break;
          
        case 'influence':
          // 影响力维度数据
          const influenceData = this.analyzeByInfluence();
          if (influenceData) {
            // 获取表格数据
            const influenceTableData = influenceData.props.dataSource;
            const influenceColumns = influenceData.props.columns;
            
            // 转换为Excel格式
            const influenceSheetData = influenceTableData.map(item => {
              const row = {};
              influenceColumns.forEach(col => {
                if (col.children) {
                  // 处理嵌套列
                  col.children.forEach(childCol => {
                    row[childCol.title] = item[childCol.dataIndex] || '';
                  });
                } else {
                  row[col.title] = item[col.dataIndex] || '';
                }
              });
              return row;
            });
            
            // 创建工作表
            const influenceSheet = XLSX.utils.json_to_sheet(influenceSheetData);
            XLSX.utils.book_append_sheet(wb, influenceSheet, '影响力分析');
          }
          break;
          
        case 'user':
          // 用户维度数据
          const userData = this.analyzeByUser();
          if (userData) {
            // 获取表格数据
            const userTableData = userData.props.dataSource;
            const userColumns = userData.props.columns;
            
            // 转换为Excel格式
            const userSheetData = userTableData.map(item => {
              const row = {};
              userColumns.forEach(col => {
                row[col.title] = item[col.dataIndex] || '';
              });
              return row;
            });
            
            // 创建工作表
            const userSheet = XLSX.utils.json_to_sheet(userSheetData);
            XLSX.utils.book_append_sheet(wb, userSheet, '用户分析');
          }
          break;
          
        case 'creation':
          // 创作维度数据
          const creationData = this.analyzeByCreation();
          const departmentNameData = this.analyzeByDepartmentName();
          const departmentCategoryData = this.analyzeByDepartmentCategory();
          const authorData = this.analyzeByAuthor();
          const reporterData = this.analyzeByReporter();
          const mediaColumnData = this.analyzeByMediaColumn();
          const genreCategoryData = this.analyzeByGenreCategory();
          const videoDurationData = this.analyzeByVideoDuration();
          const specialPlanningData = this.analyzeBySpecialPlanning();
          
          // 创作维度 - 科室发布数量前10
          if (creationData) {
            const creationTableData = creationData.props.dataSource;
            const creationColumns = creationData.props.columns;
            
            const creationSheetData = creationTableData.map(item => {
              const row = {};
              creationColumns.forEach(col => {
                row[col.title] = item[col.dataIndex] || '';
              });
              return row;
            });
            
            const creationSheet = XLSX.utils.json_to_sheet(creationSheetData);
            XLSX.utils.book_append_sheet(wb, creationSheet, '科室发布数量前10');
          }
          
          // 创作维度 - 科室名称
          if (departmentNameData) {
            const departmentNameTableData = departmentNameData.props.dataSource;
            const departmentNameColumns = departmentNameData.props.columns;
            
            const departmentNameSheetData = departmentNameTableData.map(item => {
              const row = {};
              departmentNameColumns.forEach(col => {
                row[col.title] = item[col.dataIndex] || '';
              });
              return row;
            });
            
            const departmentNameSheet = XLSX.utils.json_to_sheet(departmentNameSheetData);
            XLSX.utils.book_append_sheet(wb, departmentNameSheet, '科室名称');
          }
          
          // 创作维度 - 科室分类
          if (departmentCategoryData) {
            const departmentCategoryTableData = departmentCategoryData.props.dataSource;
            const departmentCategoryColumns = departmentCategoryData.props.columns;
            
            const departmentCategorySheetData = departmentCategoryTableData.map(item => {
              const row = {};
              departmentCategoryColumns.forEach(col => {
                row[col.title] = item[col.dataIndex] || '';
              });
              return row;
            });
            
            const departmentCategorySheet = XLSX.utils.json_to_sheet(departmentCategorySheetData);
            XLSX.utils.book_append_sheet(wb, departmentCategorySheet, '科室分类');
          }
          
          // 创作维度 - 作者
          if (authorData) {
            const authorTableData = authorData.props.dataSource;
            const authorColumns = authorData.props.columns;
            
            const authorSheetData = authorTableData.map(item => {
              const row = {};
              authorColumns.forEach(col => {
                row[col.title] = item[col.dataIndex] || '';
              });
              return row;
            });
            
            const authorSheet = XLSX.utils.json_to_sheet(authorSheetData);
            XLSX.utils.book_append_sheet(wb, authorSheet, '作者');
          }
          
          // 创作维度 - 记者
          if (reporterData) {
            const reporterTableData = reporterData.props.dataSource;
            const reporterColumns = reporterData.props.columns;
            
            const reporterSheetData = reporterTableData.map(item => {
              const row = {};
              reporterColumns.forEach(col => {
                row[col.title] = item[col.dataIndex] || '';
              });
              return row;
            });
            
            const reporterSheet = XLSX.utils.json_to_sheet(reporterSheetData);
            XLSX.utils.book_append_sheet(wb, reporterSheet, '记者');
          }
          
          // 创作维度 - 具体栏目
          if (mediaColumnData) {
            const mediaColumnTableData = mediaColumnData.props.dataSource;
            const mediaColumnColumns = mediaColumnData.props.columns;
            
            const mediaColumnSheetData = mediaColumnTableData.map(item => {
              const row = {};
              mediaColumnColumns.forEach(col => {
                row[col.title] = item[col.dataIndex] || '';
              });
              return row;
            });
            
            const mediaColumnSheet = XLSX.utils.json_to_sheet(mediaColumnSheetData);
            XLSX.utils.book_append_sheet(wb, mediaColumnSheet, '具体栏目');
          }
          
          // 创作维度 - 体裁分类
          if (genreCategoryData) {
            const genreCategoryTableData = genreCategoryData.props.dataSource;
            const genreCategoryColumns = genreCategoryData.props.columns;
            
            const genreCategorySheetData = genreCategoryTableData.map(item => {
              const row = {};
              genreCategoryColumns.forEach(col => {
                row[col.title] = item[col.dataIndex] || '';
              });
              return row;
            });
            
            const genreCategorySheet = XLSX.utils.json_to_sheet(genreCategorySheetData);
            XLSX.utils.book_append_sheet(wb, genreCategorySheet, '体裁分类');
          }
          
          // 创作维度 - 视频时长
          if (videoDurationData) {
            const videoDurationTableData = videoDurationData.props.dataSource;
            const videoDurationColumns = videoDurationData.props.columns;
            
            const videoDurationSheetData = videoDurationTableData.map(item => {
              const row = {};
              videoDurationColumns.forEach(col => {
                row[col.title] = item[col.dataIndex] || '';
              });
              return row;
            });
            
            const videoDurationSheet = XLSX.utils.json_to_sheet(videoDurationSheetData);
            XLSX.utils.book_append_sheet(wb, videoDurationSheet, '视频时长');
          }
          
          // 创作维度 - 专项策划
          if (specialPlanningData) {
            const specialPlanningTableData = specialPlanningData.props.dataSource;
            const specialPlanningColumns = specialPlanningData.props.columns;
            
            const specialPlanningSheetData = specialPlanningTableData.map(item => {
              const row = {};
              specialPlanningColumns.forEach(col => {
                row[col.title] = item[col.dataIndex] || '';
              });
              return row;
            });
            
            const specialPlanningSheet = XLSX.utils.json_to_sheet(specialPlanningSheetData);
            XLSX.utils.book_append_sheet(wb, specialPlanningSheet, '专项策划');
          }
          break;
          
        case 'interaction':
          // 互动外延数据
          const interactionData = this.analyzeByInteraction();
          if (interactionData) {
            const interactionTableData = interactionData.props.dataSource;
            const interactionColumns = interactionData.props.columns;
            
            const interactionSheetData = interactionTableData.map(item => {
              const row = {};
              interactionColumns.forEach(col => {
                row[col.title] = item[col.dataIndex] || '';
              });
              return row;
            });
            
            const interactionSheet = XLSX.utils.json_to_sheet(interactionSheetData);
            XLSX.utils.book_append_sheet(wb, interactionSheet, '互动外延');
          }
          break;
          
        default:
          break;
      }
      
      // 生成Excel文件并下载
      const fileName = `数据分析_${tabKey}_${moment().format('YYYYMMDDHHmmss')}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      message.success('导出成功！');
    } catch (error) {
      console.error('导出失败:', error);
      message.error('导出失败，请检查数据格式');
    }
  }



  render() {
    const { dateRange, loading, activeTab } = this.state;
    const { RangePicker } = DatePicker;
    
    return (
      <div className="app-container">
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>数据分析</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button 
              type="primary" 
              onClick={() => this.exportToExcel(activeTab)}
              disabled={loading}
            >
              导出Excel
            </Button>
            <RangePicker 
              onChange={this.handleDateRangeChange} 
              value={dateRange}
              placeholder={['开始日期', '结束日期']}
            />
          </div>
        </div>
        <Card>
          <Spin spinning={loading} tip="正在加载数据...">
            <Tabs defaultActiveKey="time" onChange={this.handleTabChange} activeKey={this.state.activeTab}>
              <TabPane tab="时间维度" key="time">
                {!loading && this.state.analysisData.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <div style={{ fontSize: '48px', color: '#f0f0f0', marginBottom: '16px' }}>📊</div>
                    <div style={{ fontSize: '16px', color: '#999', marginBottom: '8px' }}>暂无查询数据</div>
                    <div style={{ fontSize: '14px', color: '#ccc' }}>请尝试调整筛选条件或导入数据后再查看</div>
                  </div>
                ) : (
                  <div style={{ marginBottom: 16 }}>
                    <h3>按月份发布数量分析</h3>
                    <div 
                      id="time-chart" 
                      ref={(el) => this.chartRefs['time-chart'] = el}
                      style={{ width: '100%', height: '400px', marginBottom: 24 }} 
                    />
                    {this.analyzeByTime()}
                  </div>
                )}
              </TabPane>
              <TabPane tab="平台维度" key="platform">
                {!loading && this.state.analysisData.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <div style={{ fontSize: '48px', color: '#f0f0f0', marginBottom: '16px' }}>📊</div>
                    <div style={{ fontSize: '16px', color: '#999', marginBottom: '8px' }}>暂无查询数据</div>
                    <div style={{ fontSize: '14px', color: '#ccc' }}>请尝试调整筛选条件或导入数据后再查看</div>
                  </div>
                ) : (
                  <div style={{ marginBottom: 16 }}>
                    <h3>各平台发布数量分析</h3>
                    <div 
                      id="platform-bar-chart" 
                      ref={(el) => this.chartRefs['platform-bar-chart'] = el}
                      style={{ width: '100%', height: '400px', marginBottom: 24, border: '1px solid #f0f0f0' }} 
                    />
                    <h3>各平台发布数量占比</h3>
                    <div 
                      id="platform-chart" 
                      ref={(el) => this.chartRefs['platform-chart'] = el}
                      style={{ width: '100%', height: '400px', marginBottom: 24, border: '1px solid #f0f0f0' }} 
                    />
                    {this.analyzeByPlatform()}
                  </div>
                )}
              </TabPane>
              <TabPane tab="是否首发" key="first-release">
                {!loading && this.state.analysisData.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <div style={{ fontSize: '48px', color: '#f0f0f0', marginBottom: '16px' }}>📊</div>
                    <div style={{ fontSize: '16px', color: '#999', marginBottom: '8px' }}>暂无查询数据</div>
                    <div style={{ fontSize: '14px', color: '#ccc' }}>请尝试调整筛选条件或导入数据后再查看</div>
                  </div>
                ) : (
                  <div style={{ marginBottom: 16 }}>
                    <h3>是否首发分析</h3>
                    <div 
                      id="first-release-chart" 
                      ref={(el) => this.chartRefs['first-release-chart'] = el}
                      style={{ width: '100%', height: '400px', marginBottom: 24, border: '1px solid #f0f0f0' }} 
                    />
                    {this.analyzeByFirstRelease()}
                  </div>
                )}
              </TabPane>
              <TabPane tab="内容维度" key="content">
                {!loading && this.state.analysisData.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <div style={{ fontSize: '48px', color: '#f0f0f0', marginBottom: '16px' }}>📊</div>
                    <div style={{ fontSize: '16px', color: '#999', marginBottom: '8px' }}>暂无查询数据</div>
                    <div style={{ fontSize: '14px', color: '#ccc' }}>请尝试调整筛选条件或导入数据后再查看</div>
                  </div>
                ) : (
                  <div style={{ marginBottom: 16 }}>
                    <h3>内容分类发布数量</h3>
                    <div 
                      id="content-chart" 
                      ref={(el) => this.chartRefs['content-chart'] = el}
                      style={{ width: '100%', height: '400px', marginBottom: 24 }} 
                    />
                    {this.analyzeByContent()}
                  </div>
                )}
              </TabPane>
              <TabPane tab="影响力维度" key="influence">
                {!loading && this.state.analysisData.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <div style={{ fontSize: '48px', color: '#f0f0f0', marginBottom: '16px' }}>📊</div>
                    <div style={{ fontSize: '16px', color: '#999', marginBottom: '8px' }}>暂无查询数据</div>
                    <div style={{ fontSize: '14px', color: '#ccc' }}>请尝试调整筛选条件或导入数据后再查看</div>
                  </div>
                ) : (
                  <div style={{ marginBottom: 16 }}>
                    <h3>影响力分析</h3>
                    {this.analyzeByInfluence()}
                  </div>
                )}
              </TabPane>
              <TabPane tab="用户维度" key="user">
                {!loading && this.state.analysisData.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <div style={{ fontSize: '48px', color: '#f0f0f0', marginBottom: '16px' }}>📊</div>
                    <div style={{ fontSize: '16px', color: '#999', marginBottom: '8px' }}>暂无查询数据</div>
                    <div style={{ fontSize: '14px', color: '#ccc' }}>请尝试调整筛选条件或导入数据后再查看</div>
                  </div>
                ) : (
                  <div style={{ marginBottom: 16 }}>
                    <h3>用户地域分布</h3>
                    <div 
                      id="user-chart" 
                      ref={(el) => this.chartRefs['user-chart'] = el}
                      style={{ width: '100%', height: '400px', marginBottom: 24 }} 
                    />
                    {this.analyzeByUser()}
                  </div>
                )}
              </TabPane>
              <TabPane tab="创作维度" key="creation">
                <Tabs defaultActiveKey="department-name" onChange={(key) => {
                  if (key === 'department-category') {
                    // 当切换到科室分类tab时初始化图表
                    setTimeout(() => {
                      this.initDepartmentCategoryChart();
                    }, 100);
                  } else if (key === 'genre-category') {
                    // 当切换到体裁分类tab时初始化图表
                    setTimeout(() => {
                      this.initGenreCategoryChart();
                    }, 100);
                  }
                }}>
                  <TabPane tab="科室名称" key="department-name">
                    {!loading && this.state.analysisData.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '60px 0' }}>
                        <div style={{ fontSize: '48px', color: '#f0f0f0', marginBottom: '16px' }}>📊</div>
                        <div style={{ fontSize: '16px', color: '#999', marginBottom: '8px' }}>暂无查询数据</div>
                        <div style={{ fontSize: '14px', color: '#ccc' }}>请尝试调整筛选条件或导入数据后再查看</div>
                      </div>
                    ) : (
                      <div style={{ marginBottom: 16 }}>
                        <h3>科室名称分析</h3>
                        {this.analyzeByDepartmentName()}
                      </div>
                    )}
                  </TabPane>
                  <TabPane tab="科室分类" key="department-category">
                    {!loading && this.state.analysisData.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '60px 0' }}>
                        <div style={{ fontSize: '48px', color: '#f0f0f0', marginBottom: '16px' }}>📊</div>
                        <div style={{ fontSize: '16px', color: '#999', marginBottom: '8px' }}>暂无查询数据</div>
                        <div style={{ fontSize: '14px', color: '#ccc' }}>请尝试调整筛选条件或导入数据后再查看</div>
                      </div>
                    ) : (
                      <div style={{ marginBottom: 16 }}>
                        <h3>科室分类分析</h3>
                        <div 
                          id="department-category-chart" 
                          ref={(el) => {
                            this.chartRefs['department-category-chart'] = el;
                          }}
                          style={{ width: '100%', height: '400px', marginBottom: 24 }} 
                        />
                        {this.analyzeByDepartmentCategory()}
                      </div>
                    )}
                  </TabPane>
                  <TabPane tab="作者" key="author">
                    {!loading && this.state.analysisData.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '60px 0' }}>
                        <div style={{ fontSize: '48px', color: '#f0f0f0', marginBottom: '16px' }}>📊</div>
                        <div style={{ fontSize: '16px', color: '#999', marginBottom: '8px' }}>暂无查询数据</div>
                        <div style={{ fontSize: '14px', color: '#ccc' }}>请尝试调整筛选条件或导入数据后再查看</div>
                      </div>
                    ) : (
                      <div style={{ marginBottom: 16 }}>
                        <h3>作者分析</h3>
                        {this.analyzeByAuthor()}
                      </div>
                    )}
                  </TabPane>
                  <TabPane tab="记者" key="reporter">
                    {!loading && this.state.analysisData.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '60px 0' }}>
                        <div style={{ fontSize: '48px', color: '#f0f0f0', marginBottom: '16px' }}>📊</div>
                        <div style={{ fontSize: '16px', color: '#999', marginBottom: '8px' }}>暂无查询数据</div>
                        <div style={{ fontSize: '14px', color: '#ccc' }}>请尝试调整筛选条件或导入数据后再查看</div>
                      </div>
                    ) : (
                      <div style={{ marginBottom: 16 }}>
                        <h3>记者分析</h3>
                        {this.analyzeByReporter()}
                      </div>
                    )}
                  </TabPane>
                  <TabPane tab="具体栏目" key="media-column">
                    {!loading && this.state.analysisData.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '60px 0' }}>
                        <div style={{ fontSize: '48px', color: '#f0f0f0', marginBottom: '16px' }}>📊</div>
                        <div style={{ fontSize: '16px', color: '#999', marginBottom: '8px' }}>暂无查询数据</div>
                        <div style={{ fontSize: '14px', color: '#ccc' }}>请尝试调整筛选条件或导入数据后再查看</div>
                      </div>
                    ) : (
                      <div style={{ marginBottom: 16 }}>
                        <h3>具体栏目分析</h3>
                        {this.analyzeByMediaColumn()}
                      </div>
                    )}
                  </TabPane>
                  <TabPane tab="体裁分类" key="genre-category">
                    {!loading && this.state.analysisData.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '60px 0' }}>
                        <div style={{ fontSize: '48px', color: '#f0f0f0', marginBottom: '16px' }}>📊</div>
                        <div style={{ fontSize: '16px', color: '#999', marginBottom: '8px' }}>暂无查询数据</div>
                        <div style={{ fontSize: '14px', color: '#ccc' }}>请尝试调整筛选条件或导入数据后再查看</div>
                      </div>
                    ) : (
                      <div style={{ marginBottom: 16 }}>
                        <h3>体裁分类分析</h3>
                        <div 
                          id="genre-category-chart" 
                          ref={(el) => {
                            this.chartRefs['genre-category-chart'] = el;
                          }}
                          style={{ width: '100%', height: '400px', marginBottom: 24 }} 
                        />
                        {this.analyzeByGenreCategory()}
                      </div>
                    )}
                  </TabPane>
                  <TabPane tab="视频时长" key="video-duration">
                    {!loading && this.state.analysisData.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '60px 0' }}>
                        <div style={{ fontSize: '48px', color: '#f0f0f0', marginBottom: '16px' }}>📊</div>
                        <div style={{ fontSize: '16px', color: '#999', marginBottom: '8px' }}>暂无查询数据</div>
                        <div style={{ fontSize: '14px', color: '#ccc' }}>请尝试调整筛选条件或导入数据后再查看</div>
                      </div>
                    ) : (
                      <div style={{ marginBottom: 16 }}>
                        <h3>视频时长分析</h3>
                        {this.analyzeByVideoDuration()}
                      </div>
                    )}
                  </TabPane>
                  <TabPane tab="专项策划" key="special-planning">
                    {!loading && this.state.analysisData.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '60px 0' }}>
                        <div style={{ fontSize: '48px', color: '#f0f0f0', marginBottom: '16px' }}>📊</div>
                        <div style={{ fontSize: '16px', color: '#999', marginBottom: '8px' }}>暂无查询数据</div>
                        <div style={{ fontSize: '14px', color: '#ccc' }}>请尝试调整筛选条件或导入数据后再查看</div>
                      </div>
                    ) : (
                      <div style={{ marginBottom: 16 }}>
                        <h3>专项策划分析</h3>
                        {this.analyzeBySpecialPlanning()}
                      </div>
                    )}
                  </TabPane>
                </Tabs>
              </TabPane>
              <TabPane tab="互动外延" key="interaction">
                {!loading && this.state.analysisData.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <div style={{ fontSize: '48px', color: '#f0f0f0', marginBottom: '16px' }}>📊</div>
                    <div style={{ fontSize: '16px', color: '#999', marginBottom: '8px' }}>暂无查询数据</div>
                    <div style={{ fontSize: '14px', color: '#ccc' }}>请尝试调整筛选条件或导入数据后再查看</div>
                  </div>
                ) : (
                  <div style={{ marginBottom: 16 }}>
                    <h3>互动外延分析</h3>
                    {this.analyzeByInteraction()}
                  </div>
                )}
              </TabPane>
            </Tabs>
          </Spin>
        </Card>
      </div>
    );
  }
}

// 不需要从 Redux 获取数据，因为我们直接从后端获取
export default DataAnalysis;