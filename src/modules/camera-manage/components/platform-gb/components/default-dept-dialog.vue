<template>
  <meg-dialog
    class="default-dept-dialog"
    title="相机同步"
    width="480px"
    visible
    append-to-body
    @close="dialogClose">
    <span class="msg">未找到组织归属相机：</span><span class="num">{{ noDept }}</span>
    <div class="dept-tree">
      <span class="dept-title">节点选择</span>
      <meg-treeselect
        ref="tree"
        single-check
        highlight-current
        default-expand-all
        :data="treeData"
        :show-count="false"
        :props="defaultProps"
        :standard-tree-data="true"
        :expand-on-click-node="false">
      </meg-treeselect>
    </div>
    <span
      slot="footer"
      class="dialog-footer">
      <meg-button
        type="primary"
        @click="confirm">确 定</meg-button>
      <meg-button
        @click="dialogClose">取 消</meg-button>
    </span>
  </meg-dialog>
</template>

<script>
export default {
  props: {
    noDept: {
      type: Number,
      default: 0
    },
    treeData: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      defaultProps: {
        children: 'subOrgs',
        label: 'orgName'
      },
    };
  },
  methods: {
    confirm() {
      const dept = this.$refs.tree.getCurrentNode();
      if (!dept) {
        this.$message({
          message: '请选择默认节点',
          type: 'error'
        });
        return;
      }
      this.$emit('confirm', dept.id);
    },
    dialogClose() {
      this.$emit('close');
    }
  },
};
</script>

<style lang='scss' scoped>
.default-dept-dialog {
    font-weight: bold;
    color: #435068;
  ::v-deep  .meg-dialog__body {
    height: 125px;
  }
  .msg {
    font-size: 14px;
  }
  .num {
    font-family: 'HEMIHEAD';
    font-size: 20px;
  }
  .dept-tree {
    margin-top: 20px;
    display: flex;
    line-height: 34px;
    .dept-title {
      margin-right: 9px;
    }
    .meg-treeselect {
      width: 270px;
    }
  }
}
</style>
