import React, { Component } from "react";
import { Table, Tooltip, Button, message, Spin, Modal } from "antd";
import { connect } from "react-redux";
import moment from "moment";
import { setExcelData, clearExcelData } from "@/store/actions/app";
import { importExcel as importExcelApi, clearExcelData as clearExcelDataApi } from "@/api/excel";
import UploadExcelComponent from "@/components/UploadExcel";
import { PLATFORM_MAP, CONTENT_CATEGORY_REVERSE_MAP } from "@/config/dictionaries";
class ImportExcel extends Component {
  state = {
    tableData: [],
    tableHeader: [],
    tableColumns: [],
    loading: false,
    importCount: 0,
    backendData: []
  };
  componentDidMount() {
    // 页面加载时不恢复数据，保持空状态
    // 数据只在当前页面会话中有效，切换页面后自动清空
  }

  componentWillUnmount() {
    // 组件卸载时清空数据
    this.setState({
      tableData: [],
      tableHeader: [],
      tableColumns: [],
      importCount: 0,
      backendData: []
    });
    
    // 清空 Redux 中的数据
    this.props.clearExcelData();
  }
  handleSuccess = ({ results, header }) => {
    this.setState({ loading: true });
    
    // 处理数据
    const processedResults = this.processData(results);
    
    // 生成表格列
    const tableColumns = this.generateColumns(header);
    
    // 存储数据到Redux
    this.props.setExcelData(processedResults);
    
    // 平台字典映射（使用统一配置）
    const platformMap = PLATFORM_MAP;

    // 内容分类字典映射（使用统一配置）
    const contentCategoryMap = CONTENT_CATEGORY_REVERSE_MAP;
    
    // 转换数据格式，适配后端数据库
    const backendData = processedResults.map(item => {
      // 提取省份数据
      const provinceData = {};
      const provinceKeys = Object.keys(item).filter(key => {
        // 识别省份字段（简单判断：两个字或三个字，包含省、市、自治区等关键词）
        return (key.length === 2 || key.length === 3) && 
               (key.includes('省') || key.includes('市') || key.includes('自治区') || 
                key.includes('特别行政区') || ['北京', '天津', '上海', '重庆'].includes(key));
      });
      
      // 保存省份数据
      for (const provinceKey of provinceKeys) {
        if (item[provinceKey]) {
          provinceData[provinceKey] = item[provinceKey];
        }
      }
      
      // 构建主数据
      const mainData = {
        platform: item['平台'] || '',
        article_id: item['文章ID'] || '',
        title: item['标题'] || '',
        is_first_release: item['是否首发'] || null,
        publish_time: item['发布时间'] || new Date(),
        reading_count: item['阅读量'] ? parseInt(item['阅读量']) : null,
        share_count: item['分享量'] ? parseInt(item['分享量']) : null,
        link: item['链接'] || null,
        complete_rate: item['完播率'] || null,
        avg_play_time: item['平均播放时长'] || null,
        like_count: item['点赞量'] ? parseInt(item['点赞量']) : null,
        collect_count: item['收藏量'] ? parseInt(item['收藏量']) : null,
        content_category: contentCategoryMap[item['内容分类']] || item['内容分类'] || null,
        genre_category: item['体裁分类'] || null,
        department_name: item['科室名称'] || null,
        department_category: item['科室分类'] || null,
        author: item['作者'] || null,
        source: item['来源'] || null,
        special_planning: item['专项策划'] || null,
        video_duration: item['视频时长'] || null,
        hot_search_platform: item['热搜平台'] || null,
        hot_search_position: item['热搜榜最高位置'] ? parseInt(item['热搜榜最高位置']) : null,
        hot_search_duration: item['在榜时长'] || null,
        hot_search_reading_count: item['热搜阅读量'] ? parseInt(item['热搜阅读量']) : null,
        reporter: item['记者'] || null,
        media_column: item['具体栏目'] || null,
        user_region_distribution: item['用户地域分布'] || null,
        beijing_ratio: item['京内占比'] || null,
        non_beijing_ratio: item['京外占比'] || null
      };
      
      // 合并省份数据到主数据
      return { ...mainData, ...provinceData };
    });
    
    this.setState({
      tableData: processedResults,
      tableHeader: header,
      tableColumns,
      importCount: processedResults.length,
      backendData: backendData,
      loading: false
    });
    
    message.success(`成功解析 ${processedResults.length} 条数据，请确认后点击导入按钮`);
  };
  
  // 处理数据格式
  processData(results) {
    // 记录导入时间
    const importTime = new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0];
    
    return results.map(item => {
      // 添加导入时间字段
      item['导入时间'] = importTime;
      
      // 处理日期格式
      if (item['发布时间']) {
        if (typeof item['发布时间'] === 'number') {
          // 处理Excel的数字日期格式（从1900年1月1日开始计数的天数）
          // 使用moment.js转换Excel日期数字
          // Excel的日期从1900年1月1日开始，moment.js的日期从1970年1月1日开始
          // 需要调整日期偏移
          const excelDate = item['发布时间'];
          // 对于Excel的日期数字，我们需要处理1900年闰年问题
          // 使用utcOffset(8)确保使用东八区时间
          const date = moment('1899-12-30').add(excelDate, 'days').utcOffset(8);
          if (date.isValid()) {
            item['发布时间'] = date.format('YYYY-MM-DD HH:mm:ss');
          }
        } else if (typeof item['发布时间'] === 'string') {
          // 使用moment.js处理日期时间，避免时区问题
          const dateStr = item['发布时间'];
          
          // 尝试解析日期，支持多种格式
          let date = null;
          
          // 尝试 YYYY/MM/DD 格式
          date = moment(dateStr, 'YYYY/MM/DD', true);
          if (!date.isValid()) {
            // 尝试 YYYY-MM-DD 格式
            date = moment(dateStr, 'YYYY-MM-DD', true);
          }
          if (!date.isValid()) {
            // 尝试 DD/MM/YYYY 格式
            date = moment(dateStr, 'DD/MM/YYYY', true);
          }
          if (!date.isValid()) {
            // 尝试默认解析
            date = moment(dateStr);
          }
          
          if (date.isValid()) {
            // 格式化为标准日期时间字符串，确保时区正确
            // 使用utcOffset(8)确保使用东八区时间
            item['发布时间'] = date.utcOffset(8).format('YYYY-MM-DD HH:mm:ss');
          }
        }
      }
      
      // 智能处理百分比字段
      Object.keys(item).forEach(key => {
        const value = item[key];
        if (value === null || value === undefined) return;
        
        // 排除视频时长相关字段，避免被错误处理为百分比
        if (key.includes('视频时长') || key.includes('视频长度') || key.includes('时长')) {
          return;
        }
        
        // 1. 明确的百分比字段（包含特定关键词）
        const isPercentageField = (key.includes('占比') || key.includes('率') || 
                               key.includes('百分比') || key.includes('比例')) && 
                               !key.includes('分享量') && !key.includes('收藏量');
        
        // 2. 省份字段（通过字段名特征判断）
        const isProvinceField = this.isProvinceField(key);
        
        // 3. 数值判断（值在0-1之间的可能是百分比）
        const isPossiblePercentage = !key.includes('分享量') && !key.includes('收藏量') && this.isPossiblePercentage(value);
        
        // 如果是百分比字段或可能的百分比值，进行格式化
        if (isPercentageField || isProvinceField || isPossiblePercentage) {
          item[key] = this.formatPercentage(value);
        }
      });
      
      // 处理平均播放时长
      if (item['平均播放时长']) {
        item['平均播放时长'] = this.formatDuration(item['平均播放时长']);
      }
      
      // 处理视频时长
      if (item['视频时长']) {
        item['视频时长'] = this.formatVideoDuration(item['视频时长']);
      }
      
      return item;
    });
  }
  
  // 生成表格列
  generateColumns(header) {
    const tableColumns = [];
    if (header && header.length) {
      header.forEach((item, index) => {
        const column = {
          title: item,
          dataIndex: item,
          key: item,
          width: 100,
          align: "center",    
        };
        
        // 固定前3列
        // if (index < 3) {
        //   column.fixed = true;
        // }
                if (index < 3) {
          column.fixed = index === 0 ? 'left' : (index === 1 ? 'left' : 'left');
        }
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
                // width: '100%',
                maxWidth: '530px'
              }}>
                {text}
              </div>
            </Tooltip>
          );
        } else if (item === '发布时间') {
          column.width = 180;
        } else if (item === '阅读量' || item === '分享量' || item === '点赞量' || item === '收藏量') {
          column.width = 80;
        } else if (item === '完播率' || item === '京内占比' || item === '京外占比') {
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
        
        tableColumns.push(column);
      });
    }
    return tableColumns;
  }
  
  // 格式化日期
  formatDate(numb, format) {
    const time = new Date((numb - 1) * 24 * 3600000 + 1);
    time.setYear(time.getFullYear() - 70);
    const year = time.getFullYear() + '';
    const month = (time.getMonth() + 1 + '').padStart(2, '0');
    const date = (time.getDate() + '').padStart(2, '0');
    if (format && format.length === 1) {
      return year + format + month + format + date;
    }
    return `${year}-${month}-${date}`;
  }
  
  // 格式化百分比
  formatPercentage(value) {
    if (!value && value !== 0) {
      return value;
    }
    
    if (typeof value === 'string') {
      // 处理 22% 格式
      if (value.includes('%')) {
        return value;
      }
      // 处理 0.22 格式
      const num = parseFloat(value);
      if (!isNaN(num)) {
        // 检查是否已经是百分比值（如 22 而不是 0.22）
        if (num >= 1) {
          return num.toFixed(2) + '%';
        } else {
          return (num * 100).toFixed(2) + '%';
        }
      }
    } else if (typeof value === 'number') {
      // 处理数字格式
      if (!isNaN(value)) {
        // 检查是否已经是百分比值（如 22 而不是 0.22）
        if (value >= 1) {
          return value.toFixed(2) + '%';
        } else {
          return (value * 100).toFixed(2) + '%';
        }
      }
    }
    return value;
  }
  
  // 格式化播放时长
  formatDuration(value) {
    if (typeof value === 'string') {
      // 处理 270.16秒 格式
      if (value.includes('秒')) {
        return value;
      }
      // 处理纯数字
      const num = parseFloat(value);
      if (!isNaN(num)) {
        return num.toFixed(2) + '秒';
      }
    } else if (typeof value === 'number') {
      return value.toFixed(2) + '秒';
    }
    return value;
  }
  
  // 格式化视频时长
  formatVideoDuration(value) {
    if (typeof value === 'string') {
      // 处理 08：01 格式（中文冒号）
      return value.replace('：', ':');
    }
    return value;
  }
  
  // 判断是否为省份字段
  isProvinceField(key) {
    // 省份字段特征：
    // 1. 两个字或三个字
    // 2. 包含常见省份特征词
    const provinceKeywords = ['省', '市', '自治区', '特别行政区', '河北', '山西', '辽宁', '吉林', '黑龙江', '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南', '湖北', '湖南', '广东', '海南', '四川', '贵州', '云南', '陕西', '甘肃', '青海', '台湾', '内蒙古', '广西', '西藏', '宁夏', '新疆', '北京', '天津', '上海', '重庆', '香港', '澳门'];
    
    return provinceKeywords.some(keyword => key.includes(keyword));
  }
  
  // 判断是否可能是百分比值
  isPossiblePercentage(value) {
    if (typeof value === 'number') {
      // 数值在 0-1 之间，可能是百分比
      return value >= 0 && value <= 1;
    } else if (typeof value === 'string') {
      // 字符串可以转换为 0-1 之间的数字
      const num = parseFloat(value);
      return !isNaN(num) && num >= 0 && num <= 1;
    }
    return false;
  }
  
  // 导入数据到数据库
  handleImportData = () => {
    const { backendData } = this.state;
    
    if (backendData.length === 0) {
      message.warning('没有数据可导入');
      return;
    }
    
    // 弹出确认对话框
    Modal.confirm({
      title: '确认导入',
      content: `确定要将 ${backendData.length} 条数据导入到数据库吗？`,
      onOk: async () => {
        this.setState({ loading: true });
        
        try {
          // 发送数据到后端
          const response = await importExcelApi({ data: backendData });
          message.success(`成功导入 ${response.data.total} 条数据到数据库，其中新创建 ${response.data.created} 条，更新 ${response.data.updated} 条`);
          
          // 导入完成后清空表格数据
          this.setState({
            tableData: [],
            tableHeader: [],
            tableColumns: [],
            importCount: 0,
            backendData: []
          });
          
          // 清空Redux中的数据
          this.props.clearExcelData();
        } catch (error) {
          message.error('导入数据库失败，请检查后端服务是否正常');
        } finally {
          this.setState({ loading: false });
        }
      },
      onCancel: () => {
      }
    });
  };

  // 重置导入 - 只清空前端数据列表，不清除数据库
  handleResetImport = () => {
    // 弹出确认对话框
    Modal.confirm({
      title: '确认重置',
      content: '确定要重置导入吗？这将清空当前的数据列表，但不会删除已导入数据库的数据。',
      onOk: () => {
        // 清空Redux中的数据
        this.props.clearExcelData();
        
        this.setState({
          tableData: [],
          tableHeader: [],
          tableColumns: [],
          importCount: 0,
          backendData: []
        });
        message.success('已重置导入');
      },
      onCancel: () => {
      }
    });
  };

  // 处理分页变化已移至 onChange 回调中直接处理

  render() {
    const { tableData, tableColumns, loading, importCount } = this.state;
    
    return (
      <div className="app-container">
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Excel 数据导入</h2>
          {importCount > 0 && (
            <div>
              <Button type="primary" style={{ marginRight: 8 }} onClick={this.handleImportData}>
                导入数据
              </Button>
              <Button type="danger" onClick={this.handleResetImport}>
                重置导入
              </Button>
            </div>
          )}
        </div>
        <div style={{ marginBottom: 16, color: '#666' }}>
          请上传 Excel 或 CSV 文件，系统将自动处理数据并在下方展示。确认数据无误后，点击导入按钮将数据写入数据库。
        </div>
        <Spin spinning={loading} tip="正在处理数据...">
          <UploadExcelComponent uploadSuccess={this.handleSuccess} />
        </Spin>
        
        {importCount > 0 && (
          <div style={{ marginTop: 24 }}>
            <Table
              bordered
              columns={tableColumns.map(col => ({
                ...col,
                width: col.width || 100,
                fixed: col.fixed || false
              }))}
              dataSource={tableData}
              scroll={{ x: 6000, y: 'calc(100vh - 400px)' }}
              pagination={{
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
                showTotal: (total) => `共 ${total} 条数据`,
                total: importCount
              }}
              rowKey={(record, index) => index}
              locale={{ emptyText: '暂无导入数据' }}
              size="small"
              onRow={(record, index) => ({
                style: {
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }
              })}
            />
          </div>
        )}
      </div>
    );
  }
}

export default connect(null, { setExcelData, clearExcelData })(ImportExcel);
