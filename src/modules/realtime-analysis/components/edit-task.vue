<template>
  <div
    class="analysis-dialog-wrap"
    v-if="isAddShow">
    <meg-dialog
      :visible="isAddShow"
      width="1000px"
      :title="$t('编辑任务')"
      @close="closeClick">
      <div
        v-loading="loading"
        class="show-detail">
        <div class="plan-right">
          <task-form
            ref="form"
            :type="1"
            :task-data="taskData"></task-form>
        </div>
      </div>
      <span
        slot="footer"
        class="dialog-footer">
        <meg-button
          type="primary"
          :loading="finishLoading"
          :disabled="loading"
          @click="saveRealtimeTask">保存</meg-button>
        <meg-button @click="closeClick">取消</meg-button>
      </span>
    </meg-dialog>
  </div>
</template>
<script>
import _ from 'lodash';
import config from '@/utils/config.utils';
import {
  restoreHour,
  // roiToRecognitionArea
} from '@/utils/common.utils';
import commonMapList from '@/utils/data-map.utils';
import TaskForm from './task-form';

export default {
  components: {
    TaskForm
  },
  props: {
    // 显示增加的弹框
    isAddShow: {
      type: Boolean,
      default: false
    },
    initData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      taskData: {},
      checkedCameraArr: [],
      loading: true,
      finishLoading: false,
      currentCamera: {},
      socketUrl: config.apiPath.iotLiveSocketUrl,
      videoDataObj: {},
      RoiObj: {},
      played: false,
      defaultAnalysisStatus: [0],
      defaultScenesType: [0, 1, 2, 3],
      form: {
        recognitionArea: null,
        cameras: [],
        scheduleType: 0,
        startTime: null,
        endTime: null,
        includeDays: [],
        startHour: null,
        endHour: null,
        sourceType: 1
      }
    };
  },
  computed: {
    rangeTimeOptions() {
      return {
        disabledDate(time) {
          return time.getTime() < new Date() - 1000 * 60 * 60 * 24;
        }
      };
    }
  },
  watch: {
    initData(val) {
      // 处理分析类型
      // this.initData.taskId = this.initData.id;
      // this.initData.id = this.initData.cameraId;
      // val.doNonVehicle = val.doVehicle;
      // val.includeDays = val.includeDays.map((item) => item - 1);
      // let tempIndex = 0;
      // this.analysisTypeArr.forEach((item, index) => {
      //   const curItem = item.val;
      //   const arr = Object.keys(curItem).filter((key) => curItem[key] === val[key]);
      //   if (arr.length === 4) {
      //     tempIndex = index;
      //   }
      // });
      // this.initData.analysisType = tempIndex || 0;
      // // 处理起始时间
      // val.time = val.startTime ? [val.startTime, val.endTime] : [];
      // // 处理选中的小时数
      this.loading = !Object.keys(val || {}).length;
      val.startHour = restoreHour(val.startHour);
      val.endHour = restoreHour(val.endHour);
      this.taskData = val;
    },
  },
  methods: {
    /**
     * @description 关闭弹框的时候
     */
    closeClick() {
      this.$emit('cancel');
    },
    /**
     * 保存实时分析任务
     */
    saveRealtimeTask() {
      if (this.finishLoading) return false;
      const { taskForm } = this.$refs.form;
      const [startTime, endTime] = taskForm.time;
      const datas = commonMapList.analysisTypeArr[this.initData.monitoringType];
      let analysisTypes = {};
      datas.forEach((item) => {
        if (item.id === taskForm.analysisType) {
          analysisTypes = item.val;
        }
      });
      let newForm = _.pick(taskForm, Object.keys(this.form));
      newForm = {
        ...newForm,
        ...analysisTypes,
        startTime: startTime && startTime.getTime(),
        endTime: endTime && endTime.getTime()
      };
      const hasTypes = ['doBody', 'doFace', 'doMotor', 'doNonMotor'].some((item) => newForm[item] !== undefined);
      if (!hasTypes) {
        return this.$message.error({
          message: '请选择解析类型',
          showClose: true
        });
      }
      if (newForm.scheduleType) {
        if (!newForm.startTime || !newForm.endTime) {
          return this.$message.error({
            message: '请选择有效时间',
            showClose: true
          });
        }
        if (!newForm.includeDays.length) {
          return this.$message.error({
            message: '请选择循环每周',
            showClose: true
          });
        }
        if (!newForm.startHour || !newForm.endHour) {
          return this.$message.error({
            message: '请选择循环时间段',
            showClose: true
          });
        }
      }
      newForm.includeDays = newForm.includeDays.map((item) => Number(item) + 1);
      newForm.startHour = parseInt(newForm.startHour, 10);
      newForm.endHour = parseInt(newForm.endHour, 10);
      console.log('newForm', newForm);
      this.finishLoading = true;
      this.$emit('confirm', {
        id: taskForm.id,
        form: newForm
      });
      return false;
    }
  }
};
</script>
<style lang="scss" scoped>
  .analysis-dialog-wrap{
    v::deep .meg-dialog__body{
      padding-bottom: 0;
    }
  }
  .show-detail{
    height: 488px;
    display: flex;
    .plan-left{
      width: 320px;
      margin-right: 26px;
    }
    .plan-right{
      flex: 1;
      height: 100%;
      overflow-y: auto;
      .camera-wrap{
        cursor: pointer;
        display: inline-block;
      }
      .camera-name{
        margin-right: 10px;
      }
    }
  }
</style>
<style lang="scss">
.search-form {
  .meg-checkbox-button__inner {
    padding: 10px 17px;
  }
}
</style>
