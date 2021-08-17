<template>
  <div class="event-config">
    <config-block
      :title="$t('布控参数设置')">
      <meg-form
        slot="content"
        ref="deployConfig"
        :rules="configRules.deploy"
        label-position="right"
        label-width="136px"
        :model="configData">
        <meg-form-item
          :label="configData.assembleDuration.name"
          class="item">
          <meg-select
            class="meg-select"
            :default-select="configData.assembleDuration.value"
            :placeholder="configData.assembleDuration.placeholder"
            v-model="configData.assembleDuration.value">
            <meg-option
              v-for="item in assembleDurationOptions"
              :key="item.code"
              :label="item.value"
              :value="item.code">
            </meg-option>
          </meg-select>
          <span class="tip">{{ configData.assembleDuration.remark }}</span>
        </meg-form-item>
        <meg-form-item
          prop="assembleNum.value"
          :label="configData.assembleNum.name"
          class="item">
          <meg-input-number
            :max="200"
            :min="0"
            :precision="0"
            :controls="false"
            v-model="configData.assembleNum.value"
            :placeholder="configData.assembleNum.placeholder"></meg-input-number>
          <span class="tip">{{ configData.assembleNum.remark }}</span>
        </meg-form-item>
      </meg-form>
    </config-block>
    <config-block
      :title="$t('导出范围阈值')">
      <meg-form
        slot="content"
        label-position="right"
        label-width="152px"
        :model="configData">
        <meg-form-item
          :label="configData.rangeThreshold.name"
          class="item">
          <meg-select
            class="meg-select"
            :default-select="configData.rangeThreshold.value"
            :placeholder="configData.rangeThreshold.placeholder"
            v-model="configData.rangeThreshold.value">
            <meg-option
              v-for="item in rangeThresholdOptions"
              :key="item.code"
              :label="item.code"
              :value="item.value">
            </meg-option>
          </meg-select>
          <span class="tip">{{ configData.rangeThreshold.remark }}</span>
        </meg-form-item>
      </meg-form>
    </config-block>
    <config-block
      :title="$t('报警阈值')">
      <meg-form
        slot="content"
        ref="alarmConfig"
        label-position="right"
        label-width="248px"
        :rules="configRules.alarm"
        :model="configData">
        <meg-form-item
          :label="configData.bodyThreshold.name"
          prop="bodyThreshold.value"
          class="item">
          <meg-input-number
            :max="100"
            :min="1"
            :precision="2"
            :controls="false"
            v-model="configData.bodyThreshold.value"
            :placeholder="configData.bodyThreshold.placeholder"></meg-input-number>
          <span class="tip">{{ configData.bodyThreshold.remark }}</span>
        </meg-form-item>
        <meg-form-item
          prop="deploymentThreshold.value"
          :label="configData.deploymentThreshold.name"
          class="item">
          <meg-input-number
            :max="100"
            :min="1"
            :precision="2"
            :controls="false"
            v-model="configData.deploymentThreshold.value"
            :placeholder="configData.deploymentThreshold.placeholder"></meg-input-number>
          <span class="tip">{{ configData.deploymentThreshold.remark }}</span>
        </meg-form-item>
        <meg-form-item
          :label="configData.motorThreshold.name"
          prop="motorThreshold.value"
          class="item">
          <meg-input-number
            :max="100"
            :min="1"
            :precision="2"
            :controls="false"
            v-model="configData.motorThreshold.value"
            :placeholder="configData.motorThreshold.placeholder"></meg-input-number>
          <span class="tip">{{ configData.motorThreshold.remark }}</span>
        </meg-form-item>
        <meg-form-item
          :label="configData.nonMotorThreshold.name"
          prop="nonMotorThreshold.value"
          class="item">
          <meg-input-number
            :max="100"
            :min="1"
            :precision="2"
            :controls="false"
            v-model="configData.nonMotorThreshold.value"
            :placeholder="configData.nonMotorThreshold.placeholder"></meg-input-number>
          <span class="tip">{{ configData.nonMotorThreshold.remark }}</span>
        </meg-form-item>
        <meg-form-item
          :label="configData.attrThreshold.name"
          prop="attrThreshold.value"
          class="item">
          <meg-input-number
            :max="1"
            :min="0"
            :precision="2"
            :controls="false"
            v-model="configData.attrThreshold.value"
            :placeholder="configData.attrThreshold.placeholder"></meg-input-number>
          <span class="tip">{{ configData.attrThreshold.remark }}</span>
        </meg-form-item>
        <meg-form-item
          prop="warningVideoTime.value"
          :label="configData.warningVideoTime.name"
          class="item">
          <meg-input-number
            :max="15"
            :min="0"
            :precision="0"
            :controls="false"
            v-model="configData.warningVideoTime.value"
            :placeholder="configData.warningVideoTime.placeholder"></meg-input-number>
          <span class="tip">{{ configData.warningVideoTime.remark }}</span>
        </meg-form-item>
        <meg-form-item
          prop="durationXzone.value"
          :label="configData.durationXzone.name"
          class="item">
          <meg-input-number
            :max="300"
            :min="10"
            :precision="0"
            :controls="false"
            v-model="configData.durationXzone.value"
            :placeholder="configData.durationXzone.placeholder"></meg-input-number>
          <span class="tip">{{ configData.durationXzone.remark }}</span>
        </meg-form-item>
        <meg-form-item
          prop="retrievalThreshold.value"
          :label="configData.retrievalThreshold.name"
          class="item">
          <meg-input-number
            :max="100"
            :min="1"
            :precision="2"
            :controls="false"
            v-model="configData.retrievalThreshold.value"
            :placeholder="configData.retrievalThreshold.placeholder"></meg-input-number>
          <span class="tip">{{ configData.retrievalThreshold.remark }}</span>
        </meg-form-item>
        <meg-form-item
          prop="alarmSound.value"
          :label="configData.alarmSound.name"
          class="item">
          <meg-select
            class="meg-select"
            :default-select="configData.alarmSound.value"
            :placeholder="configData.alarmSound.placeholder"
            v-model="configData.alarmSound.value">
            <meg-option
              v-for="item in alarmSoundOptions"
              :key="item.code"
              :label="item.value"
              :value="item.code">
            </meg-option>
          </meg-select>
          <span class="tip">{{ configData.alarmSound.remark }}</span>
        </meg-form-item>
        <meg-form-item
          prop="alarmInterval.value"
          :label="configData.alarmInterval.name"
          class="item">
          <meg-input-number
            :max="5"
            :min="0"
            :precision="0"
            :controls="false"
            v-model="configData.alarmInterval.value"
            :placeholder="configData.alarmInterval.placeholder"></meg-input-number>
          <span class="tip">{{ configData.alarmInterval.remark }}</span>
        </meg-form-item>
        <meg-form-item
          prop="distinctInterval.value"
          :label="configData.distinctInterval.name"
          class="item">
          <meg-input-number
            :max="5"
            :min="0"
            :precision="0"
            :controls="false"
            v-model="configData.distinctInterval.value"
            :placeholder="configData.distinctInterval.placeholder"></meg-input-number>
          <span class="tip">{{ configData.distinctInterval.remark }}</span>
        </meg-form-item>
        <meg-form-item
          prop="fullShowTime.value"
          :label="configData.fullShowTime.name"
          class="item">
          <meg-input-number
            :max="10"
            :min="3"
            :precision="0"
            :controls="false"
            v-model="configData.fullShowTime.value"
            :placeholder="configData.fullShowTime.placeholder"></meg-input-number>
          <span class="tip">{{ configData.fullShowTime.remark }}</span>
        </meg-form-item>
        <meg-form-item
          :label="configData.enableDuplicates.name"
          class="item">
          <meg-switch
            active-color="#21539B"
            v-model="configData.enableDuplicates.value"></meg-switch>
          <span class="tip">{{ configData.enableDuplicates.remark }}</span>
        </meg-form-item>
        <meg-form-item
          :label="configData.videoResolution.name"
          class="item">
          <meg-select
            class="meg-select"
            :default-select="configData.videoResolution.value"
            :placeholder="configData.videoResolution.placeholder"
            v-model="configData.videoResolution.value">
            <meg-option
              v-for="item in videoResolutionOptions"
              :key="item.code"
              :label="item.value"
              :value="item.code">
            </meg-option>
          </meg-select>
          <span class="tip">{{ configData.videoResolution.remark }}</span>
        </meg-form-item>
        <meg-form-item
          :label="configData.alarmLevel.name"
          class="item">
          <meg-select
            class="meg-select"
            :default-select="configData.alarmLevel.value"
            :placeholder="configData.alarmLevel.placeholder"
            v-model="configData.alarmLevel.value">
            <meg-option
              v-for="item in alarmLevelOptions"
              :key="item.code"
              :label="item.value"
              :value="item.code">
            </meg-option>
          </meg-select>
          <span class="tip">{{ configData.alarmLevel.remark }}</span>
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
    }
  },
  data() {
    return {
      alarmLevelOptions: this.$store.getters.dataMapByType('kunlun_event_alarm_level'),
      alarmSoundOptions: this.$store.getters.dataMapByType('kunlun_alarm_sound_default_config'),
      assembleDurationOptions: this.$store.getters.dataMapByType('kunlun_body_assemble_duration'),
      rangeThresholdOptions: this.$store.getters.dataMapByType('kunlun_export_warn_range_threshold'),
      videoResolutionOptions: this.$store.getters.dataMapByType('videoResolution'),
    };
  },
  methods: {
    /*
    * 表单校验（外部调用）
    * @param {any}
    * @return
    * */
    validateForm() {
      const configArray = ['deployConfig', 'alarmConfig'];
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
  }
};
</script>
<style lang="scss" scoped>
</style>
