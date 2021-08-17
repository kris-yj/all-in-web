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
            :label="$t('智能盒名称')">
            <meg-input
              v-model.trim="formData.name"
              :placeholder="$t('请输入{entity}',{
                entity:'智能盒名称'
              })"></meg-input>
          </meg-form-item>
          <meg-form-item
            :label="$t('智能盒型号')">
            <meg-select
              v-model="formData.model"
              filterable
              clearable
              remote
              :placeholder="$t('请输入{entity}',{
                entity:'选择盒子型号'
              })"
              @clear="clearMatchedOirginOptions"
              :remote-method="asyncOriginMatched">
              <meg-option
                v-for="item in matchedOirginOptions"
                :value="item.code"
                :label="item.value"
                :key="item.code"></meg-option>
            </meg-select>
          </meg-form-item>
          <meg-form-item
            :label="$t('归属部门')"
            class="tree-select-item">
            <meg-treeselect
              ref="deptTree"
              :data="deptTreeData"
              :props="deptTreeProps"
              :show-checkbox="true"
              :all-selected-text="$t('全部部门')"
              default-checked-all
              :show-all-checked="true"
              :placeholder-text="$t('请选择部门')"
              :expand-on-click-node="false"
              :record-dynamic-select="true"
              :standard-tree-data="true">
              <div
                style="width: 100%;"
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
                {{ data.name||data.orgName }}
              </div>
            </meg-treeselect>
          </meg-form-item>
          <meg-form-item
            :label="$t('运行状态')">
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
        </meg-form>
      </meg-scrollbar>
    </div>
  </meg-form-container>
</template>

<script>

export default {
  props: {
    deptTreeData: {
      type: Array,
      default: () => []
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
      deptTreeProps: {
        label: 'orgName',
        children: 'subOrgs'
      },
      matchedOirginOptions: [],
      formData: {
        deptIds: [], // 归属部门   ids代表数组 传什么查什么
        order: '',
        orderBy: '',
        status: '',
        name: '',
        model: ''
      },
      cameraModelOption: this.$store.getters.dataMapByType('box_megvii_mode'), //

    };
  },
  methods: {
    /**
     * 默认检索一次
     */
    initSeach() {
      this.resetClick();
      this.searchClick();
    },
    searchClick() {
      const selectDeptArray = this.$refs.deptTree.getCheckedKeys();
      // if (!selectDeptArray.length) {
      //   this.$message.warning('请选择部门');
      //   return;
      // }
      this.formData.deptIds = selectDeptArray;
      this.$emit('search-click', this.formData);
    },
    /**
     * 筛选盒子型号
     */
    asyncOriginMatched(query) {
      if (query !== '') {
        // this.originSelectLoading = true;
        setTimeout(() => {
          this.matchedOirginOptions = this.cameraModelOption.filter((item) => item.value.toLowerCase()
            .indexOf(query.toLowerCase()) > -1);
        }, 200);
      } else {
        this.matchedOirginOptions = [];
      }
    },
    /**
     * @description 搜索型号清空时触发
     */
    clearMatchedOirginOptions() {
      this.matchedOirginOptions = [];
    },
    resetClick() {
      this.$refs.deptTree.setCheckedKeys([this.$store.getters.userOrg.id]);
      this.formData = {
        deptIds: [],
        status: '',
        order: '',
        orderBy: '',
        name: '',
        model: ''
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
