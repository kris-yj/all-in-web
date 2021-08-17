<template>
  <div class="block">
    <h3
      class="title"
      v-tooltip="true">
      {{ eventInfo.eventName }}
    </h3>
    <div class="block-aside">
      <ul class="list-group">
        <li
          class="list-item"
          v-for="(item, index) in list"
          :key="index">
          <p class="list-label">
            {{ item.label }}
          </p>
          <p
            class="list-value">
            <template v-if="(item.label === '发生时间') && item.value">
              {{ item.value | formatTime }}
            </template>
            <template v-else>
              {{ item.value }}
            </template>
          </p>
        </li>
      </ul>
    </div>
    <div class="map">
      <div class="map-container">
        <position-display-map :feature-data="featureData"></position-display-map>
      </div>
    </div>
  </div>
</template>
<script>
import PositionDisplayMap from '@/common-components/common-maps/position-display-map';

export default {
  name: 'BaseInfo',
  components: {
    PositionDisplayMap,
  },
  props: {
    list: {
      type: Array,
      default: () => ([])
    },
    eventInfo: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    featureData() {
      const ret = {};
      const { latitude, longitude } = this.eventInfo;
      ret.lat = latitude;
      ret.lon = longitude;
      return ret;
    }
  }
};
</script>
<style lang="scss" scoped>
 .block {
    box-sizing: border-box;
    .title {
      height: 56px;
      max-width: 360px;
      box-sizing: border-box;
      padding: 18px 20px 18px 20px;
      background-color: #efefef;
      font-size: 20px;
      color: #435068;
      font-weight: 600;
    }
    .block-aside{
      width: 320px;
      margin-top: 20px;
      padding: 0 20px 0 20px;
      .list-item {
        padding-bottom: 6px;
        display: flex;
        justify-content: flex-start;
        align-items: baseline;
        &:last-child{
          padding-bottom: 0;
        }
        .list-label, .list-value{
          display: inline-block;
        }
        .list-label {
          color: #869ABB;
          width: 70px;
        }
        .list-value {
          width: calc(360px - 70px);
        }
      }
    }
    .map {
      margin-top: 31px;
      padding: 0 20px 0 20px;
      .map-container {
        width: 100%;
        height: 178px;
        background-color: #efefef;
      }
    }
  }
</style>
