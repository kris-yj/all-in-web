<template>
  <div
    class="common-cluster-list"
    v-loading="loading">
    <common-collapse
      ref="collapse"
      v-model="nowIndex"
      :categories="result"
      :list-key="'records'"
      :list-fetch="'innerPage'"
      :page-size="60"
      :loading="loading"
      @check-list-change="handleCheckChange">
      <template
        v-slot="{item, index}">
        <common-card
          cascade
          :card-data="item"
          :draggable="true"
          drag-type="img"
          @click.native.stop="showDetail(index)">
        </common-card>
      </template>
    </common-collapse>
  </div>
</template>
<script>
import CommonCollapse from '@/common-components/common-collapse';
import CommonCard from '@/common-components/common-card';

export default {
  components: {
    CommonCollapse,
    CommonCard
  },
  model: {
    prop: 'activeIndex',
    event: 'change'
  },
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    result: { // 检索结果
      type: Array,
      default: () => []
    },
    activeIndex: { // 选中聚合index
      type: Number,
      default: 0
    },
  },
  data() {
    return {
      nowIndex: 0
    };
  },
  watch: {
    nowIndex: {
      handler(val) {
        if (typeof val === 'number') {
          this.$emit('change', val);
        }
      },
      immediate: true
    }
  },
  methods: {
    /**
     * @description 清除卡片选中
     */
    cancelSelect() {
      this.$refs.collapse.cancelSelect();
    },
    /**
     * @description 卡片选中的事件
     */
    handleCheckChange(list) {
      this.$emit('check-list-change', list);
    },
    /**
     * @description 展示详情
     */
    showDetail(index) {
      this.$emit('show-detail', index);
    }
  }
};
</script>
<style scoped lang="scss">
  .common-cluster-list{
    height: 100%;
  }
</style>
