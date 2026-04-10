// 设备检测工具

// 检测是否为移动设备
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// 检测是否为iOS设备
export const isIOS = () => {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
};

// 检测是否为Android设备
export const isAndroid = () => {
  return /Android/i.test(navigator.userAgent);
};

// 检测是否为平板设备
export const isTablet = () => {
  const userAgent = navigator.userAgent;
  return /iPad|Android(?!.*Mobile)/i.test(userAgent);
};

// 检测是否为桌面设备
export const isDesktop = () => {
  return !isMobile() && !isTablet();
};

// 检测屏幕宽度
export const getScreenWidth = () => {
  return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
};

// 检测屏幕高度
export const getScreenHeight = () => {
  return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
};

// 检测是否为小屏幕（移动设备）
export const isSmallScreen = () => {
  return getScreenWidth() <= 768;
};

// 检测是否为中等屏幕（平板）
export const isMediumScreen = () => {
  const width = getScreenWidth();
  return width > 768 && width <= 992;
};

// 检测是否为大屏幕（桌面）
export const isLargeScreen = () => {
  return getScreenWidth() > 992;
};

// 响应式断点检测
export const getBreakpoint = () => {
  const width = getScreenWidth();
  if (width <= 768) {
    return 'xs'; // 移动设备
  } else if (width <= 992) {
    return 'sm'; // 平板
  } else if (width <= 1200) {
    return 'md'; // 小桌面
  } else {
    return 'lg'; // 大桌面
  }
};

// 监听屏幕尺寸变化
export const onResize = (callback) => {
  window.addEventListener('resize', callback);
  return () => {
    window.removeEventListener('resize', callback);
  };
};

// 设备信息
export const getDeviceInfo = () => {
  return {
    isMobile: isMobile(),
    isIOS: isIOS(),
    isAndroid: isAndroid(),
    isTablet: isTablet(),
    isDesktop: isDesktop(),
    screenWidth: getScreenWidth(),
    screenHeight: getScreenHeight(),
    breakpoint: getBreakpoint()
  };
};
