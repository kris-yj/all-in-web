<template>
  <div
    class="camera-select-box">
    <div class="camera-box">
      <meg-treeselect
        ref="cameraTreeSelector"
        :placeholder-text="$t('相机')"
        :props="{children: 'items', label: 'name'}"
        :standard-tree-data="true"
        :show-checkbox="true"
        :show-count="false"
        brief-selected-info
        :data="cameraList"
        :empty-text="$t('暂无数据')"
        :search-placeholder="$t('请输入关键词搜索')"
        @tree-update-ready="onCameraTreeUpdateReady"
        @check-change="handleTreeNodeChange">
        <template
          slot-scope="{data}">
          <meg-icon
            :name="renderIcon(data)"
            v-if="renderIcon(data)"></meg-icon>
          <span v-tooltip="true">
            {{ data.name }}
          </span>
        </template>
      </meg-treeselect>
    </div>
  </div>
</template>
<script>
import _ from 'lodash';

export default {
  props: {
    cameraList: {
      type: Array,
      default() {
        return [];
      }
    },
    defaultSelectArray: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      totalCameraObj: {},
      selectCameraObj: {}, // 选中的相机数据映射表
      selectCameraIdArray: [],
      cameraTotalCount: 0,
    };
  },
  computed: {
  },
  watch: {
    selectCameraIdArray(val) {
      this.$emit('change', val);
      this.$emit('selectCameraList', Object.values(this.selectCameraObj));
    },
    defaultSelectArray: {
      handler(val) {
        this.selectCameraObj = _.pickBy(this.totalCameraObj, (item) => val.indexOf(item.id) > -1);
      },
      immediate: false

    }
  },
  methods: {
    /*
    * 相机树节点选择变化
    * @param {any}
    * @return
    * */
    handleTreeNodeChange() {
      const selectNodes = this.$refs.cameraTreeSelector.getCheckedNodes();
      const selectCamera = selectNodes.filter((item) => item.flag === 'camera');
      this.selectCameraIdArray = selectCamera.map((item) => item.id);
      this.$emit('cameraChoosed', this.selectCameraIdArray);
    },
    /*
    * 根据节点类型渲染对应icon
    * @param {data} 节点数据
    * @return
    * */
    renderIcon(data) {
      let iconName = '';
      const flagType = data.flag;
      if (flagType === 'camera') {
        iconName = 'camera_normal';
      } else if (data.flag === 'place') {
        iconName = 'camera_unlabeled';
      }
      return iconName;
    },
    /*
    * 手动选中树节点
    * @param {any}
    * @return
    * */
    setTreeChecked(val) {
      this.$refs.cameraTreeSelector.setCheckedKeys(val);
    },
    /** **********************相机树部分***************************** */
    // 在相机树上进行选择
    onCameraTreeUpdateReady(mapData) {
      this.$emit('onDeptCameraTreeUpdateReady', mapData);
      // 在树更新之后，如果有默认数组，在这里手动初始化
      if (this.defaultSelectArray.length) {
        this.$refs.cameraTreeSelector.setCheckedKeys(this.defaultSelectArray);
      }
    },
    /** **********************相机树部分结束***************************** */
  }
};
</script>
<style lang="scss" scoped>
.camera-select-box{
  p{
    line-height: 26px;
    font-size: 12px;
    color: #435068;
  }
  .camera-select-container{
    min-height: 32px;
    position: relative;
    padding: 5px 30px 0px 5px;
    max-height: 180px;
    box-sizing: border-box;
    .camera-tag-box{
      line-height: 16px;
    }
  }
  .camera-select-placeholder{
    position: absolute;
    color: rgb(73,81,103);
    left: 10px;
    top: 10px;
    font-size: 14px;
    line-height: 14px;
  }
  .camera-box{
    position: relative;
  }
  .el-tag{
    max-width: 100%;
    position: relative;
    padding: 0 30px 0 10px;
    .el-tag__close {
      position: absolute;
      right: 10px;
      top: 8px;
    }
  }

  .camera-select-menu{
    position: absolute;
    cursor: pointer;
    right: 3px;
    top: -2px;
    display: inline-block;
    width: 20px;
    height: 34px;
    line-height: 34px;
    z-index:1000;
  }
  .box-mask{
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background: rgba(246, 247, 250, 0.6);
    z-index: 9999;
  }
}
.camera-select-popover{
  .judge-camera-tree-container{
    background: #ffffff;
    border-radius: 10px;
    width: 274px;
    padding: 0px;
    box-sizing: border-box;
  }
}
</style>
