<template>
  <div
    class="snap-picture">
    <meg-tabs
      v-model="activeName"
      type="card">
      <meg-tab-pane
        :label="$t('人脸')"
        name="face">
        <meg-scrollbar>
          <div
            v-background="activeFaceList.length > 0 ? false : {icon:'icon_3',text:$t('暂无结果')}"
            class="content-body">
            <meg-card-frame
              tag="div"
              :gap="10"
              :card-min-width="270">
              <detail-face-card
                v-for="(item, ind) of activeFaceList"
                :face-card-data="item"
                :key="ind"
                @click.native="getFaceDetail(item, ind)">
                <div
                  slot="delete"
                  class="delete-icon"
                  @click.stop="deleteCard('face', item)">
                  <meg-icon
                    name="mission_del"
                    color="#FFFFFF"></meg-icon>
                </div>
              </detail-face-card>
            </meg-card-frame>
            <div
              class="load-more-box"
              v-if="!(faceList.length === 0)"
              @click="loadFaceMore">
              <meg-button>
                {{ $t('加载更多') }}
              </meg-button>
            </div>
          </div>
        </meg-scrollbar>
      </meg-tab-pane>
      <meg-tab-pane
        :label="$t('人体')"
        name="body">
        <meg-scrollbar>
          <div
            v-background="activeBodyList.length > 0 ? false : {icon:'icon_3',text:$t('暂无结果')}"
            class="content-body">
            <meg-card-frame
              tag="div"
              :gap="10"
              :card-min-width="244">
              <detail-body-card
                v-for="(item, ind) of activeBodyList"
                :body-card-data="item"
                :key="ind"
                @click.native="getBodyDetail(item, ind)">
                <div
                  slot="delete"
                  class="delete-icon"
                  @click.stop="deleteCard('body', item)">
                  <meg-icon
                    name="mission_del"
                    color="#FFFFFF"></meg-icon>
                </div>
              </detail-body-card>
            </meg-card-frame>
            <div
              @click="loadBodyMore"
              v-if="!(bodyList.length === 0)"
              class="load-more-box">
              <meg-button>
                {{ $t('加载更多') }}
              </meg-button>
            </div>
          </div>
        </meg-scrollbar>
      </meg-tab-pane>
    </meg-tabs>
    <common-capture-detail
      :index="detailSelectIndex"
      :visible.sync="detailVisible"
      :result-list="detailList"
      :show-temporary="false"
      @close="closeCaptureDetail">
    </common-capture-detail>
  </div>
</template>

<script>
import CommonCaptureDetail from '@/common-components/common-capture-detail';
import detailFaceCard from './detail-face-card';
import detailBodyCard from './detail-body-card';

const PAGESIZE = 60;

export default {
  components: {
    detailFaceCard,
    detailBodyCard,
    CommonCaptureDetail
  },
  props: {
    faceList: {
      type: Array,
      default: () => []
    },
    bodyList: {
      type: Array,
      default: () => []
    },
  },
  data() {
    return {
      detailVisible: false,
      activeName: 'face',
      activeFaceList: [],
      activeBodyList: [],
      detailSelectIndex: -1,
    };
  },
  computed: {
    detailList() {
      const list = this.activeName === 'face' ? this.activeFaceList : this.activeBodyList;
      return list.map((item) => ({
        ...item,
        id: item.faceId || item.id,
        cropUrl: item.faceUrl || item.url,
      }));
    }
  },
  methods: {
    deleteCard(type, item) {
      this.$emit('delete-card', type, item);
    },
    closeCaptureDetail() {
      this.detailVisible = false;
    },
    loadMore() {
      this.loadFaceMore();
      this.loadBodyMore();
    },
    getBodyDetail(cardData, index) {
      this.detailVisible = true;
      this.detailSelectIndex = index;
    },
    getFaceDetail(cardData, index) {
      this.detailVisible = true;
      this.detailSelectIndex = index;
    },
    loadFaceMore() {
      let item = [];
      if (this.faceList.length > PAGESIZE) {
        item = this.faceList.splice(0, PAGESIZE);
      } else {
        item = this.faceList.splice(0);
      }
      this.activeFaceList = this.activeFaceList.concat(item);
    },
    loadBodyMore() {
      let item = [];
      if (this.bodyList.length > PAGESIZE) {
        item = this.bodyList.splice(0, PAGESIZE);
      } else {
        item = this.bodyList.splice(0);
      }
      this.activeBodyList = this.activeBodyList.concat(item);
    },
    resetData() {
      this.activeFaceList = [];
      this.activeBodyList = [];
    },
  }
};
</script>
<style lang='scss' scoped>
.snap-picture {
  background: #dce1e5;
  height: 100%;
  padding: 0 30px;
  ::v-deep .meg-tabs__header {
    padding-top: 12px;
    padding-bottom: 15px;
    border: 0;
    display: flex;
    justify-content: center;
    .meg-tabs__nav {
      border: 0;
    }
    ::v-deep .meg-tabs__item {
      width: 88px;
      height: 34px;
      line-height: 34px;
      background: #f7f8f9;
      border: 1px solid #c6cad1;
      border-radius: 1px 0 0 1px;
      font-family: SourceHanSansCN-Bold;
      font-size: 14px;
      color: #435068;
      text-align: center;
      border: 0;
    }
    .is-active {
      background: #21539b;
      border-radius: 1px;
      color: #ffffff;
    }
    .meg-tabs__nav-scroll {
      padding: 0;
    }
  }
  .content-body {
    height: (100% - 56) px;
    padding-bottom: 280px;
  }
  .load-more-box {
    text-align: center;
    width: 100%;
    height: 56px;
    button {
      width: 300px;
      margin-top: 10px;
    }
  }
}
</style>
