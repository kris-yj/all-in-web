<template>
  <div class="shelf-content">
    <div class="content-header">
      <div
        class="tab-list"
        v-show="!isSelectMode">
        <meg-radio-group
          v-model="currentTab">
          <meg-radio-button
            label="capture">
            抓拍({{ countData.captureCount }})
          </meg-radio-button>
          <meg-radio-button
            label="database">
            底库({{ countData.albumCount }})
          </meg-radio-button>
          <meg-radio-button
            label="alarm">
            报警({{ countData.alarmCount }})
          </meg-radio-button>
        </meg-radio-group>
      </div>
      <div
        class="select-operation"
        v-show="isSelectMode">
        <div class="select-num">
          <meg-checkbox
            :indeterminate="isIndeterminate"
            v-model="isCheckedAll"
            @change="onCheckAllClick">
            全选
          </meg-checkbox>
          已选 <span>{{ checkedList.length }}</span> 条
        </div>
        <div class="btn-group">
          <meg-button
            v-show="!showAddCurrentEvent"
            @click="addToEvent"
            type="primary">
            添加到事件
          </meg-button>
          <meg-button
            v-show="showAddCurrentEvent"
            @click="addToCurrentEvent"
            type="primary">
            添加到当前事件
          </meg-button>
          <meg-button
            v-show="currentTab==='capture'"
            @click="jumpToTrack"
            type="primary">
            查看轨迹
          </meg-button>
          <meg-button @click="deleteItem">
            删除
          </meg-button>
          <meg-button @click="exportItem">
            导出
          </meg-button>
          <meg-button @click="exitSelectMode">
            退出选择
          </meg-button>
        </div>
      </div>
    </div>

    <div
      v-loading="cardListLoading"
      class="card-list-wrap">
      <div
        class="background-wrap"
        v-background="emptyBackground">
        <section>
          <div class="card-list">
            <select-frame
              ref="selectFrame"
              :list="cardListData[currentTab].list"
              :card-min-width="320"
              item-key="temId"
              @check-list-change="handleCheckChange"
              :show-checkbox="true">
              <template
                v-slot="{item,index}">
                <capture-card
                  v-if="currentTab==='capture'"
                  :temporary-request-params="{analyzeType: 0}"
                  @click.native.stop="handleCardClick(index)"
                  :draggable="true"
                  :card-data="item.captureDetail"
                  @delete-card="deleteCard(item)"
                  :is-show-base-button="['jump']">
                </capture-card>
                <alarm-card
                  @click="handleCardClick(index)"
                  v-else-if="currentTab==='alarm'"
                  draggable
                  :right-img-draggable="rightImgDraggable"
                  :show-delete-icon="true"
                  :show-store-icon="false"
                  @delete="deleteCard(item)"
                  :card-info="item.alarmDetail">
                </alarm-card>
                <database-card
                  v-else-if="currentTab==='database'"
                  @card-click="handleCardClick(index)"
                  @delete="deleteCard(item)"
                  :draggable="true"
                  :show-jump-button="true"
                  :show-temporary-button="false"
                  :show-delete-button="true"
                  :card-data="item.albumDetail">
                </database-card>
              </template>
            </select-frame>
          </div>
        </section>
        <div
          v-show="showLoadMore&&!isSelectMode"
          class="load-more">
          <meg-button
            :loading="cardListLoading"
            @click="loadMore">
            加载更多
          </meg-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import AlarmCard from '@/common-components/common-alarm-card';
import CaptureCard from '@/common-components/common-new-card/common-card-ue';
import DatabaseCard from '@/common-components/common-database-card';
import SelectFrame from '@/common-components/common-collapse/select-frame.vue';

export default {
  components: {
    AlarmCard,
    CaptureCard,
    DatabaseCard,
    SelectFrame
  },
  props: {
    cardListLoading: {
      type: Boolean,
      default: () => false
    },
    cardListData: {
      type: Object,
      default: () => {}
    },
    emptyBackground: {
      type: [Object, Boolean],
      default: () => false
    },
    countData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      currentTab: 'capture',
      checkedList: [],
      hoverId: '',
      isCheckedAll: false,
      isIndeterminate: true
    };
  },
  computed: {
    showLoadMore() {
      const { list, total } = this.cardListData[this.currentTab];
      return list.length < total && list.length > 0;
    },
    selectTempIds() {
      return this.checkedList.map((item) => item.temporary.temId);
    },
    isSelectMode() {
      return this.checkedList.length > 0;
    },
    showAddCurrentEvent() {
      const { fullPath } = this.$route;
      return fullPath.includes('events-detail');
    },
    rightImgDraggable() {
      const { fullPath } = this.$route;
      return fullPath.includes('manage-result');
    },
    currentListData() {
      return this.cardListData[this.currentTab].list || [];
    }
  },
  watch: {
    currentTab(val) {
      this.$emit('current-tab-change', val);
    },
    checkedList(val) {
      const checkLength = val.length;
      const listDataLength = this.currentListData.length;
      const isCheckedAll = checkLength === listDataLength;
      this.isCheckedAll = isCheckedAll;
      this.isIndeterminate = val.length > 0 && !isCheckedAll;
    },
    cardListData: {
      immediate: true,
      handler() {
        this.currentListData.forEach((item, index) => {
          Object.defineProperty(item, '$selectValue', {
            value: false,
            configurable: true,
            writable: true,
            enumerable: false
          });
          this.currentListData[index] = item;
        });
      },
    },
  },
  methods: {
    /*
    * 选择卡片回调
    * @param {any}
    * @return
    * */
    handleCheckChange(checkedList, checkedItems) {
      this.checkedList = checkedItems;
    },
    /*
    * 全选checkbox
    * @param {any}
    * @return
    * */
    onCheckAllClick(val) {
      const checkedList = this.currentListData;
      this.$refs.selectFrame.setAllCheckedStatus(val);
      this.checkedList = val ? checkedList : [];
      this.isIndeterminate = false;
    },
    /*
    * 从暂存架中删除
    * @param {data: 卡片数据}
    * @return
    * */
    deleteCard(data) {
      this.$emit('delete-item', {
        ids: [data.temporary.temId]
      });
    },
    /*
    * 加载更多
    * @param {any}
    * @return
    * */
    loadMore() {
      this.$emit('load-more');
    },
    /*
    * 轨迹回放
    * @param {any}
    * @return
    * */
    jumpToTrack() {
      // 过滤没有经纬度信息的图片
      const validCheckedList = this.checkedList.filter((item) => item.captureDetail.sourceType === 'REALTIME');
      if (validCheckedList.length > 0) {
        const selectIds = validCheckedList.map((item) => item.temporary.temId);
        this.$emit('jump-to-track', {
          ids: selectIds,
        });
      } else {
        this.$message.error('无经纬度，无法在地图显示');
      }
    },
    /*
    * 添加到当前事件
    * @param {any}
    * @return
    * */
    addToCurrentEvent() {
      const { eventId } = this.$route.query;
      this.$emit('add-to-current-event', {
        eventId,
        checkedList: this.checkedList,
        type: this.currentTab
      });
    },
    /*
    * 点击卡片
    * @param {index}
    * @return
    * */
    handleCardClick(index) {
      this.$emit('card-click', index);
    },
    /*
    * 加入事件
    * @param {any}
    * @return
    * */
    addToEvent() {
      this.$emit('show-add-event-dialog', {
        checkedList: this.checkedList,
        type: this.currentTab
      });
    },
    /*
    * 鼠标移入卡片
    * @param {id: 暂存架id}
    * @return
    * */
    handleMouseEnter(id) {
      this.hoverId = id;
    },
    /*
    * 鼠标移出卡片
    * @param {any}
    * @return
    * */
    handleMouseLeave() {
      this.hoverId = '';
    },
    /*
    * 删除暂存架
    * @param {any}
    * @return
    * */
    deleteItem() {
      this.$emit('delete-item', {
        ids: this.selectTempIds
      });
      this.exitSelectMode();
    },
    /*
    * 导出暂存架
    * @param {any}
    * @return
    * */
    exportItem() {
      this.$emit('export-item', {
        ids: this.selectTempIds
      });
      this.exitSelectMode();
    },
    /*
    * 退出选择
    * @param {any}
    * @return
    * */
    exitSelectMode() {
      this.checkedList = [];
      this.$refs.selectFrame.setAllCheckedStatus(false);
    }
  }
};
</script>
<style lang="scss" scoped>
.shelf-content {
  background: #f2f4f8;
  height: 100%;
}
.content-header {
  margin-bottom: 12px;
}
.tab-list {
  text-align: center;
}
.select-operation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .select-num {
    span {
      font-weight: 500;
    }
  }
}
.card-list-wrap {
  height: calc(100% - 34px);
}
.background-wrap {
  height: 100%;
  overflow-y: scroll;
}
.card-list {
  padding: 0 8px 50px;
  font-size: unset;
}
.load-more {
  text-align: center;
  margin: 0 auto 20px;
}
</style>
