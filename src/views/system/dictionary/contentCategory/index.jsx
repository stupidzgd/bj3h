import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Popconfirm, Icon } from 'antd';
import axios from '@/utils/request';
import { connect } from 'react-redux';
import { fetchDictionaries } from '@/store/actions/dictionary';

const { Option } = Select;

const ContentCategoryManagement = ({ form, dictionaries, fetchDictionaries }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // 获取内容分类列表
  const fetchContentCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/content-categories');
      // 检查API响应是否成功，根据实际API返回格式调整
      if (response.data) {
        let contentCategories = [];
        // 如果响应是对象且有data字段，使用data字段
        if (typeof response.data === 'object' && response.data.data) {
          contentCategories = response.data.data;
        } 
        // 如果响应直接是数组，直接使用
        else if (Array.isArray(response.data)) {
          contentCategories = response.data;
        } 
        // 其他情况，尝试使用整个响应
        else {
          contentCategories = response.data;
        }
        // 按照ID从小到大排序，确保新增的字典项默认排在最后
        const sortedContentCategories = contentCategories.sort((a, b) => (a.id || 0) - (b.id || 0));
        setData(sortedContentCategories);
      } else {
        message.error('获取内容分类列表失败');
      }
    } catch (error) {
      message.error('获取内容分类列表失败');
      console.error('获取内容分类列表错误:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始化数据
  useEffect(() => {
    // 直接从API获取数据，确保能获取到所有内容分类，包括被禁用的
    fetchContentCategories();
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

  // 删除内容分类
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/api/content-categories/${id}`);
      const resData = response.data !== undefined ? response.data : response;
      // 检查API响应是否成功，根据实际API返回格式调整
      if (resData && (resData.status === 0 || resData.status === 1 || resData.success || (resData.message && resData.message.includes('成功')))) {
        message.success(resData.message || '删除内容分类成功');
        fetchContentCategories();
        // 更新Redux store中的字典数据
        fetchDictionaries();
      } else {
        // 尝试从响应中获取错误信息
        const errorMessage = (resData && resData.message) || (resData && resData.msg) || '删除内容分类失败';
        message.error(errorMessage);
        console.error('删除内容分类失败:', resData);
      }
    } catch (error) {
      // 尝试从错误对象中获取错误信息
      let errorMessage = '删除内容分类失败';
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || error.response.data.msg || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      message.error(errorMessage);
      console.error('删除内容分类错误:', error);
    }
  };

  // 批量删除内容分类
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的内容分类');
      return;
    }

    try {
      // 逐个删除内容分类
      for (const id of selectedRowKeys) {
        await axios.delete(`/api/content-categories/${id}`);
      }
      message.success('批量删除内容分类成功');
      setSelectedRowKeys([]);
      fetchContentCategories();
      // 更新Redux store中的字典数据
      fetchDictionaries();
    } catch (error) {
      // 尝试从错误对象中获取错误信息
      let errorMessage = '批量删除内容分类失败';
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || error.response.data.msg || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      message.error(errorMessage);
      console.error('批量删除内容分类错误:', error);
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
        // 更新分类
        axios.put(`/api/content-categories/${editingRecord.id}`, values)
          .then(res => {
            // 检查API响应是否成功，根据实际API返回格式调整
            if (res.data && (res.data.status === 0 || res.data.status === 1 || res.data.success)) {
              message.success('更新分类成功');
              setModalVisible(false);
              fetchContentCategories();
              // 更新Redux store中的字典数据
              fetchDictionaries();
            } else {
              // 尝试从响应中获取错误信息
              const errorMessage = res.data.message || res.data.msg || '更新分类失败';
              message.error(errorMessage);
              console.error('更新分类失败:', res.data);
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
        // 创建分类
        axios.post('/api/content-categories', values)
          .then(res => {
            // 检查API响应是否成功，根据实际API返回格式调整
            if (res.data && (res.data.status === 0 || res.data.status === 1 || res.data.success)) {
              message.success('创建分类成功');
              setModalVisible(false);
              fetchContentCategories();
              // 更新Redux store中的字典数据
              fetchDictionaries();
            } else {
              // 尝试从响应中获取错误信息
              const errorMessage = res.data.message || res.data.msg || '创建分类失败';
              message.error(errorMessage);
              console.error('创建分类失败:', res.data);
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
      title: '分类代码',
      dataIndex: 'code',
      key: 'code',
      width: 120
    },
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
      width: 180
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
            title="确定要删除这个内容分类吗？"
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
          .table-row-content-category .ant-table-thead > tr > th,
          .table-row-content-category .ant-table-tbody > tr > td {
            padding: 8px 12px;
          }
        }
      `}</style>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>内容分类管理</h2>
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
            添加内容分类
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
          className="table-row-content-category"
        />
      </div>

      <Modal
        title={editingRecord ? '编辑内容分类' : '添加内容分类'}
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
            label="分类代码"
          >
            {form.getFieldDecorator('code', {
              rules: [
                { required: true, message: '请输入分类代码' },
                {
                  validator: (rule, value, callback) => {
                    if (value) {
                      const isDuplicate = data.some(item => 
                        item.code === value && 
                        (!editingRecord || item.id !== editingRecord.id)
                      );
                      if (isDuplicate) {
                        callback('分类代码已存在');
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
              <Input placeholder="请输入分类代码" />
            )}
          </Form.Item>
          <Form.Item
            key="name"
            label="分类名称"
          >
            {form.getFieldDecorator('name', {
              rules: [
                { required: true, message: '请输入分类名称' },
                {
                  validator: (rule, value, callback) => {
                    if (value) {
                      const isDuplicate = data.some(item => 
                        item.name === value && 
                        (!editingRecord || item.id !== editingRecord.id)
                      );
                      if (isDuplicate) {
                        callback('分类名称已存在');
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
              <Input placeholder="请输入分类名称" />
            )}
          </Form.Item>
          <Form.Item
            key="description"
            label="分类描述"
          >
            {form.getFieldDecorator('description')(
              <Input.TextArea rows={4} placeholder="请输入分类描述" />
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

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(ContentCategoryManagement));