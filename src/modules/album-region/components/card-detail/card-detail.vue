<template>
  <div>
    <meg-dialog
      v-if="visible"
      :visible="true"
      width="1250px"
      body-height="544px"
      :show-close="true"
      class="card-detail-dialog"
      @close="onDialogClose">
      <div slot="title">
        {{ $t('结果详情') }}
      </div>
      <div
        class="detail-dialog-body"
        v-loading="loading">
        <div class="detail-content-container">
          <div class="detail-content-item">
            <div class="content-left">
              <sub-detail
                :info="info"
                :photo-list="photoList"
                :is-photo-search="isPhotoSearch"
                :device-type="deviceType"
                @showDeploy="showDeploy"></sub-detail>
            </div>
            <div class="compare-info-box">
              <album-info
                :list="info"></album-info>
            </div>
          </div>
        </div>
        <div class="detail-bottom-container">
          <detail-selector
            :detail-list="list"
            :default-selected-index="selectIndex"
            @change="onSelectChanged">
          </detail-selector>
        </div>
      </div>
    </meg-dialog>
    <!-- <deploy-dialog
      style="zindex:9999"
      class="deploy-custom"
      :visible.sync="deployVisible"
      :deploy-data="deployData">
    </deploy-dialog> -->
  </div>
</template>
<script>
// import DeployDialog from '@/components/deploy'; // TODO
import RemoteFullImage from '@/mixins/remote-full-image';
import fullImageEmpty from '@/assets/images/judge/full-image-empty.svg';
import fullImageLoading from '@/assets/images/judge/full-image-loading.gif';
import fullImageUnsupported from '@/assets/images/judge/full-image-unsupported.svg';
import AlbumRegionSrv from '../../album-region.service';
import DetailSelector from './detail-select';
import SubDetail from './sub-detail';
import AlbumInfo from './album-info';

export default {
  name: 'CardDetail',
  components: {
    SubDetail,
    DetailSelector,
    AlbumInfo,
    // DeployDialog
  },
  mixins: [RemoteFullImage],
  props: {
    // 弹框显隐
    visible: {
      type: Boolean,
      default: false
    },
    // 卡片详情
    info: {
      type: Object,
      default: () => {}
    },
    // 卡片列表
    list: {
      type: Array,
      default: () => []
    },
    photoList: {
      type: Array,
      default: () => []
    },
    selectIndex: {
      type: Number,
      default: 0
    },
    isPhotoSearch: {
      type: Boolean,
      default: false,
    },
    isFrom: {
      type: String,
      default: 'album-region',
    }
  },
  data() {
    return {
      loading: false,
      deployData: {},
      deployVisible: false,
    };
  },
  computed: {
    /**
     * 相机类型
     */
    deviceType() {
      switch (this.info.deviceType) {
        case '5': // 人证机集群
          return 'machine';
        case '6': // 眼镜集群
          return 'glasses';
        case '7': // 便携设备
          return 'portface';
        default: // 其余种类的相机
          return 'camera';
      }
    }
  },
  watch: {
    info(val, old) {
      if (val === old) { return; }
      // 全景图逻辑
      if (this.deviceType === 'machine' || this.deviceType === 'glasses' || this.deviceType === 'portface') {
        val.captureFullUrl = fullImageUnsupported;
        val.noFullUrl = true;
      } else if (this.canRemoteFullImage) {
        if (!val.captureFullUrl) {
          this.$set(val, 'captureFullUrl', fullImageEmpty);
        } else if (this.isRemoteFullImageUrl(val.captureFullUrl)) {
          const vm = this;
          this.fetchRemoteFullImageUrl(val.faceId || val.photoCoreId, {
            id: val.faceId || val.photoCoreId,
            fullUri: vm.info.captureFullUrl
          }).then((data) => {
            vm.$set(vm.info, 'captureFullUrl', data);
            console.log(vm.info);
          });
          this.$set(val, 'captureFullUrl', fullImageLoading);
        } else if (this.isCaptureSearchImageUrl(val.captureFullUrl)) {
          const vm = this;
          this.$set(val, 'captureFullUrl', fullImageLoading);
          this.fetchRemoteFullImageUrl(val.faceId || val.photoCoreId, { tutu: true }).then((data) => {
            vm.$set(vm.info, 'captureFullUrl', data);
            console.log(vm.info);
          });
        }
      } else if (!val.captureFullUrl) {
        val.captureFullUrl = fullImageEmpty;
        val.noFullUrl = true;
      }
    }
  },
  created() {
    if (this.canRemoteFullImage) {
      this.initRemoteFullImageFetcher(AlbumRegionSrv.emitRemoteFullImage);
    }
  },
  methods: {
    /**
     * 所选详情变化时
     * @param {index} 详情索引
     */
    onSelectChanged(index, item) {
      this.$emit('change', index, item);
    },
    onDialogClose() {
      this.$emit('update:visible', false);
    },
    /**
     * 打开一键布控弹窗，并设置内容
     * @param {any}
     * @returns
     */
    showDeploy(obj) {
      this.deployData = obj;
      this.deployVisible = true;
    },
    /**
     *  收藏功能
     */
    collectItem(item) {
      this.$emit('collect', item);
    }
  }
};
</script>
<style lang="scss" scoped>
::v-deep .meg-dialog__body{
  padding: 0;
}
::v-deep .meg-dialog__header{
  line-height: 54px;
  font-weight: 700;
  font-size: 16px;
  color: #435068;
}
.card-detail-dialog{
  .tab-title-container span{
    display: inline-block;
    height: 50px;
    line-height: 50px;
    box-sizing: border-box;
    font-size: 16px;
    font-weight:900;
    cursor: pointer;
    color: #435068;
    text-align: center;
    margin-right: 20px;
    &:hover{
      color: #21539B;
    }
    &.active{
      border-bottom: 4px solid #21539B;
      color: #21539B;
    }
  }
  .detail-dialog-body{
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .detail-content-container{
    height: calc(100% - 136px);
  }
  .detail-content-item {
    display: flex;
    width: 1250px;
    height: 100%;
    .compare-info-box{
      display: inline-block;
      width: 300px;
    }
  }
  .detail-bottom-container{
    height: 136px;
    background: #242935 ;
  }
}
.content-left{
  flex: 1;
}

</style>
