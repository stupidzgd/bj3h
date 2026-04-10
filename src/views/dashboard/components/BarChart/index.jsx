import React, { Component } from "react";
import { PropTypes } from "prop-types";
import { connect } from "react-redux";
import echarts from "@/lib/echarts";
import { debounce } from "@/utils";
import { isSmallScreen } from "@/utils/device";
import NoData from "@/components/NoData";

class BarChart extends Component {
  static propTypes = {
    width: PropTypes.string,
    height: PropTypes.string,
    className: PropTypes.string,
    styles: PropTypes.object,
    chartData: PropTypes.array,
  };
  static defaultProps = {
    width: "100%",
    height: "300px",
    styles: {},
    className: "",
    chartData: [],
  };
  state = {
    chart: null,
  };

  componentDidMount() {
    debounce(this.initChart.bind(this), 300)();
    window.addEventListener("resize", () => this.resize());
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.sidebarCollapsed !== this.props.sidebarCollapsed) {
      this.resize();
    }
    if (nextProps.chartData !== this.props.chartData) {
      debounce(this.initChart.bind(this), 300)();
    }
  }

  componentWillUnmount() {
    this.dispose();
  }

  resize() {
    const chart = this.state.chart;
    if (chart) {
      debounce(chart.resize.bind(this), 300)();
    }
  }

  dispose() {
    if (!this.state.chart) {
      return;
    }
    window.removeEventListener("resize", () => this.resize()); // 移除窗口，变化时重置图表
    try {
      this.state.chart.dispose();
    } catch (error) {
      console.warn('销毁图表时出错:', error);
    }
    this.setState({ chart: null });
  }

  setOptions(chartData) {
    const animationDuration = 3000;
    const isMobile = isSmallScreen();
    const data = chartData || [
      { name: "Mon", value: 79 },
      { name: "Tue", value: 52 },
      { name: "Wed", value: 200 },
      { name: "Thu", value: 334 },
      { name: "Fri", value: 390 },
      { name: "Sat", value: 330 },
      { name: "Sun", value: 220 },
    ];
    
    this.state.chart.setOption({
      tooltip: {
        trigger: "axis",
        axisPointer: {
          // 坐标轴指示器，坐标轴触发有效
          type: "shadow", // 默认为直线，可选为：'line' | 'shadow'
        },
        textStyle: {
          fontSize: isMobile ? 12 : 14,
        },
      },
      grid: {
        top: isMobile ? 10 : 10,
        left: isMobile ? "3%" : "2%",
        right: isMobile ? "3%" : "2%",
        bottom: isMobile ? "10%" : "3%",
        containLabel: true,
      },
      xAxis: [
        {
          type: "category",
          data: data.map(item => item.name),
          axisTick: {
            alignWithLabel: true,
          },
          axisLabel: {
            fontSize: isMobile ? 10 : 12,
            rotate: isMobile ? 45 : 0,
          },
        },
      ],
      yAxis: [
        {
          type: "value",
          axisTick: {
            show: false,
          },
          axisLabel: {
            fontSize: isMobile ? 10 : 12,
          },
        },
      ],
      series: [
        {
          name: "数据量",
          type: "bar",
          stack: "vistors",
          barWidth: isMobile ? "50%" : "60%",
          data: data.map(item => item.value),
          animationDuration,
        },
      ],
      // 移动端手势操作
      dataZoom: isMobile ? [
        {
          type: 'inside',
          start: 0,
          end: 100,
        },
        {
          start: 0,
          end: 100,
        },
      ] : [],
    });
  }

  initChart() {
    if (!this.el) return;
    this.setState({ chart: echarts.init(this.el, "macarons") }, () => {
      this.setOptions(this.props.chartData);
    });
  }

  render() {
    const { className, height, width, styles, chartData } = this.props;
    const hasData = chartData && chartData.length > 0;
    
    return (
      <div
        className={className}
        style={{
          ...styles,
          height,
          width,
          position: 'relative'
        }}
      >
        {hasData ? (
          <div
            ref={(el) => (this.el = el)}
            style={{
              height: '100%',
              width: '100%',
            }}
          />
        ) : (
          <NoData />
        )}
      </div>
    );
  }
}

export default connect((state) => state.app)(BarChart);
