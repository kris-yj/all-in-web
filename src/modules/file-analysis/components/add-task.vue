<template>
  <!-- :close-on-click-modal="false" -->
  <meg-dialog
    v-if="visible"
    class="creat-file-analysis-task"
    :close-on-press-escape="false"
    :show-close="false"
    :visible.sync="visible"
    append-to-body>
    <div class="file-analysis-task-content">
      <task-form
        ref="taskForm"
        :is-uploading-file="isUploadingFile"
        :monitor-info="monitorInfo"
        :albums="albums"
        :form-type="formType"
        :init-data="initData"
        @upload-file="uploadFile"></task-form>
      <div class="file-select-container">
        <p>
          <span>{{ $t('文件选择') }}</span>
          <span>{{ $t('已选：')+currentCheckedNum+$t('个') }}</span>
        </p>
        <common-file-select-tree
          class="fileSelect"
          is-file-analysis-ser
          is-default-show-file-list
          :choose-file-mode="0"
          :selector-data="pathTreeData"
          :file-list-getter="fileListGetter"
          :if-emit-data="true"
          :default-checked-all="false"
          :counts-map="countsMap"
          @file-change="checkedFileChange"></common-file-select-tree>
      </div>
    </div>
    <template v-slot:footer>
      <div class="dialog-title">
        {{ $t('新建任务') }}
      </div>
      <div class="dialog-footer">
        <meg-button
          type="primary"
          :loading="adding"
          @click="confirm">
          {{ $t('确定') }}
        </meg-button>
        <meg-button @click="cancel">
          {{ $t('取消') }}
        </meg-button>
      </div>
    </template>
  </meg-dialog>
</template>
<script>
import { CommonFileSelectTree } from '@/common-components/common-file-selector';
import taskForm from './task-form';

export default {
  components: {
    taskForm,
    CommonFileSelectTree
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    adding: {
      type: Boolean,
      default: false
    },
    // 资源使用情况
    monitorInfo: {
      type: Object,
      default: () => {}
    },
    // 底库数据
    albums: {
      type: Object,
      default: () => ({})
    },
    pathTreeData: {
      type: Array,
      default() {
        return [];
      }
    },
    countsMap: {
      type: Object,
      default() {
        return {};
      }
    },
    fileListGetter: {
      type: Function,
      default: null
    },
    formType: {
      type: String,
      default: 'add'
    },
    initData: {
      type: Object,
      default: () => ({})
    },
    isUploadingFile: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      currentCheckedNum: 0, // 已选中文件数量
      checkedFiles: [], // 已选中文件
    };
  },
  methods: {
    /**
     * @description 文件上传事件
     * @param {Object} 上传的文件数据对象
     */
    uploadFile(file) {
      this.$emit('upload-file', file);
    },
    checkedFileChange(val) {
      this.currentCheckedNum = 0;
      this.checkedFiles = [];
      val.forEach((item) => {
        this.currentCheckedNum += ~~(item.checkedNum);//eslint-disable-line
        this.checkedFiles.push({
          id: item.id,
          idsIn: item.idsIn,
          idsNotIn: item.idsNotIn
        });
      });
      console.log(val, this.currentCheckedNum);
    },
    checkValue(speed) {
      const { monitorInfo } = this;
      if (!/^\d+$/.test(speed)) {
        return false;
      }
      if (speed > monitorInfo.totalVideoPower || speed < 0) {
        return false;
      }
      return true;
    },
    /**
     * @description 创建任务操作
     */
    confirm() {
      const {
        taskName,
        speed,
        autoCompare
      } = this.$refs.taskForm.taskFormData;
      if (!taskName) {
        return this.$message.error({
          message: '请输入任务名称',
          showClose: true
        });
      }
      if (taskName.length < 2 || taskName.length > 50) {
        return this.$message.error({
          message: '任务名称为2-50个字符',
          showClose: true
        });
      }
      if (!/^(?:[^'“”!@#$%^&*`~！＠＃＄％＾＆＊￥……<>/,，。]+)$/.test(taskName)) {
        return this.$message.error({
          message: '任务名称不能包含特殊字符',
          showClose: true
        });
      }
      if (speed === '') {
        return this.$message.error({
          message: '请输入解析倍速',
          showClose: true
        });
      }
      if (speed <= 0) {
        return this.$message.error({
          message: '请输入大于0的解析倍速',
          showClose: true
        });
      }
      if (!this.checkValue(speed)) {
        const { totalVideoPower } = this.monitorInfo;
        return this.$message.error({
          message: `请输入1-${totalVideoPower}的解析倍速`,
          showClose: true
        });
      }
      if (!this.checkedFiles.length) {
        return this.$message.error({
          message: '请选择要解析的文件',
          showClose: true
        });
      }
      if (this.isUploadingFile) {
        return this.$message.error({
          message: '正在上传图片压缩包',
          showClose: true
        });
      }
      const compare = {};
      if (autoCompare) {
        compare.alarmType = 0;
      }
      this.$emit('creatTask', {
        ...this.$refs.taskForm.taskFormData,
        ...compare,
        resourceInfos: this.checkedFiles
      });
      return false;
    },
    cancel() {
      this.$emit('cancel');
    },
  },
};
</script>
<style lang="scss">
.creat-file-analysis-task {
  width: 100%;
  overflow: hidden;
  .dialog-title {
    font-size: 16px;
    color: #64718E;
    font-weight: bold;
  }
  .meg-dialog {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    min-height: auto;
  }
  .meg-dialog__body {
    padding: 0 !important;
    height: 100%;
  }
  .meg-dialog__footer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    padding: 10px 25px;
    display: flex;
    justify-content: space-between;
    line-height: 34px;
    box-shadow: 0 2px 6px 0 rgba(0,0,0,0.12);
  }
  .camera-selector-content {
    box-shadow: 0 0 5px #ddd;
    padding: 10px 25px;
  }
  .meg-radio {
    width: 85px;
  }
}
.file-analysis-task-content{
  height: calc(100% - 56px);
  position: relative;
  display: flex;
  padding-top: 56px;
  .file-select-container{
    width: 320px;
    padding: 20px 30px 50px 30px;
    &>p{
      display: flex;
      justify-content: space-between;
    }
  }
}
</style>
