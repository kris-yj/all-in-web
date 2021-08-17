<template>
  <page-layout>
    <div class="container">
      <div class="collision-contentContainer">
        <div class="header">
          <div class="header__nav">
            <meg-return-button
              max-width="500px"
              :title="task.name"></meg-return-button>
            <span>{{ $t('共有') }} <span style="font-size:14px">{{ task.resultCount }}</span>{{ $t('人在{albumA}和{albumB}中同时出现',{ albumA:task.albumName1, albumB:task.singleAlbum ? task.albumName1 : task.albumName2,}) }}
            </span>
          </div>
          <div class="export__video__collision">
            <meg-button
              class="detail__button__main"
              type="text"
              @click="checkTaskInfo">
              {{ $t('查看任务详情') }}
            </meg-button>
            <export-setting-button
              v-if="exportPermission"
              :type="isSelectMode && selectedNum ? 'primary' : 'default'"
              :disabled="!totalNum"
              button-text="导出"
              dropdown-text="导出设置"
              @click-export="onClickExport"
              @click-setting="onClickSetting">
            </export-setting-button>
            <meg-button
              v-show="isSelectMode"
              @click="setSelectMode"
              :class="[!totalNum?'button__main__collision':'']"
              :disabled="!totalNum">
              {{ $t('退出选择') }}
            </meg-button>
          </div>
        </div>
        <div
          class="result-list"
          v-loading="loading">
          <meg-card-frame
            :card-min-width="290"
            child-name="card-box">
            <div
              @click="showDetail(item, index)"
              class="card-box"
              @mouseenter="cardEnter(index)"
              @mouseleave="cardLeave"
              v-for="(item, index) in cardLists"
              :key="index">
              <meg-double-card
                class="card-item"
                :left-img-src="item.photoUrl_1"
                :right-img-src="item.photoUrl_2"
                :score="item.compareScore">
                <div
                  slot="bottom"
                  class="card-detail">
                  <div>
                    <p
                      class="card-line"
                      v-tooltip="{text:item.albumName1}">
                      {{ item.albumName1 }}
                    </p>
                    <p
                      class="card-line"
                      v-tooltip="{text:item.personName1}">
                      {{ item.personName1 }}
                    </p>
                    <p
                      class="card-line"
                      v-tooltip="{text:item.sfz1}">
                      {{ item.sfz1 }}
                    </p>
                  </div>
                  <div>
                    <p
                      class="card-line"
                      v-tooltip="{text:item.albumName2}">
                      {{ item.albumName2 }}
                    </p>
                    <p
                      class="card-line"
                      v-tooltip="{text:item.personName2}">
                      {{ item.personName2 }}
                    </p>
                    <p
                      class="card-line"
                      v-tooltip="{text:item.sfz2}">
                      {{ item.sfz2 }}
                    </p>
                  </div>
                </div>
                <div slot="custom">
                  <div
                    v-show="isSelectMode"
                    class="card-mask"
                    @click.stop="onCardMaskClick(index)">
                  </div>
                  <div
                    v-show="cardHover === index || isSelectMode"
                    class="card-checkbox"
                    @click="stopProp">
                    <meg-checkbox
                      v-model="item.cardChecked"
                      @change="onCheckChanged(index)">
                    </meg-checkbox>
                  </div>
                </div>
              </meg-double-card>
            </div>
          </meg-card-frame>
        </div>
        <div class="page-box">
          <meg-pagination
            :total="totalRecords"
            :current-page.sync="pageNo"
            :page-size="pageSize"
            :page-sizes="[60]"
            @size-change="sizeChange"
            @current-change="currentChange">
          </meg-pagination>
        </div>
      </div>
      <detail-task-dialog
        :form-data="taskFormData"
        :response-flag="responseFlag"
        :type="taskDialogType"
        :if-auth="analysisManage"
        :visible.sync="showDetailTaskDialog"
        @modifyJobName="modifyJobName">
      </detail-task-dialog>
      <meg-dialog
        :visible="showPhotoDetail"
        :show-close="true"
        @close="closePhotoDetail"
        width="1250px">
        <span slot="title">
          {{ $t('照片详情') }}
        </span>
        <div
          class="dialog-body">
          <div style="marginTop: 30px;">
            <meg-double-card
              width="45%"
              class="card-item"
              @click="doubleImgScreen=true"
              @enter="doubleCardEnter"
              @leave="doubleCardLeave"
              :left-img-src="photoDetailDialog.photoUrl_1"
              :right-img-src="photoDetailDialog.photoUrl_2"
              :score="photoDetailDialog.compareScore"
              score-size="large">
              <div
                slot="left-custom">
                <common-jump-with-img
                  v-show="jumpFlag === 'left'"
                  icon-width="14"
                  icon-height="14"
                  trigger-icon="search_1"
                  :do-deploy="doDeploy1"
                  :append-album="leftAppendAlbum"
                  :params="leftJumpOpt"></common-jump-with-img>
              </div>
              <div slot="right-custom">
                <common-jump-with-img
                  v-show="jumpFlag === 'right'"
                  icon-width="14"
                  icon-height="14"
                  trigger-icon="search_1"
                  :do-deploy="doDeploy2"
                  :append-album="rightAppendAlbum"
                  :params="rightJumpOpt"></common-jump-with-img>
              </div>
              <div
                slot="bottom"
                class="card-detail">
                <div>
                  <p
                    class="card-line"
                    v-tooltip="{text:photoDetailDialog.albumName1}">
                    {{ photoDetailDialog.albumName1 }}
                  </p>
                  <p
                    class="card-line"
                    v-tooltip="{text:photoDetailDialog.personName1}">
                    {{ photoDetailDialog.personName1 }}
                  </p>
                  <p
                    class="card-line"
                    v-tooltip="{text:photoDetailDialog.sfz1}">
                    {{ photoDetailDialog.sfz1 }}
                    <meg-button
                      type="text"
                      class="copy-btn"
                      v-if="photoDetailDialog.sfz1"
                      @click.stop="onClickCopy(photoDetailDialog.sfz1)">
                      {{ $t('复制') }}
                    </meg-button>
                  </p>
                </div>
                <div>
                  <p
                    class="card-line"
                    v-tooltip="{text:photoDetailDialog.albumName2}">
                    {{ photoDetailDialog.albumName2 }}
                  </p>
                  <p
                    class="card-line"
                    v-tooltip="{text:photoDetailDialog.personName2}">
                    {{ photoDetailDialog.personName2 }}
                  </p>
                  <p

                    class="card-line"
                    v-tooltip="{text:photoDetailDialog.sfz2}">
                    {{ photoDetailDialog.sfz2 }}
                    <meg-button
                      type="text"
                      class="copy-btn"
                      v-if="photoDetailDialog.sfz2"
                      @click.stop="onClickCopy(photoDetailDialog.sfz2)">
                      {{ $t('复制') }}
                    </meg-button>
                  </p>
                </div>
              </div>
            </meg-double-card>
          </div>
          <div
            v-if="showPhotoDetail"
            class="alarm-detail-selector">
            <div
              class="pre-btn-box"
              @click="lastPage">
              <meg-icon
                name="arrow_hollow"
                width="18px"
                height="22px"
                dir="right">
              </meg-icon>
            </div>
            <meg-swiper
              class="alarm-detail-list"
              ref="vueSwiper"
              :data-list="cardLists"
              :default-index="slideTarget"
              :slides-per-view="5"
              :slides-per-group="5">
              <div
                slot-scope="{ data }"
                class="card-box"
                :class="{'selected':data.index === slideTarget}"
                @click="onItemClick(data,data.index)">
                <meg-double-card
                  width="50%"
                  :left-img-src="data.photoUrl_1"
                  :right-img-src="data.photoUrl_2"
                  :score="data.compareScore">
                </meg-double-card>
              </div>
            </meg-swiper>
            <div
              class="next-btn-box"
              @click="nextPage">
              <meg-icon
                name="arrow_hollow"
                width="18px"
                height="22px"
                dir="left"
                color="#ffffff">
              </meg-icon>
            </div>
          </div>
          <common-img-scaled
            v-model="doubleImgScreen"
            :imgs-src="[photoDetailDialog.photoUrl_1,photoDetailDialog.photoUrl_2]"
            :compare-score="parseFloat(photoDetailDialog.compareScore||0)"></common-img-scaled>
        </div>
      </meg-dialog>
      <export-dialog
        :visible.sync="exportDialogVisible"
        @confirm="exportConfirm">
      </export-dialog>
    </div>
  </page-layout>
</template>
<script>
import _ from 'lodash';
import { switchToModule } from '@/utils/utils';
import CommonImgScaled from '@/common-components/common-img-scaled';
import CommonJumpWithImg from '@/common-components/common-jump-with-img';
import ExportDialog from '@/components/judge/export-dialog.vue';
import { ExportSettingButton, ExportSettingManager } from '@/common-components/common-export-setting';
import CollisionSrv from '../collision.service';
import DetailTaskDialog from '../components/detail-task-dialog';

export default {
  name: 'CollisionDetail',
  components: {
    DetailTaskDialog,
    ExportSettingButton,
    CommonImgScaled,
    ExportDialog,
    CommonJumpWithImg,
  },
  data() {
    return {
      exportDialogVisible: false,
      isSelectMode: false, // 是否为选择模式
      selectedNum: 0, // 卡片选中数量
      totalNum: true,
      exportList: [],
      responseFlag: '',
      totalRecords: 0,
      showDetailTaskDialog: false,
      doubleImgScreen: false,
      pageNo: 1,
      pageSize: 60,
      detail: {},
      loading: false,
      taskFormData: {
        filters: []
      },
      taskDialogType: 'check',
      showPhotoDetail: false,
      slideTarget: 0,
      photoDetailDialog: {
        photoUrl_1: '',
        photoUrl_2: '',
      },
      task: {},
      jumpFlag: '',
      cardLists: [],
      cardHover: -1,
      exportSettingManger: new ExportSettingManager(this.$store, 'collision', 'collision_export_column'),
    };
  },
  computed: {
    choosedCode() {
      return this.exportSettingManger.getExportFiledCode();
    },
    leftUrl() {
      return this.photoDetailDialog.photoUrl_1;
    },
    rightUrl() {
      return this.photoDetailDialog.photoUrl_2;
    },
    doDeploy1() {
      return {
        photoUrl: this.leftUrl,
        photoType: 1
      };
    },
    doDeploy2() {
      return {
        photoUrl: this.rightUrl,
        photoType: 1 // 人脸
      };
    },
    analysisManage() {
      return this.$store.getters.modulePermissonsByAlias('collision', 'analysisManage');
    },
    exportPermission() {
      return this.$store.getters.modulePermissonsByAlias('collision', 'export');
    },
    id() {
      return this.$route.query.id;
    },
    leftJumpOpt() {
      const photo = this.photoDetailDialog.photoUrl_1;
      return {
        genre: 1, // 底库图
        source: 1,
        locator: {},
        photo
      };
    },
    leftAppendAlbum() {
      return {
        imageData: {
          originType: 'album',
          photoUrl: this.photoDetailDialog.photoUrl_1,
          type: 0, // 人脸,
          albumId: this.photoDetailDialog.albumId1,
          photoId: this.photoDetailDialog.photoId1
        }
      };
    },
    rightJumpOpt() {
      const photo = this.photoDetailDialog.photoUrl_2;
      return {
        genre: 1, // 底库图
        source: 1,
        locator: {},
        photo
      };
    },
    rightAppendAlbum() {
      return {
        imageData: {
          originType: 'album',
          photoUrl: this.photoDetailDialog.photoUrl_2,
          type: 0, // 人脸
          albumId: this.photoDetailDialog.albumId2,
          photoId: this.photoDetailDialog.photoId2
        }
      };
    },
  },
  created() {
    this.init();
  },
  methods: {
    onClickCopy(val) {
      this.$clipboard(val).then(() => {
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
    onClickExport() {
      if (this.isSelectMode) {
        if (this.selectedNum) {
          const params = {};
          params.resultIds = this.exportList.map((item) => item.id);
          this.exportInfo(params, 'select');
        } else {
          this.$message({
            message: '请先选择需要导出的检索卡片',
            type: 'warning'
          });
        }
      } else {
        this.exportDialogVisible = true;
      }
    },
    exportConfirm(params) {
      this.exportInfo(params, 'all');
    },
    async onClickSetting() {
      // 设置导出设置
      await this.exportSettingManger.setExportSetting();
    },
    /**
     * 当卡片遮罩层在选择模式被点击时，判断卡片选中状态
     * @param {index} 卡片索引
     */
    onCardMaskClick(index) {
      this.cardLists[index].cardChecked = !this.cardLists[index].cardChecked;
      this.changeMode();
      this.updateCheckState();
    },
    /**
     * 点击卡片上的单选按钮时，切换选中状态
     * @param {index} 卡片对应分类索引
     * @returns
     */
    onCheckChanged() {
      this.changeMode();
      this.updateCheckState();
    },
    /**
     * @description changeMode
     */
    changeMode() {
      if (this.cardLists.length > 0 && this.cardLists.some((item) => item.cardChecked)) {
        this.isSelectMode = true;
      } else {
        this.isSelectMode = false;
      }
    },
    /**
     * 当某一个选择框状态改变时，为当前分类的全选框判断状态
     * @param {index} 分类索引
     */
    updateCheckState() {
      this.selectedNum = 0;
      this.exportList = [];
      this.cardLists.forEach((val) => {
        if (val.cardChecked) {
          this.selectedNum += 1;
          this.exportList.push(val);
        }
      });
    },
    /**
     * 退出选择模式
     */
    setSelectMode() {
      this.selectedNum = 0;
      this.exportList = [];
      if (this.cardLists.length !== 0) {
        this.cardLists.forEach((val) => {
          this.$set(val, 'cardChecked', false);
        });
      }
      this.isSelectMode = false;
    },
    /**
     * 取消冒泡 vue有修饰符事件，但是这里只是单纯的阻止事件冒泡，没有数据修改
     * @param {e} 原生事件
     */
    stopProp(e) {
      e.stopPropagation();
    },
    /**
     * 条件导出,调用接口
     * @param {params} 需要导出的检索条件
     * @returns
     */
    exportInfo(params, type) {
      const exportForm = { ...params };
      exportForm.columns = [...this.choosedCode];
      exportForm.jobId = this.$route.query.id;
      CollisionSrv.selectExport(exportForm).then((res) => {
        if (res.code === 0) {
          if (type === 'all') {
            this.$message({
              message: this.$t('导出成功，请前往任务列表下载'),
              type: 'success'
            });
          } else {
            window.location.href = res.data;
          }
        } else {
          this.$message({
            message: res.msg,
            type: 'error'
          });
        }
      });
    },
    /**
     * 编辑任务名
     * @param {Object} 修改参数
     * @returns
     */
    modifyJobName(params) {
      CollisionSrv.modifyJobName(params).then((res) => {
        const timeStamp = new Date().getTime();
        if (res.code === 0) {
          this.responseFlag = `success_${timeStamp}`;
          this.getDetail();
        } else {
          this.responseFlag = `error_${timeStamp}`;
          this.$message.error(res.msg);
        }
      });
    },
    /**
     * 初始化数据
     */
    async init() {
      this.getDetail();
      // this.task = this.$route.querytask;
      // 比对图携图跳转字段权限筛选
      this.getCollisionResult();
    },
    async getDetail() {
      const result = await CollisionSrv.detail({ id: this.id });
      if (result.code !== 0) {
        this.$message({
          type: 'error',
          message: result.msg
        });
      }
      this.task = result.data;
    },
    /**
     * 携图跳转部分
     * 鼠标进入双人卡片
     */
    doubleCardEnter(event) {
      if (event === 'left') {
        this.jumpFlag = 'left';
      } else if (event === 'right') {
        this.jumpFlag = 'right';
      }
    },
    doubleCardLeave(event) {
      if (event) {
        this.jumpFlag = '';
      }
    },
    /**
     * 获取库库碰撞结果
     */
    async getCollisionResult() {
      const params = {
        id: this.id,
        pageNo: this.pageNo,
        pageSize: this.pageSize
      };
      try {
        this.loading = true;
        const result = await CollisionSrv.result(params);
        if (result.code === 0) {
          _.forEach(result.data.records, (item, index) => {
            result.data.records[index].index = index;
          });
          this.cardLists = result.data.records || [];
          if (result.data.totalRecords > 0) {
            this.totalNum = true;
            this.totalRecords = result.data.totalRecords;
          }
        } else {
          this.$message({
            type: 'error',
            message: result.msg
          });
        }
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },
    /**
     * 查看任务详情
     */
    checkTaskInfo() {
      this.taskDialogType = 'check';
      this.task.filters = this.task.filters || [];
      if (this.task.reduceSfz) {
        this.task.filters.push('1');
      }
      if (this.task.reduceTwins) {
        this.task.filters.push('2');
      }
      this.taskFormData = this.task;
      this.showDetailTaskDialog = true;
    },
    /**
     * 点击dialog swipper照片事件
     */
    onItemClick(photo, index) {
      this.photoDetailDialog = photo;
      this.slideTarget = index;
    },
    /**
     * 显示照片详情对话框
     * @param {Object} photoDetail 照片对象
     */
    showDetail(photoDetail, index) {
      this.photoDetailDialog = photoDetail;
      this.onItemClick(this.photoDetailDialog, index);
      this.$nextTick(() => {
        if (this.$refs.vueSwiper) this.$refs.vueSwiper.slideToIndex(index);
      });
      this.showPhotoDetail = true;
    },
    closePhotoDetail() {
      this.showPhotoDetail = false;
    },
    /**
     * pageNo变更事件
     * @param {Number} pageNo
     */
    currentChange(pageNo) {
      this.pageNo = pageNo;
      this.getCollisionResult();
    },
    /**
     * pageSize变更事件
     * @param {Number} pageSize
     */
    sizeChange(pageSize) {
      this.pageSize = pageSize;
      this.getCollisionResult();
    },
    /**
     * 回到list
     */
    returnToList() {
      switchToModule({
        module: 'collision',
      });
    },
    /**
     * 上一页事件
     */
    lastPage() {
      // this.$refs.vueSwiper.prev();
      if (this.slideTarget <= 0) return;
      this.slideTarget -= 1;// 两箭头行为修改为上一个下一个
      this.photoDetailDialog = this.cardLists[this.slideTarget];
    },
    /**
     * 下一页事件
     */
    nextPage() {
      // this.$refs.vueSwiper.next();
      if (this.slideTarget >= this.cardLists.length - 1) return;
      this.slideTarget += 1;// 两箭头行为修改为上一个下一个
      this.photoDetailDialog = this.cardLists[this.slideTarget];
    },
    cardEnter(ind) {
      this.cardHover = ind;
    },
    cardLeave() {
      this.cardHover = -1;
    }
  }
};
</script>
<style lang="scss" scoped>
::v-deep .meg-dialog__header{
  line-height: 54px;
  font-weight: 700;
  font-size: 16px;
  color: #435068;
}
::v-deep .meg-dialog__body{
  padding: 0;
}
.container {
  height: 100%;
  .page-box{
    background: white;
  }
}
.copy-btn {
  cursor: pointer;
  margin-left: 10px;
  font-size: 14px;
  padding: 0!important;
}
.export__video__collision{
  float: right;
  right: 20px;
  .meg-export-button{
    margin:0 14px;
  }
}
.detail__button__main{
  margin-right: 10px;
  vertical-align: middle;
}
.button__main__collision{
  position: relative;
  top:2px;
}
.collision-contentContainer {
  background: #d7dbe0;
  height: 100%;
  display: flex;
  flex-direction: column;
  user-select: none;
    .card-mask {
      position: absolute;
      z-index: 7;
      top: 0;
      width: 100%;
      height: 100%;
    }
    .card-checkbox {
      position: absolute;
      left: 10px;
      top:5px;
    }
  .header {
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0 25px 0 15px;
    .header__nav {
      display: flex;
      align-items: center;
      > span:last-child {
        font-size: 12px;
        margin-left: 10px;
      }
    }
    .header__info {
      font-size: 12px;
      color: #5a6676;
    }
  }
  .result-list {
    flex: 1;
    height: calc(100% - 104px);
    margin: 0px 0 0 7px;
    overflow: scroll;
    .card-frame {
      // min-height: calc(100% - 50px);
      flex: 1;
      padding-right: 7px;
    }
  }
  .meg-pagination {
    margin: 0 10px 0 3px;
  }
  .card-item {
    background: #fff;
    padding: 10px 0 0;
    margin: 0 3px 6px 3px;
  }
  .card-detail {
    display: flex;
    padding: 8px 15px;
    > div {
      display: flex;
      flex-direction: column;
      font-size: 12px;
      color: #435068;
      // width: 170px;
      width: 50%;
    }
  }
  .card-box {
    display: inline-block;
  }
}
.alarm-detail-selector {
  height: 136px;
  background: #242935;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  .pre-btn-box,
  .next-btn-box {
    flex: 0 0 25px;
    height: 136px;
    line-height: 136px;
    cursor: pointer;
    font-size: 12px;
    color: #d1d5dd;
    text-align: center;
  }
  .alarm-detail-list {
    flex: 1 1 auto;
  }
  .card-box {
    width: 221px;
    box-sizing: border-box;
    cursor: pointer;
  }
  .card-box.selected {
    border: #388cf2 2px solid;
  }
}

.dialog-body {
  display: flex;
  flex-direction: column;
  height: 100%;
  .alarm-detail-selector {
    flex: 1;
  }
  .card-item {
    width: 60%;
    margin: 0 auto;
    align-self: center;
    .card-detail {
      display: flex;
      margin-top: 10px;
      margin-bottom: 10px;
      > div {
        display: flex;
        flex-direction: column;
        width: 50%;
        box-sizing: border-box;
      }
      > div:first-child {
        padding-left: 100px;
      }
    }
  }
  .meg-double-card {
    box-shadow: inherit;
  }
}
.jump-box {
  position: absolute;
  right: 13px;
  top: 13px;
  cursor: pointer;
}
.jump-box .meg-icon {
  width: 18px;
  height: 18px;
  padding: 4px;
  margin-left: 66px;
  border-radius: 2px;
  background: #21539b;
  color: #fff;
}
.jump-option {
  width: 90px;
  line-height: 28px;
  margin-top: 4px;
  color: #444;
  background-color: #fff;
  text-align: center;
  border: 1px solid #ebe1de;
}
.jump-option li:hover {
  background-color: #dce1e5;
}

.router-link-active {
  text-decoration: none;
}
.card-line {
  height: 16px;
  line-height: 16px;
  color: #435068;
}
</style>
<style lang="scss" >
.container .collision-contentContainer {
  .meg-scrollbar__view {
    min-height: 100%;
    display: flex;
    flex-direction: column;
  }
  .el-pagination__sizes {
    display: none !important;
  }
  .result-list {
    .meg-scrollbar__view {
      min-height: 100%;
      display: flex;
      flex-direction: column;
    }
  }
}
</style>
