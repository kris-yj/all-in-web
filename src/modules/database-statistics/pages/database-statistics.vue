<template>
  <page-layout>
    <common-layout>
      <!-- 左侧检索条件 -->
      <search-form
        :database-tree="databaseTree"
        slot="left"
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
              @click="getDatabaseExport">
              导出报表
            </meg-button>
          </div>
        </div>
        <div
          v-loading="isLoading"
          class="statistics-body">
          <div class="statistics-wrap">
            <div
              ref="faceDeploy"
              class="face-deploy">
              <div class="template-title">
                {{ $t("人脸布控库") }}<span class="topNumber">{{ $t("TOP10") }}</span>
              </div>
              <meg-histogram
                :extend="faceDeployOptions"
                height="100%">
                <data-empty v-show="!tendencyData.faceDeployAlbumStatistic.length"></data-empty>
              </meg-histogram>
            </div>

            <div
              ref="faceStatic"
              class="face-static">
              <div class="template-title">
                {{ $t("人脸静态库") }}<span class="topNumber">{{ $t("TOP10") }}</span>
              </div>
              <meg-histogram
                :extend="faceStaticOptions"
                height="100%">
                <data-empty v-show="!tendencyData.faceStaticAlbumStatistic.length"></data-empty>
              </meg-histogram>
            </div>
          </div>
          <div class="statistics-wrap">
            <div
              ref="bodyDeploy"
              class="body-deploy">
              <div class="template-title">
                {{ $t("人体布控库") }}<span class="topNumber">{{ $t("TOP5") }}</span>
              </div>
              <meg-histogram
                :extend="bodyDeployOptions"
                height="100%">
                <data-empty v-show="!tendencyData.bodyDeployAlbumStatistic.length"></data-empty>
              </meg-histogram>
            </div>
            <div
              class="car-deploy">
              <div class="template-title">
                <span class="topNumber">{{ $t("TOP5") }}</span>
              </div>
              <meg-tabs
                v-model="carType"
                class="template-tabs">
                <meg-tab-pane
                  name="0">
                  <span
                    slot="label"
                    class="tab">机动车底库</span>
                </meg-tab-pane>
                <meg-tab-pane
                  name="1">
                  <span
                    slot="label"
                    class="tab">机动车牌底库</span>
                </meg-tab-pane>
              </meg-tabs>
              <div
                ref="carDeploy"
                class="tab-map"
                :class="{show:carType==='0'}">
                <div
                  class="export-title">
                  {{ $t("机动车底库") }}<span class="topNumber">{{ $t("TOP5") }}</span>
                </div>
                <meg-histogram
                  :extend="carDeployOptions"
                  height="100%">
                  <data-empty v-show="!tendencyData.carDeployAlbumStatistic.length"></data-empty>
                </meg-histogram>
              </div>
              <div
                ref="carLicenseDeploy"
                class="tab-map"
                :class="{show:carType==='1'}">
                <div
                  class="export-title">
                  {{ $t("机动车牌底库") }}<span class="topNumber">{{ $t("TOP5") }}</span>
                </div>
                <meg-histogram
                  :extend="carLicenseOptions"
                  height="100%">
                  <data-empty v-show="!tendencyData.carLicenseAlbumStatistic.length"></data-empty>
                </meg-histogram>
              </div>
            </div>
            <div
              class="non-motor-deploy">
              <div class="template-title">
                <span class="topNumber">{{ $t("TOP5") }}</span>
              </div>
              <meg-tabs
                v-model="nonMotorType"
                class="template-tabs">
                <meg-tab-pane
                  name="0">
                  <span
                    slot="label"
                    class="tab">非机动车底库</span>
                </meg-tab-pane>
                <meg-tab-pane
                  name="1">
                  <span
                    slot="label"
                    class="tab">非机动车牌底库</span>
                </meg-tab-pane>
              </meg-tabs>
              <div
                class="tab-map"
                ref="nonMotorDeploy"
                :class="{show:nonMotorType==='0'}">
                <div
                  class="export-title">
                  {{ $t("非机动车底库") }}<span class="topNumber">{{ $t("TOP5") }}</span>
                </div>
                <meg-histogram
                  :extend="nonMotorDeployOptions"
                  height="100%">
                  <data-empty v-show="!tendencyData.nonMotorDeployAlbumStatistic.length"></data-empty>
                </meg-histogram>
              </div>
              <div
                class="tab-map"
                ref="nonMotorLicenseDeploy"
                :class="{show:nonMotorType==='1'}">
                <div
                  class="export-title">
                  {{ $t("非机动车牌底库") }}<span class="topNumber">{{ $t("TOP5") }}</span>
                </div>
                <meg-histogram
                  :extend="nonMotorLicenseOptions"
                  height="100%">
                  <data-empty v-show="!tendencyData.nonMotorLicenseAlbumStatistic.length"></data-empty>
                </meg-histogram>
              </div>
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
import DataEmpty from '@/components/chart/data-empty';
import SearchForm from '../components/search-form';
import databaseStatisticsSrv from '../database-statistics.service';

export default {
  components: {
    CommonLayout,
    SearchForm,
    DataEmpty
  },
  data() {
    return {
      isEmpty: false,
      isLoading: true,
      searchData: {},
      databaseTree: [],
      tendencyData: {
        faceDeployAlbumStatistic: [],
        faceDeployAlbumStatisticUnit: { unit: '个' },
        faceStaticAlbumStatistic: [],
        faceStaticAlbumStatisticUnit: { unit: '个' },
        bodyDeployAlbumStatistic: [],
        bodyDeployAlbumStatisticUnit: { unit: '个' },
        carDeployAlbumStatistic: [],
        carDeployAlbumStatisticUnit: { unit: '个' },
        carLicenseAlbumStatistic: [],
        carLicenseAlbumStatisticUnit: { unit: '个' },
        nonMotorDeployAlbumStatistic: [],
        nonMotorDeployAlbumStatisticUnit: { unit: '个' },
        nonMotorLicenseAlbumStatistic: [],
        nonMotorLicenseAlbumStatisticUnit: { unit: '个' }
      },
      histogram: chartOption.histogram,
      carType: '0', // 0 车 1牌
      nonMotorType: '0', // 0 车 1牌
      dualPlatformType: this.$store.getters.system.dualPlatformType.value === '1', // 是否公安网
      isPending: false
    };
  },
  computed: {
    exportShow() {
      return this.$store.getters.modulePermissonsByAlias('database-statistics', 'database-statistics-export');
    },
    /**
     * 组装人脸布控库统计数据
     */
    faceDeployOptions() {
      const options = {
        x: [],
        y: [],
        title: `单位:${this.tendencyData.faceDeployAlbumStatisticUnit.unit}`,
        limit: 4
      };
      this.tendencyData.faceDeployAlbumStatistic.forEach((item) => {
        options.y.push(item.name);
        options.x.push(item.count);
      });
      return this.histogram(options);
    },
    /**
     * 组装人脸静态库统计数据
     */
    faceStaticOptions() {
      const options = {
        x: [],
        y: [],
        limit: 4,
        title: `单位:${this.tendencyData.faceStaticAlbumStatisticUnit.unit}`
      };
      this.tendencyData.faceStaticAlbumStatistic.forEach((item) => {
        options.y.push(item.name);
        options.x.push(item.count);
      });
      return this.histogram(options);
    },
    /**
     * 组装人体布控库统计数据
     */
    bodyDeployOptions() {
      const options = {
        x: [],
        y: [],
        limit: 5,
        title: `单位:${this.tendencyData.bodyDeployAlbumStatisticUnit.unit}`
      };
      this.tendencyData.bodyDeployAlbumStatistic.forEach((item) => {
        options.y.push(item.name);
        options.x.push(item.count);
      });
      return this.histogram(options);
    },
    /**
     * 组装机动车库统计数据
     */
    carDeployOptions() {
      const options = {
        x: [],
        y: [],
        limit: 5,
        title: `单位:${this.tendencyData.carDeployAlbumStatisticUnit.unit}`
      };
      this.tendencyData.carDeployAlbumStatistic.forEach((item) => {
        options.y.push(item.name);
        options.x.push(item.count);
      });
      return this.histogram(options);
    },
    /**
     * 组装机动车牌库统计数据
     */
    carLicenseOptions() {
      const options = {
        x: [],
        y: [],
        limit: 5,
        title: `单位:${this.tendencyData.carLicenseAlbumStatisticUnit.unit}`
      };
      this.tendencyData.carLicenseAlbumStatistic.forEach((item) => {
        options.y.push(item.name);
        options.x.push(item.count);
      });
      return this.histogram(options);
    },
    /**
     * 组装非机动车库统计数据
     */
    nonMotorDeployOptions() {
      const options = {
        x: [],
        y: [],
        limit: 5,
        title: `单位:${this.tendencyData.nonMotorDeployAlbumStatisticUnit.unit}`
      };
      this.tendencyData.nonMotorDeployAlbumStatistic.forEach((item) => {
        options.y.push(item.name);
        options.x.push(item.count);
      });
      return this.histogram(options);
    },
    /**
     * 组装非机动车牌库统计数据
     */
    nonMotorLicenseOptions() {
      const options = {
        x: [],
        y: [],
        limit: 5,
        title: `单位:${this.tendencyData.nonMotorLicenseAlbumStatisticUnit.unit}`
      };
      this.tendencyData.nonMotorLicenseAlbumStatistic.forEach((item) => {
        options.y.push(item.name);
        options.x.push(item.count);
      });
      return this.histogram(options);
    }

  },
  created() {
    this.getDatabaseList();
  },
  methods: {
    /**
     * 导出报表
     */
    async getDatabaseExport() {
      if (this.isPending) return;
      this.isPending = true;
      const faceDeployAlbumStatisticImg = await chartOption.generatorImage(this.$refs.faceDeploy);
      const faceStaticAlbumStatisticImg = await chartOption.generatorImage(this.$refs.faceStatic);
      const bodyDeployAlbumStatisticImg = await chartOption.generatorImage(this.$refs.bodyDeploy);
      const carDeployAlbumStatisticImg = await chartOption.generatorImage(this.$refs.carDeploy);
      const carLicenseAlbumStatisticImg = await chartOption.generatorImage(this.$refs.carLicenseDeploy);
      const nonMotorDeployAlbumStatisticImg = await chartOption.generatorImage(this.$refs.nonMotorDeploy);
      const nonMotorLicenseAlbumStatisticImg = await chartOption.generatorImage(this.$refs.nonMotorLicenseDeploy);
      const params = {
        ...this.searchData,
        faceDeployAlbumStatisticImg,
        faceStaticAlbumStatisticImg,
        bodyDeployAlbumStatisticImg,
        carDeployAlbumStatisticImg,
        nonMotorDeployAlbumStatisticImg,
        carLicenseAlbumStatisticImg,
        nonMotorLicenseAlbumStatisticImg
      };
      const res = await databaseStatisticsSrv.getDatabaseExport(params);
      this.isPending = false;

      if (res.code === 0) this.$message.success('导出成功，请前往任务列表下载');
    },
    /**
     * 获取底库列表
     */
    async getDatabaseList() {
      const params = {
        deployObject: [1, 2, 3, 4, 5],
        srcType: [1]
      };
      if (!this.dualPlatformType) {
        params.srcType = [1];
        params.platformType = 0;
      }

      const res = await databaseStatisticsSrv.getDatabaseList(params);
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
    searchClick(params) {
      this.searchData = params;
      this.getDashboardData();
    },
    /**
     * 请求统计数据
     */
    async getDashboardData() {
      this.isLoading = true;
      const res = await databaseStatisticsSrv.getDashboardData(this.searchData);
      this.isLoading = false;
      if (res.code === 0) {
        this.tendencyData = res.data;
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
.export-title {
  position: absolute;
  top: 20px;
  left: 20px;
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
.face-deploy, .face-static, .body-deploy,.car-deploy,.non-motor-deploy{
  position: relative;
  background: #fff;
  padding-top: 36px;
  box-sizing: border-box;
  flex: 1;
}
.tab-map {
  position: absolute ;
  z-index: -1;
  top: 0;
  width: 100%;
  height: 100% ;
  padding-top: 46px;
  box-sizing: border-box;
  &.show {
    z-index: 0;
  }
}
.face-static {
  margin-bottom: 10px;
}
.body-deploy,.car-deploy {
  margin-right: 10px;
}
.face-deploy {
  margin-bottom: 10px;
  margin-right: 10px;
}
.car-deploy,.non-motor-deploy {
  padding-top: 46px;
  ::v-deep .meg-tabs__nav-wrap {
    padding-left: 20px;
    &::after {
      height: 1px;
    }
  }
  ::v-deep .meg-tabs__item {
    padding: 0 15px;
  }
  ::v-deep .meg-tabs__active-bar {
    height: 4px;
  }
  .template-title {
    left: auto;
    right: 20px;
    z-index: 2;
  }
  .template-tabs {
    position: absolute;
    top: 0;
    padding-top: 7px;
    width: 100%;
    background: #fff;
    height: 54px;
    box-sizing: border-box;
    z-index: 1;
    .tab {
      line-height: 42px;
      font-size: 14px;
      font-weight: normal;
    }
  }
}
</style>
