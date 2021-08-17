<template>
  <div class="versionInfoConfig">
    <config-block
      :title="$t('质量设置')">
      <meg-form
        slot="content"
        label-position="right"
        label-width="134px"
        :model="configData"
        :rules="configRules">
        <meg-form-item
          :label="configData.bodyQuality.name"
          prop="bodyQuality.value"
          class="item">
          <meg-input-number
            :max="5"
            :min="1"
            :precision="1"
            :controls="false"
            v-model="configData.bodyQuality.value"
            :placeholder="configData.bodyQuality.placeholder"></meg-input-number>
          <span class="tip">{{ configData.bodyQuality.remark }}</span>
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
    };
  }
};
</script>
<style lang="scss" scoped>
</style>
