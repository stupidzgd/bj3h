import React, { useState, useEffect } from 'react';
import { Tabs, Card } from 'antd';
import { connect } from 'react-redux';
import { fetchDictionaries } from '@/store/actions/dictionary';
import PlatformManagement from './platform';
import ContentCategoryManagement from './contentCategory';
import DepartmentCategoryManagement from './departmentCategory';
import DepartmentManagement from './department';

const { TabPane } = Tabs;

const DictionaryManagement = (props) => {
  const [activeKey, setActiveKey] = useState('platform');

  useEffect(() => {
    // 每次进入字典管理页面时获取最新字典数据
    props.fetchDictionaries();
  }, []);

  const handleTabChange = (key) => {
    setActiveKey(key);
  };

  return (
    <div className="app-container">
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>字典管理</h2>
      </div>
      <Card>
        <Tabs activeKey={activeKey} onChange={handleTabChange}>
          <TabPane tab="平台管理" key="platform">
            <PlatformManagement />
          </TabPane>
          <TabPane tab="内容分类管理" key="contentCategory">
            <ContentCategoryManagement />
          </TabPane>
          <TabPane tab="科室分类管理" key="departmentCategory">
            <DepartmentCategoryManagement />
          </TabPane>
          <TabPane tab="科室管理" key="department">
            <DepartmentManagement />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default connect(null, { fetchDictionaries })(DictionaryManagement);