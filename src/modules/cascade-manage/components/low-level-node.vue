<template>
  <div
    class="outline"
    :title="titleText"
    :class="statusClass"
    @click.stop="onNodeClick">
    <div class="inner-corner-left-top"></div>
    <div class="inner-corner-right-top"></div>
    <div class="inner-corner-left-bottom"></div>
    <div class="inner-corner-right-bottom"></div>
    <div
      class="node-status"
      v-if="status==='exception'">
      <meg-icon
        name="alert"
        width="12px"
        height="12px"
        color="#f56c6c #ffffff"></meg-icon>
    </div>
    <div
      class="node-status"
      v-else-if="status==='delete'">
      <meg-icon
        name="loading"
        width="12px"
        height="12px"
        color="#ccc"></meg-icon>
    </div>
    <!-- 编辑按钮 -->
    <div
      class="node-edit-btn"
      @click.stop="onEditClick">
      <meg-icon
        name="edit_photo"
        color="#fff"
        width="13px"
        height="13px"></meg-icon>
    </div>
    <!-- 删除按钮 -->
    <div
      class="node-del-btn"
      @click.stop="onDeleteClick">
      <meg-icon
        name="mission_del"
        color="#fff"
        width="13px"
        height="13px"></meg-icon>
    </div>
    <div class="node-icon">
      <img :src="iconImg" />
    </div>
    <div
      class="node-name">
      {{ nodeInfo.nodeName }}
    </div>
  </div>
</template>
<script>
import subNodeImg from '@/assets/images/cascade/sub-node';
import exNodeImg from '@/assets/images/cascade/ex-node';
import delNodeImg from '@/assets/images/cascade/del-node';

export default {
  name: 'LowLevelNode',
  props: {
    nodeInfo: {
      type: Object,
      default: () => ({
        nodeIp: '',
        nodeName: '',
        nodeRegisterCode: '',
        nodeNumber: '',
        coreVersion: '',
        enabled: true,
        nodeLevel: 1 // 节点级别,上级1，下级2
      })
    },
    // 节点状态
    status: {
      type: String,
      default: 'normal'
    },
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
    iconImg() {
      switch (this.status) {
        case 'normal':
          return subNodeImg;
        case 'exception':
          return exNodeImg;
        case 'delete':
          return delNodeImg;
        default:
          return subNodeImg;
      }
    },
    statusClass() {
      return {
        normal: this.status === 'normal',
        exception: this.status === 'exception',
        delete: this.status === 'delete',
        readonly: this.readonly
      };
    },
    titleText() {
      return this.status === 'delete' ? this.$t('节点删除中') : this.nodeInfo.nodeName;
    }
  },
  methods: {
    onEditClick() {
      this.$emit('click-edit', { ...this.nodeInfo });
    },
    onDeleteClick() {
      this.$emit('click-delete', { ...this.nodeInfo });
    },
    onNodeClick() {
      // 只读时点击节点触发事件
      if (this.readonly) {
        this.$emit('click-display', { ...this.nodeInfo });
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.outline {
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 80px;
  width: 120px;
  user-select: none;
  background-color: #fff;
  border: 1px solid #d7e0ed;

  &.normal:hover {
    border: 1px solid #d7e0ed;
    box-shadow: 2px 2px 4px rgba(33, 83, 155, 0.2);
    background-image: url("../../../assets/images/cascade/bg-hover.svg");
    background-repeat: no-repeat;
    background-size: cover;

    .node-icon {
      display: none;
    }
    .node-name {
      font-weight: bold;
    }
  }

  &.exception {
    border: 1px solid #ffc6c6;
  }

  &.delete {
    border: 1px solid #ccc;
    .node-name {
      color: #ccc;
    }
  }

  .node-icon {
    display: flex;
    img {
      width: 28px;
      height: 28px;
    }
  }
  .node-name {
    display: -webkit-box;
    text-align: center;
    box-orient: vertical;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    color: #435068;
    width: 100px;
  }
}

.node-status {
  position: absolute;
  top: 5px;
  right: 5px;
}

.node-edit-btn,
.node-del-btn {
  position: absolute;
  background-color: #a7bad6;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 4px;
  right: 28px;
  width: 20px;
  height: 20px;
  cursor: pointer;
  display: none;
}

.node-del-btn {
  right: 4px;
}

.outline.normal:hover .node-edit-btn,
.outline.normal:hover .node-del-btn,
.outline.exception:hover .node-edit-btn,
.outline.exception:hover .node-del-btn {
  display: flex;
}

.outline.readonly:hover .node-edit-btn,
.outline.readonly:hover .node-del-btn {
  display: none;
}

$corner-positions: (left top) (right top) (left bottom) (right bottom);

@each $positions in $corner-positions {
  $horizontal-type: nth($positions, 1);
  $vertical-type: nth($positions, 2);
  .outline.normal .inner-corner-#{$horizontal-type}-#{$vertical-type} {
    position: absolute;
    #{$horizontal-type}: 0;
    #{$vertical-type}: 0;
    width: 3px;
    height: 3px;
    background-color: #d7e0ed;
  }
}
</style>
