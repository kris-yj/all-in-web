<template>
  <!-- eslint-disable vue/no-use-v-if-with-v-for -->
  <meg-dialog
    :visible="visible"
    class="check-dialog-box"
    width="800px"
    :show-close="true"
    @close="onDialogClose"
    append-to-body>
    <span slot="title">
      {{ type==="add" ? $t("新建任务") : type === "check" ? $t("查看任务") : $t("复制任务") }}
    </span>
    <div
      class="dialog-body-box">
      <div class="img-box">
        <meg-img-container
          text-align="center"
          vertical-align="middle"
          :img-src="photoUrl">
        </meg-img-container>
      </div>
      <div class="detail_peer__main">
        <meg-form
          ref="task"
          class="peer-task-detail-form"
          label-position="right"
          label-width="83px"
          :model="taskForm"
          :hide-required-asterisk="true">
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
                class="edit-button"
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
            :label="$t('同行次数')">
            <span class="job-content-box">
              {{ $t('不少于{count}次', { count: taskForm.appearCount}) }}
            </span>
          </meg-form-item>
          <meg-form-item
            :label="$t('同行间隔')"
            class="meg-select">
            <span class="job-content-box">
              {{ getIntervalValue(taskForm.interval) }}
            </span>
          </meg-form-item>
          <meg-form-item
            :label="$t('起止时间')">
            {{
              `${timeFormat(taskForm.startTime) }  ${$t('至')}  ${timeFormat(taskForm.endTime) }`
            }}
          </meg-form-item>
          <meg-form-item
            :label="$t('选择相机')">
            <div
              class="peer__detail__main"
              style="border: 1px solid #e4e7ed;">
              {{ camerasName }}
            </div>
          </meg-form-item>
        </meg-form>
      </div>
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
  <!-- eslint-disable vue/no-use-v-if-with-v-for -->
</template>
<script>
import moment from 'moment';

export default {
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
      taskForm: {
        photoInfo: {}
      },
      editMode: false,
      jobName: '',
      intervalOptions: this.$store.getters.dataMap.peerIntervals
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
      return this.$store.getters.modulePermissonsByAlias('peer', 'analysisManage');
    },
    camerasName() {
      const { cameras } = this.taskForm;
      return (cameras || []).map((item) => item.cameraName).join(',');
    },
    photoUrl() {
      console.log(this.taskForm.photoInfo);
      return this.taskForm.photoInfo && this.taskForm.photoInfo.photoUrl;
    }
  },
  watch: {
    // 确认编辑后请求的返回状态 格式为 success/error + _ +时间戳
    responseFlag(val) {
      const [flag] = val.split('_');
      if (flag === 'success') {
        this.editMode = false;
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
    /*
    * 获取同行间隔时间
    * @param {any}
    * @return
    * */
    getIntervalValue(time) {
      const mapData = new Map();
      this.intervalOptions.forEach((item) => {
        mapData.set(item.code, item.value);
      });
      return mapData.get(`${time}`);
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
     * 弹窗关闭
     */
    onDialogClose() {
      this.$emit('update:visible', false);
    },
    onDialogConfirm() {
      this.$emit('update:visible', false);
    },
  }
};
</script>
<style lang="scss" scoped>
::v-deep .meg-dialog__body .dialog-body-box{
  padding: 0px;
}
::v-deep .meg-dialog__header{
  line-height: 54px;
  font-weight: 700;
  font-size: 16px;
  color: #435068;
}
.edit-name-wrapper{
  display: flex;
  align-items: center;
}
</style>

<style lang="scss">
.dialog-body-box {
  display: flex;
  padding: 20px 25px 0;
  .img-box {
    width: 272px;
    height: 272px;
  }
}
.detail_peer__main {
  width: 482px;
  background-color: white;
  margin-top: -10px;
}
.peer-task-detail-form {
  // width: 353px;
  margin-left: 50px;
  .threshold-form-item {
    .el-form-item__content {
      font-size: 12px;
      color: #999;
    }

    .threshold-input {
      width: 86px;
      margin: 0 6px;
      .el-input__inner {
        padding: 0;
        text-align: center;
      }
    }
  }
  .dialog-body-box {
    display: flex;
    padding: 20px 25px 0;
    .img-box {
      width: 272px;
      height: 272px;
    }
  }
  .job-content-box {
    display: inline-block;
    max-width: 290px;
    line-height: 34px;
    text-align: left;
    color: #435068;
    font-size: 14px;
  }
  .edit-button {
    margin-left: 5px;
  }
  .peer__detail__main {
    width: 347px;
    height: 250px;
    padding: 7px;
    overflow-y: scroll;
    overflow-x: hidden;
    word-wrap: break-word;
    word-break: break-all;
  }
}
</style>
<style lang="scss">
.check-dialog-box .meg-dialog-footer {
  background-color: white !important;
}
</style>
<style lang="scss">
.i18n-en-US{
  .check-dialog-box{
    .peer-task-detail-form {
      margin-left: 10px;
      .peer__detail__main {
        width: 290px;
      }
    }
  }
}
</style>
