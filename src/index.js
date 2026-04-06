import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "antd/dist/antd.less";
import "@/styles/index.less";
import "./mock";
import '@/lib/monitor';

// 配置moment.js中文语言包
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');

ReactDOM.render(<App />, document.getElementById("root"));
