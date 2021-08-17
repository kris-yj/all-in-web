<template>
  <page-layout>
    <!-- 基础检索 -->
    <base-search
      class="base-search-wrap"
      ref="baseSearch"
      :merge-srv="TextSearchSrv"
      :show-immidately="false">
    </base-search>
  </page-layout>
</template>

<script>
import BaseSearchExport from '@/modules/attribute-search/export.js';
import TextSearchSrv from '../text-search.service';
import SearchForm from '../components/search-form';
// 直接覆盖原来的检索条件
BaseSearchExport.module.components.AttributeSearchForm = SearchForm;
export default {
  components: {
    BaseSearch: BaseSearchExport.module,
  },
  data() {
    return {
      TextSearchSrv
    };
  },
  beforeCreate() {
  },
  methods: {
  }
};
</script>

<style lang="scss" scoped>
::v-deep .base-search-wrap .app-header {
  display: none;
}
::v-deep .common-form-container .header {
  display: none;
}
</style>
