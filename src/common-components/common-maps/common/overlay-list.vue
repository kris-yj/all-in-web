<template>
  <meg-overlay-list
    :name="name"
    :auto-fit="autoFit"
    :options="options"
    :capacity="maxFeatureNum"
    :overlay-list="overlayList"
    :visible="isVisible">
    <template v-slot:default="{params}">
      <slot
        name="list"
        :params="params">
      </slot>
    </template>
  </meg-overlay-list>
</template>

<script>
export default {
  props: {
    maxFeatureNum: {
      type: Number,
      default: 5
    },
    isVisible: {
      type: Boolean,
      default: false
    },
    options: {
      type: Object,
      default: () => ({})
    },
    data: {
      type: Array,
      default: () => []
    },
    name: {
      type: String,
      default: 'mapOverlayList'
    },
    autoFit: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {

    };
  },
  computed: {
    overlayList() {
      // 过滤没有经纬度的数据
      const featureArray = this.data.filter((val) => val.lon && val.lat);
      return featureArray.map((item) => ({
        position: [item.lon, item.lat],
        params: item
      }));
    },
  }
};
</script>

<style lang='scss' scoped>

</style>
