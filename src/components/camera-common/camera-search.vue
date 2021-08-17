<template>
  <div class="camera-search">
    <div class="camera-title">
      <meg-return-button
        :title="title"
        :button-visible="false">
      </meg-return-button>
    </div>
    <div class="camera-search_select">
      <meg-dropdown
        placement="bottom"
        @command="changeDropdown"
        trigger="hover">
        <span class="meg-dropdown-link">
          {{ activeDrop.name }}
          <meg-icon
            name="meg-icon-caret_right"
            class="meg-dropdown-link-icon"></meg-icon>
        </span>
        <meg-dropdown-menu
          slot="dropdown"
          class="camera-search-dropdown">
          <meg-dropdown-item
            v-for="item in dropdownList"
            :key="item.type"
            :command="item">
            {{ item.name }}
          </meg-dropdown-item>
        </meg-dropdown-menu>
      </meg-dropdown>
    </div>
    <div class="camera-search_list">
      <search-department
        :tree-data="deptTreeData"
        @node-click="deptNodeChange"
        :type="type"
        ref="deptTree"
        v-show="activeDrop.type===1"></search-department>
      <search-group
        ref="groupTree"
        @delete-group-open="deleteGroupOpen"
        :tree-data="groupTreeData"
        :camera-auth="cameraAuth"
        @group-search="groupNodeChange"
        :active-type="activeDrop.type"
        @edit-group-open="editGroupOpen"
        v-show="activeDrop.type===2"></search-group>
      <camera-search-form
        v-if="type==='camera'"
        :dept-tree-data="deptTreeData"
        ref="form"
        :camera-auth="cameraAuth"
        :group-tree-data="groupTreeData"
        :manufacture-option="manufactureOption"
        :bayonet-type-option="bayonetTypeOption"
        @search-click="searchClick"
        @reset-click="resetClick"
        v-show="activeDrop.type===3 "></camera-search-form>
      <box-search-form
        v-else
        :camera-auth="cameraAuth"
        :dept-tree-data="deptTreeData"
        ref="form"
        :group-tree-data="groupTreeData"
        :camera-model-option="cameraModelOption"
        @search-click="searchClick"
        @reset-click="resetClick"
        v-show="activeDrop.type===3"></box-search-form>
    </div>
  </div>
</template>

<script>
import BoxSearchForm from '@/modules/intelligent-box/components/search-form.vue';
import CameraSearchForm from './search-form.vue';
import SearchDepartment from './search/search-department.vue';
import SearchGroup from './search/search-group.vue';

export default {
  components: {
    SearchDepartment,
    BoxSearchForm,
    CameraSearchForm,
    SearchGroup
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'camera'
    },
    deptTreeData: {
      type: Array,
      default: () => []
    },
    groupTreeData: {
      type: Array,
      default: () => []
    },
    // TODO 这个地方可能有坑，智能盒也用的这个但是是老接口的数据
    cameraModelOption: {
      type: Array,
      default: () => []
    },
    /**
     * 相机权限集
     */
    cameraAuth: {
      type: Object,
      default: () => {}
    },
    manufactureOption: {
      type: Array,
      default: () => []
    },
    bayonetTypeOption: {
      type: Array,
      default: () => []
    },
  },
  data() {
    return {
      activeDrop: {
        type: 1,
        name: this.$t('按部门显示'),
      },
      dropdownList: [
        {
          type: 1,
          name: this.$t('按部门显示'),
        },
        {
          type: 2,
          name: this.$t('按分组显示')
        },
        {
          type: 3,
          name: this.$t('按属性检索')
        }
      ]
    };
  },
  created() {
    if (this.type === 'box') {
      this.dropdownList.splice(1, 1);
    }
  },
  methods: {
    /**
     * 检索类型变更
     */
    changeDropdown(val) {
      this.activeDrop = val;
      switch (val.type) {
        case 1:
          this.$refs.deptTree.initSeach();
          break;
        case 2:
          this.$refs.groupTree.initSeach();
          break;
        case 3:
          this.$refs.form.initSeach();
          break;
        default:
          break;
      }
    },
    /**
     * @description 有默认搜索条件时触发
     * @param {Object} data 默认的搜索条件
     */
    changeDropdownWithCondition(data) {
      this.dropdownList.forEach((val) => {
        if (val.type === Number(data.index)) {
          delete data.index;
          if (data.status) {
            data.status = Number(data.status);
          }
          this.activeDrop = val;
          this.$refs.form.initSeach(data);
        }
      });
    },
    /**
     * 选中的部门变更
     */
    deptNodeChange(param) {
      this.$emit('dept-node-change', {
        deptIds: param.deptId ? [param.deptId] : '',
        placeId: param.placeId ? param.placeId : ''
      });
    },
    setDeptNode(keys) {
      this.$refs.deptTree.setCurrentKey(keys);
    },
    /**
     * 分组检索
     */
    groupNodeChange(param) {
      this.$emit('group-node-change', param);
    },
    /**
     * 点击检索
    */
    searchClick(formData) {
      this.$emit('search-click', formData);
    },
    /**
     * 点击重置
     */
    resetClick() {
      this.$emit('reset-click');
    },
    /**
     * 删除标签
    */
    deleteGroupOpen(groupId) {
      this.$emit('delete-group-open', groupId);
    },
    /**
     * 编辑dialog打开
     */
    editGroupOpen(id) {
      this.$emit('edit-group-open', id);
    },
  }
};
</script>

<style lang="scss">
.camera-search-dropdown {
  &.meg-popper[x-placement^=bottom] {
    margin-top: -14px;
  }
}

.camera-search {
  height: 100%;
  width: 320px;
  display: flex;
  flex-direction: column;

  .camera-title {
    height: 56px;
    display: flex;
    align-items: center;
    background-color: #efefef;
    padding-left: 25px;
  }

  .camera-search_select {
    height: 56px;
    line-height: 56px;
    padding-left: 25px;
    border-bottom: 1px solid #f4f4f4;
    position: relative;

    .meg-dropdown {
      position: absolute;
      top: 1px;
      z-index: 1;
    }
    .meg-dropdown-link {
      cursor: pointer;
      display: flex;
      align-items: center;
      .meg-dropdown-link-icon {
        margin-left:2px;
        font-size: 12px;
        transform: rotate(90deg);
      }
    }
    .meg-dropdown-link.meg-dropdown-selfdefine {
      color: #435068 !important;
    }

    .search-title {
      color: #435068;
      position: relative;
      z-index: 1;
    }
  }

  .camera-search_list {
    height: calc(100% - 126px);
  }
}
</style>
