<template>
  <div class="person__new">
    <meg-dialog
      :show-close="true"
      :visible="visible"
      width="700px"
      @close="dialogClose">
      <div slot="title">
        <span>{{ $t('新建任务') }}</span>
      </div>
      <div>
        <p class="title__upload">
          {{ $t('最大支持1000张上传图片压缩包') }}
        </p>
        <div class="video__main">
          <meg-form
            :model="ruleForm"
            :rules="taskRule"
            ref="ruleForm"
            label-width="130px"
            class="demo-ruleForm">
            <meg-form-item
              :label="$t('任务名称')"
              prop="name">
              <div class="video__name">
                <meg-input
                  :placeholder="$t('请输入{from}-{to}个汉字，字母，数字', { from: 2, to: 50 })"
                  v-model.trim="ruleForm.name"></meg-input>
              </div>
            </meg-form-item>
            <meg-form-item
              prop="uploadFile"
              :label="$t('上传人像压缩包')">
              <div class="video__fcy">
                <div
                  v-if="fileDataUpload"
                  class="video__file__upload">
                  <person-file-upload
                    @fileData="fileData">
                  </person-file-upload>
                </div>
              </div>
            </meg-form-item>
            <meg-form-item
              :class="[ifStatic==='default'?'':'static__choose']"
              prop="uploadType"
              :label="$t('底库类型')">
              <div class="video__upload">
                <meg-radio-group
                  @change="handleUploadTypeChange"
                  v-if="ifStatic==='default'"
                  v-model="ruleForm.uploadType">
                  <meg-radio :label="$t('选择{entity}', { entity: $t('静态库') })"></meg-radio>
                  <meg-radio
                    :label="$t('选择{entity}', { entity: $t('布控库') })"></meg-radio>
                </meg-radio-group>
              </div>
              <meg-treeselect
                ref="albumTreeSelector"
                class="tree-selector"
                :show-checkbox="true"
                default-checked-all
                deep-child-node-type="album"
                :props="{ children: 'items', label: 'name'}"
                :search-placeholder="$t('输入底库名进行搜索')"
                :data="albumTreeSelectorData"
                @check-change="albumChange">
              </meg-treeselect>
              <p
                v-show="showAblum"
                class="rules__ablum1">
                {{ $t('底库不能为空') }}
              </p>
            </meg-form-item>
          </meg-form>
        </div>
      </div>
      <span
        slot="footer"
        class="dialog-footer">
        <meg-button @click="dialogClose">取 消</meg-button>
        <meg-button
          type="primary"
          @click="dialogOpenMain">确 定</meg-button>
      </span>
    </meg-dialog>
  </div>
</template>

<script>
import Rules from '@/modules/common/judge.rule.js';
import MultiPersonSrv from '../multi-person.service.js';
import PersonFileUpload from './person-file-upload';

export default {
  components: {
    PersonFileUpload
  },
  props: {
    visible: {
      type: Boolean,
      default() {
        return true;
      }
    }
  },
  data() {
    return {
      fileDataUpload: false,
      ifStatic: '',
      showAblum: false,
      taskRule: Rules.person,
      jobId: '',
      albumTreeSelectorData: [],
      // 选中的相机数据映射表
      ruleForm: {
        name: '',
        uploadType: this.$t('选择{entity}', {
          entity: this.$t('静态库')
        }),
        uploadFile: '',
      },
      rules: {
        name: [
          { required: true, message: this.$t('请输入任务名称'), trigger: 'blur' },
        ],
        desc: [
          { required: true, message: this.$t('请上传压缩包'), trigger: 'blur' }
        ],
        resource: [
          { required: true, message: '', trigger: 'blur' }
        ]
      }
    };
  },
  computed: {
    platformType() {
      //  1是否公安网，0为视频网
      return this.$store.getters.systemByType('dualPlatformType').value;
    },
  },
  watch: {
    visible: {
      handler() {
        if (!this.visible) {
          this.ruleForm = {
            name: '',
            uploadType: this.$t('选择{entity}', {
              entity: this.$t('静态库')
            }),
            uploadFile: ''
          };
          this.fileDataUpload = false;
          if (this.$refs.ruleForm) { this.$refs.ruleForm.resetFields(); }
          this.getTreeDataJT();
          this.showAblum = false;
        } else {
          this.fileDataUpload = true;
        }
      }
    },
  },
  created() {
    this.ifStatic = this.$store.getters.system.dualEnvType.value;
    this.getTreeDataJT();
  },
  methods: {
    /*
    * 底库类型变化
    * @param {any}
    * @return
    * */
    handleUploadTypeChange(data) {
      if (data === this.$t('选择{entity}', { entity: this.$t('静态库') })) {
        this.getTreeDataJT();
      } else {
        this.getTreeData();
      }
    },
    albumChange() {
      this.showAblum = false;
    },
    getTreeData() {
      const params = {
        platformType: this.platformType
      };
      params.type = [2];
      params.srcType = [1];
      MultiPersonSrv.getAlbum(params).then((response) => {
        if (response.code === 0) {
          const albumListRoot = {
            flag: 'root',
            name: this.$t('全部'),
            id: 'albumListRoot',
            items: []
          };
          response.data.forEach((item) => {
            albumListRoot.items.push({ flag: 'album', ...item });
          });
          this.albumTreeSelectorData = [albumListRoot];
          if (response.data.length === 0) {
            this.albumTreeSelectorData = [];
          }
        }
      });
    },
    getTreeDataJT() {
      const params = {
        platformType: this.platformType
      };
      params.type = [1];
      params.srcType = [1];
      MultiPersonSrv.getAlbum(params).then((response) => {
        if (response.code === 0) {
          const albumListRoot = {
            flag: 'root',
            name: this.$t('全部'),
            id: 'albumListRoot',
            items: []
          };
          response.data.forEach((item) => {
            albumListRoot.items.push({ flag: 'album', ...item });
          });
          this.albumTreeSelectorData = [albumListRoot];
          if (response.data.length === 0) {
            this.albumTreeSelectorData = [];
          }
        }
      });
    },
    fileData(file) {
      if (file) {
        this.ruleForm.uploadFile = file;
        this.$refs.ruleForm.validateField(['uploadFile']);
      }
    },
    /**
       * 确定弹窗内容并发请求
       * @augments
       */
    dialogOpenMain() {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          const params = {};
          params.jobName = this.ruleForm.name;
          params.albumType = this.ruleForm.uploadType === this.$t('选择{entity}', { entity: this.$t('静态库') }) ? 1 : 2;
          const albumIds = this.$refs.albumTreeSelector.getCheckedKeys(null, true);
          if (albumIds.length === 0) {
            this.showAblum = true;
            return;
          }
          params.albumIds = albumIds;
          params.uploadType = 'PACKAGE';
          MultiPersonSrv.newPerson(params).then((Response) => {
            if (Response.code === 0) {
              this.$message({
                type: 'success',
                message: this.$t('新建任务成功！')
              });
              this.jobId = Response.data.jobId;
              this.uploadFile();
              this.$emit('close');
              this.$emit('getList');
            }
          });
        }
      });
    },
    /**
       * 上传压缩包
       * @augments
       */
    uploadFile() {
      const id = this.jobId;
      const params = new FormData();
      params.append('packageFile', this.ruleForm.uploadFile);
      MultiPersonSrv.personUploadFile({ 'jobId': id, 'formData': params }).then((Response) => {
        console.log(Response);
      });
    },
    /**
       * 关闭弹窗
       * @augments
       */
    dialogClose() {
      this.$emit('close');
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
  .person__new{
    .tree-selector {
      width: 274px;
      margin-top: 15px;
    }
    .video__select{
      width: 270px;
    }
    .title__upload{
    font-size: 14px;
    position: absolute;
    top: 150px;
    left: 460px;
    }
    .choose__item{
      float: right;
      font-size: 12px;
      margin-top: -11px;
      position: relative;
      left: -78px;
      color: #606266;
      color:#999999;
    }
    .video__main{
      width: 500px;
      font-size: 12px;
      color: #333333;
      padding: 20px 0 0 22px;
      box-sizing: border-box;
    }
    .video__name{
      width: 270px;
    }
    .video__fcy{
      width: 270px;
      text-align: left;
      span{
        font-size: 12px;
        color: #999999;
        display: inline-block;
        margin-right: 10px;
      }
    }
    .frequency{
      display: inline-block;
      width: 88px;
      margin-right: 10px;
    }
    .video__upload{
      width: 270px;
      text-align: left;
    }
    .video__file__upload{
      width:270px ;
      height: 137px;
      text-align: center;
    }
    .video__control{
      width:270px ;
      height: 100%;
    }
    .file__none{
      display: none;
    }
    //tree
    .camera-box{
      position: relative;
      border: 1px solid #d2d6de;
      margin-top: 15px;
    }
    .camera-box:hover{
      position: relative;
      border: 1px solid #21539b;;
    }
    .camera-select-menu{
      position: absolute;
      cursor: pointer;
      right: 7px;
      top: -2px;
      display: inline-block;
      width: 20px;
      height: 34px;
      line-height: 34px;
      z-index: 1000;
    }
    .camera-select-placeholder{
      position: absolute;
      color: rgb(193,195,203);
      left: 15px;
      top: 12px;
      font-size: 14px;
      line-height: 12px;
    }
  }
  .tag__none{
    display: none
  }
  .rules__ablum{
    font-size: 12px;
    color: #f56c6c;
    text-align: left;
    margin-left: 100px;
    position: absolute;
    top: 276px;
    left: 52px;
  }
  .rules__ablum1{
    font-size: 12px;
    color: #f56c6c;
    text-align: left;
    position: relative;
    top: 0px;
  }
  .el-tag{
    margin-left: 4px;
    margin-bottom: 4px;
    float: left;
  }
  //tree
  .camera-select-container1{
    min-height: 32px;
    position: relative;
    max-height: 146px;
    padding: 2px 0px 0px 0px;
    box-sizing: border-box;
    .camera-tag-box{
      line-height: 16px;
      width: 245px;
      .el-tag{
        max-width: 90%;
        position: relative;
        padding: 0 10px 0 10px;
      }
    }
  }

</style>
<style>
  .camera-right-container-main{
    background: #ffffff;
    border-radius: 10px;
    width: 274px;
    height: 524px;
    box-sizing: border-box;
  }
  label.el-form-item__label{
    line-height: 34px ;
  }
  .static__choose label.el-form-item__label {
    margin-top: 15px;
  }
  .camera-select-container1 .camera-tag-box .el-tag{
    padding: 0 20px 0 10px !important;
    color: #435068 !important;
    background-color: #f7f8f9;
  }
  .tag__item .el-tag__close {
    position: absolute;
    right: 2px;
    top: 7px;
  }
  .tag__item .el-tag--info .el-tag__close{
    color: #c7c8c9 !important;
    font-weight: bold;
  }
  .tag__item .el-tag__close:hover{
    color: #2b5f92 !important;
    background-color: #e3f2ff !important;
  }

  .tag__item .el-tag--info:hover{
    background-color: #e3f2ff !important;
    color: #435068 !important;
  }
</style>
<style lang="scss">
.i18n-en-US{
  .person__new{
    width: 540px!important;
    .el-form-item__label {
      width: 230px!important;
    }
    .el-form-item__content {
      margin-left: 230px!important;
    }
    .video__upload{
      width:450px;
    }
    .choose__item{
      left: 20px;
    }
  }
}
</style>
