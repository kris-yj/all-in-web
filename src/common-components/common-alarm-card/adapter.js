import {
  convertStoreToMap
} from './utils';
import getProcessorResult from './processor';

const mixin = {
  data() {
    return {
      // 报警级别颜色映射表
      alarmLevelColorMap: {},
      // 处理状态映射表
      alarmProcessStatusMap: {},
    };
  },
  created() {
    // 报警级别颜色映射表
    this.alarmLevelColorMap = convertStoreToMap(this.$store.getters.dataMapByType('album_color'));
    // 处理状态映射表
    this.alarmProcessStatusMap = convertStoreToMap(this.$store.getters.dataMapByType('realtime_deal'));
  },
  methods: {
    /**
     * @description 处理外部数据转换成标准数据
     * @param {object} data
     * @returns {object}
     */
    getNormalData(data) {
      const result = getProcessorResult(data, this.alarmLevelColorMap, this.alarmProcessStatusMap);
      return result;
    }
  }
};

export default mixin;
