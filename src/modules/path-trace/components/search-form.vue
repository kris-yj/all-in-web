<template>
  <common-form-container
    class="trace-search-form"
    :prompt="$t('追踪条件')"
    :button-text="$t('追踪')"
    :show-header="false"
    @search="formSearch"
    @reset="resetForm">
    <meg-form
      ref="traceForm"
      class="form-container"
      label-position="top"
      label-width="80px"
      :model="formContent">
      <meg-radio-group
        class="search-form-type"
        v-model="serachType"
        @change="changeSerachModel">
        <meg-radio
          label="photo">
          选择图片
        </meg-radio>
        <meg-radio
          label="event">
          选择事件
        </meg-radio>
      </meg-radio-group>
      <div
        v-if="serachType === 'photo'">
        <meg-form-item
          class="img-analysis-wrapper">
          <div class="img-analysis-contain">
            <common-img-analysis
              ref="imgAnalysis"
              :max-img-num="1"
              :init-file="initFile"
              upload-prompt-text="拖拽或点击上传图像"
              font-size="12px"
              bottom-height="24px"
              selector-mode="single"
              @output="getImgMsg">
            </common-img-analysis>
          </div>
        </meg-form-item>
        <meg-form-item :label="$t('起始时间')">
          <meg-date-picker
            v-model="capturedTime"
            format="yyyy-MM-dd HH:mm"
            placeholder="选择日期时间"
            type="datetime"
            :clearable="false"
            :style="{width: '100%'}">
          </meg-date-picker>
        </meg-form-item>
        <meg-form-item :label="$t('时间范围')">
          <div class="time-content">
            <meg-select
              class="content-select-title"
              v-model="formContent.timeTitle"
              placeholder="请选择">
              <meg-option
                v-for="item in judgeGlobalTrackingTimeRange"
                :key="item.code"
                :label="item.value"
                :value="item">
              </meg-option>
            </meg-select>
            <meg-select
              class="content-select-time"
              v-model="formContent.timeValue"
              placeholder="请选择">
              <meg-option
                v-for="item in judgeGlobalTrackingTime"
                :key="item.code"
                :label="item.value"
                :value="item">
              </meg-option>
            </meg-select>
          </div>
        </meg-form-item>
        <meg-form-item :label="$t('追踪范围')">
          <meg-select
            v-model="formContent.traceScope"
            placeholder="请选择"
            :style="{width: '100%'}">
            <meg-option
              v-for="item in judgeGlobalTrackingDistance"
              :key="item.code"
              :label="item.value"
              :value="item">
            </meg-option>
          </meg-select>
        </meg-form-item>
        <slot name="camera"></slot>
        <meg-form-item
          prop="hashrate"
          :label="$t('动态解析')">
          <div class="analysis-content">
            <meg-input
              v-model.number="formContent.hashrate"
              placeholder="请输入内容"
              @change="checkType('hashrate')"></meg-input>
            <span class="content-text">路</span>
          </div>
        </meg-form-item>
        <meg-form-item
          prop="faceThreshold"
          :label="$t('人脸相似度')">
          <div class="analysis-content">
            <meg-input
              class="face-similarity"
              v-model.number="formContent.faceThreshold"
              placeholder="请输入内容"
              @change="checkType('faceThreshold')"></meg-input>
            <span class="content-text"> ~ 100</span>
          </div>
        </meg-form-item>
        <meg-form-item
          prop="otherThreshold"
          :label="$t('人机非相似度')">
          <div class="analysis-content">
            <meg-input
              class="face-similarity"
              v-model.number="formContent.otherThreshold"
              placeholder="请输入内容"
              @change="checkType('otherThreshold')"></meg-input>
            <span class="content-text"> ~ 100</span>
          </div>
        </meg-form-item>
      </div>
      <div v-else>
        <meg-form-item
          :label="$t('事件')">
          <meg-select
            v-model="formContent.eventId"
            placeholder="请选择"
            :style="{width: '100%'}">
            <meg-option
              v-for="item in eventList"
              :key="item.value"
              :label="item.eventName"
              :value="item.id">
            </meg-option>
          </meg-select>
        </meg-form-item>
      </div>
    </meg-form>
  </common-form-container>
</template>
<script>
import commonFormContainer from '@/common-components/common-form-container';
import commonSwitchParams from '@/common-components/common-switch-params';
import commonImgAnalysis from '@/common-components/common-img-analysis';
import pathTraceSrv from '../path-trace.service';

const FormConent = function (timeTitle, timeValue, traceScope, faceThreshold, otherThreshold, hashrate) {
  this.startTime = '';
  this.endTime = '';
  this.timeTitle = timeTitle;
  this.timeValue = timeValue;
  this.faceThreshold = faceThreshold;
  this.otherThreshold = otherThreshold;
  this.photos = [];
  this.hashrate = hashrate;
  this.traceScope = traceScope;
};
export default {
  components: {
    commonFormContainer,
    commonImgAnalysis
  },
  props: {
  },
  data() {
    return {
      formContent: {},
      capturedTime: new Date(),
      dateValue: '',
      serachType: 'photo',
      eventList: [],
      value: '',
      initFile: []
    };
  },
  computed: {
    judgeGlobalTrackingDistance() {
      return this.$store.getters.dataMapByType('kunlun_judge_global_tracking_distance');
    },
    judgeGlobalTrackingTimeRange() {
      return this.$store.getters.dataMapByType('kunlun_judge_global_tracking_time_range');
    },
    judgeGlobalTrackingTime() {
      return this.$store.getters.dataMapByType('kunlun_judge_global_tracking_time');
    },
    defaultTrackingTimeRange() {
      const timeRangeSeted = this.$store.getters.systemByType('kunlun_default_tracking_time_range');
      return this.judgeGlobalTrackingTimeRange.find((item) => item.code === timeRangeSeted.value);
    },
    defaultGlobalTrackingTime() {
      const timeSeted = this.$store.getters.systemByType('kunlun_judge_global_tracking_time');
      return this.judgeGlobalTrackingTime.find((item) => item.code === timeSeted.value);
    },
    defaultTrackingMapRange() {
      const trackingMapRange = this.$store.getters.systemByType('kunlun_default_tracking_map_range');
      console.log(trackingMapRange);
      return this.judgeGlobalTrackingDistance.find((item) => item.code === trackingMapRange.value);
    },
    faceThreshold() {
      return parseFloat(this.$store.getters.systemByType('galaxy_capture_face_search_threshold').value);
    },
    otherThreshold() {
      return parseFloat(this.$store.getters.systemByType('galaxy_capture_other_search_threshold').value);
    },
    hashrate() {
      return parseFloat(this.$store.getters.systemByType('kunlun_analytical_power').value);
    }
  },
  created() {
    this.initForm();
    this.reveiverQuery();
  },
  methods: {
    reveiverQuery() {
      const { query } = this.$route;
      commonSwitchParams.getOriginalQuery(query).then(async (params) => {
        if (Object.keys(params).length === 1 && params.pageType) return;
        if (params.eventId) {
          this.serachType = 'event';
          await this.getEventList();
          this.formContent.eventId = params.eventId;
          this.formSearch();
        } else {
          const {
            jumpWithImgInfo,
          } = params;
          let fileList = [];
          if (jumpWithImgInfo) {
            const { photo, cameraId, capturedTime } = jumpWithImgInfo;
            fileList = [{
              ...photo,
              photo: jumpWithImgInfo.photoUrl,
            }];
            if (photo.extra && photo.extra.id) {
              fileList[0].couldEdit = false;
            }
            if (capturedTime) this.capturedTime = new Date(capturedTime);
            if (cameraId) this.$emit('set-camera-id', cameraId);
          }
          this.initFile = fileList;
        }
      });
    },
    initForm() {
      console.log(this.defaultTrackingMapRange);
      this.formContent = new FormConent(this.defaultTrackingTimeRange, this.defaultGlobalTrackingTime, this.defaultTrackingMapRange, this.faceThreshold, this.otherThreshold, this.hashrate);
    },
    getUploadedPhotos() {
      return this.$refs.imgAnalysis.getFileList(true);
    },
    resetForm() {
      this.initForm();
      this.capturedTime = new Date();
      if (this.$refs.imgAnalysis) this.$refs.imgAnalysis.reset();
      this.$emit('reset-form');
    },
    formSearch() {
      if (this.serachType === 'photo') {
        if (this.formContent.photos.length === 0) {
          this.$message.warning(this.$t('您请上传图片'));
          return;
        }
        this.$refs.traceForm.validate((valid) => {
          if (valid) {
            // 时间转换
            this.getTraceTime();
            this.$emit('form-search', 'photo', this.formContent);
          }
        });
      } else {
        this.$emit('form-search', 'event', {
          ...this.formContent,
          traceScope: {
            code: 100
          }
        });
      }
    },
    checkType(type) {
      if (type === 'otherThreshold' || type === 'faceThreshold') {
        if (!(typeof this.formContent[type] === 'number' && this.formContent[type] >= 0 && this.formContent[type] <= 100)) {
          this.formContent[type] = this[type];
        }
      } else {
        if (!(typeof this.formContent[type] === 'number' && this.formContent[type] >= 0)) { // eslint-disable-line
          this.formContent[type] = this[type];
        }
      }
    },
    getTraceTime() {
      if (!this.capturedTime) return;
      const capturedTime = new Date(this.capturedTime).getTime();
      let startTime = '';
      let endTime = '';
      const timeTitle = this.formContent.timeTitle.code;
      const timeValue = parseFloat(this.formContent.timeValue.code) * 1000;
      if (timeTitle === '0') {
        startTime = capturedTime - timeValue;
        endTime = capturedTime;
      } else if (timeTitle === '1') {
        startTime = capturedTime;
        endTime = capturedTime + timeValue;
      } else {
        startTime = capturedTime - timeValue;
        endTime = capturedTime + timeValue;
      }
      this.formContent.startTime = startTime;
      this.formContent.endTime = endTime;
    },
    changeSerachModel(type) {
      if (type === 'photo') this.initForm();
      else {
        // 事件模式，禁用地图操作
        this.$emit('disabled-map');
        this.formContent = { eventId: '' };
        this.getEventList();
      }
    },
    getEventList() {
      const params = {
        pageSize: 10000
      };
      return pathTraceSrv.getEventList(params).then((res) => {
        if (res.code === 0) {
          this.eventList = res.data.records;
        }
      });
    },
    getImgMsg(file) {
      if (file.length === 0) {
        this.formContent.photos = [];
        return;
      }
      const [obj] = file;
      const featureInfos = obj.images.map((item) => ({
        detectType: item.detectType,
        feature: item.feature,
        locator: item.locator,
      }));
      const temp = {
        searchPhotoUri: obj.photo,
        featureInfos
      };
      this.formContent.photos = [temp];
    }
  }
};
</script>
<style lang="scss" scoped>
.trace-search-form {
  width: 320px;
  .form-container {
    .img-analysis-wrapper {
      display: flex;
      justify-content: center;
    }
    .img-analysis-contain {
      width: 158px;
      height: 158px;
    }
    .search-form-type {
      padding-bottom: 20px;
    }
    .time-content {
      display: flex;
      .content-select-title {
        width: 160px;
        margin-right: 10px;
      }
      .content-select-time {
        width: 99px;
      }
    }
    ::v-deep .meg-input--suffix .meg-input__inner {
      background: #F7F8F9;
    }
    .analysis-content {
      display: flex;
      .content-text {
        font-family: SourceHanSansCN-Regular;
        font-size: 14px;
        color: #435068;
        letter-spacing: 0;
        margin-left: 6px;
      }
      .face-similarity {
        width: 98px;
      }
    }
  }
}
</style>
