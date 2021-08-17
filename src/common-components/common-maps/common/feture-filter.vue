<template>
  <meg-popover
    placement="bottom"
    width="345"
    class="map-select-search"
    popper-class="map-select-popper"
    :visible-arrow="false"
    trigger="manual"
    v-model="visible">
    <div
      slot="reference">
      <meg-input
        v-model="filterString"
        v-show="isSearchCamera"
        @blur="visible=false"
        @focus="visible=true"
        placeholder="请输入关键字">
        <template #suffix>
          <meg-icon
            v-show="!!filterString&&!isSelect"
            class="select-search_clear"
            width="14"
            height="14"
            @click="clearSearch"
            name="clear"></meg-icon>
          <meg-icon
            v-show="!filterString&&!isSelect"
            class="select-search_button"
            width="16"
            height="16"
            name="search_1"></meg-icon>
          <meg-icon
            v-show="isSelect"
            @click="clearSearch"
            class="delete-camera"
            color="#ccc"
            width="16"
            height="16"
            name="close"></meg-icon>
        </template>
      </meg-input>
    </div>

    <div
      class="tree-node-item"
      @click="onTreeNodeClick(node)"
      v-for="node in featurePinyinArray"
      :key="node.id">
      <span
        class="device-status-icon"
        v-if="mapIconShow(node)">
        <img
          :src="cameraImg(node)" />
      </span>
      <span
        class="device-name"
        v-tooltip="true">
        {{ node.highlight[0] }}<span class="device-name-high">{{ node.highlight[1] }}</span>{{ node.highlight[2] }}
      </span>
    </div>
    <div
      v-show="isShowAll"
      @click="showAll"
      class="show-all">
      查看全部{{ allLength }}个结果
    </div>
    <meg-pagination
      small
      v-show="isShowPage"
      layout="prev, pager, next"
      :page-size="15"
      :pager-count="5"
      @current-change="handleCurrentChange"
      :total="allLength">
    </meg-pagination>
    <div
      v-show="isEmpty"
      style="line-height: 26px;text-align: center">
      检索无结果
    </div>
  </meg-popover>
</template>

<script>
import cameraImgOn from '../images/camera-on.png';
import cameraImgOff from '../images/camera-off.png';
import {
  mapIconShow, mapIconName, mapIconColor
} from './node-process';

export default {
  data() {
    return {
      filterString: '',
      isSearchCamera: false,
      visible: false,
      timer: null,
      mapIconShow,
      mapIconName,
      mapIconColor,
      treeData: [],
      allLength: 0,
      isShowPage: false,
      isShowAll: false,
      featurePinyinArray: [],
      isSelect: false
    };
  },
  computed: {
    isEmpty() {
      return !!this.filterString && this.featurePinyinArray.length === 0;
    }
  },
  watch: {
    filterString() {
      this.isSelect = false;
      this.Filterchange();
    }
  },
  created() {
    this.featureArray = [];
    this.featurePinyinList = [];
  },
  methods: {
    /**
     * 相机在线离线判断
     */
    cameraImg({ status }) {
      return status.toString() === '2' ? cameraImgOff : cameraImgOn;
    },
    /**
     * 分页切换
     */
    handleCurrentChange(page) {
      this.featurePinyinArray = this.featurePinyinList.slice((page - 1) * 15, page * 15);
    },
    /**
     * 选择相机
     */
    onTreeNodeClick(data) {
      setTimeout(() => {
        this.isSelect = true;
        this.visible = false;
      }, 0);
      this.filterString = data.name;
      this.$emit('node-click', {
        params: data,
        lonLat: [data.lon, data.lat]
      });
    },
    /**
     * 搜索内容改变
     */
    Filterchange() {
      this.isShowAll = false;
      this.isShowPage = false;
      this.filterMethod(this.filterString);
    },
    /**
     * 显示全部
     */
    showAll() {
      this.featurePinyinArray = this.featurePinyinList.slice(0, 15);
      this.isShowAll = false;
      this.visible = true;
      if (this.allLength > 15) this.isShowPage = true;
    },
    /**
     * 处理名称过滤
     */
    filterMethod(val) {
      if (!val) {
        this.visible = false;
        return;
      }
      val = val.split(' ').join('');
      const strLength = val.length;

      const featurePinyinList = [];
      this.featureArray.forEach((item) => {
        const nameIndexOf = item.name.indexOf(val);
        // 全模糊搜索
        if (nameIndexOf !== -1 && strLength > 0) {
          featurePinyinList.push({
            ...item,
            highlight: [item.name.substring(0, nameIndexOf), item.name.substring(nameIndexOf, nameIndexOf + strLength), item.name.substring(nameIndexOf + strLength)]
          });
        }
      });
      // 过滤出来的结果集
      this.featurePinyinList = featurePinyinList;
      // 结果总数
      this.allLength = featurePinyinList.length;
      this.featurePinyinArray = featurePinyinList.slice(0, 10);
      if (this.allLength > 10) this.isShowAll = true;
      if (featurePinyinList.length !== 0) this.visible = true;
    },
    setFeature(feature) {
      this.featureArray = feature;
      this.isSearchCamera = true;
    },

    clearSearch() {
      this.filterString = '';
      this.featurePinyinArray = [];
      this.featurePinyinList = [];
    },
  }
};
</script>

<style lang='scss'>
.map-select-popper {
  padding: 0;
  .tree-node-item {
    display: flex;
    align-items: center;
    width: 100%;
    line-height: 34px;
    height: 34px;
    cursor: pointer;
    box-sizing: border-box;
    padding-left: 15px;
    &:hover {
      background: #e6f2ff;
    }
    .device-status-icon {
      flex: 0 0 18px;
      img {
        vertical-align: middle;
        width: 20px;
      }
    }

    .device-name {
      flex: 1;
      font-size: 14px;
    }

    .device-ability-icon {
      flex: 0 0 65px;
      display: flex;
      justify-content: flex-end;
    }
    .device-name-high {
      color: #21539b;
      font-weight: bold;
    }
  }
  .show-all {
    color: #21539b;
    line-height: 48px;
    text-align: center;
    cursor: pointer;
  }
}
.map-select-search {
  position: absolute;
  top: 20px;
  left: 10px;
  z-index: 2;
  width: 345px;
  background: #fff;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.3);
  .meg-input__suffix {
    width: 50px;
  }
  .meg-input__inner {
    padding-right: 50px;

  }
  .select-search_clear {
    cursor: pointer;
  }
  .select-search_button {
    margin-left: 10px;
  }
  .delete-camera {
    position: absolute;
    right: 0;
    top: -7px;
    cursor: pointer;
  }
}
</style>
