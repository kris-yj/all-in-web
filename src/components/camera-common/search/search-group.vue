<template>
  <div class="search-group">
    <div class="search-group-wrap">
      <meg-tree
        ref="tree"
        :data="treeData"
        :search-placeholder="$t('请输入分组名称')"
        :highlight-current="true"
        :standard-tree-data="true"
        :props="treeProps"
        :expand-on-click-node="false"
        :default-expand-all="true"
        @tree-update-ready="handleTreeUpdate"
        @node-click="nodeClick">
        <div
          class="groups-list-item"
          style="width: 100%;"
          v-tooltip="true"
          slot-scope="{ data }">
          {{ data.name }}({{ data.cameraNum }})
          <meg-dropdown
            v-show="data.flag!=='resident'"
            @command="showTipsBox($event,data.id)"
            trigger="hover">
            <span class="meg-dropdown-link">
              <meg-icon
                name="more"
                width="16"
                height="16">
              </meg-icon>
            </span>
            <meg-dropdown-menu slot="dropdown">
              <meg-dropdown-item
                command="editTips">
                {{ $t('编辑分组') }}
              </meg-dropdown-item>
              <meg-dropdown-item
                command="deleteTips">
                {{ $t('删除分组') }}
              </meg-dropdown-item>
            </meg-dropdown-menu>
          </meg-dropdown>
        </div>
      </meg-tree>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    treeData: {
      type: Array,
      default: () => []
    },
    activeType: {
      type: Number,
      default: 1
    },
    /**
     * 相机权限集
     */
    cameraAuth: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      treeProps: {
        label: 'name',
        children: 'items'
      },
      selectedIndex: 0
    };
  },
  watch: {
    activeType(type) {
      if (type === 2) {
        // to do 这里需要等当前标签显示了再执行
        this.$refs.tree.forceRenderHeight();
      }
    }
  },
  created() {
    this.$nextTick(() => {
      this.$refs.tree.forceRenderHeight();
    });
  },
  methods: {
    handleTreeUpdate() {
      // 树的节点id每次请求后端是随机返回 所以用index
      if (this.treeData.length > 0) {
        const selectedId = this.treeData[this.selectedIndex].id;
        this.$refs.tree.setCurrentKey([selectedId]);
      }
    },
    /**
     * 默认检索一次
     */
    initSeach() {
      let data = { id: '' };
      if (this.treeData.length) {
        [data] = this.treeData;
        this.$refs.tree.setCurrentKey(data.id);
      }
      this.nodeClick(data);
    },
    /**
     * 编辑dialog打开
     */
    editGroupOpen(id) {
      this.$emit('edit-group-open', id);
    },
    /**
     * 新建dialog打开
     */
    createGroupOpen() {
      this.$emit('create-group-open');
    },
    /**
     * 删除
     */
    deleteGroup(id) {
      this.$emit('delete-group-open', id);
    },
    showTipsBox(command, id) {
      if (command === 'editTips') {
        this.editGroupOpen(id);
      } else if (command === 'deleteTips') {
        this.deleteGroup(id);
      }
    },
    nodeClick(data) {
      this.selectedIndex = this.treeData.findIndex((item) => item.id === data.id);
      let params = {};
      if (data.flag === 'resident') { // 常驻分组
        params = {
          closed: data.closed,
          statuses: data.status
        };
      } else { // 自定义分组
        params = {
          tagIds: data.id ? [data.id] : ''
        };
      }
      this.$emit('group-search', params);
    }
  }

};
</script>

<style lang="scss">
.search-group {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 0 20px;

  .search-group-wrap {
    height: 100%;
    border-bottom: 1px solid #dcdfe6;
  }

  .groups-list-item {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    height: 40px;
    width: 100%;
    padding-left: 10px;
    line-height: 40px;

    .meg-dropdown {
      display: none;
    }

    &:hover {
      .meg-dropdown {
        display: block;
      }
    }
  }

  .is-current .meg-dropdown-link {
    color: #fff !important;
  }
}
</style>
