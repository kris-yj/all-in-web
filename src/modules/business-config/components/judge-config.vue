<template>
  <div class="judge-config">
    <config-block
      :title="$t('研判设置')">
      <meg-form
        slot="content"
        :rules="configRules"
        label-position="right"
        ref="configForm"
        :model="configData"
        label-width="208px">
        <meg-form-item
          v-if="!isStaticSystem"
          :label="configData.peerIntervals.name"
          class="item">
          <meg-select
            class="meg-select"
            :default-select="configData.peerIntervals.defaultValue"
            v-model="configData.peerIntervals.value">
            <meg-option
              v-for="item in peerIntervalsOptions"
              :key="item.code"
              :label="item.value"
              :value="item.code">
            </meg-option>
          </meg-select>
          <span class="tip">{{ configData.peerIntervals.remark }}</span>
        </meg-form-item>
        <template v-if="enablePedestrian">
          <meg-form-item
            prop="durationFacebodyXzone.value"
            :label="configData.durationFacebodyXzone.name"
            class="item">
            <meg-input-number
              :max="300"
              :min="10"
              :precision="0"
              :controls="false"
              v-model="configData.durationFacebodyXzone.value"
              :placeholder="configData.durationFacebodyXzone.placeholder"></meg-input-number>
            <span class="tip">
              {{ configData.durationFacebodyXzone.remark }}
            </span>
          </meg-form-item>
          <meg-form-item
            prop="thresholdFacebodyXzone.value"
            :label="configData.thresholdFacebodyXzone.name"
            class="item">
            <meg-input-number
              :max="100"
              :min="1"
              :precision="2"
              :controls="false"
              v-model="configData.thresholdFacebodyXzone.value"
              :placeholder="configData.thresholdFacebodyXzone.placeholder"></meg-input-number>
            <span class="tip">
              {{ configData.thresholdFacebodyXzone.remark }}
            </span>
          </meg-form-item>
        </template>
        <template v-if="!(!isVideoNet&&isDual)">
          <meg-form-item
            :label="configData.analyticalPower.name"
            class="item">
            <meg-input-number
              :min="0"
              :precision="0"
              :controls="false"
              v-model="configData.analyticalPower.value"
              :placeholder="configData.analyticalPower.placeholder"></meg-input-number>
            <span class="tip">{{ configData.analyticalPower.remark }}</span>
          </meg-form-item>
          <meg-form-item
            :label="configData.timePeriod.name"
            class="item">
            <meg-select
              class="meg-select"
              :default-select="configData.timePeriod.defaultValue"
              v-model="configData.timePeriod.value">
              <meg-option
                v-for="item in timePeriodOptions"
                :key="item.code"
                :label="item.value"
                :value="item.code">
              </meg-option>
            </meg-select>
            <span class="tip">{{ configData.timePeriod.remark }}</span>
          </meg-form-item>
          <meg-form-item
            :label="configData.trackingTimeRange.name"
            class="item">
            <meg-select
              class="meg-select"
              :default-select="configData.trackingTimeRange.defaultValue"
              v-model="configData.trackingTimeRange.value">
              <meg-option
                v-for="item in trackingTimeRangeOptions"
                :key="item.code"
                :label="item.value"
                :value="item.code">
              </meg-option>
            </meg-select>
            <span class="tip">{{ configData.trackingTimeRange.remark }}</span>
          </meg-form-item>
          <meg-form-item
            prop="trackingMapRange.value"
            :label="configData.trackingMapRange.name"
            class="item">
            <meg-select
              class="meg-select"
              :default-select="configData.trackingMapRange.defaultValue"
              v-model="configData.trackingMapRange.value">
              <meg-option
                v-for="item in trackingMapRangeOptions"
                :key="item.code"
                :label="item.value"
                :value="item.code">
              </meg-option>
            </meg-select>
            <span class="tip">{{ configData.trackingMapRange.remark }}</span>
          </meg-form-item>
        </template>
        <meg-form-item
          :label="configData.judgeCameraLimit.name"
          class="item">
          <meg-input-number
            :min="0"
            :precision="0"
            :controls="false"
            v-model="configData.judgeCameraLimit.value"
            :placeholder="configData.judgeCameraLimit.placeholder"></meg-input-number>
          <span class="tip">{{ configData.judgeCameraLimit.remark }}</span>
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
    trackingMapRangeOptions() {
      return this.$store.getters.dataMapByType('kunlun_judge_global_tracking_distance');
    },

    timePeriodOptions() {
      return this.$store.getters.dataMapByType('kunlun_judge_global_tracking_time_range');
    },
    trackingTimeRangeOptions() {
      return this.$store.getters.dataMapByType('kunlun_judge_global_tracking_time');
    },
    isStaticSystem() {
      return this.$store.getters.systemByType('dualEnvType').value === 'static';
    },
    // 有无人体
    enablePedestrian() {
      return this.$store.getters.systemByType('enablePedestrian').value === 'true';
    },
    // 字典表map
    peerIntervalsOptions() {
      return this.$store.getters.dataMapByType('peerIntervals');
    },
    isDual() {
      return this.$store.getters.systemByType('isDual').value === 'true';
    },
    isVideoNet() {
      return this.$store.getters.systemByType('dualPlatformType').value === '0';
    },
    dualScene() {
      return Number(this.$store.getters.systemByType('dualScene').value);
    }
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
