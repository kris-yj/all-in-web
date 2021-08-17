<template>
  <div
    class="switch-detail"
    v-loading.fullscreen="switchDetailLoading">
    <meg-dialog
      :fullscreen="true"
      top="0px"
      class="switch-dialog"
      custom-class="full-img-box"
      @close="dialogClose"
      :visible="detailVisible"
      append-to-body>
      <!-- 以下弹框为在全景图下的识别多人脸弹框 -->
      <meg-select-face
        class="common-select-face"
        append-to-body
        v-if="checkVisible"
        :carry-picture="imgJumpList"
        @carry-picture="carryPicture"
        :panorama="true"
        :cancel="cannelCheckVisible"
        :response-data="responseData">
      </meg-select-face>
      <div
        class="full-img-box-top"
        :style="{'height':(win.innerHeight-75)+'px','width':win.innerWidth+'px'}">
        <!--TODO 如果此处只使用画框功能，可使用meg-img-container组件进行替换 -->
        <meg-cropper
          v-if="isFullImage && detailVisible"
          :container-style="{width:'100%',height:'100%'}"
          :src="detailData.fullUrl"
          :auto-crop="false"
          :colors="['#4688f1','#4688f1']"
          :zoomable="false"
          drag-mode="false"
          :background="false"
          ref="cropper"
          :face-rect="[detailData.fullRect]"></meg-cropper>
        <meg-img-container
          v-if="!isFullImage"
          text-align="center"
          vertical-align="middle"
          :context-download="true"
          :img-src="detailData.faceUrl"></meg-img-container>
      </div>
      <div
        v-if="isFullImage"
        slot="footer"
        class="full-img-box-bottom">
        <div
          class="btn-container"
          @click="checkManyFaceFn">
          <span>
            <meg-icon
              name="multi_faces"
              width="22"
              height="22"
              color="#DCE1E5"></meg-icon>
          </span>
          <span class="btn-container-text">
            {{ $t('识别多人脸') }}
          </span>
        </div>
        <div
          class="btn-container"
          v-if="enableStructSearch"
          @click="cropperBody">
          <span>
            <meg-icon
              name="cut_another"
              width="22"
              height="22"
              color="#DCE1E5"></meg-icon>
          </span>
          <span class="btn-container-text">
            {{ $t('裁剪人身') }}
          </span>
        </div>
      </div>
    </meg-dialog>
    <body-crop
      :visible.sync="bodyCropVisible"
      :img-url="bodyCropImg"
      :confirm-text="$t('确认')"
      @getBase64="getBodyPhoto">
    </body-crop>
  </div>
</template>
<script>
import _ from 'lodash';
import { utils, switchToModule } from '@/utils/utils';
import withImgToOtherModule from '@/mixins/with-img-to-other-module.js';
import CardDetailSrv from '../../album-region.service';
import BodyCrop from './body-crop';

const win = window;
const photoLinks = ['capture-search', 'face-search', 'face-comparison', 'peer', 'track', 'hiding-place', 'doc-search']; // 抓拍检索 人像检索，人像比对，轨迹回放，同行分析，落脚点分析，档案检索
// 扩展iconName
const jumpIconData = {
  'capture-search': 'passby_menu',
  'face-search': 'faceSearch_menu',
  'face-comparison': 'faceComparison_menu',
  'peer': 'peer_menu',
  'track': 'track_menu',
  'hiding-place': 'hidingPlace_menu',
  'doc-search': 'archives'
};

export default {
  components: {
    BodyCrop
  },
  mixins: [withImgToOtherModule],
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    detailData: {
      type: Object,
      default: () => {}
    },
    isFullImage: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      win,
      checkVisible: false,
      detailVisible: false,
      faceAnalyzeParams: { // 人脸检测请求参数
        'photoData:': '',
        'scenario': 'CAPTURE'// 图像使用场景， 枚举类型，CAPTURE（抓拍）, MONITOR （布控入库）, STATIC （静态入库）
      },
      imgJumpList: [], // 识别多人脸经过权限筛选后的携图跳转字段集合
      responseData: [], // 识别多人脸接口返回数据
      enableStructSearch: false, // 是否开启视频结构化（以身搜脸）
      bodyCropVisible: false,
      bodyCropImg: '',
      switchDetailLoading: false,
    };
  },
  watch: {
    visible(val) {
      this.detailVisible = val;
    },
  },
  created() {
    this.imgJumpList = this.getImgJumpList(photoLinks);
    this.imgJumpList = this.imgJumpList.map((item) => ({
      text: item.name,
      icon: jumpIconData[item.alias],
      key: item.alias,
    }));
    // 一键布控按钮
    const monitorButton = {
      text: this.$t('一键布控'),
      icon: 'surveillanceTask_menu',
      key: 'deployByOneKey'
    };
    this.imgJumpList.unshift(monitorButton);
  },
  methods: {
    cannelCheckVisible() { // 关闭多人脸识别对话框
      this.checkVisible = false;
    },
    // 识别多人脸携图跳转路由
    carryPicture(data) {
      const [jumpData] = _.filter(this.imgJumpList, { key: data.aims });
      if (jumpData.key === 'deployByOneKey') {
        const deployData = {
          type: 'upload',
          photoUrl: this.detailData.fullUrl,
          rect: data.usefulFrame,
          landmark: data.landmark
        };
        this.$emit('showDeploy', deployData);
      } else {
        this.withImgToOtherModule({
          alias: jumpData.key,
          url: this.detailData.fullUrl,
          landmark: data.landmark,
          usefulFrame: data.usefulFrame,
        });
      }
    },
    faceAnalyze() {
      const vm = this;
      this.switchDetailLoading = true;
      utils.urlToBase64(vm.detailData.fullUrl).then((res) => {
        vm.faceAnalyzeParams.photoData = res;
        CardDetailSrv.getAnalyze(vm.faceAnalyzeParams).then((result) => {
          if (result.code === 0) {
            result.data.paraData = res;
            vm.responseData = [result.data];
            vm.checkVisible = true;
          } else {
            this.$message.error(result.msg);
          }
          this.switchDetailLoading = false;
        });
      });
    },
    checkManyFaceFn() {
      // 调用人脸识别接口
      this.faceAnalyze();
    },
    // 图片切换
    ImageChange(num) {
      if (num === 1) {
        this.$emit('update:isFullImage', false);
      } else {
        this.$emit('update:isFullImage', true);
      }
    },
    cancelSelectFace() {
      this.checkVisible = false;
    },
    dialogClose() {
      this.$emit('update:visible', false);
    },
    getBodyPhoto(img) {
      utils.base64ToUrl(img).then((res) => {
        const query = {
          fileData: res,
          searchType: 'body',
          fileType: 'url',
        };
        const moduleInfo = {
          module: 'capture-search',
          // child: 'human-fusion',
          query,
          isBlank: true
        };
        switchToModule(moduleInfo);
      });
    },
    cropperBody() {
      const query = {
        fileData: this.detailData.fullUrl,
        searchType: 'body',
        fileType: 'url',
      };
      const moduleInfo = {
        module: 'capture-search',
        // child: 'human-fusion',
        query,
        isBlank: true
      };
      switchToModule(moduleInfo);
    },
  }
};
</script>
<style lang="scss" scoped>
::v-deep .buttonList{
  text-align: left;
}
.switch-dialog {
  ::v-deep .meg-dialog__body{
    padding: 0;
    height: calc(100% - 50px);
  }
  ::v-deep .meg-dialog__footer{
    background: #21539B;
    height: 50px;
    padding: 0px;
  }
  ::v-deep .meg-dialog__header-btn {
    z-index: 10000;
  }
}
.full-img-box-top{
  overflow: hidden;
  padding: 20px 0 40px 0;
  box-sizing: border-box;
  height: calc(100% - 50px);
}
.full-img-box-bottom{
  width: 100%;
  height: 100%;
  background: #21539B;
  display: flex;
  justify-content: center;

  .btn-container{
    width: 80px;
    height: 40px;
    cursor: pointer;
    padding-top: 10px;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
}
.btn-container-text{
  line-height: 18px;
  font-size: 12px;
  color: #DCE1E5 ;
  text-align: center;
}
.full-img-box-bottom-btn-container{
  width: 280px;
  height: 50px;
  display: flex;
  justify-content: space-around;
}

.btn-container-text{
  line-height: 18px;
  font-size: 12px;
  color: #DCE1E5 ;
}
.el-dialog.selectFaceDialog{
  width: 800px;
  height: 540px;
  margin-top:10vh!important;
}
</style>
<style lang="scss">
.buttonList {
  text-align: left;
}
</style>
