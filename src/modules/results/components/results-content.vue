<template>
  <div class="results__content">
    <results-lists
      :loading="loading"
      :video-back="videoBack"
      @delete="deleteResults"
      @search="onSearch"
      :results-lists="resultsLists">
    </results-lists>
    <div
      v-if="resultsLists.length"
      class="results__page">
      <meg-pagination
        :total="totalRecords"
        @size-change="sizeChange"
        @current-change="currentChange">
      </meg-pagination>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import ResultSrv from '@/modules/results/results.service.js';
import ResultsLists from './results-lists.vue';

moment.locale('zh-cn');
export default {
  components: {
    ResultsLists,
  },
  props: {
    creatState: {
      type: Boolean,
      default: false
    },
    editorState: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      videoBack: false,
      totalRecords: 0,
      resultsLists: [],
      resultsPageDate: {
        start: 0,
        end: '',
        key: '',

      },
      pageInfo: {
        pageNo: 1,
        pageSize: 20
      },
      resultsPage: {},
      resultsParams: {
        start: 0,
        end: '',
        key: '',
        pageNo: 1,
        pageSize: 20
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {

    onSearch(data) {
      this.innerData = { ...data };
      this.getList();
    },
    /**
     * 删除战果
     * @param {id} 战果id
     * @returns
     */
    deleteResults(id) {
      ResultSrv.delete({ id }).then((response) => {
        if (response.code === 0) {
          this.$emit('get-count');
          this.getList();
          this.$message({
            type: 'success',
            message: this.$t('删除成功!'),
          });
        }
      });
    },
    /**
     * 发布战果
     * @param {val} 战果信息
     * @returns
     */
    newResults(val) {
      this.$emit('create', val);
    },
    /**
     * 获取input输入值
     * @param {val} input值
     * @returns
     */
    inputValue(val) {
      this.resultsParams.key = val;
      console.log(val);
    },
    /**
     * @description 检索列表
     * @returns
     */
    getList() {
      this.loading = true;
      this.videoBack = false;
      const params = { ...this.innerData, ...this.pageInfo };

      ResultSrv.getList(params).then((response) => {
        this.loading = false;
        if (response.code === 0) {
          this.totalRecords = response.data.totalRecords;
          const list = [...response.data.records];
          if (list.length === 0) {
            this.videoBack = true;
            this.resultsLists = [];
            return;
          }
          list.forEach((item) => {
            item.archiveTime = moment(item.archiveTime).format('YYYY-MM-DD');
          });
          this.resultsLists = list;
        }
      });
    },
    /**
     * 分页容量改变触发
     * @param {e} 改变值
     * @returns
     */
    sizeChange(e) {
      this.pageInfo.pageSize = e;
      this.getList();
    },
    /**
     * 分页码改变触发
     * @param {e} 改变值
     * @returns
     */
    currentChange(e) {
      this.pageInfo.pageNo = e;
      this.getList();
    },
  },

};
</script>

<style lang='scss' scoped>
.results__content {
  width: 100%;
  height: 100%;
  background: #eceeef;
  flex: 1;
  overflow: hidden;
}
.results__page {
  height: 50px;
  background-color: white;
  margin: 0 20px;
  padding-top: 11px;
  box-sizing: border-box;
}

.meg-pagination {
  padding: 0;
}
</style>
