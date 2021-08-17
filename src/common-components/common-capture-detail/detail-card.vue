<template>
  <div class="detail-card-container">
    <!-- 双卡 -->
    <div
      class="duo-card"
      v-if="isPhotoSearch&&!isPeer&&!isVideo">
      <meg-double-card
        width="50%"
        :left-img-src="uploadFile.base64"
        :right-img-src="activeItem.photo"
        :left-useful-frame="{}"
        :score="info.score"
        score-size="large"
        @enter="cardEnter"
        @leave="cardLeave"
        @click="imgFullScreenDialogShow">
        <!-- uploadFile.locator.rect -->
        <div slot="header">
          <span class="photo-title">{{ $t("上传图") }}</span>
          <span class="photo-title">{{ $t("抓拍图") }}
            <span
              class="archives-btn"
              v-if="info.hasArchives && archivesSearchPermission"
              @click.stop="jumpToDocument()">
              <meg-icon
                name="archives"
                color="#21539b"></meg-icon>
              {{ $t("全息档案") }}
            </span>
          </span>
        </div>
        <!-- 携图跳转 -->
        <template slot="left-custom">
          <common-jump-with-img
            v-if="uploadFile.detectType!==4"
            v-show="jumpFlag==='left'"
            :custom-target-list="customTargetList"
            :params="leftJumpOpt"
            :append-album="leftAppendAlbum"
            :do-deploy="leftDoDeploy"></common-jump-with-img>
        </template>
        <template slot="right-custom">
          <div
            class="switch"
            v-if="relatedObj.photo"
            @click.stop="switchPhoto">
            <span>
              <meg-icon name="two-way-arrow"></meg-icon>
              {{ translateRelatedType() }}
            </span>
          </div>
          <common-jump-with-img
            v-show="jumpFlag==='right'"
            :custom-target-list="customTargetList"
            :params="rightJumpOpt"
            :append-album="rightAppendAlbum"
            :do-deploy="rightDoDeploy"></common-jump-with-img>
        </template>
        <template
          slot="bottom">
          <div class="bottom-box right">
            <p>
              <span class="info-title">{{ $t("抓拍时间") }}</span>
              <span class="info-content">{{ info.capturedTime | formatTime }}</span>
            </p>
            <p v-if="info.cameraId&&!isPeer">
              <span class="info-title">{{ $t("相机类型") }}</span>
              <span class="info-content">{{ info.cameraTypeName }}</span>
            </p>
            <p
              style="display:flex"
              v-if="info.cameraId&&!isPeer">
              <span class="info-title">{{ $t("相机名称") }}</span>
              <span
                v-tooltip="true"
                style="flex:1"
                class="info-content">{{ info.cameraName }}</span>
              <span
                class="info-copy"
                @click="copyPtext(info.cameraName)">
                {{ $t("复制") }}
              </span>
            </p>
            <p
              style="display:flex"
              v-if="info.fileName&&!isPeer">
              <span class="info-title">{{ $t("文件名称") }}</span>
              <span
                v-tooltip="true"
                style="flex:1"
                class="info-content">{{ info.fileName }}</span>
              <span
                class="info-copy"
                @click="copyPtext(info.fileName)">
                {{ $t("复制") }}
              </span>
            </p>
          </div>
        </template>
      </meg-double-card>
    </div>
    <!-- 单卡 -->
    <div
      class="single-card"
      v-else>
      <meg-card
        img-margin="0"
        show-angle
        :img-src="activeItem.photo"
        @enter="cardEnter"
        @leave="cardLeave"
        @click="imgFullScreenDialogShow">
        <div slot="header">
          <span class="photo-title">{{ rightTitle }}
            <span
              class="archives-btn"
              v-show="activeIndex==='1'"
              v-if="info.hasArchives && archivesSearchPermission"
              @click.stop="jumpToDocument()">
              <meg-icon
                name="archives"
                color="#21539b"></meg-icon>
              {{ $t("全息档案") }}
            </span>
          </span>
        </div>
        <div slot="img-custom">
          <div
            class="switch"
            v-if="relatedObj.photo"
            v-show="activeIndex==='1'"
            @click.stop="switchPhoto">
            <span>
              <meg-icon name="two-way-arrow"></meg-icon>
              {{ translateRelatedType() }}
            </span>
          </div>
          <!-- 携图跳转 -->
          <common-jump-with-img
            v-if="!activeItem.disable"
            v-show="jumpFlag==='img'"
            :params="rightJumpOpt"
            :custom-target-list="customTargetList"
            :append-album="rightAppendAlbum"
            :do-deploy="rightDoDeploy"></common-jump-with-img>
        </div>
        <div
          v-if="activeIndex!=='4'"
          slot="bottom">
          <div class="bottom-box">
            <p>
              <span class="info-title">{{ $t("抓拍时间") }}</span>
              <span class="info-content">{{ isPeer?peerTime:info.capturedTime | formatTime }}</span>
            </p>
            <p v-if="info.cameraId&&!isPeer">
              <span class="info-title">{{ $t("相机类型") }}</span>
              <span class="info-content">{{ info.cameraTypeName }}</span>
            </p>
            <p
              style="display:flex"
              v-if="info.cameraId&&!isPeer">
              <span class="info-title">{{ $t("相机名称") }}</span>
              <span
                v-tooltip="true"
                style="flex:1"
                class="info-content">{{ info.cameraName }}</span>
              <span
                class="info-copy"
                @click="copyPtext(info.cameraName)">
                {{ $t("复制") }}
              </span>
            </p>
            <p
              style="display:flex"
              v-if="info.fileName&&!isPeer">
              <span class="info-title">{{ $t("文件名称") }}</span>
              <span
                v-tooltip="true"
                style="flex:1"
                class="info-content">{{ info.fileName }}</span>
              <span
                class="info-copy"
                @click="copyPtext(info.fileName)">
                {{ $t("复制") }}
              </span>
            </p>
          </div>
        </div>
      </meg-card>
    </div>
  </div>
</template>

<script>
import { switchToModule } from '@/utils/utils';
import { captureTransToAlarm } from '@/common-components/utils/utils';
import CommonJumpWithImg from '@/common-components/common-jump-with-img';

export default {
  components: {
    CommonJumpWithImg
  },
  props: {
    // 自定义携图跳转列表
    customTargetList: {
      type: Array,
      default: () => []
    },
    isPhotoSearch: {
      type: Boolean,
      default: false
    },
    archivesSearchPermission: {
      type: Boolean,
      default: false
    },
    info: {
      type: Object,
      default: () => {}
    },
    uploadFile: {
      type: Object,
      default: () => {}
    },
    activeIndex: {
      type: String,
      default: ''
    },
    peerItem: {
      type: Object,
      default: () => {}
    },
    cascade: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      jumpFlag: '',
      switchState: 1,
      captureObj: {},
      relatedObj: {},
      activeItem: {},
    };
  },
  computed: {
    isPeer() {
      return Boolean(this.activeIndex === '3');
    },
    isVideo() {
      return Boolean(this.activeIndex === '4');
    },
    captureFile() {
      return this.switchState ? this.captureObj : this.relatedObj;
    },
    rightTitle() {
      return this.isPeer ? this.$t('同行抓拍图') : this.$t('抓拍图');
    },
    peerTime() {
      return this.peerItem.capturedTime ? this.$root.$options.filters.formatTime(this.peerItem.capturedTime) : '';
    },
    leftJumpOpt() {
      if (this.isPhotoSearch && !this.isPeer) {
        return {
          photo: this.uploadFile.base64,
          type: [this.uploadFile.detectType],
          cameraId: this.info.cameraId,
          capturedTime: this.activeItem.time,
          genre: 4,
          source: 1,
          originType: 'upload'
        };
      }
      return {};
    },
    leftAppendAlbum() {
      return this.leftJumpOpt.photo ? {
        imageData: {
          originType: this.leftJumpOpt.originType,
          photoUrl: this.leftJumpOpt.photo,
          type: this.leftJumpOpt.type[0],
        }
      } : {};
    },
    leftDoDeploy() {
      return {
        photoUrl: this.leftJumpOpt.photo,
        photoType: captureTransToAlarm(this.leftJumpOpt.type[0]),
      };
    },
    rightJumpOpt() {
      console.log('this.activeItem.detectType', this.activeItem.detectType);
      return {
        id: this.cascade ? null : this.activeItem.id,
        photo: this.activeItem.photo,
        type: [this.activeItem.detectType],
        genre: this.activeItem.related ? 2 : 0,
        source: 1,
        capturedTime: this.activeItem.time,
        address: this.info.addressName,
        cameraId: this.info.cameraId,
        originType: 'capture'
      };
    },
    rightAppendAlbum() {
      return {
        imageData: {
          originType: this.rightJumpOpt.originType,
          photoUrl: this.rightJumpOpt.photo,
          type: this.rightJumpOpt.type[0],
          cameraName: this.info.cameraName || this.info.fileName,
          captureTime: this.$root.$options.filters.formatTime(this.info.capturedTime),
          capturePhotoId: this.info.id
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
    peerItem() {
      if (this.isPeer) {
        this.activeItem = {
          photo: this.peerItem.cropUrl,
          rect: this.peerItem.cropLocator && this.peerItem.cropLocator.rect,
          detectType: this.peerItem.detectType,
          id: this.peerItem.id,
          disable: this.peerItem.disable,
          time: this.peerItem.capturedTime
        };
      }
    },
    info() {
      // 详情改变时 初始化数据
      this.captureObj = {
        photo: this.info.cropUrl,
        rect: this.info.cropLocator && this.info.cropLocator.rect,
        detectType: this.info.detectType,
        id: this.info.id,
        time: this.info.capturedTime
      };
      this.activeItem = this.captureObj;
      if (this.info.relatedPhotoVo && this.info.relatedPhotoVo.relatedCropUrl) {
        this.relatedObj = {
          photo: this.info.relatedPhotoVo.relatedCropUrl,
          rect: this.info.relatedPhotoVo.relatedCropLocator,
          detectType: this.info.relatedPhotoVo.detectType,
          id: this.info.relatedPhotoVo.relatedId,
          related: true,
          time: this.info.capturedTime
        };
      } else {
        this.relatedObj = {};
      }
    },
    activeIndex(val) {
      if (val === '3') {
        this.activeItem = {
          photo: this.peerItem.cropUrl,
          rect: this.peerItem.cropLocator && this.peerItem.cropLocator.rect,
          detectType: this.peerItem.detectType,
          id: this.peerItem.id,
          disable: this.peerItem.disable,
          time: this.peerItem.capturedTime
        };
      } else {
        this.activeItem = this.captureObj;
      }
    }
  },
  methods: {
    cardEnter(event) {
      switch (event) {
        case 'left': {
          this.jumpFlag = 'left';
          break;
        }
        case 'right': {
          this.jumpFlag = 'right';
          break;
        }
        case 'img': {
          this.jumpFlag = 'img';
          break;
        }
        default: this.jumpFlag = '';
          break;
      }
    },
    cardLeave(event) {
      if (event) {
        this.jumpFlag = '';
      }
    },
    // 点击查看大图
    imgFullScreenDialogShow(event) {
      if (this.activeItem.disable) { return; }
      if (event === 'img') {
        const data = {
          src: [this.activeItem.photo],
        };
        this.$emit('show-img-scaled', data);
      } else if (event === 'left' || event === 'right') {
        const data = {
          src: [this.uploadFile.base64, this.activeItem.photo],
          score: this.info.score
        };
        this.$emit('show-img-scaled', data);
      }
    },
    /**
     * @description: 抓拍图和关联图转换
     * @param {type}
     * @return
     */
    switchPhoto() {
      if (this.activeItem.id === this.captureObj.id) {
        this.activeItem = this.relatedObj;
      } else {
        this.activeItem = this.captureObj;
      }
    },
    /**
     * @description: 跳转一人一档
     * @param {type}
     * @return
     */
    jumpToDocument() {
      const query = {
        id: this.info.profileId,
        noShowBack: true
      };
      const moduleInfo = {
        module: 'doc-search',
        query,
        isBlank: true
      };
      switchToModule(moduleInfo);
    },
    /**
     * @description: 关联图文案翻译
     * @param {type}
     * @return
     */
    translateRelatedType() {
      let type = null;
      if (this.activeItem.id === this.captureObj.id) {
        type = this.relatedObj.detectType;
      } else {
        type = this.captureObj.detectType;
      }
      switch (type) {
        case 0: return this.$t('关联人脸');
        case 1: return this.$t('关联人体');
        case 5: return this.$t('关联机动车');
        case 6: return this.$t('关联非机动车');
        default: return '';
      }
    },
    // 快捷复制信息
    copyPtext(info) {
      this.$clipboard(info).then(() => {
        this.$message({
          message: this.$t('复制成功'),
          type: 'success',
          showClose: true,
        });
      }, () => {
        this.$message({
          type: 'error',
          message: this.$t('复制失败')
        });
      });
    }
  },
};
</script>

<style lang='scss' scoped>
.detail-card-container {
  ::v-deep .capture-hover-items {
    top: 4px;
    right: 4px;
  }
  .info-title {
    padding-right: 10px;
    font-size: 14px;
    color: #869abb;
  }
  .info-content {
    font-size: 14px;
    color: #435068;
  }
  .info-copy {
    font-size: 14px;
    color: #869abb;
    cursor: pointer;
  }
  .switch {
    position: absolute;
    left: 4px;
    top: 4px;
    z-index: 10;
    span {
      display: flex;
      height: 20px;
      border-radius: 2px;
      background: #21539b;
      color: #fff;
      padding: 3px;
      font-size: 12px;
      line-height: 20px;
      padding-right: 7px;
      .meg-icon {
        width: 12px;
        height: 12px;
        line-height: 20px;
        margin-top: 3px;
        margin-right: 3px;
      }
    }
  }
  .duo-card {
    width: 496px;
    .meg-double-card {
      margin: 0;
      box-shadow: none;
      overflow: hidden;
    }
    ::v-deep .meg-double-card__img {
      overflow: hidden;
    }
    .photo-title {
      display: inline-block;
      margin-bottom: 10px;
      width: 49%;
      font-size: 14px;
      color: #869abb;
    }
    .archives-btn {
      position: absolute;
      right: 0;
      height: 14px;
      color: #21539b;
      cursor: pointer;
    }
    .right {
      float: right;
    }
    .bottom-box {
      width: 50%;
      padding-top: 22px;
      cursor: default;
      p {
        margin-bottom: 8px;
      }
    }
  }
  .single-card {
    width: 248px;
    .meg-card {
      margin: 0;
      box-shadow: none;
    }
    ::v-deep .meg-card__img {
      overflow: hidden;
    }
    .photo-title {
      display: inline-block;
      margin-bottom: 10px;
      width: 49%;
      font-size: 14px;
      color: #869abb;
    }
    .archives-btn {
      position: absolute;
      right: 0;
      height: 14px;
      color: #21539b;
      cursor: pointer;
    }
    .bottom-box {
      padding-top: 22px;
      cursor: default;
      p {
        margin-bottom: 8px;
      }
    }
  }
}
</style>
