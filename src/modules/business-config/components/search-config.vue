<template>
  <div class="search-config">
    <config-block
      :title="$t('检索设置')">
      <meg-form
        slot="content"
        ref="search"
        :rules="configRules.search"
        label-position="right"
        label-width="234px"
        :model="configData">
        <meg-form-item
          :label="configData.deepSearchModel.name"
          class="item">
          <meg-switch
            active-color="#21539B"
            v-model="configData.deepSearchModel.value"></meg-switch>
          <span class="tip">{{ configData.deepSearchModel.remark }}</span>
        </meg-form-item>
        <meg-form-item
          prop="captureFaceThreshold.value"
          :label="configData.captureFaceThreshold.name"
          class="item">
          <meg-input-number
            :max="100"
            :min="1"
            :precision="2"
            :controls="false"
            v-model="configData.captureFaceThreshold.value"
            :placeholder="configData.captureFaceThreshold.placeholder"></meg-input-number>
          <span class="tip">{{ configData.captureFaceThreshold.remark }}</span>
        </meg-form-item>
        <meg-form-item
          prop="otherFaceThreshold.value"
          :label="configData.otherFaceThreshold.name"
          class="item">
          <meg-input-number
            :max="100"
            :min="1"
            :precision="2"
            :controls="false"
            v-model="configData.otherFaceThreshold.value"
            :placeholder="configData.otherFaceThreshold.placeholder"></meg-input-number>
          <span class="tip">{{ configData.otherFaceThreshold.remark }}</span>
        </meg-form-item>
        <meg-form-item
          :label="configData.defaultSelectionTime.name"
          class="item">
          <meg-select
            class="meg-select"
            :default-select="configData.defaultSelectionTime.value"
            :placeholder="configData.defaultSelectionTime.placeholder"
            v-model="configData.defaultSelectionTime.value">
            <meg-option
              v-for="item in timeSelectionOptions"
              :key="item.code"
              :label="item.value"
              :value="item.code">
            </meg-option>
          </meg-select>
          <span class="tip">{{ configData.defaultSelectionTime.remark }}</span>
        </meg-form-item>
        <meg-form-item
          :label="configData.bmnmRangeThreshold.name"
          class="item">
          <meg-select
            class="meg-select"
            :default-select="configData.bmnmRangeThreshold.value"
            :placeholder="configData.bmnmRangeThreshold.placeholder"
            v-model="configData.bmnmRangeThreshold.value">
            <meg-option
              v-for="item in rangeThresholdOptions"
              :key="item.code"
              :label="item.value"
              :value="item.code">
            </meg-option>
          </meg-select>
          <span class="tip">{{ configData.bmnmRangeThreshold.remark }}</span>
        </meg-form-item>
        <meg-form-item
          prop="captureFaceLimit.value"
          :label="configData.captureFaceLimit.name"
          class="item">
          <meg-input-number
            :max="1000"
            :min="1"
            :precision="0"
            :controls="false"
            v-model="configData.captureFaceLimit.value"
            :placeholder="configData.captureFaceLimit.placeholder"></meg-input-number>
          <span class="tip">{{ configData.captureFaceLimit.remark }}</span>
        </meg-form-item>
        <meg-form-item
          prop="captureOtherLimit.value"
          :label="configData.captureOtherLimit.name"
          class="item">
          <meg-input-number
            :max="1000"
            :min="1"
            :precision="0"
            :controls="false"
            v-model="configData.captureOtherLimit.value"
            :placeholder="configData.captureOtherLimit.placeholder"></meg-input-number>
          <span class="tip">{{ configData.captureOtherLimit.remark }}</span>
        </meg-form-item>
      </meg-form>
    </config-block>
    <config-block
      :title="$t('抓拍设置')">
      <meg-form
        slot="content"
        ref="capture"
        :rules="configRules.capture"
        label-position="right"
        label-width="180px"
        :model="configData">
        <meg-form-item
          :label="configData.alarmVideoLengthSec.name"
          class="item">
          <meg-input-number
            :max="15"
            :min="0"
            :precision="0"
            :controls="false"
            v-model="configData.alarmVideoLengthSec .value"
            :placeholder="configData.alarmVideoLengthSec .placeholder"></meg-input-number>
          <span class="tip">{{ configData.alarmVideoLengthSec.remark }}</span>
        </meg-form-item>
        <meg-form-item
          :label="configData.enableOneToMany.name"
          class="item">
          <meg-switch
            @change="oneToManyChange"
            v-model="configData.enableOneToMany.value"></meg-switch>
          <span class="tip">
            {{ configData.enableOneToMany.remark }}
          </span>
        </meg-form-item>
        <meg-form-item
          v-if="configData.enableOneToMany.value"
          :label="configData.staticAlbum.name"
          prop="staticAlbum.value"
          class="item">
          <meg-select
            @change="handleSelectChange"
            class="meg-select"
            multiple
            :placeholder="configData.staticAlbum.placeholder"
            v-model="albumSelection">
            <meg-option
              v-for="item in albumList"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </meg-option>
          </meg-select>
          <span class="tip">
            {{ configData.staticAlbum.remark }}
          </span>
        </meg-form-item>
      </meg-form>
    </config-block>
    <config-block
      :title="$t('导出范围阈值')">
      <meg-form
        slot="content"
        label-position="right"
        label-width="172px"
        :model="configData">
        <meg-form-item
          :label="configData.exportRange.name"
          class="item">
          <meg-select
            class="meg-select"
            :default-select="configData.exportRange.value"
            :placeholder="configData.exportRange.placeholder"
            v-model="configData.exportRange.value">
            <meg-option
              v-for="item in exportRangeOptions"
              :key="item.code"
              :label="item.value"
              :value="item.code">
            </meg-option>
          </meg-select>
          <span class="tip">{{ configData.exportRange.remark }}</span>
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
    albumList: {
      type: Array,
      default: () => []
    },
    configRules: {
      type: Object,
      default: () => {}
    },
    configData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      timeSelectionOptions: this.$store.getters.dataMapByType('kunlun_capture_search_default_selection_time'),
      maskAlarmLevel: this.$store.getters.dataMapByType('mask_alarm_level'),
      rangeThresholdOptions: this.$store.getters.dataMapByType('galaxy_capture_search_range_threshold'),
      exportRangeOptions: this.$store.getters.dataMapByType('galaxy_capture_export_range_threshold'),
      albumSelection: [],
    };
  },
  watch: {
    albumList: {
      handler(val) {
        this.filterAlbum(val);
      },
      deep: true
    }
  },
  methods: {
    /*
    * 过滤被删掉的底库
    * @param {any}
    * @return
    * */
    filterAlbum(albumList) {
      if (this.configData.staticAlbum.value && this.configData.staticAlbum.value.length > 0) {
        this.albumSelection = this.configData.staticAlbum.value.filter((item) => {
          const isExsit = albumList.findIndex((album) => album.id === item) > -1;
          return !!item && isExsit;
        });
      }
    },
    /*
    * 表单校验（外部调用）
    * @param {any}
    * @return
    * */
    validateForm() {
      const configArray = ['search', 'capture'];
      let isValid = true;
      configArray.forEach((ref) => {
        this.$refs[ref].validate((valid) => {
          if (!valid) {
            isValid = false;
          }
        });
      });
      return isValid;
    },
    /*
    * 底库选择变化
    * @param {any}
    * @return
    * */
    handleSelectChange(value) {
      this.$set(this.configData.staticAlbum, 'value', value);
    },
    /**
     * 抓拍信息都不选，则认为不展示结构化信息
     */
    faceInfo() {
      if (!this.configData.faceInfoGender.value && !this.configData.faceInfoAge.value && !this.configData.faceInfoNation.value) {
        this.configData.enableFaceInfo.value = false;
      }
    },
    /**
     * 1:N开启，静态库选择
     */
    oneToManyChange(value) {
      if (value) {
        this.configData.staticAlbum.value = '';
      }
    },
  }
};
</script>
<style lang="scss" scoped>
</style>
