<template>
  <div
    class="time-multi-selector-list">
    <div
      class="ploy-time-item-content-container">
      <meg-time-picker
        format="HH:mm"
        :editable="true"
        :clearable="false"
        :prefix-icon-visible="false"
        @change="changeStartTime"
        :picker-options="{
          selectableRange: startLimit
        }"
        v-model="currentStartTime"
        :placeholder="$t('请选择{entity}', { entity: $t('开始时间') })">
      </meg-time-picker>
      ~
      <meg-time-picker
        format="HH:mm"
        :editable="true"
        :clearable="false"
        :prefix-icon-visible="false"
        @change="changeEndTime"
        :picker-options="{
          selectableRange: endLimit
        }"
        v-model="currentEndTime"
        :placeholder="$t('请选择{entity}', { entity: $t('结束时间') })">
      </meg-time-picker>
    </div>
    <div class="ploy-time-item-edit-container">
      <span
        @click="ployTimePlus(idx)"
        class="plus-icon"
        v-if="isShowPlusIcon(idx)">
        <meg-icon
          name="plus"
          width="10"
          height="10"
          color="#ffffff"></meg-icon>
      </span>
      <span
        @click="ployTimeMinus(idx)"
        class="minus-icon"
        v-if="isShowMinusIcon(idx)">
        <meg-icon
          name="circle_del"
          width="20"
          height="20"
          color="red white"></meg-icon>
      </span>
    </div>
  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'TimeMultiSelectorItem',
  props: {
    // 默认开始时刻
    startMinute: {
      type: [String, Date],
      default: ''
    },
    // 默认结束时刻
    endMinute: {
      type: [String, Date],
      default: ''
    },
    // 是否显示加号按钮
    isShowPlusIcon: {
      type: Function,
      default: () => {}
    },
    // 是否显示减号按钮
    isShowMinusIcon: {
      type: Function,
      default: () => {}
    },
    // 该时间段序号
    idx: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      currentStartTime: '',
      currentEndTime: ''
    };
  },
  computed: {
    startLimit() {
      return `00:00:00 - ${this.startMinute ? moment(this.endMinute).format('HH:mm:ss') : '23:59:59'}`;
    },
    endLimit() {
      return `${this.endMinute ? moment(this.startMinute).format('HH:mm:ss') : '00:00:00'} - 23:59:59`;
    },
  },
  watch: {
    startMinute: {
      immediate: true,
      handler(newV) {
        if (newV) {
          this.resetTime();
        }
      }
    },
    endMinute: {
      immediate: true,
      handler(newV) {
        if (newV) {
          this.resetTime();
        }
      }
    },
  },
  mounted() {
    this.resetTime();
  },
  methods: {
    /**
     * @description 重新复制开始和结束时间
     */
    resetTime() {
      this.currentStartTime = this.startMinute;
      this.currentEndTime = this.endMinute;
    },
    // 删除布控时间段
    ployTimeMinus() {
      this.$emit('ployTimeMinus', this.idx);
    },
    // 增加布控时间段
    ployTimePlus() {
      this.$emit('ployTimePlus');
    },
    changeStartTime(value) {
      this.$emit('changeStartTime', this.idx, value);
    },
    changeEndTime(value) {
      this.$emit('changeEndTime', this.idx, value);
    }
  }
};
</script>
<style lang="scss" scoped>
.time-multi-selector-list {
  .ploy-time-item-content-container{
    width: 211px;
    height: 36px;
    float: left;
    display: inline-block;
     ::v-deep.meg-date-editor.meg-input {
      width: 90px;
    }
    ::v-deep.meg-date-editor .meg-input__inner {
      text-align: center;
    }
  }
  .ploy-time-item-edit-container{
    width: 45px;
    height: 36px;
    float: left;
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
  }
  .plus-icon{
    width: 20px;
    height: 20px;
    margin-right: 5px;
    border-radius: 50%;
    cursor: pointer;
    background: #99bc6f;
    display: inline-flex;
    justify-content: center;
    align-items: center;
  }
  .minus-icon{
    display: inline-flex;
    cursor: pointer;
    width: 20px;
    justify-content: center;
    align-items: center;
    height: 20px;
  }
}

</style>
