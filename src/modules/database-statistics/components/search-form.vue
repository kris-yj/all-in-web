<template>
  <!-- 左侧检索条件 -->
  <common-form-container
    :content-style="{ 'padding': '20px 0 0' }"
    @reset="resetClick"
    @search="searchClick">
    <template slot="header">
      底库统计
    </template>
    <meg-form
      ref="searchForm"
      class="search-form"
      label-position="top">
      <meg-form-item :label="$t('底库')">
        <meg-treeselect
          ref="database"
          :show-checkbox="true"
          :default-checked-all="true"
          :props="{children: 'items', label: 'name'}"
          :search-placeholder="$t('输入底库名进行搜索')"
          @tree-update-ready="databaseReadyTree"
          :data="databaseTree">
        </meg-treeselect>
      </meg-form-item>
    </meg-form>
  </common-form-container>
</template>

<script>
import CommonFormContainer from '@/common-components/common-form-container';

export default {
  components: {
    CommonFormContainer
  },
  props: {
    databaseTree: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      isResolved: 0
    };
  },
  created() {
  },
  methods: {
    databaseReadyTree() {
      if (this.isResolved === 1) this.searchClick();
      this.isResolved += 1;
    },
    // 表单重置
    resetClick() {
      this.$refs.database.setCheckedKeys('ALL');
    },
    // 表单检索
    searchClick() {
      const albumIds = this.$refs.database.getCheckedKeys((item) => item.id !== 'all');
      const params = {
        albumIds
      };
      this.$emit('search', params);
    },

  }
};
</script>

<style lang="scss" scoped>
::v-deep .meg-form-item:last-child {
  margin-bottom: 0;
}
.search-form {
  padding: 0 25px 0;
}
</style>
