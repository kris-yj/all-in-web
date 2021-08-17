<template>
  <div class="time-multi-selector">
    <div
      v-for="(timeItem,idx) in timeItemsArray"
      :key="idx">
      <time-multi-selector-item
        :start-minute="timeItem.startMinute"
        :end-minute="timeItem.endMinute"
        :idx="idx"
        :is-show-plus-icon="isShowPlusIcon"
        :is-show-minus-icon="isShowMinusIcon"
        @ployTimeMinus="ployTimeMinus"
        @ployTimePlus="ployTimePlus"
        @changeStartTime="changeStartTime"
        @changeEndTime="changeEndTime">
      </time-multi-selector-item>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import TimeMultiSelectorItem from './time-multi-selector-item.vue';

export default {
  name: 'TimeMultiSelector',
  components: {
    TimeMultiSelectorItem
  },
  props: {
    // 默认选择列表
    defaultSelect: {
      type: Array,
      default: () => []
    },
    // 最大可选项数
    maxSelectNum: {
      type: Number,
      default: 5
    },
    // 最小可选项数
    minSelectNum: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      timeItemsArray: []
    };
  },
  watch: {
    defaultSelect: {
      deep: true,
      handler(newValue) {
        if (newValue.length) {
          this.timeItemsArray = JSON.parse(JSON.stringify(newValue));
        }
      },
      immediate: true
    }
  },
  mounted() {
    if (!this.timeItemsArray.length) {
      this.ployTimePlus();
    }
    this.$emit('time-select-change', this.handleOriginToStamp(this.timeItemsArray));
  },
  methods: {
    isShowPlusIcon(idx) {
      return idx === (this.timeItemsArray.length - this.minSelectNum) && (this.timeItemsArray.length < this.maxSelectNum);
    },
    isShowMinusIcon(idx) {
      return (this.timeItemsArray.length > this.minSelectNum && idx !== this.maxSelectNum) || this.timeItemsArray.length >= this.maxSelectNum;
    },
    // 删除布控时间段
    ployTimeMinus(idx) {
      this.timeItemsArray.splice(idx, 1);
      this.$emit('time-select-change', this.handleOriginToStamp(this.timeItemsArray));
    },
    // 增加布控时间段
    ployTimePlus() {
      this.timeItemsArray.push({
        startMinute: moment().startOf('day').toDate(), endMinute: moment().endOf('day').toDate()
      });
      console.log(333);
      this.$emit('time-select-change', this.handleOriginToStamp(this.timeItemsArray));
    },
    changeStartTime(idx, value) {
      this.timeItemsArray[idx].startMinute = value;
      this.$emit('time-select-change', this.handleOriginToStamp(this.timeItemsArray));
    },
    changeEndTime(idx, value) {
      this.timeItemsArray[idx].endMinute = value;
      this.$emit('time-select-change', this.handleOriginToStamp(this.timeItemsArray));
    },
    /**
     * @description 处理内部时间数据转换成外部的
     * @param {array} timeArr
     * @returns {array}
     */
    handleOriginToStamp(timeArr) {
      const arr = JSON.parse(JSON.stringify(timeArr));
      return arr.map((ele) => {
        ele.startMinute = new Date(ele.startMinute).getTime() - moment(new Date(new Date(new Date(ele.startMinute).toLocaleDateString()).getTime())).valueOf();
        ele.endMinute = new Date(ele.endMinute).getTime() - moment(new Date(new Date(new Date(ele.endMinute).toLocaleDateString()).getTime())).valueOf();
        return ele;
      });
    },
  }
};
</script>
<style lang="scss" scoped>
.time-multi-selector {
  overflow: hidden;
}
</style>
