<template>
  <meg-form
    ref="searchForm"
    :model="formData"
    :class="['capture-condition__wrap', {'is-text-search': isTextSearch, 'is-show-more': showMoreVal&&!isTextSearch}]"
    label-position="top">
    <div class="condition__left">
      <search-common-condition
        :form-data="isTextSearch?textSearchFormData:formData"
        ref="searchCommonCondition"></search-common-condition>
      <!-- 只有有图检索的时候需要相似度 -->
      <show-more
        class="condition__show-more"
        v-model="showMoreVal">
        <meg-form-item
          label="人脸相似度"
          prop="faceThreshold">
          <common-similarity-input v-model="formData.faceThreshold"></common-similarity-input>
        </meg-form-item>
        <meg-form-item
          label="人机非相似度"
          prop="otherThreshold">
          <common-similarity-input v-model="formData.otherThreshold"></common-similarity-input>
        </meg-form-item>
        <meg-form-item
          prop="deepSearch"
          v-show="showDeepSearch">
          <depth-search-checkbox v-model="formData.deepSearch"></depth-search-checkbox>
        </meg-form-item>
      </show-more>
    </div>
    <!-- 目标属性， 此处的显藏逻辑写在了 /scss/common-css.scss 中 -->
    <div
      class="condition__right">
      <common-property-form
        ref="commonPropertyForm"
        v-model="textSearchFormData.currentTab">
      </common-property-form>
    </div>
  </meg-form>
</template>

<script>
import SearchCommonCondition from '@/components/search/search-common-condition';
import CommonSimilarityInput from '@/common-components/common-similarity-input';
import DepthSearchCheckbox from '@/modules/capture-search/components/depth-search-checkbox.vue';
import CommonPropertyForm from '@/common-components/common-property-form';
import { getLastNDays } from '@/utils/common.utils.js';
import ShowMore from './show-more.vue';

const defaultTimeObj = {
  '1': getLastNDays(1), // 今天
  '2': getLastNDays(3), // 近三天
  '3': getLastNDays(7), // 近七天
  '4': getLastNDays(31), // 近一个月
};

export default {
  components: {
    SearchCommonCondition,
    CommonSimilarityInput,
    DepthSearchCheckbox,
    ShowMore,
    CommonPropertyForm,
  },
  props: {
    isTextSearch: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      formData: {
        sourceType: 'CAMERA',
        fileTime: [],
        cameraTime: [],
        faceThreshold: +this.$store.getters.systemByType('galaxy_capture_face_search_threshold').value,
        otherThreshold: +this.$store.getters.systemByType('galaxy_capture_other_search_threshold').value,
        deepSearch: false
      },
      textSearchFormData: {
        currentTab: 0,
        sourceType: 'CAMERA',
        fileTime: [],
        cameraTime: getLastNDays(7),
      },
      booleanObj: {
        'true': true,
        'false': false
      },
      showMoreVal: false,
    };
  },
  computed: {
    // 是否显示深度检索
    showDeepSearch() {
      return this.booleanObj[this.$store.getters.systemByType('deepSearchModel').value];
    },
  },
  watch: {
    // 由于时间相机文件选择组件是复用的，而有图无图默认时间又不同，所以，这里切换的时候将sourceType调整为一致，避免引起误解
    isTextSearch(val) {
      // 有图 切换到无图
      if (val) {
        this.textSearchFormData.sourceType = this.formData.sourceType;
      } else {
        this.formData.sourceType = this.textSearchFormData.sourceType;
      }
    }
  },
  created() {
    this.formData.cameraTime = defaultTimeObj[this.$store.getters.systemByType('kunlun_capture_search_default_selection_time').value];
  },
  methods: {
    /**
     * 获取检索条件
     * @returns Object
     */
    getCondion() {
      const properties = this.isTextSearch ? this.getProperties() : {};
      const commonCondition = this.$refs.searchCommonCondition.getData(true);
      if (!commonCondition) return undefined;
      const formData = this.isTextSearch ? this.textSearchFormData : this.formData;
      return {
        properties,
        ...formData,
        ...commonCondition,
      };
    },
    /**
     * 获取属性
     * @returns {'attrKey_父级code': 'value'}
     */
    getProperties() {
      const properties = {};
      const propertiesArr = this.$refs.commonPropertyForm.getProperties();
      propertiesArr.forEach((item) => {
        const { value, attrKey, parentInfo = {} } = item;
        if (value && value.length) {
          properties[`${attrKey}_${parentInfo.code}`] = value;
        }
      });
      return properties;
    }
  }
};
</script>

<style lang="scss" scoped>
@import '../scss/common-css.scss';
.capture-condition__wrap{
  @include wrap-style;
  &.is-text-search{
    .condition__show-more{
      display: none;
    }
  }
  .property-form__wrap{
    height: 320px;
  }
  .condition__right{
    border-bottom: none 0;
  }
  .condition__left{
    transition: padding-right ease-out 60s, width ease-out 60s;
  }
  &.is-show-more{
    .condition__left{
      padding-right: 10px;
      transition-duration: 0s;
      width: 330px;
    }
  }
  .search-common-condition{
    width: 320px;
  }
}

::v-deep .search-common-condition .meg-form-item:last-child{
  margin-bottom: 0;
}

</style>
