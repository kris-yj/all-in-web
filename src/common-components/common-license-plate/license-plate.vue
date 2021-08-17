<template>
  <div
    class="common-license-plate"
    v-if="plateNumber && plateType">
    <!-- 车牌号详细显示: -->
    <div
      :class="['car-number-wrap', typeof size === 'string' ? size: '', plateType,row]"
      :style="carNumberStyle">
      <div class="car-number-inner">
        <span>{{ plateNumber.substr(0,1) }}<span class="blank"></span>{{ plateNumber.substr(1,1) }}</span>
        <span>{{ plateNumber.substr(2) }}</span>
      </div>
    </div>
    <div
      v-if="canCopy"
      :class="['copy-text', typeof size === 'string' ? size : '']"
      :style="copyButtonStyle"
      @click="copyPlateNumberSuccess(plateNumber)">
      {{ $t("复制") }}
    </div><!-- i18n: 复制 -->
  </div>
  <div
    class="common-license-plate"
    v-else-if="plateNumber && !plateType">
    <div
      class="non-motor-kunlun"
      :style="carNumberStyle">
      {{ plateNumber }}
    </div>
    <div
      v-if="canCopy"
      :class="['copy-text', typeof size === 'string' ? size : '']"
      :style="copyButtonStyle"
      @click="copyPlateNumberSuccess(plateNumber)">
      {{ $t("复制") }}
    </div><!-- i18n: 复制 -->
  </div>
  <div
    v-else
    class="car-number-wrap car-nonumber">
    <div class="car-number-inner">
    </div>
  </div>
</template>

<script>
// const LicencePlateObj = {
//   0: 'black',
//   1: 'white',
//   5: 'blue',
//   6: 'yellow',
//   7: 'green',
//   20: 'small-new-energy',
//   21: 'large-new-energy',
//   22: 'non-motor'
// };
export default {
  name: 'CommonLicensePlate',
  props: {
    // 车牌号
    plateNumber: {
      type: String,
      default: ''
    },
    // 车牌类别
    plateType: {
      type: String,
      default: ''
    },
    row: {
      type: String,
      default: 'one_row'
    },
    // 是否可复制
    canCopy: {
      type: Boolean,
      default: false,
    },
    // 传入样式对象或者'small' 小号样式
    size: {
      type: [Object, String],
      default: () => {}
    }
  },
  computed: {
    copyButtonStyle() {
      return typeof this.size === 'object' ? {
        'left': this.size.left,
        'line-height': this.size['line-height']
      } : '';
    },
    /**
     * 车牌形状大小
     */
    carNumberStyle() {
      return typeof this.size === 'object'
        ? {
          'width': this.size.width || 'auto',
          'height': this.size.height || 'auto',
          'font-size': this.size['font-size'] || 'inherit'
        } : '';
    },
  },
  methods: {
    copyPlateNumberSuccess(text) {
      this.$clipboard(text).then(() => {
        this.$message({
          message: this.$t('复制成功'),
          type: 'success',
          showClose: true,
        });
      }, () => {
        this.$message({
          type: 'error',
          message: this.$t('复制失败')
        });
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.common-license-plate {
  position: relative;
  letter-spacing: 0.5px;
  .copy-text.small {
    left: 85px;
    line-height: 24px;
    font-size: 12px;
  }
  .copy-text {
    width: 50px;
    cursor: pointer;
    position: absolute;
    left: 210px;
    top: 0;
    line-height: 60px;
    text-align: center;
    color: rgb(33, 83, 155);
  }
  .car-number-wrap.mini {
    width: 76px;
    height: 18px;
    font-size: 12px;
    line-height: 12px;
  }
  .car-number-wrap.small {
    width: 90px;
    height: 24px;
    font-size: 12px;
  }
  .car-number-wrap {
    flex: 1;
    border: 1px solid #bac3cb;
    position: relative;
    width: 100%;
    height: 45px;
    box-sizing: border-box;
    font-size: 20px;
    .car-number-inner {
      display: table;
      height: 100%;
      width: 100%;
      padding-left: 5px;
      padding-right: 5px;
      background: #bac3cb;
      border: 1px solid #fff;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      white-space: nowrap;
      justify-content: center;
      span:first-child {
        text-align: right;
      }
      span:last-child {
        text-align: left;
        overflow: hidden;
        white-space: nowrap;
      }
      .blank {
        display: none;
      }
    }
  }
}
.non-motor-kunlun {
  font-weight: 700;
  line-height: 1.6;
}
.car-number-wrap.small.two_rows {
  width: 70px;
  height: 30px;
  font-size: 12px;
  .car-number-inner {
    display: flex;
    flex-direction: column;
    .blank {
      width: 10px;
      display: inline-block;
    }
  }
}

.car-number-wrap.black {
  border-color: #000;
  .car-number-inner {
    background: #000;
    color: #fff;
  }
}
.car-number-wrap.blue {
  border-color: #011b78;
  .car-number-inner {
    background: #011b78;
    color: #fff;
  }
}
.car-number-wrap.green {
  border-color: #4baf78;
  .car-number-inner {
    background: #4baf78;
    color: #fff;
  }
}
.car-number-wrap.yellow {
  border-color: #ffc936;
  .car-number-inner {
    background: #ffc936;
    color: #000;
    border-color: #000;
  }
}
.car-number-wrap.white {
  border-color: #fff;
  .car-number-inner {
    background: #fff;
    border-color: #000;
    color: #000;
  }
}
.car-number-wrap.small-new-energy {
  border-image: linear-gradient(180deg, #e5e0e4 0%, #84c979 25%, #7bc975 100%) 1
    1;
  .car-number-inner {
    background: linear-gradient(180deg, #e5e0e4 0%, #84c979 25%, #7bc975 100%);
    color: #000;
    border-color: #000;
  }
}

.car-number-wrap.car-nonumber {
  border-color: #bac3cb;
  .car-number-inner {
    background: #bac3cb;
  }
}
.car-number-wrap.large-new-energy {
  border-color: #ffc936;
  .car-number-inner {
    background: #ffc936;
    color: #000;
    border-color: #000;
    span:first-child {
      padding-right: 2px;
      text-align: center;
    }
    span:last-child {
      background: #7fc977;
      text-align: center;
    }
  }
}
.car-number-wrap.non-motor {
  border-color: rgb(99, 107, 122);
  .car-number-inner {
    background: rgb(99, 107, 122);
    color: #ffffff;
    border-color: rgb(203, 206, 211);
    span:first-child {
      padding-right: 2px;
      text-align: right;
    }
    span:last-child {
      background: rgb(99, 107, 122);
      text-align: left;
    }
  }
}
</style>
