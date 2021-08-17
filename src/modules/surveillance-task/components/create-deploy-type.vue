<template>
  <meg-dialog
    :title="$t('新建布控类型')"
    :visible="true"
    @close="cancel"
    width="968px">
    <meg-form
      label-position="left"
      :rules="rules"
      ref="form"
      :model="form">
      <meg-form-item
        label-width="106px"
        class="name-box"
        :label="$t('布控类型名称')"
        prop="ruleName">
        <meg-input
          v-model="form.ruleName"
          :placeholder="$t('请输入{entity}', { entity:$t('布控类型名称') })"></meg-input>
      </meg-form-item>
      <meg-form-item
        class="item"
        label-width="246px"
        :label="$t('请选择该技战法需要关注的目标属性')"
        prop="ruleInfo">
      </meg-form-item>
    </meg-form>
    <common-property-setter
      class="box"
      ref="box"></common-property-setter>
    <template v-slot:footer>
      <meg-button
        type="primary"
        @click="save">
        {{ $t('保存') }}
      </meg-button>
      <meg-button
        @click="cancel">
        {{ $t('取消') }}
      </meg-button>
    </template>
  </meg-dialog>
</template>

<script>
import CommonPropertySetter from '@/common-components/common-property-setter';
import rules from '../surveillance-task.rule';

export default {
  name: 'CreateDeployType',
  components: {
    CommonPropertySetter
  },
  props: {},
  data() {
    return {
      form: {
        ruleName: '',
        ruleInfo: '',
      },
      rules: rules.createType
    };
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  methods: {
    save() {
      const arr = this.$refs.box.getProperties();
      const map = {};
      arr.forEach((val) => {
        if (!map[val.parentInfo.id]) {
          map[val.parentInfo.id] = {};
        }
        if (val.value && val.value.length) {
          if (map[val.parentInfo.id][val.attrKey]) {
            map[val.parentInfo.id][val.attrKey].push(val.value);
          } else {
            map[val.parentInfo.id][val.attrKey] = Array.isArray(val.value) ? val.value : [val.value];
          }
        }
        if (Object.keys(map[val.parentInfo.id]).length === 0) {
          delete map[val.parentInfo.id];
        }
      });
      if (Object.keys(map).length === 0) {
        this.$message.error(this.$t('创建失败，需至少选择一项目标属性信息'));
        return;
      }
      this.form.ruleInfo = JSON.stringify(map);
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.$emit('save', this.form);
        }
      });
    },
    /**
     * @description 关闭弹窗
     */
    cancel() {
      this.$emit('close');
    },
  },
};
</script>
<style lang="scss" scoped>
.item {
  ::v-deep.meg-form-item__label {
    &::before {
      content: "*";
      color: #f05353;
      margin-right: 4px;
    }
  }
}
.name-box {
  width: 366px;
}
.box {
  height: 418px;
}
</style>
