<template>
  <meg-dialog
    class="edit"
    @close="closeDialog"
    append-to-body
    :show-cancel="false"
    @confirm="confirm"
    width="560px"
    :title="$t('编辑')"
    :visible="true">
    <template>
      <div class="form-box">
        <meg-form
          :model="formData"
          :rules="rules"
          ref="editForm"
          label-width="140px">
          <meg-form-item
            :label="$t('相机名称')"
            prop="name">
            <meg-input
              v-model.trim="formData.name"
              :placeholder="$t('请输入{from}-{to}个字',{
                from:2,
                to:50
              })"></meg-input>
          </meg-form-item>
          <meg-form-item
            :label="platformType === 'gb' ? $t('国标ID') : $t('视图库平台设备ID')"
            prop="gbDeviceId">
            <!-- TODO -->
            <meg-input
              :disabled="true"
              v-model.trim="formData.gbDeviceId"
              :placeholder="$t('请输入{from}-{to}个字符',{
                from:1,
                to:20
              })"></meg-input>
          </meg-form-item>
          <!-- 编辑的时候因IOT底层不支持设备类型更改 -->
          <meg-form-item
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
            class="camera-dept"
            :label="$t('责权部门')"
            prop="deptId">
            <meg-treeselect
              ref="deptTree"
              :standard-tree-data="true"
              :show-count="false"
              :data="treeData"
              :props="defaultProps"
              :single-check="true"
              default-expand-all
              highlight-current
              :placeholder-text="$t('请选择责权部门')"
              @node-click="handleNodeClick">
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
  name: 'Edit',
  components: {},
  props: {
    detail: {
      type: Object,
      default: () => {}
    },
    treeData: {
      type: Array,
      default: () => []
    },
    platformType: {
      type: String,
      default: 'gb'
    }
  },
  data() {
    return {
      defaultProps: {
        children: 'subOrgs',
        label: 'orgName'
      },
      formData: {

      },
      rules: {
        name: [
          { required: true, message: this.$t('请输入相机名称'), trigger: 'blur' },
          {
            min: 2,
            max: 50,
            message: this.$t('长度在 {from} 到 {to} 个字符', {
              from: 2,
              to: 50
            }),
            trigger: 'blur'
          }
        ],
        type: [
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
    this.formData = JSON.parse(JSON.stringify(this.detail));
    this.$nextTick(() => {
      this.$refs.deptTree.setCurrentKey(this.formData.deptId);
    });

    // this.$nextTick(() => {
    //   this.$refs.deptTree.setCurrentKey('6e9232ef-7b84-11e8-86b1-6c92bf4e6960');
    // });
  },
  methods: {
    /**
     * @description 保存编辑
     */
    confirm() {
      this.$refs.editForm.validate((valid) => {
        if (valid) {
          this.$emit('confirm', this.formData);
        }
      });
    },
    /**
     * @description 选择责权部门
     * @param {Object} data 当前节点对象
     */
    handleNodeClick(data) {
      console.log(data);
      this.formData.deptId = data.id;
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
.edit {
  .form-box {
    width: 450px;
    margin-top: 30px;
    height: 350px;
    .item-select {
      .meg-select {
        width: 100%;
      }
    }
  }
}
</style>
