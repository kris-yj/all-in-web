<template>
  <div class="multi-person-new-dialog-box">
    <meg-dialog
      :visible="visible"
      width="800px"
      @close="dialogClose"
      :show-close="true">
      <div slot="title">
        <span>{{ $t('查看任务') }}</span>
      </div>
      <div>
        <div class="person__main">
          <meg-form
            :model="ruleForm"
            :rules="taskRule"
            ref="ruleForm"
            label-width="100px"
            class="demo-ruleForm">
            <div class="main__width">
              <meg-form-item
                prop="name">
                <span
                  class="content__main__item">
                  <span class="title__task title__change__main">{{ $t('任务名称') }}</span>
                  <span
                    class="title__first__main"
                    v-if="!editMode">
                    {{ ruleForm.name }}
                  </span>
                  <div
                    v-if="editMode"
                    class="readonly-value_main title__first__main">
                    <meg-input
                      v-model.trim="ruleForm.name"
                      :placeholder="$t('请输入{from}-{to}个汉字，字母，数字', { from: 2, to: 50 })">
                    </meg-input>
                  </div>
                  <meg-button
                    type="text"
                    @click="editJobName"
                    v-if="!editMode && ifAuth">{{ $t('编辑') }}</meg-button>
                  <meg-button
                    class="button__edit"
                    type="text"
                    @click="confirmJobName"
                    v-if="editMode">{{ $t('确认') }}</meg-button>
                  <meg-button
                    class="button__edit"
                    type="text"
                    @click="cancelJobName"
                    v-if="editMode">{{ $t('取消') }}</meg-button>
                </span>
              </meg-form-item>
            </div>
            <div class="main__width">
              <meg-form-item
                :label="$t('批量上传')"
                prop="uploadFileCount">
                <span
                  class="content__main__item">
                  {{ ruleForm.uploadFileCount }}
                </span>
              </meg-form-item>
            </div>
            <div class="main__width">
              <meg-form-item
                :label="$t('底库类型')"
                prop="albumType">
                <span
                  class="content__main__item">
                  {{ ruleForm.albumType }}
                </span>
              </meg-form-item>
            </div>
            <div class="main__width">
              <meg-form-item
                :label="$t('选择底库')"
                prop="albumType">
                <div
                  class="content__main"
                  style="border: 1px solid #e4e7ed;">
                  <meg-scrollbar>
                    <div class="camera-select-container">
                      <div class="camera-tag-box">
                        <span
                          v-for="(item,index) in ruleForm.content"
                          :key="index"
                          type="info">
                          {{ item.name }}
                          <span
                            v-show="ruleForm.content.length!==index+1">,</span>
                        </span>
                      </div>
                    </div>
                  </meg-scrollbar>
                </div>
              </meg-form-item>
            </div>
          </meg-form>
        </div>
      </div>
    </meg-dialog>
  </div>
</template>

<script>
import Rules from '@/modules/common/judge.rule.js';

export default {
  components: {
  },
  props: {
    visible: {
      type: Boolean,
      default() {
        return false;
      }
    },
    ifAuth: {
      type: [Boolean, Object],
      default: null
    },
    detailData: {
      type: Object,
      default: () => {}
    },
    responseFlag: {
      type: String,
      default: 'success'
    },
  },
  data() {
    return {
      taskRule: Rules.person,
      ruleForm: {
        name: '',
        albumType: '',
        content: '',
        uploadFileCount: '',
        uploadFileCount1: this.$t('已经上传{count}张照片', {
          count: 0
        }),
        jobId: '',
      },
      editMode: false,
      name: ''
    };
  },
  watch: {
    detailData: {
      handler() {
        this.getData();
      },
      deep: true
    },
    // 确认编辑后请求的返回状态 格式为 success/error + _ +时间戳
    responseFlag(val) {
      const [flag] = val.split('_');
      if (flag === 'success') {
        this.editMode = false;
        if (this.$refs.ruleForm) {
          this.$refs.ruleForm.clearValidate();
        }
      } else {
        this.ruleForm.name = this.name;
      }
    },
  },
  created() {
    this.getData();
  },
  methods: {
    getData() {
      this.ruleForm.name = this.detailData.jobName;
      if (this.detailData.albumType && this.detailData.albumType === 1) {
        this.ruleForm.albumType = this.$t('静态库');
      }
      if (this.detailData.albumType && this.detailData.albumType === 2) {
        this.ruleForm.albumType = this.$t('布控库');
      }
      console.log(this.detailData.albums);
      this.ruleForm.jobId = this.detailData.jobId;
      this.ruleForm.content = this.detailData.albums;
      this.ruleForm.uploadFileCount = this.$t('已经上传{count}张照片', {
        count: this.detailData.uploadFileCount
      });
    },
    editJobName() {
      this.editMode = true;
      this.name = this.ruleForm.name;
    },
    confirmJobName() {
      if (this.name === this.ruleForm.name) {
        this.editMode = false;
        return;
      }
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          const params = new FormData();
          params.append('jobName', this.ruleForm.name);
          const id = this.ruleForm.jobId;
          this.$emit('modifyJobName', params, id);
        }
      });
    },
    cancelJobName() {
      this.editMode = false;
      if (this.$refs.ruleForm) {
        this.$refs.ruleForm.clearValidate();
      }
      this.ruleForm.name = this.name;
    },
    /**
       * 确定弹窗内容并发请求
       * @augments
       */
    dialogOpen2() {
      this.$emit('close');
    },

    /**
       * 关闭弹窗
       * @augments
       */
    dialogClose2() {
      this.$emit('close');
    },
    /**
       * 关闭弹窗
       * @augments
       */
    dialogClose() {
      this.editMode = false;
      this.$emit('close');
    },
  }
};
</script>

<style lang="scss" scoped>
::v-deep .meg-dialog__header{
  font-weight: 700;
  font-size: 16px;
  color: #435068;
  line-height: 54px;
}
.content__main__item{
  display: inline-block;
  width: 460px;
  text-align: left;
  color: #435068;
  font-size: 14px;
}
  .title__task{
    color:rgb(134,154,187)
  }
  .title__change__main{
    margin-left: -72px;
  }
    .title__first__main{
    margin-left: 10px;
  }
  .readonly-value_main{
    display: inline-block;
    width: 270px;
  }
.multi-person-new-dialog-box{
    position: relative;
    background-color: white
}
.main__width{
  width: 370px;
  margin-left: -3px;
}
.main__small{
width: 100px;
display: inline-block;
margin-right: 10px;
}
.upload__float{
display: inline-block;
}
.person__main{
    text-align: center;
    font-size: 12px;
    color: #333333;
    padding: 10px 0 25px 0;
    box-sizing: border-box;
    background-color: white

}
.person__main >span{
    display: inline-block;
    padding-right: 15px;
}
.person__main >div{
margin-bottom: 20px;
}
.task__name{
    display: inline-block;
    width: 270px;
}
.upload__file{
    display: inline-block;
    width: 271px;
    background-color:#E5E5E5;
    margin-left: 70px;
}
.file__title{
    position: absolute;
    top:20px;
}

.choose__ablum{
    display: inline-block;
    width: 270px;
}
.ablum__lists{
    display: inline-block;
    width: 270px;
}
.ablum__lists >span{
    display: inline-block;
    width: 100%;
}
.list__input{
  margin-top: 11px;
  margin-right: 5px;
}
.upload__name{
    display: inline-block;
    width: 270px;
    text-align: left;
    font-size: 12px;
    color: #333333;
}
.text__ablum{
  position: relative;
}
 .search-item-container{
    height: 70px;
  }
  .search-item-container p{
    line-height: 26px;
    font-size: 12px;
    color: #435068;
  }
  .camera-select-container{
    position: relative;
    padding: 10px;
    max-height: 132px;
    box-sizing: border-box;
    line-height: 24px;
    color: #606060;
    font-size: 14px;
  }
    .camera-select-placeholder{
    position: absolute;
    color: rgb(193,195,203);
    left: 15px;
    top: 12px;
    font-size: 12px;
    line-height: 12px;
  }
  .content__main{
    width: 656px;
    height: 270px;
    margin-top: -5px;
    background-color: white;
    text-align: left;
}
  .camera-box{
    position: relative;
    border: 1px solid #d2d6de;
  }
  .el-tag{
    margin-left: 4px;
    margin-bottom: 4px;
    float: left;
  }
</style>
<style>
.multi-person-new-dialog-box .meg__input .meg__input__top{
    display: none;
}
.multi-person-new-dialog-box .footer-btns .el-button.el-button--primary{
  display: none
}
.multi-person-new-dialog-box .el-form-item__label{
  padding: 0 15px 0 0;
  font-size: 14px;
  color: #869abb;
}
.multi-person-new-dialog-box div.el-form-item{
  margin-bottom: 10px;
}
</style>
<style lang="scss">
.i18n-en-US{
  .multi-person-new-dialog-box{
    width: 540px!important;
    .el-form-item__label {
      width: 130px!important;
    }
    .el-form-item__content {
      margin-left: 130px!important;
    }
    .content__main{
      width: 550px;
    }
  }
}
</style>
