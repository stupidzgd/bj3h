import React, { Component } from "react";
import { Table, Tag } from "antd";

class TransactionTable extends Component {
  static defaultProps = {
    dataSource: [],
    columns: [],
    pagination: false
  };
  
  render() {
    const { dataSource, columns, pagination } = this.props;
    return (
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={pagination}
      />
    );
  }
}

export default TransactionTable;
