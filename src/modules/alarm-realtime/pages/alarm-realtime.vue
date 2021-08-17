<template>
  <div class="alarm-realtime">
    <component
      :is="currentMode"
      @mode-changed="onModeChanged">
    </component>
  </div>
</template>

<script>
import { clearDeviceData } from '../components/device-data';

const MODE_MAP = [
  'ModeMap',
  'ModeVideo',
  'ModeCapture',
  'ModeStruct',
  'ModePolice'
];

export default {
  name: 'AlarmRealtime',
  components: {
    ModeMap: () => import(/* webpackChunkName: "alarmRealtimeModeMap" */ '../components/mode-map/mode-map.vue'),
    ModeVideo: () => import(/* webpackChunkName: "alarmRealtimeModeVideo" */ '../components/mode-video/mode-video.vue'),
    ModeCapture: () => import(/* webpackChunkName: "alarmRealtimeModeCapture" */ '../components/mode-capture/mode-capture.vue'),
    ModeStruct: () => import(/* webpackChunkName: "alarmRealtimeModeStruct" */ '../components/mode-struct/mode-struct.vue'),
    ModePolice: () => import(/* webpackChunkName: "alarmRealtimeModePolice" */ '../components/mode-police/mode-police.vue')
  },
  data() {
    return {
      currentMode: '',
    };
  },
  mounted() {
    let configOptions = this.$store && this.$store.getters.systemByType('realtimeAlarmMode').value;
    try {
      configOptions = configOptions.split(',').map((item) => String.prototype.trim.call(item));
    } catch (err) {
      configOptions = [];
    }
    if (!(Array.isArray(configOptions) && configOptions.length > 0)) {
      console.warn('alarm mode is invalidate', configOptions);
      configOptions = ['0', '2', '3', '4'];
    }
    // 获取默认记录的报警模式，如果存在则跳转到指定路由
    const modeDefault = localStorage.getItem('alarmRealtime-default-mode');
    if (modeDefault) {
      const mode = JSON.parse(modeDefault);
      if (configOptions.indexOf(mode.id) >= 0) { this.currentMode = mode.value; } else {
        const modeIndex = configOptions[0];
        this.currentMode = MODE_MAP[modeIndex];
      }
    } else {
      const modeIndex = configOptions[0];
      if (!MODE_MAP[modeIndex]) console.warn(`mode is invalidate index: ${modeIndex}`);
      this.currentMode = MODE_MAP[modeIndex];
    }
  },
  beforeDestroy() {
    // 销毁前将报警声音暂停
    this.$audio.stop();
    // 销毁前将设备数据清除
    clearDeviceData();
  },
  methods: {
    onModeChanged(mode) {
      this.currentMode = mode;
      // this.megAudio.stop();
    }
  },
  beforeRouteLeave(to, from, next) {
    console.warn('leave realtime alarm');
    // this.megAudio.stop();
    next();
  }
};
</script>

<style scoped>
.alarm-realtime {
  width: 100%;
  height: 100%;
  position: relative;
  background: #dce1e5;
}
</style>
