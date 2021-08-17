<template>
  <div
    class="analysis-map__wrapper"
    v-background="bgVisible">
    <div
      class="analysis-map__container"
      v-loading="loading">
      <div
        class="analysis-map__main"
        v-if="!loading">
        <div class="analysis-aside-list">
          <div class="slide-header">
            <p>共经过{{ addressCount }}个地方，出现{{ totalCount }}次</p>
          </div>
          <div
            class="slide-list-container">
            <common-collapse
              ref="collapse"
              v-model="collapseActiveIndex"
              @change="onCategoryChange"
              :categories="categories"
              :list="cardList">
              <template v-slot:list="{list}">
                <div
                  v-for="(item, index) in list"
                  :key="item.id">
                  <thread-card
                    :is-cascade="isCascade"
                    :actived="index === captureIdx"
                    :card-data="item"
                    :ind="item.collapseIndex"
                    :is-show-del-button="false"
                    :is-show-base-button="showBaseButton"
                    :is-show-detail="false"
                    @click.native="handleClickItem(item, index)">
                  </thread-card>
                </div>
              </template>
            </common-collapse>
          </div>
        </div>
        <div class="analysis-map__content">
          <track-play-map
            ref="tracePlayMap"
            :track-data="trackData">
            <template v-slot:freeInfoOverlay="{params}">
              <trace-free-overlay
                class="trace-free-overlay"
                @detail="handleCaptureDetail(params)"
                @close="handleCloseFreeInfoOverflay"
                :data="params"></trace-free-overlay>
            </template>
          </track-play-map>
        </div>
        <common-capture-detail
          :show-temporary="false"
          :feaker="!isCascade"
          :cascade="isCascade"
          :search-id="defaultParams.searchId"
          :cascade-node-reg-id="defaultParams.cascadeNodeRegId"
          :visible.sync="captureDialogVisible"
          :result-list="detailList"
          :index="captureIdx">
        </common-capture-detail>
      </div>
    </div>
  </div>
</template>
<script>
import CommonCaptureDetail from '@/common-components/common-capture-detail';
import CommonCollapse from '@/common-components/common-collapse';
import TrackPlayMap from '@/common-components/common-maps/trace-play-map';
import threadCard from '@/components/judge/thread-card';
import EventManageApi from '../events-manage.service';
import TraceFreeOverlay from '../components/trace-free-overlay';
import { flatten } from '../utils';
// 默认获取线索库聚合数据
function noop() {
  return EventManageApi.clueCategory;
}
export default {
  name: 'TrackAnalysis',
  components: {
    CommonCollapse,
    TrackPlayMap,
    TraceFreeOverlay,
    CommonCaptureDetail, // 卡片详情
    threadCard,
  },
  props: {
    // 默认传参
    defaultParams: {
      type: Object,
      default: () => ({}),
    },
    // 获取地图渲染数据
    fetchFunc: {
      type: Function,
      default: noop,
    }
  },
  data() {
    return {
      progress: 0,
      isPlay: false,
      disabled: true,
      detailInfo: {},
      cardList: [],
      categories: [],
      mapRecords: [],
      trackData: [],
      loading: false,
      addressCount: 0, // {x}地方
      totalCount: 0, // {y}出现次数
      captureDialogVisible: false, // 查看详情弹窗
      captureIdx: -1, // 查看详情下标
      detailList: [], // 查看详情list
      recordsMap: {},
      collapseActiveIndex: 0,
    };
  },
  computed: {
    bgVisible() {
      const background = {
        icon: 'icon_2',
        text: '暂无数据'
      };
      if (this.categories.length > 0 || this.loading) return false;
      return background;
    },
    showBaseButton() {
      const { query } = this.$route;
      if (query && query.eventId) {
        return ['jump'];
      }
      return ['jump', 'temporary'];
    },
    isCascade() {
      return Boolean(this.defaultParams && this.defaultParams.cascadeNodeRegId);
    },
    addSelf() {
      return this.$store.getters['shelf/eventAddData'];
    },
  },
  watch: {
    addSelf(newVal, oldVal) {
      if (newVal !== oldVal) {
        // 根据日期聚合
        this.getClueCategory('date');
        // 更具相机聚合
        this.getClueCategory('camera');
      }
    },
  },
  created() {
    // 根据日期聚合
    this.getClueCategory('date');
    // 更具相机聚合
    this.getClueCategory('camera');
  },
  methods: {
    updateIndex() {
      this.$nextTick(() => {
        const { collapse } = this.$refs;
        if (collapse) {
          collapse.$el.querySelectorAll('.meg-collapse-item').forEach((item) => {
            if (item.classList.contains('is-active')) {
              item.style.zIndex = 2;
            } else {
              item.style.zIndex = 1;
            }
          });
        }
      });
    },
    getClueCategory(aggType) {
      let realParams = {
        aggType,
        order: 'desc',
      };
      const reqParams = {
        eventId: this.$route.query.eventId,
        limitLonLat: true,
      };
      this.loading = true;
      const getMapRenderFunc = this.fetchFunc();
      if (Object.keys(this.defaultParams).length) {
        realParams = Object.assign(realParams, this.defaultParams);
      } else {
        realParams = Object.assign(realParams, reqParams);
      }
      getMapRenderFunc(realParams).then((res) => {
        this.loading = false;
        if (res.code === 0) {
          const records = res.data.records.map((item) => ({
            displayName: item.aggName,
            count: item.count,
            ...item
          }));
          if (aggType === 'camera') {
            this.addressCount = records.length;
            this.totalCount = records.reduce((total, item) => total + item.count, 0);
          } else {
            this.dealWithAsideData(records);
            this.dealWithMapData(records);
            this.dealWithFlatterData(records); // 数据拍平
          }
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    /*
    * 数组拍平
    */
    dealWithFlatterData(records) {
      const map = {};
      function mapData(idx, arr) {
        for (let j = 0; j < arr.length; j += 1) {
          const temp = arr[j];
          const id = temp.captureId;
          map[id] = {
            ...temp,
            listResults: arr,
            idx,
            captureIndex: j,
          };
        }
      }
      for (let i = 0; i < records.length; i += 1) {
        const p = records[i];
        if (p.listResults && p.listResults.length) {
          mapData(i, p.listResults);
        }
      }
      this.recordsMap = map;
    },
    /**
     * 处理地图数据
     */
    dealWithMapData(records) {
      if (Array.isArray(records) && records.length) {
        this.mapRecords = records;
        this.trackData = flatten(this.mapRecords);
      }
    },
    /**
     * 处理左侧数据
     */
    dealWithAsideData(records) {
      this.categories = records;
      this.total = records.reduce((total, item) => total + item.count, 0);
      let collapseTotal = this.total;
      if (this.categories && this.categories.length > 0) {
        // 给每一个目标标号
        this.categories.forEach((item) => {
          const { listResults } = item;
          listResults.forEach((list) => {
            list.collapseIndex = collapseTotal;
            collapseTotal -= 1;
            list.cardURL = list.url;
          });
        });
        this.cardList = this.categories[0].listResults;
        this.updateIndex();
      }
    },
    onCategoryChange(idx) {
      if (idx || idx === 0) {
        this.captureIdx = -1;
        this.cardList = this.categories[idx].listResults;
      }
      this.updateIndex();
    },
    /**
     * 动态展示地图播放进度
     */
    handleMapPlayProgress(current, total) {
      this.progress = Math.floor(((current + 1) / total) * 100);
    },
    handleClickItem(item, idx) {
      const { longitude, latitude } = item;
      this.$refs.tracePlayMap.showFreeOverlay({
        lon: longitude,
        lat: latitude,
        ...item
      });
      this.captureIdx = idx;
    },
    // 关闭自由弹窗
    handleCloseFreeInfoOverflay() {
      this.$refs.tracePlayMap.hideFreeOverlay();
    },
    // 查看图片详情
    handleCaptureDetail(params) {
      const { captureId } = params;
      const tagId = captureId;
      const {
        idx, listResults, captureIndex
      } = this.recordsMap[tagId];
      this.collapseActiveIndex = idx;
      this.captureDialogVisible = true;
      this.captureIdx = captureIndex;
      this.detailList = listResults;
      this.cardList = listResults;
    }
  },
};
</script>
<style lang="scss" scoped>
  .trace-free-overlay {
    bottom: -30px;
  }
  .analysis-map__wrapper {
    width: 100%;
    height: 100%;
    position: relative;
    .analysis-map__container {
      height: 100%;
      display: flex;
      justify-content: flex-start;
      align-content: center;
      align-items: center;
    }
    .analysis-map__main {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: flex-start;
      align-content: center;
      align-items: center;
    }
    .analysis-aside-list {
      width: 320px;
      height: 100%;
      overflow: hidden;
      background-color: #fff;
      box-shadow: 4px 4px 6px 0 rgba(0,0,0,0.20);
      .slide-header {
        width: 100%;
        height: 56px;
        background: #F9F9F9;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        >p {
          font-size: 14px;
          color: #435068;
          padding-left: 20px;
        }
      }
      .slide-list-container {
        height: calc(100% - 56px);
        overflow-y: scroll;
        background-color: #fff;
        ::v-deep .meg-collapse-item {
          position: relative;
        }
      }
    }
    .analysis-map__content {
      width: calc(100% - 320px);
      height: 100%;
    }
  }
</style>
