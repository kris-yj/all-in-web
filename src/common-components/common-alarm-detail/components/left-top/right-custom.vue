<template>
  <div class="right-custom">
    <common-license-plate
      :plate-number="info.plateNumber"
      :plate-type="info.plateType"
      :row="info.row"
      :size="info.size"></common-license-plate>
  </div>
</template>

<script>
import CommonLicensePlate from '../../../common-license-plate';

export default {
  name: 'RightCustom',
  components: {
    CommonLicensePlate
  },
  props: {
    info: {
      type: Object,
      default: () => {}
    },
  },
};
</script>
<style lang="scss" scoped>
.right-custom {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #f9f9f9;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
