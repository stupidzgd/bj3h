import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Popconfirm, Icon } from 'antd';
import axios from '@/utils/request';
import { connect } from 'react-redux';
import { fetchDictionaries } from '@/store/actions/dictionary';

const { Option } = Select;

const DepartmentManagement = ({ form, dictionaries, fetchDictionaries }) => {
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
      // 检查API响应是否成功，根据实际API返回格式调整
      if (response.data) {
        // 如果响应是对象且有data字段，使用data字段
        if (typeof response.data === 'object' && response.data.data) {
          setDepartmentCategories(response.data.data);
        } 
        // 如果响应直接是数组，直接使用
        else if (Array.isArray(response.data)) {
          setDepartmentCategories(response.data);
        } 
        // 其他情况，尝试使用整个响应
        else {
          setDepartmentCategories(response.data);
        }
      } else {
        message.error('获取科室分类列表失败');
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
      // 检查API响应是否成功，根据实际API返回格式调整
      if (response.data) {
        let departments = [];
        // 如果响应是对象且有data字段，使用data字段
        if (typeof response.data === 'object' && response.data.data) {
          departments = response.data.data;
        } 
        // 如果响应直接是数组，直接使用
        else if (Array.isArray(response.data)) {
          departments = response.data;
        } 
        // 其他情况，尝试使用整个响应
        else {
          departments = response.data;
        }
        // 按照ID从小到大排序，确保新增的字典项默认排在最后
        const sortedDepartments = departments.sort((a, b) => (a.id || 0) - (b.id || 0));
        setData(sortedDepartments);
      } else {
        message.error('获取科室列表失败');
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
    // 直接从API获取数据，确保能获取到所有科室，包括被禁用的
    fetchDepartmentCategories();
    fetchDepartments();
  }, []);

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
      const resData = response.data !== undefined ? response.data : response;
      // 检查API响应是否成功，根据实际API返回格式调整
      if (resData && (resData.status === 0 || resData.status === 1 || resData.success || (resData.message && resData.message.includes('成功')))) {
        message.success(resData.message || '删除科室成功');
        fetchDepartments();
        // 更新Redux store中的字典数据
        fetchDictionaries();
      } else {
        // 尝试从响应中获取错误信息
        const errorMessage = (resData && resData.message) || (resData && resData.msg) || '删除科室失败';
        message.error(errorMessage);
        console.error('删除科室失败:', resData);
      }
    } catch (error) {
      // 尝试从错误对象中获取错误信息
      let errorMessage = '删除科室失败';
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || error.response.data.msg || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      message.error(errorMessage);
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
      // 更新Redux store中的字典数据
      fetchDictionaries();
    } catch (error) {
      // 尝试从错误对象中获取错误信息
      let errorMessage = '批量删除科室失败';
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || error.response.data.msg || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      message.error(errorMessage);
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
            // 检查API响应是否成功，根据实际API返回格式调整
            if (res.data && (res.data.status === 0 || res.data.status === 1 || res.data.success)) {
              message.success('更新科室成功');
              setModalVisible(false);
              fetchDepartments();
              // 更新Redux store中的字典数据
              fetchDictionaries();
            } else {
              // 尝试从响应中获取错误信息
              const errorMessage = res.data.message || res.data.msg || '更新科室失败';
              message.error(errorMessage);
              console.error('更新科室失败:', res.data);
            }
          })
          .catch(error => {
            // 尝试从错误对象中获取错误信息
            let errorMessage = '操作失败';
            if (error.response && error.response.data) {
              errorMessage = error.response.data.message || error.response.data.msg || errorMessage;
            } else if (error.message) {
              errorMessage = error.message;
            }
            message.error(errorMessage);
            console.error('操作错误:', error);
          })
          .finally(() => {
            setModalLoading(false);
          });
      } else {
        // 创建科室
        axios.post('/api/departments', values)
          .then(res => {
            // 检查API响应是否成功，根据实际API返回格式调整
            if (res.data && (res.data.status === 0 || res.data.status === 1 || res.data.success)) {
              message.success('创建科室成功');
              setModalVisible(false);
              fetchDepartments();
              // 更新Redux store中的字典数据
              fetchDictionaries();
            } else {
              // 尝试从响应中获取错误信息
              const errorMessage = res.data.message || res.data.msg || '创建科室失败';
              message.error(errorMessage);
              console.error('创建科室失败:', res.data);
            }
          })
          .catch(error => {
            // 尝试从错误对象中获取错误信息
            let errorMessage = '操作失败';
            if (error.response && error.response.data) {
              errorMessage = error.response.data.message || error.response.data.msg || errorMessage;
            } else if (error.message) {
              errorMessage = error.message;
            }
            message.error(errorMessage);
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
      width: 80,
      render: (_, __, index) => index + 1
    },
    {
      title: '科室代码',
      dataIndex: 'code',
      key: 'code',
      width: 120
    },
    {
      title: '科室名称',
      dataIndex: 'name',
      key: 'name',
      width: 180
    },
    {
      title: '所属分类',
      dataIndex: 'departmentCategory',
      key: 'departmentCategory',
      width: 150,
      render: (departmentCategory) => departmentCategory?.name || ''
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => status === 1 ? '启用' : '禁用'
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button 
            type="primary" 
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
        </div>
      )
    }
  ];

  // 表格选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys)
  };

  return (
    <div style={{ padding: '10px 16px' }}>
      <style>{`
        @media (min-width: 768px) {
          .table-row-department .ant-table-thead > tr > th,
          .table-row-department .ant-table-tbody > tr > td {
            padding: 8px 12px;
          }
        }
      `}</style>
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

      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          className="table-row-department"
        />
      </div>

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
          >
            {form.getFieldDecorator('code', {
              rules: [
                { required: true, message: '请输入科室代码' },
                {
                  validator: (rule, value, callback) => {
                    if (value) {
                      const isDuplicate = data.some(item => 
                        item.code === value && 
                        (!editingRecord || item.id !== editingRecord.id)
                      );
                      if (isDuplicate) {
                        callback('科室代码已存在');
                      } else {
                        callback();
                      }
                    } else {
                      callback();
                    }
                  }
                }
              ]
            })(
              <Input placeholder="请输入科室代码" />
            )}
          </Form.Item>
          <Form.Item
            key="name"
            label="科室名称"
          >
            {form.getFieldDecorator('name', {
              rules: [
                { required: true, message: '请输入科室名称' },
                {
                  validator: (rule, value, callback) => {
                    if (value) {
                      const isDuplicate = data.some(item => 
                        item.name === value && 
                        (!editingRecord || item.id !== editingRecord.id)
                      );
                      if (isDuplicate) {
                        callback('科室名称已存在');
                      } else {
                        callback();
                      }
                    } else {
                      callback();
                    }
                  }
                }
              ]
            })(
              <Input placeholder="请输入科室名称" />
            )}
          </Form.Item>
          {/* 暂时屏蔽所属分类选项 */}
          {/* <Form.Item
            key="departmentCategoryId"
            label="所属分类"
          >
            {form.getFieldDecorator('departmentCategoryId', {
              rules: [{ required: true, message: '请选择所属分类' }]
            })(
              <Select placeholder="请选择所属分类">
                {departmentCategories.map(category => (
                  <Option key={category.id} value={category.id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            )}
          </Form.Item> */}
          <Form.Item
            key="description"
            label="科室描述"
          >
            {form.getFieldDecorator('description')(
              <Input.TextArea placeholder="请输入科室描述" rows={3} />
            )}
          </Form.Item>
          <Form.Item
            key="status"
            label="状态"
          >
            {form.getFieldDecorator('status', {
              rules: [{ required: true, message: '请选择状态' }]
            })(
              <Select placeholder="请选择状态">
                <Option value={1}>启用</Option>
                <Option value={0}>禁用</Option>
              </Select>
            )}
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

const mapDispatchToProps = (dispatch) => {
  return {
    fetchDictionaries: () => dispatch(fetchDictionaries())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(DepartmentManagement));