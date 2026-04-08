import React from 'react';

const NoData = ({ style = {} }) => {
  return (
    <div style={{
      textAlign: 'center',
      padding: '40px 0',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      ...style
    }}>
      <div style={{ fontSize: '36px', color: '#f0f0f0', marginBottom: '12px' }}>📊</div>
      <div style={{ fontSize: '14px', color: '#999', marginBottom: '6px' }}>暂无查询数据</div>
      <div style={{ fontSize: '12px', color: '#ccc' }}>请尝试调整筛选条件或导入数据后再查看</div>
    </div>
  );
};

export default NoData;