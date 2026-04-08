import React, { Component } from "react";
import { Button, message, Modal, Card, Alert } from "antd";
import { clearExcelData as clearExcelDataApi } from "@/api/excel";

class SystemTest extends Component {
  state = {
    loading: false
  };

  // 清空数据库数据 - 调用后端接口清除所有数据
  handleClearDatabase = async () => {
    Modal.confirm({
      title: '危险操作确认',
      content: (
        <div>
          <p style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
            警告：此操作将清空数据库中的所有数据！
          </p>
          <p>此操作不可恢复，请确保您已备份重要数据。</p>
          <p>确定要继续吗？</p>
        </div>
      ),
      okText: '确认清空',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        this.setState({ loading: true });
        
        try {
          // 调用后端接口清空数据库
          await clearExcelDataApi();
          message.success('数据库数据已清空');
        } catch (error) {
          message.error('清空数据库失败，请检查后端服务是否正常');
        } finally {
          this.setState({ loading: false });
        }
      },
      onCancel: () => {
      }
    });
  };

  render() {
    const { loading } = this.state;

    return (
      <div className="app-container">
        <h2>系统测试</h2>
        
        <Card title="数据管理" style={{ marginTop: 24 }}>
          <Alert
            message="危险操作区域"
            description="以下操作会影响数据库中的数据，请谨慎使用。"
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          <Button 
            type="danger" 
            loading={loading}
            onClick={this.handleClearDatabase}
          >
            清空数据库数据
          </Button>
        </Card>
      </div>
    );
  }
}

export default SystemTest;
