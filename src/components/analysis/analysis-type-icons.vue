<template>
  <div class="type-wrap">
    <span
      class="type"
      v-for="(property, key) in doPropertyIconObj"
      :key="key">
      <meg-icon
        class="type-icon"
        v-if="initPropertyData[key] && key !=='doNonVehicle'"
        :name="property"
        height="14"
        color="#21539b">
      </meg-icon>
      <meg-icon
        class="type-icon"
        v-if="key ==='doNonVehicle' && initPropertyData['doVehicle']"
        :name="property"
        height="14"
        color="#21539b">
      </meg-icon>
    </span>
  </div>
</template>
<script>
export default {
  name: 'AnalysisTypeIcons',
  props: {
    // 传入显示图标的对象
    initPropertyData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      doPropertyIconObj: {
        'doFace': 'card_face',
        'doBody': 'person',
        'doMotor': 'car',
        'doNonMotor': 'non_motor_vehicle'
      },
    };
  },
};
</script>
<style lang="scss" scoped>
  .type-wrap{
    display: inline-block;
    .type{
      display: inline-block;
    }
    .type-icon{
      width: 22px;
    }
  }
</style>
