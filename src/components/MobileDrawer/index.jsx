import React from 'react';
import { Drawer, Menu, Icon } from 'antd';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import menuConfig from '../../config/menuConfig';
import Logo from '../../views/layout/Sider/Logo';
import './index.less';

const { SubMenu } = Menu;

class MobileDrawer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      openKeys: [],
      selectedKeys: [this.props.location.pathname]
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.pathname !== this.props.location.pathname) {
      this.setState({
        selectedKeys: [this.props.location.pathname]
      });
    }
    
    // 当 visible 变为 false 时，强制清理
    if (prevProps.visible && !this.props.visible) {
      this.forceCleanup();
    }
  }

  componentWillUnmount() {
    // 清理资源，防止内存泄漏
    this.forceCleanup();
  }

  // 强制清理抽屉和遮罩层
  forceCleanup = () => {
    // 强制移除所有抽屉相关元素
    const drawers = document.querySelectorAll('.ant-drawer');
    drawers.forEach(drawer => {
      // 移除遮罩层
      const mask = drawer.querySelector('.ant-drawer-mask');
      if (mask) {
        mask.style.display = 'none';
        mask.style.opacity = '0';
        mask.style.visibility = 'hidden';
        mask.style.pointerEvents = 'none';
      }
      
      // 移除抽屉内容
      const contentWrapper = drawer.querySelector('.ant-drawer-content-wrapper');
      if (contentWrapper) {
        contentWrapper.style.display = 'none';
      }
    });

    // 强制移除 drawer 相关类名
    document.body.classList.remove('ant-drawer-open');

    // 恢复 body 样式
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.height = '';
    document.body.style.paddingRight = '';
  };

  // 处理抽屉可见性变化
  handleAfterVisibleChange = (visible) => {
    if (!visible) {
      // 抽屉关闭后强制清理
      setTimeout(() => {
        this.forceCleanup();
      }, 100);
    }
  };

  handleOpenChange = (openKeys) => {
    this.setState({ openKeys });
  };

  handleClick = ({ key }) => {
    // 先关闭抽屉，路由跳转由 Link 组件处理
    this.props.onClose();
  };

  // 权限控制逻辑，与PC端保持一致
  filterMenuItem = (item) => {
    // 如果菜单项没有roles属性，则显示
    if (!item.roles || item.roles.length === 0) {
      return true;
    }
    // 从Redux store获取当前用户名
    const currentUser = this.props.username;
    // 只有当当前用户名在roles数组中时才显示
    return item.roles.includes(currentUser);
  };

  renderMenu = (menuList) => {
    return menuList.reduce((pre, item) => {
      if (this.filterMenuItem(item)) {
        if (item.children) {
          pre.push(
            <SubMenu
              key={item.path}
              title={
                <span>
                  <Icon type={item.icon} />
                  <span>{item.title}</span>
                </span>
              }
            >
              {this.renderMenu(item.children)}
            </SubMenu>
          );
        } else {
          pre.push(
            <Menu.Item key={item.path}>
              <Link to={item.path}>
                <Icon type={item.icon} />
                <span>{item.title}</span>
              </Link>
            </Menu.Item>
          );
        }
      }
      return pre;
    }, []);
  };

  render() {
    const { visible, onClose } = this.props;
    const { openKeys, selectedKeys } = this.state;

    // 当 visible 为 false 时，不渲染抽屉
    if (!visible) {
      return null;
    }

    return (
      <Drawer
        title={<Logo />}
        placement="left"
        onClose={onClose}
        visible={visible}
        className="mobile-drawer"
        destroyOnClose
        maskClosable={true}
        maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.45)' }}
        getContainer={document.body}
        style={{ position: 'absolute' }}
        afterVisibleChange={this.handleAfterVisibleChange}
        zIndex={1000}
        closable={false}
      >
        <Menu
          mode="inline"
          theme="dark"
          openKeys={openKeys}
          selectedKeys={selectedKeys}
          onOpenChange={this.handleOpenChange}
          onClick={this.handleClick}
          style={{ height: '100%', borderRight: 0 }}
        >
          {this.renderMenu(menuConfig)}
        </Menu>
      </Drawer>
    );
  }
}

export default withRouter(connect((state) => ({ ...state.user }))(MobileDrawer));
