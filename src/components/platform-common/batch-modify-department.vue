<template>
  <meg-dialog
    class="batch-modify-department"
    @close="closeDialog"
    append-to-body
    :title="isModifyType ? $t('变更卡口类型'): $t('变更归属')"
    width="450px"
    :visible="true">
    <template>
      <div class="tree-box">
        <meg-form
          :model="formData"
          :validate-on-rule-change="false"
          ref="batchForm"
          :rules="rules"
          label-width="90px">
          <meg-form-item
            v-if="isModifyType"
            :label="$t('卡口类型')"
            class="item-select"
            prop="bayonetType">
            <!-- TODO -->
            <meg-select
              v-model="formData.bayonetType">
              <meg-option
                v-for="item in bayonetType()"
                :key="item.code"
                :label="item.value"
                :value="item.code">
              </meg-option>
            </meg-select>
          </meg-form-item>
          <meg-form-item
            v-else
            class="camera-dept"
            :label="$t('责权部门')"
            prop="deptId">
            <meg-treeselect
              ref="tree"
              :data="treeData"
              :highlight-current="true"
              :standard-tree-data="true"
              :expand-on-click-node="false"
              :show-dept-icon="true"
              :single-check="true"
              :hide-popover-when-checked="true"
              :show-count="false"
              :props="treeProps"
              @node-click="deptTreeClick"
              :selected-count-text="$t('已选择 {count}')"
              :placeholder-text="$t('请选择部门')"
              :all-selected-text="$t('所有部门')"
              :search-placeholder="$t('请输入关键词检索')">
            </meg-treeselect>
          </meg-form-item>
        </meg-form>
      </div>
    </template>
    <span slot="footer">
      <meg-button
        type="primary"
        @click="confirm">{{ $t('保存') }}</meg-button>
    </span>
  </meg-dialog>
</template>

<script>
export default {
  name: 'BatchModifyDepartment',
  components: {},
  props: {
    treeData: {
      type: Array,
      default: () => []
    },
    isModifyType: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      treeProps: {
        children: 'subOrgs',
        label: 'orgName'
      },
      type: '',
      formData: {
        bayonetType: '',
        deptId: '',
      },
      rules: {
        bayonetType: [
          { required: true, message: this.$t('请选择卡口类型'), trigger: 'change' },
        ],
        deptId: [
          { required: true, message: this.$t('请选择责权部门'), trigger: 'blur' }
        ]
      }
    };
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {
    // this.type = this.filterCameraType[0].code;
  },
  methods: {
    /**
     * @description 部门树被点击时
     * @param {Object} node
     * @returns
     */
    deptTreeClick(node) {
      this.formData.deptId = node.id;
    },
    /**
     * @description 确认更改部门归属
     */
    confirm() {
      this.$refs.batchForm.validate((valid) => {
        if (valid) {
          this.$emit('confirm', this.formData);
        }
      });
    },
    /**
     * @description 关闭弹窗
     */
    closeDialog() {
      this.$emit('close-dialog');
    },
    bayonetType() {
      return this.$store.getters.dataMapByType('bayonet_type');
    },
  },
};
</script>
<style lang="scss" scoped>
.batch-modify-department {
  .tree-box-lable {
    line-height: 34px;
    text-indent: 2px;
  }
  .tree-box {
    height: 50px;
    width: 350px;
    // display: flex;
    // align-items: center;
    // justify-content: center;
    padding: 10px 20px;
    margin: 10px;
    .meg-select {
      width: 100%;
    }
  }
}
</style>
