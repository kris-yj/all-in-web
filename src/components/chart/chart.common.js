import _ from 'lodash';
// import html2canvas from 'html2canvas';
import domtoimage from 'dom-to-image';

const textFormatter = (series = [], name, isLine = false) => {
  let html = `<div style="background: #FFFFFF;box-shadow: 0 2px 4px 0 rgba(13,49,81,0.20);border-radius: 2px;padding:12px;min-width:80px">
  <div style="font-size: 12px;color: #869ABB;">
    <p>${name}</p>
  </div>`;
  for (let i = 0; i < series.length; i += 1) {
    html += `<div style="display:flex;align-items: center;font-size: 12px;color: #435068;">
    <div style="background:${series[i].color};${isLine ? 'width:12px;height:4px;' : 'width:10px;height:10px;'}margin-right:10px">
    </div>
    <span style="margin-right:${series[i].label ? '10px' : 0}">${series[i].label || ''}</span>
    <span>${series[i].value}</span>
  </div>`;
  }

  html += '</div>';
  return html;
};

export default {
  /**
   * @param {Object} data 数据源 data.x X轴数据 data.y Y轴数据
   * @param {String} formatter tooltip 模板
   */
  line: ({
    x = [],
    y = [],
    title,
    label = '',
    isArea = true,
    isSymbol = false,
    isZoom = false,
    max = 10,
    isItalic = false
  }) => {
    const options = {
      tooltip: {
        padding: 0,
        formatter: (params) => {
          const tooltipData = params[0];
          params[0].label = label;
          return textFormatter(params, tooltipData.name, true);
        },
      },

      title: {
        subtext: title,
        subtextStyle: {
          color: '#869ABB',
        },
        padding: [
          0, // 上
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
          show: true
        },
        axisLabel: {
          rotate: isItalic ? 45 : 0
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: '#869ABB',
            opacity: 1,
            type: 'solid',
            width: 1
          }
        },
        data: x || []
      },
      yAxis: {
        type: 'value',
        axisTick: {
          show: false
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: 'solid',
            opacity: 1,
            color: '#F0F2F3'
          }
        },
        minInterval: 1,
        axisLabel: {
          color: '#869ABB',
        },
      },
      grid: {
        top: 55,
        left: 25,
        right: 30,
        bottom: isZoom ? 30 : 15
      },
      series: [
        {
          type: 'line',
          lineStyle: {
            width: 4,
            color: '#5195EA'
          },
          symbol: isSymbol ? 'emptyCircle' : 'none',
          itemStyle: {
            normal: {
              color: '#3895F0'
            }
          },
          areaStyle: {
            normal: {
              opacity: isArea ? 1 : 0,
              color: {
                offset: 0,
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                  offset: 0, color: 'rgba(27,99,255,0.1)' // 0% 处的颜色
                }, {
                  offset: 1, color: 'rgba(27,99,255,0.1)' // 100% 处的颜色
                }],
              }
            }
          },
          data: y || []
        }
      ]
    };
    if (x.length > (max) && isZoom) {
      options.dataZoom = [
        {
          type: 'slider',
          show: true,
          xAxisIndex: 0,
          left: 25,
          bottom: 12,
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
      ];
    }
    return options;
  },
  pie: ({
    data = [],
    title,
    color = ['#5195EA', '#867feb', '#efa723', '#70b699', '#55b0d5', '#6b82e4', '#c17adc', '#e2d507', '#abd34b', '#a783f2'],
    center = ['50%', '50%'],
  }) => ({
    tooltip: {
      trigger: 'item',
      show: true,
      padding: 0,
      formatter: (params) => textFormatter([{ ...params, label: `${params.percent}%` }], params.name,),
    },
    title: {
      subtext: title,
      subtextStyle: {
        color: '#869ABB',
      },
      padding: [
        0, // 上
        0, // 右
        0, // 下
        25, // 左
      ]
    },
    legend: {
      show: false
    },
    color,
    series: {
      type: 'pie',
      hoverAnimation: true,
      hoverOffset: 15,
      radius: ['30%', '45%'],
      center,
      label: {
        show: true,
        formatter: '{b}\n{d}%',
        padding: [5, 5, 0, 0],
        fontFamily: 'HEMIHEAD',
      },
      data
    }
  }),
  /**
   * @param {Object} data 数据源 data.x X轴数据 data.y Y轴数据
   * @param {String} formatter tooltip 模板
   */
  histogram: ({
    x = [],
    y = [],
    color = '#5195EA',
    max = 5,
    title,
    limit = 8,
    isZoom = false
  }) => {
    const options = {
      max,
      title: {
        subtext: title,
        subtextStyle: {
          color: '#869ABB',
        },
        padding: [
          0, // 上
          0, // 右
          0, // 下
          25, // 左
        ]
      },
      animation: false,
      yAxis: {
        type: 'value',
        axisTick: {
          show: false
        },
        minInterval: 1,
        // max: maxNumber,
        splitLine: {
          show: true,
          lineStyle: {
            type: 'solid',
            opacity: 1,
            color: '#F0F2F3'
          }
        },
        axisLabel: {
          color: '#869ABB'
        },
      },
      xAxis: {
        splitLine: {
          show: false
        },
        axisLabel: {
          interval: 0,
          formatter(value) {
            // 10 6 这些你自定义就行
            const v = `${value.substring(0, limit - 1)}...`;
            return (value.length > limit) && y.length >= max - 1 ? v : value;
          }
        },
        axisTick: {
          show: true,
          alignWithLabel: true
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: '#869ABB',
            opacity: 1,
            type: 'solid',
            width: 1
          }
        },
        data: y
      },
      grid: {
        top: 55,
        left: 25,
        right: 30,
        bottom: isZoom ? 30 : 15
      },
      tooltip: {
        padding: 0,
        formatter: (params) => {
          const tooltipData = params[0];
          return textFormatter(params, tooltipData.name);
        },
      },
      series: [
        {
          type: 'bar',
          stack: 'chart',
          barMaxWidth: 30,
          barMinWidth: 30,
          itemStyle: {
            color
          },
          data: x,
        }
      ]
    };
    if (x.length > (max) && isZoom) {
      this.dataZoom = [
        {
          type: 'slider',
          show: true,
          xAxisIndex: 0,
          left: 25,
          bottom: 12,
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
      ];
    }
    return options;
  },
  /**
   * @param {Object} data 数据源 data.x X轴数据 data.y Y轴数据
   * @param {String} formatter tooltip 模板
   */
  bar: (
    {
      x = [],
      y = [],
      title
    }
  ) => {
    const maxNumber = _.round(_.max(x) * 1.2, -1) || 10; // 取最大值
    const interval = Math.ceil(maxNumber / 6);
    return {
      tooltip: {
        formatter: (params) => {
          const tooltipData = params[0];
          return textFormatter(params, tooltipData.name);
        },
      },
      title: {
        subtext: title,
        subtextStyle: {
          color: '#869ABB',
        },
        padding: [
          0, // 上
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
            type: 'solid',
            opacity: 1,
            color: '#F0F2F3'
          }
        },
        splitNumber: 4,
        minInterval: interval,
        axisTick: {
          show: true,
          alignWithLabel: true
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: '#869ABB',
            opacity: 1,
            type: 'solid',
            width: 1
          }
        },
        max: maxNumber,
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
        data: y
      },
      grid: {
        top: 25,
        left: 5,
        right: 30,
        bottom: 30
      },
      dataZoom: [
        {
          type: 'slider',
          show: x.length > 8,
          yAxisIndex: 0,
          right: 10,
          bottom: 12,
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
          data: x
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
          data: _.map(x, (val) => maxNumber - val)
        }
      ]
    };
  },
  /**
   * @param {Object} data 数据源 data.x X轴数据 data.y Y轴数据
   * @param {String} formatter tooltip 模板
   */
  stackHistogram: ({ x = { data: [], legend: [], colors: [] }, y = [], max = 5 }, title) => {
    const series = [];

    x.legend.forEach((name, index) => {
      series.push({
        name,
        type: 'bar',
        stack: 'stack',
        itemStyle: {
          normal: {
            color: x.colors[index],
          }
        },
        barMaxWidth: 30,
        barMinWidth: 30,
        data: x.data[index]
      });
    });
    return {
      legend: {
        data: x.legend,
        right: 25,
        top: 0
      },
      tooltip: {
        padding: 0,
        formatter: (params) => {
          const tooltipData = params[0];
          const tooltipSeries = params.map((item) => ({
            label: item.seriesName,
            value: item.value,
            color: item.color
          }));
          return textFormatter(tooltipSeries, tooltipData.name);
        },
      },
      title: {
        subtext: title,
        subtextStyle: {
          color: '#869ABB',
        },
        padding: [
          0, // 上
          0, // 右
          0, // 下
          25, // 左
        ]
      },
      dataZoom: [
        {
          type: 'slider',
          show: x.length > (max),
          xAxisIndex: 0,
          left: 25,
          bottom: 12,
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
        minInterval: 1,
        // max: maxNumber,
        splitLine: {
          show: true,
          lineStyle: {
            type: 'solid',
            opacity: 1,
            color: '#F0F2F3'
          }
        },
        axisLabel: {
          color: '#869ABB'
        },
      },
      xAxis: {
        splitLine: {
          show: false
        },
        axisTick: {
          show: true,
          alignWithLabel: true
        },

        axisLine: {
          show: true,
          lineStyle: {
            color: '#869ABB',
            opacity: 1,
            type: 'solid',
            width: 1
          }
        },
        axisLabel: {
          interval: 0,
          formatter(value) {
            // 10 6 这些你自定义就行
            const v = `${value.substring(0, 8)}...`;
            return value.length > 10 ? v : value;
          }
        },
        data: y
      },
      grid: {
        top: 55,
        left: 25,
        right: 30,
        bottom: 30
      },
      series
    };
  },
  /**
   *
   * @param {Object} template 父级容器
   */
  generatorImage(template, isFilterSvg = false) {
    const options = {
      bgcolor: '#fff'
    };
    if (isFilterSvg) options.filter = (node) => (node.tagName !== 'svg');

    return domtoimage.toJpeg(template, options);
  }
};
