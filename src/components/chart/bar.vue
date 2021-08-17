<template>
  <div class="wrapper">
    <div class="title">
      {{ title }}
    </div>
    <div
      class="legend-list"
      v-show="legend.length">
      <div
        class="legend"
        v-for="item in legend"
        :class="{disbled: disbledLegend.indexOf(item.key) !== -1}"
        @click="legendClick(item.key)"
        :key="item.key">
        <span
          :style="{ background: colors[item.key] }"
          class="legend-icon"></span>{{ item.name }}
      </div>
    </div>
    <div
      ref="container"
      class="container">
      <div
        class="list"
        @mouseenter="mouseUpItem(index)"
        v-for="(item, index) in barData"
        :key="index">
        <div class="icon">
          {{ index+1 }}
        </div>
        <div class="content">
          <p v-tooltip="true">
            {{ item.name }}
          </p>
          <div class="pregress">
            <div
              class="category"
              :style="caculateWidth(data, item)">
              <span
                v-for="category in item.series"
                :key="category.key"
                :style="caculateProgressBar(item, category)"></span>
            </div>
          </div>
        </div>
        <div class="total">
          <p>{{ item.allCount }}</p>
        </div>
        <!-- hover弹窗start -->
        <div
          class="bar-tooltip"
          :style="`top:${ isBottom? '-110px':'40px'}`">
          <div class="bar-tooltip__container">
            <h3 class="bar-tooltip__title">
              {{ item.name }}
            </h3>
            <div
              class="bar-tooltip__list"
              v-for="cat in item.series"
              :key="cat.key">
              <div class="bar-tooltip__label">
                <em
                  class="legend-icon"
                  :style="{ background: colors[cat.key] }"></em>
                <i>{{ cat.name }}</i>
              </div>
              <div class="bar-tooltip__value">
                <p>{{ cat.count }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <slot></slot>
  </div>
</template>
<script>
export default {
  name: 'BarCharts',
  props: {
    data: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: ''
    },
    legend: {
      type: Array,
      default: () => []
    },
  },
  data() {
    return {
      colors: {
        faceCount: '#5195EA',
        bodyCount: '#867FEB',
        carCount: '#EFA723',
        nonMotorCount: '#70B699',
        count: '#5195EA'
      },
      disbledLegend: [],
      isBottom: false
    };
  },
  computed: {
    barData() {
      const data = this.data.map((item) => {
        // 过滤后的真实数
        item.allCount = item.count;
        const series = item.series.filter((items) => {
          if (this.disbledLegend.indexOf(items.key) === -1) {
            return true;
          }
          // 过滤掉被禁用的
          item.allCount = ((item.allCount * 1000) - (items.count * 1000)) / 1000;
          return false;
        });
        return {
          ...item,
          series
        };
      });

      return data.sort((a, b) => b.allCount - a.allCount);
    }
  },
  methods: {
    // 计算父级宽度
    caculateWidth(data, current) {
      const max = data.map((item) => item.allCount).sort((a, b) => b - a);

      const width = `${(current.allCount / max[0]) * 100}%`;
      return {
        width
      };
    },
    // 计算每一个栏目的宽度
    caculateProgressBar(data, current) {
      const denominator = data.allCount;
      const numerator = current.count;
      console.log(denominator, numerator);
      console.log(numerator / denominator);
      const width = `${(numerator / denominator) * 100}%`;
      console.log(width);
      return {
        width,
        backgroundColor: this.colors[current.key]
      };
    },
    /**
     * 点击legend
     */
    legendClick(key) {
      const index = this.disbledLegend.indexOf(key);
      if (index === -1) {
        this.disbledLegend.push(key);
      } else {
        this.disbledLegend.splice(index, 1);
      }
    },
    /**
     * 鼠标移上节点
     */
    mouseUpItem(index) {
      const { clientHeight } = this.$refs.container;

      const height = this.data.length * 51;
      // 如果是贴底的节点
      this.isBottom = false;
      if (clientHeight - height < 150) {
        // 最后几个tootip需要贴底
        if (index >= this.data.length - Math.ceil((height + 150 - clientHeight) / 51)) {
          this.isBottom = true;
        }
      }
    }
  }
};
</script>
<style lang="scss" scoped>
  .legend-list {
    display: flex;
    border-bottom: 1px solid rgba(153, 153, 153, .2);
    height: 34px;
    align-items: center;
    padding: 0 20px;
  }
  .legend {
    display: flex;
    align-items: center;
    flex: 1;
    cursor: pointer;
    user-select:none;
    &.disbled {
      color: #999999 !important;
      .legend-icon {
        background: #999999 !important;
      }
    }
  }
  .legend-icon {
    width: 10px;
    height: 10px;
    display: block;
    background: #5195EA;
    margin-right: 4px;
  }
  .bar-tooltip {
    width: 180px;
    display: none;
    background-color: #fff;
    box-shadow: 0 2px 4px 0 rgba(13,49,81,0.20);
    border-radius: 2px;
    position: absolute;
    top: 40px;
    left: 107px;
    z-index: 2;
    .bar-tooltip__container{
      padding: 12px;
      .bar-tooltip__title{
        font-size: 12px;
        color: #435068;
        line-height: 18px;
        text-align: left;
      }
      .bar-tooltip__list{
        margin-top: 12px;
        display: flex;
        justify-content: space-between;
        align-content: center;
        align-items: center;
        .bar-tooltip__label{
          display: flex;
          justify-content: flex-start;
          align-content: center;
          align-items: center;
          >i {
            font-size: 12px;
            color: #869ABB;
            font-style: normal;
          }
        }
        .bar-tooltip__value {
          >p {
              font-size: 12px;
              color: #435068;
              letter-spacing: 0;
              text-align: right;
              line-height: 14px;
            }
          }
        }
    }
  }
  .wrapper{
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    .title {
      color: #869ABB;
      font-size: 12px;
      padding-left: 20px;
      padding-top: 8px;
    }
    .container {
      padding: 11px 0 11px 0;
      flex: 1;
      overflow-y: auto;
      .list {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        align-content: center;
        padding-bottom: 12px;
        padding-left: 20px;
        padding-right: 20px;
        box-sizing: border-box;
        position: relative;
        cursor: pointer;
        position: relative;
        &::after {
          content: '';
          width: calc(100% - 40px);
          height: 1px;
          background:  rgba(153, 153, 153, .2);
          position: absolute;
          bottom: 11px;
          left: 20px;
        }
        &:hover {
          background: #F3F4F8;
          .bar-tooltip {
            display: block;
          }
        }
        &:first-child{
          margin-top: 0
        }
        .icon {
          width: 26px;
          font-size: 18px;
          color: #435068;
          letter-spacing: 0;
          text-align: center;
          font-family: HEMIHEAD;
          padding-top: 10px;
        }
        .content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          >p {
            font-size: 12px;
            color: #435068;
            padding-top: 7px;
            width: 225px;
          }
          .pregress {
            height: 10px;
            width: 253px;
            transform: scaleY(-1);
            background-color:rgba(134, 154, 187, .12);
            .category {
              display: flex;
              justify-content: flex-start;
              align-items: center;
              align-content: center;
              min-width: 5px;
              >span {
                display: flex;
                height: 10px;
                margin-right: 1px;
                &:last-child{
                  margin-right: 0;
                }
              }
            }
          }
        }
        .total {
          position: absolute;
          right: 20px;
          top: 5px;
          >p {
            font-size: 14px;
            color: #435068;
            font-family: HEMIHEAD;
          }
        }
      }
    }
  }
</style>
