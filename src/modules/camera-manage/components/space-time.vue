<template>
  <meg-dialog
    class="space-time"
    width="1440px"
    :visible="visible"
    :show-close="false"
    @close="cancelDialog">
    <div
      class="title-content"
      slot="title">
      <div>
        <span class="title">{{ $t('小时空') }}</span>
        <span class="tips">
          {{ $t('注：由于GIS的弧面经纬度和平面距离计算体系存在一定的映射精度问题，因此小时空的区域是存在一定的误差的。典型情况下0.00001的误差为1.11米。') }}
        </span>
      </div>
      <div class="button-group">
        <meg-button
          type="primary"
          :loading="buttonLoading"
          @click="save">
          {{ $t('保存') }}
        </meg-button>
        <meg-button @click="cancelDialog">
          {{ $t('取消') }}
        </meg-button>
      </div>
    </div>
    <div class="left-content">
      <div class="select-box-top">
        <span>{{ $t('相机列表') }}</span>
      </div>
      <meg-tree
        ref="tree"
        :show-search="false"
        :data="selectedCamera"
        :highlight-current="false"
        :standard-tree-data="true"
        :props="defaultProps"
        :expand-on-click-node="false"
        @node-click="nodeClick">
      </meg-tree>
    </div>
    <div class="right-content">
      <camera-space-time-map
        ref="cameraSpaceTimeMap"
        :camera-info="cameraInfo"
        @radius-change="onRadiusChange"></camera-space-time-map>
    </div>
  </meg-dialog>
</template>

<script>
import CameraSpaceTimeMap from '@/common-components/common-maps/camera-space-time-map';

export default {
  name: 'SpaceTime',
  components: {
    CameraSpaceTimeMap
  },
  props: {
    cameraInfo: {
      type: Object,
      default: () => {}
    },
    visible: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      buttonLoading: false,
      defaultProps: {
        children: 'items',
        label: 'name'
      },
      selectedCamera: [], // 选中的设备列表
      radius: '',
    };
  },
  computed: {},
  watch: {
    visible(val) {
      if (val) {
        setTimeout(() => {
          this.$refs.cameraSpaceTimeMap.setFeatures(this.allCameraData);
        }, 20);
      }
    }
  },
  created() {
    this.allCameraData = [];
  },
  mounted() {

  },

  methods: {
    /**
     * 外部设置渲染设备点
     */
    setFeatures(data) {
      this.allCameraData = data;
    },
    /**
     * @description 监听变化地图选中变化,并存储半径
     * @param {array} featureData 特征集合
     * @returns
     */
    selectedChange(featureData, radius) {
      this.selectedCamera = featureData;
      this.radius = radius.toFixed(6);
    },
    /**
     * @description 控制地图渲染
     * @param {array} data 相机数组
     */
    renderFeatures(data) {
      this.selectedCamera = data;
      this.$refs.cameraSpaceTimeMap.setSelectedFeatureData(data);
    },
    /**
     * @description 监听地图并存储半径
     * @param {number} radius 半径
     * @returns
     */
    onRadiusChange(radius) {
      this.radius = radius.toFixed(6);
      this.$emit('calculate-camera-space', {
        shapeType: 1,
        shapeValue: this.radius,
        id: this.cameraInfo.id
      });
    },
    /**
     * @description 保存小时空编辑结果
     */
    save() {
      this.$emit('save-space-time', {
        shapeType: 1,
        shapeValue: this.radius || this.cameraInfo.shapeValue,
        id: this.cameraInfo.id
      });
    },
    /**
     * @description 关闭弹窗
     */
    cancelDialog() {
      this.$emit('update:visible', false);
    },
    nodeClick(data) {
      this.$refs.cameraSpaceTimeMap.moveTo(data);
    }
  },
};
</script>
<style lang="scss" scoped>
.space-time {
  ::v-deep .meg-dialog__body {
    padding: 0;
    display: flex;
    height: 700px;
  }
  .title-content {
    display: flex;
    line-height: 55px;
    justify-content: space-between;
    .title {
      font-size: 18px;
      color: #435068;
      font-weight: 700;
    }
    .tips {
      font-size: 14px;
      color: #B3B3B3;
      margin-left: 8px;
    }
  }
  .left-content {
    width: 320px;
    display: flex;
    flex-direction: column;
    .meg-tree {
      flex: 1;
      margin: 0 37px;
    }
    .select-box-top {
      margin: 0 30px;
      font-size: 16px;
      color: #435068;
      border-bottom: solid 1px #f3f3f3;
      padding: 17px 0;
    }
  }
  .right-content {
    flex: 1;
    .tips{
      font-size: 12px;
      line-height: 12px;
      margin-bottom: 10px;
      color: #999999;
    }
  }
}
</style>
