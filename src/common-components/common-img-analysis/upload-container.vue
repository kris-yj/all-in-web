<template>
  <div
    class="upload-container"
    :style="{backgroundImage: `url(${backgroundImg})`}">
    <meg-img-container
      v-show="listLength"
      :tile="true"
      :img-src="imgSrc"
      :width-scale="scale.widthScale"
      :height-scale="scale.heightScale">
    </meg-img-container>
    <div
      class="icon-list"
      v-show="showIcon&&listLength">
      <div
        v-show="couldEdit"
        class="edit-icon"
        @click.stop="$emit('edit-img')">
        <!-- slot编辑 -->
        <slot name="edit-icon">
          <meg-icon
            class="edit"
            color="#fff"
            width="15"
            height="15"
            name="edit_photo">
          </meg-icon>
        </slot>
      </div>
      <div
        class="delete-icon"
        @click.stop="$emit('delete-img')">
        <!-- slot删除 -->
        <slot name="delete-icon">
          <meg-icon
            class="mission_del"
            color="#fff"
            width="15"
            height="15"
            name="mission_del">
          </meg-icon>
        </slot>
      </div>
      <div
        class="jump-box"
        v-if="jumpVisible && activeItem.photo"
        @click.stop>
        <common-jump-with-img
          :params="jumpOpt"
          :append-album="appendAlbum"
          :do-deploy="doDeploy"></common-jump-with-img>
      </div>
    </div>
  </div>
</template>

<script>
import { captureTransToAlarm } from '@/common-components/utils/utils';
import CommonJumpWithImg from '@/common-components/common-jump-with-img';
import defaultBg from './images/img-analysis-bg.svg';

export default {
  name: 'UploadContainer',
  components: {
    CommonJumpWithImg
  },
  props: {
    jumpVisible: {
      type: Boolean,
      default: false
    },
    scale: {
      type: Object,
      default: () => ({ widthScale: 0.5, heightScale: 0.5 })
    },
    activeItem: {
      type: Object,
      default: () => ({})
    },
    isMultiMode: {
      type: Boolean,
      default: true
    },
    listLength: {
      type: Number,
      default: 0
    },
    backgroundImg: {
      type: String,
      default: ''
    },
    showIcon: {
      type: Boolean,
      default: true
    },
    showOrigin: { // 上传框中显示原图
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      defaultBg
    };
  },
  computed: {
    checkedList() {
      return this.activeItem.images ? this.activeItem.images.filter((i) => i.checked) : [];
    },
    imgSrc() {
      if (this.checkedList.length === 1) {
        return this.checkedList[0].base64 ? this.checkedList[0].base64 : this.activeItem.photo;
      }
      return this.activeItem.photo;
    },
    couldEdit() {
      return this.activeItem ? this.activeItem.couldEdit : true;
    },
    jumpOpt() {
      return {
        photo: this.imgSrc,
        type: (this.checkedList.length === 1) && this.checkedList[0].detectType ? [this.checkedList[0].detectType] : [0, 1, 5, 6],
        genre: 4,
        source: 1,
        originType: 'upload'
      };
    },
    appendAlbum() {
      return {
        imageData: {
          originType: 'upload',
          photoUrl: this.jumpOpt.photo,
          type: this.jumpOpt.type[0]
        }
      };
    },
    doDeploy() {
      return {
        photoUrl: this.jumpOpt.photo,
        photoType: captureTransToAlarm(this.jumpOpt.type[0]),
      };
    },
  }
};
</script>

<style lang='scss' scoped>
.upload-container {
  width:100%;
  height: 100%;
  position: relative;
  background: no-repeat;
  background-size: 100%;
  .meg-img-container {
    overflow: hidden;
    background: linear-gradient(180deg,#e6edf8,#f6f6f6);
    z-index: 2;
  }
  .icon-list {
    position: absolute;
    top:0;
    right: 0;
    margin: 10px;
    cursor: pointer;
    display: flex;
    z-index: 10;
    .delete-icon,.edit-icon,.jump-box {
      background-color:rgba(67,80,104,.61);
      display: flex;
      width: 25px;
      height: 25px;
      justify-content: center;
      align-items: center;
      border-radius: 3px;
      margin-left: 5px;
    }
    .edit-icon:hover,.delete-icon:hover,.jump-box:hover {
      background: #21539a !important;
    }
    ::v-deep .meg-icon {
      padding: 0;
      background: none;
      width: 15px !important;
      height: 15px !important;
    }
    ::v-deep .capture-hover-items {
      top: 4px;
      right: auto;
    }
  }
}
</style>
