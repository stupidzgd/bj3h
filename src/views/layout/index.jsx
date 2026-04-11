import React, { useState, useEffect, useRef } from "react";
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
  const [showBackToTop, setShowBackToTop] = useState(false);
  const contentRef = useRef(null);

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

  useEffect(() => {
    if (isSmall) {
      // 移动端：监听滚动事件
      const contentElement = document.querySelector('.ant-layout-content');
      if (contentElement) {
        const handleScroll = () => {
          // 滚动超过200px时显示回到顶部按钮
          setShowBackToTop(contentElement.scrollTop > 200 || window.scrollY > 200);
        };

        contentElement.addEventListener('scroll', handleScroll);
        window.addEventListener('scroll', handleScroll);

        // 初始检查
        handleScroll();

        return () => {
          contentElement.removeEventListener('scroll', handleScroll);
          window.removeEventListener('scroll', handleScroll);
        };
      }
    } else {
      // 非移动端：隐藏回到顶部按钮
      setShowBackToTop(false);
    }
  }, [isSmall]);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {!isSmall && <Sider />}
      <Layout>
        <Header />
        {tagsView ? <TagsView /> : null}
        <Content />
        <RightPanel />
        {/* 自定义回到顶部按钮（仅在移动端且滚动超过一定距离时显示） */}
        {isSmall && showBackToTop && (
          <div
            onClick={() => {
              // 滚动Content组件到顶部
              const contentElement = document.querySelector('.ant-layout-content');
              if (contentElement) {
                contentElement.scrollTo({
                  top: 0,
                  behavior: 'smooth'
                });
                
                // 兼容性处理
                setTimeout(() => {
                  contentElement.scrollTop = 0;
                  // 手动触发滚动事件，确保回到顶部按钮隐藏
                  const event = new Event('scroll');
                  contentElement.dispatchEvent(event);
                }, 100);
              }
              
              // 同时滚动window到顶部，确保整体页面也滚动
              window.scrollTo({
                top: 0,
                behavior: 'smooth'
              });
              
              setTimeout(() => {
                document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;
                // 手动触发window滚动事件，确保回到顶部按钮隐藏
                const event = new Event('scroll');
                window.dispatchEvent(event);
                // 直接设置showBackToTop为false，确保按钮隐藏
                setShowBackToTop(false);
              }, 100);
            }}
            style={{
              position: 'fixed',
              right: 20,
              bottom: 20,
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 184, 148, 0.7)',
              color: '#fff',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              cursor: 'pointer',
              zIndex: 9999,
              fontSize: 24,
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              userSelect: 'none',
              touchAction: 'manipulation'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(0, 184, 148, 0.9)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(0, 184, 148, 0.7)';
            }}
          >
            ↑
          </div>
        )}
      </Layout>
    </Layout>
  );
};
export default connect((state) => state.settings)(Main);
