<template>
  <meg-dialog
    class="update-password"
    width="320px"
    :visible="isShow"
    :title="$t('修改密码')"
    @close="closeClick">
    <div
      class="update-password-wrap">
      <meg-form
        ref="updatePasswordForm"
        label-position="top"
        :rules="updatePasswordRules"
        :model="updatePasswordModel">
        <meg-form-item
          :label="$t('旧密码')"
          prop="userPwd">
          <meg-input
            v-model="updatePasswordModel.userPwd"
            type="password"
            :placeholder="$t('请输入{entity}', { entity: $t('旧密码') })">
          </meg-input>
        </meg-form-item>
        <meg-form-item
          :label="$t('新密码')"
          prop="newPwd">
          <meg-input
            v-model="updatePasswordModel.newPwd"
            type="password"
            :placeholder="$t('请输入{entity}', { entity: $t('新密码') })">
          </meg-input>
        </meg-form-item>
        <meg-form-item
          :label="$t('确认新密码')"
          prop="newPwdConfirm">
          <meg-input
            v-model="updatePasswordModel.newPwdConfirm"
            type="password"
            :placeholder="$t('请输入{entity}', { entity: $t('新密码') })">
          </meg-input>
        </meg-form-item>
      </meg-form>
    </div>
    <span slot="footer">
      <meg-button
        type="primary"
        @click="onConfirm">{{ $t('确定') }}</meg-button>
      <meg-button @click="closeClick">{{ $t('取消') }}</meg-button>
    </span>
  </meg-dialog>
</template>
<script>
export default {
  props: {
    isShow: {
      type: Boolean,
      default: true
    }
  },
  data() {
    const validatePassword = (rule, value, callback) => {
      if (!value) {
        callback(new Error(this.$t('请输入{entity}', {
          entity: this.$t('新密码')
        })));
        return;
      }
      if (value.length < 8 || value.length > 16) {
        callback(new Error(this.$t('请输入{from}-{to}位字符', {
          from: 8,
          to: 16
        })));
        return;
      }
      let successNumber = 0;
      if (/((?=[\x21-\x7e]+)[^A-Za-z0-9])/.test(value)) successNumber += 1; // 至少一个特殊字符
      if (/[a-z]/.test(value)) successNumber += 1; // 至少一个小写字母
      if (/[A-Z]/.test(value)) successNumber += 1; // 至少一个大写字母
      if (/[0-9]/.test(value)) successNumber += 1; // 至少一个数字
      if (successNumber >= 2) { // 至少二条满足则通过
        callback();
      } else {
        callback(new Error(this.$t('需包括字母、数字和特殊字符')));
      }
    };
    // const validatePass = (rule, value, callback) => {
    //   if (value === '') {
    //     callback(new Error(this.$t('请输入{entity}', {
    //       entity: this.$t('新密码')
    //     })));
    //   } else {
    //     if (this.updatePasswordModel.newPwd !== '') {
    //       this.$refs.updatePasswordForm.validateField('newPwdConfirm');
    //     }
    //     callback();
    //   }
    // };
    const validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error(this.$t('请再次输入新密码')));
      } else if (value !== this.updatePasswordModel.newPwd) {
        callback(new Error(this.$t('两次输入密码不一致!')));
      } else {
        callback();
      }
    };
    return {
      updatePasswordModel: {
        userPwd: '',
        newPwd: '',
        newPwdConfirm: ''
      },
      updatePasswordRules: {
        userPwd: [{
          required: true,
          message: this.$t('请输入{entity}', {
            entity: this.$t('旧密码')
          }),
          trigger: 'blur'
        }],
        newPwd: [{
          required: true,
          validator: validatePassword,
          trigger: 'blur'
        }],
        newPwdConfirm: [{
          required: true,
          validator: validatePass2,
          trigger: 'blur'
        }],
      }
    };
  },
  methods: {
    onConfirm() {
      // 验证
      this.$refs.updatePasswordForm.validate((valid) => {
        if (valid) {
          this.submitForm();
        }
      });
    },
    submitForm() {
      const params = {
        userPwd: this.updatePasswordModel.userPwd,
        newPwd: this.updatePasswordModel.newPwd
      };
      this.$emit('update-password-confirm', params);
    },
    closeClick() {
      this.$emit('update-password-close');
      this.$refs.updatePasswordForm.resetFields();
    }
  }
};
</script>
<style lang="scss">
.update-password {
  .update-password-wrap {
    height: 240px;
  }
}
</style>
