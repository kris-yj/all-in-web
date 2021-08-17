<template>
  <common-form-container
    @reset="resetClick"
    @search="searchClick">
    <template
      slot="header">
      {{ '级联检索' }}
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
          font-size="12px"
          bottom-height="20px"
          selector-mode="single"
          :max-img-num="3"
          :analyze-type="[0]"
          background="face"
          :init-file="initFile"
          @output="photoChange">
        </common-img-analysis>
      </div>
      <meg-form-item
        label="起止时间"
        prop="activeTime">
        <meg-date-picker
          :prefix-icon-visible="false"
          :default-date="'pastWeek'"
          type="datetimerange"
          format="yyyy-MM-dd HH:mm"
          value-format="timestamp"
          v-model="datePickerData"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          range-separator="至"
          :picker-options="{shortcuts: ['today', 'pastThreeDays', 'pastWeek', 'pastMonth']}">
        </meg-date-picker>
      </meg-form-item>
      <meg-form-item
        label="相似度"
        prop="faceThreshold">
        <common-similarity-input v-model="threshold"></common-similarity-input>
      </meg-form-item>
      <meg-form-item :label="$t('下级单位')">
        <meg-treeselect
          ref="tree"
          :placeholder-text="$t('请选择下级单位')"
          :all-selected-text="$t('选择全部')"
          node-key="regId"
          :standard-tree-data="true"
          :props="{label:'nodeName',children:'child'}"
          :data="cascadeList"
          :show-checkbox="true"
          :record-dynamic-select="true"
          :check-on-click-node="true"
          :default-checked-all="true">
        </meg-treeselect>
      </meg-form-item>
    </meg-form>
  </common-form-container>
</template>

<script>
import moment from 'moment';
import CommonFormContainer from '@/common-components/common-form-container';
import CommonSimilarityInput from '@/common-components/common-similarity-input';
import CommonImgAnalysis from '@/common-components/common-img-analysis';
import CascadeCaptureSearchSrv from '../cascade-capture-search.service';

export default {
  components: {
    CommonFormContainer,
    CommonSimilarityInput,
    CommonImgAnalysis,
  },
  data() {
    return {
      initFile: [], // 初始化图片上传
      formData: { // 检索表单
        cascadeNodeRegIds: [],
        startTime: moment().subtract(6, 'day').startOf('day').toDate()
          .getTime(),
        endTime: moment().toDate().getTime(),
        threshold: '',
        photos: []
      },
      cascadeList: [], // 下级单位
      autoSearch: false, // 自动触发检索
    };
  },
  computed: {
    // 人脸检索阈值
    threshold: {
      get() {
        if (!this.formData.threshold) return +this.$store.getters.systemByType('galaxy_capture_face_search_threshold').value;
        return this.formData.threshold;
      },
      set(val) {
        this.formData.threshold = val;
      }
    },
    // 时间选择
    datePickerData: {
      get() {
        return [this.formData.startTime, this.formData.endTime];
      },
      set(val) {
        if (val) {
          [this.formData.startTime, this.formData.endTime] = val;
        } else {
          this.formData.startTime = '';
          this.formData.endTime = '';
        }
      }
    }
  },
  mounted() {
    // 获取下级单位
    CascadeCaptureSearchSrv.getCascadeTree().then((res) => {
      if (res.code === 0) {
        this.cascadeList = [res.data];
        // 下级单位初始化完成后处理日志跳转
        if (JSON.stringify(this.$route.query) !== '{}') {
          const routerParams = this.$route.query;
          if (routerParams.id) {
            this.fillBySearchLog(routerParams.id);
          }
        }
      }
    });
  },
  methods: {
    // 根据检索日志回填
    fillBySearchLog(id) {
      CascadeCaptureSearchSrv.getOperationLog({ id }).then((res) => {
        if (res.code === 0) {
          const { param } = JSON.parse(res.data.realParam);
          Object.assign(this.formData, param);
          this.$nextTick(() => {
            this.$refs.tree.setCheckedKeys(param.cascadeNodeRegIds);
            const faceList = [];
            param.photos.forEach((item) => {
              const photoObj = {
                photo: item.photoData,
                goAnalyze: false,
                images: [{
                  feature: item.feature,
                  locator: item.locator,
                  hasCoordinate: !!item.locator.hint,
                  coordinate: item.hint,
                }]
              };
              faceList.push(photoObj);
            });
            this.initFile = faceList;
            this.autoSearch = true;
          });
        }
      });
    },
    // 重置表单
    resetClick() {
      this.$refs.imgAnalysis.reset();
      this.formData = {
        cascadeNodeRegIds: [],
        startTime: moment().subtract(6, 'day').startOf('day').toDate()
          .getTime(),
        endTime: moment().toDate().getTime(),
        threshold: '',
        photos: []
      };
      this.$refs.tree.setCheckedKeys('ALL');
    },
    // 检索
    searchClick() {
      // 验证图片
      this.formData.photos = [];
      const photoList = this.$refs.imgAnalysis.getFileList(true);
      if (!photoList.length) {
        this.$message({
          message: this.$t('请至少选择一张图片'),
          type: 'warning'
        });
        return;
      }
      // 验证其他
      const cascadeNodeRegIds = this.$refs.tree.getCheckedKeys().filter((id) => id !== 0);
      if (!cascadeNodeRegIds.length || !this.formData.startTime || !this.formData.endTime) {
        this.$message({
          message: this.$t('请填充检索条件'),
          type: 'warning'
        });
        return;
      }
      photoList.forEach((photo) => {
        const item = {
          photoData: photo.photo,
          feature: photo.images[0].feature,
          locator: photo.images[0].locator
        };
        if (photo.images[0].hasCoordinate) {
          item.locator.hint = photo.images[0].coordinate;
        }
        if (photo.extra && photo.extra.id) {
          item.id = photo.extra.id;
        }
        this.formData.photos.push(item);
      });
      this.formData.cascadeNodeRegIds = cascadeNodeRegIds;
      this.$emit('search', this.formData);
    },
    // imgAnalysis事件 用于触发自动检索
    photoChange(item) {
      if (this.autoSearch && item.length === this.initFile.length) {
        this.autoSearch = false;
        this.$nextTick(() => {
          this.searchClick();
        });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
  .common-img-analysis-wrapper{
    height: 152px;
    width: 208px;
    margin: 0 auto 20px;
  }
</style>
