<template>
  <div class="database-config">
    <config-block
      :title="$t('底库设置')">
      <meg-form
        slot="content"
        label-position="right"
        label-width="204px"
        :model="configData"
        ref="databaseConfig">
        <meg-form-item
          :label="configData.albumFilterNum.name"
          class="item">
          <meg-select
            class="meg-select"
            :default-select="configData.albumFilterNum.value"
            :placeholder="configData.albumFilterNum.placeholder"
            v-model="configData.albumFilterNum.value">
            <meg-option
              label="0"
              value="0">
            </meg-option>
            <meg-option
              v-for="item in 5"
              :key="item"
              :label="item"
              :value="item">
            </meg-option>
          </meg-select>
          <span class="tip">{{ configData.albumFilterNum.remark }}</span>
        </meg-form-item>
        <meg-form-item
          :label="configData.personCardSaveDays.name"
          class="item">
          <meg-input-number
            :min="0"
            :max="720"
            :precision="0"
            :controls="false"
            v-model="configData.personCardSaveDays.value"
            :placeholder="$t('请输入天数')"></meg-input-number>
          <span class="tip">{{ configData.personCardSaveDays.remark }}</span>
        </meg-form-item>
        <meg-form-item
          :label="configData.personCardDeployAlbum.name"
          class="item">
          <meg-select
            multiple
            @change="handleSelectChange"
            :multiple-limit="8"
            class="meg-select"
            :default-select="configData.personCardDeployAlbum.value"
            :placeholder="$t('请选择')"
            v-model="configData.personCardDeployAlbum.value">
            <meg-option
              v-for="item in albumList"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </meg-option>
          </meg-select>
          <span class="tip">{{ configData.personCardDeployAlbum.remark }}</span>
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
    albumList: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    handleSelectChange(value) {
      this.$set(this.configData.personCardDeployAlbum, 'value', value);
    }
  }
};
</script>
