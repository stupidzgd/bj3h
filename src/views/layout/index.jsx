import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import Content from "./Content";
import Header from "./Header";
import RightPanel from "./RightPanel";
import Sider from "./Sider";
import TagsView from "./TagsView";
import { Layout } from "antd";
import { isSmallScreen, onResize } from "@/utils/device";
const Main = (props) => {
  const { tagsView } = props;
  const [isSmall, setIsSmall] = useState(isSmallScreen());

  useEffect(() => {
    // 监听窗口大小变化
    const unsubscribe = onResize(() => {
      setIsSmall(isSmallScreen());
    });

    // 清理函数
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {!isSmall && <Sider />}
      <Layout>
        <Header />
        {tagsView ? <TagsView /> : null}
        <Content />
        <RightPanel />
        {/* 自定义回到顶部按钮 */}
        <div
          onClick={() => {
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
          }}
          style={{
            position: 'fixed',
            right: 20,
            bottom: 20,
            width: 48,
            height: 48,
            borderRadius: '50%',
            backgroundColor: 'rgba(24, 144, 255, 0.7)',
            color: '#fff',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            cursor: 'pointer',
            zIndex: 9999,
            fontSize: 24,
            fontWeight: 'bold',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(24, 144, 255, 0.9)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'rgba(24, 144, 255, 0.7)';
          }}
        >
          ↑
        </div>
      </Layout>
    </Layout>
  );
};
export default connect((state) => state.settings)(Main);
