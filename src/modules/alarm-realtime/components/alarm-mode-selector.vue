<template>
  <div class="alarm-mode-selector">
    <meg-select
      v-model="currentMode"
      style="width:155px"
      @change="onChange"
      :placeholder="$t('请选择')">
      <template
        v-slot:prefix>
        <span
          class="icon-refix">
          <meg-icon
            :name="currentModeIcon"
            :color="currentColor"
            width="16px"
            height="16px">
          </meg-icon>
        </span>
      </template>
      <meg-option
        v-for="item in options"
        :key="item.id"
        :label="item.label"
        :value="item.value"
        class="modeSelect-item">
        <span>
          <span>
            <meg-icon
              :name="item.icon"
              :color="item.color"
              width="16px"
              height="16px">
            </meg-icon>
          </span>
          <label class="modeSelect-item-label">{{ item.label }}</label>
        </span>
        <span
          @click.stop="setDefaultMode(item)"
          v-if="item.id!=defaultModeId"
          class="modeSelect-right__unselected">[{{ $t('默认') }}]</span>
        <span
          v-if="item.id===defaultModeId"
          class="modeSelect-right__selected">[{{ $t('默认') }}]</span>
      </meg-option>
    </meg-select>
  </div>
</template>

<script>
import { i18n } from '@/utils/i18n.utils';

const ALARM_MODE_MAP = [
  {
    id: '0',
    value: 'ModeMap',
    label: i18n.t('地图模式'),
    icon: 'map_mode',
    color: '#435068'
  },
  {
    id: '1',
    value: 'ModeVideo',
    label: i18n.t('视频模式'),
    icon: 'video_mode',
    color: '#435068 #ffffff'
  },
  {
    id: '2',
    value: 'ModeCapture',
    label: i18n.t('卡口模式'),
    icon: 'capture_mode',
    color: '#435068 #ffffff'
  },
  {
    id: '3',
    value: 'ModePolice',
    label: i18n.t('警情模式'),
    icon: 'alarmRealtime_menu', // todo icon 名称要改
    color: '#435068'
  },
  {
    id: '4',
    value: 'ModeStruct',
    label: i18n.t('结构化模式'),
    icon: 'struct-mode', // todo icon 名称要改
    color: '#435068'
  }
];

export default {
  name: 'ModeSelector',
  props: {
    defaultValue: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      defaultModeId: '0', // 默认模式id值
      currentMode: '', // 当前选择的模式
      options: []
    };
  },
  computed: {
    currentModeIcon() {
      const currentMode = this.options.find((item) => item.value === this.currentMode);
      if (currentMode) {
        return currentMode.icon;
      }
      return '';
    },
    currentColor() {
      const currentMode = this.options.find((item) => item.value === this.currentMode);
      if (currentMode) {
        return currentMode.color;
      }
      return '';
    }
  },
  created() {
    this.initMode();
  },
  mounted() {
    this.setMode(this.defaultValue);
  },
  methods: {
    onChange(value) {
      this.$emit('mode-changed', value);
    },
    // 设置默认模式
    setDefaultMode(item) {
      this.defaultModeId = item.id;
      localStorage.setItem('alarmRealtime-default-mode', JSON.stringify(item));
    },
    // 初始化默认模式
    initMode() {
      let configOptions = this.$store && this.$store.getters.systemByType('realtimeAlarmMode').value;
      // todo mock测试
      configOptions = '0,1,2,3,4';
      try {
        configOptions = configOptions.split(',').map((item) => String.prototype.trim.call(item));
      } catch (err) {
        configOptions = [];
      }
      if (!(Array.isArray(configOptions) && configOptions.length > 0)) configOptions = [0, 2, 3, 4];
      const ret = [];
      configOptions.forEach((index) => {
        if (index >= '0' && index <= '4') ret.push(ALARM_MODE_MAP[index]);
      });

      this.options = ret;

      const modeDefault = localStorage.getItem('alarmRealtime-default-mode');
      if (modeDefault) {
        const mode = JSON.parse(modeDefault);
        if (mode.id && configOptions.indexOf(mode.id)) {
          this.defaultModeId = mode.id;
        }
      }
    },
    // 外部可以直接调用方法设置当前选择值
    setMode(mode) {
      this.currentMode = mode;
    }
  }
};
</script>

<style scoped lang="scss">
.modeSelect-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modeSelect-item-label {
  padding-left: 7px;
}

.modeSelect-right__selected {
  color: #8492a6;
}

.modeSelect-right__unselected {
  display: none;
  line-height: 34px;
  color: #21539b;
}

.modeSelect-item:hover .modeSelect-right__unselected {
  display: block;
}

.modeSelect-right__unselected:hover {
  color: #177cce;
}
</style>
