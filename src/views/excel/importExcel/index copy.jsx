import React, { Component } from "react";
import { Table, Tooltip, Button } from "antd";
import UploadExcelComponent from "@/components/UploadExcel";
class ImportExcel extends Component {
  state = {
    tableData: [],
    tableHeader: [],
    tableColumns: [],
  };
  componentDidMount() {
    // this.updateTableHeight();
  };
  handleSuccess = ({ results, header }) => {
    const tableColumns = [];
    if (header && header.length) {
      header.forEach((item, index) => {
        tableColumns[index] = {
            title: item,
            dataIndex: item,
            key: item,
            width: 130,
            align: "center",    
        }
        if (index < 3) {
          tableColumns[index].fixed = true;
        }
        if (item === '链接') {
          tableColumns[index].render = (text, row) => {
            if (text && text.indexOf('http') !== -1) {
              return (
                <Tooltip placement="top" title={text}>
                  <Button type="link" onClick={() => {
                    window.open(text)
                  }}>文章链接url</Button>
                </Tooltip>
              )  
            }
            return text;
          }
        } else if (item === '标题') {
           tableColumns[index].width = 250;
        }
      })
    }
    results.forEach(item => {
      if (typeof item['发布时间'] === 'number') {
        item['发布时间'] = this.formatDate(item['发布时间']);
      }
    })
    this.setState({
      tableData: results,
      tableHeader: header,
      tableColumns,
    });
    // this.updateTableHeight();
  };
  formatDate (numb, format) {
    const time = new Date((numb - 1) * 24 * 3600000 + 1)
    time.setYear(time.getFullYear() - 70)
    const year = time.getFullYear() + ''
    const month = time.getMonth() + 1 + ''
    const date = time.getDate() + ''
    if(format && format.length === 1) {
      return year + format + month + format + date
    }
    // return year+(month < 10 ? '0' + month : month)+(date < 10 ? '0' + date : date)
    return `${year}/${month}/${date}`
  }
  render() {
    return (
      <div className="app-container">
        <UploadExcelComponent uploadSuccess={this.handleSuccess} />
        <br />
        <Table
          bordered
          // columns={this.state.tableHeader.map((item) => ({
          //   title: item,
          //   dataIndex: item,
          //   key: item,
          //   width: 195,
          //   align: "center",
          // }))}
          columns={this.state.tableColumns}
          dataSource={this.state.tableData}
          scroll={{ x: 1500 }}
          pagination={{pageSize:8}}
        />
      </div>
    );
  }
}

export default ImportExcel;
