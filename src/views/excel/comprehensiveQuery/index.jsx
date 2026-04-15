import React, { Component } from "react";
import { Table, Tooltip, Button, message, Spin, DatePicker, Select, Input, Row, Col, Card, Modal, Form } from "antd";
import { connect } from "react-redux";
import { setQueryFilters, clearQueryFilters } from "@/store/actions/app";
import { queryExcelData, getExcelData, deleteExcelData } from "@/api/excel";
import { debounce } from "@/utils";
import { isSmallScreen } from "@/utils/device";
import { CONTENT_CATEGORY_MAP } from "@/config/dictionaries";

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Search } = Input;

class ComprehensiveQuery extends Component {
  state = {
    tableData: [],
    tableColumns: [],
    loading: false,
    filterPanelExpanded: false
  };

  // 从后端获取数据
  fetchData = async () => {
    this.setState({ loading: true });
    try {
      // 调用后端API获取所有数据
      const response = await getExcelData();
      const data = response.data || []; // 如果 data 为 null 或 undefined，使用空数组
      
      // 内容分类映射（使用统一配置）
      const contentCategoryMap = CONTENT_CATEGORY_MAP;
      
      // 处理数据，转换字段名和处理省份占比
      const formattedData = data.map(item => {
        // 转换内容分类编码为文本
        const contentCategoryText = contentCategoryMap[item.content_category] || item.content_category || '';
        
        const formattedItem = {
          '平台': item.platform || '',
          '文章ID': item.article_id || '',
          '标题': item.title || '',
          '导入时间': item.import_time ? new Date(item.import_time).toLocaleString() : '',
          '是否首发': item.is_first_release || '',
          '发布时间': item.publish_time ? new Date(item.publish_time).toLocaleString() : '',
          '阅读量': item.reading_count || 0,
          '分享量': item.share_count || 0,
          '链接': item.link || '',
          '完播率': item.complete_rate || '',
          '平均播放时长': item.avg_play_time || '',
          '点赞量': item.like_count || 0,
          '收藏量': item.collect_count || 0,
          '内容分类': contentCategoryText,
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
          '京外占比': item.non_beijing_ratio || ''
        };
        
        // 处理省份占比数据
        if (item.provinceRatios && item.provinceRatios.length > 0) {
          item.provinceRatios.forEach(provinceRatio => {
            formattedItem[provinceRatio.province_name] = provinceRatio.ratio;
          });
        }
        
        return formattedItem;
      });
      
      this.setState({ 
        tableData: formattedData,
        loading: false 
      }, () => {
        // 生成表格列
        this.generateColumns();
      });
    } catch (error) {
      this.setState({ loading: false });
      message.error('获取数据失败，请检查后端服务是否正常');
    }
  }

  // 生成表格列
  generateColumns() {
    const { tableData } = this.state;
    if (!tableData.length) return;

    // 获取所有列名
    const header = Object.keys(tableData[0]);
    
    const tableColumns = header.map((item, index) => {
      const column = {
        title: item,
        dataIndex: item,
        key: item,
        width: 100,
        align: "center",
        ellipsis: true
      };



      // 特殊列处理
      if (item === '链接') {
        column.width = 80;
        column.render = (text, row) => {
          if (text && (text.indexOf('http') !== -1 || text.indexOf('export/') !== -1)) {
            return (
              <Tooltip placement="top" title={text}>
                <Button type="link" size="small" onClick={() => {
                  if (text.indexOf('http') !== -1) {
                    window.open(text);
                  } else {
                    message.info('视频ID: ' + text);
                  }
                }}>{text.indexOf('http') !== -1 ? '文章链接' : '视频ID'}</Button>
              </Tooltip>
            )  
          }
          return text;
        };
      } else if (item === '标题') {
        column.width = 550;
        column.ellipsis = true;
        column.render = (text, row) => (
          <Tooltip placement="top" title={text}>
            <div style={{ 
              whiteSpace: 'nowrap', 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              cursor: 'pointer',
              maxWidth: '550px'
            }}>
              {text}
            </div>
          </Tooltip>
        );
      } else if (item === '发布时间') {
        column.width = 180;
        column.sorter = (a, b) => {
          const dateA = new Date(a[item]).getTime();
          const dateB = new Date(b[item]).getTime();
          return dateA - dateB;
        };
      } else if (item === '导入时间') {
        column.width = 180;
        column.sorter = (a, b) => {
          const dateA = new Date(a[item]).getTime();
          const dateB = new Date(b[item]).getTime();
          return dateA - dateB;
        };
      } else if (item === '是否首发') {
        column.width = 100;
        column.sorter = (a, b) => {
          return a[item].localeCompare(b[item]);
        };
      } else if (item === '阅读量' || item === '分享量' || item === '点赞量' || item === '收藏量' || item === '热搜阅读量') {
        column.width = 80;
        column.sorter = (a, b) => {
          return a[item] - b[item];
        };
      } else if (item === '完播率') {
        column.width = 90;
        column.sorter = (a, b) => {
          const rateA = parseFloat(a[item]) || 0;
          const rateB = parseFloat(b[item]) || 0;
          return rateA - rateB;
        };
      } else if (item === '平均播放时长') {
        column.width = 100;
        column.sorter = (a, b) => {
          // 处理不同格式的时长，如"00:00:00"或数字
          const parseTime = (time) => {
            if (typeof time === 'number') return time;
            if (typeof time === 'string') {
              if (time.includes(':')) {
                const parts = time.split(':').map(Number);
                return parts[0] * 3600 + parts[1] * 60 + parts[2];
              }
              return parseFloat(time) || 0;
            }
            return 0;
          };
          return parseTime(a[item]) - parseTime(b[item]);
        };
      } else if (item === '京内占比' || item === '京外占比') {
        column.width = 90;
      } else if (item === '科室名称' || item === '科室分类') {
        column.width = 160;
        column.ellipsis = true;
        column.render = (text, row) => (
          <Tooltip placement="top" title={text}>
            <div style={{ 
              whiteSpace: 'nowrap', 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              cursor: 'pointer'
            }}>
              {text}
            </div>
          </Tooltip>
        );
      } else if (item === '来源' || item === '专项策划' || item === '作者') {
        column.width = 150;
        column.ellipsis = true;
        column.render = (text, row) => (
          <Tooltip placement="top" title={text}>
            <div style={{ 
              whiteSpace: 'nowrap', 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              cursor: 'pointer'
            }}>
              {text}
            </div>
          </Tooltip>
        );
      } else if (this.isProvinceField(item)) {
        column.width = 80;
      }

      return column;
    });
    
    // 非移动端才显示删除按钮
    if (!isSmallScreen()) {
      // 添加操作列
      tableColumns.push({
        title: '操作',
        key: 'action',
        width: 100,
        align: 'center',
        fixed: 'right',
        render: (text, record) => (
          <Button 
            type="danger" 
            size="small" 
            onClick={() => this.handleDeleteData(record)}
          >
            删除
          </Button>
        )
      });
    }

    this.setState({ tableColumns });
  }
  
  // 判断是否为省份字段
  isProvinceField(fieldName) {
    // 省份字段特征：
    // 1. 两个字或三个字
    // 2. 包含常见省份特征词
    const provinceKeywords = ['省', '市', '自治区', '特别行政区', '河北', '山西', '辽宁', '吉林', '黑龙江', '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南', '湖北', '湖南', '广东', '海南', '四川', '贵州', '云南', '陕西', '甘肃', '青海', '台湾', '内蒙古', '广西', '西藏', '宁夏', '新疆', '北京', '天津', '上海', '重庆', '香港', '澳门'];
    
    return provinceKeywords.some(keyword => fieldName.includes(keyword));
  }

  // 获取平台选项
  getPlatformOptions() {
    const { dictionaries } = this.props;
    const platforms = dictionaries && dictionaries.platforms ? dictionaries.platforms : [];
    if (platforms.length === 0) {
      return [<Option key="no-data" value="">暂无数据</Option>];
    }
    return platforms.map(platform => (
      <Option key={platform.code} value={platform.name}>{platform.name}</Option>
    ));
  }

  // 获取科室选项
  getDepartmentOptions() {
    const { dictionaries } = this.props;
    const departments = dictionaries && dictionaries.departments ? dictionaries.departments : [];
    if (departments.length === 0) {
      return [<Option key="no-data" value="">暂无数据</Option>];
    }
    return departments.map(department => (
      <Option key={department.code} value={department.name}>{department.name}</Option>
    ));
  }

  // 获取内容分类选项
  getContentCategoryOptions() {
    const { dictionaries } = this.props;
    const contentCategories = dictionaries && dictionaries.contentCategories ? dictionaries.contentCategories : [];
    if (contentCategories.length === 0) {
      // 使用统一的字典配置作为备用
      const contentCategoriesFromConfig = Object.entries(CONTENT_CATEGORY_MAP);
      if (contentCategoriesFromConfig.length === 0) {
        return [<Option key="no-data" value="">暂无数据</Option>];
      }
      return contentCategoriesFromConfig.map(([code, name]) => (
        <Option key={code} value={name}>{name}</Option>
      ));
    }
    return contentCategories.map(category => (
      <Option key={category.code} value={category.name}>{category.name}</Option>
    ));
  }

  // 获取科室分类选项
  getDepartmentCategoryOptions() {
    const { dictionaries } = this.props;
    const departmentCategories = dictionaries && dictionaries.departmentCategories ? dictionaries.departmentCategories : [];
    if (departmentCategories.length === 0) {
      return [<Option key="no-data" value="">暂无数据</Option>];
    }
    return departmentCategories.map(category => (
      <Option key={category.code} value={category.name}>{category.name}</Option>
    ));
  }

  // 处理平台筛选
  handlePlatformChange = (values) => {
    const newFilters = {
      ...this.props.queryFilters,
      platform: values
    };
    this.props.setQueryFilters(newFilters);
  };

  // 处理科室筛选
  handleDepartmentChange = (values) => {
    const newFilters = {
      ...this.props.queryFilters,
      department: values
    };
    this.props.setQueryFilters(newFilters);
  };

  // 处理科室分类筛选
  handleDepartmentCategoryChange = (values) => {
    const newFilters = {
      ...this.props.queryFilters,
      departmentCategory: values
    };
    this.props.setQueryFilters(newFilters);
  };

  // 处理内容分类筛选
  handleContentCategoryChange = (values) => {
    const newFilters = {
      ...this.props.queryFilters,
      contentCategory: values
    };
    this.props.setQueryFilters(newFilters);
  };

  // 处理日期范围筛选
  handleDateRangeChange = (dates) => {
    const newFilters = {
      ...this.props.queryFilters,
      dateRange: dates
    };
    this.props.setQueryFilters(newFilters);
  };

  // 处理导入时间范围筛选
  handleImportDateRangeChange = (dates) => {
    const newFilters = {
      ...this.props.queryFilters,
      importDateRange: dates
    };
    this.props.setQueryFilters(newFilters);
  };

  // 处理关键词搜索
  handleKeywordSearch = (value) => {
    const newFilters = {
      ...this.props.queryFilters,
      keyword: value
    };
    this.props.setQueryFilters(newFilters);
  };

  // 重置筛选条件
  handleResetFilters = () => {
    // 清空Redux中的筛选条件
    this.props.clearQueryFilters();
    // 从后端重新获取数据
    this.fetchData();
    message.success('筛选条件已重置');
  };

  // 删除单条数据
  handleDeleteData = (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除这条数据吗？`,
      onOk: async () => {
        try {
          // 调用后端API删除数据
          await deleteExcelData([record['文章ID']]);
          message.success('数据删除成功');
          // 重新获取数据
          this.fetchData();
        } catch (error) {
          message.error('删除数据失败，请检查后端服务是否正常');
        }
      },
      onCancel: () => {
      }
    });
  };

  // 批量删除数据
  handleBatchDelete = () => {
    const { tableData } = this.state;
    if (tableData.length === 0) return;

    Modal.confirm({
      title: '确认批量删除',
      content: `确定要删除当前查询结果中的 ${tableData.length} 条数据吗？`,
      onOk: async () => {
        try {
          // 获取所有文章ID
          const articleIds = tableData.map(item => item['文章ID']);
          // 调用后端API删除数据
          await deleteExcelData(articleIds);
          message.success(`成功删除 ${tableData.length} 条数据`);
          // 重新获取数据
          this.fetchData();
        } catch (error) {
          message.error('批量删除数据失败，请检查后端服务是否正常');
        }
      },
      onCancel: () => {
      }
    });
  };

  // 切换筛选面板展开/收起状态
  toggleFilterPanel = () => {
    this.setState(prevState => ({
      filterPanelExpanded: !prevState.filterPanelExpanded
    }));
  };

  // 查询数据
  handleQuery = async () => {
    this.setState({ loading: true });
    
    const filters = this.props.queryFilters;
    
    try {
      // 准备请求参数
      const params = {
        platform: filters.platform.length > 0 ? filters.platform : undefined,
        department: filters.department.length > 0 ? filters.department : undefined,
        departmentCategory: filters.departmentCategory.length > 0 ? filters.departmentCategory : undefined,
        contentCategory: filters.contentCategory.length > 0 ? filters.contentCategory[0] : undefined,
        startDate: filters.dateRange && filters.dateRange.length === 2 ? filters.dateRange[0].format('YYYY-MM-DD') : undefined,
        endDate: filters.dateRange && filters.dateRange.length === 2 ? filters.dateRange[1].format('YYYY-MM-DD') : undefined,
        importStartDate: filters.importDateRange && filters.importDateRange.length === 2 ? filters.importDateRange[0].format('YYYY-MM-DD') : undefined,
        importEndDate: filters.importDateRange && filters.importDateRange.length === 2 ? filters.importDateRange[1].format('YYYY-MM-DD') : undefined,
        keyword: filters.keyword || undefined
      };
      
      // 调用后端API获取数据
      const response = await queryExcelData(params);
      let filteredData = response.data || []; // 如果 data 为 null 或 undefined，使用空数组
      
      // 内容分类映射（使用统一配置）
      const contentCategoryMap = CONTENT_CATEGORY_MAP;
      
      // 处理provinceRatios字段，避免直接渲染对象
      filteredData = filteredData.map(item => {
        // 转换内容分类编码为文本
        const contentCategoryText = contentCategoryMap[item.content_category] || item.content_category || '';
        
        // 转换字段名，从 snake_case 转换为 中文
        const formattedItem = {
          '平台': item.platform || '',
          '文章ID': item.article_id || '',
          '标题': item.title || '',
          '导入时间': item.import_time ? new Date(item.import_time).toLocaleString() : '',
          '是否首发': item.is_first_release || '',
          '发布时间': item.publish_time ? new Date(item.publish_time).toLocaleString() : '',
          '阅读量': item.reading_count || 0,
          '分享量': item.share_count || 0,
          '链接': item.link || '',
          '完播率': item.complete_rate || '',
          '平均播放时长': item.avg_play_time || '',
          '点赞量': item.like_count || 0,
          '收藏量': item.collect_count || 0,
          '内容分类': contentCategoryText,
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
          '京外占比': item.non_beijing_ratio || ''
        };
        
        // 处理省份占比数据
        if (item.provinceRatios && item.provinceRatios.length > 0) {
          item.provinceRatios.forEach(provinceRatio => {
            formattedItem[provinceRatio.province_name] = provinceRatio.ratio;
          });
        }
        
        return formattedItem;
      });
      
      this.setState({ 
        tableData: filteredData,
        loading: false 
      });
      
      // 生成表格列
      this.generateColumns();
      
      message.success(`查询完成，共 ${filteredData.length} 条数据`);
    } catch (error) {
      this.setState({ loading: false });
      message.error('查询数据失败，请检查后端服务是否正常');
    }
  };

  componentDidMount() {
    // 从后端获取数据
    this.fetchData();
    
    // 检查是否为移动端，添加移动端样式
    const isMobile = isSmallScreen();
    if (isMobile) {
      // 动态添加移动端样式
      const style = document.createElement('style');
      style.id = 'mobile-comprehensive-query-styles';
      style.textContent = `
        .mobile-card-head-title .ant-card-head-title {
          padding: 0 !important;
        }
        .mobile-form-item .ant-form-item-label > label {
          height: 32px;
          line-height: 32px;
        }
        .mobile-form-item .ant-form-item-control {
          line-height: 32px;
        }
        .mobile-form-item .ant-select-selector,
        .mobile-form-item .ant-input,
        .mobile-form-item .ant-picker {
          min-height: 32px;
          height: 32px;
          line-height: 32px;
        }
        .mobile-form-item .ant-row {
          margin-bottom: 8px !important;
        }
        .mobile-form-item .ant-form-item {
          margin-bottom: 0 !important;
        }
        /* 确保覆盖内联样式 */
        .mobile-form-item .ant-row {
          margin-bottom: 8px !important;
        }
        .mobile-form-item .ant-row[style] {
          margin-bottom: 8px !important;
        }
        .mobile-form-item .ant-row {
          margin-bottom: 8px !important;
        }
      `;
      
      // 先移除已存在的样式，避免重复
      const existingStyle = document.getElementById('mobile-comprehensive-query-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
      
      document.head.appendChild(style);
    }
  }

  render() {
    const { tableData, tableColumns, loading, filterPanelExpanded } = this.state;
    const filters = this.props.queryFilters;
    const isMobile = isSmallScreen();
    
    // 不再在render中添加样式，改为在componentDidMount中添加

    return (
      <div style={{ padding: '10px 16px' }}>
        <Card 
          title="综合查询" 
          style={{ marginBottom: 10, padding: '16px 24px' }} 
          className={isMobile ? 'mobile-card-head-title' : ''}
        >
          {/* 移动端筛选面板 */}
          {isMobile && (
            <div style={{ marginBottom: 8, padding: 0 }} className="mobile-form-item">
              <Form layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} style={{ margin: 0 }}>
                <div style={{ marginBottom: 4 }}>
                  <Form.Item label="平台" style={{ marginBottom: 0 }}>
                    <Select
                      mode="multiple"
                      style={{ width: '100%' }}
                      placeholder="选择平台"
                      value={filters.platform}
                      onChange={this.handlePlatformChange}
                    >
                      {this.getPlatformOptions()}
                    </Select>
                  </Form.Item>
                </div>
                <div style={{ marginBottom: 4 }}>
                  <Form.Item label="关键词搜索" style={{ marginBottom: 0 }}>
                    <Search
                      placeholder="搜索标题、作者等"
                      allowClear
                      style={{ width: '100%' }}
                      value={filters.keyword}
                      onChange={(e) => this.handleKeywordSearch(e.target.value)}
                      onSearch={(value) => this.handleKeywordSearch(value)}
                    />
                  </Form.Item>
                </div>
              </Form>
              {!filterPanelExpanded && (
                <div style={{ marginBottom: 8, marginTop: 4 }}>
                  <div style={{ textAlign: 'center' }}>
                    <Button 
                      type="primary" 
                      onClick={this.toggleFilterPanel}
                      style={{ width: '100%' }}
                    >
                      展开更多筛选条件
                    </Button>
                  </div>
                </div>
              )}
              {filterPanelExpanded && (
                <div style={{ marginTop: 8, padding: 0 }} className="mobile-form-item">
                  <Form layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} style={{ margin: 0 }}>
                    <div style={{ marginBottom: 4 }}>
                      <Form.Item label="科室" style={{ marginBottom: 0 }}>
                        <Select
                          mode="multiple"
                          style={{ width: '100%' }}
                          placeholder="选择科室"
                          value={filters.department}
                          onChange={this.handleDepartmentChange}
                        >
                          {this.getDepartmentOptions()}
                        </Select>
                      </Form.Item>
                    </div>
                    <div style={{ marginBottom: 4 }}>
                      <Form.Item label="科室分类" style={{ marginBottom: 0 }}>
                        <Select
                          mode="multiple"
                          style={{ width: '100%' }}
                          placeholder="选择科室分类"
                          value={filters.departmentCategory}
                          onChange={this.handleDepartmentCategoryChange}
                        >
                          {this.getDepartmentCategoryOptions()}
                        </Select>
                      </Form.Item>
                    </div>
                    <div style={{ marginBottom: 4 }}>
                      <Form.Item label="内容分类" style={{ marginBottom: 0 }}>
                        <Select
                          mode="multiple"
                          style={{ width: '100%' }}
                          placeholder="选择内容分类"
                          value={filters.contentCategory}
                          onChange={this.handleContentCategoryChange}
                        >
                          {this.getContentCategoryOptions()}
                        </Select>
                      </Form.Item>
                    </div>
                    <div style={{ marginBottom: 4 }}>
                      <Form.Item label="发布时间" style={{ marginBottom: 0 }}>
                        <RangePicker 
                          style={{ width: '100%' }} 
                          value={filters.dateRange} 
                          onChange={this.handleDateRangeChange} 
                        />
                      </Form.Item>
                    </div>
                    <div style={{ marginBottom: 4 }}>
                      <Form.Item label="导入时间" style={{ marginBottom: 0 }}>
                        <RangePicker 
                          style={{ width: '100%' }} 
                          value={filters.importDateRange} 
                          onChange={this.handleImportDateRangeChange} 
                        />
                      </Form.Item>
                    </div>
                  </Form>
                  <div style={{ marginBottom: 8, marginTop: 4 }}>
                    <div style={{ textAlign: 'center' }}>
                      <Button 
                        type="primary" 
                        onClick={this.toggleFilterPanel}
                        style={{ width: '100%' }}
                      >
                        收起筛选条件
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* 移动端按钮组 */}
              <div style={{ marginBottom: 8, marginTop: 4 }}>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <Button 
                      style={{ width: '100%' }}
                      onClick={this.handleResetFilters}
                    >
                      重置
                    </Button>
                  </div>
                  <div style={{ flex: 1 }}>
                    <Button 
                      type="primary" 
                      style={{ width: '100%' }}
                      onClick={this.handleQuery}
                    >
                      查询
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* 桌面端筛选面板 */}
          {!isMobile && (
            <Form layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={12} md={8} lg={6} xl={4}>
                  <Form.Item label="平台" style={{ marginBottom: 0 }}>
                    <Select
                      mode="multiple"
                      style={{ width: '100%' }}
                      placeholder="选择平台"
                      value={filters.platform}
                      onChange={this.handlePlatformChange}
                      optionFilterProp="children"
                      autoClearSearchValue={false}
                      dropdownStyle={{ minWidth: '180px' }}
                    >
                      {this.getPlatformOptions()}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6} xl={4}>
                  <Form.Item label="科室" style={{ marginBottom: 0 }}>
                    <Select
                      mode="multiple"
                      style={{ width: '100%' }}
                      placeholder="选择科室"
                      value={filters.department}
                      onChange={this.handleDepartmentChange}
                      optionFilterProp="children"
                      autoClearSearchValue={false}
                      dropdownStyle={{ minWidth: '180px' }}
                    >
                      {this.getDepartmentOptions()}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6} xl={4}>
                  <Form.Item label="科室分类" labelCol={{ span: 9 }} wrapperCol={{ span: 15 }} style={{ marginBottom: 0 }}>
                    <Select
                      mode="multiple"
                      style={{ width: '100%' }}
                      placeholder="选择科室分类"
                      value={filters.departmentCategory}
                      onChange={this.handleDepartmentCategoryChange}
                      optionFilterProp="children"
                      autoClearSearchValue={false}
                      dropdownStyle={{ minWidth: '180px' }}
                    >
                      {this.getDepartmentCategoryOptions()}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6} xl={4}>
                  <Form.Item label="内容分类" labelCol={{ span: 9 }} wrapperCol={{ span: 15 }} style={{ marginBottom: 0 }}>
                    <Select
                      mode="multiple"
                      style={{ width: '100%' }}
                      placeholder="选择内容分类"
                      value={filters.contentCategory}
                      onChange={this.handleContentCategoryChange}
                      optionFilterProp="children"
                      autoClearSearchValue={false}
                      dropdownStyle={{ minWidth: '180px' }}
                    >
                      {this.getContentCategoryOptions()}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={16} lg={12} xl={6}>
                  <Form.Item label="发布时间" style={{ marginBottom: 0 }}>
                    <RangePicker 
                      style={{ width: '100%' }} 
                      value={filters.dateRange} 
                      onChange={this.handleDateRangeChange} 
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: 0 }}>
                <Col xs={24} sm={24} md={16} lg={12} xl={6}>
                  <Form.Item label="导入时间" style={{ marginBottom: 0 }}>
                    <RangePicker 
                      style={{ width: '100%' }} 
                      value={filters.importDateRange} 
                      onChange={this.handleImportDateRangeChange} 
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={16} lg={12} xl={8}>
                  <Form.Item label="关键词搜索" style={{ marginBottom: 0 }}>
                    <Search
                      placeholder="搜索标题、作者等"
                      allowClear
                      style={{ width: '100%' }}
                      value={filters.keyword}
                      onChange={(e) => this.handleKeywordSearch(e.target.value)}
                      onSearch={(value) => this.handleKeywordSearch(value)}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={8} lg={12} xl={10} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                  {!isSmallScreen() && (
                    <Button 
                      type="danger" 
                      style={{ marginRight: 8 }}
                      onClick={this.handleBatchDelete}
                      disabled={tableData.length === 0}
                    >
                      批量删除
                    </Button>
                  )}
                  <Button style={{ marginRight: 8 }} onClick={this.handleResetFilters}>重置</Button>
                  <Button type="primary" onClick={this.handleQuery}>查询</Button>
                </Col>
              </Row>
            </Form>
          )}

        </Card>

        <Card>
          <Spin spinning={loading}>
            {tableData.length > 0 ? (
              <div style={{ 
                overflowX: 'auto', 
                WebkitOverflowScrolling: 'touch',
                maxWidth: '100%'
              }}>
                <Table
                  bordered
                  columns={tableColumns}
                  dataSource={tableData}
                  scroll={{ 
                    x: 5000, 
                    y: false
                  }}
                  pagination={{
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50', '100'],
                    defaultPageSize: 10,
                    showTotal: (total) => `共 ${total} 条数据`
                  }}
                  rowKey={(record, index) => index}
                  size="small"
                  style={{ 
                    width: '100%'
                  }}
                />
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px 0',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <div style={{ fontSize: '36px', color: '#f0f0f0', marginBottom: '12px' }}>📊</div>
                <div style={{ fontSize: '14px', color: '#999', marginBottom: '6px' }}>暂无查询数据</div>
                <div style={{ fontSize: '12px', color: '#ccc' }}>请尝试调整筛选条件或导入数据后再查看</div>
              </div>
            )}
          </Spin>
        </Card>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  queryFilters: state.app.queryFilters,
  dictionaries: state.dictionary.data
});

export default connect(mapStateToProps, { setQueryFilters, clearQueryFilters })(ComprehensiveQuery);
