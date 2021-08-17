import { i18n } from '@/utils/i18n.utils';
import _ from 'lodash';

export default {
  /**
   * @param {Object} data 数据源 data.x X轴数据 data.y Y轴数据
   * @param {String} formatter tooltip 模板
   */
  line: (data = { x: [], y: [] }, formatter = '{b}: {c}') => ({
    tooltip: {
      formatter
    },
    title: {
      subtext: i18n.t('单位: 个'),
      subtextStyle: {
        color: '#999999',
      },
      padding: [
        15, // 上
        0, // 右
        0, // 下
        25, // 左
      ]
    },
    animation: false,
    xAxis: {
      splitLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: '#435068',
          opacity: 0.2,
          type: 'solid',
          width: 1
        }
      },
      z: 11,
      data: data.x || []
    },
    yAxis: {
      type: 'value',
      axisTick: {
        show: false
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
          opacity: 0.1,
          color: '#435068'
        }
      },
      axisLabel: {
        color: '#999999'
      },
      z: 10
    },
    grid: {
      top: 55,
      left: 25,
      right: 30,
      bottom: 20
    },
    series: [
      {
        type: 'line',
        symbol: 'none',
        itemStyle: {
          normal: {
            color: '#3895F0'
          }
        },
        areaStyle: {
          normal: {
            color: {
              offset: 0,
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0, color: '#3895F0' // 0% 处的颜色
              }, {
                offset: 1, color: '#ffffff' // 100% 处的颜色
              }],
            }
          }
        },
        data: data.y || []
      }
    ]
  }),
  pie: (data) => ({
    tooltip: {
      trigger: 'item',
      show: true,
      formatter: '{b}<br/>{c}: {d}%'
    },
    legend: {
      orient: 'horizontal',
      right: 20,
      top: 10,
      icon: 'rect',
      selectedMode: false,
      itemWidth: 10,
      padding: 0,
      itemHeight: 6,
      itemGap: 10,
      textStyle: {
        color: '#999999',
        fontSize: 12
      }
    },
    series: {
      hoverAnimation: true,
      hoverOffset: 15,
      radius: ['35%', '55%'],
      center: ['50%', '50%'],
      label: {
        show: true,
        formatter: '{d}%',
        color: '#435068'
      },
      labelLine: {
        normal: {
          show: true,
          lineStyle: {
            color: '#999999'
          }
        }
      },
      data
    }
  }),
  /**
   * @param {Object} data 数据源 data.x X轴数据 data.y Y轴数据
   * @param {String} formatter tooltip 模板
   */
  histogram: (data = { x: [], y: [] }, formatter = '{b}: {c}') => {
    const maxNumber = _.round(_.max(data.x) * 1.5, -1) || 10; // 取最大值
    const max = data.max || 7;
    return {
      title: {
        subtext: i18n.t('单位: 个'),
        subtextStyle: {
          color: '#999999',
        },
        padding: [
          15, // 上
          0, // 右
          0, // 下
          25, // 左
        ]
      },
      dataZoom: [
        {
          type: 'slider',
          show: data.x.length > (max),
          xAxisIndex: 0,
          left: 25,
          bottom: 20,
          showDetail: false,
          showDataShadow: false,
          backgroundColor: '#f3f3f3',
          borderColor: '#ffffff',
          handleSize: 0,
          right: 30,
          zoomLock: true,
          height: 8, // TODO echart官方文档上木有对外暴露
          handleStyle: {
            color: '#C7CED8'
          },
          maxValueSpan: max - 1,
          minValueSpan: max - 1
        }
      ],
      animation: false,
      yAxis: {
        type: 'value',
        axisTick: {
          show: false
        },
        max: maxNumber,
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
            opacity: 0.1,
            color: '#435068'
          }
        },
        axisLabel: {
          color: '#999999'
        },
        z: 8
      },
      xAxis: {
        splitLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          interval: 0,
          formatter(value) {
            // 10 6 这些你自定义就行
            const v = `${value.substring(0, 10)}...`;
            return value.length > 10 ? v : value;
          }
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: '#435068',
            opacity: 0.2,
            type: 'solid',
            width: 1
          }
        },
        z: 10,
        data: data.y
      },
      grid: {
        top: 55,
        left: 25,
        right: 30,
        bottom: 46
      },
      tooltip: {
        formatter
      },
      series: [
        {
          type: 'bar',
          stack: 'chart',
          itemStyle: {
            color: data.color || '#8487FF'
          },
          data: data.x,
        },
        {
          type: 'bar',
          stack: 'chart',
          silent: true,
          barMaxWidth: 100,
          barMinWidth: 100,
          itemStyle: {
            color: 'rgba(76,105,153,0.10)',
            opactiy: 0.1
          },
          data: _.map(data.x, (val) => maxNumber - val)
        }
      ]
    };
  },
  /**
   * @param {Object} data 数据源 data.x X轴数据 data.y Y轴数据
   * @param {String} formatter tooltip 模板
   */
  bar: (data = { x: [], y: [] }, formatter = '{b}: {c}') => {
    const maxNumber = _.round(_.max(data.x) * 1.2, -1) || 10; // 取最大值
    const interval = Math.ceil(maxNumber / 6);
    return {
      tooltip: {
        formatter
      },
      title: {
        subtext: i18n.t('单位: 个'),
        subtextStyle: {
          color: '#999999',
        },
        padding: [
          15, // 上
          0, // 右
          0, // 下
          10, // 左
        ]
      },
      animation: false,
      xAxis: {
        position: 'top',
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
            opacity: 0.1,
            color: '#435068'
          }
        },
        splitNumber: 4,
        minInterval: interval,
        axisLine: {
          show: true,
          lineStyle: {
            color: '#435068',
            opacity: 0.2,
            type: 'solid',
            width: 1
          }
        },
        max: maxNumber,
        axisTick: {
          show: false
        },
        z: 10
      },
      yAxis: {
        axisTick: {
          show: false
        },
        axisLabel: {
          formatter(value) {
            // 10 6 这些你自定义就行
            const v = `${value.substring(0, 6)}...`;
            return value.length > 6 ? v : value;
          }
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: '#435068',
            opacity: 0.2,
            type: 'solid',
            width: 1
          }
        },
        inverse: true,
        z: 11,
        data: data.y
      },
      grid: {
        top: 25,
        left: 5,
        right: 30,
        bottom: 20
      },
      dataZoom: [
        {
          type: 'slider',
          show: data.x.length > 8,
          yAxisIndex: 0,
          right: 10,
          bottom: 18,
          showDetail: false,
          showDataShadow: false,
          backgroundColor: '#f3f3f3',
          borderColor: '#ffffff',
          handleSize: 0,
          top: 42,
          zoomLock: true,
          width: 8, // TODO echart官方文档上木有对外暴露
          handleStyle: {
            color: '#C7CED8'
          },
          maxValueSpan: 8,
          minValueSpan: 8
        }
      ],
      series: [
        {
          type: 'bar',
          itemStyle: {
            normal: {
              color: '#41A8F7',
            }
          },
          barMaxWidth: 30,
          barMinWidth: 30,
          stack: 'chart',
          label: {
            normal: {
              show: true,
              position: 'right',
              fontFamily: 'HEMIHEAD'
            }
          },
          data: data.x
        },
        {
          type: 'bar',
          stack: 'chart',
          silent: true,
          itemStyle: {
            normal: {
              color: 'rgba(76,105,153,0.10)',
            },
          },
          data: _.map(data.x, (val) => maxNumber - val)
        }
      ]
    };
  }
};
