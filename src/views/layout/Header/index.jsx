import React, { useEffect, useState, useRef } from "react";
import { connect } from "react-redux";
import { Icon, Menu, Dropdown, Modal, Layout, Avatar, Form, Input, message } from "antd";
import { Link } from "react-router-dom";
import { userLogout, getUserInfo } from "@/store/actions";
import { updateProfile } from "@/api/user";
import FullScreen from "@/components/FullScreen";
import Settings from "@/components/Settings";
import Hamburger from "@/components/Hamburger";
import BreadCrumb from "@/components/BreadCrumb";
import MobileDrawer from "@/components/MobileDrawer";
import { isSmallScreen } from "@/utils/device";
import "./index.less";
const { Header } = Layout;
const { TextArea } = Input;
const { create: FormCreate } = Form;

// 修改密码表单组件
const ChangePasswordForm = FormCreate()((props) => {
  const { form, onOk, onCancel, loading, visible } = props;
  const { getFieldDecorator } = form;
  
  // 当弹窗关闭时重置表单
  React.useEffect(() => {
    if (!visible) {
      form.resetFields();
    }
  }, [visible, form]);
  
  const handleOk = () => {
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      onOk(values);
    });
  };
  
  return (
    <Modal
      title="修改密码"
      visible={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={loading}
      width={400}
    >
      <Form layout="vertical">
        <Form.Item label="旧密码" required>
          {getFieldDecorator('oldPassword', {
            rules: [{ required: true, message: '请输入旧密码' }],
          })(
            <Input.Password placeholder="旧密码" />
          )}
        </Form.Item>
        <Form.Item label="新密码" required>
          {getFieldDecorator('newPassword', {
            rules: [
              { required: true, message: '请输入新密码' },
              { 
                validator: (rule, value, callback) => {
                  if (!value) {
                    callback('请输入新密码');
                  } else if (value === form.getFieldValue('oldPassword')) {
                    callback('新密码不能与旧密码相同');
                  } else {
                    callback();
                  }
                }
              }
            ],
          })(
            <Input.Password placeholder="新密码" />
          )}
        </Form.Item>
        <Form.Item label="确认新密码" required>
          {getFieldDecorator('confirmNewPassword', {
            rules: [
              { required: true, message: '请确认新密码' },
              { 
                validator: (rule, value, callback) => {
                  if (!value) {
                    callback('请确认新密码');
                  } else if (value !== form.getFieldValue('newPassword')) {
                    callback('两次输入的密码不一致');
                  } else {
                    callback();
                  }
                }
              }
            ],
          })(
            <Input.Password placeholder="确认新密码" />
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
});

class LayoutHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      modalLoading: false,
      mobileDrawerVisible: false,
      changePasswordModalVisible: false, // 修改密码弹窗状态
      changePasswordLoading: false, // 修改密码加载状态
    };
  }

  componentDidMount() {
    const { token, getUserInfo } = this.props;
    if (token) {
      getUserInfo(token);
    }
    // 监听窗口大小变化
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    // 移除窗口大小变化监听
    window.removeEventListener('resize', this.handleResize);
    // 清理 body 样式，防止残留
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
  }

  // 处理窗口大小变化
  handleResize = () => {
    // 当窗口大小变化时，强制重新渲染组件
    this.forceUpdate();
  }

  componentDidUpdate(prevProps) {
    const { token, getUserInfo } = this.props;
    if (token && prevProps.token !== token) {
      getUserInfo(token);
    }
  }

  // 打开个人信息模态框
  handleOpenModal = () => {
    this.setState({
      modalVisible: true
    }, () => {
      // 在模态框打开后设置表单数据
      const { id, name, username, description } = this.props;
      this.props.form.setFieldsValue({
        id: username || String(id || name), // 使用username作为账号，确保是字符串类型
        name: name, // 使用name作为用户名称
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
          const { id, name, description } = values;
          // 构建请求参数
          const requestData = {
            username: id, // 账号不能修改，使用当前账号
            name,
            description,
            token: this.props.token // 传递token用于验证
          };
          
          // 调用修改个人信息的API
          updateProfile(requestData)
            .then((data) => {
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
        this.props.userLogout(token);
      },
    });
  };

  // 打开修改密码模态框
  handleOpenChangePasswordModal = () => {
    this.setState({
      changePasswordModalVisible: true
    });
  };

  // 关闭修改密码模态框
  handleChangePasswordCancel = () => {
    this.setState({ changePasswordModalVisible: false });
  };

  // 提交密码修改
  handleChangePasswordSubmit = (values) => {
    // 二次确认是否提交修改
    Modal.confirm({
      title: '确认修改',
      content: '确定要修改密码吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        this.setState({ changePasswordLoading: true });
        // 调用修改密码的API
        const { oldPassword, newPassword } = values;
        // 构建请求参数
        const requestData = {
          username: this.props.username || this.props.id, // 传递用户名
          oldPassword,
          newPassword,
          token: this.props.token // 传递token用于验证
        };
        
        // 调用修改密码的API
        updateProfile(requestData)
          .then((data) => {
            if (data.status === 0) {
              this.setState({ changePasswordLoading: false, changePasswordModalVisible: false });
              message.success('密码修改成功');
            } else {
              this.setState({ changePasswordLoading: false });
              message.error(data.message || '密码修改失败');
            }
          })
          .catch((error) => {
            this.setState({ changePasswordLoading: false });
            message.error('密码修改失败');
            console.error('修改密码错误:', error);
          });
      }
    });
  };

  // 打开移动端抽屉菜单
  handleOpenMobileDrawer = () => {
    this.setState({ mobileDrawerVisible: true }, () => {
      // 打开抽屉时禁止页面滚动
      document.body.style.overflow = 'hidden';
    });
  };

  // 关闭移动端抽屉菜单
  handleCloseMobileDrawer = () => {
    this.setState({ mobileDrawerVisible: false }, () => {
      // 确保抽屉关闭后页面恢复正常滚动
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
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
      case "changePassword":
        this.handleOpenChangePasswordModal();
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
    const { modalVisible, modalLoading, mobileDrawerVisible } = this.state;
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
        <Menu.Item key="changePassword">
          修改密码
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
          {isSmallScreen() ? (
            <Icon
              type="menu"
              className="mobile-menu-btn"
              onClick={this.handleOpenMobileDrawer}
              style={{ fontSize: '24px', marginRight: '16px', cursor: 'pointer' }}
            />
          ) : (
            <Hamburger />
          )}
          <BreadCrumb />
          <div className="right-menu">
            {/* <FullScreen />
            {showSettings ? <Settings /> : null} */}
            <div className="dropdown-wrap">
              <Dropdown overlay={menu}>
                <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                  <Avatar shape="square" size="medium" src={avatar} style={{ marginRight: '8px' }} />
                  <span className="username" style={{ marginRight: '8px', fontSize: '14px', fontWeight: '700', color: 'rgba(0,0,0,.85)' }}>{name || '用户'}</span>
                  <Icon style={{ color: "rgba(0,0,0,.3)" }} type="caret-down" />
                  {lastLoginTime && (
                    <span style={{ fontSize: '12px', color: 'rgba(0,0,0,.45)', position: 'absolute', bottom: -20, left: 0, whiteSpace: 'nowrap' }}>
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
                <Form.Item label="用户描述">
                  {getFieldDecorator('description')(
                    <TextArea rows={4} placeholder="用户描述" />
                  )}
                </Form.Item>
              </Form>
            </Modal>
            
            {/* 修改密码模态框 */}
            <ChangePasswordForm
              visible={this.state.changePasswordModalVisible}
              onCancel={this.handleChangePasswordCancel}
              onOk={this.handleChangePasswordSubmit}
              loading={this.state.changePasswordLoading}
            />

          </div>
        </Header>
        <MobileDrawer
          visible={mobileDrawerVisible}
          onClose={this.handleCloseMobileDrawer}
        />
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

export default connect(mapStateToProps, { userLogout, getUserInfo })(FormCreate()(LayoutHeader));
