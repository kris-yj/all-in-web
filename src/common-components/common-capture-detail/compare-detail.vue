<template>
  <div class="compare-detail">
    <div
      class="compare-card"
      v-if="isCompare">
      <meg-double-card
        width="50%"
        :left-img-src="facePhoto.url"
        :right-img-src="albumInfo.photoUrl"
        :score="fixedScore(albumInfo.score)"
        score-size="large"
        @enter="cardEnter"
        @leave="cardLeave"
        @click="imgFullScreenDialogShow">
        <div slot="header">
          <span class="photo-title">{{ $t("抓拍图") }}</span>
          <span class="photo-title">{{ $t("底库图") }}
          </span>
        </div>
        <template slot="left-custom">
          <common-jump-with-img
            v-show="jumpFlag==='left'"
            :params="leftJumpOpt"
            :append-album="leftAppendAlbum"
            :do-deploy="leftDoDeploy"></common-jump-with-img>
        </template>
        <template slot="right-custom">
          <common-jump-with-img
            v-show="jumpFlag==='right'"
            :params="rightJumpOpt"
            :append-album="rightAppendAlbum"
            :do-deploy="rightDoDeploy"></common-jump-with-img>
        </template>
      </meg-double-card>
    </div>
    <album-info
      v-if="isCompare"
      :album-info="albumInfo"></album-info>
    <div
      class="detail-info"
      :class="isCompare?'design-detail-info':''">
      <div class="info-header">
        <span
          @click="switchInfo('detail')"
          class="block-title"
          :class="showCompareInfo? '':'tab-active'">{{ $t("属性信息") }}</span>
        <span
          v-if="hasFace && detailCompare"
          @click="switchInfo('compare')"
          class="block-title"
          :class="showCompareInfo? 'tab-active':''">{{ $t("人像比对信息") }}</span>
      </div>
      <div
        class="info-container"
        :class="isCompare?'design-info-container':''">
        <p
          class="low-quality"
          v-if="!info.quality&&info.quality!==null">
          {{ $t('图片低质量，以下信息仅供参考') }}
        </p>
        <common-property-display
          v-if="info.properties"
          v-show="!showCompareInfo"
          :detect-type="info.detectType"
          :properties="info.properties"></common-property-display>
        <div
          class="card-wrapper"
          v-for="(item,index) in compareList"
          v-show="showCompareInfo"
          :key="index"
          :class="compareIndex===index?'active':''"
          @click="cardClick(index)">
          <meg-card
            :img-src="item.photoUrl"
            right-width="198px"
            img-margin="0">
            <div
              slot="right"
              class="compare-right-box">
              <div class="compare-score">
                {{ fixedScore(item.score) }}
              </div>
              <div
                class="compare-info-line"
                v-tooltip="true">
                <meg-icon name="card_face"></meg-icon><span :class="item.name?'':'no-name'">{{ item.name || $t("未知") }}</span> &nbsp; {{ dicMap(genderDic,item.gender) }}
              </div>
              <div
                v-if="item.albumName !== undefined"
                class="compare-info-line"
                v-tooltip="true">
                <meg-icon name="database"></meg-icon>{{ item.albumName }}
              </div>
              <div class="compare-info-line">
                <meg-icon name="ID"></meg-icon>
                <span
                  class="id-num-line"
                  v-tooltip="true">{{ item.idCard }}</span>
                <div
                  @click.stop="()=>{}"
                  class="copy-wrapper">
                  <meg-button
                    class="copy-btn"
                    type="text"
                    size="small"
                    v-if="item.idCard"
                    @click="onClickCopy(item.idCard)">
                    {{ $t("复制") }}
                  </meg-button>
                </div>
              </div>
              <div
                v-if="item.remark !== undefined"
                class="compare-info-line"
                v-tooltip="true">
                <meg-icon name="card_remark"></meg-icon>{{ item.remark }}
              </div>
            </div>
          </meg-card>
        </div>
        <div
          class="compare-blank"
          v-show="showCompareInfo&&!compareList.length">
          {{ $t('暂无数据') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { captureTransToAlarm } from '@/common-components/utils/utils';
import CommonPropertyDisplay from '@/common-components/common-property-display';
import CommonJumpWithImg from '@/common-components/common-jump-with-img';
import AlbumInfo from './album-info';

export default {
  components: {
    AlbumInfo,
    CommonPropertyDisplay,
    CommonJumpWithImg
  },
  props: {
    hasFace: {
      type: Boolean,
      default: false
    },
    isCompare: {
      type: Boolean,
      default: false
    },
    detailCompare: {
      type: Boolean,
      default: false
    },
    compareIndex: {
      type: Number,
      default: -1
    },
    info: {
      type: Object,
      default: () => {}
    },
    compareList: {
      type: Array,
      default: () => []
    },
    cascade: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      genderDic: {},
      nationDic: {},
      showCompareInfo: false,
      jumpFlag: '',
    };
  },
  computed: {
    // 人脸图
    facePhoto() {
      if (this.info.detectType === 0) {
        return {
          id: this.info.id,
          url: this.info.cropUrl,
          locator: this.info.cropLocator
        };
      }
      return {
        id: this.info.relatedPhotoVo.relatedId,
        url: this.info.relatedPhotoVo.relatedCropUrl,
        locator: this.info.relatedPhotoVo.relatedCropLocator,
        related: true
      };
    },
    // 选中底库项
    albumInfo() {
      return (this.compareIndex > -1) && (this.compareList.length >= this.compareIndex) ? this.compareList[this.compareIndex] : {};
    },
    leftJumpOpt() {
      return {
        id: this.facePhoto.id,
        photo: this.facePhoto.url,
        type: [0],
        genre: this.facePhoto.related ? 2 : 0,
        cameraId: this.info.cameraId,
        source: 1,
        capturedTime: this.info.capturedTime,
        address: this.info.addressName,
        originType: 'capture'
      };
    },
    leftAppendAlbum() {
      return {
        imageData: {
          originType: this.leftJumpOpt.originType,
          photoUrl: this.leftJumpOpt.photo,
          type: this.leftJumpOpt.type[0],
          cameraName: this.info.cameraName || this.info.fileName,
          captureTime: this.$root.$options.filters.formatTime(this.info.capturedTime),
          capturePhotoId: this.info.id
        }
      };
    },
    leftDoDeploy() {
      return {
        photoUrl: this.leftJumpOpt.photo,
        photoType: captureTransToAlarm(this.leftJumpOpt.type[0]),
      };
    },
    rightJumpOpt() {
      return {
        id: this.cascade ? null : this.albumInfo.photoCoreId,
        photo: this.albumInfo.photoUrl,
        cameraId: this.info.cameraId,
        capturedTime: this.info.capturedTime,
        type: [0],
        genre: 1,
        source: 1,
        originType: 'album'
      };
    },
    rightAppendAlbum() {
      return {
        imageData: {
          originType: this.rightJumpOpt.originType,
          photoUrl: this.rightJumpOpt.photo,
          type: this.rightJumpOpt.type[0],
          photoId: this.albumInfo.photoId,
          albumId: this.albumInfo.albumId
        }
      };
    },
    rightDoDeploy() {
      return {
        photoUrl: this.rightJumpOpt.photo,
        photoType: captureTransToAlarm(this.rightJumpOpt.type[0]),
      };
    },
  },
  watch: {
    isCompare(val) {
      if (val) this.showCompareInfo = true;
    }
  },
  created() {
    // 从字典表获取性别类型
    this.genderDic = this.$store.getters.dataMapByType('common_gender');
    // 从字典表获取民族
    this.nationDic = this.$store.getters.dataMapByType('common_people');
  },
  methods: {
    /**
     * @description: 重置显示状态
     * @param {type}
     * @return
     */
    reset() {
      this.showCompareInfo = false;
    },
    /**
     * @description: 切换显示
     * @param {String}
     * @return
     */
    switchInfo(type) {
      if (type === 'detail') {
        this.showCompareInfo = false;
      } else {
        this.showCompareInfo = true;
      }
    },
    /**
     * @description: 事件抛出
     * @param {Number}
     * @return
     */
    cardClick(index) {
      this.$emit('compare-card-click', index);
    },
    /**
     * @description: 比分处理，保留两位小数
     * @param {Number}
     * @return
     */
    fixedScore(param) {
      return typeof param === 'number' ? param.toFixed(2) : parseFloat(param).toFixed(2);
    },
    /**
     * @description: 复制
     * @param {String}
     * @return
     */
    onClickCopy(val) {
      this.$clipboard(val).then(() => {
        this.$message({
          type: 'success',
          message: this.$t('复制成功')
        });
      }, () => {
        this.$message({
          type: 'error',
          message: this.$t('复制失败')
        });
      });
    },
    cardEnter(event) {
      if (event === 'right') {
        this.jumpFlag = 'right';
      } else {
        this.jumpFlag = 'left';
      }
    },
    cardLeave(event) {
      if (event) {
        this.jumpFlag = '';
      }
    },
    /**
     * @description: 点击查看大图 duo=true时为双图
     * @param {String}
     * @return
     */
    imgFullScreenDialogShow(event) {
      if (event === 'left' || event === 'right') {
        const data = {
          src: [this.facePhoto.url, this.albumInfo.photoUrl],
          score: this.fixedScore(this.albumInfo.score)
        };
        this.$emit('show-img-scaled', data);
      }
    },
    /**
     * @description: 字典表映射
     * @param {Array}
     * @return
     */
    dicMap(arr, code) {
      if (code) {
        let target = '';
        arr.forEach((obj) => {
          if (obj.code === code.toString()) {
            target = obj.value;
          }
        });
        return target;
      }
      return '';
    },
  },
};
</script>

<style lang='scss' scoped>
.compare-detail {
  display: flex;
  .compare-card {
    width: 496px;
    margin-right: 37px;
    .meg-double-card {
      margin: 0;
      box-shadow: none;
    }
    .meg-img-container {
      overflow: hidden;
    }
    .photo-title {
      display: inline-block;
      margin: 20px 0 8px;
      width: 49%;
      font-size: 14px;
      color: #869abb;
    }
  }
  .design-detail-info {
    margin-bottom: 55px;
  }
  .detail-info {
    width: 320px;
    background: #F9F9F9;
    .info-header {
      height: 40px;
      cursor: pointer;
      padding: 0 15px;
      border-bottom: 1px solid #DCE1E5;
    }
    .block-title {
      display: inline-block;
      line-height: 40px;
      font-size: 14px;
      margin: 0 15px;
      box-sizing: border-box;
      height: 40px;
    }
    .tab-active {
      color: #21539B;
      border-bottom: 4px solid #21539B;
    }
    .info-container {
      margin: 13px 0;
      width: 100%;
      height: 380px;
      display: flex;
      flex-direction: column;
      .low-quality {
        margin-left: 30px;
        font-size: 12px;
        color: rgba(67,80,104,0.50);
        padding-bottom: 14px;
      }
    }
    .design-info-container {
      height: 462px;
    }
    .compare-blank {
      margin: 0 auto;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
    }
    .card-wrapper{
      border: 3px solid transparent;
      margin-bottom: 3px;
      &.active{
        border: 3px solid #5B98E7;
      }
    }
    .compare-right-box{
      width: 100%;
      padding-left: 10px;
      box-sizing: border-box;
    }
    .compare-score{
      font-size: 24px;
      color:#21539b;
      font-family: "HEMIHEAD";
      margin: 7px 0 -6px;
    }
    .compare-info-line{
      color: #5a6676;
      margin-top: 7px;
      .meg-icon {
        padding-right: 10px;
      }
      .no-name{
        color:#869ABB;
      }
      .id-num-line{
        display: inline-block;
        width: 126px;
        vertical-align: middle;
      }
      .copy-btn{
        padding: 0;
      }
    }
    .copy-wrapper{
      display: inline-block;
    }
    .copy-btn{
      padding: 0;
    }
    .meg-card {
      box-shadow: none;
    }
    .meg-card__right-wrapper {
      background: #F9F9F9;
    }
  }
}
</style>
