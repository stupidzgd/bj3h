import React, { useEffect, useState, useRef } from "react";
import { connect } from "react-redux";
import { Icon, Menu, Dropdown, Modal, Layout, Avatar, Form, Input, message } from "antd";
import { Link } from "react-router-dom";
import { logout, getUserInfo } from "@/store/actions";
import { updateProfile } from "@/api/user";
import FullScreen from "@/components/FullScreen";
import Settings from "@/components/Settings";
import Hamburger from "@/components/Hamburger";
import BreadCrumb from "@/components/BreadCrumb";
import "./index.less";
const { Header } = Layout;
const { TextArea } = Input;
const { create: FormCreate } = Form;

class LayoutHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      modalLoading: false,
      passwordKey: 0, // 用于重置密码输入框状态的key
      confirmPasswordKey: 0, // 用于重置密码确认输入框状态的key
    };
  }

  componentDidMount() {
    const { token, getUserInfo } = this.props;
    if (token) {
      getUserInfo(token);
    }
  }

  componentDidUpdate(prevProps) {
    const { token, getUserInfo } = this.props;
    if (token && prevProps.token !== token) {
      getUserInfo(token);
    }
  }

  // 打开个人信息模态框
  handleOpenModal = () => {
    // 更新key值，强制重置密码输入框状态
    this.setState({
      modalVisible: true,
      passwordKey: this.state.passwordKey + 1,
      confirmPasswordKey: this.state.confirmPasswordKey + 1
    }, () => {
      // 在模态框打开后设置表单数据
      const { id, name, username, password, description } = this.props;
      this.props.form.setFieldsValue({
        id: username || String(id || name), // 使用username作为账号，确保是字符串类型
        name: name, // 使用name作为用户名称
        password: password || "123456", // 使用从服务器返回的密码，默认123456
        confirmPassword: password || "123456", // 使用从服务器返回的密码，默认123456
        description: description || "", // 使用description作为用户描述
      });
    });
  };

  // 关闭个人信息模态框
  handleCancel = () => {
    this.setState({ modalVisible: false });
  };

  // 提交个人信息修改
  handleOk = () => {
    this.props.form.validateFields((err, values) => {
      if (err) {
        return;
      }
      
      // 二次确认是否提交修改
      Modal.confirm({
        title: "确认修改",
        content: "确定要提交个人信息修改吗？",
        okText: "确定",
        cancelText: "取消",
        onOk: () => {
          this.setState({ modalLoading: true });
          // 调用修改个人信息的API
          const { id, name, password, description } = values;
          // 构建请求参数
          const requestData = {
            username: id, // 账号不能修改，使用当前账号
            name,
            password,
            description,
            token: this.props.token // 传递token用于验证
          };
          
          // 调用修改个人信息的API
          updateProfile(requestData)
            .then((response) => {
              const { data } = response;
              if (data.status === 0) {
                this.setState({ modalLoading: false, modalVisible: false });
                message.success('个人信息修改成功');
                // 重新获取用户信息，更新状态
                const { token, getUserInfo } = this.props;
                if (token) {
                  getUserInfo(token);
                }
              } else {
                this.setState({ modalLoading: false });
                message.error(data.message || '个人信息修改失败');
              }
            })
            .catch((error) => {
              this.setState({ modalLoading: false });
              message.error('个人信息修改失败');
              console.error('修改个人信息错误:', error);
            });
        }
      });
    });
  };

  handleLogout = (token) => {
    Modal.confirm({
      title: "注销",
      content: "确定要退出系统吗?",
      okText: "确定",
      cancelText: "取消",
      onOk: () => {
        this.props.logout(token);
      },
    });
  };

  onClick = ({ key }) => {
    const { token } = this.props;
    switch (key) {
      case "logout":
        this.handleLogout(token);
        break;
      case "editProfile":
        this.handleOpenModal();
        break;
      default:
        break;
    }
  };

  computedStyle = () => {
    const { fixedHeader, sidebarCollapsed } = this.props;
    let styles;
    if (fixedHeader) {
      if (sidebarCollapsed) {
        styles = {
          width: "calc(100% - 80px)",
        };
      } else {
        styles = {
          width: "calc(100% - 200px)",
        };
      }
    } else {
      styles = {
        width: "100%",
      };
    }
    return styles;
  };

  render() {
    const { modalVisible, modalLoading } = this.state;
    const { token, avatar, name, lastLoginTime, sidebarCollapsed, showSettings, fixedHeader } = this.props;
    const { getFieldDecorator } = this.props.form;

    const menu = (
      <Menu onClick={this.onClick}>
        <Menu.Item key="dashboard">
          <Link to="/dashboard">首页</Link>
        </Menu.Item>
        <Menu.Item key="editProfile">
          修改个人信息
        </Menu.Item>
        {/* <Menu.Item key="project">
          <a
            target="_blank"
            href="https://github.com/NLRX-WJC/react-antd-admin-template"
            rel="noopener noreferrer"
          >
            项目地址
          </a>
        </Menu.Item> */}
        <Menu.Divider />
        <Menu.Item key="logout">注销</Menu.Item>
      </Menu>
    );

    return (
      <>
        {/* 这里是仿照antd pro的做法,如果固定header，
        则header的定位变为fixed，此时需要一个定位为relative的header把原来的header位置撑起来 */}
        {fixedHeader ? <Header /> : null}
        <Header
          style={this.computedStyle()}
          className={fixedHeader ? "fix-header" : ""}
        >
          <Hamburger />
          <BreadCrumb />
          <div className="right-menu">
            {/* <FullScreen />
            {showSettings ? <Settings /> : null} */}
            <div className="dropdown-wrap">
              <Dropdown overlay={menu}>
                <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar shape="square" size="medium" src={avatar} style={{ marginRight: '8px' }} />
                    <span className="username" style={{ marginRight: '8px', fontSize: '14px', fontWeight: '700', color: 'rgba(0,0,0,.85)' }}>{name || '用户'}</span>
                    <Icon style={{ color: "rgba(0,0,0,.3)" }} type="caret-down" />
                  </div>
                  {lastLoginTime && (
                    <span style={{ fontSize: '12px', color: 'rgba(0,0,0,.45)', marginTop: '2px' }}>
                      上次登录: {(() => {
                        const date = new Date(lastLoginTime);
                        // 手动添加8小时（上海时区）
                        const shanghaiTime = new Date(date.getTime() + 8 * 60 * 60 * 1000);
                        const year = shanghaiTime.getFullYear();
                        const month = String(shanghaiTime.getMonth() + 1).padStart(2, '0');
                        const day = String(shanghaiTime.getDate()).padStart(2, '0');
                        const hour = String(shanghaiTime.getHours()).padStart(2, '0');
                        const minute = String(shanghaiTime.getMinutes()).padStart(2, '0');
                        const second = String(shanghaiTime.getSeconds()).padStart(2, '0');
                        return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
                      })()}
                    </span>
                  )}
                </div>
              </Dropdown>
            </div>
            {/* 个人信息修改模态框 */}
            <Modal
              title="修改个人信息"
              visible={modalVisible}
              onCancel={this.handleCancel}
              onOk={this.handleOk}
              confirmLoading={modalLoading}
              width={500}
            >
              <Form layout="vertical">
                <Form.Item label="账号">
                  {getFieldDecorator('id', {
                    rules: [{ required: true, message: '请输入账号' }],
                  })(
                    <Input disabled placeholder="账号" />
                  )}
                </Form.Item>
                <Form.Item label="用户名称">
                  {getFieldDecorator('name', {
                    rules: [{ required: true, message: '请输入用户名称' }],
                  })(
                    <Input placeholder="用户名称" />
                  )}
                </Form.Item>
                <Form.Item label="用户密码">
                  {getFieldDecorator('password', {
                    rules: [{ required: true, message: '请输入用户密码' }],
                  })(
                    <Input.Password 
                      key={this.state.passwordKey}
                      placeholder="用户密码" 
                      onChange={() => {
                        // 当密码变化时，校验密码确认字段
                        this.props.form.validateFields(['confirmPassword']);
                      }}
                    />
                  )}
                </Form.Item>
                <Form.Item label="密码确认">
                  {getFieldDecorator('confirmPassword', {
                    rules: [
                      { 
                        validator: (rule, value, callback) => {
                          if (!value) {
                            callback('请确认密码');
                          } else if (value !== this.props.form.getFieldValue('password')) {
                            callback('两次输入的密码不一致');
                          } else {
                            callback();
                          }
                        }
                      }
                    ],
                  })(
                    <Input.Password 
                      key={this.state.confirmPasswordKey}
                      placeholder="密码确认" 
                      onChange={() => {
                        // 当密码确认变化时，校验密码确认字段
                        this.props.form.validateFields(['confirmPassword']);
                      }}
                    />
                  )}
                </Form.Item>
                <Form.Item label="用户描述">
                  {getFieldDecorator('description')(
                    <TextArea rows={4} placeholder="用户描述" />
                  )}
                </Form.Item>
              </Form>
            </Modal>
          </div>
        </Header>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    ...state.app,
    ...state.user,
    ...state.settings,
  };
};

export default connect(mapStateToProps, { logout, getUserInfo })(FormCreate()(LayoutHeader));
