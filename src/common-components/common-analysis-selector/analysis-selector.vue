<template>
  <meg-dialog
    class="face-body-selector"
    :title="$t('目标选择')"
    v-bind="dialogProps"
    visible
    append-to-body
    v-on="$listeners">
    <structuring-selector
      ref="coreSelector"
      class="core-selector"
      v-loading="selectorLoading"
      :img-url="imgUrl"
      :list="list"
      :enlarge="enlarge"
      :loading="loading"
      :show-license-plate="showLicensePlate"
      :mode="mode"
      :slot-on="slotOn"
      :show-quality="showQuality"
      :low-quality-available="lowQualityAvailable"
      v-on="Object.assign({}, $listeners, { change: valueChange })">
      <slot></slot>
    </structuring-selector>
    <div
      slot="footer"
      class="dialog-footer">
      <meg-button
        type="primary"
        :disabled="disabled"
        @click="sendSelectedValue">
        {{ $t('确定') }}
      </meg-button>
      <meg-button @click="$emit('close')">
        {{ $t('取消') }}
      </meg-button>
    </div>
  </meg-dialog>
</template>
<script>
import StructuringSelector from './structuring-selector';

export default {
  name: 'CommonAalysisSelector',
  components: {
    StructuringSelector
  },
  props: {
    imgUrl: {
      type: String,
      default: ''
    },
    list: {
      type: Array,
      default: () => ([])
    },
    loading: {
      type: Boolean,
      default: false
    },
    selectorLoading: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      default: 'multi'
    },
    slotOn: {
      type: Boolean,
      default: false
    },
    lowQualityAvailable: { // 低质量是否可选中
      type: Boolean,
      default: true
    },
    enlarge: {
      type: Number,
      default: 1
    },
    showQuality: {
      type: Boolean,
      default: false
    },
    showLicensePlate: { // 是否显示车牌
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      choseStructure: [],
    };
  },
  computed: {
    // meg-dialog组件的属性
    dialogProps() {
      return {
        width: '1100px',
        ...this.$attrs
      };
    },
    disabled() {
      return !this.choseStructure.some((item) => item.checked);
    }
  },
  watch: {
  },
  methods: {
    // 转换坐标数据
    switchLabelValue(item) {
      const { imgSize: { width, height }, absLabelValue } = item;
      const coordinate = {
        leftEyePupil: {},
        rightEyePupil: {},
        mouthLeftCorner: {},
        mouthRightCorner: {}
      };
      Object.values(coordinate).forEach((pupil, index) => {
        const { left, top } = absLabelValue[index];
        Object.assign(pupil, {
          leftPixels: parseInt(left * width, 10),
          topPixels: parseInt(top * height, 10)
        });
      });
      return coordinate;
    },
    // 核心组件数据变化时调用
    valueChange(value) {
      if (value) {
        value.forEach((item) => {
          if (item.detectType === 0) {
            item.hasCoordinate = Boolean(item.labelValue && item.labelValue.length === 4);
            if (!item.coordinate && item.hasCoordinate) {
              item.coordinate = this.switchLabelValue(item);
            }
          }
        });
        this.choseStructure = value;
      }
    },
    // 发送选中的数据
    sendSelectedValue() {
      if (this.disabled) return;
      this.$emit('send', this.choseStructure);
    }
  }
};
</script>
<style lang="scss" scoped>
.face-body-selector {
  .core-selector {
    margin-top: -20px;
    height: 516px;
  }
}
</style>
