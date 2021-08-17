<template>
  <meg-dialog
    class="detail__main"
    :visible="visible"
    width="700px"
    :show-close="true"
    @close="onDialogClose">
    <span slot="title">
      {{ type==="add" ? $t("新建任务") : type === "check" ? $t("查看任务") : $t("复制任务") }}
    </span>
    <div
      class="detailFrequency">
      <meg-form
        ref="task"
        class="frequency-task-detail-form"
        label-position="right"
        label-width="83px"
        :model="taskForm"
        :hide-required-asterisk="true"
        :rules="taskRule">
        <meg-form-item
          :label="$t('任务名称')"
          prop="jobName">
          <div class="edit-name-wrapper">
            <span
              v-if="!editMode"
              v-tooltip="true"
              class="job-content-box">
              {{ taskForm.jobName }}
            </span>
            <meg-input
              v-if="editMode"
              v-model.trim="taskForm.jobName"
              :placeholder="$t('请输入{from}-{to}个汉字，字母，数字', { from: 2, to: 50 })">
            </meg-input>
            <meg-button
              type="text"
              @click="editJobName"
              v-if="!editMode && analysisManage">
              {{ $t('编辑') }}
            </meg-button>
            <meg-button
              type="text"
              @click="confirmJobName"
              v-if="editMode">
              {{ $t('确认') }}
            </meg-button>
            <meg-button
              type="text"
              @click="cancelJobName"
              v-if="editMode">
              {{ $t('取消') }}
            </meg-button>
          </div>
        </meg-form-item>
        <meg-form-item
          class="threshold-form-item"
          :label="$t('频次阈值')">
          <span class="job-content-box"> {{ $t('不少于') }}{{ taskForm.appearCount }}{{ $t('次') }} </span>
        </meg-form-item>
        <meg-form-item :label="$t('起止时间')">
          {{
            `${timeFormat(taskForm.startTime) }  ${$t('至')}  ${timeFormat(taskForm.endTime) }`
          }}
        </meg-form-item>
        <meg-form-item :label="$t('选择相机')">
          <div
            class="content-tag"
            style="border: 1px solid #e4e7ed;">
            {{ camerasName }}
          </div>
        </meg-form-item>
      </meg-form>
    </div>
    <span
      slot="footer"
      class="dialog-footer">
      <meg-button @click="onDialogClose">取 消</meg-button>
      <meg-button
        type="primary"
        @click="onDialogConfirm">确 定</meg-button>
    </span>
  </meg-dialog>
</template>
<script>
import moment from 'moment';
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
    responseFlag: {
      type: String,
      default: 'success'
    }
  },
  data() {
    return {
      taskForm: new TaskForm(),
      taskRule: {},
      editMode: false,
      jobName: '',
    };
  },
  computed: {
    /**
     * 查看模式下，只读
     */
    disiabled() {
      return this.type === 'check';
    },
    analysisManage() {
      return this.$store.getters.modulePermissonsByAlias('frequency', 'analysisManage');
    },
    camerasName() {
      const { cameras } = this.taskForm;
      return (cameras || []).map((item) => item.cameraName).join(',');
    }
  },
  watch: {
    // 确认编辑后请求的返回状态 格式为 success/error + _ +时间戳
    responseFlag(val) {
      const [flag] = val.split('_');
      if (flag === 'success') {
        this.editMode = false;
        if (this.$refs.task) {
          this.$refs.task.clearValidate();
        }
      } else {
        this.taskForm.jobName = this.jobName;
      }
    }
  },
  methods: {
    setFormData(val) {
      this.taskForm = val;
    },
    /**
     * 时间格式化
     * @param {time} 时间戳
     * @returns 格式化后的字符串
     */
    timeFormat(time) {
      return moment(time).format('YYYY-MM-DD HH:mm:ss');
    },
    editJobName() {
      this.editMode = true;
      this.jobName = this.taskForm.jobName;
    },
    confirmJobName() {
      if (this.jobName === this.taskForm.jobName) {
        this.editMode = false;
        return;
      }
      this.$refs.task.validate((isPass) => {
        if (isPass) {
          const params = {
            jobId: this.taskForm.jobId,
            jobName: this.taskForm.jobName
          };
          this.$emit('modifyJobName', params);
        }
      });
    },
    cancelJobName() {
      this.editMode = false;
      if (this.$refs.task) {
        this.$refs.task.clearValidate();
      }
      this.taskForm.jobName = this.jobName;
    },
    /**
     * 接受相机选择组件的选择的相机Id
     * @param {ids} 相机Id数组
     */
    getCameraIds(ids) {
      this.camereIds = ids;
      this.taskForm.cameraIds = ids;
    },
    /**
     * 弹窗关闭
     */
    onDialogClose() {
      this.$emit('update:visible', false);
    },
    getDateValue(timeArr) {
      let startTime = 0;
      let endTime = 0;
      [startTime, endTime] = timeArr;
      this.taskForm.startTime = startTime.getTime();
      this.taskForm.endTime = endTime.getTime();
    },
    onDialogConfirm() {
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
::v-deep .meg-dialog__header{
  line-height: 54px;
  font-weight: 700;
  font-size: 16px;
  color: #435068;
}
.detail__main{
  padding: 0 25px;
}
.edit-name-wrapper{
  display: flex;
  align-items: center;
}
</style>

<style lang="scss">
.detailFrequency{
  background-color: white;
}
.frequency-task-detail-form{
    margin-left:17px;
  .photo-form-item{
    margin: 0px 34px 24px;
    height: 138px;
  }
  .threshold-form-item{
    .threshold-input{
      width: 88px;
      margin:0 6px;
    }
  }
}
.job-content-box{
  display: inline-block;
  line-height: 34px;
  margin-right: 20px;
  max-width: 615px;
  text-align: left;
  color: #435068;
  font-size: 14px;
}
.content-tag{
  width: 347px;
  height: 250px;
  padding: 8px;
  overflow-y: scroll;
  overflow-x: hidden;
  word-wrap: break-word;
  word-break: break-all;
}
</style>

<style lang="scss">
.i18n-en-US{
  .frequency-task-detail-form{
    .task-form-main {
      width: 428px!important;
    }
  }
}
</style>
