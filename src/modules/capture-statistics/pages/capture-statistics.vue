<template>
  <page-layout>
    <common-layout>
      <!-- 左侧检索条件 -->
      <search-form
        slot="left"
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
          :tendency-data="tendencyData"
          :is-loading="isLoading"
          v-if="tabType==='tendency'"></tendency-template>
        <attribute-template
          ref="attribute"
          :is-loading="isLoading"
          @get-attribute="getAttribute"
          :detect-type-options="detectTypeOptions"
          v-if="tabType==='attribute'"></attribute-template>
      </div>
    </common-layout>
  </page-layout>
</template>

<script>
import doAddCameraSelectHistory from '@/utils/camera.utils.js';
import CommonLayout from '@/common-components/common-layout';
import moment from 'moment';
import HeatTemplate from '../components/heat-template';
import TendencyTemplate from '../components/tendency-template';
import AttributeTemplate from '../components/attribute-template';
import CaptureStatisticsSrv from '../capture-statistics.service';
import SearchForm from '../components/search-form';

export default {
  components: {
    CommonLayout,
    SearchForm,
    AttributeTemplate,
    TendencyTemplate,
    HeatTemplate
  },
  data() {
    return {
      tabType: 'tendency',
      typeOptions: [
        {
          value: 'tendency',
          label: this.$t('态势')
        },
        {
          value: 'attribute',
          label: this.$t('属性')
        },
        {
          value: 'heat',
          label: this.$t('热力图')
        }
      ],
      tendencyData: {
        targetData: {
          faceCount: 0,
          bodyCount: 0,
          carCount: 0,
          nonMotorCount: 0
        },
        hourData: [],
        dayData: [],
        deptData: [],
        deviceData: [],
        dayUnit: '个',
        hourUnit: '个',
        deptUnit: '个',
        deviceUnit: '个',
        targetUnit: '个'
      },
      heatData: {
        captureCount: 0,
        cameraCount: 0,
        bodyCount: 0,
        faceCount: 0,
        carCount: 0,
        nonMotorCount: 0,
        records: []
      },
      isLoading: true,
      searchData: {
        startTime: moment().subtract(6, 'days').startOf('day').valueOf(),
        endTime: moment().endOf('day').valueOf(),
      },
      detectTypeOptions: [],
      attributeQuery: {}
    };
  },
  computed: {
    exportShow() {
      return this.$store.getters.modulePermissonsByAlias('capture-statistics', 'capture-statistics-export');
    }
  },
  created() {
    this.getAttributeList();
  },
  methods: {
    /**
     * 点击检索
     */
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
      if (this.tabType === 'tendency') this.getStatisticsData();
      if (this.tabType === 'attribute') this.$refs.attribute.getData();
      if (this.tabType === 'heat') this.getHeatData();
    },
    /**
     * 趋势页数据请求
     */
    async getStatisticsData() {
      this.isLoading = true;
      const res = await CaptureStatisticsSrv.getStatisticsData(this.searchData);
      this.isLoading = false;
      if (res.code === 0) {
        const {
          aggregationByDayList = [],
          aggregationByHourList = [],
          aggregationByDeptList = [],
          aggregationByCameraList = [],
          statisticByProperty = [],
          aggregationByDayUnit = {},
          aggregationByHourUnit = {},
          aggregationByDeptUnit = {},
          aggregationByCameraUnit = {},
          statisticByPropertyUnit = {}
        } = res.data;
        this.tendencyData = {
          dayData: aggregationByDayList,
          dayUnit: aggregationByDayUnit.unit,
          hourData: aggregationByHourList,
          hourUnit: aggregationByHourUnit.unit,
          deptData: aggregationByDeptList.splice(0, 10),
          deptUnit: aggregationByDeptUnit.unit,
          deviceData: aggregationByCameraList || [],
          deviceUnit: aggregationByCameraUnit.unit || '个',
          targetData: statisticByProperty,
          targetUnit: statisticByPropertyUnit.unit,

        };
      }
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
      if (this.tabType === 'attribute') {
        this.getAttrExport();
      }
    },
    /**
     * 态势页导出
     */
    async getDashBoardExport() {
      if (this.isPending) return;
      this.isPending = true;
      const images = await this.$refs[this.tabType].generatorImage();
      const params = {
        ...this.searchData,
        ...images
      };
      const res = await CaptureStatisticsSrv.getDashBoardExport(params);
      this.isPending = false;
      if (res.code === 0) this.$message.success('导出成功，请前往任务列表下载');
    },
    /**
     * 属性页导出
     */
    async getAttrExport() {
      if (this.isPending) return;
      this.isPending = true;
      const images = await this.$refs[this.tabType].generatorImage();
      const params = {
        ...this.searchData,
        ...this.attributeQuery,
        ...images
      };
      const res = await CaptureStatisticsSrv.getAttrExport(params);
      this.isPending = false;
      if (res.code === 0) this.$message.success('导出成功，请前往任务列表下载');
    },
    /**
     * 热力图导出
     */
    async getHeatMapExport() {
      if (this.isPending) return;
      this.isPending = true;
      const heatMapImg = await this.$refs[this.tabType].generatorImage();
      const params = {
        ...this.searchData,
        heatMapImg
      };
      const res = await CaptureStatisticsSrv.getHeatMapExport(params);
      this.isPending = false;
      if (res.code === 0) this.$message.success('导出成功，请前往任务列表下载');
    },
    /**
     * tab切换事件
     */
    tabTypeChange() {
      this.initSeach();
    },
    /**
     * 布控特征属性请求
     */
    async getAttributeList() {
      const res = await CaptureStatisticsSrv.getAttributeList();
      if (res.code === 0) {
        this.detectTypeOptions = res.data.records;
      }
    },
    /**
     * 属性页面数据请求
     */
    async getAttribute(attr) {
      this.attributeQuery = attr.params;
      const params = {
        ...this.searchData,
        ...attr.params
      };
      this.isLoading = true;
      const res = await CaptureStatisticsSrv.getAttributeData(params);
      this.isLoading = false;
      if (res.code === 0) {
        const data = {
          data: res.data,
          properties: attr.properties,
          detectType: attr.detectType
        };
        if (this.$refs.attribute) this.$refs.attribute.setData(data);
      }
    },
    /**
     * 请求热力图数据
     */
    async getHeatData() {
      this.isLoading = true;
      const res = await CaptureStatisticsSrv.getHeatData(this.searchData);
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
