<template>
  <page-layout>
    <common-layout>
      <!-- 左侧检索条件 -->
      <search-form
        slot="left"
        :deploy-list="deployList"
        :database-tree="databaseTree"
        @search="searchClick"></search-form>
      <div
        class="statistics-content"
        slot="right">
        <div class="statistics-header">
          <div class="statistics-title"></div>
          <div class="statistics-tab">
            <meg-radio-group
              @change="tabTypeChange"
              v-model="tabType">
              <meg-radio-button
                v-for="item in typeOptions"
                :key="item.value"
                :label="item.value">
                {{ item.label }}
              </meg-radio-button>
            </meg-radio-group>
          </div>
          <div class="statistics-export">
            <meg-button
              v-if="exportShow"
              @click="exportTable">
              导出报表
            </meg-button>
          </div>
        </div>
        <heat-template
          ref="heat"
          :heat-data="heatData"
          :is-loading="isLoading"
          v-if="tabType==='heat'"></heat-template>
        <tendency-template
          ref="tendency"
          :database-data="databaseData"
          :database-types="databaseTypes"
          :tendency-data="tendencyData"
          @get-database="getDatabase"
          :is-loading="isLoading"
          v-if="tabType==='tendency'"></tendency-template>
      </div>
    </common-layout>
  </page-layout>
</template>

<script>
import doAddCameraSelectHistory from '@/utils/camera.utils.js';
import moment from 'moment';
import CommonLayout from '@/common-components/common-layout';
import SearchForm from '../components/search-form';
import HeatTemplate from '../components/heat-template';
import TendencyTemplate from '../components/tendency-template';
import alarmStatisticsSrv from '../alarm-statistics.service';

export default {
  components: {
    CommonLayout,
    SearchForm,
    TendencyTemplate,
    HeatTemplate
  },
  data() {
    return {
      tabType: 'tendency',
      searchData: {
        startTime: moment().subtract(6, 'days').startOf('day').valueOf(),
        endTime: moment().endOf('day').valueOf(),
      },
      heatData: {
        warningStatistic: {
          warningCount: 0,
          faceWarningCount: 0,
          bodyWarningCount: 0,
          carWarningCount: 0,
          nonMotorWaringCount: 0,
          detectWarningCount: 0
        },
        heatIntensityMax: 0,
        records: []
      },
      typeOptions: [
        {
          value: 'tendency',
          label: this.$t('态势')
        },
        {
          value: 'heat',
          label: this.$t('热力图')
        }
      ],
      tendencyData: {
        statusData: {
          newCount: 0,
          designateCount: 0,
          receiveCount: 0,
          closeCount: 0
        },
        hourData: [],
        dayData: [],
        deployData: [],
        deviceData: [],
        databaseData: [],
        databaseUnit: '个',
        dayUnit: '个',
        hourUnit: '个',
        deployUnit: '个',
        deviceUnit: '个',
        statusUnit: '个'
      },
      deployList: [],
      databaseTree: [],
      databaseData: {
        warningAggregationByAlbums: [],
        aggregationByAlbumUnit: {
          unit: '个'
        }
      },
      databaseType: 1,
      databaseTypes: [],
      isLoading: true,
      dualPlatformType: this.$store.getters.system.dualPlatformType.value === '1', // 是否公安网
    };
  },
  computed: {
    exportShow() {
      return this.$store.getters.modulePermissonsByAlias('alarm-statistics', 'alarm-statistics-export');
    }
  },
  created() {
    // this.getAttributeList();
    this.getDeployType();
    this.getDatabaseData();
  },
  methods: {
    searchClick(params) {
      this.searchData = params;
      this.initSeach();
      // 检索记录选择相机的历史记录
      const { cameraIds } = this.searchData;
      if (cameraIds && cameraIds.length > 0) {
        doAddCameraSelectHistory(cameraIds);
      }
    },
    /**
     * 初始化检索
     */
    initSeach() {
      if (this.tabType === 'tendency') {
        this.getStatisticsData();
        this.getDatabaseStatistics();
      }
      if (this.tabType === 'heat') this.getHeatData();
    },
    /**
     * 导出报表事件
     */
    exportTable() {
      if (this.tabType === 'heat') {
        this.getHeatMapExport();
      }
      if (this.tabType === 'tendency') {
        this.getDashBoardExport();
      }
    },
    /**
     * 态势页导出
     */
    async getDashBoardExport() {
      if (this.isPending) return;
      this.isPending = true;
      const imgages = await this.$refs[this.tabType].generatorImage();
      const params = {
        ...this.searchData,
        ...imgages
      };
      const res = await alarmStatisticsSrv.getDashBoardExport(params);
      this.isPending = false;
      if (res.code === 0) this.$message.success('导出成功，请前往任务列表下载');
    },
    /**
     * 热力图导出
     */
    async getHeatMapExport() {
      if (this.isPending) return;
      this.isPending = true;
      const imgages = await this.$refs[this.tabType].generatorImage();
      const params = {
        ...this.searchData,
        ...imgages
      };
      const res = await alarmStatisticsSrv.getHeatExport(params);
      this.isPending = false;
      if (res.code === 0) this.$message.success('导出成功，请前往任务列表下载');
    },

    /**
     * 获取底库报警数据
     */
    async getDatabaseData() {
      const res = await alarmStatisticsSrv.getDatabaseData();
      if (res.code !== 0) {
        return;
      }
      if (res.data.length) {
        this.databaseTree = this.handleAlbumListFromAlarm(res.data);
      } else {
        this.databaseTree = [];
      }
    },
    /**
     * @description 处理来自报警的底库列表
     * @param {array} items
     * @returns {array}
     */
    handleAlbumListFromAlarm(items) {
      const obj = {
        id: 'root',
        name: this.$t('全部'),
        flag: 'category',
        items: [
          {
            id: 'person',
            flag: 'category',
            items: [],
            name: this.$t('人像库')
          },
          {
            id: 'body',
            flag: 'category',
            items: [],
            name: this.$t('人体库')
          },
          {
            id: 'car',
            flag: 'category',
            items: [],
            name: this.$t('车辆库')
          },
          {
            id: 'plate',
            flag: 'category',
            items: [],
            name: this.$t('车牌库')
          },
        ]
      };
      items.forEach((val) => {
        switch (val.albumType) {
          case 1:
            obj.items[0].items.push(val);
            break;
          case 2:
            obj.items[1].items.push(val);
            break;
          case 3:
          case 4:
            obj.items[2].items.push(val);
            break;
          case 5:
          case 6:
            obj.items[3].items.push(val);
            break;
          default:
            break;
        }
      });
      obj.items = obj.items.filter((val) => val.items.length);
      return [obj];
    },
    /**
     * 查询布控列表
     */
    async getDeployType() {
      const res = await alarmStatisticsSrv.getDeployType();
      if (res.data.length) {
        this.deployList = [{
          id: 'all',
          ruleName: '全部',
          items: res.data
        }];
      } else {
        this.databdeployListaseTree = [];
      }
    },
    /**
     * 趋势页数据请求
     */
    async getStatisticsData() {
      this.isLoading = true;
      const res = await alarmStatisticsSrv.getStatisticsData(this.searchData);
      this.isLoading = false;
      if (res.code === 0) {
        const {
          statisticByStatusVO,
          aggregationByDayList,
          aggregationByDayUnit,
          aggregationByHourList,
          aggregationByHourUnit,
          aggregationByDeployRuleList,
          aggregationByDeployRuleUnit,
          aggregationByCameraList,
          aggregationByCameraUnit,
          statisticByStatusUnit,
          // aggregationByAlbumList,
          // aggregationByAlbumUnit
        } = res.data;
        this.tendencyData = {
          statusData: statisticByStatusVO,
          hourData: aggregationByHourList,
          dayData: aggregationByDayList,
          deployData: aggregationByDeployRuleList,
          deviceData: aggregationByCameraList,
          dayUnit: aggregationByDayUnit.unit,
          hourUnit: aggregationByHourUnit.unit,
          deployUnit: aggregationByDeployRuleUnit.unit,
          deviceUnit: aggregationByCameraUnit.unit,
          statusUnit: statisticByStatusUnit.unit,
          // dataBaseData: aggregationByAlbumList,
          // databaseUnit: aggregationByAlbumUnit.unit
        };
      }
    },
    /**
     * 调用底库报警查询
     */
    getDatabase(type) {
      this.databaseType = type;
      this.getDatabaseStatistics();
    },
    /**
     * 请求底库报警数据
     */
    async getDatabaseStatistics() {
      const params = {
        ...this.searchData,
        albumType: this.databaseType
      };
      const res = await alarmStatisticsSrv.getDatabaseStatistics(params);
      if (res.code === 0) this.databaseData = res.data;
    },
    /**
     * tab切换事件
     */
    tabTypeChange() {
      this.initSeach();
    },

    /**
     * 请求热力图数据
     */
    async getHeatData() {
      this.isLoading = true;
      const res = await alarmStatisticsSrv.getHeatData(this.searchData);
      this.isLoading = false;
      if (res.code === 0) {
        this.heatData = res.data;
      }
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
  .statistics-export,.statistics-title{
    width: 96px;
  }
}
.statistics-content {
  height: 100%;
  padding-right: 18px;
}
.statistics-tab {
  height: 34px;
}
</style>
