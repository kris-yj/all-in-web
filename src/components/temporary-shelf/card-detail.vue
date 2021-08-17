<template>
  <div>
    <capture-detail
      :visible="type==='capture'&& visible"
      :result-list="cardList"
      @close="closeDialog"
      :feaker="true"
      @remove-temporary="handleTemporaryRemove"
      :index="index"></capture-detail>
    <alarm-detail
      v-if="type==='alarm' && visible"
      :total="cardList.length"
      :index="index"
      @temp-change="handleTemporaryRemove"
      :alarm-id="cardList[index].id"
      @change="handleAlarmChange"
      @close="closeDialog"></alarm-detail>
    <database-detail
      v-if="type==='database' && visible"
      @remove-temporary="handleTemporaryRemove"
      :visible="visible"
      :result-list="cardList"
      @close="closeDialog"
      :index="index"></database-detail>
  </div>
</template>
<script>
import CaptureDetail from '@/common-components/common-capture-detail';
import AlarmDetail from '@/common-components/common-alarm-detail';
import DatabaseDetail from '@/common-components/common-database-detail';

export default {
  components: {
    CaptureDetail,
    AlarmDetail,
    DatabaseDetail
  },
  props: {
    cardList: {
      type: Array,
      default: () => []
    },
    index: {
      type: Number,
      default: () => -1
    },
    visible: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: ''
    }
  },
  methods: {
    /*
    * 移除暂存架
    * @param {any}
    * @return
    * */
    handleTemporaryRemove(index) {
      this.cardList.splice(index, 1);
      if (index > this.cardList.length - 1) {
        this.closeDialog();
      }
      if (this.type === 'alarm') {
        this.$emit('update:index', index);
      }
    },
    handleAlarmChange(index) {
      this.$emit('update:index', index);
    },
    // 关闭弹框
    closeDialog() {
      this.$emit('update:visible', false);
      this.$emit('update-list');
    }
  }
};
</script>
