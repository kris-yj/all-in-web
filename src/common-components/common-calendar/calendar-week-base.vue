<script>
import {
  weekdaysShort, getWeekDays
} from './utils';

export default {
  props: {
    date: {
      type: Date,
      default: ''
    },
    hideHeader: {
      type: Boolean,
      default: false
    },
    firstDayOfWeek: {
      type: Number,
      default: 0
    },
    selectedDay: {
      type: String,
      default: ''
    },
  },
  data() {
    return {
      WEEK_DAYS: weekdaysShort
    };
  },
  computed: {
    // 一个星期的文字
    weekDays() {
      let temp = [];
      const start = this.firstDayOfWeek;
      const { WEEK_DAYS } = this;
      if (typeof start !== 'number' || start === 0) {
        temp = WEEK_DAYS.slice();
      } else {
        temp = WEEK_DAYS.slice(start).concat(WEEK_DAYS.slice(0, start));
      }
      return temp;
    },
    // 一个星期的日期和文字
    weekArr() {
      const { date } = this;
      const days = getWeekDays(date, this.firstDayOfWeek, this.weekDays);
      return days;
    },
    formatedToday() {
      return this.weekCalendar.formatedToday;
    },
  },
  inject: ['weekCalendar'],
  methods: {
    /**
     * @description 获取当前格子的class
     */
    getCellClass(item) {
      const classes = ['date'];
      if (item.date === this.formatedToday) classes.push('is-today');
      return classes;
    },
    /**
     * @description 渲染传入的slot
     */
    cellRenderProxy(day, hour) {
      const render = this.weekCalendar.$scopedSlots.dateCell;
      if (!render) return '';
      return render({ day, hour });
    },
  },
  render() {
    const time = (
    <div class="calendar-week">
      <div class="weekdays">
      {
        this.weekArr.map((item) => (<div class="day">
            <div class="day-title">
              <span class={ this.getCellClass(item) }>{ item.day }</span>
              <span class="name">{ item.name }</span>
            </div>
            <div class="day-content">
              {
                [...Array(24)].map((cItem, cIndex) => (<span class="hour" key={cIndex}>
                  {
                    this.cellRenderProxy(item, cIndex)
                  }
                </span>))
              }
            </div>
          </div>))
      }
      </div>
      <div class="hours">
        {
          [...Array(24)].map((item, index) => <span class="hour" key={index}>{index < 10 ? `0${index}:00` : `${index}:00`}</span>)
        }
      </div>
    </div>
    );
    return time;
  }
};
</script>
<style lang="scss" scoped>
  .calendar-week{
    display: grid;
    grid-template-columns: 60px auto;
    grid-template-rows: 50px auto;
    grid-template-areas:
        "d c"
        "b c";
    height: 100%;
    .hours {
      grid-area: b;
      display: grid;
      grid-template-rows: repeat(24, 1fr);
      color: #606266;
    }
    .weekdays {
      grid-area: c;
      display: flex;
      .day{
        flex: 1;
        display: flex;
        flex-direction: column;
        color: #5e6d82;
        .day-title {
          display: flex;
          flex-direction: column;
          justify-content: space-evenly;
          text-align: center;
          height: 50px;
          .date {
            line-height: 20px;
            width: 20px;
            text-align: center;
            border-radius: 20px;
            margin: 0 auto;
          }
          .date.is-today {
            background-color: #f93f40;
            color: #fff;
          }

        }
        .day-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          .hour{
            flex: 1;
            border-right: 1px solid #ebeef5;
          }
          .hour:first-child{
            border-top: 1px solid #ebeef5;
          }
          .hour:last-child{
            border-bottom: 1px solid #ebeef5;
          }
        }
      }
    }
    .weekdays .day:first-child .hour{
      border-left: 1px solid #ebeef5;
    }
  }
</style>
