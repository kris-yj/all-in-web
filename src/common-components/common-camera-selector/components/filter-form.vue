<template>
  <div class="camera-filter-box">
    <div class="filter-box">
      <div class="placeholder-box">
      </div>
      <div class="filter-body">
        <meg-form
          label-position="top"
          label-width="80px">
          <meg-form-item :label="$t('标签')">
            <meg-cascader
              v-if="isLabels"
              v-model="filterParams.labels"
              size="medium"
              max-width="200px"
              :options="labelOptions"
              :props="props"
              collapse-tags
              clearable></meg-cascader>
          </meg-form-item>
          <meg-form-item :label="$t('区域')">
            <meg-select
              size="medium"
              clearable
              multiple
              collapse-tags
              v-model="filterParams.places">
              <meg-option
                v-for="item in placeOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </meg-option>
            </meg-select>
            <!--
            <meg-cascader
              v-model="filterParams.places"
              :options="placeOptions"
              :props="props"
              collapse-tags
              clearable></meg-cascader>-->
          </meg-form-item>
          <meg-form-item :label="$t('重点单位')">
            <meg-select
              clearable
              multiple
              collapse-tags
              v-model="filterParams.keyUnits">
              <meg-option
                v-for="item in keyUnitOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </meg-option>
            </meg-select>
            <!--
            <meg-cascader
              v-model="filterParams.keyUnits"
              size="medium"
              max-width="200px"
              :options="keyUnitOptions"
              :props="props"
              collapse-tags
              clearable></meg-cascader>-->
          </meg-form-item>
          <meg-form-item
            :label="$t('卡口类型')">
            <meg-select
              clearable
              multiple
              collapse-tags
              v-model="filterParams.types">
              <meg-option
                v-for="item in typeOptions"
                :key="item.code"
                :label="item.value"
                :value="item.code">
              </meg-option>
            </meg-select>
            <!--
            <meg-cascader
              v-model="filterParams.types"
              max-width="200px"
              size="medium"
              :options="typeOptions"
              :props="typeProps"
              collapse-tags
              clearable></meg-cascader>-->
          </meg-form-item>
          <meg-form-item
            :label="$t('相机类型')"
            v-if="isCameraType">
            <meg-select
              clearable
              multiple
              collapse-tags
              v-model="filterParams.cameraType">
              <meg-option
                v-for="item in cameraTypeOptions"
                :key="item.code"
                :label="item.value"
                :value="item.code">
              </meg-option>
            </meg-select>
            <!--
            <meg-cascader
              v-model="filterParams.cameraType"
              max-width="200px"
              size="medium"
              :options="cameraTypeOptions"
              :props="typeProps"
              collapse-tags
              clearable></meg-cascader>-->
          </meg-form-item>
          <meg-form-item class="option-item">
            <meg-button
              type="text"
              @click="reset">
              {{ $t('重置') }}
            </meg-button>
            <meg-button
              type="primary"
              @click="confirm">
              {{ $t('确定') }}
            </meg-button>
          </meg-form-item>
        </meg-form>
      </div>
    </div>
  </div>
</template>
<script>

import { CreateIdMap, CreateLabelMap } from '../../utils/utils';

export default {
  name: 'FilterForm',
  props: {
    value: {
      type: String,
      default: ''
    },
    filterCondition: {
      type: Array,
      default: () => []
    },
    isLabels: {
      type: Boolean,
      default: true,
    },
    isCameraType: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      filterParams: {
        labels: [],
        places: [],
        keyUnits: [],
        types: [],
        cameraType: [],
      },
      props: {
        value: 'id',
        label: 'name',
        children: 'items',
        multiple: true,
        emitPath: false
      },
      typeProps: {
        value: 'code',
        label: 'value',
        children: 'items',
        multiple: true,
        emitPath: false,
      },
    };
  },
  computed: {
    labelOptions() {
      return this.getOptions('labels');
    },
    placeOptions() {
      return this.getOptions('places');
    },
    keyUnitOptions() {
      return this.getOptions('keyUnits');
    },
    typeOptions() {
      return this.getOptions('types');
    },
    cameraTypeOptions() {
      return this.getOptions('cameraTypes');
    },
    labelsMap() {
      return CreateLabelMap(this.labelOptions);
    },
    typesMap() {
      return CreateIdMap(this.typeOptions, 'code', 'value');
    },
    placesMap() {
      return CreateIdMap(this.placeOptions);
    },
    keyUnitsMap() {
      return CreateIdMap(this.keyUnitOptions);
    },
  },
  methods: {
    /**
     * 遍历获取筛选条件
     */
    getOptions(key) {
      let target = [];
      this.filterCondition.forEach((item) => {
        if (item.label === key) {
          target = Array.isArray(item.value) ? [...item.value] : [];
        }
      });
      return target;
    },
    /**
     *  确定提交筛选
     */
    confirm() {
      this.resolveTitle();
      this.$emit('confirm', this.filterParams);
    },
    /**
     * 处理title
     */
    resolveTitle() {
      const { cameraType } = this.filterParams;
      const labelStrArray = this.filterParams.labels.map((labelId) => this.labelsMap[labelId].join('/'));
      const placeStrArray = this.filterParams.places.map((placeId) => this.placesMap[placeId]);
      const keyUnitStrArray = this.filterParams.keyUnits.map((keyUnitId) => this.keyUnitsMap[keyUnitId]);
      const typeStrArray = this.filterParams.types.map((typeId) => this.typesMap[typeId]);
      const cameraStrArray = this.cameraTypeOptions.filter((x) => cameraType.some((y) => x.code === y)).map((item) => item.value);
      this.$emit('input', [
        ...labelStrArray,
        ...placeStrArray,
        ...keyUnitStrArray,
        ...typeStrArray,
        ...cameraStrArray
      ].join(','));
    },
    /**
      * 筛选条件重置
      */
    reset() {
      this.$emit('input', '筛选相机');
      this.filterParams = {
        labels: [],
        places: [],
        keyUnits: [],
        types: [],
        cameraType: [],
      };
    },
  }
};
</script>
<style lang="scss" scoped>
  ::v-deep.meg-cascader{
    width: 100%;
  }
  ::v-deep.meg-select {
    width: 100%;
  }
  ::v-deep.meg-cascader--bg .meg-input__inner {
    background: #fff;
  }
  .option-item{
    display: flex;
    justify-content: flex-end;
  }
  .camera-filter-box{
    position: absolute;
    top: 48px;
    left: 0;
    width: 270px;
    padding: 0 15px;
    background: #fff;
    z-index: 10;
    box-shadow: 0 2px 6px 2px rgba(0,0,0,0.12);
    .filter-box{
      .placeholder-box{
        margin-bottom: 13px;
        border-bottom: 1px solid #F3F3F3;
      }
    }
  }
</style>
