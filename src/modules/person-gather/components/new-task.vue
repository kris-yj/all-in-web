<template>
  <div class="gather-new-task">
    <meg-dialog
      :is-loading="btnLoading"
      :visible="isVisible"
      width="640px"
      :show-close="true"
      @close="closeDialog">
      <span slot="title">{{ $t('新建任务') }}</span>
      <div>
        <div class="dialog-main">
          <meg-form
            :model="formData"
            ref="newTaskForm"
            :rules="rules"
            :validate-on-rule-change="false"
            :label-width="labelWidth">
            <meg-form-item
              :label="$t('任务名称')"
              prop="jobName">
              <div class="job-name">
                <meg-input
                  :placeholder="$t('请输入{from}-{to}个汉字，字母，数字', { from: 2, to: 50 })"
                  v-model.trim="formData.jobName"></meg-input>
              </div>
            </meg-form-item>
            <meg-form-item
              :label="$t('出现次数')"
              prop="appearCount">
              <div class="appear-count">
                {{ $t('不少于') }}
                <div class="appear-inpput">
                  <meg-input
                    class="threshold-input"
                    :placeholder="$t('输入数字')"
                    v-model.number="formData.appearCount">
                  </meg-input>
                </div>
                {{ $t('次') }} （{{ $t('范围：2-100') }}）
              </div>
            </meg-form-item>
            <meg-form-item
              :label="$t('文件类型')"
              prop="clusterType">
              <div class="video-upload">
                <meg-radio-group
                  @change="handleUploadTypeChange"
                  v-model="formData.clusterType"
                  class="type-radio-group">
                  <meg-radio label="PACKAGE">
                    {{ $t('图片压缩包') }}
                  </meg-radio>
                  <meg-radio
                    label="VIDEO">
                    {{ $t('已解析离线视频') }}
                  </meg-radio>
                </meg-radio-group>
              </div>
            </meg-form-item>
            <meg-form-item
              v-if="formData.clusterType=='PACKAGE'"
              prop="uploadFile"
              :label="$t('上传文件')">
              <div
                class="gather-file-upload">
                <meg-upload
                  :class="[
                    'package-upload',
                    packageUpload.isUploading? 'uploading' : ''
                  ]"
                  drag
                  ref="packageUpload"
                  :name="packageUpload.fileParamName"
                  :show-file-list="false"
                  :auto-upload="false"
                  :headers="packageUpload.headers"
                  :action="uploadUrl"
                  :accept="packageUpload.acceptType"
                  :on-success="onPackageUploadSuccess"
                  :on-error="onPackageUploadError"
                  :on-progress="onPackageUploadProgress"
                  :on-change="onPackageUploadChange"
                  :before-upload="onBeforePackageUpload">
                  <meg-icon
                    :name="packUploadIcon"
                    class="upload-icon"></meg-icon>
                  <div
                    class="el-upload__text">
                    {{ uploadText }}
                  </div>
                </meg-upload>
              </div>
            </meg-form-item>
            <meg-form-item
              v-else
              :label="$t('选择视频')"
              prop="videoIds">
              <div class="select-video-tree">
                <meg-treeselect
                  ref="videoTree"
                  :standard-tree-data="true"
                  :props="{children:'record', label: 'name'}"
                  :data="videoTreeData"
                  :show-checkbox="true"
                  :search-placeholder="$t('请输入关键词搜索')"
                  :empty-text="$t('暂无数据')"
                  :all-selected-text="$t('全部文件')"
                  :selected-count-text="$t('已选{count}个')"
                  :placeholder-text="$t('请选择文件中心的视频')"
                  :count-right-bottom="true"
                  @check-change="handleTreeNodeChange">
                </meg-treeselect>
              </div>
            </meg-form-item>
          </meg-form>
        </div>
      </div>
      <span
        slot="footer"
        class="dialog-footer">
        <meg-button @click="closeDialog">{{ $t('取消') }}</meg-button>
        <meg-button
          type="primary"
          @click="generateJobId">{{ $t('保存') }}</meg-button>
      </span>
    </meg-dialog>
  </div>
</template>
<script>
import config from '@/utils/config.utils';

const UPLOAD_URL = `${config.apiPath.service}/zuul/api/kunlun/judge/personCluster/uploadFile`;
export default {
  components: {
  },
  props: {
    isVisible: {
      type: Boolean,
      default: () => false
    },
    rules: {
      type: Object,
      default: () => {}
    },
    jobId: {
      type: [String, null],
      default: () => null
    },
    btnLoading: {
      type: Boolean,
      default: () => false
    },
    videoTreeData: {
      type: Array,
      default: () => []
    },
  },
  data() {
    return {
      currentLocale: 'zh-CN',
      formData: {
        clusterType: 'PACKAGE',
        jobName: '',
        uploadFile: '',
        videoIds: [],
        appearCount: 2,
      },
      uploadUrl: UPLOAD_URL,
      packageUpload: {
        fileParamName: 'packageFile',
        packageFileName: '',
        isUploading: false,
        acceptType: '.rar,.zip',
        headers: {
          'Authorization': `${window.localStorage.getItem('token')}`
        },
        progress: 0
      },
      maxVideoNum: '',
      fileList: [], // 选择的文件
      uploadText: this.$t('点击或拖拽上传图片压缩包'),
      uploadList: []
    };
  },
  computed: {
    packUploadIcon() {
      if (this.packageUpload.isUploading) {
        return 'package_database';
      }
      return 'resouece';
    },
    labelWidth() {
      return this.currentLocale === 'zh-CN' ? '100px' : '180px';
    }
  },
  watch: {
    jobId(newVal) {
      if (newVal) {
        this.prepareForUpload(newVal);
      }
    },
  },
  created() {
    const { maxVideoNumForPersonCluster, dualPlatformType } = this.$store.getters.system;
    this.maxVideoNum = (maxVideoNumForPersonCluster && maxVideoNumForPersonCluster.value) || 10;
    this.isVideoNet = Number(dualPlatformType.value) === 0; // 1是否公安网，0为视频网
    this.currentLocale = this.$store.state.currentLocale;
  },
  methods: {
    /*
    * 准备上传数据
    * @param {any}
    * @return
    * */
    prepareForUpload(jobId) {
      this.uploadUrl = UPLOAD_URL; // 重置url
      const params = `?jobId=${jobId}`;
      if (this.formData.clusterType === 'PACKAGE') {
        this.uploadUrl += params;
        setTimeout(() => {
          this.$refs.packageUpload.submit();
          this.uploadText = this.$t('点击或拖拽上传图片压缩包');
        }, 0);
      } else {
        // 如果不需要上传文件，还需要调一下接口
        this.$emit('upload-file', params);
      }
      this.$refs.newTaskForm.resetFields();
    },
    /*
    * 重置上传组件
    * @param {any}
    * @return
    * */
    resetPackageUpload() {
      this.uploadText = this.$t('点击或拖拽上传图片压缩包');
      this.$refs.packageUpload.clearFiles();
    },
    /*
    * 文件中心视频列表树选中值改变
    * @param {any}
    * @return
    * */
    handleTreeNodeChange() {
      const checkedNodes = this.$refs.videoTree.getCheckedNodes();
      const checkIds = this.$refs.videoTree.getCheckedKeys(true);
      this.formData.videoIds = checkedNodes.map((item) => item.resourceId).filter((val) => val);
      const MAX_VIDEO_NUM = this.maxVideoNum;
      if (this.formData.videoIds.length <= MAX_VIDEO_NUM) {
        this.formData.videoIds = checkedNodes.map((item) => item.resourceId).filter((val) => val);
      } else {
        // 超过视频数量限制 重新设置树的选中值
        const arr = checkIds.slice(0, MAX_VIDEO_NUM);
        const nodes = checkedNodes.slice(0, MAX_VIDEO_NUM);
        this.$refs.videoTree.setCheckedKeys(arr);
        this.formData.videoIds = nodes.map((item) => item.resourceId).filter((val) => val);
        this.$message.error(this.$t('最多允许选择{count}个视频', { count: MAX_VIDEO_NUM }));
      }
    },
    setChecked(params) {
      this.formData.clusterType = 'VIDEO';
      const ids = JSON.parse(params.id);
      this.formData.jobName = params.jobName;
      const selectIds = Array.from(new Set(ids));
      this.$nextTick(() => {
        if (this.$refs.videoTree) {
          this.$refs.videoTree.setCheckedKeys(selectIds);
          const checkedNodes = this.$refs.videoTree.getCheckedNodes();
          const nodes = checkedNodes.slice(0, this.maxVideoNum);
          this.formData.videoIds = nodes.map((item) => item.resourceId).filter((val) => val);
        }
      });
    },
    /*
    * 关闭弹框
    * @param {any}
    * @return
    * */
    closeDialog() {
      this.$refs.newTaskForm.resetFields();
      this.$emit('close-dialog');
    },
    /*
    * 上传类型改变
    * @param {any}
    * @return
    * */
    handleUploadTypeChange() {
    },
    /*
    * 验证文件大小以及正在上传文件
    * @param {any}
    * @return
    * */
    onBeforePackageUpload(file) {
      if (this.uploadText !== file.name) {
        return false;
      }
      const isLt500M = !(file.size > 500 * 1024 * 1024);
      if (!isLt500M) {
        return false;
      }
      const name = this.uploadList.find((item) => item.name === file.name);
      if (name) {
        return false;
      }
      return true;
    },
    /*
    * 选择文件
    * @param {file}
    * @return
    * */
    onPackageUploadChange(file) {
      const reg = /\.(zip|rar|RAR)/i;
      if (!reg.test(file.name)) {
        this.$message('请上传系统指定格式的压缩包！');
        this.$refs.packageUpload.clearFiles();
        return;
      }
      if (file.status === 'ready') {
        const name = this.uploadList.find((item) => item.name === file.name);
        if (name) {
          this.$message.error(this.$t('压缩包正在上传中'));
        } else {
          const isLt500M = !(file.size > 500 * 1024 * 1024);
          if (!isLt500M) {
            this.$message.error(this.$t('上传压缩包超过 500MB!'));
          } else {
            this.fileList = [file];
            this.formData.uploadFile = file;
            this.packageUpload.packageFileName = file.name;
            if (file.size > 0) {
              this.uploadText = file.name;
              this.packageUpload.isUploading = true;
            }
          }
        }
      }
    },
    /*
    * 上传成功刷新列表
    * @param {any}
    * @return
    * */
    onPackageUploadSuccess(res) {
      if (res.code === 0) {
        this.newTaskDialogVisible = false;
        this.$emit('query-gather-list');
      } else {
        this.$message.error(res.msg || this.$t('任务创建失败'));
      }
      this.resetPackageUpload();
    },
    /*
    * 上传失败
    * @param {any}
    * @return
    * */
    onPackageUploadError() {
      this.$message.error(this.$t('压缩包上传失败'));
      this.resetPackageUpload();
    },
    /*
    * 上传中
    * @param {any}
    * @return
    * */
    onPackageUploadProgress(progress) {
      this.packageUpload.isUploading = true;
      this.packageUpload.progress = Math.ceil(progress.percent);
    },
    /*
    * 表单提交 生成任务id
    * @param {any}
    * @return
    * */
    generateJobId() {
      let params = {};
      this.$refs.newTaskForm.validate((valid) => {
        if (valid) {
          const { clusterType, jobName, appearCount } = this.formData;
          params = {
            clusterType,
            jobName,
            appearCount
          };
          if (clusterType === 'PACKAGE') { // 压缩包上传
            this.$emit('generate-job-id', params);
          } else { // 选择离线视频
            const { videoIds } = this.formData;
            const videoNames = this.$refs.videoTree.getCheckedNodes()
              .filter((item) => item.resourceId)
              .map((val) => val.name);
            params = {
              ...params,
              resourceIds: videoIds,
              videoNames
            };
            this.$emit('generate-job-id', params);
          }
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
// @import "@/scss/tree.scss";
::v-deep .meg-dialog__header{
  font-weight: 700;
  font-size: 16px;
  color: #435068;
  line-height: 54px;
}
.dialog-main {
  padding-top: 20px;
}
.job-name,
.select-video-tree {
  width: 270px;
}
.gather-file-upload {
  .package-upload {
    position: relative;
    .package-file-name {
      font-size: 12px;
      color: #606266;
    }
    .package-upload-progress {
      position: absolute;
      bottom: 0px;
      width: 100%;
      .el-progress__text {
        position: absolute;
        margin: 0;
        padding-left: 3px;
        bottom: 13px;
        left: 115px;
      }
      .el-progress-bar {
        margin: 0;
        padding: 0;
        position: absolute;
        bottom: 0px;
        width: 100%;
        left: 0px;
        .el-progress-bar__outer {
          border-radius: 0;
          background-color: #d2d6de;
        }
        .el-progress-bar__inner {
          border-radius: 0;
        }
      }
    }
  }
  .upload-icon {
    color: #dcdde0;
    width: 42px;
    height: 48px;
    margin-top: 36px;
  }
  .el-upload-dragger {
    width: 268px;
    height: 148px;
    border: 1px solid #d2d6de;
    background-color: #f7f8f9;
    border-radius: 0px;
  }
  .el-icon-upload {
    margin: 9px 0 16px;
    line-height: 43px;
    font-size: 40px;
  }
  .el-upload__text {
    color: #919ba6;
    font-size: 12px;
    margin-top: 17px;
    line-height: initial;
  }
}
.threshold-input {
  width: 86px;
  margin: 0 6px;
  .el-input__inner {
    padding: 0;
    text-align: center;
  }
}
.appear-count {
  display: flex;
  color: #a49fa0;
  .appear-inpput {
    margin: 0 6px;
    .el-input-number {
      width: 150px;
    }
  }
}
</style>
