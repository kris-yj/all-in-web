<template>
  <div
    v-loading="isLoading"
    class="attribute-template">
    <div class="attribute-template-wrap">
      <div
        ref="face"
        class="attribute-info">
        <div class="attribute-header">
          <div class="attribute-title">
            {{ $t("人脸属性统计") }}
          </div>
          <div class="attribute-select">
            <meg-select
              @change="attributeChange(formData.faceProperty.key)"
              v-model="formData.faceProperty.value">
              <!-- :disabled="!facePieOptions.series.data.length" -->
              <meg-option
                v-for="item in faceOption"
                :label="item.name"
                :value="item.attrKey"
                :key="item.attrKey"></meg-option>
            </meg-select>
          </div>
        </div>
        <div class="attribute-wrap">
          <meg-pie
            height="100%"
            :extend="facePieOptions">
            <div class="all-number">
              {{ formatNumber(facePieOptions.allNumber) }}
            </div>
            <data-empty
              :is-pie="true"
              v-show="!facePieOptions.series.data.length"></data-empty>
          </meg-pie>
        </div>
      </div>
      <div
        ref="body"
        class="attribute-info">
        <div class="attribute-header">
          <div class="attribute-title">
            {{ $t("人体属性统计") }}
          </div>
          <div class="attribute-select">
            <meg-select
              @change="attributeChange(formData.bodyProperty.key)"
              v-model="formData.bodyProperty.value">
              <!-- :disabled="!bodyPieOptions.series.data.length" -->
              <meg-option
                v-for="item in bodyOption"
                :label="item.name"
                :value="item.attrKey"
                :key="item.attrKey"></meg-option>
            </meg-select>
          </div>
        </div>
        <div class="attribute-wrap">
          <meg-pie
            height="100%"
            :extend="bodyPieOptions">
            <div class="all-number">
              {{ formatNumber(bodyPieOptions.allNumber) }}
            </div>
            <data-empty
              :is-pie="true"
              v-show="!bodyPieOptions.series.data.length"></data-empty>
          </meg-pie>
        </div>
      </div>
      <div
        ref="car"
        class="attribute-info">
        <div class="attribute-header">
          <div class="attribute-title">
            {{ $t("机动车属性统计") }}
          </div>
          <div class="attribute-select">
            <meg-select
              @change="attributeChange(formData.carProperty.key)"
              v-model="formData.carProperty.value">
              <!-- :disabled="!motorPieOptions.series.data.length" -->
              <meg-option
                v-for="item in motorOption"
                :label="item.name"
                :value="item.attrKey"
                :key="item.attrKey"></meg-option>
            </meg-select>
          </div>
        </div>
        <div class="attribute-wrap">
          <meg-pie
            height="100%"
            :extend="motorPieOptions">
            <div class="all-number">
              {{ formatNumber(motorPieOptions.allNumber) }}
            </div>
            <data-empty
              :is-pie="true"
              v-show="!motorPieOptions.series.data.length"></data-empty>
          </meg-pie>
        </div>
      </div>
      <div
        ref="non"
        class="attribute-info">
        <div class="attribute-header">
          <div class="attribute-title">
            {{ $t("非机动车属性统计") }}
          </div>
          <div class="attribute-select">
            <meg-select
              @change="attributeChange(formData.nonMotorProperty.key)"
              v-model="formData.nonMotorProperty.value">
              <!-- :disabled="!nonmotorPieOptions.series.data.length" -->
              <meg-option
                v-for="item in nonmotorOption"
                :label="item.name"
                :value="item.attrKey"
                :key="item.attrKey"></meg-option>
            </meg-select>
          </div>
        </div>
        <div class="attribute-wrap">
          <meg-pie
            height="100%"
            :extend="nonmotorPieOptions">
            <div class="all-number">
              {{ formatNumber(nonmotorPieOptions.allNumber) }}
            </div>
            <data-empty
              :is-pie="true"
              v-show="!nonmotorPieOptions.series.data.length"></data-empty>
          </meg-pie>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import DataEmpty from '@/components/chart/data-empty';
import chartOption from '@/components/chart/chart.common';

// TODO 后端嫌改动大暂时写死。
const colorMap = {
  unknown: '#989CA0', // 未知
  absence: '#989CA0', // 其他
  pink: '#E18FC2',
  purple: '#B2ABEE',
  light_blue: '#8FC4FC', // 浅蓝
  dark_blue: '#5997F2', // 深蓝
  green: '#8CD59C',
  yellow: '#FECB83',
  orange: '#FA9F6D',
  blue: '#5997F2', // 蓝色
  red: '#FFA2A2',
  gray: '#CBD0D6',
  vehicle_color_gray: '#CBD0D6', // 银灰
  white: '#E7E8EA',
  black: '#4C4C4C',
  brown: '#AA7E56',
  small_new_energy: '#9EE5AA', // 小型新能源车
  large_new_energy: '#5FB79C', // 大型新能源车
  itasha: '#82E5EB',
};
export default {
  components: {
    DataEmpty
  },
  props: {
    detectTypeOptions: {
      type: Array,
      default: () => []
    },
    isLoading: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      formData: {
        faceProperty: {
          value: '',
          key: 'faceProperty',
          code: 0
        },
        bodyProperty: {
          value: '',
          key: 'bodyProperty',
          code: 1
        },
        carProperty: {
          value: '',
          key: 'carProperty',
          code: 5
        },
        nonMotorProperty: {
          value: '',
          key: 'nonMotorProperty',
          code: 6
        }

      },
      facePieOptions: { series: { data: [] } },
      bodyPieOptions: { series: { data: [] } },
      motorPieOptions: { series: { data: [] } },
      nonmotorPieOptions: { series: { data: [] } }
    };
  },
  created() {
    this.faceOption = this.deployByType(0);
    this.bodyOption = this.deployByType(1);
    this.motorOption = this.deployByType(5);
    this.nonmotorOption = this.deployByType(6);
    // 默认选中第一个
    this.formData.faceProperty.value = this.faceOption[0].attrKey;
    this.formData.bodyProperty.value = this.bodyOption[0].attrKey;
    this.formData.carProperty.value = this.motorOption[0].attrKey;
    this.formData.nonMotorProperty.value = this.nonmotorOption[0].attrKey;
  },

  methods: {
    // 获取当前识别布控类型下属性分类
    deployByType(code) {
      const val = this.detectTypeOptions.find((item) => item.code === code);
      if (val) {
        return val.data.filter((item) => item.attrKey !== 'license_plate_text');
      }
      return [];
    },
    /**
     * 抓拍目标改变触发
     * @param {String} 当前属性类型
     */
    attributeChange(type) {
      const params = {
        params: {},
        detectType: type,
        properties: this.formData[type].value
      };
      params.params[type] = this.formData[type].value;
      this.$emit('get-attribute', params);
    },
    getData() {
      this.attributeChange('faceProperty');
      this.attributeChange('bodyProperty');
      this.attributeChange('carProperty');
      this.attributeChange('nonMotorProperty');
    },
    /**
     * 从父组件传入数据
     * @params {Array} data 数据列表
     */
    setData(data) {
      if (data.detectType === 'faceProperty') {
        this.facePieOptions = this.initPieData(data.data.faceStatistic, data.properties, this.faceOption.find((item) => item.attrKey === data.properties));
      }
      if (data.detectType === 'bodyProperty') {
        this.bodyPieOptions = this.initPieData(data.data.bodyStatistic, data.properties, this.bodyOption.find((item) => item.attrKey === data.properties));
      }
      if (data.detectType === 'carProperty') {
        this.motorPieOptions = this.initPieData(data.data.carStatistic, data.properties, this.motorOption.find((item) => item.attrKey === data.properties));
      }
      if (data.detectType === 'nonMotorProperty') {
        this.nonmotorPieOptions = this.initPieData(data.data.nonMotorStatistic, data.properties, this.nonmotorOption.find((item) => item.attrKey === data.properties));
      }
    },
    /**
     * 初始化属性统计数据
     * @params {Array} data 数据列表
     * @params {Object} type 属性类型
     */
    initPieData(data, type, types) {
      /**
       * echart 节点数据默认取value字段 先循环处理
       */
      let allNumber = 0;
      data.forEach((item) => {
        allNumber += item.count;
        item.value = item.count;
        const option = types.data.find((items) => items.code === item.code) || { name: item.code };
        item.name = option.name;
      });
      const isColor = ['body_dress_upper_color', 'body_dress_lower_color', 'vehicle_color', 'body_hat_color', 'body_shoes_color', 'license_plate_color',
      ].includes(type);
      // 自定义饼图色块颜色
      const color = data.map((item) => (colorMap[item.code] || colorMap.absence));
      const params = {
        data,
        title: '单位:个',
        center: ['50%', '65%']
      };
      if (isColor) params.color = color;
      const options = chartOption.pie(params);
      return {
        ...options,
        allNumber
      };
    },
    formatNumber(number = 0) {
      return number.toString().replace(/\d{1,3}(?=(\d{3})+$)/g, '$&,');
    },
    /**
     * 导出报表
     */
    async generatorImage() {
      const facePropertyCaptureStatisticImg = await chartOption.generatorImage(this.$refs.face, true);
      const bodyPropertyCaptureStatisticImg = await chartOption.generatorImage(this.$refs.body, true);
      const carPropertyCaptureStatisticImg = await chartOption.generatorImage(this.$refs.car, true);
      const nonMotorCaptureStatisticImg = await chartOption.generatorImage(this.$refs.non, true);
      return {
        facePropertyCaptureStatisticImg,
        bodyPropertyCaptureStatisticImg,
        carPropertyCaptureStatisticImg,
        nonMotorCaptureStatisticImg
      };
    },
  }
};
</script>

<style lang='scss' scoped>
.attribute-template {
  width: 100%;
  height: calc(100% - 56px);

  .attribute-template-wrap {
    width: 100%;
    height: 100%;
    display: flex;
    padding-bottom: 8px;
    overflow-y: auto;
    box-sizing: border-box;
    flex-wrap: wrap;
    justify-content: space-between;
    align-content: space-between;
  }
  .attribute-info {
    width: calc(50% - 5px);
    height: calc(50% - 10px);
    box-sizing: border-box;
    padding-top: 36px;
    min-height: 345px;
    margin-bottom: 10px;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    position: relative;
    .attribute-header {
      display: flex;
      justify-content: space-between;
      height: 34px;
      width: 100%;
      box-sizing: border-box;
      padding: 10px;
      position: absolute;
      top: 0;
      z-index: 1;
      .attribute-title {
        color: #435068;
        line-height: 34px;
      }
      .attribute-select {
        width: 150px;
      }
    }
    .attribute-wrap {
      flex: 1;
    }
  }
}
.all-number {
  width: 100px;
  height: 20px;
  line-height: 32px;
  font-size: 32px;
  color: #435068;
  text-align: center;
  margin-left: -56px;
  position: absolute;
  font-family: 'HEMIHEAD';
  top: 65%;
  margin-top: -16px;
  left: 50%;
}
</style>
