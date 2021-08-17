<template>
  <common-form-container
    :prompt="$t('回放条件')"
    :button-text="$t('回放')"
    :show-header="false"
    :search-disabled="searchDisabled"
    @search="formSearch"
    @reset="resetForm">
    <div>
      <meg-form
        class="judge-search-form"
        label-position="top"
        label-width="80px"
        :model="activeFormData">
        <meg-form-item class="photo-form-item">
          <div style="height:100%;">
            <common-img-analysis
              ref="peerAnalysis"
              :max-img-num="1"
              selector-mode="single"
              upload-prompt-text="拖拽或点击上传图像"
              :font-size="'14px'"
              bottom-height="20px"
              :init-file="initFile"
              @output="imgFileChange">
            </common-img-analysis>
          </div>
        </meg-form-item>
        <meg-form-item
          :label="$t('起止时间')">
          <meg-date-picker
            v-model="dateValue"
            format="yyyy-MM-dd HH:mm"
            type="datetimerange"
            :prefix-icon-visible="false"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :default-time="['00:00:00','23:59:59']"
            :default-date="'pastWeek'"
            :picker-options="pickerOptions">
          </meg-date-picker>
        </meg-form-item>
        <meg-form-item :label="$t('相机')">
          <common-camera-select
            ref="trackCamera"
            @cameras-updated="camerasUpdated"
            @change="getCameraIds">
          </common-camera-select>
        </meg-form-item>
        <analysis-filter
          ref="analysisFilter"
          :visible.sync="filterVisible"
          :filterloading="filterloading"
          @confirm="filterConfirm">
        </analysis-filter>
      </meg-form>
    </div>
  </common-form-container>
</template>
<script>
import commonSwitchParams from '@/common-components/common-switch-params';
import commonCameraSelect from '@/common-components/common-camera-selector';
import commonImgAnalysis from '@/common-components/common-img-analysis';
import commonFormContainer from '@/common-components/common-form-container';
import TrackSrv from '@/modules/track/track.service.js';
import AnalysisFilter from '@/components/analysis-filter';

const DefaultFormData = function () {
  const DATE = new Date();
  const end = DATE.setHours(23, 59, 59, 999);
  const start = DATE.setHours(0, 0, 0, 0) - 6 * 24 * 60 * 60 * 1000;
  this.cameraIds = [];
  this.startTime = start;
  this.endTime = end;
  this.photos = [];
  this.groupType = 0;
};
export default {
  components: {
    commonImgAnalysis,
    commonCameraSelect,
    AnalysisFilter,
    commonFormContainer
  },
  props: {
    type: {
      type: String,
      default() {
        return 'photo';
      }
    },
    formData: {
      type: Object,
      default() {
        return {};
      }
    },
  },
  data() {
    return {
      filterloading: false,
      dateValue: [],
      searchDisabled: true,
      pickerOptions: {
        shortcuts: [
          'today',
          'pastThreeDays',
          'pastWeek',
          'pastMonth'
        ]
      },
      activeFormData: new DefaultFormData(null),
      initFile: [],
      filterVisible: false,
      filterData: {},
      allCameraIds: [],
      delay: (() => {
        let r = () => {};
        const p = new Promise((_r) => { r = _r; });
        return { r, p };
      })(),
      delay1: (() => {
        let r = () => {};
        const p = new Promise((_r) => { r = _r; });
        return { r, p };
      })()
    };
  },
  computed: {
    faceThreshold() {
      return parseFloat(this.$store.getters.systemByType('galaxy_capture_face_search_threshold').value);
    },
    otherFaceThreshold() {
      return parseFloat(this.$store.getters.systemByType('galaxy_capture_other_search_threshold').value);
    }
  },
  mounted() {
    // 携图跳转接受
    this.reveiverQuery();
  },
  methods: {
    /**
     * 重置
     */
    resetForm() {
      this.$emit('reset-form');
      if (this.$refs.peerAnalysis) this.$refs.peerAnalysis.reset();
      this.activeFormData = new DefaultFormData();
      this.$refs.trackCamera.reset();
      this.dateValue = [new Date(new Date().getTime() - 3600 * 1000 * 24 * 7), new Date()];
    },
    reveiverQuery() {
      const { query } = this.$route;
      commonSwitchParams.getOriginalQuery(query).then((params) => {
        if (Object.keys(params).length === 1 && params.pageType) return;
        const {
          jumpWithImgInfo
        } = params;
        let fileList = [];
        if (jumpWithImgInfo) {
          const { photo } = jumpWithImgInfo;
          fileList = [{
            ...photo,
            photo: jumpWithImgInfo.photoUrl,
          }];
          fileList[0].couldEdit = true;
          fileList[0].goAnalyze = false;
        }
        this.initFile = fileList;
        this.delay1.p.then(() => {
          this.delay.p.then(() => {
            this.formSearch();
          });
        });
      });
    },
    camerasUpdated(nodesData) {
      const ids = nodesData.map((item) => (item.flag === 'camera' ? item.id : null)).filter((val) => val);
      this.allCameraIds = ids;
      if (nodesData.length > 0) this.searchDisabled = false;
      if (this.activeFormData.photos.length > 0) {
        this.delay.r();
      }
    },
    /**
     * 表单确认，如果有图片的话，进入人工筛选阶段
     */
    formSearch() {
      // 获取时间
      if (this.dateValue && this.dateValue[0] && this.dateValue[1]) {
        this.activeFormData.startTime = this.dateValue[0].getTime();
        this.activeFormData.endTime = this.dateValue[1].getTime();
      } else {
        this.$message.warning(this.$t('请选择时间'));
        return;
      }
      // 获取相机
      if (this.activeFormData.cameraIds.length === 0) {
        this.activeFormData.cameraIds = this.allCameraIds;
      }
      if (this.activeFormData.photos.length) {
        this.filterVisible = true;
        this.filterloading = true;
        this.queryCapture();
      } else {
        this.$message.warning(this.$t('请先上传图片'));
      }
    },
    queryCapture() {
      const photos = {
        searchPhotoUri: this.activeFormData.photos[0].searchPhotoUri,
        featureInfos: [this.activeFormData.photos[0].featureInfos]
      };
      const params = {
        cameraIds: this.activeFormData.cameraIds,
        startTime: this.activeFormData.startTime,
        endTime: this.activeFormData.endTime,
        photos: [photos],
        aggType: 'DETECTTYPE',
        sourceType: 'CAMERA',
        faceThreshold: this.faceThreshold,
        bodyThreshold: this.otherFaceThreshold,
        motorThreshold: this.otherFaceThreshold,
        nonMotorThreshold: this.otherFaceThreshold,
        limit: 1000
      };
      TrackSrv.searchByPhotos(params).then((res) => {
        if (res.code === 0) {
          this.filterloading = false;
          this.$refs.analysisFilter.initData(res.data.records);
        }
      });
    },
    /**
     * 人工筛选的确认回调函数
     */
    filterConfirm(arr) {
      // 轨迹回放参数，上传图片
      const flatData = arr.reduce((arc, item) => [...arc, ...item.listResults], []);
      const passByInfos = flatData.map((item) => ({ ...item, photoUrl: item.cropUrl, score: item.showScore }));
      if (arr.length) {
        const [photoInfo] = this.activeFormData.photos;
        this.$emit('confirm', { passByInfos }, photoInfo.photoData);
      }
    },
    getUploadedPhotos() {
      return this.$refs.peerAnalysis.getFileList(true);
    },
    /**
     * 接受相机选择组件的选择的相机Id
     * @param {ids} 相机Id数组
     */
    getCameraIds(ids) {
      this.activeFormData.cameraIds = ids;
    },
    /**
     * 接受图片上传组件的图片结果
     * @param {arr} 图片数组
     */
    imgFileChange(arr) {
      if (!arr.length) {
        this.activeFormData.photos = [];
        return;
      }
      const [photoInfo] = arr;
      console.log('photoInfo', photoInfo);
      const { images } = photoInfo;
      const temp = {
        featureInfos: {
          feature: images[0] && images[0].feature,
          detectType: images[0] && images[0].detectType,
          locator: images[0] && images[0].locator,
          licensePlateText: images[0] && images[0].licensePlateText,
        },
        searchPhotoUri: photoInfo.searchPhotoUri,
        photoData: photoInfo.photo
      };
      if (temp.featureInfos.detectType === undefined) {
        temp.featureInfos.detectType = photoInfo.detectType;
      }
      if (temp.featureInfos.detectType !== 0 && photoInfo.extra && photoInfo.extra.id) {
        temp.featureInfos.id = photoInfo.extra.id;
      }
      this.activeFormData.photos = [temp];
      if (this.activeFormData.photos.length > 0) this.delay1.r();
    },
  }
};
</script>
<style lang="scss" scoped>
.form-item__error {
  color: #f56c6c;
  font-size: 12px;
  line-height: 1;
  padding-top: 4px;
}
.judge-search-form{
  .form-header{
    padding: 9px 0;
    border-bottom: 1px solid #f9f9f9;
    .el-form-item__content{
      display: flex;
      line-height: 40px;
      .form-title{
        flex: 1;
      }
    }

  }
  .photo-form-item{
    margin: 0px auto 30px;
    height: 150px;
    width: 150px;
    div.el-form-item__content{
      height: 100%;
      line-height: 14px;
    }
  }
  .similarity{
    width: 76px;
    .el-input__inner{
      padding: 0;
      text-align: center;
    }
  }
  .search-item-container{
  height: 70px;
}
.search-item-container p{
  line-height: 26px;
  font-size: 12px;
  color: #435068;
}
}
.camera-right-container{
  background: #ffffff;
  border-radius: 10px;
  width: 300px;
  height: 400px;
  padding: 10px;
  box-sizing: border-box;
}
.camera-select-menu{
  position: absolute;
  cursor: pointer;
  right: 7px;
  top: 0;
  display: inline-block;
  width: 20px;
  height: 34px;
  line-height: 34px;
  z-index: 1000;
}
</style>
