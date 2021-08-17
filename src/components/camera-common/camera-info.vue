<template>
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
        <div class="items-container">
          <detail-item
            :label="$t('相机类型')"
            :value="detailData.typeName"></detail-item>
          <detail-item
            :label="$t('卡口类型')"
            v-if="cameraInfoType === 'camera'"
            :value="bayonetMap[detailData.bayonetType]"></detail-item>
          <detail-item
            :label="$t('相机协议')"
            :value="detailData.manufacturer"></detail-item>
          <detail-item
            :label="$t('相机名称')"
            :value="detailData.name"></detail-item>
          <detail-item
            v-if="cameraInfoType === 'box'"
            :label="detailData.type == 12 ? $t('智能盒型号'): $t('相机型号')"
            :value="detailData.modelName"></detail-item>
          <detail-item
            :tooltip="false"
            :label="$t('流地址')">
            <div
              slot="value"
              class="url-container">
              <span
                class="url-text"
                v-tooltip="true">{{ detailData.url }}</span>
              <meg-button
                type="text"
                v-if="detailData.url"
                @click="copy(detailData.url)"
                class="copy-button">
                {{ $t('复制') }}
              </meg-button>
            </div>
          </detail-item>
          <detail-item
            :label="$t('是否云台')"
            :value="detailData.ptz">
            <template v-slot:value>
              {{ detailData.ptz ? $t('是'):$t('否') }}
            </template>
          </detail-item>
          <detail-item
            :label="$t('相机编号')"
            :value="detailData.numeration"></detail-item>
          <detail-item
            :label="$t('设备标签')"
            v-if="cameraInfoType === 'camera'"
            :value="handleTagCodes(detailData.labelCodes)"></detail-item>
          <detail-item
            :label="$t('相机SN码')"
            :value="detailData.sncode"></detail-item>
          <detail-item
            :label="$t('国标平台ID')"
            v-if="detailData.type !== '3'"
            :value="detailData.gbPlatformId"></detail-item>
          <detail-item
            :label="$t('国标平台设备ID')"
            :value="detailData.gbPlatformDeviceId"></detail-item>
          <template v-if="detailData.type === '3' && cameraInfoType === 'camera'">
            <detail-item
              :label="$t('视图库平台ID')"
              :value="detailData.gaPlatformId"></detail-item>
            <detail-item
              :label="$t('视图库平台设备ID')"
              label-width="113px"
              :value="detailData.gaPlatformDeviceId"></detail-item>
          </template>

          <detail-item
            :label="$t('经度')"
            :value="detailData.lon">
          </detail-item>
          <detail-item
            :label="$t('纬度')"
            :value="detailData.lat"></detail-item>
          <detail-item
            :label="$t('相机位置')"
            :value="detailData.location"></detail-item>
          <detail-item
            label="IP"
            :value="detailData.ipAddr">
          </detail-item>
          <detail-item
            :label="$t('视频端口')"
            :value="detailData.videoPort"></detail-item>
          <detail-item
            :label="$t('信令端口')"
            :value="detailData.cmdPort"></detail-item>
          <!-- <detail-item></detail-item> -->
          <template v-if="detailData.type==='12'">
            <detail-item
              :label="$t('关联智能盒名称')"
              :value="detailData.boxName"></detail-item>
            <detail-item
              v-if="cameraInfoType==='camera'"
              :label="$t('通道号')"
              :value="detailData.boxChannelNo">
            </detail-item>
          </template>
        </div>
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
      </div>
      <div class="detail-area">
        <detail-item>
          <h3
            class="area-title"
            slot="label">
            {{ $t('运维信息') }}
          </h3>
        </detail-item>
        <div class="items-container">
          <detail-item
            :label="$t('视频分辨率')"
            :value="detailData.resolution"></detail-item>
          <detail-item
            :label="$t('帧率')"
            :value="detailData.frameRate"></detail-item>
          <detail-item
            :label="$t('I帧间隔')"
            :value="detailData.iframeInterval"></detail-item>
          <detail-item
            :label="$t('图片分辨率')"
            :value="detailData.imgResolution"></detail-item>
          <detail-item
            :label="$t('图片质量')"
            :value="detailData.quality"></detail-item>
          <detail-item
            :label="$t('大图上传')"
            :value="detailData.quality === 1 ? '是' : '否'">
          </detail-item>
          <detail-item
            v-for="(item,index) in detailData.iotDeviceInfo.alarminConfigList"
            :key="index"
            value-width="500px"
            :label="$t('输入通道')">
            <template v-slot:value>
              <div class="row-item">
                <span>{{ item.chanNo }}</span>
                <detail-item
                  value-width="30px"
                  :value="alarmModeType[item.alarmMode]"
                  :label="$t('类型')">
                </detail-item>
                <detail-item
                  value-width="30px"
                  :value="enableType[item.enable]"
                  :label="$t('状态')">
                </detail-item>
              </div>
            </template>
          </detail-item>
          <detail-item
            :label="$t('抓拍模式')"
            :value="snapModeType[detailData.snapMode]"></detail-item>
          <detail-item
            :label="$t('抓拍张数')"
            :value="detailData.snapNum"></detail-item>
          <detail-item
            :label="$t('识别模式')"
            :value="recognizeModeType[detailData.recognizeMode]"></detail-item>
          <detail-item
            :label="$t('推送次数')"
            :value="detailData.recogUploadNum"></detail-item>
          <detail-item
            :label="$t('最小人脸')"
            :value="detailData.minFacePixels"></detail-item>
        </div>
      </div>
    </section>
  </div>
</template>
<script>
import DetailItem from './dialog-detail-item';

export default {
  name: 'CameraInfo',
  components: {
    DetailItem,
  },
  props: {
    detailData: {
      type: Object,
      default: () => {}
    },
    cameraInfoType: {
      type: String,
      default: 'camera'
    },
    cameraMapData: {
      type: Object,
      default: () => ({
        'keyData': {},
        'featuresData': []
      })
    }
  },
  data() {
    return {
      snapModeType: {},
      recognizeModeType: {},
      alarmModeType: {},
      labelMap: {},
      bayonetMap: {},
      enableType: {
        1: '启用',
        0: '停用'
      }
    };
  },
  created() {
    this.initFormat();
  },
  methods: {
    /**
     * @description 复制
     * @param {string} url
     * @returns
     */
    copy(url) {
      this.$clipboard(url).then(() => {
        this.$message({
          type: 'success',
          message: '复制成功'
        });
      }, () => {
        this.$message({
          type: 'error',
          message: '复制失败'
        });
      });
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
    /**
     * 格式化字典表
     */
    initFormat() {
      this.$store.getters.dataMapByType('snapModeType').forEach((item) => {
        this.snapModeType[item.code] = item.value;
      });
      this.$store.getters.dataMapByType('recognizeModeType').forEach((item) => {
        this.recognizeModeType[item.code] = item.value;
      });
      this.$store.getters.dataMapByType('alarmModeType').forEach((item) => {
        this.alarmModeType[item.code] = item.value;
      });
      this.$store.getters.dataMapByType('device_tag').forEach((item) => {
        this.labelMap[item.code] = item.value;
      });
      this.$store.getters.dataMapByType('bayonet_type').forEach((item) => {
        this.bayonetMap[item.code] = item.value;
      });
    },
    /*
    * 初始化状态刷新数据
    * */
    initStatusSyncInterval(data) {
      const intervalNumber = data.statusSyncInterval || 0;
      return `${intervalNumber}分钟`;
    },
    /*
    * 初始化地图数据
    * */
    initMapData() {
      const { lat, lon } = this.detailData;
      return { lat: parseFloat(lat), lon: parseFloat(lon) };
    }
  }
};
</script>
<style lang="scss" scoped>
.info-box {
  width: 100%;
  display: flex;
  justify-content: space-between;

  .detail-area {
    padding-bottom: 10px;
    border-bottom: 1px solid #f3f3f3;

    &.no-border {
      border: none;
    }

    .area-title-container {
      display: flex;
      justify-content: space-between;
    }

    .area-title {
      font-size: 14px;
      color: #435068;
      font-weight: 600;
      padding-top: 10px;
    }

    .value-wrap {
      white-space: normal;
    }

    .row-item {
      display: flex;
      width: 400px;
    }
  }
}

.save-config-text {
  padding-top: 4px;

  p {
    line-height: 24px;
  }
}

.form-items {
  width: 636px;
}

.location-info {
  width: 374px;
}

.items-container {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  flex: 1;
}

.map-area {
  height: 250px;
  margin-bottom: 20px;
}

.url-container {
  display: flex;

  .url-text {
    display: inline-block;
    width: 140px;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-right: 5px;
  }
}
</style>
