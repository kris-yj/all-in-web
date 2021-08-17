<template>
  <div class="searchTree-wrapper">
    <div
      class="searchTree-header"
      v-if="total && filterFlag">
      <meg-checkbox
        v-model="checked"
        :indeterminate="isIndeterminate"
        @change="handleChecked">
        全选
      </meg-checkbox>
      <p>检索结果{{ total }}个</p>
    </div>
    <div class="search-tree-container">
      <meg-tree
        v-show="total && filterFlag"
        ref="tree"
        :show-search="false"
        :show-checkbox="true"
        :props="{children:'items',label:'name'}"
        :show-camera-icon="true"
        :show-dept-icon="true"
        :standard-tree-data="true"
        :brief-selected-info="true"
        :content-height="treeHeight"
        :expand-on-click-node="false"
        :check-on-click-node="true"
        @after-filter="onAfterFilter"
        @check-change="checkChange"
        @node-click="nodeClick"
        @tree-update-ready="treeUpdateReady">
        <template
          slot-scope="{ node, data }">
          <div class="tree-node-items">
            <span class="tree-before">
              <meg-icon
                :name="mapIconName(node, data)"
                :color="mapIconColor(node, data)"></meg-icon>
            </span>
            <meg-tree-node-label
              class="tree-text"
              v-tooltip="true"
              :search-text="searchText"
              :label="node.name">
            </meg-tree-node-label>
          </div>
        </template>
      </meg-tree>
      <div
        class="tree-noData"
        v-show="!total && filterFlag">
        暂无数据
      </div>
    </div>
  </div>
</template>
<script>
import { mapIconName, mapIconColor } from '../../utils/utils';

export default {
  name: 'SearchTree',
  props: {
    treeHeight: {
      type: Number,
      default: 300
    },
    searchText: {
      type: String,
      default: '',
    }
  },
  data() {
    return {
      checked: false,
      total: 0,
      selectNodes: [],
      isIndeterminate: false,
      filterFlag: false,
    };
  },
  watch: {
    searchText() {
      this.$refs.tree.filter(this.searchText);
      this.filterFlag = false;
    },
  },
  methods: {
    mapIconName,
    mapIconColor,
    setTreeData(camerasData) {
      this.$refs.tree.setData(camerasData);
    },
    /**
     * 响应树选择变化
     * @param {Object} node 点击节点
     */
    checkChange(node) {
      const ids = this.getCheckedKeys();
      const checkedList = this.selectNodes.filter((item) => item.checked === true);
      this.checked = checkedList.length === this.total;
      this.isIndeterminate = checkedList.length > 0 && checkedList.length < this.total;
      this.$emit('change', ids, node);
    },
    /**
     * 获取相机树选中id
     */
    getCheckedKeys() {
      return this.$refs.tree.getCheckedKeys((el) => el.flag === 'camera');
    },
    /**
     * 外部调用方法，获得当前选中节点
     */
    getCheckedNodes(...args) {
      return this.$refs.tree.getCheckedNodes(...args);
    },
    /**
     * 树初始化完毕
     */
    treeUpdateReady() {
      this.$refs.tree.resize();
      this.$emit('tree-update-ready');
    },
    /**
     * 设置选中项 keys
     * @param {Array.<string|number>} keys 需要选中的id数组 传null 或 [] 则是取消选中
     */
    setCheckedKeys(keys) {
      this.$refs.tree.setCheckedKeys(keys);
    },
    /**
     * 树组件重置大小
     */
    resize() {
      this.$refs.tree.resize();
    },
    /**
     * @description 透传节点点击事件
     * @param {Object} 点击的节点
     */
    nodeClick(node) {
      this.$emit('node-click', node);
    },
    handleChecked(checked) {
      if (checked) {
        this.selectNodes.forEach((item) => {
          item.checked = true;
        });
      } else {
        this.selectNodes.forEach((item) => {
          item.checked = false;
        });
      }
      const ids = this.getCheckedKeys();
      this.$emit('change', ids, this.selectNodes);
    },
    onAfterFilter(nodesItems) {
      this.filterFlag = true;
      this.selectNodes = nodesItems;
      this.total = nodesItems.length;
      const checkedList = this.selectNodes.filter((item) => item.checked === true);
      this.checked = checkedList.length === this.total;
      this.isIndeterminate = checkedList.length > 0 && checkedList.length < this.total;
    },
  }
};
</script>
<style lang="scss" scoped>
.searchTree-wrapper {
  width: 100%;
  height: 100%;
  ::v-deep.meg-base-tree__expand-placeholder {
    margin-right: 0 !important;
  }
  .searchTree-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 10px 0 4px 0;
    >p {
      font-size: 14px;
      color: rgba(67,80,104,.5);
    }
  }
  .tree-node-items {
    width: 100%;
    display: flex;
    align-items: center;
    .tree-before {
      flex: 0 0 18px;
    }
    .tree-text {
      flex: 1;
    }
    .tree-after {
      flex: 0 0 65px;
      display: flex;
      justify-content: flex-end;
    }
  }
  .tree-noData {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 405px;
  }
}
</style>>
