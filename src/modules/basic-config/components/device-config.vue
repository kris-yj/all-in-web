<template>
  <div>
    <config-block
      :title="$t('设备设置')">
      <meg-form
        slot="content"
        label-position="right"
        label-width="140px"
        class="device-config-form"
        :model="configData"
        ref="deviceConfig">
        <!-- 默认部门树显示级数 -->
        <meg-form-item
          :label="configData.orgMaxExpandLevel.name"
          prop="orgMaxExpandLevel.value"
          class="item">
          <meg-input-number
            :min="1"
            :max="12"
            :precision="0"
            :controls="false"
            v-model="configData.orgMaxExpandLevel.value"
            :placeholder="configData.orgMaxExpandLevel.placeholder"></meg-input-number>
          <span class="tip">{{ configData.orgMaxExpandLevel.remark }}</span>
        </meg-form-item>
        <section class="sub-form">
          <div class="sub-title">
            {{ $t('人像卡口相机解析异常预警设置') }}
          </div>
          <meg-form-item
            :label="configData.noneCaptureTTL.name"
            class="item">
            <meg-input-number
              :min="0"
              :precision="0"
              :controls="false"
              v-model="configData.noneCaptureTTL.value"
              :placeholder="configData.noneCaptureTTL.placeholder"></meg-input-number>
            <span class="tip">{{ configData.noneCaptureTTL.remark }}</span>
          </meg-form-item>
          <meg-form-item
            :label="configData.lowQualityCaptureTTL.name"
            class="item low-quality-capture">
            <span class="tip">{{ $t('在近') }}&nbsp;</span>
            <meg-input-number
              :min="0"
              :max="7"
              :precision="0"
              :controls="false"
              v-model="configData.lowQualityCaptureTTL.value"
              :placeholder="configData.lowQualityCaptureTTL.placeholder"></meg-input-number>
            <span class="tip">{{ configData.lowQualityCaptureTTL.remark }}&nbsp;</span>
            <meg-select
              class="meg-select"
              :default-select="configData.lowQualityCapturePercent.value"
              :placeholder="configData.lowQualityCapturePercent.placeholder"
              v-model="configData.lowQualityCapturePercent.value">
              <meg-option
                v-for="item in 10"
                :key="item"
                :label="parseInt(item)*10+'%'"
                :value="`${item*10}`">
              </meg-option>
            </meg-select>
            <span class="tip">{{ $t('时，系统给出预警。') }}&nbsp;</span>
          </meg-form-item>
        </section>
        <div class="sub-form">
          <div class="sub-title">
            {{ $t('存储方案一设置') }}
          </div>
          <meg-form-item label-width="0">
            <div class="multi-line">
              <div
                class="multi-line"
                v-if="analyzerFaceEnable">
                <span class="tip">
                  <span class="title">{{ $t('人脸') }}</span>
                  {{ $t('全景图存储') }}
                  <meg-select v-model="configData.face_full_1.value">
                    <meg-option
                      v-for="item in bigImageStoreTime"
                      :value="item.value"
                      :key="item.code"></meg-option>
                  </meg-select>
                  {{ $t('天；抓拍图存储') }}
                  <meg-select v-model="configData.face_capture_1.value">
                    <meg-option
                      v-for="item in smallImageStoreTime"
                      :value="item.value"
                      :key="item.code"></meg-option>
                  </meg-select>
                  {{ $t('天；特征检索时间') }}
                  <meg-input-number
                    :min="1"
                    :precision="0"
                    v-model="configData.face_feature_index_1.value"
                    :placeholder="configData.face_feature_index_1.remark"
                    :controls="false"></meg-input-number>
                  {{ $t('天；特征存储时间') }}
                  <meg-input-number
                    :min="1"
                    v-model="configData.face_feature_1.value"
                    :placeholder="configData.face_feature_1.remark"
                    :controls="false"></meg-input-number>
                  {{ $t('天') }}；
                </span>
              </div>
              <div
                class="multi-line"
                v-if="analyzerPedestrianEnable">
                <span class="tip">
                  <span class="title">{{ $t('人体') }}</span>
                  {{ $t('全景图存储') }}
                  <meg-select v-model="configData.body_full_1.value">
                    <meg-option
                      v-for="item in bigImageStoreTime"
                      :value="item.value"
                      :key="item.code"></meg-option>
                  </meg-select>
                  {{ $t('天；抓拍图存储') }}
                  <meg-select v-model="configData.body_capture_1.value">
                    <meg-option
                      v-for="item in smallImageStoreTime"
                      :value="item.value"
                      :key="item.code"></meg-option>
                  </meg-select>
                  {{ $t('天；特征检索时间') }}
                  <meg-input-number
                    :min="1"
                    :precision="0"
                    v-model="configData.body_feature_index_1.value"
                    :placeholder="configData.body_feature_index_1.remark"
                    :controls="false"></meg-input-number>
                  {{ $t('天；特征存储时间') }}
                  <meg-input-number
                    :min="1"
                    v-model="configData.body_feature_1.value"
                    :placeholder="configData.body_feature_1.remark"
                    :controls="false"></meg-input-number>
                  {{ $t('天') }}；
                </span>
              </div>
              <div
                class="multi-line"
                v-if="analyzerVehicleEnable">
                <span class="tip">
                  <span class="title">{{ $t('机动车') }}</span>
                  {{ $t('全景图存储') }}
                  <meg-select v-model="configData.motor_full_1.value">
                    <meg-option
                      v-for="item in bigImageStoreTime"
                      :value="item.value"
                      :key="item.code"></meg-option>
                  </meg-select>
                  {{ $t('天；抓拍图存储') }}
                  <meg-select v-model="configData.motor_capture_1.value">
                    <meg-option
                      v-for="item in smallImageStoreTime"
                      :value="item.value"
                      :key="item.code"></meg-option>
                  </meg-select>
                  {{ $t('天；特征检索时间') }}
                  <meg-input-number
                    :min="1"
                    :precision="0"
                    v-model="configData.motor_feature_index_1.value"
                    :placeholder="configData.motor_feature_index_1.remark"
                    :controls="false"></meg-input-number>
                  {{ $t('天；特征存储时间') }}
                  <meg-input-number
                    :min="1"
                    v-model="configData.motor_feature_1.value"
                    :placeholder="configData.motor_feature_1.remark"
                    :controls="false"></meg-input-number>
                  {{ $t('天') }}；
                </span>
              </div>
              <div
                class="multi-line"
                v-if="analyzerNonmotorEnable">
                <span class="tip">
                  <span class="title">{{ $t('非机动车') }}</span>
                  {{ $t('全景图存储') }}
                  <meg-select v-model="configData.non_motor_full_1.value">
                    <meg-option
                      v-for="item in bigImageStoreTime"
                      :value="item.value"
                      :key="item.code"></meg-option>
                  </meg-select>
                  {{ $t('天；抓拍图存储') }}
                  <meg-select v-model="configData.non_motor_capture_1.value">
                    <meg-option
                      v-for="item in smallImageStoreTime"
                      :value="item.value"
                      :key="item.code"></meg-option>
                  </meg-select>
                  {{ $t('天；特征检索时间') }}
                  <meg-input-number
                    :min="1"
                    :precision="0"
                    v-model="configData.non_motor_feature_index_1.value"
                    :placeholder="configData.non_motor_feature_index_1.remark"
                    :controls="false"></meg-input-number>
                  {{ $t('天；特征存储时间') }}
                  <meg-input-number
                    :min="1"
                    v-model="configData.non_motor_feature_1.value"
                    :placeholder="configData.non_motor_feature_1.remark"
                    :controls="false"></meg-input-number>
                  {{ $t('天') }}；
                </span>
              </div>
            </div>
          </meg-form-item>
        </div>
        <div class="sub-form">
          <div class="sub-title">
            {{ $t('存储方案二设置') }}
          </div>
          <meg-form-item label-width="0">
            <div class="multi-line">
              <div
                class="multi-line"
                v-if="analyzerFaceEnable">
                <span class="tip">
                  <span class="title">{{ $t('人脸') }}</span>
                  {{ $t('全景图存储') }}
                  <meg-select v-model="configData.face_full_2.value">
                    <meg-option
                      v-for="item in bigImageStoreTime"
                      :value="item.value"
                      :key="item.code"></meg-option>
                  </meg-select>
                  {{ $t('天；抓拍图存储') }}
                  <meg-select v-model="configData.face_capture_2.value">
                    <meg-option
                      v-for="item in smallImageStoreTime"
                      :value="item.value"
                      :key="item.code"></meg-option>
                  </meg-select>
                  {{ $t('天；特征检索时间') }}
                  <meg-input-number
                    :min="1"
                    :precision="0"
                    v-model="configData.face_feature_index_2.value"
                    :placeholder="configData.face_feature_index_2.remark"
                    :controls="false"></meg-input-number>
                  {{ $t('天；特征存储时间') }}
                  <meg-input-number
                    :min="1"
                    v-model="configData.face_feature_2.value"
                    :placeholder="configData.face_feature_2.remark"
                    :controls="false"></meg-input-number>
                  {{ $t('天') }}；
                </span>
              </div>
              <div
                class="multi-line"
                v-if="analyzerPedestrianEnable">
                <span class="tip">
                  <span class="title">{{ $t('人体') }}</span>
                  {{ $t('全景图存储') }}
                  <meg-select v-model="configData.body_full_2.value">
                    <meg-option
                      v-for="item in bigImageStoreTime"
                      :value="item.value"
                      :key="item.code"></meg-option>
                  </meg-select>
                  {{ $t('天；抓拍图存储') }}
                  <meg-select v-model="configData.body_capture_2.value">
                    <meg-option
                      v-for="item in smallImageStoreTime"
                      :value="item.value"
                      :key="item.code"></meg-option>
                  </meg-select>
                  {{ $t('天；特征检索时间') }}
                  <meg-input-number
                    :min="1"
                    :precision="0"
                    v-model="configData.body_feature_index_2.value"
                    :placeholder="configData.body_feature_index_2.remark"
                    :controls="false"></meg-input-number>
                  {{ $t('天；特征存储时间') }}
                  <meg-input-number
                    :min="1"
                    v-model="configData.body_feature_2.value"
                    :placeholder="configData.body_feature_2.remark"
                    :controls="false"></meg-input-number>
                  {{ $t('天') }}；
                </span>
              </div>
              <div
                class="multi-line"
                v-if="analyzerVehicleEnable">
                <span class="tip">
                  <span class="title">{{ $t('机动车') }}</span>
                  {{ $t('全景图存储') }}
                  <meg-select v-model="configData.motor_full_2.value">
                    <meg-option
                      v-for="item in bigImageStoreTime"
                      :value="item.value"
                      :key="item.code"></meg-option>
                  </meg-select>
                  {{ $t('天；抓拍图存储') }}
                  <meg-select v-model="configData.motor_capture_2.value">
                    <meg-option
                      v-for="item in smallImageStoreTime"
                      :value="item.value"
                      :key="item.code"></meg-option>
                  </meg-select>
                  {{ $t('天；特征检索时间') }}
                  <meg-input-number
                    :min="1"
                    :precision="0"
                    v-model="configData.motor_feature_index_2.value"
                    :placeholder="configData.motor_feature_index_2.remark"
                    :controls="false"></meg-input-number>
                  {{ $t('天；特征存储时间') }}
                  <meg-input-number
                    :min="1"
                    v-model="configData.motor_feature_2.value"
                    :placeholder="configData.motor_feature_2.remark"
                    :controls="false"></meg-input-number>
                  {{ $t('天') }}；
                </span>
              </div>
              <div
                class="multi-line"
                v-if="analyzerNonmotorEnable">
                <span class="tip">
                  <span class="title">{{ $t('非机动车') }}</span>
                  {{ $t('全景图存储') }}
                  <meg-select v-model="configData.non_motor_full_2.value">
                    <meg-option
                      v-for="item in bigImageStoreTime"
                      :value="item.value"
                      :key="item.code"></meg-option>
                  </meg-select>
                  {{ $t('天；抓拍图存储') }}
                  <meg-select v-model="configData.non_motor_capture_2.value">
                    <meg-option
                      v-for="item in smallImageStoreTime"
                      :value="item.value"
                      :key="item.code"></meg-option>
                  </meg-select>
                  {{ $t('天；特征检索时间') }}
                  <meg-input-number
                    :min="1"
                    :precision="0"
                    v-model="configData.non_motor_feature_index_2.value"
                    :placeholder="configData.non_motor_feature_index_2.remark"
                    :controls="false"></meg-input-number>
                  {{ $t('天；特征存储时间') }}
                  <meg-input-number
                    :min="1"
                    v-model="configData.non_motor_feature_2.value"
                    :placeholder="configData.non_motor_feature_2.remark"
                    :controls="false"></meg-input-number>
                  {{ $t('天') }}；
                </span>
              </div>
            </div>
          </meg-form-item>
        </div>
        <div class="sub-form">
          <div class="sub-title">
            {{ $t('相机资源列表显示设置') }}
          </div>
          <meg-form-item
            label-width="0"
            class="item camera-resource">
            <meg-checkbox-group v-model="configData.cameraResShowOptions.value">
              <meg-checkbox
                label="4">
                人脸高质量目标占比
              </meg-checkbox>
              <meg-checkbox
                label="1">
                人体高质量目标占比
              </meg-checkbox>
              <meg-checkbox
                label="2">
                非机动车高质量目标占比
              </meg-checkbox>
              <meg-checkbox
                label="3">
                机动车高质量目标占比
              </meg-checkbox>
            </meg-checkbox-group>
          </meg-form-item>
        </div>
        <meg-form-item
          :label="configData.activePullEnable.name"
          prop="activePullEnable.value"
          class="item">
          <meg-switch
            active-color="#21539b"
            v-model="configData.activePullEnable.value"></meg-switch>
          <span class="tip">{{ configData.activePullEnable.remark }}</span>
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
  },
  data() {
    return {
      // 全景图存储
      bigImageStoreTime: this.$store.getters.dataMapByType('bigImageStoreTime'),
      // 抓拍图存储
      smallImageStoreTime: this.$store.getters.dataMapByType('littleImageStoreTime'),
      //  人体能力
      analyzerPedestrianEnable: this.analysisPlaceholder(this.$store.getters.systemByType('analyzerPedestrianEnable')).value,
      //  机动车能力
      analyzerVehicleEnable: this.analysisPlaceholder(this.$store.getters.systemByType('analyzerVehicleEnable')).value,
      //  人脸能力
      analyzerFaceEnable: this.analysisPlaceholder(this.$store.getters.systemByType('analyzerFaceEnable')).value,
      // 非机动车能力
      analyzerNonmotorEnable: this.analysisPlaceholder(this.$store.getters.systemByType('analyzerNonmotorEnable')).value,
    };
  },
  methods: {
    /**
     * 通过remark解析placeholder
     */
    analysisPlaceholder(configData) {
      // 默认添加placeholder属性
      configData.placeholder = '';
      // 在switch中不识别字符串类型的“true”和“false”，需要进行boolean转换
      if (configData.defaultValue === 'true') {
        configData.defaultValue = true;
      }
      if (configData.defaultValue === 'false') {
        configData.defaultValue = false;
      }
      if (configData.value === 'true') {
        configData.value = true;
      }
      if (configData.value === 'false') {
        configData.value = false;
      }
      if (configData && configData.remark && configData.remark.indexOf('@') > -1) {
        const arr = configData.remark.split('@');
        [configData.placeholder, configData.remark] = arr;
      }
      return configData;
    },
  }
};
</script>
<style lang="scss" scoped>
.device-config-form {
  padding: 0 20px;
  .sub-form {
    background: #fff;
    margin-bottom: 10px;
    padding: 0 20px;
    .low-quality-capture {
      &.item {
        .tip {
          color: #435068;
          font-size: 14px;
        }
      }
      &::v-deep .meg-form-item__content {
        .meg-input,
        .meg-input-number,
        .meg-select {
          width: 90px;
        }
      }
    }
  }
}
.camera-resource {
  &::v-deep .meg-checkbox-group {
    display: flex;
    flex-direction: column;
  }
}
.multi-line {
  margin-bottom: 10px;
  line-height: 40px;
  .tip {
    font-size: 14px;
    color: #435068;
    display: inline-block;
    margin-left: 5px;
  }
  .meg-select,
  .meg-input-number {
    width: 120px;
  }
  .title {
    display: inline-block;
    width: 60px;
    margin-right: 20px;
    text-align: right;
  }
}
.sub-title {
  font-size: 13px;
  font-weight: 500;
  height: 40px;
  line-height: 40px;
  color: #435068;
  border-bottom: 1px solid #dce1e5;
  margin-bottom: 30px;
}
</style>
