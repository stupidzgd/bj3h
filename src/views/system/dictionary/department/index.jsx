import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Popconfirm, Icon } from 'antd';
import axios from '@/utils/request';
import { connect } from 'react-redux';

const { Option } = Select;

const DepartmentManagement = ({ form, dictionaries }) => {
  const [data, setData] = useState([]);
  const [departmentCategories, setDepartmentCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // 获取科室分类列表
  const fetchDepartmentCategories = async () => {
    try {
      const response = await axios.get('/api/department-categories');
      if (response.data.status === 0) {
        setDepartmentCategories(response.data.data);
      } else {
        message.error(response.data.message || '获取科室分类列表失败');
      }
    } catch (error) {
      message.error('获取科室分类列表失败');
      console.error('获取科室分类列表错误:', error);
    }
  };

  // 获取科室列表
  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/departments');
      if (response.data.status === 0) {
        setData(response.data.data);
      } else {
        message.error(response.data.message || '获取科室列表失败');
      }
    } catch (error) {
      message.error('获取科室列表失败');
      console.error('获取科室列表错误:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始化数据
  useEffect(() => {
    // 优先使用全局字典数据
    if (dictionaries) {
      if (dictionaries.departments) {
        setData(dictionaries.departments);
      } else {
        fetchDepartments();
      }
      if (dictionaries.departmentCategories) {
        setDepartmentCategories(dictionaries.departmentCategories);
      } else {
        fetchDepartmentCategories();
      }
    } else {
      // 全局数据不存在时，从API获取
      fetchDepartmentCategories();
      fetchDepartments();
    }
  }, [dictionaries]);

  // 打开添加模态框
  const handleAdd = () => {
    form.resetFields();
    // 设置默认值
    form.setFieldsValue({
      status: 1 // 默认启用
    });
    setEditingRecord(null);
    setModalVisible(true);
  };

  // 打开编辑模态框
  const handleEdit = (record) => {
    form.setFieldsValue({
      code: record.code,
      name: record.name,
      departmentCategoryId: record.departmentCategoryId,
      description: record.description,
      status: record.status
    });
    setEditingRecord(record);
    setModalVisible(true);
  };

  // 删除科室
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/api/departments/${id}`);
      if (response.data.status === 0) {
        message.success('删除科室成功');
        fetchDepartments();
      } else {
        message.error(response.data.message || '删除科室失败');
      }
    } catch (error) {
      message.error('删除科室失败');
      console.error('删除科室错误:', error);
    }
  };

  // 批量删除科室
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的科室');
      return;
    }

    try {
      // 逐个删除科室
      for (const id of selectedRowKeys) {
        await axios.delete(`/api/departments/${id}`);
      }
      message.success('批量删除科室成功');
      setSelectedRowKeys([]);
      fetchDepartments();
    } catch (error) {
      message.error('批量删除科室失败');
      console.error('批量删除科室错误:', error);
    }
  };

  // 提交表单
  const handleSubmit = () => {
    form.validateFields((err, values) => {
      if (err) {
        return;
      }

      setModalLoading(true);

      if (editingRecord) {
        // 更新科室
        axios.put(`/api/departments/${editingRecord.id}`, values)
          .then(res => {
            if (res.data.status === 0) {
              message.success('更新科室成功');
              setModalVisible(false);
              fetchDepartments();
            } else {
              message.error(res.data.message || '更新科室失败');
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
        // 创建科室
        axios.post('/api/departments', values)
          .then(res => {
            if (res.data.status === 0) {
              message.success('创建科室成功');
              setModalVisible(false);
              fetchDepartments();
            } else {
              message.error(res.data.message || '创建科室失败');
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
      title: '科室代码',
      dataIndex: 'code',
      key: 'code'
    },
    {
      title: '科室名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '所属分类',
      dataIndex: 'departmentCategory',
      key: 'departmentCategory',
      render: (departmentCategory) => departmentCategory?.name || ''
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
            title="确定要删除这个科室吗？"
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
        <h2>科室管理</h2>
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
            添加科室
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
        title={editingRecord ? '编辑科室' : '添加科室'}
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
            label="科室代码"
            rules={[{ required: true, message: '请输入科室代码' }]}
          >
            <Input placeholder="请输入科室代码" />
          </Form.Item>
          <Form.Item
            key="name"
            label="科室名称"
            rules={[{ required: true, message: '请输入科室名称' }]}
          >
            <Input placeholder="请输入科室名称" />
          </Form.Item>
          <Form.Item
            key="departmentCategoryId"
            label="所属分类"
            rules={[{ required: true, message: '请选择所属分类' }]}
          >
            <Select placeholder="请选择所属分类">
              {departmentCategories.map(category => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            key="description"
            label="科室描述"
          >
            <Input.TextArea placeholder="请输入科室描述" rows={3} />
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

export default connect(mapStateToProps)(Form.create()(DepartmentManagement));