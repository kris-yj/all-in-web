<template>
  <div>
    <meg-dialog
      class="cardDetail"
      width="1250px"
      :visible="true"
      :show-close="true"
      @close="close">
      <div slot="title">
        <div class="tab-title-container">
          <span
            @click="onTabClick(1)"
            :class="{'active__main':activeIndex===1}">{{ $t('详情') }}</span>
        </div>
      </div>
      <div
        class="detail-container-main"
        v-loading="loading">
        <div class="detail-content-container">
          <div
            v-show="activeIndex===1"
            class="detail-content-item">
            <capture-sub-detail
              :detail-list="detailListData"
              :index="indexData"></capture-sub-detail>
          </div>
          <div class="footer">
            <capture-selector
              :detail-list="detailListData"
              :default-selected-index="indexData"
              @change="indexlist">
            </capture-selector>
          </div>
        </div>
      </div>
    </meg-dialog>
  </div>
</template>
<script>
import CaptureSubDetail from './capture-sub-detail';
import CaptureSelector from './capture-selector';

export default {
  name: 'CaptureDetail',
  components: {
    CaptureSubDetail,
    CaptureSelector,
  },
  props: {
    // 弹框显隐
    visible: {
      type: Boolean,
      default: true
    },
    // 卡片列表
    detailList: {
      type: Array,
      default: () => []
    },
    index: {
      type: Number,
      default: 0
    },
  },
  data() {
    return {
      activeIndex: 1,
      loading: false,
      mapInfo: [],
      detailListData: [],
      indexData: 0,
      indexLists: 0,
      videoInfo: {},
    };
  },
  computed: {
  },
  watch: {
    indexLists: {
      handler() {
        this.videoInfo = this.detailListData[this.indexLists];
      }
    },
    detailList: {
      handler() {
        this.detailListData = this.detailList;
      },
      deep: true
    },
    index: {
      handler() {
        this.indexData = this.index;
      },
      deep: true
    },
  },
  created() {
    this.detailListData = this.detailList;
    this.indexData = this.index;
    this.indexLists = this.index;
    this.videoInfo = this.detailListData[this.indexLists];
  },
  methods: {
    indexlist(index) {
      this.indexData = index;
      this.indexLists = index;
    },
    close() {
      this.$emit('close');
    },
    onTabClick(num) {
      this.activeIndex = num;
    },
  }
};
</script>
<style lang="scss" scoped>
::v-deep .meg-dialog__body {
  padding: 0;
}
.tab-title-container span {
  display: inline-block;
  height: 50px;
  line-height: 50px;
  box-sizing: border-box;
  font-size: 12px;
  cursor: pointer;
  color: #435068;
  text-align: center;
  margin-right: 20px;
}

.tab-title-container span:hover {
  color: #21539b;
}
.tab-title-container span.active__main {
  color: #435068;
  font-size: 16px;
  font-weight: bold;
}
.detail-container-main {
  height: 550px;
  display: flex;
  flex-direction: column;
}

.detail-content-container {
  height: 100%;
}
.detail-content-item {
  height: calc(100% - 136px);
  flex: 0 1 auto;
}
.footer {
  height: 136px;
}
</style>
