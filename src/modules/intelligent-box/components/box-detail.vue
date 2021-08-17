<template>
  <div class="box-detail">
    <meg-dialog
      width="1100px"
      :visible="isShowDetail"
      @close="cancelDialog">
      <template
        v-slot:title>
        <meg-tabs
          v-model="headerTabName"
          @tab-click="handleHeaderTabClick">
          <meg-tab-pane
            :label="$t('智能盒')"
            name="boxDetail">
          </meg-tab-pane>
          <meg-tab-pane
            :label="$t('通道')"
            name="channelDetail">
          </meg-tab-pane>
        </meg-tabs>
      </template>
      <section
        class="dialog-body"
        v-loading="isLoading">
        <section
          slot="tab-content"
          class="box-detail-area"
          v-show="headerTabName=='boxDetail'">
          <section class="form-items">
            <div class="detail-area">
              <detail-item
                :label="$t('智能盒名称')"
                :value="detailData.name"></detail-item>
              <div class="items-container">
                <detail-item
                  :label="$t('归属部门')"
                  :value="detailData.deptName"></detail-item>
                <detail-item
                  :label="$t('备注')">
                  <div
                    class="share-value"
                    v-tooltip:2="true"
                    slot="value">
                    {{ detailData.remark }}
                  </div>
                </detail-item>
                <detail-item
                  :label="$t('智能盒URL')">
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
                      class="copy-btn">
                      {{ $t('复制') }}
                    </meg-button>
                  </div>
                </detail-item>
              </div>
            </div>
            <div class="detail-area">
              <div class="items-container">
                <detail-item>
                  <h3
                    class="area-title"
                    slot="label">
                    {{ $t('硬件信息') }}
                  </h3>
                </detail-item>
                <detail-item></detail-item>
                <detail-item
                  :label="$t('智能盒型号')"
                  :value="detailData.modelName"></detail-item>
                <detail-item
                  :label="$t('最大通道数')"
                  :value="getChannelName(detailData.channelSize)"></detail-item>
                <detail-item
                  :label="$t('智能盒编号')"
                  :value="detailData.number"></detail-item>
                <detail-item
                  :label="$t('国标平台ID')"
                  :value="detailData.gbPlatformId"></detail-item>
                <detail-item
                  :label="$t('智能盒SN码')"
                  value-width="176px"
                  :value="detailData.snNumber"></detail-item>
                <detail-item
                  :label="$t('国标平台设备ID')"
                  label-width="100px"
                  :value="detailData.gbPlatformDeviceId"></detail-item>
              </div>
            </div>
            <div class="detail-area no-border">
              <div class="items-container">
                <detail-item>
                  <h3
                    class="area-title"
                    slot="label">
                    {{ $t('配置信息') }}
                  </h3>
                </detail-item>
                <detail-item>
                  <h3
                    class="area-title"
                    slot="label">
                    {{ $t('状态信息') }}
                  </h3>
                </detail-item>
                <detail-item
                  :label="$t('全景图上传')"
                  :value="detailData.panoramaOpen"></detail-item>
                <detail-item
                  :label="$t('运行状态')"
                  :value="processStatus[detailData.status]"></detail-item>
                <detail-item
                  :label="$t('全景图压缩比')"
                  :value="detailData.compressRatio"></detail-item>
                <detail-item
                  :label="$t('算法版本')"
                  :value="detailData.firmware"></detail-item>
                <detail-item
                  label=""
                  value=""></detail-item>
                <detail-item
                  :label="$t('固件版本')"
                  :value="detailData.algorithm"></detail-item>
                <detail-item
                  :label="$t('经度')"
                  :value="detailData.lon"></detail-item>
                <detail-item
                  :label="$t('纬度')"
                  :value="detailData.lat"></detail-item>
              </div>
            </div>
          </section>
          <!-- <section class="location-info">
            <meg-row
              type="flex"
              :gutter="2">
              <meg-col>
                <detail-item
                  label="经度"
                  label-width="30px"
                  label-align="left"
                  :value="detailData.lon"></detail-item>
              </meg-col>
              <meg-col>
                <detail-item
                  label="纬度"
                  label-width="30px"
                  label-align="left"
                  :value="detailData.lat"></detail-item>
              </meg-col>
            </meg-row>
            <div class="map-area">
              <meg-display-map
                :key-feature="mapKeyData"
                :features-data="mapFeaturesData">
              </meg-display-map>
            </div>
          </section> -->
        </section>
        <section
          class="channel-detail-area"
          v-loading="channelDetailLoading"
          v-if="headerTabName=='channelDetail'">
          <meg-scrollbar>
            <meg-tabs
              type="card"
              @tab-click="handleChannelTabClick"
              v-model="channelTabName">
              <meg-tab-pane
                v-for="(item,index) in cameralistData"
                :key="`camera${index}`"
                :label="`${$t('通道')}${index+1}`"
                :name="`camera_${index+1}`">
                <div v-if="channelTabName===`camera_${index+1}`">
                  <section
                    class="camera-info"
                    v-if="!showEmptyCamera">
                    <camera-info
                      :camera-map-data="cameraMapData"
                      :detail-data="cameraInfo"
                      camera-info-type="box">
                    </camera-info>
                  </section>
                  <section
                    v-else
                    class="empty-area">
                    <img
                      class="empty-area-img"
                      src="@/assets/images/camera/megbox-empty.png"
                      alt="excel" />
                    <p>{{ $t('暂未关联相机') }}</p>
                  </section>
                </div>
              </meg-tab-pane>
            </meg-tabs>
          </meg-scrollbar>
        </section>
      </section>
    </meg-dialog>
  </div>
</template>
<script>
// import MegDisplayMap from '@/components/megMap/megBoxDisplayMap';
import DetailItem from '@/components/camera-common/dialog-detail-item';
import CameraInfo from '@/components/camera-common/camera-info';
import { openByNewTab } from '@/utils/utils';

export default {
  components: {
    DetailItem,
    CameraInfo,
    // MegDisplayMap
  },
  props: {
    isShowDetail: {
      type: Boolean,
      default: false
    },
    detailData: {
      type: Object,
      default: () => {}
    },
    cameraInfo: {
      type: Object,
      default: () => {}
    },
    cameraList: {
      type: Array,
      default: () => []
    },
    channelDetailLoading: {
      type: Boolean,
      default: false
    },
    isLoading: { // 内容区域loading
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      channelSizeData: this.$store.getters.dataMapByType('box_channel_number'),
      processStatus: {},
      headerTabName: 'boxDetail',
      channelTabName: 'camera_1',
      channelTabIndex: 0,
      mapKeyData: {},
      mapFeaturesData: [],
      showEmptyCamera: true, // 空相机区域
      cameralistData: [], // 格式化后的cameralist
      cameraMapData: {}, // 通道地图数据
    };
  },
  created() {
    // this.initMapData();
    this.initFormat();
    this.formatCameraList();
  },
  methods: {
    /**
     * 格式化字典表
     */
    initFormat() {
      this.$store.getters.dataMapByType('rainbow_camera_status').forEach((item) => {
        this.processStatus[item.code] = item.value;
      });
    },
    /**
     * @description 复制
     * @param {string} url
     * @returns
     */
    copy(url) {
      this.$clipboard(url).then(() => {
        this.$message({
          type: 'success',
          message: this.$t('复制成功')
        });
      }, () => {
        this.$message({
          type: 'error',
          message: this.$t('复制失败')
        });
      });
    },
    /*
    * 初始化地图数据
    * */
    // initMapData() {
    //   this.mapFeaturesData = this.cameraList.map(item => ({
    //     name: item.cameraName,
    //     lat: item.cameraLat,
    //     lon: item.cameraLon,
    //     flag: 'camera',
    //     cameraId: item.cameraId
    //   }));
    //   const { lat, lon, name } = this.detailData;
    //   this.mapKeyData = {
    //     flag: 'box',
    //     name,
    //     lat: parseFloat(lat),
    //     lon: parseFloat(lon),
    //   };
    // },
    /*
    * 处理通道地图数据
    * */
    // handleCameraMapData(data) {
    //   const {
    //     cameraLat: lat, cameraLon: lon, cameraName, cameraId
    //   } = data;
    //   const mapKeyData = {
    //     name: cameraName,
    //     lat,
    //     lon,
    //     flag: 'camera',
    //     cameraId
    //   };
    //   const featuresData = [...this.mapFeaturesData, this.mapKeyData]; // 将盒子数据添加进进数组
    //   const index = featuresData.findIndex(item => item.cameraId === mapKeyData.cameraId); // 目标相机在featuresData中的索引
    //   featuresData.splice(index, 1);
    //   this.cameraMapData = {
    //     featuresData,
    //     keyData: mapKeyData
    //   };
    // },
    /*
    * 顶部tab点击事件
    * */
    handleHeaderTabClick() {
      if (this.headerTabName === 'channelDetail') {
        this.initCameraInfo(this.channelTabIndex);
      }
    },
    /*
    * 补全cameraList
    * */
    formatCameraList() {
      const channelNum = this.getChannelName(this.detailData.channelSize);
      const mapData = this.getMapDataCameraList(this.cameraList);
      console.log(mapData);
      this.cameralistData = Array.from({ length: channelNum }).map((item, index) => mapData.get(index + 1) || { boxChannelNo: index });
      console.log(this.cameralistData);
    },
    /*
    * 数组转map
    * */
    getMapDataCameraList(data) {
      const map = new Map();
      data.forEach((item) => {
        map.set(item.boxChannelNo, item);
        map.set(item.id, item);
      });
      return map;
    },
    /*
    * 关闭弹框
    * */
    cancelDialog() {
      this.$emit('cancel-box-detail-dialog');
    },
    /*
    * 通道tab点击事件
    * */
    handleChannelTabClick(tab) {
      const { index } = tab;
      this.channelTabIndex = index;
      this.initCameraInfo(index);
    },
    /*
    * 初始化相机详情区域数据
    * */
    initCameraInfo(index) {
      const cameraData = this.cameralistData[index];
      const id = cameraData.id || '';
      if (id) {
        this.showEmptyCamera = false;
        this.$emit('get-camera-info', id);
        if (cameraData.cameraLat) {
          // this.handleCameraMapData(cameraData);
        } else {
          this.cameraMapData.keyData = {
            name: '',
            lat: '',
            lon: '',
            flag: 'camera'
          };
        }
      } else {
        this.showEmptyCamera = true;
      }
    },
    /*
    * 取到通道数
    * */
    getChannelName(key) {
      return this.getChannelMapData(this.channelSizeData).get(key);
    },
    /*
    * 数组转map
    * */
    getChannelMapData(data) {
      const map = new Map();
      data.forEach((item) => {
        map.set(item.code, parseInt(item.value, 10));
      });
      return map;
    },
    /*
    * 跳转新建相机
    * */
    goCreateCamera() {
      let { path } = this.$route;
      path = path.replace('intelligentBox', 'camera');
      const routeData = this.$router.resolve({
        path: `${path}?showAddCamera=1`
      });
      // window.open(routeData.href, '_blank');
      openByNewTab(routeData.href);
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
  },
};
</script>
<style lang="scss" scoped>
  .dialog-body {
    height: 600px;
    padding: 0px 0px 20px;
  }

  .box-detail-area {
    display: flex;
    justify-content: space-between;
  }

  .channel-detail-area {
    height: 550px;
  }

  .form-items {
    width: 636px;
  }

  .location-info {
    width: 374px;
  }

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
  }

  .share-value {
    white-space: normal;
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

  .empty-area {
    padding-top: 115px;
    text-align: center;

    .empty-area-img {
      width: 249px;
      height: 169px;
      margin-bottom: 30px;
    }

    p {
      line-height: 28px;
      font-size: 14px;
      color: #869abb;

      &:last-of-type {
        margin-bottom: 15px;
      }
    }
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
<style lang="scss">
  .box-detail {
    .meg-tabs__nav-wrap::after {
      background: none;
    }

    .header-content {
      .meg-tabs__item {
        font-size: 16px;
      }
    }

    .meg-tabs__active-bar {
      height: 4px;
    }

    .meg-tabs__item {
      color: #435068;
      font-weight: 400;

      &.is-active {
        font-weight: 600;
        color: #21539b;
      }
    }

    .channel-detail-area {
      padding-top: 10px;

      .meg-tabs__header {
        height: 35px;

        .meg-tabs__nav {
          overflow: hidden;
          border-radius: none;
        }
      }

      .meg-tabs__item {
        height: 34px;
        line-height: 34px;
        background-color: #f9f9f9;

        &.is-active {
          height: 35px;
          background-color: #fff;
        }
      }
    }
  }

</style>
