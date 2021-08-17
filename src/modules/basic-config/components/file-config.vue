<template>
  <div>
    <config-block
      :title="$t('文件设置')">
      <meg-form
        slot="content"
        label-position="right"
        label-width="200px"
        :model="configData"
        ref="fileConfigData">
        <!--切片时长-->
        <meg-form-item
          :label="configData.slicingTime.name"
          class="item">
          <meg-select
            class="meg-select"
            :default-select="configData.slicingTime.value"
            :placeholder="configData.slicingTime.placeholder"
            v-model="configData.slicingTime.value">
            <meg-option
              v-for="item in slicingTimeOptions"
              :key="item.code"
              :label="item.value"
              :value="item.code">
            </meg-option>
          </meg-select>
          <span class="tip">{{ configData.slicingTime.remark }}</span>
        </meg-form-item>
        <!--视频默认校时时间-->
        <meg-form-item
          :label="configData.calibrationTime.name"
          class="item">
          <meg-date-picker
            v-model="configData.calibrationTime.value"
            type="date"
            value-format="yyyy-MM-dd"
            format="yyyy-MM-dd"
            :picker-options="pickerOptions"
            placeholder="选择日期">
          </meg-date-picker>
          <span class="tip">{{ configData.calibrationTime.remark }}</span>
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
    slicingTimeOptions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      pickerOptions: {
        disabledDate(date) {
          return date.getTime() < (new Date('1980/1/1')).getTime();
        }
      },
    };
  }
};
</script>
