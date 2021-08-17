<template>
  <div
    ref="template"
    v-loading="isLoading"
    class="template">
    <number-list
      :data="heatData"
      :options="captrueInfoOption"></number-list>

    <div class="capture-situation-map">
      <heatmap-map
        ref="map"
        :feature-data="heatmapData">
        <template v-slot:control>
          <div class="heat-bar">
            <div class="heat-top"></div>
            <div class="heat-bottom"></div>
            <div class="heat-max">
              {{ heatData.heatIntensityMax }}
            </div>
            <div class="heat-min">
              0
            </div>
          </div>
        </template>
      </heatmap-map>
    </div>
  </div>
</template>

<script>
import HeatmapMap from '@/common-components/common-maps/heatmap-map';
import chartOption from '@/components/chart/chart.common';
import NumberList from '@/components/chart/number-list';

export default {
  components: {
    HeatmapMap,
    NumberList
  },
  props: {
    heatData: {
      type: Object,
      default: () => {}
    },
    isLoading: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      deviceNodeData: [],
      captrueInfoOption: [
        {
          icon: 'camera_normal',
          label: this.$t('相机总数'),
          key: 'cameraCount'
        },
        {
          icon: 'location',
          label: this.$t('目标总数'),
          key: 'captureCount'
        },
        {
          icon: 'card_face',
          label: this.$t('人脸总数'),
          key: 'faceCount'
        },
        {
          icon: 'person',
          label: this.$t('人体总数'),
          key: 'bodyCount'
        },
        {
          icon: 'motor-vehicle_menu',
          label: this.$t('机动车总数'),
          key: 'carCount'
        },
        {
          icon: 'non_motor_vehicle',
          label: this.$t('非机动车总数'),
          key: 'nonMotorCount'
        },
      ],
    };
  },
  computed: {
    /**
     * 更新热力图数据
     */
    heatmapData() {
      const list = [];
      this.heatData.records.forEach((item) => {
        if (item.camera.longitude && item.camera.latitude && item.heatIntensity > 0) { // 过滤经纬度为空的相机数据
          list.push({
            lon: item.camera.longitude,
            lat: item.camera.latitude,
            weight: item.heatIntensity
          });
        }
      });
      return list;
    },
  },
  methods: {
    /**
     * 导出报表
     */
    async generatorImage() {
      await this.$refs.map.export();
      const base64 = await chartOption.generatorImage(this.$refs.template);
      this.$refs.map.cancelExport();
      return base64;
    }
  }
};
</script>

<style lang='scss' scoped>
.template {
  display: flex;
  height: calc(100% - 56px);
  flex-direction: column;
  .capture-info-list {
    display: flex;
    height: 72px;
    padding-bottom: 6px;
    .capture-info {
      flex: 1;
      background: #fff;
      margin-left: 6px;
      &:first-child {
        margin-left: 0;
      }
      .capture-info-label {
        padding-top: 15px;
        padding-left: 13px;
        color: #435068;
        padding-bottom: 8px;
        .meg-icon {
          margin-right: 3px;
        }
      }
      .capture-info-value {
        font-size: 24px;
        font-family: 'HEMIHEAD';
        padding-left: 31px;
        color: #21539B;
      }
    }
  }
  .capture-situation-map {
    flex: 1;
    min-height: 0;
    .heat-bar {
      position: absolute;
      bottom: 42px;
      left: 21px;
      background-image:
      linear-gradient(180deg, rgba(255,0,0,0.80) 0%,
      rgba(255,248,0,0.80) 21%,
      rgba(255,248,0,0.80) 27%,
      rgba(0,255,176,0.80) 51%,
      rgba(0,156,255,0.80) 78%,
      rgba(120,121,255,0.80) 99%);
      z-index: 1;
      height: 98px;
      width: 18px;
      border: 1px solid #FFFFFF;
      .heat-max, .heat-min {
        background: #FFFFFF;
        left: calc(100% + 14px);
        min-width: 34px;
        height: 14px;
        font-size: 12px;
        line-height: 14px;
        color: #435068;
        text-align: center;
        position: absolute;
      }
      .heat-max {
        top: -12px;
      }
      .heat-min {
        bottom: -12px;
      }
      .heat-bottom, .heat-top {
        position: absolute;
        width: 14px;
        height: 14px;
        right: -18px;
        overflow: hidden;
        border-left: 1px solid #ffffff;
        &:after {
          width: 12px;
          height: 12px;
          transform: rotate(45deg);
          border: 1px solid #ffffff;
          content: '';
          display: block;
          margin-left: -8px;
        }
      }
      .heat-top {
        top: -8px;
        transform: rotate(45deg);
        &:after{
          background-image: linear-gradient(to bottom, rgba(255,0,0,.8),rgba(255,0,0,.8));
        }
        // transform: rotate(45deg);
      }
      .heat-bottom {
        bottom: -8px;
        transform: rotate(-45deg);
        &:after{
          background-image: linear-gradient(to bottom, rgba(120,121,255,0.80),rgba(120,121,255,0.80));
        }
      }
    }
  }
}
</style>
