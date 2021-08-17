<template>
  <div class="statistics-panel">
    <div class="panel-statistics">
      <div class="statistics-item">
        <span class="icon">
          <meg-icon
            name="face-attribute_menu"
            width="12"></meg-icon>
        </span>
        <span class="label">{{ countMap.faceCaptureNum }}</span>
      </div>
      <div class="statistics-item">
        <span class="icon">
          <meg-icon
            name="person"
            width="12"></meg-icon>
        </span>
        <span class="label">{{ countMap.bodyCaptureNum }}</span>
      </div>
      <div class="statistics-item">
        <span class="icon">
          <meg-icon
            name="motor-vehicle_menu"
            width="12"></meg-icon>
        </span>
        <span class="label">{{ countMap.vehicleCaptureNum }}</span>
      </div>
      <div class="statistics-item">
        <span class="icon">
          <meg-icon
            name="non-vehicle_menu"
            width="12"></meg-icon>
        </span>
        <span class="label">
          {{ countMap.nonVehicleCaptureNum }}
        </span>
      </div>
    </div>
    <!-- TODO 需要字段控制 视频模式下 AlarmVideoStatisticsAll  结构化模式下 AlarmStructureStatisticsALL  -->
    <div
      v-event-tracking="'AlarmMapStatisticsAll'"
      @click="clickAllCapture"
      class="panel-button">
      <span>查看
        <meg-icon
          width="12"
          height="12"
          name="arrow_right"></meg-icon>
      </span>
    </div>
  </div>
</template>
<script>
import moment from 'moment';
import { switchToModule } from '@/utils/utils';
import RequestLooper from './request-looper';
import alarmRealtimeSvr from '../alarm-realtime.service';

const startTime = moment().startOf('day').valueOf();
const endTime = moment().endOf('day').valueOf();
export default {
  name: 'CaptureStatisticsPanel',
  data() {
    return {
      countMap: {
        faceCaptureNum: 0,
        bodyCaptureNum: 0,
        vehicleCaptureNum: 0,
        nonVehicleCaptureNum: 0,
      },
      eventIdMap: {

      }, // TODO 埋点map
      featureMap: {
        0: 'faceCaptureNum',
        1: 'bodyCaptureNum',
        5: 'vehicleCaptureNum',
        6: 'nonVehicleCaptureNum'
      },
    };
  },
  mounted() {
    this.looper.start();
  },
  beforeDestroy() {
    this.looper.destroy();
  },
  created() {
    this.looper = new RequestLooper(
      () => {
        const params = {
          startTime,
          endTime,
          detectTypes: [0, 1, 5, 6],
          sourceType: 'REALTIME',
          statisticsType: 'DETECTTYPE'
        };
        return alarmRealtimeSvr.getTodayCaptureCount(params);
      },
      (response) => {
        if (response.code === 0) {
          response.data.records.forEach((item) => {
            this.countMap[this.featureMap[item.code]] = item.count;
          });
        }
      },
      5000
    );
  },
  methods: {
    clickAllCapture() {
      // todo: 使用新跳转方法
      const moduleAuth = this.$store.getters.modulesByAlias('capture-search');
      if (moduleAuth) {
        switchToModule({
          module: 'capture-search',
          pageType: 'single',
          isBlank: true,
          query: {
            time: [startTime, endTime],
            sourceType: 'CAMERA'
          }
        });
      } else {
        this.$message.info('当前用户无抓拍检索查看权限');
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.statistics-panel {
  display: flex;
  justify-content: stretch;
  align-items: stretch;
  background: #1c1843;
  color: #ffffff;
  padding: 0 5px;
  .panel-statistics {
    flex: 1 0 100px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    .statistics-item {
      display: flex;
      width: 100%;
      flex-direction: row;
      align-items: center;
      .icon {
        flex: 0 0 20px;
        text-align: center;
      }
      .label {
        flex: 1;
        text-align: start;
      }
    }
  }
  .panel-button {
    flex: 0 0 60px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #1c1843;
    span {
      cursor: pointer;
      display: flex;
      align-items: center;
    }
  }
}
</style>
