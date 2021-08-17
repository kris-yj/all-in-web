<template>
  <page-layout>
    <common-layout>
      <!-- 左侧检索条件 -->
      <search-form
        slot="left"
        :dept-tree="deptTree"
        :person-tree="personTree"
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
              @click="getWorkExport">
              导出报表
            </meg-button>
          </div>
        </div>
        <div
          v-loading="isLoading"
          class="statistics-body">
          <number-list
            :data="tendencyData"
            :options="infoOption"></number-list>
          <div class="statistics-wrap">
            <div
              ref="alarm"
              class="alarm-number">
              <div class="template-title">
                {{ $t("报警处理量") }}
              </div>
              <meg-histogram
                :extend="alarmOptions"
                height="100%">
                <data-empty v-show="isEmpty"></data-empty>
              </meg-histogram>
            </div>
            <div
              ref="results"
              class="results-number">
              <div class="template-title">
                {{ $t("战果处理量") }}
              </div>
              <meg-histogram
                :extend="resultsOptions"
                height="100%">
                <data-empty v-show="isEmpty"></data-empty>
              </meg-histogram>
            </div>
          </div>
          <div class="statistics-wrap">
            <div class="work-number">
              <div class="template-title">
                {{ $t("工作量分布") }} <span class="work-user-number">注册员工数: {{ tendencyData.allUserCount }};使用员工数: {{ tendencyData.userdUserCount }};</span>
              </div>
              <meg-table
                stripe
                key="userId"
                :data="tendencyData.item"
                center="true"
                height="100%"
                style="width: 100%">
                <div
                  slot="empty"
                  v-background="isEmpty&&!isLoading">
                </div>
                <meg-table-column
                  v-for="item in columns"
                  :label="item.label"
                  :sortable="item.sortable"
                  :prop="item.prop"
                  :key="item.prop"
                  :align="item.align">
                </meg-table-column>
              </meg-table>
            </div>
          </div>
        </div>
      </div>
    </common-layout>
  </page-layout>
</template>

<script>
import CommonLayout from '@/common-components/common-layout';
import NumberList from '@/components/chart/number-list';
import chartOption from '@/components/chart/chart.common';
import DataEmpty from '@/components/chart/data-empty';
import SearchForm from '../components/search-form';
import workloadStatisticsSrv from '../workload-statistics.service';

export default {
  components: {
    CommonLayout,
    SearchForm,
    NumberList,
    DataEmpty,
  },
  data() {
    return {
      searchData: {},
      histogram: chartOption.histogram,
      stackHistogram: chartOption.stackHistogram,
      deptTree: [],
      type: 'user',
      personTree: [],
      tendencyData: {
        warningSum: 0,
        designateSum: 0,
        receiveSum: 0,
        finishSum: 0,
        searchSum: 0,
        judgeSum: 0,
        allUserCount: 0,
        userdUserCount: 0,
        item: []
      },
      isLoading: true,
      infoOption: [
        {
          icon: 'alarmRealtime_menu',
          label: this.$t('报警总数'),
          key: 'warningSum'
        },
        {
          icon: 'alarm-designate',
          label: this.$t('派警总数'),
          key: 'designateSum'
        },
        {
          icon: 'alarm-receive',
          label: this.$t('总接收数'),
          key: 'receiveSum'
        },
        {
          icon: 'success',
          label: this.$t('总办结数'),
          key: 'finishSum'
        },
        {
          icon: 'serach-photo',
          label: this.$t('总检索数'),
          key: 'searchSum'
        },
        {
          icon: 'judge',
          label: this.$t('总研判数'),
          key: 'judgeSum'
        }
      ],
    };
  },
  computed: {
    columns() {
      return [
        {
          label: this.isUser ? '员工名称' : '部门名称',
          prop: this.isUser ? 'userName' : 'departName',
          sortable: true,
        },
        {
          label: '报警处理量',
          prop: 'warningCount',
          sortable: true,
          align: 'center'
        },
        {
          label: '已派警',
          prop: 'designateCount',
          sortable: true,
          align: 'center'
        },
        {
          label: '已接收',
          prop: 'receiveCount',
          sortable: true,
          align: 'center'
        },
        {
          label: '已办结',
          prop: 'finishCount',
          sortable: true,
          align: 'center'
        },
        {
          label: '检索数',
          prop: 'searchCount',
          sortable: true,
          align: 'center'
        },
        {
          label: '研判数',
          prop: 'judgeCount',
          sortable: true,
          align: 'center'
        }
      ];
    },
    exportShow() {
      return this.$store.getters.modulePermissonsByAlias('workload-statistics', 'workload-statistics-export');
    },
    isUser() {
      return this.type === 'user';
    },
    isEmpty() {
      return this.tendencyData.item.length === 0;
    },
    resultsOptions() {
      const unit = this.tendencyData.item.length ? '单位:个' : '单位:-';
      const options = {
        x: [],
        y: [],
        title: unit
      };
      const list = [...this.tendencyData.item];
      // 从大到小排序
      list.sort((a, b) => b.finishCount - a.finishCount);
      list.forEach((item) => {
        options.y.push(this.isUser ? item.userName : item.departName);
        options.x.push(item.finishCount);
      });
      return this.histogram(options);
    },
    alarmOptions() {
      const val = {
        x: {
          legend: ['已接收', '已派警', '已办结'],
          colors: ['#5195EA', '#867FEB', '#EEAD38'],
          data: [[], [], []]
        },
        y: []
      };
      const list = [...this.tendencyData.item];
      // 从大到小排序
      list.sort((a, b) => (b.finishCount + b.designateCount + b.receiveCount) - (a.receiveCount + a.finishCount + a.designateCount));
      list.forEach((item) => {
        val.y.push(this.isUser ? item.userName : item.departName);
        val.x.data[0].push(item.receiveCount);
        val.x.data[1].push(item.designateCount);
        val.x.data[2].push(item.finishCount);
      });
      const unit = this.tendencyData.item.length ? '单位:个' : '单位:-';
      return this.stackHistogram(val, unit);
    }
  },
  created() {
    this.getDeptTree();
    this.getPersonTree();
  },
  methods: {
    searchClick(params, type) {
      this.searchData = params;
      this.getDashboardData(type);
    },
    /**
     * @description 获取部门树
     */
    async getDeptTree() {
      const params = {
        orgId: this.$store.getters.userOrg.id
      };
      const res = await workloadStatisticsSrv.getDeptTree(params);
      if (res.code === 0) {
        this.deptTree = [res.data];
      }
    },
    /**
     * 获取人员树
     */
    async getPersonTree() {
      const res = await workloadStatisticsSrv.getPersonTree();
      if (res.code === 0) {
        this.personTree = this.filterUserTree([res.data]);
      }
    },
    /**
     * 组装人员树
     */
    filterUserTree(data) {
      return data.map((item) => {
        if (item.subOrgs) {
          item.subOrgs = this.filterUserTree(item.subOrgs);
        }
        const users = item.users.map((user) => ({ ...user, name: user.userName }));
        return {
          ...item,
          name: item.orgName,
          flag: 'dept',
          subOrgs: [
            ...users,
            ...item.subOrgs
          ]
        };
      });
    },
    /**
     * 导出报表
     */
    async getWorkExport() {
      if (this.isPending) return;
      this.isPending = true;
      // 先导出图表截图
      const alarmDealStatisticImg = await chartOption.generatorImage(this.$refs.alarm);
      const achievementDealStatisticImg = await chartOption.generatorImage(this.$refs.results);
      const params = {
        ...this.searchData,
        alarmDealStatisticImg,
        achievementDealStatisticImg
      };
      const res = await workloadStatisticsSrv.getWorkExport(params);
      this.isPending = false;

      if (res.code === 0) this.$message.success('导出成功，请前往任务列表下载');
    },
    /**
     * 获取页面数据
     */
    async getDashboardData(type) {
      this.isLoading = true;
      const res = await workloadStatisticsSrv.getDashboardData(this.searchData);
      this.type = type;
      this.isLoading = false;
      if (res.code === 0) {
        this.tendencyData = {
          item: [],
          ...res.data
        };
      }
    },
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
.work-number, .alarm-number,.results-number {
  position: relative;
  background: #fff;
  padding-top: 36px;
  box-sizing: border-box;
  flex: 1;
}
.alarm-number {
  margin-right: 10px;
}
.work-number {
  margin-top: 10px;
  padding-left: 20px;
}
.work-user-number {
  font-size: 12px;
  color: #869ABB;
}

</style>
