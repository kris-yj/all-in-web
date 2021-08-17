import AlarmDetailSrv from './alarm-detail.service';
import { convertStoreToMap } from './utils';
import getProcessorResult from './processor';

const mixin = {
  data() {
    return {
      deployTypeList: [], // 布控类型列表
      map: {
        alarmLevelColorMap: {}, // 报警颜色
        realtimeLevelMap: {}, // 报警级别
        alarmProcessStatusMap: {}, // 处理状态映射表
        realtimeResultMap: {}, // 处理结果
        cardTypeMap: {}, // 证件类型
        nationMap: {}, // 民族
        genderMap: {}, // 性别
        originMap: {}, // 籍贯
        realTruthMap: {}, // 警情真假
        cameraTypeMap: {}, // 相机类型
        countTypeMap: {
          '2': this.$t('人'),
          '3': this.$t('次'),
          '4': this.$t('条')
        }
      },
      temporaryMap: {
        'surveillance-task': 7,
        'alarm-history': 4,
        'alarm-realtime': 5,
      }
    };
  },

  created() {
    this.init();
  },
  methods: {
    init() {
      // this.getDeployTypeList();
      this.initMap();
    },
    /**
     * @description 获得tempOrigin参数
     * @param {name}
     * @returns
     */
    getTempOrigin(name) {
      if (/surveillance-task/.test(name)) {
        return this.temporaryMap['surveillance-task'];
      }
      if (/alarm-history/.test(name)) {
        return this.temporaryMap['alarm-history'];
      }
      if (/alarm-realtime/.test(name)) {
        return this.temporaryMap['alarm-realtime'];
      }
      return '';
    },
    /**
     * @description 处理外部数据转换成标准数据
     * @param {object} data
     * @returns {object}
     */
    getNormalData(data) {
      const result = getProcessorResult(data, this.map);
      return result;
    },
    initMap() {
      this.map.alarmLevelColorMap = convertStoreToMap(this.$store.getters.dataMapByType('album_color'));
      this.map.realtimeLevelMap = convertStoreToMap(this.$store.getters.dataMapByType('realtime_level'));
      this.map.alarmProcessStatusMap = convertStoreToMap(this.$store.getters.dataMapByType('realtime_deal'));
      this.map.realtimeResultMap = convertStoreToMap(this.$store.getters.dataMapByType('realtime_result'));
      this.map.cardTypeMap = convertStoreToMap(this.$store.getters.dataMapByType('album_card'));
      this.map.nationMap = convertStoreToMap(this.$store.getters.dataMapByType('common_people'));
      this.map.genderMap = convertStoreToMap(this.$store.getters.dataMapByType('common_gender'));
      this.map.originMap = convertStoreToMap(this.$store.getters.dataMapByType('common_origin'));
      this.map.realTruthMap = convertStoreToMap(this.$store.getters.dataMapByType('realtime_truth'));
      this.map.cameraTypeMap = convertStoreToMap(this.$store.getters.dataMapByType('camera_type'));
    },
    getDeployTypeList() {
      AlarmDetailSrv.getDeployTypeList().then((res) => {
        if (res.code === 0) {
          this.deployTypeList = res.data.records;
        }
      });
    },

  }
};

export default mixin;
