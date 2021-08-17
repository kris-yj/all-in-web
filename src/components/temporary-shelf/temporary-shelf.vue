<template>
  <meg-popover
    trigger="click"
    width="696"
    ref="shelfPopover"
    popper-class="shelf-popover"
    placement="bottom"
    v-model="shelfPopoverVisible">
    <div
      slot="reference"
      ref="shelfReference"
      class="shelf-container">
      <guide
        :show-guide-content="showGuideContent"
        :shelf-icon-pos="shelfIconPos"
        v-show="showGuideModal"
        :add-event-pos="addEventPos"
        @close-guide="closeGuideModal"></guide>
      <div :class="{highlight: showGuideModal&&!isGuideOnce}">
        <span
          class="plus-one"
          v-show="addingToShelf">+1</span>
        <meg-icon
          name="temporary-store"
          ref="shelfIcon"
          :class="{'shrink-animation':addingToShelf}"></meg-icon>
        <span class="total-num">{{ countData.tempCount || 0 }}</span>
        <span class="background"></span>
      </div>
    </div>
    <div
      class="shelf-content-wrap">
      <shelf-content
        ref="shelfContent"
        :count-data="countData"
        :card-list-data="cardListData"
        :empty-background="emptyBackground"
        :card-list-loading="cardListLoading"
        @current-tab-change="handleCurrentTabChange"
        @add-to-current-event="addToCurrentEvent"
        @show-add-event-dialog="showAddEventDialog"
        @get-list="getShelfList"
        @load-more="loadMore"
        @jump-to-track="jumpToTrack"
        @card-click="handleCardClick"
        @export-item="exportItem"
        @delete-item="deleteItem"></shelf-content>
    </div>
    <event-select
      @add-to-event="addToCurrentEvent"
      :visible.sync="eventListVisible"
      :event-list="eventList"></event-select>
    <card-detail
      @update-list="updateShelfData"
      :card-list="clickCardList"
      :index.sync="clickCardIndex"
      :type="currentTab"
      :visible.sync="cardDialogVisible"></card-detail>
  </meg-popover>
</template>
<script>
import { mapGetters } from 'vuex';
import commonSwitchParams from '@/common-components/common-switch-params';
import ShelfContent from './shelf-content';
import EventSelect from './event-select';
import ShelfServ from './temporary-shelf.service';
import CardDetail from './card-detail';
import Guide from './guide';

const TYPE_DATA = {
  'capture': 1,
  'alarm': 2,
  'database': 3
};
export default {
  components: {
    ShelfContent,
    EventSelect,
    CardDetail,
    Guide
  },
  data() {
    return {
      shelfPopoverVisible: false,
      pageSize: 20,
      countData: {},
      eventList: [],
      eventListVisible: false,
      eventImgType: '',
      checkedList: '',
      cardListLoading: false,
      currentTab: 'capture',
      cardDialogVisible: false,
      clickCardList: [],
      clickCardIndex: -1,
      addingToShelf: false,
      flyToShelf: false,
      showGuideContent: false,
      showGuideModal: false,
      emptyBackground: false,
      isGuideOnce: false, // 是否为第一次添加暂存架
      addEventPos: {
        clientX: 0,
        clientY: 0
      },
      shelfIconPos: {},
      cardListData: {
        capture: {
          pageNo: 1,
          total: 0,
          list: []
        },
        alarm: {
          pageNo: 1,
          total: 0,
          list: []
        },
        database: {
          pageNo: 1,
          total: 0,
          list: []
        }
      },
    };
  },
  computed: {
    ...mapGetters('shelf', [
      'isShelfOpen',
      'manageShelfData',
      'deleteShelfData'
    ]),
    shelfType() {
      return TYPE_DATA[this.currentTab] || 1;
    },
    pageNo() {
      return this.cardListData[this.currentTab].pageNo;
    }
  },
  watch: {
    // 监听加入和移除暂存架
    manageShelfData(data) {
      if (!data) {
        return;
      }
      if (data && data.action === 'add') {
        this.addEventPos = {
          clientX: data.x,
          clientY: data.y
        };
        const posData = this.$refs.shelfIcon.$el.getBoundingClientRect();
        this.shelfIconPos = {
          left: posData.left,
          top: posData.top
        };
        const { userName } = this.$store.getters.user;
        this.isGuideOnce = localStorage.getItem(`${userName}-guided`);
        if (!this.isGuideOnce) {
          this.showGuideModal = true;
          this.flyToShelf = true;
          this.animationTimeout = setTimeout(() => {
            this.flyToShelf = false;
            if (!this.isGuideOnce) {
              this.showGuideContent = true;
            } else {
              this.showGuideModal = false;
              this.addingToShelf = true;
              this.addingTimeout = setTimeout(() => {
                this.addingToShelf = false;
                this.updateShelfData();
              }, 1400);
            }
          }, 2000);
        } else {
          this.addingToShelf = true;
          this.addingTimeout = setTimeout(() => {
            this.addingToShelf = false;
            this.updateShelfData();
          }, 1400);
        }
      } else {
        this.$store.dispatch('shelf/deleteShelf', {
          type: this.currentTab,
          id: data.id
        });
        this.updateShelfData();
      }
      // 解决 getters 被registModule触发
      this.$store.dispatch('shelf/manageShelf', null);
    },
    shelfPopoverVisible(visible) {
      if (this.isShelfOpen && !visible) {
        this.$store.dispatch('shelf/setShelfState', false);
      }
      if (visible) {
        this.$refs.shelfContent.exitSelectMode();
        this.resetPageData();
        this.getItemCount();
        this.getShelfList();
      }
    },
    isShelfOpen(isOpen) {
      this.shelfPopoverVisible = isOpen;
    },
    '$route.fullPath': function () {
      this.shelfPopoverVisible = false;
      this.cardDialogVisible = false;
    }
  },
  created() {
    this.getItemCount();
  },
  mounted() {

  },
  beforeDestroy() {
    clearTimeout(this.animationTimeout);
    clearTimeout(this.addingTimeout);
  },
  methods: {
    /*
    * 引导弹框关闭回调
    * @param {any}
    * @return
    * */
    closeGuideModal() {
      this.showGuideModal = false;
      this.showGuideContent = false;
      // modal关闭后开启+1动画
      this.addingToShelf = true;
      this.addingTimeout = setTimeout(() => {
        this.updateShelfData();
        this.addingToShelf = false;
      }, 1400);
    },
    /*
    * 跳转查看轨迹
    * @param {any}
    * @return
    * */
    jumpToTrack(data) {
      const moduleInfo = {
        isBlank: true,
        pageType: 'single',
        module: 'shelf-track-analysis',
        query: {
          ids: data.ids.join(','),
          temType: TYPE_DATA[this.currentTab]
        }
      };
      new commonSwitchParams.FormatSwitchParams(moduleInfo).switchToModule();
    },
    /*
    * 重置分页数据
    * @param {any}
    * @return
    * */
    resetPageData() {
      this.cardListData[this.currentTab].list = [];
      this.cardListData[this.currentTab].pageNo = 1;
    },
    /*
    * 加载更多
    * @param {any}
    * @return
    * */
    loadMore() {
      this.cardListData[this.currentTab].pageNo += 1;
      this.getShelfList();
    },
    /*
    * 点击卡片
    * @param {index}
    * @return
    * */
    handleCardClick(index) {
      const type = this.currentTab;
      const typeMap = {
        capture: 'captureDetail',
        alarm: 'alarmDetail',
        database: 'albumDetail'
      };
      this.cardDialogVisible = true;
      const listData = this.cardListData[this.currentTab].list;
      this.clickCardList = listData.map((item) => item[typeMap[type]]);
      this.clickCardIndex = index;
    },
    /*
    * tab 切换
    * @param {any}
    * @return
    * */
    handleCurrentTabChange(tab) {
      this.currentTab = tab;
      this.resetPageData();
      this.getItemCount();
      this.getShelfList();
    },
    /*
    * 添加到当前事件
    * @param {any}
    * @return
    * */
    addToCurrentEvent(data) {
      const { eventId, checkedList = [] } = data;
      // 添加到当前事件会直接把checkedList传过来
      if (checkedList.length > 0) {
        this.checkedList = checkedList;
      }
      if (this.currentTab === 'alarm') {
        this.addToClues(eventId);
        this.addToIdentity(eventId);
      } else if (this.currentTab === 'capture') {
        this.addToClues(eventId);
      } else {
        this.addToIdentity(eventId);
      }
    },
    /*
    * 添加到事件
    * @param {any}
    * @return
    * */
    async addToClues(id) {
      const typeMap = {
        capture: 'captureDetail',
        alarm: 'alarmDetail',
      };
      const listKey = typeMap[this.currentTab];
      const clueList = this.checkedList.map((item) => {
        const operationCode = item.temporary.temOrigin;
        const detail = item[listKey];
        // 抓拍和报警参数区分
        if (this.currentTab === 'capture') {
          let carNo = '';
          if (detail.properties && detail.properties.license_plate_text) {
            carNo = detail.properties.license_plate_text.showValue || null;
          }
          return {
            captureId: detail.id,
            capturedTime: detail.capturedTime,
            cameraId: detail.cameraId,
            cameraName: detail.cameraName,
            url: detail.cropUrl,
            detectType: detail.detectType,
            trackId: detail.trackId,
            latitude: detail.latitude || null,
            longitude: detail.longitude || null,
            relatedPhotoVo: detail.relatedPhotoVo,
            operationCode,
            carNo
          };
        }
        const {
          name, id: cameraId, lat, lon
        } = detail.camera || {};
        return {
          warningId: detail.id,
          captureId: detail.captureId,
          strategyTypeId: detail.strategyTypeId,
          capturedTime: detail.capturedTime,
          cameraName: name,
          cameraId,
          url: detail.cropUri,
          detectType: detail.detectType,
          trackId: detail.trackId,
          latitude: lat,
          longitude: lon,
          relatedPhotoVo: detail.relatedPhotoVo,
          operationCode,
          carNo: detail.carNum
        };
      });
      try {
        const res = await ShelfServ.addToClues({
          clueList,
          id
        });
        if (res.code !== 0) {
          throw new Error(res.msg);
        }
        this.$message.success('添加成功');
        this.$store.dispatch('shelf/addToEvent');
        this.eventListVisible = false;
        this.$refs.shelfContent.exitSelectMode();
      } catch (error) {
        this.$message.error(error.message);
      }
    },
    /*
    * 新增关联身份
    * @param {any}
    * @return
    * */
    async addToIdentity(id) {
      const typeMap = {
        database: 'albumDetail',
        alarm: 'alarmDetail',
      };
      const listKey = typeMap[this.currentTab];
      let { checkedList } = this;
      if (this.currentTab === 'alarm') {
        checkedList = this.checkedList.filter((item) => item[listKey].alarmType === 0 && item[listKey].strategyTypeId === '1');
      }
      if (checkedList.length === 0) {
        return;
      }
      const photoList = checkedList.map((item) => {
        const detail = item[listKey];
        if (this.currentTab === 'database') {
          return {
            albumId: detail.albumId,
            albumName: detail.albumName,
            photoId: detail.photoId,
            photoUrl: detail.photoUrl,
            gender: detail.gender,
            name: detail.name,
            native: detail.native,
            nation: detail.nation,
            identityId: detail.idCard,
            identityType: detail.cardType,
            photoType: 1, // 默认人脸
            score: detail.originScore,
            address: detail.address,
            addressMsg: detail.addressMsg,
            remark: detail.remark,
            birthday: detail.birthday,
            criminalNumber: detail.criminalNumber
          };
        }
        const {
          photoId, name, gender, native, nation = {}, addr = {}, cmnt, criminalNumber, birthday
        } = detail.photo;
        return {
          albumId: detail.album.albumId,
          photoId,
          photoUrl: detail.albumPhotoUri,
          albumName: detail.album.name,
          name,
          gender,
          native,
          nation: nation.code,
          identityId: detail.identityCard,
          identityType: detail.identityType,
          photoType: 1,
          warningId: detail.id,
          score: detail.score,
          address: addr.code,
          addressMsg: addr.msg,
          remark: cmnt,
          birthday,
          criminalNumber
        };
      });

      try {
        const res = await ShelfServ.addToIdentity({
          photoList,
          id
        });
        if (res.code !== 0) {
          throw new Error(res.msg);
        }
        // 避免与添加到线索库重复提示
        if (this.currentTab !== 'alarm') {
          this.$message.success('添加成功');
          this.$store.dispatch('shelf/addToEvent');
        }
        this.eventListVisible = false;
        this.$refs.shelfContent.exitSelectMode();
      } catch (error) {
        this.$message.error(error.message);
      }
    },
    /*
    * 添加到事件弹窗
    * @param {any}
    * @return
    * */
    showAddEventDialog(data) {
      this.eventListVisible = true;
      this.eventImgType = data.type;
      this.checkedList = data.checkedList;
      this.getEventList();
    },
    /*
    * 显示暂存架主题内容
    * @param {any}
    * @return
    * */
    showShelfContent() {
      this.shelfPopoverVisible = !this.shelfPopoverVisible;
      if (!this.shelfPopoverVisible) {
        this.$store.dispatch('shelf/setShelfState', false);
      }
    },
    /*
    * 暂存架列表
    * @param {}
    * @return
    * */
    async getShelfList() {
      this.cardListLoading = true;
      try {
        const res = await ShelfServ.getShelfList({
          pageNo: this.pageNo,
          pageSize: this.pageSize,
          query: {
            temType: this.shelfType
          }
        });
        if (res.code !== 0) {
          throw new Error(res.msg);
        }
        const currentListData = this.cardListData[this.currentTab];
        const listData = [].concat(currentListData.list);
        const records = res.data.records.map((item) => ({
          ...item,
          temId: item.temporary.temId
        }));
        let pageData = records;
        if (this.pageNo > 1) {
          pageData = listData.concat(records);
        }
        this.emptyBackground = pageData.length > 0 ? false
          : {
            icon: 'icon_2',
            text: '暂无数据'
          };
        this.$set(currentListData, 'list', pageData);
        this.$set(currentListData, 'total', res.data.totalRecords);
        this.$set(currentListData, 'pageNo', res.data.pageNo);
      } catch (error) {
        this.$message.error(error.message);
      } finally {
        this.cardListLoading = false;
      }
    },
    /*
    * 删除暂存架
    * @param {data: 暂存架id以及卡片类型}
    * @return
    * */
    async deleteItem(data) {
      try {
        const res = await ShelfServ.deleteShelf({
          temType: this.shelfType,
          temIds: data.ids
        });
        if (res.code !== 0) {
          throw new Error(res.msg);
        }
        this.$message.success('删除成功');
        this.$store.dispatch('shelf/manageShelf', {
          action: 'delete',
          type: this.currentTab,
          id: data.ids
        });
        this.updateShelfData();
      } catch (error) {
        this.$message.error(error.message);
      }
    },
    /*
    * 更新暂存架数据
    * @param {any}
    * @return
    * */
    updateShelfData() {
      this.getItemCount();
      // 只在暂存架开启的状态刷新列表
      if (this.shelfPopoverVisible) {
        this.resetPageData();
        this.getShelfList();
      }
    },
    /*
    * 导出暂存架
    * @param {data: 暂存架id以及卡片类型}
    * @return
    * */
    async exportItem(data) {
      try {
        const res = await ShelfServ.exportShelf({
          temType: this.shelfType,
          temIds: data.ids
        });
        if (res.code !== 0) {
          throw new Error(res.msg);
        }
        window.location.href = res.data;
      } catch (error) {
        this.$message.error(error.message);
      }
    },
    /*
    * 暂存架数量
    * @param {any}
    * @return
    * */
    async getItemCount() {
      try {
        const res = await ShelfServ.getCount();
        if (res.code !== 0) {
          throw new Error(res.msg);
        }
        this.countData = res.data;
      } catch (error) {
        this.$message.error(error.message);
      }
    },
    /*
    * 获取事件列表
    * @param {any}
    * @return
    * */
    async getEventList() {
      try {
        const res = await ShelfServ.getEventList();
        if (res.code !== 0) {
          throw new Error(res.msg);
        }
        this.eventList = res.data;
      } catch (error) {
        this.$message.error(error.message);
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.shelf-container {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  .highlight {
    position: relative;
    z-index: 10000;
  }
  .shrink-animation {
    transform-origin: bottom center;
    animation: shrink 0.6s linear;
  }
  .plus-one {
    color: #f05353;
    font-size: 16px;
    font-weight: 600;
    position: absolute;
    top: -15px;
    left: 50%;
    opacity: 0;
    transform: translateX(-50%);
    animation: fade-in 0.8s linear 0.6s;
  }
  @keyframes fade-in {
    0% {
      opacity: 0.8;
      top: -15px;
    }
    100% {
      opacity: 0;
      top: 10px;
    }
  }
  @keyframes shrink {
    0% {
      transform: scaleY(1);
    }
    40% {
      transform: scaleY(0.25);
    }
    70% {
      transform: scaleY(1);
    }
    90% {
      transform: scaleY(0.9);
    }
    100% {
      transform: scaleY(1);
    }
  }
  .total-num {
    margin-left: 5px;
  }
  .background {
    position: absolute;
    bottom: -9px;
    height: 9px;
    left: 50%;
    transform: translateX(-50%);
    width: 110%;
    background: url("~@/assets/images/shelf/background.svg") no-repeat bottom;
  }
}
.shelf-content-wrap {
  height: calc(100vh - 68px);
  top: 56px;
  box-sizing: border-box;
  background: #f2f4f8;
}
</style>
<style lang="scss">
.shelf-popover {
  top: 44px !important;
  margin-top: 0px;
  background: #f2f4f8;
  box-sizing: border-box;
  word-break: normal;
  .popper__arrow:after {
    display: none;
  }
}
</style>
