<template>
  <div class="batch-import">
    <meg-dialog
      :width="'959px'"
      :body-height="'428px'"
      :title="isBatchEdit?$t('EXCEL批量编辑'):$t('EXCEL批量导入')"
      :visible="visible"
      @close="closeDialog">
      <div class="edit-step-container">
        <div class="edit-step-item">
          <h3>{{ $t('下载') }}</h3>
          <p v-if="isBatchEdit">
            {{ $t('选择需修改相机并导出') }}
          </p>
          <p v-else>
            {{ $t('请下载EXCEL') }}
          </p>
          <div class="edit-step-img-box">
            <img
              v-if="isBatchEdit"
              class="edit-step-img"
              src="../../../assets/images/camera/explain.png"
              alt="excel" />
            <meg-button
              v-else
              type="text"
              @click="downloadTemplate">
              {{ $t('批量导入模板.excel') }}
            </meg-button>
          </div>
        </div>
        <meg-icon
          name="arrow_right"
          width="18"
          height="32"
          color="#D2D6DE"></meg-icon>
        <div class="edit-step-item">
          <h3>{{ $t('修改') }}</h3>
          <p>{{ isBatchEdit?$t('打开导出文件并修改'):$t('打开下载文件并修改') }}</p>
          <div class="edit-step-img-box">
            <img
              class="edit-step-img"
              src="../../../assets/images/camera/excel.png"
              alt="excel" />
          </div>
        </div>
        <meg-icon
          name="arrow_right"
          width="18"
          height="32"
          color="#D2D6DE"></meg-icon>
        <div class="upload-area">
          <h3 class="upload-title">
            {{ $t('上传') }}
          </h3>
          <p class="upload-desc">
            {{ $t('重新上传文件') }}
          </p>
          <meg-upload
            class="upload-box"
            ref="uploadCamera"
            drag
            :action="api"
            :headers="headers"
            :on-success="uploadSuccess"
            :auto-upload="false"
            :on-change="onChange"
            :show-file-list="false">
            <div class="drop-box">
              <div
                class="drop-box-content"
                v-if="!file">
                <meg-icon
                  width="50"
                  height="50"
                  color="#dcdde0"
                  name="resouece"></meg-icon>
                <div
                  class="meg-upload__text">
                  <em>{{ $t('拖拽或点击上传文件') }}</em>
                </div>
              </div>
              <div v-if="file">
                <meg-icon
                  width="50"
                  height="50"
                  color="#dcdde0"
                  name="zip"></meg-icon>
                <div
                  v-tooltip="true"
                  class="file-name-box">
                  {{ fileName }}
                </div>
              </div>
            </div>
          </meg-upload>
        </div>
      </div>
      <span
        slot="footer"
        class="dialog-footer">
        <meg-button
          type="primary"
          :loading="uploadLoading"
          @click="uploadCameraConfirm">{{ $t('导入') }}</meg-button>
        <meg-button @click="closeDialog">{{ $t('取消') }}</meg-button>
      </span>
    </meg-dialog>
  </div>
</template>
<script>
import config from '@/utils/config.utils';

export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    editApi: {
      type: String,
      default: ''
    },
    importApi: {
      type: String,
      default: ''
    },
    isBatchEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      file: null,
      fileName: '',
      uploadLoading: false,
    };
  },
  computed: {
    headers() {
      const { currentModule } = this.$store.state;
      return {
        'Authorization': `${window.localStorage.getItem('token')}`,
        'Client-App-Id': window.config.globalConfig.clientAppId,
        'Module-Alias': currentModule ? currentModule.alias : '',
        'Module-Source': currentModule ? currentModule.source : '',
      };
    },
    api() {
      return this.isBatchEdit ? `${config.apiPath.service}${this.editApi}` : `${config.apiPath.service}${this.importApi}`;
    },
  },
  methods: {
    /*
    * 提交表单
    * */
    uploadCameraConfirm() {
      if (this.file) {
        // this.$refs.uploadCamera.submit(); //因为submit提交过一次之后会被拦截，所以直接提交
        this.$refs.uploadCamera.$children[0].post(this.file);
        this.uploadLoading = true;
      }
    },
    /*
    * 上传弹框关闭
    * */
    closeDialog() {
      this.file = null;
      this.fileName = '';
      this.uploadLoading = false;
      this.$emit('update:visible', false);
    },
    // 下载失败模板
    downloadFailCameraExcel() {
      window.location.href = `${config.apiPath.service}${this.uploadResult.failUrl}`;
    },
    /*
    * upload change回调
    * */
    onChange(file) {
      if (file.status === 'ready') {
        this.uploadLoading = false;
      }
      this.file = file.raw;
      this.fileName = file.name;
    },
    // 上传成功
    uploadSuccess(res) {
      if (res.code === 0) {
        this.$message({
          message: this.$t('文件上传成功'),
          type: 'success'
        });
        this.$message({
          message: this.$t('操作成功，请前往任务列表查看'),
          type: 'success'
        });
        this.$refs.uploadCamera.clearFiles();
        this.closeDialog();
      } else {
        this.$message({
          message: res.msg,
          type: 'error'
        });
        this.uploadLoading = false;
      }
    },
    downloadTemplate() {
      this.$emit('download-temp');
    }
  }
};

</script>
<style lang="scss" scoped>
.batch-import {
  .drop-box {
    width: 100%;
    height: 100%;
    background: #f7f8f9;
    display: flex;
    align-items: center;
    justify-content: center;
    .meg-upload__text {
      margin-top: 10px;
    }
    .file-name-box {
      width: 250px;
    }
  }
  .upload-box {
    height: 300px;
    width: 660px;
    margin: 0 auto;
  }
}
.edit-step-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  margin-bottom: 30px;
  .edit-step-img-box {
    height: 98px;
    .edit-step-img {
      height: 100%;
    }
  }
  .upload-box {
    width: 350px;
    height: 220px;
  }
  .edit-step-item {
    text-align: center;
  }
  h3 {
    color: #435068;
    font-size: 20px;
    margin-bottom: 10px;
    &.upload-title {
      font-size: 24px;
      padding: 0;
      text-align: center;
    }
  }
  p {
    color: #435068;
    font-size: 14px;
    margin-bottom: 10px;
    &.upload-desc {
      padding: 0;
      text-align: center;
    }
  }
}
</style>
<style lang="scss">
.batch-import .meg-upload-dragger {
  height: 300px;
  width: 660px;
  background: #f7f8f9;
}
.upload-area {
  .meg-upload-dragger {
    height: 220px;
    width: 350px;
    background: #f7f8f9;
  }
}
</style>
