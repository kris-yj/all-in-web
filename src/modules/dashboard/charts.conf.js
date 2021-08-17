export const extraCssText = 'box-shadow: 2px 2px 4px 0 rgba(13,49,81,0.20);border-radius: 2px';
/**
 *  折线图tooltip弹框
 * @param { label } 名称
 * @param { value } 值
 * @returns string
 */
function lineTooltipFormatter(label, value, color) {
  const htmlStr = `
  <div class='tooltip-wrapper'>
      <div class="tooltip-body">
        <div class="tooltip-title">
          <p>${label}</p>
        </div>
        <div class="tooltip-content">
          <div class="tooltip-content__icon" style="background:${color}"> 
          </div>
          <div class="tooltip-content__other">
           <span>${value}</span>
          </div>
        </div>
      </div>
    </div>
  `;
  return htmlStr;
}
/**
 *  饼图tooltip弹框
 * @param { label } 名称
 * @param { percent } 百分比
 * @param { color } 每种分类所对应的颜色
 * @param { value } 值
 * @returns string
 */
function pieTooltipFormatter(label, percent, value, color) {
  const htmlStr = `
  <div class='pie-wrapper'>
      <div class="pie-body">
        <div class="pie-title">
          <p>${label}</p>
        </div>
        <div class="pie-content">
          <div class="pie-content__icon" style="background-color:${color}"></div>
          <div class="pie-content__number">
            <span>${percent}%</span>
          </div>
          <div class="pie-content__other">
            <span>${value}</span>
          </div>
        </div>
      </div>
    </div>
  `;
  return htmlStr;
}
/**
 * 柱状图tooltip弹窗html拼接
 * @param { stackArr } Array
 * @returns string
 */
function histogramHtmlSplit(stackArr) {
  let html = '';
  stackArr.forEach((item) => {
    html += `
    <div class="histogram-tooltip__list">
      <div class="histogram-tooltip__label"></div>
      <div class="histogram-tooltip__value">
        <p>${item.value}</p>
      </div>
    </div>
    `;
  });
  return html;
}
/**
 * 柱状图tooltip弹窗
 * @param { stackArr } Array
 * @returns string
 */
function histogramTooltip(stackArr) {
  const html = `
  <div class="histogram-tooltip">
      <div class="histogram-tooltip__container">
        <h3 class="histogram-tooltip__title">${stackArr[0].name}</h3>
        ${histogramHtmlSplit(stackArr)}
    </div>
  </div>
  `;
  return html;
}
/**
 * 折线图tooltip弹框
 */
const lineFormatter = (params) => {
  if (Array.isArray(params)) {
    const tooltipData = params[0];
    const color = tooltipData.borderColor;
    const html = lineTooltipFormatter(tooltipData.name, tooltipData.value, color);
    return html;
  }
  return '{b}: {c}';
};
/**
 * 饼图tooltip弹框
 */
const pieFormatter = (params) => pieTooltipFormatter(params.name, params.percent, params.value, params.data.color1);
/**
 * histogram柱状图tooltip弹窗
 * @param { params } 每个x轴多对应的数值
 */
export const histogramTooltipFormatter = (params) => {
  if (Array.isArray(params)) {
    const html = histogramTooltip(params);
    return html;
  }
  return '{b}: {c}';
};
// 饼图
export const pieOpts = (data) => ({
  tooltip: {
    trigger: 'item',
    padding: 0,
    borderWidth: 0,
    borderColor: 'transport',
    formatter: pieFormatter,
  },
  series: {
    minAngle: 35,
    minShowLabelAngle: 35,
    avoidLableOverlap: true,
    hoverAnimation: true,
    hoverOffset: 15,
    radius: ['40%', '60%'],
    center: ['50%', '55%'],
    itemStyle: {
      borderWidth: 1,
      borderColor: 'rgba(0, 42, 156, .94)',
      color: (params) => ({
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [{
          offset: 0, color: `${params.data.color1}` // 0% 处的颜色
        }, {
          offset: 1, color: `${params.data.color2}` // 100% 处的颜色
        }],
      })
    },
    label: {
      show: true,
      formatter: '{label|{b}}\n{value|{d}%}',
      rich: {
        label: {
          fontSize: 12,
          color: '#B5F3FF',
        },
        value: {
          fontSize: 18,
          color: '#D6F4FF',
          fontWeight: 600,
          fontFamily: 'HEMIHEAD',
        }
      }
    },
    data
  }
});

// 折线图
export const lineOpts = (data, startColor, endColor) => ({
  tooltip: {
    trigger: 'axis',
    padding: 0,
    borderWidth: 0,
    borderColor: 'transport',
    formatter: lineFormatter,
  },
  xAxis: {
    type: 'category',
    boundaryGap: true,
    axisLine: {
      show: true,
      lineStyle: {
        show: true,
        color: 'rgba(255, 255, 255, .4)'
      }
    },
    axisTick: {
      show: true,
      alignWithLabel: true,
      lineStyle: {
        color: '#fff',
        type: 'solid',
        width: 1,
        opacity: 0.24
      }
    },
    axisLabel: {
      color: '#B5F3FF'
    },
    splitLine: {
      show: false,
    },
    z: 11,
    data: data.x,
  },
  yAxis: {
    type: 'value',
    splitLine: {
      show: true,
      lineStyle: {
        color: '#2C429B',
        opacity: 0.9
      }
    },
    axisLabel: {
      color: '#B5F3FF'
    },
    z: 0
  },
  grid: {
    top: 16,
    left: 0,
    right: 30,
    bottom: 0
  },
  series: [{
    type: 'line',
    data: data.y || [],
    smooth: false,
    symbol: 'circle',
    symbolSize: 3,
    itemStyle: {
      color: '#2234A7',
      borderColor: `${startColor}`
    },
    lineStyle: {
      width: 3,
      color: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [{
          offset: 0, color: `${startColor}` // 0% 处的颜色
        }, {
          offset: 1, color: `${endColor}` // 100% 处的颜色
        }],
        global: false // 缺省为 false
      }
    }
  }
  ]
});
export const histogramOpts = (data) => {
  const max = data.max || 5;
  return {
    tooltip: {
      trigger: 'axis',
      padding: 0,
      borderWidth: 0,
      borderColor: 'transport',
      formatter: histogramTooltipFormatter,
      axisPointer: {
        type: 'shadow',
        shadowStyle: {
          color: 'rgba(50, 222, 255, 0.12)',
        }
      }
    },
    animation: false,
    yAxis: {
      type: 'value',
      splitLine: {
        show: true,
        lineStyle: {
          color: '#2C429B',
          opacity: 0.9,
        }
      },
      axisLabel: {
        color: '#B5F3FF'
      },
      z: 0
    },
    xAxis: {
      max,
      axisTick: {
        show: true,
        alignWithLabel: true,
        lineStyle: {
          show: true,
          color: 'rgba(255, 255, 255, .4)'
        }
      },
      axisLine: {
        show: true,
        lineStyle: {
          show: true,
          color: 'rgba(255, 255, 255, .4)'
        }
      },
      axisLabel: {
        color: '#B5F3FF'
      },
      splitLine: {
        show: false
      },
      boundaryGap: true,
      z: 11,
      data: data.x,
    },
    grid: {
      top: 20,
      left: 0,
      right: 30,
      bottom: 0
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
    series: [
      {
        type: 'bar',
        barWidth: '24px',
        data: data.y,
        label: {
          show: true,
          position: 'top',
          color: '#E3F4FF',
          fontSize: 16,
          fontWeight: 600
        },
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: '#19B6FF' // 0% 处的颜色
            }, {
              offset: 1, color: '#18D5FF' // 100% 处的颜色
            }],
            global: false // 缺省为 false
          }
        }
      }
    ]
  };
};
