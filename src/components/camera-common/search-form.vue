<template>
  <meg-form-container
    @search="searchClick"
    @reset="resetClick"
    class="cameraSearch-form">
    <span slot="title"></span>
    <div
      class="cameraSearch-form_wrap"
      slot="otherFormElement">
      <meg-scrollbar>
        <meg-form
          label-position="top">
          <meg-form-item
            :label="$t('相机名称')">
            <meg-input
              v-model.trim="formData.name"
              :placeholder="$t('请输入相机名称')"></meg-input>
          </meg-form-item>
          <meg-form-item
            :label="$t('相机类型')">
            <meg-select v-model="formData.type">
              <meg-option
                value=""
                :label="$t('全部')"></meg-option>
              <meg-option
                v-for="item in filterCameraType()"
                :key="item.code"
                :value="item.code"
                :label="item.value"></meg-option>
            </meg-select>
          </meg-form-item>
          <meg-form-item
            :label="$t('责权部门')"
            class="tree-select-item">
            <meg-treeselect
              ref="deptTree"
              :data="deptTreeData"
              :props="deptTreeProps"
              :show-checkbox="true"
              default-checked-all
              :all-selected-text="$t('全部部门')"
              :show-all-checked="true"
              :placeholder-text="$t('请选择归属部门')"
              :expand-on-click-node="false"
              :record-dynamic-select="true"
              :standard-tree-data="true">
              <div
                style="width: 100%;"
                v-tooltip="true"
                slot-scope="{ data }">
                <meg-icon
                  color="#46a653"
                  size="14"
                  name="department"></meg-icon>
                {{ data.orgName }}
              </div>
            </meg-treeselect>
          </meg-form-item>
          <meg-form-item
            :label="$t('分组')"
            class="tree-select-item">
            <meg-treeselect
              ref="groupTree"
              :data="groupTreeAll"
              :props="treeProps"
              :show-checkbox="true"
              :all-selected-text="$t('全部分组')"
              :expand-on-click-node="false"
              :placeholder-text="$t('请选择分组')"
              :record-dynamic-select="true"
              :standard-tree-data="true">
            </meg-treeselect>
          </meg-form-item>
          <meg-form-item
            :label="$t('网络状态')">
            <meg-radio-group
              v-model="formData.status">
              <meg-radio label="">
                {{ $t('全部') }}
              </meg-radio>
              <meg-radio :label="0">
                {{ $t('在线') }}
              </meg-radio>
              <meg-radio :label="1">
                {{ $t('掉线') }}
              </meg-radio>
            </meg-radio-group>
          </meg-form-item>
          <meg-form-item
            :label="$t('IP地址')">
            <meg-input
              v-model.trim="formData.ipAddr"
              :placeholder="$t('请输入IP地址')"></meg-input>
          </meg-form-item>
          <meg-form-item
            :label="$t('国标设备ID')">
            <meg-input
              v-model.trim="formData.gbPlatformDeviceId"
              :placeholder="$t('请输入国标设备ID')"></meg-input>
          </meg-form-item>
          <meg-form-item
            :label="$t('卡口类型')">
            <meg-select v-model="formData.bayonetType">
              <meg-option
                value=""
                :label="$t('全部')"></meg-option>
              <meg-option
                v-for="item in bayonetTypeOption"
                :key="item.code"
                :value="item.code"
                :label="item.value"></meg-option>
            </meg-select>
          </meg-form-item>
          <meg-form-item
            :label="$t('协议')">
            <meg-select v-model="formData.manufacturId">
              <meg-option
                value=""
                :label="$t('全部')"></meg-option>
              <meg-option
                v-for="item in manufactureOption"
                :key="item.code"
                :value="item.code"
                :label="item.value"></meg-option>
            </meg-select>
          </meg-form-item>
        </meg-form>
      </meg-scrollbar>
    </div>
  </meg-form-container>
</template>

<script>
import _ from 'lodash';

export default {
  props: {
    deptTreeData: {
      type: Array,
      default: () => []
    },
    groupTreeData: {
      type: Array,
      default: () => []
    },
    manufactureOption: {
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
    bayonetTypeOption: {
      type: Array,
      default: () => []
    },
  },
  data() {
    return {
      treeProps: {
        label: 'name',
        children: 'items'
      },
      deptTreeProps: {
        label: 'orgName',
        children: 'subOrgs'
      },
      formData: {
        deptIds: [], // 归属部门
        tagIds: [], // 分组id
        order: '', // 排序字段
        orderBy: '', // 升序降序
        // placeIds: [], // 区域id
        // closed: '', // 启用状态
        status: '', // 运行状态
        name: '', // 相机名称
        location: '', // 相机位置
        locationType: '', // 相机位置类型
        model: '', // 相机型号
        type: '', // 相机类型
        gbPlatformDeviceId: '', // 国标设备ID
        ipAddr: '', // IP地址
        manufacturId: '', // 厂商id
        bayonetType: '', // 卡口类型
      },
      cameraTypeOption: this.$store.getters.dataMapByType('camera_type'),
      cameraModelOption: this.$store.getters.dataMapByType('camera_model'),
    };
  },
  computed: {
    groupTreeAll() {
      const list = _.filter(this.groupTreeData, (item) => item.flag !== 'resident');
      return [{
        id: '0', flag: 'all', name: this.$t('全部'), items: list
      }];
    }
  },
  methods: {
    /**
     * @description 默认检索一次
     * @param {Object} data 默认的搜索条件
     */
    initSeach(data = {}) {
      this.resetClick();
      this.searchClick(data);
    },
    /*
    * 过滤相机类型
    */
    filterCameraType() {
      return this.cameraTypeOption.filter((item) => !item.extra);
    },
    /**
     * @description 点击检索
     * @param {Object} data 默认的搜索条件
     */
    searchClick(data = {}) {
      const selectDeptArray = this.$refs.deptTree.getCheckedKeys();
      const selectGroupArray = this.$refs.groupTree.getCheckedKeys((item) => item.flag === 'tag');
      this.formData.deptIds = selectDeptArray;
      this.formData.tagIds = selectGroupArray;
      this.formData = Object.assign(this.formData, data);
      const params = _.cloneDeep(this.formData);
      if (this.formData.type) {
        params.type = [this.formData.type];
      }
      if (this.formData.bayonetType) {
        params.bayonetType = [this.formData.bayonetType];
      }
      this.$emit('search-click', params);
    },
    /**
     * 点击重置
     */
    resetClick() {
      this.$refs.deptTree.setCheckedKeys([this.$store.getters.userOrg.id]);
      this.$refs.groupTree.setCheckedKeys([]);
      this.formData = {
        deptIds: [], // 归属部门
        tagIds: [], // 分组id
        order: '', // 排序字段
        orderBy: '', // 升序降序
        placeIds: [], // 区域id
        closed: '', // 启用状态
        status: '', // 运行状态
        name: '', // 相机名称
        location: '', // 相机位置
        locationType: '', // 相机位置类型
        model: '', // 相机型号
        type: '', // 相机类型
        gbPlatformDeviceId: '',
        ipAddr: '', // IP地址
        manufacturId: '', // 厂商id
        bayonetType: '', // 卡口类型
      };
      this.$emit('reset-click');
    }
  }
};
</script>

<style lang="scss">
.cameraSearch-form {
  position: relative;
  top: -53px;
  width: 320px;
  height: calc(100% + 70px);

  .cameraSearch-form_wrap {
    height: calc(100% - 70px);

    .meg-select {
      width: 100%;
    }

    .meg-form {
      padding: 20px 25px 0 20px;
      box-sizing: border-box;
    }

    .tree-select-item {
      max-height: 160px;
      height: auto;
    }
  }
}
</style>
