<template>
  <meg-dialog
    :title="$t('填报处理结果')"
    width="800px"
    class="alarm-record-dialog"
    :visible="recordDialogVisible"
    @close="recordDialogClose"
    :append-to-body="appendToBody"
    :modal-append-to-body="appendToBody">
    <div
      class="dialog-body">
      <meg-form
        ref="recordForm"
        :model="recordForm"
        :rules="recordFormRules"
        text-algin="left"
        label-width="173px">
        <meg-form-item
          :label="$t('出警人')"
          prop="policeName">
          <meg-input
            :maxlength="50"
            :place-holder="$t('可输入多个姓名并通过(,)号分隔')"
            v-model="recordForm.policeName"></meg-input>
        </meg-form-item>
        <meg-form-item
          :label="$t('出警时间')"
          prop="policeTime">
          <meg-date-picker
            popper-class="recordForm-DatePicker"
            v-model="recordForm.policeTime"
            type="datetime"
            @change="dateChange"
            :picker-options="pickerOptions"
            :placeholder="$t('选择出警时间')">
          </meg-date-picker>
        </meg-form-item>
        <meg-form-item
          :label="$t('警情真假')"
          prop="right">
          <meg-radio-group v-model="recordForm.right">
            <meg-radio
              :label="0">
              {{ $t('有效警') }}
            </meg-radio>
            <meg-radio
              :label="1">
              {{ $t('无效警') }}
            </meg-radio>
          </meg-radio-group>
        </meg-form-item>
        <meg-form-item
          v-if="recordForm.right===0"
          :label="$t('处理结果')"
          prop="resultStatus">
          <meg-radio-group v-model="recordForm.resultStatus">
            <meg-radio
              label="2">
              {{ $t('抓捕') }}
            </meg-radio>
            <meg-radio
              label="3">
              {{ $t('警告') }}
            </meg-radio>
            <meg-radio
              label="4">
              {{ $t('线索') }}
            </meg-radio>
          </meg-radio-group>
        </meg-form-item>
        <meg-form-item
          v-if="recordForm.right===1"
          :label="$t('处理结果')">
          {{ $t('虚警') }}
        </meg-form-item>
        <meg-form-item
          prop="grabCount"
          :label="$t('抓捕人数')"
          v-if="recordForm.right===0&&recordForm.resultStatus==='2'">
          <meg-input v-model="recordForm.grabCount"></meg-input>
        </meg-form-item>
        <meg-form-item
          prop="grabCount"
          v-if="recordForm.right===0&&recordForm.resultStatus==='3'"
          :label="$t('警告次数')">
          <meg-input v-model="recordForm.grabCount"></meg-input>
        </meg-form-item>
        <meg-form-item
          prop="grabCount"
          v-if="recordForm.right===0&&recordForm.resultStatus==='4'"
          :label="$t('线索条数')">
          <meg-input v-model="recordForm.grabCount"></meg-input>
        </meg-form-item>
        <meg-form-item
          :label="$t('报告内容')"
          prop="reportContent">
          <meg-input
            :maxlength="1000"
            :rows="4"
            resize="none"
            type="textarea"
            v-model="recordForm.reportContent"></meg-input>
        </meg-form-item>
      </meg-form>
    </div>
    <div slot="footer">
      <meg-button
        type="primary"
        @click="recordDialogSave">
        {{ $t('确认') }}
      </meg-button>
      <meg-button @click="recordDialogClose">
        {{ $t('取消') }}
      </meg-button>
    </div>
  </meg-dialog>
</template>
<script>
import createRules from '../alarm-realtime.rule.js';

export default {
  name: 'AlarmRecord',
  props: {
    recordDialogVisible: {
      type: Boolean,
      default() {
        return true;
      }
    },
    appendToBody: {
      type: Boolean,
      default: true
    },
  },
  data() {
    return {
      pickerOptions: {
        disabledDate(time) {
          return new Date(time).getTime() > Date.now() - 8.64e6;
        }
      },
      recordFormRules: createRules().alarmRecord,
      recordForm: {
        policeName: '',
        policeTime: new Date(),
        right: 0,
        resultStatus: '2',
        grabCount: 0,
        reportContent: ''
      }
    };
  },
  mounted() {
    this.resetData();
  },
  methods: {
    recordDialogClose() {
      this.$emit('close');
    },
    dateChange(val) {
      if (new Date(val).getTime() > Date.now()) {
        this.recordForm.policeTime = new Date();
      }
      console.log(val);
    },
    resetData() {
      this.recordForm.policeName = '';
      this.recordForm.policeTime = new Date();
      this.recordForm.right = 0;
      this.recordForm.resultStatus = '2';
      this.recordForm.grabCount = 0;
      this.recordForm.reportContent = '';
    },
    recordDialogSave() {
      const vm = this;
      this.$refs.recordForm.validate((valid) => {
        if (valid) {
          // 如果是无效警,则处理结果为撤销
          if (vm.recordForm.right === 1) {
            vm.recordForm.resultStatus = '1';
          }
          vm.recordForm.policeTime = new Date(vm.recordForm.policeTime).getTime();
          vm.$emit('save', vm.recordForm);
        } else {
          return false;
        }
        return true;
      });
    }
  }
};
</script>
<style scoped>
.dialog-body {
  padding: 20px 25px;
  height: 430px;
}
</style>
<style lang="scss">
.alarm-record-dialog {
  div.meg-form-item__content {
    line-height: 40px;
  }
}
// 强行隐藏掉  此刻  快捷操作，组件库bug
.recordForm-DatePicker {
  .meg-picker-panel__links {
    .meg-button--text{
      display: none;
    }
  }
}
.i18n-en-US {
  .alarm-record-dialog {
    .meg-dialog {
      .meg-dialog-body {
        height: 430px !important;
      }
    }
    .meg-form-item__label {
      width: 173px !important;
    }
    .meg-form-item__content {
      margin-left: 173px !important;
    }
  }
}
</style>
