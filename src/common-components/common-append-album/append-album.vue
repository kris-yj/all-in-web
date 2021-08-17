<template>
  <div>
    <meg-dialog
      :title="$t('加入底库')"
      class="deploy-dialog"
      :visible="true"
      width="1250px"
      :append-to-body="appendToBody"
      :modal-append-to-body="appendToBody"
      :is-loading="isLoading"
      @close="closeDeploy"
      body-height="470px">
      <div
        class="dialog-body-box">
        <div class="deploy-card-box">
          <div class="deploy-card-box__inner">
            <div class="source-card-box">
              <meg-card
                :style="imageData.originType==='capture'?'':'width:144px'"
                :useful-frame="imageData.rect"
                @click="deployCardClick('img')"
                img-margin="10px"
                :class="activeCard==='img' ? 'active':''"
                :img-src="imageData.photoUrl">
                <div
                  v-if="imageData.originType==='capture'"
                  slot="right">
                  <div class="card-info">
                    <div class="card-tip">
                      <meg-icon name="time"></meg-icon>
                      <div class="card-tip-box">
                        {{ imageData.captureTime | formatTime('YYYY-MM-DD HH:mm:ss') }}
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  v-if="imageData.originType==='capture'"
                  slot="bottom"
                  class="bottom-tip-box">
                  <div class="card-tip">
                    <meg-icon name="poi"></meg-icon>
                  </div>
                  <div
                    style="flex:1"
                    v-tooltip="true">
                    {{ imageData.cameraName }}
                  </div>
                </div>
              </meg-card>
            </div>
            <div class="deploy-tip">
              <template v-if="imageData.type === 0">
                {{ $t("智能推荐：底库中相似的人脸") }}
              </template>
            </div>
            <div
              v-loading="resultLoading"
              :style="imageData.originType==='capture'?'height:240px':'height:259px'"
              class="result-card-box">
              <div
                class="no-result-box"
                v-if="!albumData.length">
                {{ $t("暂无数据") }}
              </div>
              <meg-card
                v-for="(item,index) in albumData"
                :key="index"
                :class="activeCard===index ? 'active':''"
                img-margin="10px 10px 0"
                :animation="true"
                @click="deployCardClick(index)"
                :img-src="item.photoUrl">
                <div slot="right">
                  <div class="card-info">
                    <div
                      class="card-score">
                      {{ fixedScore(item.score) }}
                    </div>
                    <div class="card-tip">
                      <meg-icon name="card_face"></meg-icon>
                      <div
                        class="card-tip-box">
                        <div v-tooltip:2="true">
                          {{ item.name }}
                        </div>
                      </div>
                    </div>
                    <div class="card-tip">
                      <meg-icon name="database"></meg-icon>
                      <div
                        class="card-tip-box">
                        <div v-tooltip:2="true">
                          {{ item.albumName }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  class="bottom-box"
                  v-tooltip="true"
                  slot="bottom">
                  <meg-icon name="ID"></meg-icon>
                  {{ item.idCard }}
                </div>
              </meg-card>
            </div>
          </div>
        </div>
        <div class="deploy-info-box">
          <meg-scrollbar>
            <div class="deploy-tip">
              {{ $t("请选择要加入的布控库") }}
            </div>
            <div class="deploy-info-box__inner">
              <meg-checkbox-group v-model="operateData">
                <div
                  class="album-box"
                  v-for="(item,index) in operateList"
                  :key="index">
                  <meg-checkbox

                    class="checkbox-item-box"
                    :label="item.id">
                    <span
                      :title="item.name"
                      class="name-box">
                      {{ item.name }}
                    </span>
                  </meg-checkbox>
                </div>
              </meg-checkbox-group>
            </div>
          </meg-scrollbar>
        </div>
      </div>
      <div slot="footer">
        <meg-button
          type="primary"
          @click="confirmDeploy">
          {{ $t('加入底库') }}
        </meg-button>
        <meg-button @click="closeDeploy">
          {{ $t('取消') }}
        </meg-button>
      </div>
    </meg-dialog>
    <photo-dialog-tabs
      ref="photoDialogTabs"
      :add-photo-data="albumPhotoInfo"
      :is-show="albumDialogVisible"
      database-type="MONITOR"
      @photo-dialog-close="albumDialogClose"
      @photo-add-confirm="albumDialogConfirm">
    </photo-dialog-tabs>
  </div>
</template>
<script>
import { utils } from '@/utils/utils';
import AppendAlbum from './append-album.service';
// import PhotoDialogTabs from '../photo-dialog-tabs/photo-dialog-tabs.vue';

// import _ from 'lodash';

export default {
  name: 'AppendAlbum',
  components: {
    // PhotoDialogTabs
    PhotoDialogTabs: () => import('./photo-dialog-tabs')
  },
  props: {
    imageData: {
      type: Object,
      default() {
        return {
          originType: 'capture', // 图片来源
          photoUrl: '',
          cameraName: '',
          captureTime: '',
          capturePhotoId: '', // 抓拍图ID
          type: '', // 图片类型 （1-人脸 2-人体 3-机动车 4-非机动车 5-机动车车牌 6-非机动车车牌）
        };
      }
    },
    appendToBody: {
      type: Boolean,
      default: true
    },
  },
  data() {
    return {
      resultLoading: false, // 单人检索部分的结果loading
      monitorData: {

      },
      singleSearchData: {
        faceList: [
          {
            photoData: '',
          }
        ],
        searchType: '1',
        topNum: 100,
        albumType: '1',
        albumIds: [],
        capturePhotoId: ''
      },
      albumData: [],
      operateList: [],
      operateData: [],
      activeCard: '',
      isDual: false,
      albumPhotoInfo: {},
      albumDialogVisible: false,
      photoInfo: {}, // 人像信息
      isLoading: false, // 是否一键布控按钮不可点
      albumWithoutData: false, // 是否是撤控以后得数据
      typeMap: {
        0: {
          albumParams: {
            deployObject: [1],
          },
          components: 'add'

        },
        1: {
          albumParams: {
            deployObject: [2],
          },
          components: 'bodyAdd'

        },
        5: {
          albumParams: {
            deployObject: [3],
          },
          components: 'car'
        },
        6: {
          albumParams: {
            deployObject: [5],
          },
          components: 'car'
        },

      }
    };
  },
  watch: {
    imageData(val) {
      if ((/[http]?[blob]?/).test(val.photoUrl)) {
        utils.urlToBase64(val.photoUrl).then((res) => {
          val.photoBase64 = res;
          this.init();
        });
      } else {
        val.photoBase64 = val.photoUrl;
        this.init();
      }
    },

  },
  created() {
    this.operateData = [];
    if ((/[http]?[blob]?/).test(this.imageData.photoUrl)) {
      utils.urlToBase64(this.imageData.photoUrl).then((res) => {
        this.imageData.photoBase64 = res;
        this.init();
      });
    } else {
      this.imageData.photoBase64 = this.imageData.photoUrl;
      this.init();
    }
  },
  mounted() {
    this.isDual = this.$store.getters.systemByType('isDual').value;
    // 视频网
    this.dualPlatformType = this.$store.getters.systemByType('dualPlatformType').value === '0';

    const operateParams = {
      type: [2],
      srcType: [1],
      authLevel: 2,
      platformType: this.dualPlatformType ? 0 : '',
      ...this.typeMap[this.imageData.type].albumParams,
    };
    const albumParams = {
      srcType: [1],
      platformType: this.dualPlatformType ? 0 : '',
    };
    AppendAlbum.albumList(albumParams).then((res) => {
      if (res.data.length) {
        res.data.forEach((element) => {
          this.singleSearchData.albumIds.push(element.id);
        });
      }
      this.initSearch();
    });
    AppendAlbum.albumList(operateParams).then((result) => {
      this.operateList = result.data;
    });
  },
  methods: {
    /**
     * 初始化
     */
    init() {
      this.activeCard = 'img';
      this.initSearch();
    },
    initSearch() {
      if (!this.singleSearchData.albumIds.length || this.imageData.type !== 0 || !this.imageData.photoBase64) return;
      this.resultLoading = true;
      this.singleSearchData.faceList[0].photoData = this.imageData.photoBase64;

      this.singleSearchData.faceList[0].rect = this.imageData.rect;
      this.singleSearchData.faceList[0].landmark = this.imageData.landmark;
      this.singleSearchData.faceList[0].isUrl = false;
      const { capturePhotoId } = this.imageData;
      if (capturePhotoId && capturePhotoId.startsWith('alarm_')) {
        this.singleSearchData.capturePhotoId = '';
      } else {
        this.singleSearchData.capturePhotoId = capturePhotoId;
      }
      AppendAlbum.singleSearch(this.singleSearchData).then((res) => {
        if (res.code === 0) {
          this.albumData = res.data.candidateList;
        }
        this.resultLoading = false;
      });
    },
    /**
     * 点击卡片时选择底库卡片
     */
    deployCardClick(index) {
      this.activeCard = index;
    },
    /**
     * @description 把底库类型转换成标准数据
     * @param {object} data
     * @returns
     */
    handleAlbumInfoToType(data) {
      const map = {
        1: 0,
        2: 1,
        3: 5,
        5: 6,
      };
      return map[data.deployObject];
    },
    /**
    * @description 一键布控准备工作，包括添加人像逻辑
    * @param {any}
    * @returns
    */
    confirmDeploy() {
      if (!this.operateData.length) {
        this.$message.warning(this.$t('请先选择布控库！'));
        return;
      }
      // 如果是抓拍图或上传图或者非比对得来的底库图,需要添加人像
      if (this.activeCard === 'img') {
        // 底库图需要拉取底库图信息
        if (this.imageData.originType === 'album') {
          const param = {
            albumId: this.imageData.albumId,
            photoId: this.imageData.photoId
          };
          AppendAlbum.getAlbumPhotoInfo(param).then((res) => {
            if (res.code === 0) {
              // 由于底库图在撤控以后查不到相关信息，更改为抓拍图处理方式, 同样下面在发送数据时，也要做特殊处理
              if (res.data) {
                this.albumPhotoInfo = res.data;
                this.albumPhotoInfo.photo = this.imageData.photoUrl;
                this.albumPhotoInfo.rect = this.imageData.rect;
                this.albumDialogVisible = true;
                this.$nextTick(() => {
                  this.$refs.photoDialogTabs.addPhotoTabs({ name: this.typeMap[this.handleAlbumInfoToType(this.albumPhotoInfo)].components });
                });
              } else {
                this.albumWithoutData = true;
                this.albumPhotoInfo = {
                  photo: this.imageData.photoUrl,
                  src: this.imageData.cameraName || '',
                  st: this.imageData.captureTime || '',
                };
                this.albumDialogVisible = true;
                this.$nextTick(() => {
                  // this.$refs.photoDialogTabs.addPhotoTabs({ name: 'add' });
                  this.$refs.photoDialogTabs.addPhotoTabs({ name: this.typeMap[this.imageData.type].components });
                });
              }
            } else {
              this.$message.error(res.msg);
            }
          });
        } else if (this.imageData.originType === 'capture') {
          this.albumPhotoInfo = {
            photo: this.imageData.photoUrl,
            src: this.imageData.cameraName,
            st: this.imageData.captureTime
          };
          this.albumDialogVisible = true;
          this.$nextTick(() => {
            // this.$refs.photoDialogTabs.addPhotoTabs({ name: 'add' });
            this.$refs.photoDialogTabs.addPhotoTabs({ name: this.typeMap[this.imageData.type].components });
          });
        } else {
          this.albumPhotoInfo = {
            photo: this.imageData.photoUrl,
            rect: this.imageData.rect
          };
          this.albumDialogVisible = true;
          this.$nextTick(() => {
            this.$refs.photoDialogTabs.addPhotoTabs({ name: this.typeMap[this.imageData.type].components });
          });
        }
      } else { // 智能匹配出来的结果直接布控
        const item = this.albumData[this.activeCard];
        const param = {
          albumId: item.albumId,
          photoId: item.photoId
        };
        AppendAlbum.getAlbumPhotoInfo(param).then((res) => {
          if (res.code === 0) {
            this.albumPhotoInfo = res.data;
            this.albumPhotoInfo.photo = item.photoUrl;
            this.albumDialogVisible = true;
            this.$nextTick(() => {
              this.$refs.photoDialogTabs.addPhotoTabs({ name: this.typeMap[this.handleAlbumInfoToType(this.albumPhotoInfo)].components });
            });
          } else {
            this.$message.error(res.msg);
          }
        });
        // this.deploy();
      }
    },
    /**
     * @description 添加确认
     * @param {Object} data 信息
     */
    albumDialogConfirm(data) {
      console.log(data);
      this.isLoading = true;
      this.photoInfo = data;
      if (this.photoInfo.identitys) {
        this.photoInfo.identitys.forEach((val) => {
          this.photoInfo[val.code] = val.value;
        });
        this.photoInfo.identitys = [];
      }

      if (this.photoInfo.addr && Object.keys(this.photoInfo.addr).length) {
        this.photoInfo.addrMsg = this.photoInfo.addr.msg;
        this.photoInfo.addrCode = this.photoInfo.addr.code;
      }
      delete this.photoInfo.addr;
      this.albumDialogVisible = false;
      this.deploy();
    },
    /**
     * 一键布控 接口字段传参逻辑
     */
    deploy() {
      this.monitorData = {};
      // 如果是双网，单独走一条路
      if (this.isDual === 'true') {
        // 抓拍图或上传图或者非比对得来的底库图
        if (this.activeCard === 'img') {
          if (this.imageData.originType === 'album' && !this.albumWithoutData) {
            this.monitorData.albumId = this.imageData.albumId;
            this.monitorData.photoId = this.imageData.photoId;
          } else {
            this.monitorData.photo = this.imageData.photoUrl;
            this.monitorData.rect = this.imageData.rect;
          }
        // 底库图 ： 公安网
        } else if (!this.dualPlatformType) {
          const item = this.albumData[this.activeCard];
          this.monitorData.albumId = item.albumId;
          this.monitorData.photoId = item.photoId;
          // 视频网
        } else {
          const item = this.albumData[this.activeCard];
          this.monitorData.photo = item.photoUrl;
        }
      // 如果是抓拍图或者上传图或者非比对得来的底库图
      } else if (this.activeCard === 'img') {
        if (this.imageData.originType === 'capture' || this.albumWithoutData) {
          // 抓拍图或者是已经撤控的底库图都按照抓拍图处理
          this.monitorData.passbyPhotoCoreId = this.imageData.passbyPhotoCoreId;
          this.monitorData.photo = this.imageData.photoUrl;
        } else if (this.imageData.originType === 'upload') {
          this.monitorData.photo = this.imageData.photoUrl;
          this.monitorData.rect = this.imageData.rect;
        } else {
          this.monitorData.albumId = this.imageData.albumId;
          this.monitorData.photoId = this.imageData.photoId;
        }
        console.log('img222222222');
      // 如果是底库图
      } else {
        console.log('如果是底库图');
        const item = this.albumData[this.activeCard];
        this.monitorData.albumId = item.albumId;
        this.monitorData.photoId = item.photoId;
      }
      // 如果存在图片，即须配上isUrl
      // 如果photo是以http开头的，则是url,否则为base64
      if (this.monitorData.photo) {
        this.monitorData.isUrl = ((/\/storage/).test(this.monitorData.photo) || (/\/core/).test(this.monitorData.photo) || (/http/).test(this.monitorData.photo));
      }
      this.monitorData.targetAlbumIds = this.operateData;
      this.monitorData.photoInfo = this.photoInfo;
      console.log(this.monitorData);
      AppendAlbum.monitor(this.monitorData).then((res) => {
        if (res.code === 0) {
          this.$message.success(this.$t('加入底库成功！'));
          this.$emit('close');
        }
        this.isLoading = false;
      });
    },
    closeDeploy() {
      this.$emit('close');
    },
    /**
     * 比分处理，保留两位小数
     */
    fixedScore(param) {
      return typeof param === 'number' ? param.toFixed(2) : parseFloat(param).toFixed(2);
    },
    /**
     * @description 添加人像弹窗关闭
     */
    albumDialogClose() {
      this.albumDialogVisible = false;
    }
  }
};
</script>

<style lang="scss">
.deploy-dialog {
  .card-box {
    display: inline-block;
    width: fit-content;
  }
  .dialog-body-box {
    min-width: 1190px;
    padding-bottom: 20px;
  }
  .deploy-card-box {
    display: inline-block;
    vertical-align: top;
    width: 754px;
    height: 430px;
    padding: 10px 20px;
    background-color: #dce1e5;
    .card-right-wrapper {
      display: flex;
      padding-top: 10px;
      justify-items: center;
      align-items: center;
    }
    .source-card-box {
      height: auto;
      background: #f5f6f7;
      .meg-card {
        margin: 0;
      }
    }
    .deploy-tip {
      font-size: 12px;
      height: 24px;
      line-height: 24px;
    }
    .meg-card {
      display: inline-block;
      color: #5a6676;
      width: 241px;
      box-shadow: none;
      border: 2px solid transparent;
      margin-right: 3px;
      margin-bottom: 3px;
      &.active {
        border-color: #8db5f3;
      }
      .card-info {
        margin-top: 10px;
      }
    }
    .bottom-box {
      padding: 4px 10px;
      font-size: 12px;
      color: inherit;
      word-break: break-all;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      .meg-icon {
        width: 12px;
        height: 12px;
        color: #d1d5dd;
        vertical-align: text-top;
      }
    }
  }
  .result-card-box {
    height: 259px;
    padding-top: 2px;
    overflow: auto;
    .no-result-box {
      display: flex;
      height: 100%;
      justify-content: center;
      align-items: center;
      background-color: #f5f6f7;
    }
    .card-info {
      margin-top: 10px;
    }
    .card-score {
      font-family: "HEMIHEAD";
      font-size: 24px;
      color: #21539b;
      height: 38px;
    }
  }
  .deploy-info-box {
    display: inline-block;
    vertical-align: top;
    margin-left: 15px;
    width: 374px;
    height: 450px;
    border: 1px solid #d2d6de;
    .deploy-tip,
    .album-box {
      height: 36px;
      line-height: 36px;
      padding-left: 16px;
      color: #8a97a0;
      background-color: #f7f8f9;
      display: flex;
      align-items: center;
      .checkbox-item-box {
        width: 100%;
        .meg-checkbox__label {
          width: 93%;
          vertical-align:middle;
          overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
          .name-box {
            width:100%;
          }
        }
      }
    }
    .album-box:nth-child(2n + 1) {
      background-color: #fff;
    }
  }
  .card-tip,
  .bottom-tip-box {
    .meg-icon {
      height: 12px;
      width: 12px;
      vertical-align: baseline;
      color: #d1d5dd;
    }
  }
  .bottom-tip-box {
    display: flex;
    height: 18px;
    color: #5a6676;
    line-height: 12px;
    font-size: 12px;
    margin-left: 8px;
    .card-tip {
      display: inline-block;
      margin-left: 2px;
    }
  }
  .card-tip-box {
    display: inline-block;
    vertical-align: top;
    width: 78px;
    color: #5a6676;
    line-height: 16px;
    font-size: 12px;
    height: 32px;
    margin-left: 2px;
  }
}
</style>
