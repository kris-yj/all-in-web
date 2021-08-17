import moment from 'moment';
import collapseDefaultData, { pickerOptions } from './components/search/default-data';

export default {
  name: 'AlarmHistoryMixin',
  components: {},
  props: {},
  data() {
    return {
      pickerOptions,
    };
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  methods: {
    init() {
      Object.keys(collapseDefaultData).forEach((val) => {
        this[val] = JSON.parse(JSON.stringify(collapseDefaultData[val]));
      });
      this.handlePreset(this.itemsOne[1], 'album_card', false);
      this.handlePreset(this.itemsTwo[0], 'common_gender');
      this.handlePreset(this.itemsTwo[1], 'realtime_age');
    },
    /**
     * @description 预置处理
     * @param {object} target
     * @param {string} systemName
     * @param {boolean} addAll 是否添加全部选项
     */
    handlePreset(target, systemName, addAll = true) {
      const ele = {
        name: this.$t('全部'),
        code: '',
      };
      const arr = addAll ? [ele, ...this.$store.getters.dataMapByType(systemName).map((item) => ({
        name: item.value,
        code: item.code,
      }))] : [...this.$store.getters.dataMapByType(systemName).map((item) => ({
        name: item.value,
        code: item.code,
      }))];
      target.data = arr;
      const map = {};
      arr.forEach((val) => {
        map[val.code] = val;
      });
      target.dataMap = map;
    },
    setDefaultDate() {
      const startTime = new Date(new Date(moment().subtract(6, 'days')).setHours(0, 0, 0, 0));
      const endTime = new Date(new Date().setHours(23, 59, 59, 999));
      this.defaultDate = [startTime, endTime];
      this.dateArr = [startTime, endTime];
    },
    /**
     * @description 设置默认条件
     * @param {object}
     */
    setCondition(obj) {
      Object.keys(obj).forEach((val) => {
        let timeArr = [];
        if (obj.timeArr) {
          timeArr = JSON.parse(obj.timeArr);
        }
        const [start, end] = timeArr;
        switch (val) {
          case 'cameraIds':
            this.form.cameraIds = JSON.parse(obj.cameraIds);
            break;
          case 'taskInfos':
            this.form.taskInfos = JSON.parse(obj.taskInfos);
            break;
          case 'timeArr':
            if (start !== undefined) {
              this.defaultDate = [new Date(start), new Date(end)];
              this.dateArr = [new Date(start), new Date(end)];
            }
            break;
          case 'strategyTypeId':
            this.form.strategyTypeId = obj.strategyTypeId;
            break;
          case 'photoCardNo':
            this.itemsOne[1].value = obj.identityType;
            this.itemsOne[2].value = obj.photoCardNo;
            break;
          case 'carNo':
            this.itemsThree[0].value = obj.carNo;
            break;
          case 'minSimilarity':
            this.form.minSimilarity = obj.minSimilarity;
            break;
          case 'maxSimilarity':
            this.form.maxSimilarity = obj.maxSimilarity;
            break;
          default:
            break;
        }
      });
    },
  },
};
