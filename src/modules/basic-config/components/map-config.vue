<template>
  <div>
    <config-block
      :title="$t('地图设置')">
      <meg-form
        slot="content"
        label-position="right"
        label-width="187px"
        :rules="configRules"
        :model="configData"
        ref="mapConfig">
        <meg-form-item
          :label="configData.mapCenterLon.name"
          prop="mapCenterLon.value"
          class="item">
          <meg-input
            v-model="configData.mapCenterLon.value"
            :placeholder="configData.mapCenterLon.placeholder"></meg-input>
          <span class="tip">{{ configData.mapCenterLon.remark }}</span>
        </meg-form-item>
        <meg-form-item
          :label="configData.mapCenterLat.name"
          prop="mapCenterLat.value"
          class="item">
          <meg-input
            v-model="configData.mapCenterLat.value"
            :placeholder="configData.mapCenterLat.placeholder"></meg-input>
          <span class="tip">{{ configData.mapCenterLat.remark }}</span>
        </meg-form-item>
        <meg-form-item
          :label="configData.mapMin.name"
          prop="mapMin.value"
          class="item">
          <meg-input
            v-model="configData.mapMin.value"
            :placeholder="configData.mapMin.placeholder"></meg-input>
          <span class="tip">{{ configData.mapMin.remark }}</span>
        </meg-form-item>
        <meg-form-item
          :label="configData.mapMax.name"
          prop="mapMax.value"
          class="item">
          <meg-input
            v-model="configData.mapMax.value"
            :placeholder="configData.mapMax.placeholder"></meg-input>
          <span class="tip">{{ configData.mapMax.remark }}</span>
        </meg-form-item>
        <meg-form-item
          :label="configData.mapLevel.name"
          prop="mapLevel.value"
          class="item">
          <meg-input
            v-model="configData.mapLevel.value"
            :placeholder="configData.mapLevel.placeholder"></meg-input>
          <span class="tip">{{ configData.mapLevel.remark }}</span>
        </meg-form-item>
        <meg-form-item
          :label="configData.mapMergeValue.name"
          prop="mapMergeValue.value"
          class="item">
          <meg-input
            v-model="configData.mapMergeValue.value"
            :placeholder="configData.mapMergeValue.placeholder"></meg-input>
          <span class="tip">{{ configData.mapMergeValue.remark }}</span>
        </meg-form-item>
        <meg-form-item
          :label="configData.mapSource.name"
          prop="mapSource.value"
          class="item">
          <meg-input
            resize="none"
            rows="4"
            type="textarea"
            v-model="configData.mapSource.value"
            :placeholder="configData.mapSource.placeholder"></meg-input>
          <span class="tip">{{ configData.mapSource.remark }}</span>
        </meg-form-item>
        <meg-form-item
          :label="configData.mapType.name"
          class="item">
          <meg-select
            class="meg-select"
            :default-select="configData.mapType.value"
            :placeholder="configData.mapType.placeholder"
            v-model="configData.mapType.value">
            <meg-option
              v-for="item in mapTypeOptions"
              :key="item.code"
              :label="item.value"
              :value="item.code">
            </meg-option>
          </meg-select>
          <span class="tip">{{ configData.mapType.remark }}</span>
        </meg-form-item>
        <meg-form-item
          :label="configData.customMapSource.name"
          prop="customMapSource.value"
          class="item">
          <meg-input
            resize="none"
            rows="4"
            type="textarea"
            v-model="configData.customMapSource.value"
            :placeholder="configData.customMapSource.placeholder"></meg-input>
          <span class="tip">{{ configData.customMapSource.remark }}</span>
        </meg-form-item>
        <meg-form-item
          :label="configData.customMapType.name"
          class="item">
          <meg-select
            class="meg-select"
            :default-select="configData.customMapType.value"
            :placeholder="configData.customMapType.placeholder"
            v-model="configData.customMapType.value">
            <meg-option
              v-for="item in mapTypeOptions"
              :key="item.code"
              :label="item.value"
              :value="item.code">
            </meg-option>
          </meg-select>
          <span class="tip">{{ configData.customMapType.remark }}</span>
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
    },
  },
  data() {
    return {
      mapTypeOptions: this.$store.getters.dataMapByType('mapTypeOptions'),
    };
  },
  methods: {
    /*
    * 表单校验（外部调用）
    * @param {any}
    * @return
    * */
    validateForm() {
      let isValid = false;
      this.$refs.mapConfig.validate((value) => {
        isValid = value;
      });
      return isValid;
    }
  }
};
</script>
