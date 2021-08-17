<template>
  <div class="person__card">
    <div
      class="card__title">
      <div
        class="return__lists">
        <span>
          <meg-return-button
            class="return__button"
            max-width="500px"
            :disable="true"
            :title="jobName || ''"
            @click="returnLits"></meg-return-button>
        </span><span>{{ $t('共') }}<span style="font-size:14px"> {{ fileNum }} </span>{{ $t('条') }}</span>
        <div
          class="results__button">
          <export-setting-button
            v-if="exportPermission"
            :type="isSelectMode && selectedNum ? 'primary' : 'default'"
            :disabled="!fileNum"
            button-text="导出"
            dropdown-text="导出设置"
            @click-export="onClickExport"
            @click-setting="onClickSetting">
          </export-setting-button>
          <meg-button
            v-if="isSelectMode"
            @click="setSelectMode">
            {{ $t('退出选择') }}
          </meg-button>
        </div>
      </div>
    </div>
    <div
      v-loading="loading"
      class="content__manCard__container"
      style="width:100%;height:100%">
      <div
        class="content__upload__container">
        <div class="content__upload__img">
          <meg-img-container
            text-align="center"
            vertical-align="middle"
            :aspect-ratio="1"
            :img-src="faceOnlyUrl"></meg-img-container>
        </div>
      </div>
      <div
        v-background="videoBack"
        class="content__container">
        <meg-scrollbar
          @scroll-bottom="scrollBottomFn">
          <meg-card-frame
            :card-min-width="160">
            <div
              class="card-frame-child"
              v-for="(item,index) in cardLists"
              @mouseenter="enter(index)"
              @mouseleave="leave"
              :key="index">
              <meg-card
                @click="detailData(index)"
                :img-src="item.photoUrl">
                <div
                  class="bottom__list"
                  slot="bottom">
                  <p class="more__score">
                    {{ parseFloat(item.score).toFixed(2) }}
                  </p>
                  <p
                    v-tooltip="true"
                    class=" more__name">
                    <span class="big-icon">
                      <meg-icon
                        name="database"
                        width="10"
                        height="10"
                        color="#D1D5DD"></meg-icon>
                    </span>
                    {{ item.albumName }}
                  </p>
                  <p
                    v-tooltip="true"
                    class=" more__id">
                    <span class="big-icon">
                      <meg-icon
                        name="ID"
                        width="10"
                        height="10"
                        color="#D1D5DD"></meg-icon>
                    </span>
                    {{ item.cardNo }}
                  </p>
                </div>
                <div slot="custom">
                  <div
                    v-show="isSelectMode || index===hoverIndex"
                    class="card-checkbox"
                    @click="stopProp">
                    <meg-checkbox
                      v-model="item.cardChecked"
                      @change="onCheckChanged(index)">
                    </meg-checkbox>
                  </div>
                  <div
                    v-show="isSelectMode"
                    class="card-mask"
                    @click.stop="onCardMaskClick(index)">
                  </div>
                </div>
                <div
                  slot="custom"
                  class="card-custom">
                  <common-jump-with-img
                    v-show="hoverIndex === index"
                    icon-width="14"
                    icon-height="14"
                    trigger-icon="search_1"
                    :params="jumpParams(item)"
                    :do-deploy="doDeploy(item)"
                    :append-album="appendAlbum(item)"></common-jump-with-img>
                  <meg-tooltip
                    class="item"
                    effect="meg"
                    :content="item.temporaryFlag ? $t('移出暂存架'):$t('加入暂存架')"
                    placement="top">
                    <div
                      v-show="item.temporaryFlag || hoverIndex === index"
                      :class="['custom-icon', item.temporaryFlag ? 'active': '']"
                      @click.stop="handleTemporaryLibrary(item)">
                      <meg-icon
                        name="all-store-stroke"
                        color="#fff"></meg-icon>
                    </div>
                  </meg-tooltip>
                </div>
              </meg-card>
            </div>
          </meg-card-frame>
        </meg-scrollbar>
      </div>
    </div>
    <common-database-detail
      :result-list="detailList"
      :visible.sync="moreDetailShow"
      :index="dialogCardIndex">
    </common-database-detail>
  </div>
</template>

<script>
import { ExportSettingButton, ExportSettingManager } from '@/common-components/common-export-setting';
import commonCardSrv from '@/common-components/common-card/common-card.service';
import CommonJumpWithImg from '@/common-components/common-jump-with-img';
import CommonDatabaseDetail from '@/common-components/common-database-detail/database-detail';
import MultiPersonSrv from '../multi-person.service.js';

export default {
  components: {
    ExportSettingButton,
    CommonJumpWithImg,
    CommonDatabaseDetail
  },
  data() {
    return {
      faceOnlyUrl: '',
      personList: {},
      toResult: {}, // 战果数据
      pageNum: 1,
      cardData: [],
      cardLists: [],
      listsLength: '',
      loading: true,
      pageNo: 1,
      pageSize: 60,
      fileNum: 0,
      jobName: '返回',
      photoId: '',
      moreDetailShow: false,
      detailList: [],
      dialogCardIndex: 0,
      jobId: '',
      videoBack: false,
      isSelectMode: false, // 是否为选择模式
      residue: [], // 可以导出的字段
      choosed: [], // 被选中导出的字段
      hoverIndex: '',
      selectedNum: 0, // 卡片选中数量
      exportObject: {
        resultIds: [],
      },
    };
  },
  computed: {
    exportPermission() {
      return this.$store.getters.modulePermissonsByAlias('multi-person', 'export');
    },
    exportSettingManger() {
      return new ExportSettingManager(this.$store, 'multi-person', 'search_export_column');
    }
  },
  created() {
    this.getData();
    this.jobName = this.$route.params.jobName;
    if (this.jobName) {
      localStorage.setItem('videoMoreJobNameMain', this.jobName);
    }
    this.jobName = localStorage.getItem('videoMoreJobNameMain');
  },
  methods: {
    onClickExport() {
      console.log('export');
      this.openExport();
    },
    async onClickSetting() {
      // 设置导出设置
      await this.exportSettingManger.setExportSetting();
    },
    appendAlbum(item) {
      return {
        imageData: {
          originType: 'album',
          photoUrl: item.photoUrl,
          photoId: item.photoId,
          albumId: item.albumId,
          type: 0
        }
      };
    },
    doDeploy(item) {
      return {
        photoUrl: item.photoUrl,
        photoType: 1
      };
    },
    jumpParams(item) {
      return {
        id: item.photoId,
        genre: 0,
        source: 1,
        locator: {},
        photo: item.photoUrl,
      };
    },
    /**
     * 鼠标移入卡片 显示收藏按钮
     */
    enter(index) {
      this.hoverIndex = index;
    },
    /**
     * 鼠标移出卡片 隐藏收藏按钮
     */
    leave() {
      this.hoverIndex = '';
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
     * 点击卡片上的单选按钮时，切换选中状态
     * @param {index} 卡片对应分类索引
     * @returns
     */
    onCheckChanged() {
      this.changeMode();
      this.updateCheckState();
    },
    /**
     * 当某一个选择框状态改变时，为当前分类的全选框判断状态
     * @param {index} 分类索引
     */
    updateCheckState() {
      this.selectedNum = 0;
      this.exportObject.resultIds = [];
      this.cardLists.forEach((val) => {
        if (val.cardChecked) {
          this.selectedNum += 1;
          this.exportObject.resultIds.push(val);
        }
      });
    },
    /**
     * 点击导出按钮，打开导出弹框
     */
    openExport() {
      const params = {
        columnCodes: this.exportSettingManger.getExportFiledCode(),
        resultIds: this.exportObject.resultIds.map((item) => item.id),
        detailId: this.jobId
      };
      if (this.isSelectMode) {
        if (this.selectedNum) {
          MultiPersonSrv.exportSearchResult(params).then((res) => {
            if (res.code === 0) {
              window.location.href = res.data;
            } else {
              this.$message({
                message: res.msg,
                type: 'error'
              });
            }
          });
        } else {
          this.$message({
            message: this.$t('请先选择需要导出的检索卡片'),
            type: 'warning'
          });
        }
      } else {
        MultiPersonSrv.exportSearchResult(params).then((res) => {
          if (res.code === 0) {
            window.location.href = res.data;
          } else {
            this.$message({
              message: res.msg,
              type: 'error'
            });
          }
        });
      }
    },
    /**
     * 退出选择模式
     */
    setSelectMode() {
      this.selectedNum = 0;
      this.exportObject.resultIds = [];
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
    populateResultUrl() {
      if (this.fileNum === 1) {
        this.personList = {
          id: 10,
          attribute: [
            {
              type: 'uploadImg',
              imgId: 1,
              uploadImg: this.detailList[0].uploadImageUrl
            },
            {
              type: 'albumImg',
              imgId: 2,
              albumImg: this.detailList[0].photoUrl,
              albumName: this.detailList[0].albumName,
              albumId: this.detailList[0].albumId,
              userName: this.detailList[0].name,
              idNo: this.detailList[0].cardNo,
              threshold: this.detailList[0].score,
            }
          ]
        };
      }
      if (this.fileNum === 2) {
        this.personList = {
          id: 10,
          attribute: [
            {
              type: 'uploadImg',
              imgId: 1,
              uploadImg: this.detailList[0].uploadImageUrl
            },
            {
              type: 'albumImg',
              imgId: 2,
              albumImg: this.detailList[0].photoUrl,
              albumName: this.detailList[0].albumName,
              albumId: this.detailList[0].albumId,
              userName: this.detailList[0].name,
              idNo: this.detailList[0].cardNo,
              threshold: this.detailList[0].score,
            },
            {
              type: 'albumImg',
              imgId: 2,
              albumImg: this.detailList[1].photoUrl,
              albumName: this.detailList[1].albumName,
              albumId: this.detailList[1].albumId,
              userName: this.detailList[1].name,
              idNo: this.detailList[1].cardNo,
              threshold: this.detailList[1].score,
            }
          ]
        };
      }
      if (this.fileNum >= 3) {
        this.personList = {
          id: 10,
          attribute: [
            {
              type: 'uploadImg',
              imgId: 1,
              uploadImg: this.detailList[0].uploadImageUrl
            },
            {
              type: 'albumImg',
              imgId: 2,
              albumImg: this.detailList[0].photoUrl,
              albumName: this.detailList[0].albumName,
              albumId: this.detailList[0].albumId,
              userName: this.detailList[0].name,
              idNo: this.detailList[0].cardNo,
              threshold: this.detailList[0].score,
            },
            {
              type: 'albumImg',
              imgId: 3,
              albumImg: this.detailList[1].photoUrl,
              albumName: this.detailList[1].albumName,
              albumId: this.detailList[1].albumId,
              userName: this.detailList[1].name,
              idNo: this.detailList[1].cardNo,
              threshold: this.detailList[1].score,
            },
            {
              type: 'albumImg',
              imgId: 4,
              albumImg: this.detailList[2].photoUrl,
              albumName: this.detailList[2].albumName,
              albumId: this.detailList[2].albumId,
              userName: this.detailList[2].name,
              idNo: this.detailList[2].cardNo,
              threshold: this.detailList[2].score,
            }
          ]
        };
      }
    },
    /**
       * 弹出框，显示详细信息
       * @augments item 选中的数据
       */
    detailData(index) {
      this.dialogCardIndex = index;
      this.moreDetailShow = true;
    },
    /**
       * 返回上一个路由页面
       * @augments
       */
    returnLits() {
      this.$router.go(-1);
    },
    /**
       * 获取当前分页全部卡片数据
       * @augments
       */
    getData() {
      const params = {};
      this.jobId = this.$route.query.uid;
      if (this.jobId) {
        localStorage.setItem('personId', this.jobId);
      }
      this.jobId = localStorage.getItem('personId');
      this.photoId = this.jobId;
      params.pageNo = this.pageNo;
      params.pageSize = this.pageSize;
      MultiPersonSrv.moreData({ photoId: this.photoId, params }).then((response) => {
        this.loading = false;
        if (response.code === 0) {
          this.cardLists = response.data.records;
          if (this.cardLists.length !== 0) {
            this.cardLists.forEach((val) => {
              this.$set(val, 'cardChecked', false);
            });
          }
          this.faceOnlyUrl = response.data.records[0].uploadImageUrl;
          this.detailList = response.data.records.map((item) => ({
            ...item,
            idCard: item.cardNo,
            criminalNumber: item.escapedNum,
          }));
          this.fileNum = response.data.totalRecords;
          this.populateResultUrl();
          if (this.cardLists.length === 0) {
            this.videoBack = true;
          }
        }
      });
    },
    /**
       * 当滚动条滚动到底时加载更多数据
       * @augments
       */
    scrollBottomFn() {
      this.loading = true;
      this.pageNo += 1;
      const params = {};
      params.pageNo = this.pageNo;
      params.pageSize = this.pageSize;
      MultiPersonSrv.moreData({ photoId: this.photoId, params }).then((response) => {
        this.loading = false;
        if (response.code === 0) {
          if (response.data.records.length !== 0) {
            response.data.records.forEach((val) => {
              this.$set(val, 'cardChecked', false);
            });
          }
          this.cardLists = this.cardLists.concat(response.data.records);
          this.detailList = this.detailList.concat(response.data.records);
        }
      });
    },
    /**
     * @description 加入or删除暂存架
     */
    async handleTemporaryLibrary(item) {
      if (!item.temporaryFlag) {
        await this.addTemporaries(item);
      } else {
        await this.deleteTemporaries(item);
      }
    },
    /**
     * @description 加入暂存架
     */
    addTemporaries(item) {
      const snapshot = {
        ...item,
        idCard: item.cardNo,
        temporaryFlag: true
      };
      if (snapshot.uploadImageUrl) {
        delete snapshot.uploadImageUrl;
      }
      delete snapshot.score;
      const params = {
        temId: item.photoId,
        temType: 3,
        temOrigin: 1,
        albumId: item.albumId,
        snapshot
      };
      commonCardSrv.addTemporaries(params).then((res) => {
        if (res.code === 0) {
          item.temporaryFlag = true;
          this.$message.success('加入暂存架成功');
          this.$store.dispatch('shelf/manageShelf', {
            action: 'add',
            type: 'album',
            id: item.id
          });
        }
      });
    },
    /**
     * @description 移出暂存架
     */
    deleteTemporaries(item) {
      const params = {
        temIds: [item.photoId],
        temType: 3,
      };
      commonCardSrv.deleteTemporaries(params).then((res) => {
        if (res.code === 0) {
          item.temporaryFlag = false;
          this.$message.success('移出暂存架成功');
          this.$store.dispatch('shelf/manageShelf', {
            action: 'delete',
            type: 'album',
            id: item.id
          });
        }
      });
    },
  }
};
</script>

<style lang="scss" scoped>

.person__card{
  ::v-deep .capture-hover-items {
    top: 0;
    right: 24px;
  }
  .card-box {
    display: inline-block;
    cursor: pointer;
  }
    .card-item {
    background: #fff;
    padding: 10px 0 0;
    margin: 0 3px 6px 3px;
  }
    .card-detail {
    padding: 8px 15px;
    > div {
      display:inline-block;
      font-size: 12px;
      color: #435068;
      // width: 170px;
      width: 49%;
    }
  }
  .card-line {
  height: 16px;
  line-height: 16px;
  color: #435068;
}
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
}
.return__button{
    display: inline-block;
    height: 16px;
    line-height: 16px;
    padding-top: 15px;
}
.router-link-active{
  text-decoration: none;
}
.results__button{
  position: absolute;
  top:1.5px;
  right: 0;
  margin-right: 27px;
  .meg-export-button{
    margin:0 14px;
  }
}
.person__card{
    width:100%;
    height: 100%;
    background-color: #D1D5DD;
}
.card__title{
    height: 53px;
    line-height: 53px;
    position: relative;
}
.results__icon2{
  margin-top: -2px;
  transform:rotate(90deg);
  margin-right: 8px;
  cursor: pointer;

}
.return__lists{
    margin-left: 10px;
}

.return__lists span:nth-child(2){
    position: relative;
  top:-10px;
  margin-left: 20px;
  font-size: 12px;
  color: #435068 ;
}
.content__manCard__container{
  display:flex;
}
.content__container{
  flex: 1;
  padding: 0 20px;
  box-sizing: border-box;
  height: calc(100% - 53px);
  overflow: auto;
    .meg-card{
margin-right: 6px;
margin-bottom: 6px;
  }
}
.content__upload__container{
  width: 175px;
  height: 100%;
  padding-left: 20px;
  box-sizing: border-box;
}
.content__upload__img{
  width: 145px;
  height: 145px;
  padding: 5px;
  background: #fff;
}
.more__name{
  width:120px ;
  color: #5A6676;
  font-size: 12px;
  margin-left: 10px;
  margin-top: 10px;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap
}
.card-custom{
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  align-items: center;
}
.custom-icon {
  width: 20px;
  height: 20px;
  background-color: rgba(134,154,187,0.8);
  border-radius: 1px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 5px;
  &:hover, &.active{
    background-color: #21539b;
    transition: background-color .2s;
  }
}
.bottom__list{
  padding-bottom: 10px;
}
.more__score{
    font-size: 24px;
    color:#21539A;
    font-family: HEMIHEAD;
    margin-left: 10px;
}
.more__id{
  color: #5A6676;
  font-size: 12px;
  margin-left: 10px;
  margin-top: 10px;
}
.big-icon{
position: relative;
top:-1px;
}
</style>
<style>

.content__container .meg-card{
margin-right: 6px;
margin-bottom: 6px;
margin-top: 0;
margin-left: 0;
  }

</style>
<style lang="scss">
</style>
