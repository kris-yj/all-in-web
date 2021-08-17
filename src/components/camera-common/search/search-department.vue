<template>
  <div
    class="search-department"
    ref="searchDepartment">
    <!-- <meg-scrollbar> -->
    <div class="search-department-wrap">
      <meg-tree
        ref="tree"
        :data="treeData"
        :search-placeholder="$t('请输入部门名称')"
        :highlight-current="true"
        :standard-tree-data="true"
        :props="deptTreeProps"
        :expand-on-click-node="false"
        :default-expand-all="true"
        @node-click="nodeClick">
        <div
          class="search-department-item"
          v-tooltip="true"
          slot-scope="{ data }">
          <!-- 场所icon -->
          <meg-icon
            class="search-department-icon"
            name="department"></meg-icon>
          {{ data.orgName }}
        </div>
      </meg-tree>
    </div>
    <!-- </meg-scrollbar> -->
  </div>
</template>

<script>
export default {
  props: {
    treeData: {
      type: Array,
      default: () => []
    },
    type: {
      type: String,
      default: 'camera'
    },
  },
  data() {
    return {
      deptTreeProps: {
        label: 'orgName',
        children: 'subOrgs'
      },
    };
  },
  created() {
    this.$nextTick(() => {
      this.$refs.tree.forceRenderHeight();
    });
  },
  methods: {
    /**
     * 默认检索一次
     */
    initSeach() {
      const deptId = this.$store.getters.userOrg.id;
      this.$refs.tree.setCurrentKey(deptId);
      this.nodeClick({
        flag: 'dept',
        id: deptId
      });
    },
    setCurrentKey(keys) {
      this.$refs.tree.setCurrentKey(keys);
    },
    nodeClick(row) {
      const param = {
        deptId: '',
        placeId: ''
      };
      if (row.flag === 'place') {
        param.placeId = row.id;
      } else {
        param.deptId = row.id;
      }
      console.log(param);
      this.$emit('node-click', param);
    }
  }

};
</script>

<style lang="scss">
.search-department {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 0 20px;

  .search-department-wrap {
    height: 100%;
    border-bottom: 1px solid #dcdfe6;
  }

  .search-department-item {
    width: 100%;
    color: #435068;
  }

  .search-department-icon {
    color: #606266;
    width: 14px;
    height: 14px;
  }

  .is-current {
    .search-department-icon {
      color: #fff;
    }

    .search-department-item {
      color: #fff;
    }
  }
}
</style>
