<script>
import WS from 'megvii-websocket';
import config from '@/utils/config.utils';
import defaultAlarmAudio from '../../../assets/audio/default-alarm-audio.wav';

const ALARM_TYPE = {
  NEW_ALARM: 'alarm',
  UPDATE_ALARM: 'update_alarm'
};

export default {
  name: 'AlarmWebsocket',
  props: {
    isOpenAlarmAudio: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      isAudioLoop: false
    };
  },
  created() {
    // 是否循环播放报警声音
    this.isAudioLoop = this.$store.getters.systemByType('kunlun_alarm_sound_default_config').value === '2';
    // 初始化ws实例
    const ws = new WS({
      baseUrl: config.apiPath.socketUrl,
      token: window.localStorage.getItem('token'),
      json: true,
      isHeartBeat: true,
      heartBeatInterval: 5000,
      autoReconnect: true,
      reconnectInterval: 5000,
      onReceive: this.onReceive
    });
    Object.defineProperty(this, 'ws', {
      enumerable: false,
      configurable: false,
      writable: true,
      value: ws
    });
  },
  mounted() {
    this.ws.connect();
  },
  beforeDestroy() {
    this.ws.close();
    this.ws = null;
  },
  methods: {
    onReceive(data) {
      if (data.type === ALARM_TYPE.UPDATE_ALARM) {
        this.$emit('update-alarm', data.data || []);
      }
      if (data.type === ALARM_TYPE.NEW_ALARM) {
        if (this.isOpenAlarmAudio) {
          const audioUrl = (data.data[0] && data.data[0].album && data.data[0].album.voiceUrl) || defaultAlarmAudio;
          this.$audio.play(audioUrl, { loop: this.isAudioLoop });
        }
        this.$emit('add-alarm', data.data || []);
      }
    }
  },
  render() {
    return null;
  }
};
</script>
