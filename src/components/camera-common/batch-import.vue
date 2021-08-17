<template>
  <div class="batch-import">
    <meg-dialog
      :width="isEdit?'959px': '800px'"

      :visible="batchImportShow"
      :title="isEdit?$t('批量编辑'):$t('批量导入')"
      @close="uploadCameraClose"
      @closed="uploadCameraClosed">
      <div
        :class="['import-dialog',isEdit?'isEdit':'']">
        <div class="upload-content">
          <div v-if="!isEdit">
            <div
              class="download-temp">
              <meg-button
                type="text"
                style="float: right;"
                @click="downloadTemplate">
                {{ $t('下载批量导入模板') }}
              </meg-button>
            </div>
            <div>
              <meg-upload
                class="upload-box"
                drag
                ref="uploadCamera"
                :action="importUrl"
                :headers="headers"
                :on-success="uploadSuccess"
                :auto-upload="false"
                :on-change="onChange"
                :show-file-list="false">
                <div class="drop-box">
                  <div v-if="!file">
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
          <div
            v-else>
            <div
              class="edit-step-container">
              <div class="edit-step-item">
                <h3>{{ $t('导出') }}</h3>
                <p>{{ type==='camera'?$t('选择需修改相机并导出'):$t('选择需修改智能盒并导出') }}</p>
                <div class="edit-step-img-box">
                  <img
                    class="edit-step-img"
                    src="@/assets/images/camera/explain.png"
                    alt="excel" />
                </div>
                <i class="meg-icon-arrow-right"></i>
              </div>
              <div class="edit-step-item">
                <h3>{{ $t('修改') }}</h3>
                <p>{{ $t('打开导出文件并修改') }}</p>
                <div class="edit-step-img-box">
                  <img
                    class="edit-step-img"
                    src="@/assets/images/camera/excel.png"
                    alt="excel" />
                </div>
                <i class="meg-icon-arrow-right"></i>
              </div>
              <div class="upload-area">
                <h3 class="upload-title">
                  {{ $t('上传') }}
                </h3>
                <p class="upload-desc">
                  {{ $t('重新上传文件') }}
                </p>
                <meg-upload
                  class="upload-box"
                  drag
                  ref="uploadCamera"
                  :action="importUrl"
                  :headers="headers"
                  :on-success="uploadSuccess"
                  :auto-upload="false"
                  :on-change="onChange"
                  :show-file-list="false">
                  <div class="drop-box">
                    <div v-if="!file">
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
                        class="file-name-box"
                        v-tooltip="true">
                        {{ fileName }}
                      </div>
                    </div>
                  </div>
                </meg-upload>
              </div>
            </div>
            <div class="edit-mention-area">
              <h4>{{ $t('以下字段不可批量编辑') }}：</h4>
              <p>{{ mentionText }}</p>
            </div>
          </div>
        </div>
      </div>
      <div slot="footer">
        <meg-button
          type="primary"
          :disabled="disabledConfirm"
          :loading="uploadLoading"
          @click="uploadCameraConfirm">
          {{ $t('导入') }}
        </meg-button>
        <meg-button @click="uploadCameraClose">
          {{ $t('取消') }}
        </meg-button>
      </div>
    </meg-dialog>
  </div>
</template>
<script>
import config from '@/utils/config.utils';

export default {
  name: 'UploadCamera',
  props: {
    batchImportShow: {
      type: Boolean,
      default: false
    },
    // 是否为批量编辑
    isEdit: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'camera'
    },
    uploadApi: {
      type: String,
      default: ''
    },
    editApi: {
      type: String,
      default: ''
    },
    mentionText: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      file: null,
      fileName: '',
      uploadLoading: false,
      isSuccess: false, // 是否完成
      disabledConfirm: false, // 确认按钮禁用
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
    importUrl() {
      return `${config.apiPath.service}${this.isEdit ? this.editApi : this.uploadApi}`;
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
    uploadCameraClose() {
      this.file = null;
      this.fileName = '';
      this.isSuccess = false;
      this.uploadLoading = false;
      this.disabledConfirm = false;
      this.$emit('upload-camera-close');
    },
    // 下载失败模板
    downloadFailCameraExcel() {
      window.location.href = `${window.config.globalConfig.apiPath.service}${this.uploadResult.failUrl}`;
    },
    /*
    * upload change回调
    * */
    onChange(file) {
      if (file.status === 'ready') {
        this.isSuccess = false;
        this.uploadLoading = false;
        this.disabledConfirm = false;
      }
      this.file = file.raw;
      this.fileName = file.name;
    },
    // 上传成功
    uploadSuccess(res) {
      if (res.code === 0) {
        this.$message({
          message: '文件上传成功',
          type: 'success'
        });
        this.$message({
          message: '操作成功，请前往任务列表查看',
          type: 'success'
        });
        this.uploadCameraClosed();
        this.$emit('get-list-data');
        this.$refs.uploadCamera.clearFiles();
      } else {
        this.$message({
          message: res.msg,
          type: 'error'
        });
        this.uploadLoading = false;
      }
    },
    /*
    * 下载模板
    * */
    downloadTemplate() {
      this.$emit('download-template');
    },
    /*
    * 上传弹框关闭
    * */
    uploadCameraClosed() {
      this.$emit('upload-camera-closed');
    },
  }
};

</script>
<style lang="scss" scoped>
.batch-import {
  .import-dialog {
    height:370px ;
    &.isEdit{
      height:428px ;
    }
    border-bottom: 1px solid #f3f3f3;
  }

  .upload-content {
    margin: 30px auto;

    .download-temp {
      height: 30px;
      line-height: 30px;
      margin: 0 70px;
      color: #f05353;
    }
  }

  .drop-box {
    margin: 100px auto auto;
    width: 202px;
    height: 128px;
    background: #f7f8f9;
    .file-name-box {
      width: 250px;
    }
    .meg-upload__text {
      margin-top: 10px;
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

  .edit-step-item {
    padding-right: 40px;
    position: relative;

    .meg-icon-arrow-right {
      position: absolute;
      right: 0;
      top: 80px;
      font-size: 32px;
      color: #d2d6de;
    }
  }

  .edit-step-img-box {
    height: 98px;

    .edit-step-img {
      height: 100%;
    }
  }

  .upload-box {
    width: 390px;
    height: 220px;
  }

  h3 {
    color: #435068;
    font-size: 20px;
    margin-bottom: 10px;
    padding-left: 62px;

    &.upload-title {
      font-size: 24px;
      padding: 0;
      text-align: center;
    }
  }

  p {
    color: #435068;
    font-size: 14px;
    padding-left: 12px;
    margin-bottom: 10px;

    &.upload-desc {
      padding: 0;
      text-align: center;
    }
  }

  .drop-box {
    margin: 60px auto auto;
  }
}

.edit-mention-area {
  margin: 0 30px;
  padding: 12px 20px;
  font-size: 14px;
  color: #999;
  background: #f9f9f9;
  line-height: 20px;

  h4 {
    color: #435068;
    line-height: 24px;
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
    width: 390px;
    background: #f7f8f9;
  }
}
</style>
