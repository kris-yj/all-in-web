<template>
  <div class="analyze-config">
    <config-block
      :title="$t('录像解析倍速设置')">
      <meg-form
        slot="content"
        ref="configForm"
        :rules="configRules"
        label-position="right"
        label-width="208px"
        :model="configData">
        <meg-form-item
          prop="platformCapabilities.value"
          :label="configData.platformCapabilities.name"
          class="item">
          <meg-input-number
            :min="1"
            :precision="0"
            :controls="false"
            v-model="configData.platformCapabilities.value"
            :placeholder="configData.platformCapabilities.placeholder"></meg-input-number>
          <span class="tip">{{ configData.platformCapabilities.remark }}</span>
        </meg-form-item>
        <meg-form-item
          prop="historySlicingTime.value"
          :label="configData.historySlicingTime.name"
          class="item">
          <meg-select
            class="meg-select"
            :default-select="configData.historySlicingTime.value"
            :placeholder="configData.historySlicingTime.placeholder"
            v-model="configData.historySlicingTime.value">
            <meg-option
              v-for="item in historySlicingTimeOption"
              :key="item.code"
              :label="item.value"
              :value="item.code">
            </meg-option>
          </meg-select>
          <span class="tip">{{ configData.historySlicingTime.remark }}</span>
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
    configData: {
      type: Object,
      default: () => {}
    },
    configRules: {
      type: Object,
      default: () => {}
    },
  },
  computed: {
    historySlicingTimeOption() {
      return this.$store.getters.dataMapByType('history_slicing_time');
    },
  },
  methods: {
    /*
    * 表单校验（外部调用）
    * @param {any}
    * @return
    * */
    validateForm() {
      let isValid = true;
      this.$refs.configForm.validate((valid) => {
        isValid = valid;
      });
      return isValid;
    },
  }
};
</script>
<style lang="scss" scoped>
</style>
