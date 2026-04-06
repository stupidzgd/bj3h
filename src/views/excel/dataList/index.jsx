import React, { Component } from "react";
import { Table, Spin, Button, message, Tooltip } from "antd";

class DataList extends Component {
  state = {
    tableData: [],
    tableColumns: [],
    loading: false
  };

  componentDidMount() {
    // 从localStorage获取导入的数据
    const storedData = localStorage.getItem('importedExcelData');
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        if (data.length > 0) {
          const header = Object.keys(data[0]);
          const tableColumns = this.generateColumns(header);
          this.setState({
            tableData: data,
            tableColumns
          });
        }
      } catch (error) {
        console.error('解析存储的数据失败:', error);
      }
    }
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
        if (index < 3) {
          column.fixed = true;
        }
        
        // 特殊列处理
        if (item === '链接') {
          column.width = 80;
          column.render = (text, row) => {
            if (text && (text.indexOf('http') !== -1 || text.indexOf('export/') !== -1)) {
              return (
                <a href={text.indexOf('http') !== -1 ? text : '#'} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   style={{ color: '#1890ff', textDecoration: 'underline' }}>
                  {text.indexOf('http') !== -1 ? '文章链接' : '视频ID'}
                </a>
              )  
            }
            return text;
          };
        } else if (item === '标题') {
          column.width = 550;
          column.ellipsis = true;
          column.fixed = true;
          column.render = (text, row) => (
            <Tooltip placement="top" title={text}>
              <div style={{ 
                whiteSpace: 'nowrap', 
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                cursor: 'pointer',
                height: '32px',
                lineHeight: '32px'
              }}>
                {text}
              </div>
            </Tooltip>
          );
        } else if (item === '发布时间') {
          column.width = 110;
        } else if (item === '阅读量' || item === '分享量' || item === '点赞量' || item === '收藏量') {
          column.width = 80;
        } else if (item === '完播率' || item === '京内占比' || item === '京外占比') {
          column.width = 90;
        } else if (this.isProvinceField(item)) {
          column.width = 80;
        } else if (item === '平台') {
          column.width = 100;
          column.fixed = true;
        } else if (item === '文章ID') {
          column.width = 120;
          column.fixed = true;
        } else if (item === '是否首发') {
          column.width = 80;
          column.render = (text, row) => {
            if (text === true || text === '是' || text === '1' || text === 1) {
              return '是';
            } else if (text === false || text === '否' || text === '0' || text === 0) {
              return '否';
            } else {
              return '-';
            }
          };
        } else if (item === '内容分类' || item === '体裁分类' || item === '科室名称' || item === '科室分类') {
          column.width = 100;
        } else if (item === '累积粉丝量') {
          column.width = 100;
        }
        
        tableColumns.push(column);
      });
    }
    return tableColumns;
  }

  // 判断是否为省份字段
  isProvinceField(key) {
    const provinceKeywords = ['省', '市', '自治区', '特别行政区', '河北', '山西', '辽宁', '吉林', '黑龙江', '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南', '湖北', '湖南', '广东', '海南', '四川', '贵州', '云南', '陕西', '甘肃', '青海', '台湾', '内蒙古', '广西', '西藏', '宁夏', '新疆', '北京', '天津', '上海', '重庆', '香港', '澳门'];
    return provinceKeywords.some(keyword => key.includes(keyword));
  }

  // 清空数据
  handleClearData = () => {
    localStorage.removeItem('importedExcelData');
    this.setState({
      tableData: [],
      tableColumns: []
    });
    message.success('数据已清空');
  };

  render() {
    const { tableData, tableColumns, loading } = this.state;
    
    return (
      <div className="app-container">
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>导入数据列表</h2>
          {tableData.length > 0 && (
            <Button type="primary" danger onClick={this.handleClearData}>
              清空数据
            </Button>
          )}
        </div>
        
        <Spin spinning={loading} tip="正在加载数据...">
          <Table
            bordered
            columns={tableColumns}
            dataSource={tableData}
            scroll={{ x: 3000, y: 'calc(100vh - 300px)' }}
            pagination={{ 
              pageSize: 10, 
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              showTotal: (total) => `共 ${total} 条数据`
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
        </Spin>
      </div>
    );
  }
}

export default DataList;