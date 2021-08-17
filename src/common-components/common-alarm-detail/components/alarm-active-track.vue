<template>
  <div
    class="alarm-active-track"
    v-if="Object.keys(trackInfo).length">
    <div class="item-list">
      <div class="list-title">
        <div>
          <span>{{ $t('活动时间') }}</span>
          <span class="active-time-value">{{ $t('报警前后')+trackInfo.trackTimeRange+$t('分钟') }}</span>
        </div>
        <p class="time-range">
          {{ formatTimeExactMin(trackInfo.trackBeginTime) +' '+ $t('至')+' ' + formatTimeExactMin(trackInfo.trackEndTime) }}
        </p>
      </div>
      <div
        class="list"
        ref="scrollBar">
        <meg-card
          class="recent-capture"
          v-for="(item,index) in trackInfo.tracks"
          :class="activeCardIndex === index?'activeCard':''"
          @click="changeActiveCard(index)"
          :key="index"
          right-width="235px"
          img-border="0"
          :img-src="item.cropUri">
          <div slot="right">
            <p
              class="card-line"
              v-tooltip="true">
              <meg-icon
                color="#D1D5DD"
                width="11"
                height="11"
                name="time"></meg-icon>&nbsp;{{ formatTimeExactSec(item.capturedTime) }}
              <meg-icon
                v-if="item.alarm"
                width="11"
                height="11"
                :color="colorLevel"
                name="alarm-preview_menu"></meg-icon>
            </p>
            <p
              class="card-line"
              v-tooltip="true">
              <meg-icon
                color="#D1D5DD"
                width="11"
                height="11"
                name="poi"></meg-icon>&nbsp;{{ item.cameraName }}
            </p>
          </div>
        </meg-card>
      </div>
    </div>
    <div class="item-detail">
      <span
        class="model-select"
        @click="changeModel">
        <span :class="detailModel === 'map'?'active':''">地图</span>
        <span :class="detailModel === 'panorama'?'active':''">全景图</span>
      </span>
      <trace-play-map
        ref="traceMap"
        v-if="detailModel === 'map'"
        @ready="mapReady"
        :track-data="trackInfo.tracks">
        <div
          class="capture-card-wrapper"
          slot="freeInfoOverlay"
          slot-scope="{ params }">
          <capture-card
            :info="getInfo(params)"
            @on-close-click-overlay="closeSingleCaptureCard"
            @card-click="cardClick"></capture-card>
          <div class="triangle-down"></div>
        </div>
      </trace-play-map>
      <meg-img-container
        v-else
        mark-shape="rect"
        :mark-coordinate="trackInfo.tracks[activeCardIndex].rect?trackInfo.tracks[activeCardIndex].rect:{}"
        :img-src="fullImageUrl"></meg-img-container>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import tracePlayMap from '@/common-components/common-maps/trace-play-map.vue';
import RemoteFullImage from '../remote-full-image';
import fullImageLoading from '../image/full-image-loading.gif';
import fullImageEmpty from '../image/full-image-empty';
import captureCard from './trajectory-capture-card.vue';
import alarmDetailSrv from '../alarm-detail.service';

export default {
  components: {
    tracePlayMap,
    captureCard
  },
  mixins: [RemoteFullImage],
  // 国际化
  props: {
    trackInfo: {
      type: Object,
      default: () => {}
    },
    // 报警icon颜色
    colorLevel: {
      type: String,
      default: '#E77E2D'
    }
  },
  data() {
    return {
      detailModel: 'map',
      activeCardIndex: 0,
      fullImageEmpty,
      fullImageUrl: fullImageEmpty
    };
  },
  watch: {
    trackInfo() {
      if (this.$refs.traceMap) {
        this.$nextTick(() => {
          this.activeCardIndex = this.getActiveItemIndex(this.trackInfo.tracks);
          this.fullImageUrl = this.trackInfo.tracks[this.activeCardIndex].fullUri || fullImageEmpty;
          this.$refs.traceMap.showFreeOverlay(this.trackInfo.tracks[this.activeCardIndex]);
        });
      }
    }
  },
  mounted() {
    if (this.trackInfo.tracks) {
      this.activeCardIndex = this.getActiveItemIndex(this.trackInfo.tracks);
      this.fullImageUrl = this.trackInfo.tracks[this.activeCardIndex].fullUri || fullImageEmpty;
    }
    if (Object.keys(this.trackInfo).length) {
      this.$nextTick(() => {
        this.$refs.scrollBar.scrollTo({
          top: 56 * this.activeCardIndex,
          behavior: 'smooth'
        });
      });
    }
    if (this.canRemoteFullImage) {
      this.initRemoteFullImageFetcher(alarmDetailSrv.fetchRemoteFullImage);
    }
  },
  methods: {
    /**
     * @description 将图像框数据的字符串类型值转换成number类型
     * @description 适配组件库，之前组件库接受的对象值类型为number，此处返回的字符串。已向组件库提issue做兼容处理
     * @param {Object} 图像框数据
     * @returns {Object} 数据类型装换后的图像框数据
     */
    rectValueToNumber(rect) {
      if (Object.keys(rect).length) {
        const {
          heightPixels, leftPixels, topPixels, widthPixels
        } = rect;
        return {
          heightPixels: Number(heightPixels),
          leftPixels: Number(leftPixels),
          topPixels: Number(topPixels),
          widthPixels: Number(widthPixels)
        };
      }
      return {};
    },
    /**
     * @description 获取当前获取的数据索引
     * @param {Array} trackDataList 轨迹数据列表
     * @returns {Number} 当前活跃数据的索引
     */
    getActiveItemIndex(trackDataList) {
      return trackDataList.findIndex((item) => item.alarm);
    },
    /**
     * @description 地图准备完成可以进行使用操作
     */
    mapReady() {
      this.$refs.traceMap.showFreeOverlay(this.trackInfo.tracks[this.activeCardIndex]);
    },
    /**
     * @description 卡片单击查看全景图
     * @param {Object} 对应的卡片信息
     */
    cardClick(info) {
      this.activeCardIndex = this.trackInfo.tracks.findIndex((item) => item.capturedTime === info.captureTimeForId);
      this.detailModel = 'panorama';
    },
    /**
     * @description 关闭地图弹窗
     */
    closeSingleCaptureCard() {
      this.$refs.traceMap.hideFreeOverlay();
    },
    /**
     * @description 数据二次封装
     * @param {Object} params 传入的默认数据
     * @returns {Object} 组件需要的数据格式
     */
    getInfo(params) {
      const rect = params.rect ? this.rectValueToNumber(params.rect) : {};
      return {
        captureTime: moment(params.capturedTime).format('YYYY-MM-DD HH:mm:ss'),
        cameraName: params.cameraName,
        faceUrl: params.cropUri || fullImageEmpty,
        rect,
        captureTimeForId: params.capturedTime
      };
    },
    /**
     * @description 修改当前选中的card
     * @param {Number} index 当前活跃卡片的索引
     */
    changeActiveCard(index) {
      this.activeCardIndex = index;
      if (this.detailModel === 'map') {
        if (this.trackInfo.tracks[index].lon && this.trackInfo.tracks[index].lat) {
          this.$refs.traceMap.showFreeOverlay(this.trackInfo.tracks[index]);
        }
      }
      if (this.canRemoteFullImage) {
        this.fetchRemoteFullImage();
      } else {
        this.fullImageUrl = this.trackInfo.tracks[this.activeCardIndex].fullUri || fullImageEmpty;
      }
    },
    /**
     * 远程拉取全景图
     */
    fetchRemoteFullImage() {
      const info = this.trackInfo.tracks[this.activeCardIndex];
      if (this.shouldRemoteFullImage(info.fullUri)) {
        this.fullImageUrl = fullImageLoading;
        this.fetchRemoteFullImageUrl(info.captureId, {
          id: info.captureId,
          fullUri: info.fullUri
        }).then((data) => {
          this.fullImageUrl = data;
        });
      } else {
        this.fullImageUrl = info.fullUri || fullImageEmpty;
      }
    },
    /**
     * @description 切换展示模式
     */
    changeModel() {
      if (this.detailModel === 'map') {
        this.detailModel = 'panorama';
        if (!this.trackInfo.tracks[this.activeCardIndex].fullUri) {
          this.$set(this.trackInfo.tracks[this.activeCardIndex], 'fullPhoto', fullImageEmpty);
          // 如果全景图不为空，则判断是否符合远程拉取的图片地址
        }
      } else {
        this.detailModel = 'map';
        // this.showCardOnMap(this.activeCardIndex);
      }
    },

    /**
     * @description 格式化时间到分钟
     * @param {string} timeStamp 时间戳
     * @returns {string} 格式化成功后的时间
     */
    formatTimeExactMin(timeStamp) {
      return moment(timeStamp).format('YYYY-MM-DD HH:mm');
    },
    /**
     * @description 格式化时间到秒
     * @param {string} timeStamp 时间戳
     * @returns {string} 格式化成功后的时间
     */
    formatTimeExactSec(timeStamp) {
      return moment(timeStamp).format('YYYY-MM-DD HH:mm:ss');
    }
  }
};
</script>

<style scoped lang="scss">
.alarm-active-track {
  height: 100%;
  .item-list {
    float: left;
    width: 290px;
    height: 100%;
    .list-title {
      height: 75px;
      border-bottom: 1px solid #efefef;
      line-height: 2.2;
      display: flex;
      flex-direction: column;
      justify-content: center;
      .active-time-value {
        font-size: 12px;
        color: #869abb;
        margin-left: 8px;
      }
      .time-range {
        font-size: 12px;
      }
    }
    .list {
      height: 409px;
      overflow: auto;
      .activeCard {
        background-color: #e6f2ff;
      }
    }
  }
  .recent-capture {
    box-shadow: none;
    margin: 8px 8px 8px 0;
    .card-line {
      margin: 2px 0;
      padding-left: 5px;
      font-size: 12px;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      color: #5a6676;
    }
  }
  .item-detail {
    width: 895px;
    background: #f9f9f9;
    height: 100%;
    margin-left: 290px;
    position: relative;
    overflow: hidden;
    .model-select {
      position: absolute;
      display: inline-flex;
      width: 136px;
      font-size: 14px;
      height: 32px;
      border: 1px solid#21539B;
      cursor: pointer;
      font-weight: bold;
      top: 10px;
      left: 10px;
      z-index: 1;
      background: #ffffff;
      span {
        flex: 1;
        display: inline-flex;
        justify-content: center;
        align-items: center;
      }
      .active {
        background-color: #21539b;
        color: #ffffff;
      }
    }
    .capture-card-wrapper {
      width: 184px;
      height: 170px;
      background: #fff;
      box-shadow: 0 3px 1px rgba(0, 0, 0, 0.1);
      padding: 0 8px;
      box-sizing: border-box;
      position: relative;
      .triangle-down {
        position: absolute;
        bottom: -5px;
        left: 82px;
        width: 0;
        height: 0;
        border-left: 10px solid transparent;
        border-right: 10px solid transparent;
        border-top: 5px solid #fff;
      }
    }
  }
}
</style>
<style lang="scss">
.alarm-active-track {
  .meg-img-container {
    background-color: #f3f3f3;
  }
}
</style>
