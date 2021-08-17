<template>
  <div
    class="structure-group"
    v-if="list.length">
    <div class="type-tittle">
      {{ structureType }}
    </div>
    <template
      v-for="(item,index) in list">
      <meg-checkbox
        class="structure-item"
        :key="''+index+item.detectType"
        :disabled="disabled(item)"
        v-model="item.checked"
        @change="$emit('change-check',index,type,item.checked)">
        <div
          class="structure-card"
          :style="'border: 1px solid rgba('+(item.textUp?'33, 83, 155, 1':'210, 214, 222, .6')+');'"
          @mousemove="item.textUp = true"
          @mouseout="item.textUp = false">
          <meg-img-container
            v-if="type!=='motorLicensePlate'&&type!=='nonMotorizedLicenseplate'"
            :img-src="item.base64">
            <template #operate-one>
              <span
                v-if="!item.pass && (item.detectType === 0 || showQuality)"
                class="quality-flag">{{ $t('低质量') }}</span>
            </template>
          </meg-img-container>
          <common-license-plate
            v-else
            :plate-number="item.property.license_plate_text&&item.property.license_plate_text.showValue"
            :plate-type="item.property.license_plate_color&&item.property.license_plate_color.showValue"
            :row="item.property.license_plate_style&&item.property.license_plate_style.showValue"
            size="small"></common-license-plate>
          <span
            v-if="item.detectType === 0 && !disabled(item)"
            class="select-bar"
            :style="'height:'+(item.textUp?'20px':'0px')"
            @click.stop="$emit('click-track',index,type)">{{ $t('标注人脸') }}</span>
        </div>
      </meg-checkbox>
    </template>
  </div>
</template>

<script>
import CommonLicensePlate from '@/common-components/common-license-plate';

export default {
  name: 'StructureGroup',
  components: {
    CommonLicensePlate
  },
  props: {
    list: {
      type: Array,
      default: () => ([])
    },
    type: {
      type: String,
      default: ''
    },
    showQuality: {
      type: Boolean,
      default: false
    },
    lowQualityAvailable: { // 低质量是否可选中
      type: Boolean,
      default: true
    },
  },
  data() {
    return {

    };
  },
  computed: {
    structureType() {
      return this.mapDetectType(this.type);
    },
  },
  watch: {

  },
  mounted() {

  },
  destroyed() {

  },
  methods: {
    mapDetectType(detectType) {
      switch (detectType) {
        case 'faceList': return '人脸';
        case 'bodyList': return '人体';
        case 'motorList': return '机动车';
        case 'nonMotorList': return '非机动车';
        case 'motorLicensePlate': return '机动车车牌';
        case 'nonMotorizedLicenseplate': return '非机动车车牌';
        default: return '';
      }
    },
    disabled(item) {
      return this.lowQualityAvailable ? false : !item.pass;
    }
  },
};
</script>

<style lang='scss' scoped>
.structure-group {
  padding-left: 5px;
  @mixin abs-cover($position: top) {
    position: absolute;
    left: 0;
    #{$position}: 0;
    width: 100%;
    height: 100%;
  }
  ::v-deep .quality-flag {
    @include abs-cover(bottom);
    height: 20px;
    line-height: 20px;
    color: #fff;
    text-align: center;
    background: rgba(0,0,0,.3);
  }
  .type-tittle {
    margin-top: 16px;
    font-weight: bold;
    margin-bottom: 10px;
  }
  .structure-item {
    display: inline-block;
    margin-right: 10px;
    margin-bottom: 10px;
    width: 90px;
    height: 90px;
    position: relative;
    .select-bar {
      background-color: #21539b;
      text-align: center;
      height: 0px;
      line-height: 20px;
      overflow: hidden;
      position: absolute;
      bottom: 0;
      right: 0;
      width: 100%;
      transition: height 0.5s;
      z-index: 1;
      font-size: 12px;
      color: #ffffff;
    }
    .structure-card {
      position: absolute;
      top:-5px;
      left: -5px;
      width: 100%;
      height: 100%;
      border: 1px solid rgba(210, 214, 222, .6);
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
  }
}
</style>
