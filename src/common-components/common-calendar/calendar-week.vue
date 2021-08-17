<template>
  <div class="common-calendar">
    <div class="calendar__header">
      <div class="calendar__title">
        {{ currentDate }}
      </div>
      <div class="calendar__button-group">
        <meg-button-group>
          <meg-button
            type="plain"
            size="mini"
            @click="selectDate('prev-week')">
            {{ '上个周' }}
          </meg-button>
          <meg-button
            type="plain"
            size="mini"
            @click="selectDate('today')">
            {{ '今天' }}
          </meg-button>
          <meg-button
            type="plain"
            size="mini"
            @click="selectDate('next-week')">
            {{ '下个周' }}
          </meg-button>
        </meg-button-group>
      </div>
    </div>
    <div class="calendar__body">
      <calendar-base
        :date="date"
        :selected-day="realStartDay"
        :first-day-of-week="realFirstDayOfWeek"></calendar-base>
    </div>
  </div>
</template>
<script>
import calendarBase from './calendar-week-base';
import { formatDate } from './utils';

const validTypes = ['prev-week', 'today', 'next-week'];
const oneDay = 86400000;

export default {
  components: {
    calendarBase
  },
  props: {
    // 默认传入的时间
    value: {
      type: [Date, String, Number],
      default: undefined
    },
    // 某个月的星期几开始 默认周日
    firstDayOfWeek: {
      type: Number,
      default: 0
    },
  },
  data() {
    return {
      startDay: '',
      now: new Date()
    };
  },
  provide() {
    return {
      weekCalendar: this
    };
  },
  computed: {
    realStartDay: {
      get() {
        if (!this.value) return this.startDay;
        return this.formatedDate;
      },
      set(val) {
        this.startDay = val;
        const date = new Date(val);
        this.$emit('input', date);
      }
    },
    currentDate() {
      const year = this.date.getFullYear();
      const month = this.date.getMonth() + 1;
      return `${year}年${month}月`;
    },
    date() {
      if (!this.value) {
        if (this.realStartDay) {
          const d = this.startDay.split('-');
          return new Date(d[0], d[1] - 1, d[2]);
        }
        return this.now;
      }
      return this.formatToDate(this.value);
    },
    prevWeek() {
      const date = +new Date(this.date) - 7 * oneDay;
      return formatDate(date, 'YYYY-MM-DD');
    },
    curMonthDatePrefix() {
      return formatDate(this.date, 'YYYY-MM');
    },

    nextWeek() {
      const date = +new Date(this.date) + 7 * oneDay;
      return formatDate(date, 'YYYY-MM-DD');
    },
    realFirstDayOfWeek() {
      if (this.firstDayOfWeek < 1 || this.firstDayOfWeek > 6) {
        return 0;
      }
      return Math.floor(this.firstDayOfWeek);
    },
    formatedDate() {
      return formatDate(this.date, 'YYYY-MM-DD');
    },
    formatedToday() {
      return formatDate(this.now, 'YYYY-MM-DD');
    },
  },
  methods: {
    /**
     * @description 点击按钮(上个周、当天、下个周)的事件
     */
    selectDate(type) {
      if (validTypes.indexOf(type) === -1) {
        throw new Error(`invalid type ${type}`);
      }
      let day = '';
      if (type === 'prev-week') {
        day = this.prevWeek;
      } else if (type === 'next-week') {
        day = this.nextWeek;
      } else {
        day = this.formatedToday;
      }
      if (day === this.formatedDate) return;
      this.pickDay(day);
    },
    pickDay(day) {
      const date = new Date(day).getDay();
      let tempDate = null;
      if (date === this.firstDayOfWeek) {
        tempDate = day;
      } else {
        if (date > this.firstDayOfWeek) {//eslint-disable-line
          tempDate = formatDate((+new Date(day) - (date - this.firstDayOfWeek) * oneDay), 'YYYY-MM-DD');
        } else {
          tempDate = formatDate(+new Date(day) - (date - this.firstDayOfWeek + 7) * oneDay, 'YYYY-MM-DD');
        }
      }
      this.realStartDay = tempDate;
    },
    formatToDate(val) {
      if (!val) throw new Error('invalid val');
      return val instanceof Date ? val : new Date(val);
    }
  }
};
</script>
<style lang="scss" scoped>
  .common-calendar{
    background-color: #fff;
    height: 100%;
    display: flex;
    flex-direction: column;
    .calendar__header {
      display: flex;
      justify-content: space-between;
      padding: 12px 20px 0;
      height: 36px;
      box-sizing: border-box;
      .calendar__title{
        align-self: center;
        color: #435068;
        margin-left: 2px;
      }
    }
    .calendar__body{
      padding: 12px 20px 35px;
      flex: 1;
    }
  }
</style>
