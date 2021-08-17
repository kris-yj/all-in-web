<template>
  <div class="login-config">
    <config-block
      :title="$t('登录设置')">
      <meg-form
        slot="content"
        label-position="right"
        label-width="187px"
        :rules="configRules"
        :model="configData"
        ref="loginConfigForm">
        <meg-form-item
          :label="configData.expiration.name"
          prop="expiration.value"
          class="item">
          <meg-input-number
            :max="168"
            :min="1"
            :precision="1"
            :controls="false"
            v-model="configData.expiration.value"
            :placeholder="configData.expiration.placeholder"></meg-input-number>
          <span class="tip">{{ configData.expiration.remark }}</span>
        </meg-form-item>
        <meg-form-item
          :label="configData.verificationCode.name"
          class="item">
          <meg-switch
            active-value="1"
            inactive-value="0"
            active-color="#21539B"
            v-model="configData.verificationCode.value"></meg-switch>
          <span class="tip">{{ configData.verificationCode.remark }}</span>
        </meg-form-item>
      </meg-form>
    </config-block>
  </div>
</template>
<script>
import ConfigBlock from './config-block';

export default {
  components: {
    ConfigBlock
  },
  props: {
    configRules: {
      type: Object,
      default: () => {}
    },
    configData: {
      type: Object,
      default: () => {}
    }
  },
  methods: {
    /*
    * 表单校验（外部调用）
    * @param {any}
    * @return
    * */
    validateForm() {
      let isValid = false;
      this.$refs.loginConfigForm.validate((value) => {
        isValid = value;
      });
      return isValid;
    }
  }
};
</script>
<style lang="scss" scoped>
</style>
