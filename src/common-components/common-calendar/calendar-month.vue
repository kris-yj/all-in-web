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
            @click="selectDate('prev-month')">
            {{ '上个月' }}
          </meg-button>
          <meg-button
            type="plain"
            size="mini"
            @click="d('today')">
            {{ '今天' }}
          </meg-button>
          <meg-button
            type="plain"
            size="mini"
            @click="d('next-month')">
            {{ '下个月' }}
          </meg-button>
        </meg-button-group>
      </div>
    </div>
    <div class="calendar__body">
      <calendar-base
        :date="date"
        :selected-day="realSelectedDay"
        :first-day-of-week="realFirstDayOfWeek"
        @pick="pickDay"></calendar-base>
    </div>
  </div>
</template>
<script>
import calendarBase from './calendar-month-base';
import { formatDate } from './utils';

const validTypes = ['prev-month', 'today', 'next-month'];

export default {
  components: {
    calendarBase
  },
  props: {
    // 默认传入的时间
    value: {
      type: [Date, String, Number],
      default: +new Date()
    },
    // 某个月的星期几开始 默认周日
    firstDayOfWeek: {
      type: Number,
      default: 0
    },
  },
  data() {
    return {
      selectedDay: '',
      now: new Date()
    };
  },
  provide() {
    return {
      monthCalendar: this
    };
  },
  computed: {
    realSelectedDay: {
      get() {
        if (!this.value) return this.selectedDay;
        return this.formatedDate;
      },
      set(val) {
        this.selectedDay = val;
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
        if (this.realSelectedDay) {
          const d = this.selectedDay.split('-');
          return new Date(d[0], d[1] - 1, d[2]);
        }
        return this.now;
      }
      return this.formatToDate(this.value);
    },
    prevMonthDatePrefix() {
      const tempTime = new Date(+this.date);
      tempTime.setDate(0);// 设置上个月的最后一天
      return formatDate(tempTime, 'YYYY-MM');
    },
    curMonthDatePrefix() {
      return formatDate(this.date, 'YYYY-MM');
    },

    nextMonthDatePrefix() {
      const temp = new Date(this.date.getFullYear(), this.date.getMonth() + 1, 1);
      return formatDate(temp, 'YYYY-MM');
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
     * @description 点击按钮(上个月、当天、下个月)的事件
     */
    d(type) {
      if (validTypes.indexOf(type) === -1) {
        throw new Error(`invalid type ${type}`);
      }
      let day = '';
      if (type === 'prev-month') {
        day = `${this.prevMonthDatePrefix}-01`;
      } else if (type === 'next-month') {
        day = `${this.nextMonthDatePrefix}-01`;
      } else {
        day = this.formatedToday;
      }

      if (day === this.formatedDate) return;
      this.pickDay(day);
    },
    /**
     * @description 选中天数的方法
     */
    pickDay(day) {
      this.realSelectedDay = day;
    },
    /**
     * @description 格式化val变成日期对象
     */
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
