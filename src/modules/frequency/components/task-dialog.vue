<template>
  <!-- eslint-disable vue/no-use-v-if-with-v-for-->
  <meg-dialog
    v-if="visible"
    :visible="visible"
    width="800px"
    :show-close="true"
    @close="onDialogClose">
    <span slot="title">
      {{ type==="add" ? $t("新建任务") : type === "check" ? $t("查看任务") : $t("复制任务") }}
    </span>
    <div>
      <meg-form
        ref="task"
        class="task-form-main"
        label-position="right"
        label-width="83px"
        :model="taskForm"
        :rules="taskRule">
        <meg-form-item
          :label="$t('任务名称')"
          prop="jobName">
          <meg-input
            :disabled="disiabled"
            v-model.trim="taskForm.jobName"
            :placeholder="$t('请输入{from}-{to}个汉字，字母，数字', { from: 2, to: 50 })">
          </meg-input>
        </meg-form-item>
        <meg-form-item
          class="threshold-form-item"
          :label="$t('频次阈值')"
          prop="appearCount">
          {{ $t('不少于') }}
          <meg-input
            :disabled="disiabled"
            class="threshold-input"
            :placeholder="$t('输入数字')"
            v-model.number="taskForm.appearCount">
          </meg-input> {{ $t('次') }}（{{ $t('输入范围：2-100') }}）
        </meg-form-item>
        <meg-form-item
          :label="$t('起止时间')"
          prop="startTime">
          <meg-date-picker
            :disabled="disiabled"
            v-model="dateValue"
            format="yyyy-MM-dd HH:mm"
            type="datetimerange"
            :default-time="['00:00:00','23:59:59']"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptions">
          </meg-date-picker>
          <div
            v-show="isShowDateError"
            class="el-form-item__error">
            {{ $t('时间不能为空') }}
          </div>
        </meg-form-item>
        <meg-form-item
          :label="$t('选择相机')"
          prop="cameraIds">
          <div v-if="type !=='check'">
            <common-camera-select
              class="camera-select"
              ref="frequencyCamera"
              v-if="visible"
              @update-ready="updateReady"
              @change="getCameraIds"></common-camera-select>
            <div
              v-show="isShowError"
              class="el-form-item__error">
              {{ $t('相机不能为空') }}
            </div>
            <div
              v-show="isShowLimitError"
              class="el-form-item__error">
              {{ $t('您选择的相机达到上限{count}，请缩小选择范围', {count: cameraLimitCount}) }}
            </div>
          </div>
          <div
            style="border: 1px solid #e4e7ed;"
            v-else>
            <meg-scrollbar>
              <div class="camera-select-container-mask">
                <div class="camera-tag-box">
                  <meg-tag
                    v-tooltip="true"
                    v-for="(camera,index) in taskForm.cameras"
                    :key="index"
                    type="info">
                    {{ camera.cameraName }}
                  </meg-tag>
                </div>
              </div>
            </meg-scrollbar>
          </div>
        </meg-form-item>
      </meg-form>
    </div>
    <span
      slot="footer"
      class="dialog-footer">
      <meg-button @click="onDialogClose">{{ $t('取消') }}</meg-button>
      <meg-button
        type="primary"
        @click="onDialogConfirm">{{ $t('确定') }}</meg-button>
    </span>
  </meg-dialog>
  <!-- eslint-disable vue/no-use-v-if-with-v-for-->
</template>
<script>
import _ from 'lodash';
import commonCameraSelect from '@/common-components/common-camera-selector';
import rule from '@/modules/common/judge.rule';

/**
 * 表单默认数据
 */
const TaskForm = function () {
  const DATE = new Date();
  const end = DATE.getTime();
  const start = new Date(new Date().setHours(0, 0, 0, 0)) - 6 * 24 * 60 * 60 * 1000;

  this.jobName = '';
  this.appearCount = '';
  this.startTime = start;
  this.endTime = end;
  this.cameraIds = [];
};

export default {
  components: {
    commonCameraSelect
  },
  props: {
    type: {
      type: String,
      default: 'add'
    },
    visible: {
      type: Boolean,
      default: false
    },
    formData: {
      type: Object,
      default() {
        return {};
      }
    },
  },
  data() {
    return {
      taskForm: new TaskForm(),
      taskRule: rule.frequency,
      cameraIds: [],
      cameraLimitCount: 1000,
      isShowDateError: false,
      isShowError: false,
      isShowLimitError: false,
      dateValue: [],
      pickerOptions: {
        shortcuts: [
          'today',
          'pastThreeDays',
          'pastWeek',
          'pastMonth'
        ]
      },
    };
  },
  computed: {
    /**
     * 查看模式下，只读
     */
    disiabled() {
      return this.type === 'check';
    },
  },
  watch: {
    formData: {
      handler(val) {
        this.taskForm = _.cloneDeep(val);
        console.log(val);
        if (this.taskForm.cameraIds && this.taskForm.cameraIds.length > 0) {
          this.cameraIds = val.cameraIds;
        }
        if (this.taskForm.startTime) {
          this.dateValue = [new Date(this.taskForm.startTime), new Date(this.taskForm.endTime)];
        }
        if (this.$refs.task) {
          this.$refs.task.resetFields();
        }
      },
      deep: true
    },
    dateValue(val) {
      if (val && val[0] && val[1]) this.isShowDateError = false;
      else this.isShowDateError = true;
    },
    visible(val) {
      if (!val) {
        this.$refs.frequencyCamera.reset();
        this.taskForm.cameraIds = [];
        this.taskForm = {};
        this.isShowDateError = false;
        this.isShowError = false;
        this.isShowLimitError = false;
      }
    }
  },
  created() {
    this.cameraLimitCount = this.$store.getters.systemByType('kunlun_judge_camera_limit').value;
  },
  methods: {
    /**
     * 接受相机选择组件的选择的相机Id
     * @param {ids} 相机Id数组
     */
    getCameraIds(ids) {
      this.isShowError = false;
      this.isShowLimitError = false;
      this.taskForm.cameraIds = ids;
      if (ids.length > this.cameraLimitCount) {
        this.isShowLimitError = true;
      }
    },
    updateReady() {
      this.$refs.frequencyCamera.setCheckedKeys(this.cameraIds);
    },
    /**
     * 弹窗关闭
     */
    onDialogClose() {
      this.isShowError = false;
      this.$emit('update:visible', false);
    },
    getDateValue() {
      this.taskForm.startTime = this.dateValue[0].getTime();
      this.taskForm.endTime = this.dateValue[1].getTime();
    },
    onDialogConfirm() {
      if (!(this.dateValue && this.dateValue[0] && this.dateValue[1])) {
        this.isShowDateError = true;
        return;
      }
      this.getDateValue();
      if (this.taskForm.cameraIds.length === 0) {
        this.isShowError = true;
        return;
      }
      if (this.taskForm.cameraIds.length > this.cameraLimitCount) {
        this.isShowLimitError = true;
        return;
      }
      // 在提交数据的情况下，由父组件控制是否关闭弹窗
      if (this.type !== 'check') {
        this.$refs.task.validate((valid) => {
          if (valid) {
            this.$emit('taskConfirm', this.taskForm);
          } else {
            return false;
          }
          return false;
        });
      } else {
        this.$emit('update:visible', false);
      }
    },

  }
};
</script>
<style lang="scss" scoped>
.camera-select {
  ::v-deep .map-icon-box.map-position-top {
    top: -25px;
  }
}
::v-deep .meg-dialog__header{
  line-height: 54px;
  font-weight: 700;
  font-size: 16px;
  color: #435068;
}
.el-form-item__error{
  color: #f56c6c;
  font-size: 12px;
  line-height: 1;
  padding-top: 4px;
  position: absolute;
  top: 100%;
  left: 0;
}
.task-form-main{
    width: 353px;
    margin: 20px 0 0 25px;
  .photo-form-item{
    margin: 0px 34px 24px;
    height: 138px;
    div.meg-form-item__content{
      height: 100%;
      line-height: 14px;
    }
  }
  .threshold-form-item{
    .meg-form-item__content{
      font-size: 12px;
      color: #999;
    }

    .threshold-input{
      width: 86px;
      margin:0 6px;
      .el-input__inner{
        padding: 0;
        text-align: center;
      }
    }
  }
  .search-item-container{
    height: 70px;
  }
  .search-item-container p{
    line-height: 26px;
    font-size: 12px;
    color: #435068;
  }
  .camera-select-container-mask{
    min-height: 32px;
    position: relative;
    padding: 5px ;
    max-height: 180px;
    box-sizing: border-box;
    .camera-tag-box{
      line-height: 16px;
      .el-tag{
        max-width: 100%;
        position: relative;
        padding: 0 10px 0 10px;
      }
    }
  }
  .camera-mask{
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 9999;
    background-color:rgba(246, 247, 250,0.7);
  }
}
.camera-right-container{
  background: #ffffff;
  border-radius: 10px;
  width: 300px;
  height: 400px;
  padding: 10px;
  box-sizing: border-box;
}
.camera-select-menu{
  position: absolute;
  cursor: pointer;
  right: 7px;
  top: 0;
  display: inline-block;
  width: 20px;
  height: 34px;
  line-height: 34px;
  z-index: 1000;
}
.box-mask{
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(246, 247, 250, 0.6);
  z-index: 9999;
}
.common-select-label{
  position: absolute;
  right: 0;
  top: -26px;
  color: #999;
  font-size: 12px;
}

</style>
<style lang="scss">
.i18n-en-US{
  .task-form-main{
    width: 540px!important;
    .el-form-item__label {
      width: 155px!important;
    }
    .meg-form-item__content {
      margin-left: 158px!important;
    }
  }
}
</style>
