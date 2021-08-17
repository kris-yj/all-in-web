<template>
  <common-form-container
    @reset="resetClick"
    @search="searchClick"
    :show-header="showTitle">
    <template
      slot="header">
      {{ '抓拍检索' }}
    </template>
    <meg-form
      ref="searchForm"
      :model="formData"
      class="search-form"
      label-position="top">
      <div
        class="common-img-analysis-wrapper">
        <common-img-analysis
          ref="imgAnalysis"
          :init-file="initFile"
          :drop-file="dropFile"
          :from-history="showHistoryRecord"
          :shield-upload="shieldUpload"
          :analyze-type="analyzeType"
          :upload-prompt-text="uploadPromptText"
          bottom-height="20px"
          font-size="12px"
          :max-img-num="3"
          :background="background"
          @output="photoChange"
          @upload-click="$emit('upload-click')">
        </common-img-analysis>
      </div>
      <search-common-condition
        ref="searchCommonCondition"
        :form-data="formData"
        :source-types="sourceTypes"
        :default-checked-keys="defaultCheckedKeys"
        @get-selected-keys="getSelectedKeys"></search-common-condition>
      <meg-form-item
        label="人脸相似度"
        prop="faceThreshold"
        v-show="!faceThresholdHidden">
        <common-similarity-input v-model="faceThreshold"></common-similarity-input>
      </meg-form-item>
      <meg-form-item
        :label="otherThresholdText || '人机非相似度'"
        prop="otherThreshold"
        v-show="!otherThresholdHidden">
        <common-similarity-input v-model="otherThreshold"></common-similarity-input>
      </meg-form-item>
      <meg-form-item
        prop="deepSearch"
        v-show="showDeepSearch">
        <depth-search-checkbox v-model="formData.deepSearch"></depth-search-checkbox>
      </meg-form-item>
    </meg-form>
  </common-form-container>
</template>

<script>
import CommonFormContainer from '@/common-components/common-form-container';
import CommonSimilarityInput from '@/common-components/common-similarity-input';
import SearchCommonCondition from '@/components/search/search-common-condition';
import CommonImgAnalysis from '@/common-components/common-img-analysis';
import commonSwitchParams from '@/common-components/common-switch-params';
import { getLastNDays } from '@/utils/common.utils.js';
import DepthSearchCheckbox from './depth-search-checkbox';

export default {
  components: {
    CommonFormContainer,
    CommonSimilarityInput,
    DepthSearchCheckbox,
    CommonImgAnalysis,
    SearchCommonCondition
  },
  props: {
    // 图片上传是否展示历史记录
    showHistoryRecord: {
      type: Boolean,
      default: true,
    },
    // 是否屏蔽点击上传
    shieldUpload: {
      type: Boolean,
      default: undefined,
    },
    //  上传图片组件底部提示文字
    uploadPromptText: {
      type: String,
      default: undefined,
    },
    //  识别目标类别
    analyzeType: {
      type: Array,
      default: undefined,
    },
    // 上传图片组件背景
    background: {
      type: String,
      default: undefined,
    },
    // 是否隐藏人脸阈值 （同时隐藏深度检索）
    faceThresholdHidden: {
      type: Boolean,
      default: false,
    },
    // 是否隐藏人机非阈值
    otherThresholdHidden: {
      type: Boolean,
      default: false,
    },
    // 人机非相似度的 label 文字配置
    otherThresholdText: {
      type: String,
      default: undefined,
    },
    // 进入页面是否发起检索
    goInitSearch: {
      type: Boolean,
      default: true,
    },
    // 显示的资源类型
    sourceTypes: {
      type: Array,
      default: undefined,
    }
  },
  data() {
    return {
      formData: {
        sourceType: 'CAMERA',
        taskInfos: [],
        cameraIds: [],
        fileTime: [],
        cameraTime: [],
        startTime: '',
        endTime: '',
        faceThreshold: '',
        otherThreshold: '',
        deepSearch: false,
      },
      initFile: [],
      dropFile: {},
      booleanObj: {
        'true': true,
        'false': false
      },
      defaultCheckedKeys: [],
      autoSearch: false,
      defaultTimeObj: {
        '1': getLastNDays(1), // 今天
        '2': getLastNDays(3), // 近三天
        '3': getLastNDays(7), // 近七天
        '4': getLastNDays(31), // 近一个月
      }
    };
  },
  computed: {
    defaultCameraTime: {
      get() {
        return this.defaultTimeObj[this.$store.getters.systemByType('kunlun_capture_search_default_selection_time').value];
      }
    },
    // 检索埋点id
    searchTrackingId() {
      const map = {
        // PS: 如果复用此检索模块也要添加埋点，则在这里添加 ID 即可
        'capture-search': 'CaptureSearchSearch',
      };
      return map[this.$route.name] || '';
    },
    showTitle() {
      return this.$route.query.pageType !== 'single';
    },
    // 是否显示深度检索
    showDeepSearch() {
      return !this.faceThresholdHidden && this.booleanObj[this.$store.getters.systemByType('deepSearchModel').value];
    },
    // 人脸检索阈值
    faceThreshold: {
      get() {
        if (!this.formData.faceThreshold) return +this.$store.getters.systemByType('galaxy_capture_face_search_threshold').value;
        return this.formData.faceThreshold;
      },
      set(val) {
        this.formData.faceThreshold = val;
      }
    },
    otherThreshold: {
      get() {
        if (!this.formData.otherThreshold) return +this.$store.getters.systemByType('galaxy_capture_other_search_threshold').value;
        return this.formData.otherThreshold;
      },
      set(val) {
        this.formData.otherThreshold = val;
      }
    },
  },
  created() {
    this.formData.cameraTime = this.defaultCameraTime;
  },
  mounted() {
    const { query } = this.$route;
    if (Object.keys(query).length && this.goInitSearch) {
      this.autoSearch = true;
      commonSwitchParams.getOriginalQuery(query).then((params) => {
        this.searchFromQuery = true;
        console.log(params, '跳转检索的query');
        this.dealWithQuery(params);
      });
    }
    if (!Object.keys(query).length) this.searchFromQuery = false;
  },
  methods: {
    /**
     * @description 处理参数
     */
    dealWithQuery(params) {
      let { fileList = [], photos, bodyThreshold } = params;//eslint-disable-line
      const {
        jumpWithImgInfo,
        taskInfos = this.formData.taskInfos,
        sourceType = this.formData.sourceType,
        faceThreshold = this.formData.faceThreshold,
        otherThreshold = this.formData.otherThreshold,
        deepSearch = this.formData.deepSearch
      } = params;
      let { cameraIds = this.formData.cameraIds } = params;
      params = { ...params, ...jumpWithImgInfo };
      if (typeof cameraIds === 'string') {
        cameraIds = [cameraIds];
      }
      // 检索日志跳转抓拍检索
      if (photos) {
        fileList = photos.map((item) => {
          const { featureInfos, searchPhotoUri } = item;
          return {
            images: featureInfos.map((image) => ({ ...image, checked: true })),
            photo: searchPhotoUri,
            couldEdit: false,
          };
        });
      }
      // 单图跳转抓拍检索
      if (jumpWithImgInfo) {
        const { photo } = jumpWithImgInfo;
        fileList = [{
          ...photo,
          photo: jumpWithImgInfo.photoUrl,
        }];
        // if (photo.extra && photo.extra.id) {
        //   fileList[0].couldEdit = false;
        // }
      }
      const { startTime = '', endTime = '' } = params;
      this.formData.sourceType = sourceType;
      this.formData.deepSearch = deepSearch;
      this.faceThreshold = faceThreshold;
      console.log(otherThreshold, bodyThreshold);
      if (bodyThreshold || bodyThreshold === 0) {
        this.otherThreshold = bodyThreshold;
      } else {
        this.otherThreshold = otherThreshold;
      }
      console.log(this.otherThreshold);
      if (sourceType === 'CAMERA') {
        this.formData.cameraIds = cameraIds;
        this.defaultCheckedKeys = cameraIds;
        if (startTime && endTime) {
          this.formData.cameraTime = [startTime, endTime];
        }
      } else if (sourceType === 'OFFLINE') {
        this.formData.taskInfos = taskInfos;
        this.defaultCheckedKeys = taskInfos;
        if (startTime && endTime) {
          this.formData.fileTime = [startTime, endTime];
        }
      }
      if (fileList && fileList.length) {
        console.log(fileList, 'setInitFile');
        this.setInitFile(fileList);
      }
    },
    // 设置外部传入的图片
    setInitFile(files) {
      this.initFile = files;
    },
    // 获取选中的key
    getSelectedKeys(type) {
      console.log(type, this.formData.sourceType, this.searchFromQuery, this.initFile, this.photoChanged);
      // 为了防止有图片设置的时候多次触发
      this.$nextTick(() => {
        if (type === this.formData.sourceType && this.searchFromQuery) {
          if (this.initFile.length && this.photoChanged) {
            this[`${type}UpdateReady`] = true;
            if (this.formData.sourceType !== 'CAMERA' || this.formData.cameraIds.length) {
              this.searchClick();
            }
          } else if (!this.initFile.length) {
            if (this.formData.sourceType !== 'CAMERA' || this.formData.cameraIds.length) {
              this.searchClick();
            }
          }
        } else if (type === this.formData.sourceType && !this.searchFromQuery) {
          this.searchClick();
        }
      });
    },
    // 表单重置
    resetClick() {
      this.$refs.searchForm.resetFields();
      this.$refs.imgAnalysis.reset();
      this.$refs.searchCommonCondition.resetCheckedAll();
    },
    // 表单检索
    searchClick(bool) {
      // 埋点请求
      if (this.searchTrackingId) this.eventTracking(this.searchTrackingId);
      this.formData.faceThreshold = this.faceThreshold;
      this.formData.otherThreshold = this.otherThreshold;
      if (!bool) {
        const commonData = this.$refs.searchCommonCondition.getData(true);
        if (!commonData) return;
        console.log(commonData);
        this.formData = Object.assign(this.formData, commonData);
      }
      this.$nextTick(() => {
        this.$emit('search', this.formData);
      });
      this.searchFromQuery = false;
    },
    getUploadedPhotos() {
      return this.$refs.imgAnalysis.getFileList(true);
    },
    photoChange(item) {
      if (this.autoSearch && item.length === this.initFile.length) {
        this.autoSearch = false;
        this.$nextTick(() => {
          this.photoChanged = true;
          if (this[`${this.formData.sourceType}UpdateReady`]) {
            if (this.formData.sourceType !== 'camera' || this.formData.cameraIds.length) {
              this.searchClick();
            }
          }
        });
      }
    },
    getFileSelectedNodes() {
      return this.$refs.searchCommonCondition.getFileSelectedNodes();
    },
    getCameraSelectedNodes() {
      return this.$refs.searchCommonCondition.getCameraSelectedNodes();
    },
    getComputedPhotos(list = []) {
      if (!list.length) return [];
      return list.map((item) => {
        const {
          photo, images, extra = {}, id = '', detectType
        } = item;
        let featureInfos = [];
        // if (item.resourceType === 3 && item.detectType === 0) {}
        // TODO: 没有判断resourceType
        if ((id || extra.id) && item.detectType !== 0) {
          featureInfos = [{
            id: id || extra.id,
            detectType,
          }];
        } else {
          featureInfos = images.map((cItem) => {
            const {
              detectType, feature, locator,id, licensePlateText, base64//eslint-disable-line
            } = cItem;
            return {
              detectType,
              feature,
              base64: licensePlateText ? '' : base64 || '',
              locator: licensePlateText ? '' : locator || '',
              licensePlateText: licensePlateText || '',
              // id: extra.id || id || '',
            };
          });
        }
        return {
          searchPhotoUri: photo,
          featureInfos: featureInfos || [],
        };
      });
    },
  }
};
</script>

<style lang="scss" scoped>
.common-img-analysis-wrapper {
  height: 152px;
  width: 208px;
  margin: 0 auto 20px;
}
</style>
