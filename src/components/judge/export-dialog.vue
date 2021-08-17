<template>
  <meg-dialog
    class="export-dialog"
    :visible="visible"
    :confirm-text="$t('导出')"
    :width="'400px'"
    @close="exportClose">
    <span slot="title">
      {{ $t('导出更多') }}
    </span>
    <div>
      <div
        v-if="visible"
        class="main__choose">
        <meg-radio-group v-model="chooseRadio">
          <div class="radio__choose">
            <meg-radio :label="1">
              {{ $t('导出前') }}
            </meg-radio>
            <div class="export__select">
              <meg-select
                v-model="defaultSelect">
                <meg-option
                  v-for="item in optionsData"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </meg-option>
              </meg-select>
            </div>
            <span class="export__select__title">
              {{ $t('条') }}
            </span>
          </div>
          <div class="radio__choose">
            <meg-radio :label="2">
              {{ $t('导出第') }}
            </meg-radio>
            <div class="second__choose">
              <meg-input-number
                :min="0"
                class="similarity__main"
                :controls="false"
                v-model.number="numFirst">
              </meg-input-number>
            </div>
            <div class="second__choose__center">
              ~
            </div>
            <div class="second__choose__main">
              <meg-input-number
                :min="0"
                class="similarity__main"
                :controls="false"
                v-model.number="numSecond">
              </meg-input-number>
            </div>
            <div class="second__choose__last">
              ({{ $t('最多导出1000条') }})
            </div>
          </div>
        </meg-radio-group>
      </div>
    </div>
    <span
      slot="footer"
      class="dialog-footer">
      <meg-button @click="exportClose">取 消</meg-button>
      <meg-button
        type="primary"
        @click="exportConfirm">确 定</meg-button>
    </span>
  </meg-dialog>
</template>
<script>

export default {
  props: {
    sortType: {
      type: Number,
      default: 0
    },
    visible: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      numFirst: 1,
      numSecond: 1000,
      chooseRadio: 1,
      optionsData: [{
        value: '100',
        label: '100'
      }, {
        value: '200',
        label: '200'
      }, {
        value: '500',
        label: '500'
      }, {
        value: '1000',
        label: '1000'
      }],
      defaultSelect: '100',
      formData: {}
    };
  },
  computed: {
  },
  watch: {
    visible: {
      handler() {
        if (this.visible) {
          this.numFirst = 1;
          this.numSecond = 1000;
          this.chooseRadio = 1;
          this.defaultSelect = '100';
        }
      }
    }
  },
  methods: {
    exportConfirm() {
      if (this.chooseRadio === 1) {
        this.formData.limit = this.defaultSelect;
        this.formData.start = '';
      } else {
        if (this.numSecond < this.numFirst) {
          this.$message({
            message: this.$t('开始值不能大于结束值'),
            type: 'warning'
          });
          return false;
        }
        if ((this.numSecond - this.numFirst) >= 1000) {
          this.$message({
            message: this.$t('最多导出1000条'),
            type: 'warning'
          });
          return false;
        }
        this.formData.limit = this.numSecond + 1 - this.numFirst;
        this.formData.start = this.numFirst;
      }
      this.$emit('confirm', this.formData);
      this.$emit('update:visible', false);
      return true;
    },
    exportClose() {
      this.$emit('update:visible', false);
    },
  }
};
</script>
<style lang="scss" scoped>
.export-dialog ::v-deep .meg-dialog__header{
  line-height: 54px;
  font-weight: 700;
  font-size: 16px;
  color: #435068;
}
.main__choose{
  padding: 50px 20px 50px 30px;
.radio__choose{
  height: 30px;
  line-height: 30px;
  margin-bottom: 20px;
}
}
.export__select{
  display:inline-block;
  width: 80px;
  margin-left: 20px;
 .meg-select .el-select .el-input{
    width: 80px;
  }
}
  .export__select__title{
    display: inline-block;
    height: 30px;
    line-height: 30px;
    font-size: 14px;
    margin-left: 10px;
    color: #999999;
   // font-weight: bold;
  }
  .second__choose{
    margin-left: 20px;
     width: 65px;
    display: inline-block;
  }
  .second__choose__main{
    margin-left: 10px;
    width: 65px;
    display: inline-block;
  }
  .second__choose__center{
     display: inline-block;
     font-size: 16px;
     color: #999999;
      padding-left: 10px;
      box-sizing: border-box;
  }
  .second__choose__last{
      display: inline-block;
     font-size: 12px;
     color: #999999;
     margin-left: 5px;
  }
    .similarity__main{
    width: 65px;
    .el-input__inner{
      padding: 0;
      text-align: center;
    }
     .el-input__inner{
      padding: 0 !important;
    }
  }
.export-dialog{
  .export-line-tip{
    color: #bbb;
    font-size: 12px;
    font-weight: normal;
  }
  .similarity{
    margin: 0 8px;
    width: 75px;
    text-align: center;
    .el-input__inner {
      padding: 0;
      text-align: center;
    }
  }
  .export-line{
    display: flex;
    .export-line-title{
      line-height: 35px;
      margin-right: 10px;
    }
    .export-line-content{
      .export-line-tip{
        margin-top: 8px;
        color: #bbb;
      }
    }
  }
  .meg-dialog-body{
    justify-content: center;
    align-items: center;
  }
  .inline-box{
    display: inline-block;
  }
  .camera-list-box{
    width: 800px;
    height: 400px;
  }
}
.body-content-container {
  height: 410px;
}
.body-content-title-container {
  height: 50px;
  line-height: 50px;
  padding-left: 38px;
}
.body-content-content-container {
  height: 360px;
  margin: 0 25px;
  border: 1px solid #dde0e6;
}
.body-content-content-container p {
  height: 48px;
  line-height: 48px;
  padding-left: 13px;
}

</style>
