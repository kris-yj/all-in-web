<template>
  <div class="dashboard-map">
    <situational-display-map
      :capture-data="captureData"
      :alarm-data="alarmData"
      :cluster-data="clusterData"
      :region-data="regionData"
      :type="tabType">
      <template v-slot:list="{ params }">
        <div class="device-list">
          <div class="hover-tooltip">
            <meg-icon
              width="16"
              height="14"
              name="card_face"
              color="#19B6FF"></meg-icon>
            <h3>{{ params.captureNum }}</h3>
          </div>
        </div>
      </template>
      <template v-slot:hover="{ params }">
        <map-overly-modal :data="params"></map-overly-modal>
      </template>
      <template v-slot:overlay="{ params }">
        <map-overly-modal
          :data="params"
          mode="click"></map-overly-modal>
      </template>
    </situational-display-map>
    <div :class="{'map-actions': true, 'crop-secene': cropScene !== 0, 'normal-secene': cropScene === 0}">
      <div class="actions-container">
        <div :class="{'actions-nav': true, 'crop-nav': cropScene !== 0}">
          <div
            v-for="(item, index) in navList"
            :key="item.name"
            :class="{'actions-item': true, 'active': index === activeIndex}"
            @click.stop="handleNavClick(item, index)">
            {{ item.label }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import SituationalDisplayMap from '@/common-components/common-maps/situational-display-map';
import DashboardApi from '../dashboard.service';
import MapOverlyModal from './map-overly-modal';

export default {
  name: 'DashboardMap',
  components: {
    SituationalDisplayMap,
    MapOverlyModal,
  },
  props: {
    cropScene: {
      type: Number,
      default: 0,
    }
  },
  data() {
    return {
      tabType: 'capture',
      activeIndex: 0,
      clusterData: [], // 关注
      regionData: [], // 区域
      captureData: [], // 抓拍数据
      alarmData: [], //  报警数据
      tabList: [
        {
          name: 'capture',
          label: '抓拍态势'
        },
        {
          name: 'alarm',
          label: '报警态势'
        },
        {
          name: 'personnel',
          label: '关注人员'
        },
        {
          name: 'high',
          label: '防控单元'
        },
      ]
    };
  },
  computed: {
    navList() {
      if (this.cropScene === 0) {
        return this.tabList;
      }
      return this.tabList.slice(0, 2);
    }
  },
  created() {
    this.getCaptureMapData();
  },
  methods: {
    getFocusMapData() {
      DashboardApi.getFocusMap().then((res) => {
        if (res.code === 0) {
          this.clusterData = res.data.map((item) => ({
            lon: item.lon,
            lat: item.lat,
            captureNum: item.count,
            item
          }));
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    getAreaSituationMapData() {
      DashboardApi.getAreasSituationMap().then((res) => {
        if (res.code === 0) {
          this.regionData = res.data.map((item) => ({
            id: item.id,
            level: item.score,
            coordinates: JSON.parse(item.areaRange),
            name: item.name,
            risen: item.risen,
            sceneName: item.sceneName,
            score: item.score,
            deviceCount: item.deviceCount
          })).filter((item) => item.coordinates);
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    getCaptureMapData() {
      DashboardApi.getCaptureMap().then((res) => {
        if (res.code === 0) {
          const filterIsNotHasLatAndLonList = res.data.records.filter((item) => item.camera.longitude && item.camera.latitude);
          this.captureData = filterIsNotHasLatAndLonList.map((item) => ({
            lon: item.camera.longitude,
            lat: item.camera.latitude,
            weight: item.heatIntensity
          }));
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    getAlarmMapData() {
      DashboardApi.getAlarmMap().then((res) => {
        if (res.code === 0) {
          this.alarmData = res.data.records.map((item) => ({
            lon: item.camera.longitude,
            lat: item.camera.latitude,
            weight: item.heatIntensity
          }));
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    /**
   * 导航切换
   */
    handleNavClick(item, idx) {
      const { name } = item;
      const self = this;
      this.activeIndex = idx;
      this.tabType = name;
      const callObj = {
        capture: self.getCaptureMapData,
        alarm: self.getAlarmMapData,
        personnel: self.getFocusMapData,
        high: self.getAreaSituationMapData,
      };
      callObj[name]();
    },
  },
};
</script>
<style lang="scss" scoped>
  .dashboard-map{
    width: 100%;
    height: 100%;
    background-color: rgba(0, 42, 156, .94);
    position: relative;
    .map-actions {
      width: 146px;
      height: 160px;
      background-image: linear-gradient(158deg, rgba(1,31,147,0.00) 33%, rgba(1,31,147,0.30) 64%, rgba(0,32,151,0.72) 100%);
      position: absolute;
      right: 390px;
      z-index: 999;
      &.crop-secene {
        bottom: 20px;
      }
      &.normal-secene {
        bottom: 258px;
      }
      &:before {
        content: '';
        width: 146px;
        height: 2px;
        background-position: top center;
        background-size: cover;
        background-image: linear-gradient(270deg, rgba(25,182,255,0.60) 0%, rgba(25,182,255,0.00) 100%);
        position: absolute;
        left: 0;
        bottom: 0;
      }
      &:after {
        content: '';
        width: 2px;
        height: 160px;
        background-position: top center;
        background-size: cover;
        background-image: linear-gradient(180deg, rgba(25,182,255,0.00) 0%, #18D5FF 18%, rgba(25,182,255,0.40) 100%);
        position: absolute;
        right: 0;
        top: 0;
      }
      .actions-container {
        width: 100%;
        position: relative;
        .actions-nav {
          width: 100%;
          height: 160px;
          display: flex;
          justify-content: flex-start;
          align-items: flex-end;
          flex-direction: column;
          margin-top: 19px;
          &.crop-nav {
            justify-content: center;
            align-items: center;
          }
          .actions-item {
            width: 144px;
            height: 28px;
            box-sizing: border-box;
            background-image: url('~@/assets/images/dashboard/unselected.png');
            background-repeat: no-repeat;
            background-size: 100% 100%;
            cursor: pointer;
            margin-top: 6px;
            transition: all .3s ease-in-out;
            display: flex;
            justify-content: center;
            font-size: 14px;
            color: #D6F4FF;
            padding-top: 6px;
            &:hover {
              font-weight: 600;
              color: #fff;
              margin-top: 6px;
              width: 140px;
              background-image: url('~@/assets/images/dashboard/selected.png');
            }
            &.active {
              font-weight: 600;
              color: #fff;
              margin-top: 6px;
              width: 140px;
              background-image: url('~@/assets/images/dashboard/selected.png');
            }
          }
        }
      }
    }
  }

  .device-list {
    position: relative;
  }
  .hover-tooltip {
    width: 80px;
    height: 34px;
    border: 1px solid rgba(0, 42, 156, .94);
    box-shadow: 4px 4px 6px 0 rgba(0,0,0,0.20);
    border-radius: 2px;
    background-color: rgba(0, 42, 156, .94);
    cursor: pointer;
    position: relative;
    z-index: 999;
    display: flex;
    justify-content: space-around;
    align-items: center;
    >h3 {
      font-size: 20px;
      color: #fff;
      text-align: center;
      line-height: 34px;
      font-family: HEMIHEAD;
      >span {
        padding: 0 4px 0 4px;
      }
    }
    &:after {
      content: ' ';
      width: 0;
      height: 0;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-top: 8px solid  rgba(0, 42, 156, .94);
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
    }
  }
</style>
