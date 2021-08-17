<template>
  <div
    v-click-outside="onClickOutside">
    <select-button
      class="select-button"
      icon="camera_normal"
      :label="selectButtonText"
      v-model="deviceTreeActive">
    </select-button>
    <device-tree
      class="device-tree"
      ref="deviceTree"
      :mode="mode"
      v-show="deviceTreeActive"
      @on-tree-update-ready="onTreeUpdateReady"
      @node-click="treeNodeClick"
      :can-drag-type="canDragType">
    </device-tree>
  </div>
</template>
<script>
import SelectButton from '../alarm-select-button.vue';
import DeviceTree from './alarm-device-tree';

export default {
  name: 'DeviceSelector',
  components: {
    SelectButton,
    DeviceTree
  },
  props: {
    mode: {
      type: String,
      default: ''
    },
    canDragType: {
      type: String,
      default: 'none'
    }
  },
  data() {
    return {
      deviceTreeActive: false,
      totalDeviceNum: 0,
      normalDeviceNum: 0
    };
  },
  computed: {
    selectButtonText() {
      return `相机 ${this.normalDeviceNum}/${this.totalDeviceNum}`;
    }
  },
  watch: {
    deviceTreeActive(val) {
      this.$emit('active-changed', val);
      if (val) {
        this.$refs.deviceTree.forceRender();
      }
    }
  },
  methods: {
    onClickOutside() {
      this.deviceTreeActive = false;
    },
    onTreeUpdateReady(totalNum, normalNum) {
      this.totalDeviceNum = totalNum;
      this.normalDeviceNum = normalNum;
    },
    treeNodeClick(data) {
      this.$emit('node-click', data);
    }
  }
};
</script>

<style lang="scss" scoped>
.select-button {
  margin-bottom: 10px;
}
.device-tree {
  width: 270px;
  height: calc(100% - 44px);
  transition: height;
  transition-duration: 0.5s;
  z-index: 100;
}
</style>
