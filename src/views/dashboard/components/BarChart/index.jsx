import React, { Component } from "react";
import { PropTypes } from "prop-types";
import { connect } from "react-redux";
import echarts from "@/lib/echarts";
import { debounce } from "@/utils";
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
      },
      grid: {
        top: 10,
        left: "2%",
        right: "2%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: [
        {
          type: "category",
          data: data.map(item => item.name),
          axisTick: {
            alignWithLabel: true,
          },
        },
      ],
      yAxis: [
        {
          type: "value",
          axisTick: {
            show: false,
          },
        },
      ],
      series: [
        {
          name: "数据量",
          type: "bar",
          stack: "vistors",
          barWidth: "60%",
          data: data.map(item => item.value),
          animationDuration,
        },
      ],
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
