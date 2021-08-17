<template>
  <div class="gather-detail-dialog">
    <meg-dialog
      :visible="detailDialogVisible"
      width="640px"
      @close="closeDialog">
      <span slot="title">
        {{ $t('查看任务') }}
      </span>
      <div
        class="dialog-body">
        <meg-form
          :model="formData"
          :rules="rules"
          hide-required-asterisk
          :label-width="labelWidth"
          ref="formData">
          <meg-form-item
            :label="$t('任务名称')"
            prop="jobName">
            <div class="edit-name-wrapper">
              <span
                class="job-edit-name"
                v-tooltip="true"
                v-if="!editMode">
                {{ formData.jobName }}
              </span>
              <div
                class="edit-name-input"
                v-else>
                <meg-input
                  v-model.trim="formData.jobName"
                  :placeholder="$t('请输入{from}-{to}个汉字，字母，数字', { from: 2, to: 50 })">
                </meg-input>
              </div>
              <div>
                <meg-button
                  type="text"
                  v-if="!editMode && analysisManage"
                  @click="startEditing">
                  {{ $t('编辑') }}
                </meg-button>
              </div>
              <meg-button
                type="text"
                @click="confirmEdting"
                v-if="editMode">
                {{ $t('确认') }}
              </meg-button>
              <meg-button
                class="button__edit"
                type="text"
                @click="cancelEdting"
                v-if="editMode">
                {{ $t('取消') }}
              </meg-button>
            </div>
          </meg-form-item>
          <meg-form-item :label="$t('出现次数')">
            {{ $t('不少于') }}{{ formData.appearCount }}{{ $t('次') }}
          </meg-form-item>
          <meg-form-item :label="$t('文件类型')">
            {{ formData.clusterType==="PACKAGE"? $t('图片压缩包') : $t('已解析离线视频') }}
          </meg-form-item>
          <meg-form-item :label="$t('已选文件')">
            <div
              class="selected-files">
              <meg-scrollbar>
                <div class="selected-files-wrap">
                  <template v-if="formData.clusterType==='VIDEO'">
                    <span>{{ videoNames }}</span>
                  </template>
                  <template v-else>
                    <span>{{ formData.uploadPackageName }}</span>
                  </template>
                </div>
              </meg-scrollbar>
            </div>
          </meg-form-item>
        </meg-form>
      </div>
    </meg-dialog>
  </div>
</template>
<script>
export default {
  props: {
    detailDialogVisible: {
      type: Boolean,
      default() {
        return true;
      }
    },
    detailDialogData: {
      type: Object,
      default: () => {}
    },
    rules: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      currentLocale: 'zh-CN',
      editMode: false,
      formData: this.detailDialogData,
      jobName: '' // 暂存任务名称 取消后恢复
    };
  },
  computed: {
    labelWidth() {
      return this.currentLocale === 'zh-CN' ? '80px' : '180px';
    },
    videoNames() {
      return (this.formData.videoNames || []).join(';');
    },
    analysisManage() {
      return this.$store.getters.modulePermissonsByAlias('person-gather', 'analysisManage');
    }
  },
  created() {
    this.currentLocale = this.$store.state.currentLocale;
  },
  methods: {
    /*
    * 关闭弹框
    * @param {any}
    * @return
    * */
    closeDialog() {
      this.$refs.formData.clearValidate();
      this.$refs.formData.resetFields();
      this.$emit('close-detail-dialog');
    },
    /*
    * 开始编辑
    * @param {any}
    * @return
    * */
    startEditing() {
      this.editMode = true;
      this.jobName = this.formData.jobName;
    },
    /*
    * 取消编辑
    * @param {any}
    * @return
    * */
    cancelEdting() {
      this.editMode = false;
      if (this.$refs.formData) {
        this.$refs.formData.clearValidate();
      }
      this.formData.jobName = this.jobName;
    },
    /*
    * 确认修改
    * @param {any}
    * @return
    * */
    confirmEdting() {
      const { id, jobName } = this.formData;
      if (this.jobName === jobName) {
        this.editMode = false;
        return;
      }
      this.$refs.formData.validate((valid) => {
        if (valid) {
          const params = {
            id,
            jobName
          };
          this.$emit('edit-job-name', params);
          this.editMode = false;
        }
      });
    },
  }
};
</script>
<style lang="scss" scoped>
::v-deep .meg-dialog .meg-dialog__header{
  line-height: 54px;
  font-weight: 700;
  font-size: 16px;
  color: #435068;
}
.dialog-body{
  padding:20px;
  .edit-name-input{
    width:270px;
    display: inline-block;
  }
  .job-edit-name{
    max-width: 60%;
    margin-right: 8px;
    display: inline-block;
  }
  .edit-name-wrapper{
    display: flex;
    align-items: center;
  }
}
.selected-files-wrap {
  width: 450px;
  height: 270px;
  border: 1px solid #e4e7ed;
  background-color: white;
  text-align: left;
  span{
    display: inline-block;
    width: 100%;
    word-break: break-all;
  }
}
</style>
<style lang="scss">
.gather-detail-dialog{
  .el-form-item__error{
    position: relative;
  }
  .el-form-item__content{
    line-height: 34px;
  }
}
</style>
<style lang="scss" scoped>
.i18n-en-US {
  .selected-files-wrap{
    width: 410px;
  }
}
</style>
