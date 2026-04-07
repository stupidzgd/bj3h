const {
  override,
  fixBabelImports,
  addLessLoader,
  addWebpackAlias,
  overrideDevServer,
  addWebpackPlugin
} = require("customize-cra");
const path = require("path");
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
function resolve(dir) {
  return path.join(__dirname, dir);
}
process.env.CI = "false";
const addCustomize = () => (config) => {
  if (config.output.publicPath) {
    config.output.publicPath =
      process.env.NODE_ENV === "production"
        ? "/react-antd-admin-template/"
        : "/";
  }
  if (config.resolve) {
    config.resolve.extensions.push(".jsx");
  }
  
  // 代码分割配置
  config.optimization = {
    ...config.optimization,
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          name: 'vendors',
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          chunks: 'initial'
        },
        common: {
          name: 'common',
          minChunks: 2,
          priority: 5,
          chunks: 'initial',
          reuseExistingChunk: true
        }
      }
    }
  };
  
  return config;
};

const devServerConfig = () => (config) => {
  return {
    ...config,
    proxy: {
      "/dev-api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        pathRewrite: {
          "^/dev-api": ""
        }
      }
    }
  };
};

module.exports = {
  webpack: override(
    // 针对antd实现按需打包: 根据import来打包(使用babel-plugin-import)
    fixBabelImports("import", {
      libraryName: "antd",
      libraryDirectory: "es",
      style: true, // 自动打包相关的样式
    }),

    // 使用less-loader对源码中的less的变量进行重新指定
    addLessLoader({
      javascriptEnabled: true,
      modifyVars: { "@primary-color": "#1DA57A" },
    }),

    // 配置路径别名
    addWebpackAlias({
      "@": resolve("src"),
    }),
    
    // 生产环境添加压缩插件
    process.env.NODE_ENV === 'production' && addWebpackPlugin(
      new CompressionWebpackPlugin({
        algorithm: 'gzip',
        test: /\.(js|css|html|svg)$/,
        threshold: 8192,
        minRatio: 0.8
      })
    ),
    
    // 可选：添加bundle分析插件
    process.env.NODE_ENV === 'production' && addWebpackPlugin(
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: false,
        reportFilename: 'bundle-report.html'
      })
    ),
    
    addCustomize()
  ),
  devServer: overrideDevServer(
    devServerConfig()
  )
};
