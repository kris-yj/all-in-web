<template>
  <page-layout>
    <!-- logo components -->
    <dashboard-logo></dashboard-logo>
    <div :class="{'dashboard-wrapper': true, isFull: !isFull}">
      <!-- dashboard map -->
      <dashboard-map :crop-scene="cropScene"></dashboard-map>
      <!-- 主数据 -->
      <dashboard-header
        :data="mainData"
        v-if="cropScene === 0"></dashboard-header>
      <!-- left aside -->
      <dahsboard-aside-left
        :crop-scene="cropScene"
        :footer-data="footerData"
        :warning-date-list="warningDateList"
        :aside-l-data="asideLData"
        :full-goal="fullGoal"
        :warning-address="warningAddress"></dahsboard-aside-left>
      <!-- right aside -->
      <dahsboard-aside-right
        v-if="cropScene === 0"
        :crop-scene="cropScene"
        :aside-r-data="asideRData"
        :focus-list="focusList"
        :gang-list="gangList"></dahsboard-aside-right>
      <dashboard-crop-left
        v-if="cropScene !== 0"
        :aside-l-data="asideLData"
        :data="mainData"
        :crop-scene="cropScene"
        :footer-data="footerData"
        :capture-date-list="captureDateList">
      </dashboard-crop-left>
      <!-- footer -->
      <dashboard-footer
        v-if="cropScene === 0"
        :crop-scene="cropScene"
        :footer-data="footerData"
        :capture-date-list="captureDateList"
        :warning-date-list="warningDateList"
        :focus-date-list="focusDateList"></dashboard-footer>
    </div>
  </page-layout>
</template>

<script>
import DashboardApi from '../dashboard.service';
import DashboardLogo from '../components/dashboard-logo';
import DashboardMap from '../components/dashboard-map';
import DashboardHeader from '../components/dashboard-header';
import DahsboardAsideLeft from '../components/dashboard-aside-left';
import DahsboardAsideRight from '../components/dashboard-aside-right';
import DashboardFooter from '../components/dashboard-footer';
import DashboardCropLeft from '../components/dashboard-crop-left.vue';

export default {
  components: {
    DashboardLogo,
    DashboardMap,
    DashboardHeader,
    DahsboardAsideLeft,
    DahsboardAsideRight,
    DashboardFooter,
    DashboardCropLeft,
  },
  data() {
    return {
      mainData: {
        holographicDocCount: 0,
        focusPeopleCount: 0,
        cameraCount: 0,
        captureCount: 0,
        warningCount: 0,
      }, // 主数据
      fullGoal: {},
      asideLData: {
        analysisTaskCount: 0,
        realTechRuleCount: 0,
        warningAggregationByAddressUnit: {}
      },
      asideRData: {},
      footerUnit: {},
      captureDateList: [],
      warningDateList: [],
      focusList: [],
      gangList: [],
      warningAddress: [],
      focusDateList: [],
      footerData: {},
      flushTimer: null,
    };
  },
  computed: {
    isFull() {
      return this.$store.state.fullscreen;
    },
    cropScene() {
      return Number(this.$store.getters.systemByType('cropScene').value);
    }
  },
  beforeDestroy() {
    if (this.dashboardDataStat) clearTimeout(this.dashboardDataStat);
    if (this.tacticFoucusCount) clearTimeout(this.tacticFoucusCount);
  },
  created() {
    this.init();
  },
  methods: {
    /**
    * 初始化数据
    */
    init() {
      if (this.cropScene === 0) {
        this.fetchSituationTop10();
        this.getTacticFocusCount();
        this.fetchSituationFocus();
        this.fetchSituationActive10();
        this.fetchSituationOverview();
      }
      if (this.cropScene === 2) {
        this.fetchSituationOverview();
      }
      this.getDashboardData();
    },
    /**
    * 获取关注人员统计
    */
    getTacticFocusCount() {
      clearTimeout(this.tacticFoucusCount);
      DashboardApi.getTacticFocusCount().then((res) => {
        if (res.code === 0) {
          this.mainData.focusPeopleCount = res.data.totalFocusProfileCount;
          this.tacticFoucusCount = setTimeout(() => {
            this.getTacticFocusCount();
          }, 5000);
        }
      });
    },
    /**
     * 获取dashboard数据
     */
    getDashboardData() {
      const params = {
        startTime: new Date().getTime(),
        endTime: new Date().getTime(),
        warningAddressTopLimit: 5,
        focusPeopleTopLimit: 10,
        gangActiveTopLimit: 10,
        preventionAndControlUnitFocusTopLimit: 10,
      };
      clearTimeout(this.dashboardDataStat);
      DashboardApi.getDashboardData(params).then((res) => {
        if (res.code === 0) {
          const {
            analysisTaskCount, // 正在解析的任务数
            captureGroupCountVO, // 全目标统计
            warningAddressStatisticList, // 报警地点统计
            captureStatisticDayCountList, // 抓拍按日统计
            warningStatisticDayCountList, // 报警地点统计
            cameraCount, // 相机总数
            captureCount, // 抓拍总数
            warningCount, // 报警总数
            captureAggregationByDayUnit, // 抓拍统计单位
            warningAggregationByDayUnit, // 告警统计
            warningAggregationByAddressUnit,
            tacticNum,
          } = res.data;
          // 主数据
          this.mainData.cameraCount = cameraCount;
          this.mainData.captureCount = captureCount;
          this.mainData.warningCount = warningCount;
          // 处理全目标统计
          this.fullGoal = captureGroupCountVO;
          // 处理报警地点统计
          this.warningAddress = warningAddressStatisticList;
          this.captureDateList = captureStatisticDayCountList;
          this.warningDateList = warningStatisticDayCountList;
          // 左侧解析任务和技战法数据
          this.asideLData.analysisTaskCount = analysisTaskCount;
          this.asideLData.warningAggregationByAddressUnit = warningAggregationByAddressUnit;
          this.asideLData.realTechRuleCount = tacticNum;
          // 告警统计和抓拍统计单位
          this.footerData = {
            captureAggregationByDayUnit,
            warningAggregationByDayUnit
          };
          this.dashboardDataStat = setTimeout(() => {
            this.getDashboardData();
          }, 5000);
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    /**
     * 防控单元关注指数Top10
     */
    fetchSituationTop10() {
      DashboardApi.getSituationTop10().then((res) => {
        if (res.code === 0) {
          this.focusList = res.data;
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    /**
     * 团伙人员关注指数Top20
     */
    fetchSituationActive10() {
      DashboardApi.getSituationActive10().then((res) => {
        if (res.code === 0) {
          this.gangList = res.data;
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    /**
     * 获取右侧-基础数据
     */
    fetchSituationOverview() {
      DashboardApi.getSituationOverview().then((res) => {
        if (res.code === 0) {
          const {
            gangCount,
            unitCount,
            gridCount,
            profileCount
          } = res.data;
          this.asideRData = {
            gangCount,
            unitCount,
            gridCount,
          };
          this.mainData.holographicDocCount = profileCount;
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    /**
     * 关注人员TOP5
     */
    fetchSituationFocus() {
      DashboardApi.getSituationFocus().then((res) => {
        if (res.code === 0) {
          this.focusDateList = res.data.slice(0, 5);
        } else {
          this.$message.error(res.msg);
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
@media (max-width: 1440px) {
  .dashboard-wrapper {
    height: 100%;
  }
}
@media (min-width: 1441px) and (max-width: 1920px){
  .dashboard-wrapper {
    height: calc(100% - 30px);
    top: 30px;
  }
}
.dashboard-wrapper{
  width: 100%;
  background-color: rgba(0, 42, 156, .94);
  position: relative;
  &.isFull {
    height: 100%;
    top: 0;
  }
}
@keyframes flash {
  0% {
    opacity: .8;
    transform: scale(.8)
  }
  100% {
    opacity: 1;
    transform: scale(1.2)
  }
}
</style>
