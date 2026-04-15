import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Popconfirm, Icon, Radio } from 'antd';
import axios from '@/utils/request';
import { connect } from 'react-redux';

const { Option } = Select;

const PlatformManagement = ({ form, dictionaries }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // 获取平台列表
  const fetchPlatforms = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/platforms');
      if (response.data.status === 0) {
        setData(response.data.data);
      } else {
        message.error(response.data.message || '获取平台列表失败');
      }
    } catch (error) {
      message.error('获取平台列表失败');
      console.error('获取平台列表错误:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始化数据
  useEffect(() => {
    // 优先使用全局字典数据
    if (dictionaries && dictionaries.platforms) {
      setData(dictionaries.platforms);
    } else {
      // 全局数据不存在时，从API获取
      fetchPlatforms();
    }
  }, [dictionaries]);

  // 打开添加模态框
  const handleAdd = () => {
    form.resetFields();
    // 设置默认值
    form.setFieldsValue({
      status: 1, // 默认启用
      type: 1 // 默认自媒体
    });
    setEditingRecord(null);
    setModalVisible(true);
  };

  // 打开编辑模态框
  const handleEdit = (record) => {
    form.setFieldsValue({
      code: record.code,
      name: record.name,
      type: record.type,
      description: record.description,
      status: record.status
    });
    setEditingRecord(record);
    setModalVisible(true);
  };

  // 删除平台
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/api/platforms/${id}`);
      if (response.data.status === 0) {
        message.success('删除平台成功');
        fetchPlatforms();
      } else {
        message.error(response.data.message || '删除平台失败');
      }
    } catch (error) {
      message.error('删除平台失败');
      console.error('删除平台错误:', error);
    }
  };

  // 批量删除平台
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的平台');
      return;
    }

    try {
      // 逐个删除平台
      for (const id of selectedRowKeys) {
        await axios.delete(`/api/platforms/${id}`);
      }
      message.success('批量删除平台成功');
      setSelectedRowKeys([]);
      fetchPlatforms();
    } catch (error) {
      message.error('批量删除平台失败');
      console.error('批量删除平台错误:', error);
    }
  };

  // 提交表单
  const handleSubmit = () => {
    form.validateFields((err, values) => {
      if (err) {
        return;
      }

      setModalLoading(true);

      let response;
      if (editingRecord) {
        // 更新平台
        axios.put(`/api/platforms/${editingRecord.id}`, values)
          .then(res => {
            if (res.data.status === 0) {
              message.success('更新平台成功');
              setModalVisible(false);
              fetchPlatforms();
            } else {
              message.error(res.data.message || '更新平台失败');
            }
          })
          .catch(error => {
            message.error('操作失败');
            console.error('操作错误:', error);
          })
          .finally(() => {
            setModalLoading(false);
          });
      } else {
        // 创建平台
        axios.post('/api/platforms', values)
          .then(res => {
            if (res.data.status === 0) {
              message.success('创建平台成功');
              setModalVisible(false);
              fetchPlatforms();
            } else {
              message.error(res.data.message || '创建平台失败');
            }
          })
          .catch(error => {
            message.error('操作失败');
            console.error('操作错误:', error);
          })
          .finally(() => {
            setModalLoading(false);
          });
      }
    });
  };

  // 表格列配置
  const columns = [
    {
      title: '序号',
      key: 'index',
      render: (_, __, index) => index + 1
    },
    {
      title: '平台代码',
      dataIndex: 'code',
      key: 'code'
    },
    {
      title: '平台名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '平台类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => type === 1 ? '自媒体' : '媒体'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => status === 1 ? '启用' : '禁用'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <>
          <Button 
            type="primary" 
            icon={<Icon type="edit" />} 
            size="small" 
            style={{ marginRight: 8 }} 
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个平台吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button danger size="small">
              删除
            </Button>
          </Popconfirm>
        </>
      )
    }
  ];

  // 表格选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys)
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>平台管理</h2>
        <div>
          {selectedRowKeys.length > 0 && (
            <Button 
              danger 
              style={{ marginRight: 8 }}
              onClick={handleBatchDelete}
            >
              批量删除
            </Button>
          )}
          <Button type="primary" icon={<Icon type="plus" />} onClick={handleAdd}>
            添加平台
          </Button>
        </div>
      </div>

      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingRecord ? '编辑平台' : '添加平台'}
        visible={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        confirmLoading={modalLoading}
        width={600}
      >
        <Form
          layout="vertical"
        >
          <Form.Item
            key="code"
            label="平台代码"
            rules={[{ required: true, message: '请输入平台代码' }]}
          >
            <Input placeholder="请输入平台代码" />
          </Form.Item>
          <Form.Item
            key="name"
            label="平台名称"
            rules={[{ required: true, message: '请输入平台名称' }]}
          >
            <Input placeholder="请输入平台名称" />
          </Form.Item>
          <Form.Item
            key="type"
            label="平台类型"
            rules={[{ required: true, message: '请选择平台类型' }]}
          >
            <Radio.Group>
              <Radio value={1}>自媒体</Radio>
              <Radio value={0}>媒体</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            key="description"
            label="平台描述"
          >
            <Input.TextArea rows={4} placeholder="请输入平台描述" />
          </Form.Item>
          <Form.Item
            key="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Option value={1}>启用</Option>
              <Option value={0}>禁用</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    dictionaries: state.dictionary.data
  };
};

export default connect(mapStateToProps)(Form.create()(PlatformManagement));