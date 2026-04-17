import React, { Component } from "react";
import { Menu, Icon } from "antd";
import { Link, withRouter } from "react-router-dom";
import { Scrollbars } from "react-custom-scrollbars";
import { connect } from "react-redux";
import { addTag } from "@/store/actions";
import { getMenuItemInMenuListByProperty } from "@/utils";
import menuList from "@/config/menuConfig";
import "./index.less";
const SubMenu = Menu.SubMenu;

class SidebarMenu extends Component {
  state = {
    menuTreeNode: null,
    openKey: [],
  };

  // filterMenuItem用来根据配置信息筛选可以显示的菜单项
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
  // 菜单渲染
  getMenuNodes = (menuList) => {
    // 得到当前请求的路由路径
    const path = this.props.location.pathname;
    return menuList.reduce((pre, item) => {
      if (this.filterMenuItem(item)) {
        if (!item.children) {
          pre.push(
            <Menu.Item key={item.path}>
              <Link to={item.path}>
                {item.icon ? <Icon type={item.icon} /> : null}
                <span>{item.title}</span>
              </Link>
            </Menu.Item>
          );
        } else {
          // 向pre添加<SubMenu>
          pre.push(
            <SubMenu
              key={item.path}
              title={
                <span>
                  {item.icon ? <Icon type={item.icon} /> : null}
                  <span>{item.title}</span>
                </span>
              }
            >
              {this.getMenuNodes(item.children)}
            </SubMenu>
          );
        }
      }

      return pre;
    }, []);
  };

  // 获取默认打开的菜单
  getDefaultOpenKeys = (menuList, path) => {
    const openKeys = [];
    menuList.forEach(item => {
      if (item.children) {
        const cItem = item.children.find(cItem => path.indexOf(cItem.path) === 0);
        if (cItem) {
          openKeys.push(item.path);
          openKeys.push(...this.getDefaultOpenKeys(item.children, path));
        }
      }
    });
    return openKeys;
  };

  handleMenuSelect = ({ key = "/dashboard" }) => {
    let menuItem = getMenuItemInMenuListByProperty(menuList, "path", key);
    if (menuItem) {
      this.props.addTag(menuItem);
    }
  };

  componentWillMount() {
    const path = this.props.location.pathname;
    const openKey = this.getDefaultOpenKeys(menuList, path);
    const menuTreeNode = this.getMenuNodes(menuList);
    this.setState({
      menuTreeNode,
      openKey,
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.pathname !== this.props.location.pathname) {
      const path = this.props.location.pathname;
      const openKey = this.getDefaultOpenKeys(menuList, path);
      this.setState({
        openKey,
      });
    }
    
    // 当用户名变化时，重新生成菜单树
    if (prevProps.username !== this.props.username) {
      const path = this.props.location.pathname;
      const openKey = this.getDefaultOpenKeys(menuList, path);
      const menuTreeNode = this.getMenuNodes(menuList);
      this.setState({
        menuTreeNode,
        openKey,
      });
    }
  }
  render() {
    const path = this.props.location.pathname;
    const openKey = this.state.openKey;
    return (
      <div className="sidebar-menu-container">
        <Scrollbars autoHide autoHideTimeout={1000} autoHideDuration={200}>
          <Menu
            mode="inline"
            theme="dark"
            onSelect={this.handleMenuSelect}
            selectedKeys={[path]}
            defaultOpenKeys={openKey}
          >
            {this.state.menuTreeNode}
          </Menu>
        </Scrollbars>
      </div>
    );
  }
}

export default connect((state) => ({ ...state.user }), { addTag })(withRouter(SidebarMenu));
