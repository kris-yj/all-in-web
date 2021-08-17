<template>
  <div class="register-tree-container">
    <!-- 上级节点层 -->
    <div class="high-level-layer">
      <high-level-node
        :node-info="mainNode"
        :readonly="readonly"
        @register-gen="onRegisterGen"
        @name-edit="onMainNodeNameEdit">
      </high-level-node>
    </div>
    <!-- 分割层 -->
    <div
      class="split-layer"
      v-if="cascadeType===1">
      <div class="connect-line"></div>
    </div>
    <!-- 下级节点层 -->
    <div
      class="low-level-layer"
      v-if="cascadeType===1">
      <!-- 节点容器 -->
      <div
        class="sub-node-container"
        :style="subNodeContainerStyle">
        <div
          class="node-wrap"
          :style="nodeWrapStyle"
          v-for="(node,index) in subNodes"
          :key="index">
          <low-level-node
            :node-info="node"
            :status="node.status"
            :readonly="readonly"
            @click-edit="onClickNodeEdit(index,$event)"
            @click-delete="onClickNodeDelete(index,$event)"
            @click-display="onClickNodeInfo(index,$event)">
          </low-level-node>
        </div>
        <!-- 添加按键 -->
        <div
          class="node-wrap"
          :style="nodeWrapStyle"
          v-if="isAddShow">
          <add-node
            :has-tooltip="isTooltipShow"
            @click-add="onClickNodeAdd">
          </add-node>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import HighLevelNode from './high-level-node';
import LowLevelNode from './low-level-node';
import AddNode from './add-node';

export default {
  name: 'RegisterTree',
  components: { HighLevelNode, LowLevelNode, AddNode },
  props: {
    // 级联类型
    cascadeType: {
      type: Number,
      default: 0
    },
    // 下级节点最大数量
    subNodeMaxNum: {
      type: Number,
      default: 20
    },
    // 每行可放置的节点数
    nodesPerLine: {
      type: Number,
      default: 7
    },
    // 主节点
    mainNode: {
      type: Object,
      default: () => {}
    },
    // 下级节点数据
    subNodes: {
      type: Array,
      default: () => []
    },
    // 是否只读（不可做操）
    readonly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {

    };
  },
  computed: {
    // 是否显示增加按钮
    isAddShow() {
      return !this.readonly && this.subNodes.length < this.subNodeMaxNum;
    },
    // 是否展示增加按钮的tooltip
    isTooltipShow() {
      return this.subNodes.length === 0;
    },
    // 下级节点容器计算样式
    subNodeContainerStyle() {
      return {
        justifyContent: this.subNodes.length >= this.nodesPerLine ? '' : 'center'
      };
    },
    // 节点包裹层计算样式
    nodeWrapStyle() {
      return {
        width: `${100 / this.nodesPerLine}%`
      };
    }
  },
  methods: {
    onClickNodeAdd() {
      this.$emit('node-add');
    },
    onClickNodeEdit(index, $event) {
      this.$emit('node-edit', index, $event);
    },
    onClickNodeDelete(index, $event) {
      this.$emit('node-delete', index, $event);
    },
    onClickNodeInfo(index, $event) {
      this.$emit('node-info', index, $event);
    },
    onRegisterGen(next) {
      this.$emit('register-code-gen', next);
    },
    onMainNodeNameEdit(nodeInfo, newName, next) {
      this.$emit('main-node-name-edit', nodeInfo, newName, next);
    }
  }
};
</script>
<style lang="scss" scoped>
.register-tree-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  height: 100%;
}
.high-level-layer {
  flex: 0 0 200px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.split-layer {
  flex: 0 0 46px;
  display: flex;
  justify-content: center;

  .connect-line {
    height: 100%;
    border-right: 1px dashed #d0d7e0;
    border-left: 1px dashed #d0d7e0;
  }
}
.low-level-layer {
  flex: 1 1 400px;
  display: flex;
  justify-content: center;
  padding: 0 100px;

  .sub-node-container {
    flex: 0 0 1280px;
    max-width: 100%;
    height: min-content;
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    border-top: 2px dashed #d0d7e0;
    background: #f9f9f9;
    box-sizing: border-box;
    padding: 0 50px 50px 50px;

    .node-wrap {
      display: flex;
      margin-top: 20px;
      min-width: 160px;
      justify-content: center;
      align-items: center;
      box-sizing: border-box;
    }
  }
}
</style>
