<template>
  <common-form-container
    class="camera-manage-form"
    header-text="相机管理"
    :show-buttons="searchType===0"
    @reset="resetClick"
    @search="searchClick">
    <template slot="title">
      <meg-dropdown @command="searchTypeChange">
        <span class="meg-dropdown-link">
          {{ searchTypeMap[searchType] }}
          <meg-icon name="caret_down"></meg-icon>
        </span>
        <meg-dropdown-menu slot="dropdown">
          <meg-dropdown-item
            v-for="(item, index) in searchTypeMap"
            :key="index"
            :command="index">
            {{ item }}
          </meg-dropdown-item>
        </meg-dropdown-menu>
      </meg-dropdown>
    </template>
    <meg-form
      v-if="searchType===0"
      ref="searchForm"
      :model="formData"
      class="search-form"
      label-position="top">
      <meg-form-item
        prop="name"
        label="相机名称">
        <meg-input
          placeholder="请输入相机名称"
          v-model="formData.name"></meg-input>
      </meg-form-item>
      <meg-form-item :label="$t('相机类型')">
        <meg-select v-model="formData.type">
          <meg-option
            value=""
            :label="$t('全部')"></meg-option>
          <meg-option
            v-for="item in filterCameraOption"
            :key="item.code"
            :value="item.code"
            :label="item.value"></meg-option>
        </meg-select>
      </meg-form-item>
      <meg-form-item :label="$t('卡口类型')">
        <meg-select v-model="formData.monitoringType">
          <meg-option
            value=""
            :label="$t('全部')"></meg-option>
          <meg-option
            v-for="item in monitoringTypeOption"
            :key="item.code"
            :value="item.code"
            :label="item.value"></meg-option>
        </meg-select>
      </meg-form-item>
      <meg-form-item :label="$t('应用管理部门')">
        <meg-treeselect
          ref="deptTree"
          show-checkbox
          show-all-checked
          standard-tree-data
          default-checked-all
          check-on-click-node
          :data="orgTreeData"
          :expand-on-click-node="false"
          :all-selected-text="$t('全部部门')"
          :placeholder-text="$t('请选择应用管理部门')"
          :props="{ label: 'orgName', children: 'subOrgs' }">
          <div
            style="width: 100%"
            v-tooltip="true"
            slot-scope="{ data }">
            <!-- 场所icon -->
            <meg-icon
              v-if="data.flag === 'place'"
              color="#46a653"
              size="14"
              name="camera_unlabeled"></meg-icon>
            <meg-icon
              v-else
              color="#46a653"
              size="14"
              name="department"></meg-icon>
            {{ data.name || data.orgName }}
          </div>
        </meg-treeselect>
      </meg-form-item>
      <meg-form-item :label="$t('设备标签')">
        <meg-treeselect
          ref="labelTree"
          show-checkbox
          show-all-checked
          standard-tree-data
          record-dynamic-select
          :data="labelList"
          :expand-on-click-node="false"
          :all-selected-text="$t('全部标签')"
          :placeholder-text="$t('请选择标签')"
          :props="treeProps">
          <template
            v-slot:selected="{ items }">
            <div>
              <meg-tag
                class="meg-treeselect__tag"
                v-tooltip="true"
                v-for="(item, index) in handleSelectLabel(items)"
                :key="index"
                :closable="true"
                @click.native.stop
                @close="deleteSelect(item)">
                {{ item.normalName }}
              </meg-tag>
            </div>
          </template>
        </meg-treeselect>
      </meg-form-item>
      <meg-form-item :label="$t('归属区域')">
        <meg-treeselect
          ref="placeTree"
          single-check
          select-clearable
          standard-tree-data
          :data="placeList"
          :props="treeProps"
          :show-count="false"
          :expand-on-click-node="false"
          :placeholder-text="$t('请选择归属区域')">
          <div
            style="width:100%"
            slot-scope="{ data }"
            v-tooltip="true">
            {{ data.name||data.orgName }}
          </div>
        </meg-treeselect>
      </meg-form-item>
      <meg-form-item :label="$t('重点单位')">
        <meg-treeselect
          ref="unitTree"
          single-check
          select-clearable
          standard-tree-data
          :props="treeProps"
          :show-count="false"
          :data="keyUnitList"
          :expand-on-click-node="false"
          :placeholder-text="$t('请选择重点单位')">
          <div
            style="width:100%"
            slot-scope="{ data }"
            v-tooltip="true">
            {{ data.name||data.orgName }}
          </div>
        </meg-treeselect>
      </meg-form-item>
      <meg-form-item :label="$t('所属分组')">
        <meg-treeselect
          ref="groupTree"
          show-checkbox
          standard-tree-data
          check-on-click-node
          record-dynamic-select
          :props="treeProps"
          :data="groupTreefilterData"
          :expand-on-click-node="false"
          :all-selected-text="$t('全部分组')"
          :placeholder-text="$t('请选择分组')">
        </meg-treeselect>
      </meg-form-item>
    </meg-form>
    <div
      class="search-department-wrap"
      v-if="searchType===2">
      <meg-tree
        ref="searchDepartmentTree"
        show-search
        highlight-current
        standard-tree-data
        default-expand-all
        :data="orgTreeData"
        :expand-on-click-node="false"
        search-placeholder="请输入部门名称"
        :props="{ label: 'orgName', children: 'subOrgs' }"
        @node-click="handleNodeClick"
        @tree-update-ready="searchDepartmentTreeReady">
        <div
          class="search-department-item"
          v-tooltip="true"
          slot-scope="{ data }">
          <!-- 场所icon -->
          <meg-icon
            class="search-department-icon"
            :name="iconName[data.flag]||'department'"></meg-icon>
          {{ data.name || data.orgName }}
        </div>
      </meg-tree>
    </div>
    <div
      class="search-group-wrap"
      v-if="searchType===1">
      <meg-tree
        ref="searchGroupTree"
        show-search
        highlight-current
        default-expand-all
        standard-tree-data
        :props="treeProps"
        :data="groupTreeData"
        :expand-on-click-node="false"
        search-placeholder="请输入分组名称"
        @node-click="handleNodeClick"
        @tree-update-ready="searchGroupTreeReady">
        <div
          class="groups-list-item"
          style="width:100%"
          v-tooltip="true"
          slot-scope="{ data }">
          {{ data.name }}({{ data.cameraNum }})
          <meg-dropdown
            v-if="cameraAuth.groupAuth"
            v-show="data.flag!=='resident'"
            @command="showTipsBox($event,data.id)"
            trigger="hover">
            <span class="meg-dropdown-link">
              <meg-icon
                :color="getIconColor(data.id)"
                name="more"
                width="16"
                height="16">
              </meg-icon>
            </span>
            <meg-dropdown-menu
              v-if="cameraAuth.groupAuth"
              slot="dropdown">
              <meg-dropdown-item
                command="editTips">
                编辑分组
              </meg-dropdown-item>
              <meg-dropdown-item
                command="deleteTips">
                删除分组
              </meg-dropdown-item>
            </meg-dropdown-menu>
          </meg-dropdown>
        </div>
      </meg-tree>
    </div>
  </common-form-container>
</template>

<script>
import CommonFormContainer from '@/common-components/common-form-container';
import CameraManageSrv from '../camera-manage.service';

export default {
  components: {
    CommonFormContainer,
  },
  props: {
    cameraAuth: {
      type: Object,
      default: () => {}
    },
    labelList: {
      type: Array,
      default: () => []
    },
    orgTreeData: {
      type: Array,
      default: () => []
    },
    placeList: {
      type: Array,
      default: () => []
    },
    keyUnitList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      searchType: 0,
      searchTypeMap: ['按属性检索', '按分组显示', '按部门显示'],
      iconName: {
        place: 'camera_unlabeled',
        dept: 'department'
      },
      treeProps: { label: 'name', children: 'items' },
      formData: {
        name: '', // 相机名称
        type: '', // 相机类型
        monitoringType: '', // 卡口类型
        managementIds: [], // 应用管理部门
        labels: [], // 设备标签
        placeIds: [], // 归属区域
        unitIds: [], // 重点单位
        tagIds: [], // 所属分组
      },
      filterCameraOption: this.$store.getters.dataMapByType('camera_type').filter((item) => !item.extra),
      monitoringTypeOption: this.$store.getters.dataMapByType('bayonet_type'),
      groupTreeData: [], // 分组
      groupTreefilterData: [], // 过滤分组
    };
  },
  computed: {
  },
  watch: {
    searchType(val) {
      this.$nextTick(() => {
        switch (val) {
          case 0: {
            const param = this.getSearchParams();
            this.$emit('search', param);
            break;
          }
          case 1: {
            this.getGroupsList();
            break;
          }
          default: break;
        }
      });
    }
  },
  created() {
    this.getGroupsList(); // 查询相机分组
  },
  mounted() {
    this.searchClick();
  },
  destroyed() {},
  methods: {
    getIconColor(cid) {
      const id = this.$refs.searchGroupTree.getCurrentKey() || '';
      return cid === id ? 'white' : '';
    },
    // 重置表单
    resetClick() {
      this.$refs.deptTree.setCheckedKeys('ALL');
      this.$refs.labelTree.setCheckedKeys([]);
      this.$refs.placeTree.setCurrentKey(null);
      this.$refs.unitTree.setCurrentKey(null);
      this.$refs.groupTree.setCheckedKeys([]);
      this.formData = {
        name: '', // 相机名称
        type: '', // 相机类型
        monitoringType: '', // 卡口类型
        managementIds: [], // 应用管理部门
        labels: [], // 设备标签
        placeIds: [], // 归属区域
        unitIds: [], // 重点单位
        tagIds: [], // 所属分组
      };
    },
    // Search
    searchClick() {
      const params = this.getFormData();
      this.$emit('search', params);
    },
    searchTypeChange(index) {
      this.searchType = index;
    },
    // 获取表单内容
    getFormData() {
      this.formData.managementIds = this.$refs.deptTree.getCheckedKeys();
      this.formData.labels = this.$refs.labelTree.getCheckedKeys();
      const placeIds = this.$refs.placeTree.getCurrentKey();
      this.formData.placeIds = placeIds ? [placeIds] : null;
      const unitIds = this.$refs.unitTree.getCurrentKey();
      this.formData.unitIds = unitIds ? [unitIds] : null;
      this.formData.tagIds = this.$refs.groupTree.getCheckedKeys();
      return this.formData;
    },
    // 查询相机分组
    getGroupsList() {
      CameraManageSrv.getGroupsList({ withCameras: false, searchType: 0 }).then((res) => {
        if (res.code === 0) {
          const list = res.data.filter((item) => item.flag !== 'resident');
          this.groupTreeData = res.data;
          this.groupTreefilterData = [{
            id: '0',
            flag: 'all',
            name: this.$t('全部'),
            items: list
          }];
        }
      });
    },
    // 处理自定义标签显示
    handleSelectLabel(items) {
      const arr = [];
      items.forEach((val) => {
        let str = '';
        if (val.idPath.length) {
          val.idPath.forEach((item) => {
            str += `${this.$refs.labelTree.getNode(item).name}/`;
          });
        }
        arr.push({
          ...val,
          normalName: `${str}${val.name}`
        });
      });
      return arr;
    },
    // 标签显示 取消选中
    deleteSelect(item) {
      this.$refs.labelTree.setChecked(item.id, false);
    },
    // 按部门显示时 tree ready 事件
    searchDepartmentTreeReady() {
      const deptId = this.$store.getters.userOrg.id;
      this.$refs.searchDepartmentTree.setCurrentKey(deptId);
      const param = this.getSearchParams();
      this.$emit('search', param);
    },

    // 按分组显示时 tree ready 事件
    searchGroupTreeReady() {
      if (!this.groupTreeData.length) return;
      const selectedId = this.groupTreeData[0].id;
      this.$refs.searchGroupTree.setCurrentKey([selectedId]);
      const param = this.getSearchParams();
      this.$emit('search', param);
    },
    // 编辑 删除 分组
    showTipsBox(command, id) {
      if (command === 'editTips') {
        this.$emit('edit-group', id);
      } else if (command === 'deleteTips') {
        const groupId = { id };
        this.$emit('delete-group', groupId);
      }
    },
    // 获取检索条件
    getSearchParams() {
      let params;
      switch (this.searchType) {
        case 0: {
          params = this.getFormData();
          break;
        }
        case 1: {
          const data = this.$refs.searchGroupTree.getCurrentNode();
          if (data.flag === 'resident') { // 常驻分组
            params = {
              closed: data.closed,
              statuses: data.status
            };
          } else { // 自定义分组
            params = {
              tagId: data.id
            };
          }
          break;
        }
        case 2: {
          const data = this.$refs.searchDepartmentTree.getCurrentNode();
          params = { managementId: data.id };
          break;
        }
        default: break;
      }
      return params;
    },
    // 点击节点
    handleNodeClick() {
      const param = this.getSearchParams();
      this.$emit('search', param);
    }
  },
};
</script>

<style lang='scss' scoped>
.camera-manage-form {
  .search-department-wrap,.search-group-wrap {
    box-sizing: border-box;
    height: 100%;
    padding-bottom: 10px;
  }
  .meg-dropdown-link {
    line-height: 16px;
    cursor: pointer;
  }
  .meg-select {
    width: 100%;
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
    &:hover .meg-dropdown {
      display: block;
    }
    .meg-dropdown {
      display: none;
    }
  }
}
</style>
