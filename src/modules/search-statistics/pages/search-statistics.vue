<template>
  <page-layout>
    <common-layout>
      <!-- 左侧检索条件 -->
      <search-form
        slot="left"
        :dept-tree="deptTree"
        :database-tree="databaseTree"
        @search="searchClick"></search-form>
      <div
        class="statistics-content"
        slot="right">
        <div class="statistics-header">
          <div class="statistics-title"></div>
          <div class="statistics-tab">
          </div>
          <div class="statistics-export">
            <meg-button
              v-if="exportShow"
              @click="getSearchExport">
              导出报表
            </meg-button>
          </div>
        </div>
        <div
          v-loading="isLoading"
          class="statistics-body">
          <div class="statistics-wrap">
            <div
              ref="search"
              class="search-number">
              <div class="template-title">
                {{ $t("检索次数态势") }}
              </div>
              <meg-line
                ref="line"
                :extend="searchNumberOptions"
                height="100%">
                <data-empty v-show="!tendencyData.daySearchList.length"></data-empty>
              </meg-line>
            </div>
          </div>
          <div class="statistics-wrap">
            <div
              ref="dept"
              class="dept-search">
              <div class="template-title">
                {{ $t("部门检索统计") }}<span class="topNumber">{{ $t("TOP10") }}</span>
              </div>
              <meg-histogram
                :extend="deptSearchOptions"
                height="100%">
                <data-empty v-show="!tendencyData.departSearchList.length"></data-empty>
              </meg-histogram>
            </div>
            <div
              ref="database"
              class="database-search">
              <div class="template-title">
                {{ $t("底库检索") }}<span class="topNumber">{{ $t("TOP5") }}</span>
              </div>
              <bar
                :title="`单位:${tendencyData.albumSearchUnit.unit}`"
                :data="databaseOption">
                <data-empty v-show="!tendencyData.albumSearchList.length"></data-empty>
              </bar>
            </div>
          </div>
        </div>
      </div>
    </common-layout>
  </page-layout>
</template>

<script>
import CommonLayout from '@/common-components/common-layout';
import chartOption from '@/components/chart/chart.common';
import bar from '@/components/chart/bar';
import DataEmpty from '@/components/chart/data-empty';
import SearchForm from '../components/search-form';
import searchStatisticsSrv from '../search-statistics.service';

export default {
  components: {
    CommonLayout,
    SearchForm,
    bar,
    DataEmpty
  },
  data() {
    return {
      isEmpty: false,
      isLoading: true,
      searchData: {},
      histogram: chartOption.histogram,
      line: chartOption.line,
      tendencyData: {
        departSearchList: [],
        albumSearchList: [],
        daySearchList: [],
        albumSearchUnit: { unit: '个' },
        daySearchUnit: { unit: '个' },
        departSearchUnit: { unit: '个' }
      },
      deptTree: [],
      databaseTree: [],
      dualPlatformType: this.$store.getters.system.dualPlatformType.value === '1', // 是否公安网
    };
  },
  computed: {
    exportShow() {
      return this.$store.getters.modulePermissonsByAlias('search-statistics', 'search-statistics-export');
    },
    /**
     * 检索次数统计
     */
    searchNumberOptions() {
      const options = {
        x: [],
        y: [],
        isSymbol: true,
        title: `单位:${this.tendencyData.daySearchUnit.unit}`
      };
      this.tendencyData.daySearchList.forEach((item) => {
        options.x.push(item.searchDay);
        options.y.push(item.count);
      });
      return this.line(options);
    },
    /**
     * 组装部门检索统计数据
     */
    deptSearchOptions() {
      const options = {
        x: [],
        y: [],
        title: `单位:${this.tendencyData.departSearchUnit.unit}`
      };
      this.tendencyData.departSearchList.forEach((item) => {
        options.y.push(item.department.name);
        options.x.push(item.count);
      });
      return this.histogram(options);
    },
    /**
     * 底库检索统计
     */
    databaseOption() {
      return this.tendencyData.albumSearchList.map((item) => ({
        name: item.album.name,
        count: item.count,
        series: [
          {
            name: item.album.name,
            key: 'count',
            count: item.count
          }
        ]
      }));
    }
  },
  created() {
    this.getDeptTree();
    this.getDatabaseList();
  },
  methods: {
    searchClick(params) {
      this.searchData = params;
      this.getDashboardData();
    },
    /**
     * @description 获取部门树
     */
    async getDeptTree() {
      const params = {
        orgId: this.$store.getters.userOrg.id
      };
      const res = await searchStatisticsSrv.getDeptTree(params);
      if (res.code === 0) {
        this.deptTree = [res.data];
      }
    },
    /**
     * 获取底库列表
     */
    async getDatabaseList() {
      const params = {
        deployObject: [1, 2, 3, 4, 5],
        type: [1],
        srcType: [1]
      };
      if (!this.dualPlatformType) {
        params.srcType = [1];
        params.platformType = 0;
      }
      const res = await searchStatisticsSrv.getDatabaseList(params);
      if (res.code !== 0) {
        return;
      }
      if (res.data.length) {
        this.databaseTree = [{
          id: 'all',
          name: '全部',
          items: res.data
        }];
      } else {
        this.databaseTree = [];
      }
    },
    /**
     * 获取统计信息
     */
    async getDashboardData() {
      this.isLoading = true;
      const res = await searchStatisticsSrv.getDashboardData(this.searchData);
      this.isLoading = false;
      if (res.code === 0) this.tendencyData = res.data;
    },
    /**
     * 导出报表
     */
    async getSearchExport() {
      if (this.isPending) return;
      this.isPending = true;
      const searchCountStaticImg = await chartOption.generatorImage(this.$refs.search);
      const deptStaticImg = await chartOption.generatorImage(this.$refs.dept);
      const albumStaticImg = await chartOption.generatorImage(this.$refs.database);
      const params = {
        ...this.searchData,
        searchCountStaticImg,
        deptStaticImg,
        albumStaticImg
      };
      const res = await searchStatisticsSrv.getSearchExport(params);
      this.isPending = false;

      if (res.code === 0) this.$message.success('导出成功，请前往任务列表下载');
    }
  }
};
</script>

<style lang="scss" scoped>
.statistics-header {
  height: 56px;
  display: flex;
  justify-content: space-between;
  align-items: center;

}
.statistics-export,.statistics-title{
  width: 96px;
}
.statistics-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding-right: 18px;
  padding-bottom: 18px;
  box-sizing: border-box;
}
.statistics-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.statistics-wrap {
  flex: 1;
  display: flex;
}
.template-title {
  position: absolute;
  top: 20px;
  left: 20px;
  font-size: 14px;
  color: #435068;
}
.topNumber {
  color: #41A8F7;
  font-size: 16px;
  padding-left: 6px;
  font-family: 'HEMIHEAD';
}
.search-number, .database-search, .dept-search{
  position: relative;
  background: #fff;
  padding-top: 36px;
  box-sizing: border-box;
  flex: 1;
}
.search-number {
  margin-bottom: 10px;
}
.dept-search {
  margin-right: 10px;
  flex:2
}
</style>
