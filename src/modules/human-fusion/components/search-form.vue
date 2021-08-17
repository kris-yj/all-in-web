<template>
  <div class="seach-form">
    <meg-form-container
      :button-text="$t('检索')"
      @search="formSearch"
      @reset="resetForm">
      <div
        slot="header"
        class="form-title">
        {{ $t('脸人融合') }}
      </div>
      <meg-dropdown
        slot="title"
        trigger="click"
        @command="changeType"
        placement="bottom">
        <span class="el-dropdown-link">
          {{ searchText }}
          <meg-icon
            name="caret_down"
            class="meg-icon--right"></meg-icon>
        </span>
        <meg-dropdown-menu slot="dropdown">
          <meg-dropdown-item :command="{type: 'body', text: $t('人体搜档')}">
            {{ $t('人体搜档') }}
          </meg-dropdown-item>
          <meg-dropdown-item :command="{type: 'face', text: $t('人脸搜档')}">
            {{ $t('人脸搜档') }}
          </meg-dropdown-item>
        </meg-dropdown-menu>
      </meg-dropdown>
      <meg-form
        ref="humanSearch"
        slot="otherFormElement"
        class="judge-search-form"
        label-position="top"
        label-width="80px"
        :rules="humanRule"
        :model="activeFormData">
        <meg-form-item class="photo-form-item">
          <div
            style="height:100%;"
            @mouseenter="enterUpdatedImg">
            <common-img-analysis
              ref="imgAnalysis"
              :max-img-num="1"
              font-size="12px"
              bottom-height="24px"
              selector-mode="single"
              :init-file="initFile"
              :background="searchType"
              default-show-selector
              upload-prompt-text="拖拽或点击上传图像"
              slot-on
              :analyze-type="searchType === 'face' ? [0] : [1]"
              @output="imgFileChange">
              <div style="width: 220px">
                <meg-form-item
                  v-if="searchType === 'body'"
                  :label="$t('抓拍时间')">
                  <meg-date-picker
                    v-model="initDateValue"
                    type="datetime"
                    :clearable="false"
                    @change="dateChange">
                  </meg-date-picker>
                </meg-form-item>
                <meg-form-item
                  v-if="searchType === 'body'"
                  :label="$t('抓拍相机')">
                  <common-camera-select
                    ref="analysisCameraSelect"
                    :default-ids="analysisDefaultIds"
                    :default-params="{types: ['1','2','3','4','11','12','13','14'],deviceType:1,hideUnit: false }"
                    @change="cameraSelectChange"></common-camera-select>
                </meg-form-item>
              </div>
            </common-img-analysis>
          </div>
        </meg-form-item>
        <meg-form-item
          v-if="searchType === 'body'"
          :label="$t('起止时间')">
          <meg-date-picker
            v-model="activeFormData.dateValue"
            ref="megDatePicker"
            format="yyyy-MM-dd HH:mm"
            :default-time="['00:00:00','23:59:59']"
            type="datetimerange"
            :default-date="'pastWeek'"
            :range-separator="$t('至')"
            :start-placeholder="$t('开始日期')"
            :end-placeholder="$t('开始日期')"
            :picker-options="pickerOptions">
          </meg-date-picker>
        </meg-form-item>
        <meg-form-item
          ref="camraItem"
          v-if="searchType === 'body'"
          :label="$t('相机')">
          <common-camera-select
            ref="cameraSelect"
            :default-params="{types: ['1','2','3','4','11','12','13','14'],deviceType:1,hideUnit: false }"
            @cameras-updated="camerasUpdated"
            @change="cameraChange">
          </common-camera-select>
        </meg-form-item>
      </meg-form>
    </meg-form-container>
  </div>
</template>

<script>
import commonImgAnalysis from '@/common-components/common-img-analysis';
import commonCameraSelect from '@/common-components/common-camera-selector';
import commonSwitchParams from '@/common-components/common-switch-params';
import humanFusionSrv from '../human-fusion.service';
import humanRule from '../human-fusion.rule.js';

const DefaultFormData = function () {
  this.cameraIds = [];

  this.photo = '';
  this.dateValue = [];
  this.feature = null;
  this.landmark = null;
  this.bodyId = null;
};
export default {
  components: {
    commonCameraSelect,
    commonImgAnalysis
  },
  props: {
    cameraList: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      searchType: 'body',
      searchText: '人体搜档',
      humanRule,
      pickerOptions: {
        shortcuts: [
          'today',
          'pastThreeDays',
          'pastWeek',
          'pastMonth'
        ]
      },
      initDateValue: '',
      activeFormData: new DefaultFormData(),
      initFile: [],
      dropFile: [],
      initSelectIds: [],
      allCameraIds: [],
      defaultIds: [],
      analysisDefaultIds: [],
      defaultShowSelectFace: true,
      bodyId: null
    };
  },
  computed: {
    uploadPromptText() {
      return this.searchType === 'body' ? this.$t('点击或拖拽上传人体') : this.$t('点击或拖拽上传人像');
    },
    queryData() {
      return this.$route.query;
    },
    /**
     * @description 时间阈值
     */
    relatedTime() {
      return this.$store.getters.systemByType('duration_facebody_xzone').value;
    },
  },
  watch: {
    searchType(val) {
      if (val === 'body') this.defaultShowSelectFace = true;
      else this.defaultShowSelectFace = false;
    }
  },
  mounted() {
    // 携图跳转
    this.reveiverQuery();
  },
  methods: {
    resetForm() {
      this.activeFormData = new DefaultFormData();
      this.$nextTick(() => {
        this.$refs.imgAnalysis.reset();
        this.$refs.humanSearch.clearValidate();
        if (this.$refs.cameraSelect) this.$refs.cameraSelect.reset();
      });
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
          if (photo.extra && photo.extra.id) {
            fileList[0].couldEdit = false;
          }
        }
        this.initFile = fileList;
      });
    },
    formSearch() {
      if (this.searchType === 'body') {
        this.checkBodyMsg();
      } else {
        this.checkFaceMsg();
      }
    },
    camerasUpdated(nodesData) {
      const ids = nodesData.reduce((arc, item) => (item.flag === 'camera' ? [item.id, ...arc] : arc), []);
      this.allCameraIds = ids;
    },
    dateChange() {
      const initDate = [new Date(this.initDateValue.getTime() - 60 * 1000 * this.relatedTime), new Date(this.initDateValue.getTime() + 60 * 1000 * this.relatedTime)];
      this.activeFormData.dateValue = initDate;
    },
    resetDefaultIds() {
      this.analysisDefaultIds = [];
    },
    cameraSelectChange(ids) {
      this.initSelectIds = ids;
      this.analysisDefaultIds = ids;
    },
    checkBodyMsg() {
      // 判断是否有选择相机，如果没有默认发送全部相机
      if (this.activeFormData.cameraIds.length === 0) {
        this.activeFormData.cameraIds = this.allCameraIds;
      }
      if (!(this.activeFormData.dateValue && this.activeFormData.dateValue[0] && this.activeFormData.dateValue[1])) {
        this.$message.warning(this.$t('请选择时间'));
        return;
      }
      this.$refs.humanSearch.validate((valid) => {
        if (!this.activeFormData.photo) {
          this.$message.error('请上传图片信息');
          return;
        }
        if (valid) {
          this.$emit('search-data', 'body', this.activeFormData);
        } else {
          console.log('error submit!!');
        }
      });
    },
    checkFaceMsg() {
      if (this.activeFormData.photo && this.activeFormData.landmark) {
        this.$emit('search-data', 'face', this.activeFormData);
      } else {
        this.$message.error('请上传图片信息');
      }
    },
    changeType(command) {
      this.searchType = command.type;
      this.searchText = command.text;
      this.$refs.imgAnalysis.reset();
    },
    cameraChange(ids) {
      this.cameraError = false;
      this.activeFormData.cameraIds = ids;
    },
    getSearchCamera() {
      const params = this.initSelectIds;
      humanFusionSrv.searchCamera(params).then((res) => {
        // 获取小时空相机之后清空选择的相机参数
        this.initSelectIds = [];
        if (res.code === 0) {
          const cameraIds = res.data.reduce((arc, item) => (arc.includes(item.cameraId) ? arc : [...arc, item.cameraId]), []);
          let AssociatedCameraIds = res.data.map((item) => (item.cameraIdChildren ? item.cameraIdChildren : null)).filter((item) => item);
          AssociatedCameraIds = Array.from(new Set(AssociatedCameraIds));
          const allCameraIds = [...cameraIds, ...AssociatedCameraIds, ...params];
          this.$nextTick(() => {
            this.defaultIds = allCameraIds;
            this.$refs.cameraSelect.setCheckedKeys(allCameraIds);
            this.initHourSpaceMsg();
          });
        }
      });
    },
    enterUpdatedImg() {
      if (this.searchType === 'body') this.defaultShowSelectFace = true;
    },
    /**
     * 接受图片上传组件的图片结果
     * @param {arr} 图片数组
     */
    imgFileChange(arr) {
      if (this.initSelectIds.length > 0) {
        this.getSearchCamera();
      }
      if (arr.length === 0) {
        this.activeFormData.photo = '';
        this.activeFormData.landmark = null;
        this.activeFormData.feature = null;
        return;
      }
      const [photoInfo] = arr;
      const { images } = photoInfo;
      this.activeFormData.photo = photoInfo.photo;
      this.activeFormData.uploadPhoto = images[0] && images[0].base64;
      if (this.searchType === 'body' && images[0].detectType === 0) {
        this.initFile = [];
        this.$message.error('请上传人体图片');
        return;
      }
      if (this.searchType === 'face') {
        this.activeFormData.landmark = images[0] && images[0].locator.landmark;
      } else {
        this.activeFormData.feature = (images[0] && images[0].feature);
      }
    },
    initHourSpaceMsg() {
      this.initDateValue = '';
      if (this.$refs.analysisCameraSelect) this.$refs.analysisCameraSelect.setCheckedKeys(null);
    }
  }
};
</script>
<style lang='scss' scoped>
::v-deep .meg-form-item__content{
  height: 100%;
  .uploadPromptText{
    top: 80%;
  }
}
::v-deep .meg-form-item__content{
  height: 100%;
  .img-upload .upload-select .upload-container .upload-prompt-text {
    top: 80%;
  }
}
::v-deep .meg-form-item__label{
  float: none;
}
::v-deep .meg-camera-select{
  background: white;
}
.seach-form{
  width: 320px;
  .judge-search-form {
    padding: 20px 25px 0;
  }
  .form-title{
    width: 100%;
    height: 56px;
    line-height: 56px;
    padding-left: 20px;
    background: #EEEEEE;
    font-size: 16px;
    color: #435068;
    font-family: SourceHanSansCN;
    font-weight: 900;
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
  .form-item-error {
    color: #f05353;
    line-height: 1;
    font-size: 12px;
    padding-top: 4px;
  }
}
</style>
