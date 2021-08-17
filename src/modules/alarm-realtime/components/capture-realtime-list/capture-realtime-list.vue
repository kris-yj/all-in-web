<template>
  <div class="capture-list-container">
    <statistics-panel class="capture-statistics"></statistics-panel>
    <capture-animate-list
      ref="list"
      @on-img-click="showCaptureDetail"
      class="capture-list">
    </capture-animate-list>
    <capture-detail
      :visible.sync="detailVisible"
      :hide-swiper="true"
      :id="captureId"
      @close="detailVisible=false"
      @change="onChangeDetail">
    </capture-detail>
  </div>
</template>
<script>
import CaptureDetail from '@/common-components/common-capture-detail/capture-detail.vue';
import StatisticsPanel from '../alarm-capture-statistics-panel.vue';
import CaptureAnimateList from './capture-animate-list.vue';

const eventTrackIdMap = {
  'map': 'AlarmMapZPTDetail',
  'video': 'AlarmVideoZPTDetail',
  'struct': 'AlarmStructureZPTDetail'
};

export default {
  name: 'CaptureRealtimeList',
  components: {
    StatisticsPanel,
    CaptureAnimateList,
    CaptureDetail
  },
  props: {
    alarmMode: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      detailVisible: false,
      captureId: undefined
    };
  },
  methods: {
    /**
     * 显示抓拍详情
     */
    showCaptureDetail(data) {
      this.eventTracking(eventTrackIdMap[this.alarmMode]);
      this.captureId = data.id;
      this.detailVisible = true;
    },
    onChangeDetail() {

    },
    /**
     * 更新产生抓拍的相机
     * @param { Array } cameras
     */
    updateCamera(array) {
      this.$refs.list.updateDeviceInfo(array.map((item) => item.id));
    }
  }
};
</script>

<style lang="scss" scoped>
.capture-list-container {
  display: flex;
  height: 100px;
  align-items: flex-end;
  .capture-statistics {
    flex: 0 0 170px;
    height: 90px;
  }
  .capture-list {
    flex: 1;
    height: 100px;
  }
}
</style>
