<template>
  <div class="camera-detail">
    <meg-dialog
      width="1100px"
      body-height="583px"
      :title="$t('相机详情')"
      :visible="visible"
      @close="cancelDialog">
      <section
        class="dialog-body">
        <div class="info-box">
          <section class="form-items">
            <div class="detail-area">
              <detail-item>
                <h3
                  class="area-title"
                  slot="label">
                  {{ $t('基本信息') }}
                </h3>
              </detail-item>
              <detail-item
                :label="$t('相机名称')"
                :value="detailData.name"></detail-item>
              <div class="items-container">
                <detail-item
                  :label="$t('相机类型')"
                  :value="cameraTypeMap[detailData.type]"></detail-item>
                <!-- TODO -->
                <detail-item
                  :label="$t('卡口类型')"
                  :value="monitoringTypeMap[detailData.monitoringType]"></detail-item>
                <detail-item
                  :label="$t('归属区域')"
                  :value="detailData.placeName"></detail-item>
                <detail-item
                  :label="$t('重点单位')"
                  :value="detailData.unitName"></detail-item>
                <detail-item
                  v-show="detailData.managementName"
                  :label="$t('应用管理部门')"
                  :value="detailData.managementName"></detail-item>
                <detail-item
                  :label="$t('所属分组')"
                  :value="detailData.tagName"></detail-item>
                <detail-item
                  :label="$t('设备标签')"
                  :value="handleTagCodes(detailData.labelCodes)"></detail-item>
                <detail-item
                  :label="$t('相机协议')"
                  :value="cameraCompanyMap[detailData.manufacturer]"></detail-item>
                <detail-item
                  value-width="0px"
                  :label="$t('备注')">
                  <div
                    class="value-wrap"
                    v-tooltip:2="true"
                    :title="detailData.remark"
                    slot="one">
                    {{ detailData.remark }}
                  </div>
                </detail-item>

                <template v-if="detailData.type==='12' && cameraType === 'faceCamera'">
                  <detail-item
                    :label="$t('智能盒名称')"
                    :value="detailData.boxName"></detail-item>
                  <detail-item
                    :label="$t('通道号')"
                    :value="detailData.chanelNum"></detail-item>
                </template>
                <template v-if="cameraType === 'structureCamera' && cameraResShowOptions.length">
                  <detail-item
                    :label="$t('解析质量')">
                    <div
                      slot="value"
                      class="save-config-text">
                      <p v-if="filterCondition('1')">
                        {{ $t('人体高质量占比') }}：{{ detailData.bodyAnalyze }}%
                      </p>
                      <p v-if="filterCondition('2')">
                        {{ $t('非机动车高质量占比') }}：{{ detailData.nonMotorVehicleAnalyze }}%
                      </p>
                      <p v-if="filterCondition('3')">
                        {{ $t('机动车高质量占比') }}：{{ detailData.motorVehicleAnalyze }}%
                      </p>
                    </div>
                  </detail-item>
                </template>

                <!-- <detail-item
            label="相机权限"
            :value="detailData.shareModel==='0'?'公共相机':'自定义相机'"></detail-item> -->
                <!-- <detail-item
            v-show="detailData.shareModel==='1'"
            label="共享设置">
            <div
              class="value-wrap"
              v-mltooltip:3="{innerHtml: getShareListString()}"
              slot="value">
            </div>

          </detail-item> -->
              </div>
            </div>
            <div
              class="detail-area">
              <div class="items-container">
                <detail-item>
                  <h3
                    class="area-title"
                    slot="label">
                    {{ $t('业务属性') }}
                  </h3>
                </detail-item>
                <detail-item></detail-item>
                <detail-item
                  v-if="isShowStorge"
                  value-width="100%"
                  :label="$t('存储设置')">
                  <div
                    slot="value"
                    class="save-config-text">
                    <div class="save-config-label">
                      {{ storageSchemeOption[detailData.storageScheme-1].label }}
                    </div>
                    <p v-if="analyzerFaceEnable">
                      人脸: 全景图{{ storageSchemeOption[detailData.storageScheme-1].face_full }}天,抓拍图{{ storageSchemeOption[detailData.storageScheme-1].face_capture }}天,特征检索{{ storageSchemeOption[detailData.storageScheme-1].face_feature_index }}天,特征存储{{ storageSchemeOption[detailData.storageScheme-1].face_feature }}天
                    </p>
                    <p v-if="analyzerPedestrianEnable">
                      人体: 全景图{{ storageSchemeOption[detailData.storageScheme-1].body_full }}天,抓拍图{{ storageSchemeOption[detailData.storageScheme-1].body_capture }}天,特征检索{{ storageSchemeOption[detailData.storageScheme-1].body_feature_index }}天,特征存储{{ storageSchemeOption[detailData.storageScheme-1].body_feature }}天
                    </p>
                    <p v-if="analyzerVehicleEnable">
                      机动车: 全景图{{ storageSchemeOption[detailData.storageScheme-1].motor_full }}天,抓拍图{{ storageSchemeOption[detailData.storageScheme-1].motor_capture }}天,特征检索{{ storageSchemeOption[detailData.storageScheme-1].motor_feature_index }}天,特征存储{{ storageSchemeOption[detailData.storageScheme-1].motor_feature }}天
                    </p>
                    <p v-if="analyzerNonmotorEnable">
                      非机动车: 全景图{{ storageSchemeOption[detailData.storageScheme-1].non_motor_full }}天,抓拍图{{ storageSchemeOption[detailData.storageScheme-1].non_motor_capture }}天,特征检索{{ storageSchemeOption[detailData.storageScheme-1].non_motor_feature_index }}天,特征存储{{ storageSchemeOption[detailData.storageScheme-1].non_motor_feature }}天
                    </p>
                  </div>
                </detail-item>
                <!-- <div class="items-container">
            <detail-item
              v-if="cameraType === 'faceCamera'"
              :label="$t('启用状态')"
              :value="detailData.closed? $t('关闭'):$t('开启')"></detail-item>
            <detail-item
              v-if="[1,2,3,10].includes(detailData.monitoringType) && cameraType === 'faceCamera'"
              :label="$t('状态刷新')"
              :value="initStatusSyncInterval(detailData)"></detail-item>
          </div> -->
                <detail-item
                  :label="$t('人脸框模式')"
                  v-if="cameraType === 'faceCamera'"
                  :value="faceFrameModeMap[detailData.fullRectModel]"></detail-item>
                <detail-item
                  :label="$t('报警小视频')"
                  v-if="$store.getters.systemByType('alarmShortVideo').value !== '0'"
                  :value="detailData.alarmShortVideo ? $t('开启'):$t('关闭')"></detail-item>
                <detail-item
                  :label="$t('低质量')"
                  v-if="cameraType === 'faceCamera'"
                  :value="detailData.lowQuality ? $t('开启'):$t('关闭')"></detail-item>
                <!-- <detail-item
            label="相机型号"
            :value="detailData.modelName"></detail-item>
          <detail-item
            label="国标平台ID"
            :value="detailData.gbPlatformId"></detail-item>
          <detail-item
            label="国标平台设备ID"
            :value="detailData.gbPlatformDeviceId"></detail-item>
          <template v-if="detailData.type==='12'">
            <detail-item
              label="关联智能盒名称"
              :value="detailData.boxInfo.name"></detail-item>
            <detail-item
              label="关联智能盒型号"
              :value="detailData.boxInfo.modelName"></detail-item>
            <detail-item
              v-if="cameraType==='camera'"
              label="通道号"
              :value="detailData.boxInfo.channelNumber">
            </detail-item>
          </template> -->
              </div>
            </div>
            <div class="detail-area no-border">
              <div class="items-container">
                <div class="items-container items-container-start">
                  <detail-item>
                    <h3
                      class="area-title"
                      slot="label">
                      {{ $t('权限配置') }}
                    </h3>
                  </detail-item>
                  <detail-item
                    :label="$t('相机权限')"
                    :value="processShareModel(detailData.shareModel)"></detail-item>
                  <detail-item
                    :label="$t('共享人员')"
                    v-if="detailData.shareModel === '1'"
                    :value="detailData.shareList ? detailData.shareList.map(val => val.shareName).join('') : ''"></detail-item>
                </div>
                <!-- 占位用 -->
                <detail-item>
                </detail-item>
                <!-- <div
            v-if="cameraType === 'faceCamera'"
            class="items-container items-container-start">
            <detail-item>
              <h3
                class="area-title"
                slot="label">
                {{ $t('状态信息') }}
              </h3>
            </detail-item>
            <detail-item
              :label="$t('解析状态')"
              :value="processStatus(detailData.status)"></detail-item>
          </div> -->
              </div>
            </div>
          </section>
          <section class="location-info">
            <meg-row
              type="flex"
              :gutter="2">
              <meg-col :span="12">
                <detail-item
                  :label="$t('经度')"
                  label-width="30px"
                  value-width="80px"
                  label-align="left"
                  :value="detailData.lon">
                </detail-item>
              </meg-col>
              <meg-col :span="12">
                <detail-item
                  :label="$t('纬度')"
                  label-width="30px"
                  value-width="80px"
                  label-align="left"
                  :value="detailData.lat"></detail-item>
              </meg-col>
            </meg-row>
            <div class="map-area">
              <position-display-map
                :feature-data="{lon:detailData.lon,lat:detailData.lat}">
              </position-display-map>
              <!-- <meg-box-display-map
          v-if="cameraType==='box' && cameraMapData.keyData"
          :features-data="cameraMapData.featuresData"
          :key-feature="cameraMapData.keyData">
        </meg-box-display-map> -->
            </div>
            <detail-item
              :value="detailData.location"
              label-align="left"
              label-width="68"
              :label="$t('相机位置')">
            </detail-item>
            <!-- <detail-item
        :value="getLocationTypeValue(detailData.locationType)"
        label-align="left"
        label-width="68"
        label="位置类型">
      </detail-item> -->
          </section>
        </div>
      </section>
    </meg-dialog>
  </div>
</template>
<script>

import PositionDisplayMap from '@/common-components/common-maps/position-display-map';
import DetailItem from './dialog-detail-item';

export default {
  components: {
    DetailItem,
    PositionDisplayMap
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    detailData: {
      type: Object,
      default: () => {}
    },
    // 相机类型，faceCamera 人像卡口相机 structureCamera 结构化相机
    cameraType: {
      type: String,
      default: 'faceCamera'
    },
    cameraTypeOption: {
      type: Array,
      default: () => []
    },
    faceFrameModeOption: {
      type: Array,
      default: () => []
    },
    monitoringTypeOption: {
      type: Array,
      default: () => []
    },
  },
  data() {
    return {
      locationTypeData: this.$store.getters.dataMapByType('wisdom_location_type'),
      cameraCompanyOption: this.$store.getters.dataMapByType('camera_company'),
      cameraResShowOptions: [],
      deviceTagOption: this.$store.getters.dataMapByType('device_tag'),
      //  人体能力
      analyzerPedestrianEnable: this.$store.getters.systemByType('analyzerPedestrianEnable').value === 'true',
      //  机动车能力
      analyzerVehicleEnable: this.$store.getters.systemByType('analyzerVehicleEnable').value === 'true',
      //  人脸能力
      analyzerFaceEnable: this.$store.getters.systemByType('analyzerFaceEnable').value === 'true',
      // 非机动车能力
      analyzerNonmotorEnable: this.$store.getters.systemByType('analyzerNonmotorEnable').value === 'true',
      storageSchemeOption: [
        {
          key: 1,
          label: this.$t('方案一'),
          face_full: this.$store.getters.systemByType('face_full_1').value, // 方案1人脸全景图存储时间
          face_capture: this.$store.getters.systemByType('face_capture_1').value, // 方案1人脸抓拍图存储时间
          face_feature: this.$store.getters.systemByType('face_feature_1').value, // 方案1人脸特征存储时间
          face_feature_index: this.$store.getters.systemByType('face_feature_index_1').value, // 方案1人脸特征检索时间
          body_full: this.$store.getters.systemByType('body_full_1').value, // 方案1人体全景图存储时间
          body_capture: this.$store.getters.systemByType('body_capture_1').value, // 方案1人体抓拍图存储时间
          body_feature: this.$store.getters.systemByType('body_feature_1').value, // 方案1人体特征存储时间
          body_feature_index: this.$store.getters.systemByType('body_feature_index_1').value, // 方案1人体特征检索时间
          motor_full: this.$store.getters.systemByType('motor_full_1').value, // 方案1机动车全景图存储时间
          motor_capture: this.$store.getters.systemByType('motor_capture_1').value, // 方案1机动车抓拍图存储时间
          motor_feature_index: this.$store.getters.systemByType('motor_feature_index_1').value, // 方案1机动车特征检索时间
          motor_feature: this.$store.getters.systemByType('motor_feature_1').value, // 方案1机动车特征存储时间
          non_motor_full: this.$store.getters.systemByType('non_motor_full_1').value, // 方案1非机动车全景图存储时间
          non_motor_capture: this.$store.getters.systemByType('non_motor_capture_1').value, // 方案1非机动车抓拍图存储时间
          non_motor_feature_index: this.$store.getters.systemByType('non_motor_feature_index_1').value, // 方案1非机动车特征检索时间
          non_motor_feature: this.$store.getters.systemByType('non_motor_feature_1').value, // 方案1非机动车特征存储时间

        },
        {
          key: 2,
          label: this.$t('方案二'),
          face_full: this.$store.getters.systemByType('face_full_2').value, // 方案2人脸全景图存储时间
          face_capture: this.$store.getters.systemByType('face_capture_2').value, // 方案2人脸抓拍图存储时间
          face_feature: this.$store.getters.systemByType('face_feature_2').value, // 方案2人脸特征存储时间
          face_feature_index: this.$store.getters.systemByType('face_feature_index_2').value, // 方案2人脸特征检索时间
          body_full: this.$store.getters.systemByType('body_full_2').value, // 方案2人体全景图存储时间
          body_capture: this.$store.getters.systemByType('body_capture_2').value, // 方案2人体抓拍图存储时间
          body_feature: this.$store.getters.systemByType('body_feature_2').value, // 方案2人体特征存储时间
          body_feature_index: this.$store.getters.systemByType('body_feature_index_2').value, // 方案2人体特征检索时间
          motor_full: this.$store.getters.systemByType('motor_full_2').value, // 方案2机动车全景图存储时间
          motor_capture: this.$store.getters.systemByType('motor_capture_2').value, // 方案2机动车抓拍图存储时间
          motor_feature_index: this.$store.getters.systemByType('motor_feature_index_2').value, // 方案2机动车特征检索时间
          motor_feature: this.$store.getters.systemByType('motor_feature_2').value, // 方案2机动车特征存储时间
          non_motor_full: this.$store.getters.systemByType('non_motor_full_2').value, // 方案2非机动车全景图存储时间
          non_motor_capture: this.$store.getters.systemByType('non_motor_capture_2').value, // 方案2非机动车抓拍图存储时间
          non_motor_feature_index: this.$store.getters.systemByType('non_motor_feature_index_2').value, // 方案2非机动车特征检索时间
          non_motor_feature: this.$store.getters.systemByType('non_motor_feature_2').value, // 方案2非机动车特征存储时间
        }
      ],
    };
  },
  computed: {
    isShowStorge() {
      return this.analyzerFaceEnable || this.analyzerPedestrianEnable || this.analyzerVehicleEnable || this.analyzerNonmotorEnable;
    },
    cameraCompanyMap() {
      const obj = {};
      this.cameraCompanyOption.forEach((val) => {
        obj[val.code] = val.value;
      });
      return obj;
    },
    cameraTypeMap() {
      const obj = {};
      this.cameraTypeOption.forEach((val) => {
        obj[val.code] = val.value;
      });
      return obj;
    },
    monitoringTypeMap() {
      const obj = {};
      this.monitoringTypeOption.forEach((val) => {
        obj[val.code] = val.value;
      });
      return obj;
    },
    faceFrameModeMap() {
      const obj = {};
      this.faceFrameModeOption.forEach((val) => {
        obj[val.code] = val.value;
      });
      return obj;
    },
    labelMap() {
      const obj = {};
      this.deviceTagOption.forEach((val) => {
        obj[val.code] = val.value;
      });
      return obj;
    },
    cameraStatusMap() {
      const arr = {};
      this.$store.getters.dataMapByType('camera_status').forEach((item) => {
        arr[item.code] = item.value;
      });
      return arr;
    },
  },
  mounted() {
  },
  methods: {
    /**
     * @description 过滤是否显示相应的搜索条件
     * @param {string} str
     * @returns {boolean}
     */
    filterCondition(str) {
      console.log(typeof this.cameraResShowOptions[0]);
      return this.cameraResShowOptions.indexOf(str) !== -1;
    },
    /**
     * @description 处理设备标签
     * @param {array} tagCodes
     * @returns {string}
     */
    handleTagCodes(tagCodes) {
      return tagCodes ? tagCodes.map((item) => {
        const str = item.split(',').map((val) => {
          val = this.labelMap[val];
          return val;
        }).join('/');
        return str;
      }).join(',') : '';
    },
    /*
    * 初始化状态刷新数据
    * */
    initStatusSyncInterval(data) {
      const intervalNumber = data.statusSyncInterval || 0;
      return `${intervalNumber}分钟`;
    },
    /** 把数据中的相机状态 处理成 文字状态
     *  @param {Number} param 相机所在行Status
     *  return 对应的相机状态
     */
    processStatus(param) {
      const str = `${param}`;
      return this.cameraStatusMap[str];
    },
    processShareModel(param) {
      switch (param) {
        case 1:
          return this.$t('自定义相机');
        case 0:
          return this.$t('公共');
        default:
          return '';
      }
    },
    /*
    * 取到区域类型值
    * */
    getLocationTypeValue(key) {
      const map = new Map();
      this.locationTypeData.forEach((item) => {
        map.set(item.code, item.value);
      });
      return map.get(key);
    },
    /**
     * 复制成功
     */
    copySuccess() {
      this.$message.success('复制成功');
    },
    /**
     * 复制失败
     */
    copyError() {
      this.$message.error('复制失败');
    },
    /**
     * shareList转string
     */
    getShareListString() {
      const { shareList = [] } = this.detailData;
      if (shareList.length > 0) {
        const result = shareList.reduce((pre, cur) => {
          const total = pre ? `${pre},` : '';
          return total + cur.shareName;
        }, '');
        return result;
      }
      return '';
    },
    /*
    * 关闭弹框
    * */
    cancelDialog() {
      this.$emit('update:visible', false);
    },

  },
};
</script>
<style lang="scss" scoped>
  .dialog-body{
    padding: 0 1px;
    height: 543px;
    overflow-y: auto;
  }
  .form-items{
    width: 636px;
  }
  .location-info{
    width: 374px;
  }
  .save-config-label {
    line-height: 26px;
  }
  .detail-area{
    padding-bottom: 10px;
    border-bottom: 1px solid #F3F3F3;
    &.no-border{
      border: none;
    }
    .area-title{
      font-size: 14px;
      color: #435068;
      font-weight: 600;
      padding: 20px 0;
    }
  }
  .items-container{
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    flex: 1;
  }
  .map-area{
    height: 250px;
    margin-bottom: 20px;
  }
  .info-box{
  width: 100%;
  display: flex;
  justify-content: space-between;
  .detail-area{
    padding-bottom: 10px;
    border-bottom: 1px solid #F3F3F3;
    &.no-border{
      border: none;
    }
    .area-title-container{
      display: flex;
      justify-content: space-between;
    }
    .area-title{
      font-size: 14px;
      color: #435068;
      font-weight: 600;
      padding-top: 10px;
    }
    .value-wrap{
      width:176px;
      height: 68px;
    }
  }
}
.save-config-text{
  padding-top: 4px;
  p {
    line-height: 24px;
  }
}
.form-items{
    width: 636px;
  }
.location-info{
  width: 374px;
}
.items-container{
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  flex: 1;
}
.items-container-start{
  align-content: flex-start;
}
.map-area{
  height: 250px;
  margin-bottom: 20px;
}
.url-container{
  display: flex;
  .url-text{
      display: inline-block;
      width: 140px;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-right: 5px;
    }
}
</style>
