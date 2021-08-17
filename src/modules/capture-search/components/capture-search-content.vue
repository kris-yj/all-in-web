<template>
  <div
    class="common-cluster-list"
    v-loading="loading">
    <common-collapse
      ref="collapse"
      v-model="nowIndex"
      :categories="clusterList"
      :list="captureList"
      :total-records="totalRecords"
      :loading="listLoading"
      list-fetch="outer"
      @load-list="fetchData"
      @check-list-change="handleCheckChange"
      @change="categoryChange">
      <template
        v-slot="{item, index, list}">
        <common-card
          jump-module="search"
          :date-time="dateTime"
          :card-data="item"
          :draggable="true"
          :is-show-base-button="listCardButtons"
          drag-type="img"
          @click.native.stop="showDetail({item, index, list})">
        </common-card>
      </template>
    </common-collapse>
  </div>
</template>
<script>
import CommonCollapse from '@/common-components/common-collapse';
// import CommonCard from '@/common-components/common-card';
import CommonCard from '@/common-components/common-new-card';

export default {
  components: {
    CommonCollapse,
    CommonCard
  },
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    listLoading: {
      type: Boolean,
      default: false
    },
    // 聚类列表
    clusterList: {
      type: Array,
      default: () => []
    },
    captureList: {
      type: Array,
      default: () => []
    },
    totalRecords: {
      type: Number,
      default: 0
    },
    // 暂存架&携图跳转按钮
    listCardButtons: {
      type: Array,
      default: undefined
    },
    dateTime: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      nowIndex: 0
    };
  },
  computed: {
  },
  watch: {
    // 由于风琴褶内部重置了index但未触发change事件，所以，这里需要手动重置一下newIndex
    clusterList() {
      this.nowIndex = 0;
    },
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
     * @description 获取已经选中的item
     */
    getCheckedItems() {
      return this.$refs.collapse.getCheckedItems();
    },
    /**
     * @description 展示详情
     */
    showDetail(data) {
      this.$emit('show-detail', data);
    },
    /**
     * @description 拉取当前列表
     */
    fetchData(pageNo, pageSize) {
      this.$emit('fetch-data', pageNo, pageSize, this.nowIndex);
    },
    /**
     * @description 当前的褶发生改变的时候
     */
    categoryChange(index) {
      this.$emit('change', index);
    }
  }
};
</script>
<style scoped lang="scss">
.common-cluster-list {
  height: 100%;
}
</style>
