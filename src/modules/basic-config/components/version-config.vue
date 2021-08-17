<template>
  <div class="versionInfoConfig">
    <config-block
      :title="$t('版本信息')">
      <meg-form
        slot="content"
        label-position="right"
        label-width="134px"
        :model="configData"
        :rules="configRules">
        <meg-form-item
          :label="configData.systemVersion.name"
          prop="systemVersion.value"
          class="item">
          <meg-input
            :disabled="disabled"
            v-model="configData.systemVersion.value"
            :placeholder="configData.systemVersion.placeholder"></meg-input>
          <span class="tip">{{ configData.systemVersion.remark }}</span>
        </meg-form-item>
        <meg-form-item
          :label="configData.coreVersion.name"
          prop="coreVersion.value"
          class="item">
          <meg-input
            :disabled="disabled"
            v-model="configData.coreVersion.value"
            :placeholder="configData.coreVersion.placeholder"></meg-input>
          <span class="tip">{{ configData.coreVersion.remark }}</span>
        </meg-form-item>
        <meg-form-item
          :label="configData.kunlunVersion.name"
          prop="kunlunVersion.value"
          class="item">
          <meg-input
            :disabled="disabled"
            v-model="configData.kunlunVersion.value"
            :placeholder="configData.kunlunVersion.placeholder"></meg-input>
          <span class="tip">{{ configData.kunlunVersion.remark }}</span>
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
  data() {
    return {
      disabled: true,
    };
  }
};
</script>
<style lang="scss" scoped>
</style>
