<template>
  <div
    class="device-tree-container">
    <meg-tree
      v-if="dataReady"
      ref="tree"
      :search-placeholder="$t('搜索相机')"
      :expand-on-click-node="false"
      :standard-tree-data="true"
      :data="deviceData"
      :can-drag-fn="canDragFn"
      :empty-text="$t('暂无数据')"
      :props="treeProps"
      @tree-update-ready="onTreeUpdateReady"
      @node-click="onTreeNodeClick">
      <template
        v-slot:default="{ node, data}">
        <div class="tree-node-item">
          <span
            class="device-status-icon"
            v-if="mapIconShow(node)">
            <img
              v-if="data.flag === 'camera'"
              :src="cameraImg(data)" />
            <meg-icon
              v-else
              :name="mapIconName(node, data)"
              :color="mapIconColor(node, data)">
            </meg-icon>
          </span>
          <span
            class="device-name"
            v-tooltip="true">{{ node.name }}</span>
        </div>
      </template>
    </meg-tree>
  </div>
</template>

<script>
import cameraImgOn from '@/assets/images/camera-on.png';
import cameraImgOff from '@/assets/images/camera-off.png';
import {
  mapIconShow, mapIconName, mapIconColor, canNodeDragForVideo, canNodeDragForCapture
} from './node-process';
import {
  getDeviceTree, getStructDeviceTree, syncDeviceList, onCustomSettingChange, offCustomSettingChange
} from '../device-data';

const canDragFnMap = {
  'none': () => false,
  'video': canNodeDragForVideo,
  'capture': canNodeDragForCapture
};

export default {
  name: 'DeviceTree',
  props: {
    mode: {
      type: String,
      default: ''
    },
    canDragType: {
      type: String,
      default: 'none',
      validator(value) {
        return ['none', 'video', 'capture'].indexOf(value) >= 0;
      }
    }
  },
  data() {
    return {
      dataReady: false,
      deviceData: [],
      treeShow: true,
      treeProps: {
        children: 'items',
        label: 'name'
      },
      mapIconShow,
      mapIconName,
      mapIconColor
    };
  },
  computed: {
    canDragFn() {
      return canDragFnMap[this.canDragType];
    }
  },
  async created() {
    onCustomSettingChange(this.onSelectNodeChange);

    if (this.mode === 'struct') {
      this.deviceData = await getStructDeviceTree();
    } else {
      this.deviceData = await getDeviceTree();
    }

    this.dataReady = true;
  },
  beforeDestroy() {
    offCustomSettingChange(this.onSelectNodeChange);
  },
  methods: {
    /**
     * 相机在线离线判断
     */
    cameraImg({ status }) {
      return status.toString() === '2' ? cameraImgOff : cameraImgOn;
    },
    forceRender() {
      if (this.$refs.tree) this.$refs.tree.forceRenderHeight();
    },
    onTreeNodeClick(data) {
      this.$emit('node-click', data);
    },
    onTreeClickOutside() {

    },
    onTreeUpdateReady(lists) {
      // 同步设备列表 结构化模式下全是status为0设备
      const total = lists.filter((item) => item.flag === 'camera');
      const [totalNum, normalNum] = this.mode === 'struct' ? [total.length, total.length] : syncDeviceList(lists);
      this.$emit('on-tree-update-ready', totalNum, normalNum);
    },
    onSelectNodeChange(type, index, newDevice, oldDevice) {
      if (type === 'videos' || type === 'checkPoints') {
        if (oldDevice) this.$refs.tree.setNodeAttributeByKey(oldDevice.id, 'disableDrag', false);
        if (newDevice) this.$refs.tree.setNodeAttributeByKey(newDevice.id, 'disableDrag', true);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.device-tree-container {
  border-radius: 4px;
  overflow: hidden;
  width: 400px;
  height: 100%;
  z-index: 9;
  box-shadow: 3px 3px 5px 1px #dce1e5;
  background-color: #fff;
  padding: 10px 15px 0 15px;
}
.tree-node-item {
  display: flex;
  align-items: center;
  width: 100%;
  line-height: 34px;
  height: 34px;
  box-sizing: border-box;
  padding-right: 15px;

  .device-status-icon {
    flex: 0 0 18px;
    img {
      vertical-align: middle;
      width: 20px;
    }
  }

  .device-name {
    flex: 1;
  }

  .device-ability-icon {
    flex: 0 0 65px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
