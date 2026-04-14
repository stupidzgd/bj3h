import React, { Component } from "react";
import { Card, Button, Table, message, Divider, Input, Row, Col, Modal } from "antd";
import { getUsers, deleteUser, editUser, addUser, updateUserStatus, resetPassword } from "@/api/user";
import TypingCard from '@/components/TypingCard'
import EditUserForm from "./forms/edit-user-form"
import AddUserForm from "./forms/add-user-form"
import "./index.less"
const { Column } = Table;
const { Search } = Input;
class User extends Component {
  state = {
    users: [],
    editUserModalVisible: false,
    editUserModalLoading: false,
    currentRowData: {},
    addUserModalVisible: false,
    addUserModalLoading: false,
    username: '',
    name: '',
  };
  getUsers = async () => {
    const { username, name } = this.state;
    const result = await getUsers({ username, name });
    const { users, status } = result;
    if (status === 0) {
      this.setState({
        users
      });
    }
  };
  handleSearch = () => {
    this.getUsers();
  };
  handleReset = () => {
    this.setState({
      username: '',
      name: ''
    }, () => {
      this.getUsers();
    });
  };
  handleEditUser = (row) => {
    this.setState({
      currentRowData:Object.assign({}, row),
      editUserModalVisible: true,
    });
  };

  handleDeleteUser = (row) => {
    const { username } = row;
    if (username === "admin") {
      message.error("不能删除管理员用户！");
      return;
    }
    deleteUser({ id: username }).then(res => {
      message.success("删除成功");
      this.getUsers();
    });
  };
  
  handleToggleStatus = (row) => {
    const { username, status } = row;
    if (username === "admin") {
      message.error("不能禁用管理员用户！");
      return;
    }
    const newStatus = status === 1 ? 0 : 1;
    Modal.confirm({
      title: newStatus === 0 ? "确认禁用" : "确认启用",
      content: newStatus === 0 ? "确定要禁用该用户吗？" : "确定要启用该用户吗？",
      okText: "确定",
      cancelText: "取消",
      onOk: () => {
        updateUserStatus({ id: username, status: newStatus }).then(res => {
          const { status, message: msg } = res;
          if (status === 0) {
            message.success(msg || (newStatus === 1 ? "启用成功" : "禁用成功"));
            this.getUsers();
          } else {
            message.error(msg || "操作失败");
          }
        }).catch(e => {
          message.error("操作失败");
        });
      }
    });
  };
  
  handleResetPassword = (row) => {
    const { username } = row;
    Modal.confirm({
      title: "确认重置密码",
      content: "确定要重置该用户的密码吗？重置后密码将变为123456",
      okText: "确定",
      cancelText: "取消",
      onOk: () => {
        resetPassword({ id: username }).then(res => {
          const { status, message: msg } = res;
          if (status === 0) {
            message.success(msg || "密码重置成功，新密码为：123456");
          } else {
            message.error(msg || "密码重置失败");
          }
        }).catch(e => {
          message.error("密码重置失败");
        });
      }
    });
  };
  
  handleEditUserOk = _ => {
    const { form } = this.editUserFormRef.props;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      this.setState({ editModalLoading: true, });
      editUser(values).then((response) => {
        const { status, message: msg } = response;
        if (status === 0) {
          form.resetFields();
          this.setState({ editUserModalVisible: false, editUserModalLoading: false });
          message.success("编辑成功!")
          this.getUsers()
        } else {
          this.setState({ editUserModalLoading: false });
          message.error(msg || "编辑失败")
        }
      }).catch(e => {
        this.setState({ editUserModalLoading: false });
        message.error("编辑失败")
      })
      
    });
  };

  handleCancel = _ => {
    this.setState({
      editUserModalVisible: false,
      addUserModalVisible: false,
    });
  };

  handleAddUser = (row) => {
    this.setState({
      addUserModalVisible: true,
    });
  };

  handleAddUserOk = _ => {
    const { form } = this.addUserFormRef.props;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      this.setState({ addUserModalLoading: true, });
      addUser(values).then((response) => {
        const { status, message: msg } = response;
        if (status === 0) {
          form.resetFields();
          this.setState({ addUserModalVisible: false, addUserModalLoading: false });
          message.success("添加成功!")
          this.getUsers()
        } else {
          this.setState({ addUserModalLoading: false });
          message.error(msg || "添加失败")
        }
      }).catch(e => {
        this.setState({ addUserModalLoading: false });
        message.error("添加失败")
      })
    });
  };
  componentDidMount() {
    this.getUsers()
  }
  render() {
    const { users, username, name } = this.state;
    const title = (
      <div>
        <Row gutter={16} style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="按账号筛选"
              value={username}
              onChange={(e) => this.setState({ username: e.target.value })}
              onPressEnter={this.handleSearch}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="按用户名筛选"
              value={name}
              onChange={(e) => this.setState({ name: e.target.value })}
              onPressEnter={this.handleSearch}
            />
          </Col>
          <Col xs={24} sm={24} md={12} style={{ marginTop: 0, display: 'flex', alignItems: 'center' }}>
            <Button type="primary" onClick={this.handleSearch} style={{ marginRight: 8 }}>搜索</Button>
            <Button onClick={this.handleReset}>重置</Button>
          </Col>
        </Row>
        <Row style={{ marginTop: 16 }}>
          <Col span={24}>
            <Button type='primary' onClick={this.handleAddUser}>添加用户</Button>
          </Col>
        </Row>
      </div>
    );
    const cardContent = `在这里，你可以对系统中的用户进行管理，例如添加一个新用户，或者修改系统中已经存在的用户。`;
    return (
      <div className="app-container">
        <TypingCard title='用户管理' source={cardContent} />
        <br/>
        <Card title={title}>
          <Table bordered rowKey="username" dataSource={users} pagination={false} className="user-table">
            <Column title="账号" dataIndex="username" key="username" width={100} align="center"/>
            <Column title="用户名" dataIndex="name" key="name" width={100} align="center"/>
            <Column title="账号状态" dataIndex="status" key="status" width={80} align="center" render={(status) => (
              <span>{status === 1 ? '启用' : '禁用'}</span>
            )}/>
            <Column title="最后登录时间" dataIndex="lastLoginTime" key="lastLoginTime" width={180} align="center" render={(time) => (
              <span>{time ? new Date(time).toLocaleString() : '-'}</span>
            )}/>
            <Column title="登录状态" dataIndex="lastLoginTime" key="loginStatus" width={80} align="center" render={(lastLoginTime) => {
              if (!lastLoginTime) {
                return <span>离线</span>;
              }
              // 计算当前时间与最后登录时间的差值（毫秒）
              const now = new Date();
              const lastLogin = new Date(lastLoginTime);
              const diff = now - lastLogin;
              // 24小时的毫秒数
              const twentyFourHours = 24 * 60 * 60 * 1000;
              // 如果差值小于24小时，则显示在线，否则显示离线
              return <span>{diff < twentyFourHours ? '在线' : '离线'}</span>;
            }}/>
            <Column title="操作" key="action" width={260} align="center" render={(text, row) => (
              <span style={{ whiteSpace: 'nowrap' }}>
                <Button type="primary" size="small" onClick={this.handleEditUser.bind(null,row)}>编辑</Button>
                <Button 
                  type={row.status === 1 ? "danger" : "success"} 
                  size="small"
                  style={{ marginLeft: 8 }}
                  onClick={this.handleToggleStatus.bind(null,row)}
                >{row.status === 1 ? "禁用" : "启用"}</Button>
                <Button type="default" size="small" style={{ marginLeft: 8 }} onClick={this.handleResetPassword.bind(null,row)}>重置密码</Button>
              </span>
            )}/>
          </Table>
        </Card>
        <EditUserForm
          currentRowData={this.state.currentRowData}
          wrappedComponentRef={formRef => this.editUserFormRef = formRef}
          visible={this.state.editUserModalVisible}
          confirmLoading={this.state.editUserModalLoading}
          onCancel={this.handleCancel}
          onOk={this.handleEditUserOk}
        />  
        <AddUserForm
          wrappedComponentRef={formRef => this.addUserFormRef = formRef}
          visible={this.state.addUserModalVisible}
          confirmLoading={this.state.addUserModalLoading}
          onCancel={this.handleCancel}
          onOk={this.handleAddUserOk}
        />  
      </div>
    );
  }
}

export default User;
