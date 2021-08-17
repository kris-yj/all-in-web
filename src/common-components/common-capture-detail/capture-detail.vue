<template>
  <meg-dialog
    class="capture-detail-dialog"
    width="1250px"
    :visible="visible"
    :show-footer="false"
    :close-on-press-escape="false"
    :append-to-body="appendToBody"
    :modal-append-to-body="appendToBody"
    @close="onDialogClose">
    <div slot="title">
      <meg-tabs
        v-model="activeIndex"
        plain
        @tab-click="onTabClick">
        <meg-tab-pane
          :label="$t('详情')"
          name="1">
        </meg-tab-pane>
        <meg-tab-pane
          v-if="hasFace && detailCompare && compareList.length && showCompare"
          :label="$t('比对')"
          name="2">
        </meg-tab-pane>
        <!-- info.cameraId&&!cascade -->
        <meg-tab-pane
          v-if="peerList.length && showPeer"
          :label="$t('同行')"
          name="3">
        </meg-tab-pane>
        <meg-tab-pane
          v-if="hasVideo&&!cascade && showVideo"
          :label="$t('视频')"
          name="4">
        </meg-tab-pane>
        <meg-tab-pane
          v-if="info.cameraId&&!cascade && showLocation"
          :label="$t('地点')"
          name="5">
        </meg-tab-pane>
      </meg-tabs>
    </div>
    <div
      class="capture-detail-container"
      v-loading="loading">
      <div
        class="detail-container"
        :class="activeIndex!=='1'&&activeIndex!=='3'?'huge':''">
        <div
          class="card-container"
          :style="cardContentWidth"
          v-show="activeIndex!=='2'&&activeIndex!=='5'">
          <full-img-card
            v-if="activeIndex==='1'||activeIndex==='3'"
            :item="fullImgItem"
            :should-remote-full-image="shouldRemoteFullImage"
            :fetch-remote-full-image="fetchRemoteFullImage"
            @show-img-scaled="showImgScaled"></full-img-card>
          <detail-card
            v-show="activeIndex!=='5'"
            :info="info"
            :cascade="cascade"
            :peer-list="peerList"
            :peer-item="peerItem"
            :active-index="activeIndex"
            :upload-file="uploadFile"
            :is-photo-search="isPhotoSearch"
            :custom-target-list="customTargetList"
            :archives-search-permission="archivesSearchPermission"
            @show-img-scaled="showImgScaled"></detail-card>
        </div>
        <capture-video
          v-if="activeIndex==='4'"
          :video-info="videoInfo"></capture-video>
        <compare-detail
          ref="compareDetail"
          v-show="activeIndex==='1'||activeIndex==='2'"
          :info="info"
          :cascade="cascade"
          :has-face="hasFace"
          :compare-index.sync="compareIndex"
          :is-compare="activeIndex==='2'"
          :detail-compare="detailCompare"
          :compare-list="compareList"
          @compare-card-click="compareCardClick"
          @show-img-scaled="showImgScaled"></compare-detail>
        <div
          class="map-wrapper"
          v-if="activeIndex==='3'"
          key="1">
          <device-position-map
            :info="info"></device-position-map>
        </div>
        <div
          class="huge-map-wrapper"
          v-if="activeIndex==='5'"
          key="2">
          <device-position-map
            :info="info"></device-position-map>
        </div>
      </div>
      <detail-selector
        ref="detailSelector"
        :info="info"
        :active-index="activeIndex"
        :props-index="selectIndex"
        :result-list="resultList"
        :peer-list="peerList"
        :show-temporary="showTemporary"
        :hide-swiper="hideSwiper"
        :is-photo-search="isPhotoSearch"
        :peer-index.sync="peerIndex"
        v-on="Object.assign({}, $listeners, { 'item-change': itemChange })"></detail-selector>
    </div>
    <feed-back
      v-show="showFeedBack && activeIndex==='1'"
      :info="info"></feed-back>
    <common-img-scaled
      v-model="showFullImgScreen"
      :check-orientation="false"
      :imgs-src="imgScaledOpt.src"
      :is-all-scaled-show="imgScaledOpt.custom"
      :is-single-scaled-show="imgScaledOpt.custom"
      :compare-score="imgScaledOpt.score"></common-img-scaled>
  </meg-dialog>
</template>

<script>
import { utils } from '@/utils/utils';
import CommonImgScaled from '@/common-components/common-img-scaled';
import CaptureDetailSrv from './capture-detail.service';
import FullImgCard from './full-img-card';
import DetailCard from './detail-card';
import FeedBack from './feed-back';
import CompareDetail from './compare-detail';
import DetailSelector from './detail-selector';
import DevicePositionMap from './device-position-map';
import captureVideo from './capture-video';
import fullImgEmpty from './images/full-image-empty.svg';
import imgEmpty from './images/photo-url-empty.svg';
import loadingFullImg from './images/full-image-loading.gif';
import RemoteFullImage from './remote-full-image';

const DetailTrackingMap = {
  'capture-search': {
    '3': 'CaptureSearchDetailTongxing',
    '4': 'CaptureSearchDetailVideo',
    '5': 'CaptureSearchDetailDidian'
  },
  'attribute-search': {
    '3': 'NatureSearchTongxing',
    '4': 'NatureSearchVideo',
    '5': 'NatureSearchDiDian'
  }
};

export default {
  name: 'CommonCaptureDetail',
  components: {
    FullImgCard,
    DetailCard,
    CompareDetail,
    DetailSelector,
    DevicePositionMap,
    FeedBack,
    captureVideo,
    CommonImgScaled,
  },
  mixins: [RemoteFullImage],
  props: {
    // 自定义携图跳转列表
    customTargetList: {
      type: Array,
      default: () => []
    },
    // 是否使用全景图的携图跳转功能
    showFullImgJump: {
      type: Boolean,
      default: true
    },
    // 上传图列表
    uploadList: {
      type: Array,
      default: () => []
    },
    // swiper list
    resultList: {
      type: Array,
      default: () => []
    },
    // swiper中当前选中项
    index: {
      type: Number,
      default: -1
    },
    // dialog可见
    visible: {
      type: Boolean,
      default: false
    },
    // 实时报警没有swiper list时也可以通过id并隐藏swiper使用
    id: {
      type: String,
      default: ''
    },
    // 是否隐藏swiper
    hideSwiper: {
      type: Boolean,
      default: false
    },
    // 透传dialog属性appenToBody
    appendToBody: {
      type: Boolean,
      default: true
    },
    showTemporary: { // 显示暂存架
      type: Boolean,
      default: true
    },
    showFeedBack: { // 显示badcase反馈
      type: Boolean,
      default: true
    },
    feaker: { // 线索库定制
      type: Boolean,
      default: false
    },
    cascade: { // 级联检索定制
      type: Boolean,
      default: false
    },
    searchId: { // 级联检索id
      type: String,
      default: ''
    },
    cascadeNodeRegId: { // 多级节点ID
      type: String,
      default: ''
    },
    showCompare: {
      type: Boolean,
      default: true
    },
    showPeer: {
      type: Boolean,
      default: true
    },
    showVideo: {
      type: Boolean,
      default: true
    },
    showLocation: {
      type: Boolean,
      default: true
    },
    // 自定义全景图获取方式
    customFullImgHandler: {
      type: Function,
      default: undefined
    }
  },
  data() {
    return {
      archivesSearchPermission: false, // 一人一档权限
      loading: false,
      selectIndex: -1, // swiper选中项
      activeIndex: '1', // 当前激活tab
      info: {}, // 详情
      videoInfo: {}, // 视频详情
      detailCompare: false, // 是否开启1：n
      compareFormData: { // 1：n参数
        faceList: [
          {
            photoData: '',
            rect: {},
            qualityPass: true,
          }
        ],
        topNum: 3,
        capturePhotoId: ''
      },
      compareList: [], // 1：n列表
      compareIndex: -1, // 1：n选中项
      peerList: [], // 同行列表
      peerIndex: -1, // 同行选中项
      emptyItem: { // 空
        cropUrl: imgEmpty,
        rect: {},
        detectType: 0,
        id: 0,
        disable: true
      },
      imgScaledOpt: {}, // 大图
      showFullImgScreen: false, // 是否显示大图
      uploadFile: {},
      hasVideo: false,
      defaultVideoLength: 0,
    };
  },
  computed: {
    hideVideo() {
      //  1是公安网，0为视频网，公安网需要屏蔽视频
      return this.$store.getters.systemByType('isDual').value === 'true' && this.$store.getters.systemByType('dualPlatformType').value === '1';
    },
    // 是否以图搜图
    isPhotoSearch() {
      return Boolean(this.uploadList.length);
    },
    // 是否有人脸
    hasFace() {
      const linkedPhoto = this.info.relatedPhotoVo;
      return !!((linkedPhoto && linkedPhoto.detectType === 0) || this.info.detectType === 0);
    },
    // 同行
    peerItem() {
      return this.peerIndex > -1 && this.peerList.length ? this.peerList[this.peerIndex] : this.emptyItem;
    },
    // 全景图
    fullImgItem() {
      if (this.activeIndex === '1') {
        return {
          imgUrl: this.info.fullUrl,
          disable: Boolean(this.info.fullUrl === fullImgEmpty),
          showJumpList: this.showFullImgJump,
          rect: this.info.fullLocator && this.info.fullLocator.rect,
          placeName: this.info.placeName,
          unitName: this.info.unitName,
          address: this.info.addressName,
          cameraId: this.info.cameraId,
          time: this.info.capturedTime,
          id: this.info.id,
          cascadeNodeRegId: this.cascadeNodeRegId,
          searchId: this.searchId
        };
      } if (this.peerItem) {
        const fullUrl = this.peerItem.fullUrl || fullImgEmpty;
        return {
          imgUrl: fullUrl,
          disable: Boolean(fullUrl === fullImgEmpty),
          showJumpList: this.showFullImgJump,
          rect: this.peerItem.fullLocator && this.peerItem.fullLocator.rect,
          address: this.info.addressName,
          cameraId: this.info.cameraId,
          time: this.peerItem.capturedTime,
          id: this.peerItem.id,
          cascadeNodeRegId: this.cascadeNodeRegId,
          searchId: this.searchId
        };
      }
      return {};
    },
    cardContentWidth() {
      return { width: this.activeIndex === '4' ? '355px' : '870px' };
    },
    selectId() {
      const item = this.resultList[this.selectIndex];
      if (item) {
        return item.captureId || item.id;
      }
      return '';
    },
    searchParams() { // 详情 请求参数
      if (this.feaker) { // 线索库
        return {
          id: (this.selectId.length && this.selectId) || this.id
        };
      } if (this.cascade) { // 级联检索
        return {
          searchId: this.searchId,
          cascadeNodeRegId: this.cascadeNodeRegId,
          id: this.selectId.length && this.selectId
        };
      } // 抓拍检索
      return {
        id: (this.selectId.length && this.selectId) || this.id
      };
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.selectIndex = this.index;
        this.getInfo();
        if (this.hideSwiper) return;
        this.$nextTick(() => {
          this.$refs.detailSelector.resetSwiper();
        });
      // } else { // 不显示详情时清空，释放内存
      //   this.info = {};
      //   this.initDetail();
      }
    },
    'resultList.length': function (val) {
      if (this.visible && val && this.selectIndex > -1) {
        this.selectIndex = val <= this.selectIndex ? val - 1 : this.selectIndex;
      }
    },
    id: 'getInfo',
    // 埋点
    activeIndex(val) {
      if (parseInt(val, 10) > 1) {
        switch (this.$route.name) {
          case 'capture-search': {
            this.eventTracking(DetailTrackingMap['capture-search'][this.activeIndex]);
            break;
          }
          case 'attribute-search': {
            this.eventTracking(DetailTrackingMap['attribute-search'][this.activeIndex]);
            break;
          }
          default: break;
        }
      }
    }
  },
  created() {
    // 获取是否开启1：n
    this.detailCompare = this.$store.getters.systemByType('enableOneToMany').value === 'true';
    // 一人一档
    this.archivesSearchPermission = !!this.$store.getters.modulesByAlias(['doc-search']).length;
    // 获取系统设置抓拍回放时长
    this.defaultVideoLength = Number(this.$store.getters.systemByType('alarmVideoLengthSec').value || 5);
    // 初始化远程全景图获取器
    if (this.cascade) { // 级联检索时
      this.initRemoteFullImageFetcher(CaptureDetailSrv.cascadeFetchRemoteFullImage);
    } else { // 其他
      this.initRemoteFullImageFetcher(CaptureDetailSrv.fetchRemoteFullImage);
    }
  },
  methods: {
    /**
     * @description: 获取详情
     * @param {type}
     * @return
     */
    getInfo() {
      this.initDetail();
      // 埋点
      this.detailTracking();
      this.loading = true;
      const p = this.search(this.searchParams);
      p.then((res) => {
        if (res.code === 0) {
          this.info = res.data;
          this.info.score = this.resultList[this.selectIndex] && this.resultList[this.selectIndex].showScore;
          const hasFileVideo = this.info.resourceType === 1 && this.info.resourceUrl && this.info.resourceUrl.length;// 文件解析结果且有视频
          const hasCaptureVideo = this.info.ext && this.info.ext.videoList && this.info.ext.videoList.length;// 抓拍结果 且有视频
          this.hasVideo = Boolean(((hasCaptureVideo && !this.hideVideo) || hasFileVideo) && !this.feaker); // 不是报警伪造抓拍 且公安网中只能查看文件解析视频，不能查看抓拍视频
          this.initInfos();
        }
      });
    },
    // 不同环境下的检索方法
    search(params) {
      if (this.feaker) { // 线索库
        return CaptureDetailSrv.feakerGetDetail(params);
      } if (this.cascade) { // 级联检索
        return CaptureDetailSrv.cascadeGetDetail(params);
      } // 抓拍检索
      return CaptureDetailSrv.getDetail(params);
    },
    // 数据初始化
    initDetail() {
      // this.info = {};
      this.videoInfo = {};
      this.compareList = [];
      this.compareIndex = -1;
      this.peerList = [];
      this.peerIndex = -1;
    },
    // 初始化上传图
    initUploadFile() {
      const selectItem = this.resultList[this.selectIndex];
      const uploadItem = this.uploadList[selectItem.searchPhotoIndex];
      // 级联上传图
      let target;
      if (this.cascade) {
        target = { locator: uploadItem.locator, feature: uploadItem.feature, detectType: 0 };
      } else {
        // 通用上传图
        target = uploadItem.images ? uploadItem.images[selectItem.searchTargetIndex] : {};
      }
      if (target && target.locator && target.locator.rect) {
        utils.getExactImg(uploadItem.photo || uploadItem.photoData, target.locator.rect).then((base64) => {
          this.uploadFile = {
            ...target,
            base64
          };
        });
      } else {
        this.uploadFile = {
          ...target,
          ...uploadItem,
          base64: uploadItem.photo
        };
      }
    },
    /**
     * @description:初始化当前选中项的信息
     * @param {type}
     * @return:
     */
    initInfos() {
      if (this.isPhotoSearch) {
        // 以图搜图时初始化上传图
        this.initUploadFile();
      }
      this.initFullImg();
      if (this.hasVideo && !this.cascade && this.showVideo) {
        // 详情来源不是图片时 初始化视频信息
        this.initVideoInfo();
      }
      if (this.info.cameraId && !this.cascade && !this.info.id.startsWith('alarm_') && !(this.info.ext && this.info.ext.dualFlag) && this.showPeer) { // 线索库 报警伪装抓拍没有同行 双网双向 视频网同步至公安网的也没有同行
        this.initPeerInfo();
      }
      if (this.archivesSearchPermission && !this.cascade) {
        this.initProfileInfo();
      }
      if (this.hasFace && this.detailCompare && this.showCompare) {
        this.initCompareInfo();
      }
      this.loading = false;
    },
    /**
     * @description: 初始化抓拍全景图
     * @param {type}
     * @return
     */
    initFullImg() {
      if (this.customFullImgHandler) {
        this.customFullImgHandler(this, fullImgEmpty, loadingFullImg);
        return;
      }
      if (!this.info.fullUrl) {
        this.info.fullUrl = fullImgEmpty;
      }
    },
    /**
     * @description: 初始化同行信息
     * @param {type}
     * @return
     */
    initPeerInfo() {
      const params = {
        id: this.info.id,
        sourceType: this.info.cameraId ? 'CAMERA' : 'OFFLINE',
        detectTypes: [this.info.detectType],
        videoId: this.info.videoId,
        capturedTime: this.info.capturedTime,
        interval: 5,
      };
      CaptureDetailSrv.getPeerData(params).then((res) => {
        if (res.code === 0) {
          this.peerIndex = res.data.position;
          this.peerList = res.data.records;
        }
      });
    },
    /**
     * @description: 初始化一人一档信息
     * @param {type}
     * @return
     */
    initProfileInfo() {
      if (this.hasFace) {
        const params = {};
        if (this.info.detectType === 0) {
          params.faceId = this.info.id;
        } else {
          params.faceId = this.info.relatedPhotoVo.relatedId;
        }
        CaptureDetailSrv.isArchivesExist(params).then((res) => {
          if (res.code === 0) {
            this.info.hasProfile = res.data.hasProfile;
            this.info.profileId = res.data.profileId;
          }
        });
      }
    },
    /**
     * @description: 初始化比对信息
     * @param {type}
     * @return
     */
    initCompareInfo() {
      this.compareList = [];
      let url;
      if (this.info.detectType === 0) {
        url = this.info.cropUrl;
        this.compareFormData.faceList[0].rect = this.info.cropLocator.rect;
        this.compareFormData.capturePhotoId = this.info.id;
      } else {
        url = this.info.relatedPhotoVo.relatedCropUrl;
        this.compareFormData.faceList[0].rect = this.info.relatedPhotoVo.relatedCropLocator.rect;
        this.compareFormData.capturePhotoId = this.info.relatedPhotoVo.relatedId;
      }
      utils.urlToBase64(url).then((base64) => {
        this.compareFormData.faceList[0].photoData = base64;
        CaptureDetailSrv.passBySearch(this.compareFormData).then((res) => {
          if (res.code === 0) {
            this.compareList = res.data.candidateList || [];
          } else {
            this.compareList = [];
          }
        });
      });
    },
    /**
     * @description: 初始化视频信息
     * @param {type}
     * @return
     */
    async initVideoInfo() {
      this.videoInfo = {};
      const params = { allowShare: false };
      if (this.info.resourceUrl && this.info.resourceUrl.length) {
        params.type = 'file';
        params.url = window.location.origin.replace(/:\d+/, '') + this.info.resourceUrl;
        this.videoInfo.baseUrl = this.info.resourceUrl;
      } else if (this.info.cameraId) {
        const res = await CaptureDetailSrv.searchOpenVideoInfo({ deviceId: this.info.cameraId, protocol: 'iot' });
        if (res.code === 0) {
          this.info.ext.videoList[0].startTime = Math.ceil(this.info.ext.videoList[0].startTime / 1000);
          this.info.ext.videoList[0].endTime = Math.floor(this.info.ext.videoList[0].endTime / 1000);
          const transTime = Math.round(this.info.capturedTime / 1000);
          const defaultStart = transTime - this.defaultVideoLength;
          const start = defaultStart < this.info.ext.videoList[0].startTime ? this.info.ext.videoList[0].startTime : defaultStart;
          const defaultEnd = start + 2 * this.defaultVideoLength;
          const end = defaultEnd > this.info.ext.videoList[0].endTime ? this.info.ext.videoList[0].endTime : defaultEnd;
          params.type = 'iot';
          params.url = `${res.data.url}&start=${start}&end=${end}`;
          this.videoInfo.baseUrl = res.data.url;
        }
      } else {
        this.hasVideo = false;
        return;
      }
      CaptureDetailSrv.getAddr(params).then((resu) => {
        if (resu.code === 0) {
          Object.assign(this.videoInfo, {
            src: resu.data.streamAddr,
            cameraName: this.info.cameraName,
            cameraId: this.info.cameraId,
            capturedTime: this.info.capturedTime
          });
        }
      });
    },
    /**
     * @description: swiper选中改变
     * @param {Number}
     * @return
     */
    itemChange(index) {
      this.selectIndex = index;
      this.getInfo();
    },
    /**
     * @description: 切换标签页
     * @param {Object}
     * @return
     */
    onTabClick(tab) {
      if (tab.name === '2') {
        if (this.compareIndex === -1 && this.compareList.length) {
          this.compareIndex = 0;
        }
      } else {
        this.compareIndex = -1;
      }
    },
    /**
     * @description: 1:n卡片点击
     * @param {Number}
     * @return
     */
    compareCardClick(index) {
      this.compareIndex = index;
      this.activeIndex = '2';
    },
    /**
     * @description: 关闭详情
     * @param {type}
     * @return
     */
    onDialogClose() {
      this.activeIndex = '1';
      this.compareIndex = -1;
      this.$refs.compareDetail.reset();
      this.$emit('close');
      this.$emit('update:visible', false);
    },
    // 查看大图
    showImgScaled(item) {
      this.imgScaledOpt = item;
      this.imgScaledOpt.custom = Boolean(item.src.length > 1);
      this.showFullImgScreen = true;
    },
    // 埋点
    detailTracking() {
      switch (this.$route.name) {
        case 'alarm-realtime': {
          this.eventTracking('AlarmVideoZPTDetail');
          break;
        }
        case 'capture-search': {
          this.eventTracking('CaptureSearchDetail');
          break;
        }
        case 'attribute-search': {
          this.eventTracking('NatureSearchDetail');
          break;
        }
        default: break;
      }
    }
  },
};
</script>

<style lang='scss' scoped>
.capture-detail-dialog {
  overflow: hidden;
  ::v-deep .meg-dialog__body {
    padding: 0;
  }
  .detail-container {
    display: flex;
    height: 447px;
    padding: 0 30px;
  }
  .huge {
    height: 583px;
  }
  .card-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
  .map-wrapper {
    width: 320px;
    height: 447px;
  }
  .huge-map-wrapper {
    width: 100%;
  }
}
</style>
