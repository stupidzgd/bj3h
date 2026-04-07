import React, { Component } from "react";
import { PropTypes } from "prop-types";
import { connect } from "react-redux";
import echarts from "@/lib/echarts";
import { debounce } from "@/utils";

class RaddarChart extends Component {
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
    // 确保chart对象已经初始化
    if (!this.state.chart) {
      return;
    }
    
    const animationDuration = 3000;
    const data = chartData && chartData.length > 0 ? chartData : [];
    
    try {
      // 过滤掉无效数据，确保每个item都有name和value属性
      const validData = data.filter(item => item && item.name && typeof item.value === 'number');
      
      if (validData.length === 0) {
        // 没有数据时显示空图表
        this.state.chart.setOption({
          tooltip: {
            trigger: "axis",
            axisPointer: {
              type: "shadow",
            },
          },
          radar: {
            radius: "66%",
            center: ["50%", "42%"],
            splitNumber: 8,
            splitArea: {
              areaStyle: {
                color: "rgba(127,95,132,.3)",
                opacity: 1,
                shadowBlur: 45,
                shadowColor: "rgba(0,0,0,.5)",
                shadowOffsetX: 0,
                shadowOffsetY: 15,
              },
            },
            indicator: [],
          },
          legend: {
            left: "center",
            bottom: "10",
            data: ["科室贡献"],
          },
          series: [],
        });
        return;
      }
      
      // 确保至少有2个数据点，避免ECharts雷达图布局错误
      if (validData.length < 2) {
        this.state.chart.setOption({
          tooltip: {
            trigger: "axis",
            axisPointer: {
              type: "shadow",
            },
          },
          radar: {
            radius: "66%",
            center: ["50%", "42%"],
            splitNumber: 8,
            splitArea: {
              areaStyle: {
                color: "rgba(127,95,132,.3)",
                opacity: 1,
                shadowBlur: 45,
                shadowColor: "rgba(0,0,0,.5)",
                shadowOffsetX: 0,
                shadowOffsetY: 15,
              },
            },
            indicator: [],
          },
          legend: {
            left: "center",
            bottom: "10",
            data: ["科室贡献"],
          },
          series: [],
        });
        return;
      }
      
      const maxValue = Math.max(...validData.map(item => item.value)) * 1.2;
      
      // 构建雷达图数据，确保格式正确
      const radarData = validData.map(item => item.value);
      
      this.state.chart.setOption({
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
        },
        radar: {
          radius: "66%",
          center: ["50%", "42%"],
          splitNumber: 8,
          splitArea: {
            areaStyle: {
              color: "rgba(127,95,132,.3)",
              opacity: 1,
              shadowBlur: 45,
              shadowColor: "rgba(0,0,0,.5)",
              shadowOffsetX: 0,
              shadowOffsetY: 15,
            },
          },
          indicator: validData.map(item => ({
            name: item.name,
            max: maxValue
          })),
        },
        legend: {
          left: "center",
          bottom: "10",
          data: ["科室贡献"],
        },
        series: [
          {
            type: "radar",
            symbolSize: 0,
            areaStyle: {
              normal: {
                shadowBlur: 13,
                shadowColor: "rgba(0,0,0,.2)",
                shadowOffsetX: 0,
                shadowOffsetY: 10,
                opacity: 1,
              },
            },
            data: [
              {
                value: radarData,
                name: "科室贡献",
              },
            ],
            animationDuration,
          },
        ],
      });
    } catch (error) {
      console.warn('设置图表选项时出错:', error);
      // 出错时显示空图表
      try {
        this.state.chart.setOption({
          tooltip: {
            trigger: "axis",
            axisPointer: {
              type: "shadow",
            },
          },
          radar: {
            radius: "66%",
            center: ["50%", "42%"],
            splitNumber: 8,
            splitArea: {
              areaStyle: {
                color: "rgba(127,95,132,.3)",
                opacity: 1,
                shadowBlur: 45,
                shadowColor: "rgba(0,0,0,.5)",
                shadowOffsetX: 0,
                shadowOffsetY: 15,
              },
            },
            indicator: [],
          },
          legend: {
            left: "center",
            bottom: "10",
            data: ["科室贡献"],
          },
          series: [],
        });
      } catch (innerError) {
        console.warn('显示空图表时出错:', innerError);
      }
    }
  }

  initChart() {
    if (!this.el) return;
    try {
      this.setState({ chart: echarts.init(this.el, "macarons") }, () => {
        this.setOptions(this.props.chartData);
      });
    } catch (error) {
      console.warn('初始化图表时出错:', error);
    }
  }

  render() {
    const { className, height, width, styles } = this.props;
    return (
      <div
        className={className}
        ref={(el) => (this.el = el)}
        style={{
          ...styles,
          height,
          width,
        }}
      />
    );
  }
}

export default connect((state) => state.app)(RaddarChart);
