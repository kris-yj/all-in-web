<template>
  <page-layout>
    <div class="results__all">
      <div class="results__data">
        <results-data
          :count-data="countData">
        </results-data>
      </div>
      <results-content
        @get-count="getCountData"
        tag="div"
        ref="results"
        name="resultsContent">
      </results-content>
    </div>
  </page-layout>
</template>

<script>
import ResultsData from '../components/results-data.vue';
import ResultsContent from '../components/results-content.vue';
import ResultSrv from '../results.service.js';

export default {
  components: {
    ResultsData,
    ResultsContent
  },
  data() {
    return {
      countData: {},

    };
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.getCountData();
    },
    /**
     * 获得战果统计信息
     * @param
     * @returns
     */
    getCountData() {
      ResultSrv.getStatistics().then((response) => {
        if (response.code === 0) {
          this.countData = response.data;
        }
      });
    },
  }
};
</script>

<style lang="scss" scoped>
.results__all {
  width: 100%;
  height: 100%;
  display: flex;
}
.results__data {
  width: 320px;
  height: 100%;
}
</style>
