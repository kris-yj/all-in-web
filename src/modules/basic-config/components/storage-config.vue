<template>
  <div>
    <config-block
      :title="$t('存储设置')">
      <meg-form
        slot="content"
        label-position="right"
        label-width="214px"
        :model="configData"
        ref="storageConfigData">
        <meg-form-item
          :label="configData.offlineFileSize.name"
          class="item">
          <meg-select
            class="meg-select"
            :default-select="configData.offlineFileSize.value"
            :placeholder="configData.offlineFileSize.placeholder"
            v-model="configData.offlineFileSize.value">
            <meg-option
              v-for="item in storageOptions"
              :key="item.code"
              :label="item.value"
              :value="item.code">
            </meg-option>
          </meg-select>
          <span class="tip">{{ configData.offlineFileSize.remark }}</span>
        </meg-form-item>
        <meg-form-item
          :label="configData.imgStoreNum.name"
          prop="imgStoreNum.value"
          class="item">
          <meg-input-number
            :min="1"
            :max="100"
            :precision="0"
            :controls="false"
            v-model="configData.imgStoreNum.value"
            :placeholder="configData.imgStoreNum.placeholder"></meg-input-number>
          <span class="tip">{{ configData.imgStoreNum.remark }}</span>
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
    storageOptions: {
      type: Array,
      default: () => []
    }
  },
};
</script>
