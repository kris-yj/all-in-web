<template>
  <div class="tree-filter-box">
    <div class="placeholder-box">
      <div class="shadow"></div>
    </div>
    <div
      class="filter-head"
      @click="toggleFilterBox">
      <meg-icon name="filter"></meg-icon>
      <div
        v-tooltip="true"
        :class="{
          'filter-title':true,
          'default':!filterTitle
        }">
        {{ filterTitle || '筛选相机' }}
      </div>
      <div
        :class="{
          'fold-box':true,
          'active':filterBoxVisible
        }">
        <meg-icon name="fold"></meg-icon>
      </div>
    </div>
    <filter-form
      v-show="filterBoxVisible"
      v-model="filterTitle"
      :filter-condition="filterCondition"
      @confirm="handleConfirm"></filter-form>
    <div class="tree-wrap">
      <meg-tree
        ref="tree"
        :default-expand-all="false"
        :search-leaf-model="true"
        :data="camerasData"
        :show-checkbox="true"
        :search-placeholder="$t('搜索相机名称')"
        :props="{children:'items',label:'name'}"
        :show-camera-icon="true"
        :show-dept-icon="true"
        :standard-tree-data="true"
        :brief-selected-info="true"
        :content-height="treeHeight"
        :expand-on-click-node="false"
        :check-on-click-node="true"
        @check-change="checkChange"
        @node-click="nodeClick"
        @tree-update-ready="treeUpdateReady">
        <template
          slot-scope="{ node, data, text }">
          <div class="tree-node-items">
            <span class="tree-before">
              <img
                v-if="node.flag==='camera'"
                :src="cameraImg(node)" />
              <meg-icon
                v-else
                color="#8A97A0"
                name="group"></meg-icon>
            </span>
            <!--
            <span
              class="tree-text"
              v-tooltip="true">{{ node.name }}</span>-->
            <meg-tree-node-label
              :search-text="text"
              :label="node.name"></meg-tree-node-label>
            <span class="tree-node-right">
              <slot
                name="tree-after"
                :node="node"
                :data="data">
              </slot>
            </span>
          </div>
        </template>
      </meg-tree>
    </div>
  </div>
</template>

<script>
import cameraImgOn from './camera-on.png';
import cameraImgOff from './camera-off.png';
import FilterForm from './filter-form';

export default {
  components: {
    FilterForm,
  },
  props: {
    filterCondition: {
      type: Array,
      default: () => []
    },
    camerasData: {
      type: Array,
      default() {
        return [];
      }
    },
    treeHeight: {
      type: Number,
      default: undefined
    },
  },
  data() {
    return {
      filterTitle: '筛选相机',
      filterBoxVisible: false,
      isInit: false,
    };
  },
  methods: {
    /**
     * 相机在线离线判断
     */
    cameraImg({ status }) {
      return status.toString() === '2' ? cameraImgOff : cameraImgOn;
    },
    /**
     * 响应树选择变化
     * @param {Object} node 点击节点
     * @param {Boolean} checked 自身是否选中
     */
    checkChange(node, checked) {
      const ids = this.getCheckedKeys();
      this.$emit('change', ids, node, checked);
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
    treeUpdateReady(list) {
      if (!this.isInit) {
        this.isInit = true;
        return;
      }
      this.$refs.tree.resize();
      this.$emit('tree-update-ready', list);
    },
    /**
     * 设置选中项 keys
     * @param {Array.<string|number>} keys 需要选中的id数组 传null 或 [] 则是取消选中
     */
    setCheckedKeys(keys) {
      this.$refs.tree.setCheckedKeys(keys);
    },
    /**
     * 切换筛选框显示隐藏状态
     */
    toggleFilterBox() {
      this.filterBoxVisible = !this.filterBoxVisible;
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
    /*
    * 相机组件帅选条件
    */
    handleConfirm(filterParams) {
      this.filterBoxVisible = false;
      this.searchText = '';
      this.$emit('filter', filterParams);
    },
    // 设置tree的数据
    setTreeData(camerasData) {
      this.$refs.tree.setData(camerasData);
    },
    filterCameraNodes(array) {
      // 利用循环替代递归
      const stack = [...array];
      const target = [];
      while (stack.length) {
        const curr = stack.pop();
        if (curr.flag === 'camera') {
          target.push(curr);
        }
        if (curr.items && curr.items.length) {
          stack.push(...curr.items);
        }
      }
      return target;
    },
  }
};
</script>
<style lang="scss" scoped>
.tree-filter-box{
  display: flex;
  flex-direction: column;
  flex: 1;
  position: relative;
  padding: 0 15px;
  .placeholder-box{
    height: 46px;
    position: relative;
    margin-bottom: 16px;
    .shadow{
      position: absolute;
      bottom: 0;
      left: -12px;
      right: -12px;
      height: 8px;
      box-shadow: 0 2px 4px 0 rgba(0,0,0,.1);
    }
  }
  .filter-head {
    display: flex;
    position: absolute;
    align-items: center;
    justify-content: space-between;
    width: 270px;
    height: 46px;
    font-size: 14px;
    color: #869ABB;
    z-index: 100;
    cursor: pointer;
    .filter-title{
      flex: 1;
      color: #435068;
      padding: 0 7px 0 7px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      &.default{
        color: #869ABB;
      }
    }
    .fold-box{
      transform: rotate(0deg);
      transition: transform .5s;
      &.active{
        transform: rotate(180deg);
      }
      .meg-icon{
        color: #23519b;
      }
    }

  }
  .tree-wrap{
    flex: 1;
  }
  .tree-node-items {
    width: 100%;
    display: flex;
    align-items: center;
    .tree-before {
      flex: 0 0 18px;
      img {
        width: 20px;
      }
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
}
</style>
