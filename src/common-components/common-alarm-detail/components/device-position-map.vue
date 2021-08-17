<template>
  <div class="device-position-map">
    <position-display-map
      ref="map"
      :feature-data="featureData">
      <template #overlay>
        <div class="device-info">
          <div
            v-for="(item, i) in featureData.info"
            :key="i">
            <span class="title">{{ item.name }}:</span>
            <span class="info">{{ item.value }}</span>
          </div>
        </div>
      </template>
    </position-display-map>
  </div>
</template>

<script>
import PositionDisplayMap from '@/common-components/common-maps/position-display-map';

export default {
  components: {
    PositionDisplayMap
  },
  props: {
    info: {
      type: Object,
      default: () => {}
    },
  },
  data() {
    return {

    };
  },
  computed: {
    featureData() {
      return {
        lon: this.info.lon,
        lat: this.info.lat,
        info: [
          { name: this.$t('报警时间'), value: this.info.alarmTime },
          { name: this.$t('相机类型'), value: this.info.cameraTypeName },
          { name: this.$t('相机名称'), value: this.info.cameraName },
          { name: this.$t('区域'), value: this.info.placeName }
        ]

      };
    }
  },
  watch: {
  },
  mounted() {

  },
  destroyed() {

  },
  methods: {

  },
};
</script>

<style lang='scss' scoped>
.device-position-map {
  width: 100%;
  height: 100%;
  .device-info {
    position: relative;
    background: #ffffff;
    padding: 16px;
    font-size: 12px;
    line-height: 24px;
    width: 240px;
    color: #435068;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
    &::after {
      content: "";
      position: absolute;
      bottom: -10px;
      left: calc(50%-10px);
      width: 0;
      height: 0;
      border-top: 10px solid #fff;
      border-left: 10px solid transparent;
      border-right: 10px solid transparent;;
    }
    .title {
      width: 60px;
      margin-right: 12px;
      font-size: 14px;
      color: #869ABB;
      text-align: end;
      display: inline-block;
      vertical-align: top;
    }
    .info {
      width: 168px;
      font-size: 14px;
      display: inline-block;
      overflow-wrap: break-word;
    }
  }
}
</style>
