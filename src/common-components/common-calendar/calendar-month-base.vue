<script>
import {
  range as rangeArr, weekdaysShort, getFirstDayOfMonth, getPrevMonthLastDays, getMonthDays, formatDate
} from './utils';

export default {
  props: {
    selectedDay: {
      type: String,
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
    date: {
      type: Date,
      default: ''
    }
  },
  data() {
    return {
      WEEK_DAYS: weekdaysShort
    };
  },
  computed: {
    // 一个星期的文字
    weekDays() {
      const start = this.firstDayOfWeek;
      const { WEEK_DAYS } = this;
      if (typeof start !== 'number' || start === 0) {
        return WEEK_DAYS.slice();
      }
      return WEEK_DAYS.slice(start).concat(WEEK_DAYS.slice(0, start));
    },
    // 上个月前缀
    prevMonthDatePrefix() {
      const tempTime = new Date(+this.date);
      tempTime.setDate(0);// 设置上个月的最后一天
      return formatDate(tempTime, 'YYYY-MM');
    },
    // 当前月前缀
    curMonthDatePrefix() {
      return formatDate(this.date, 'YYYY-MM');
    },
    // 下个月前缀
    nextMonthDatePrefix() {
      const temp = new Date(this.date.getFullYear(), this.date.getMonth() + 1, 1);
      return formatDate(temp, 'YYYY-MM');
    },
    // 格式化当天的日期
    formatedToday() {
      return this.monthCalendar.formatedToday;
    },
    // 渲染每行的数据
    rows() {
      const { date } = this;
      let days = [];
      let firstDay = getFirstDayOfMonth(date);
      firstDay = firstDay === 0 ? 7 : firstDay;
      const firstDayOfWeek = typeof this.firstDayOfWeek === 'number' ? this.firstDayOfWeek : 1;
      const prevMonthDays = getPrevMonthLastDays(date, firstDay - firstDayOfWeek).map((day) => ({
        text: day,
        type: 'prev'
      }));
      const currentMonthDays = getMonthDays(date).map((day) => ({
        text: day,
        type: 'current'
      }));
      days = [...prevMonthDays, ...currentMonthDays];
      const nextMonthDays = rangeArr(42 - days.length).map((_, index) => ({
        text: index + 1,
        type: 'next'
      }));
      days = days.concat(nextMonthDays);
      return this.toNestedArr(days);
    }
  },
  inject: ['monthCalendar'],
  methods: {
    /**
     * @description 为单元格设置class
     */
    getCellClass({ text, type }) {
      const classes = [type];
      if (type === 'current') {
        const date = this.getFormateDate(text, type);
        if (date === this.selectedDay) {
          classes.push('is-selected');
        }
        if (date === this.formatedToday) {
          classes.push('is-today');
        }
      }
      return classes;
    },
    /**
     * @description 格式化日期
     */
    getFormateDate(day, type) {
      if (!day || ['prev', 'current', 'next'].indexOf(type) === -1) {
        throw new Error('invalid day or type');
      }
      let prefix = this.curMonthDatePrefix;
      if (type === 'prev') {
        prefix = this.prevMonthDatePrefix;
      } else if (type === 'next') {
        prefix = this.nextMonthDatePrefix;
      }
      day = `00${day}`.slice(-2);
      return `${prefix}-${day}`;
    },
    /**
     * @description 选中天的事件
     */
    pickDay({ text, type }) {
      const date = this.getFormateDate(text, type);
      this.$emit('pick', date);
    },
    /**
     * @description 渲染传入的slot
     */
    cellRenderProxy({ text, type }) {
      const render = this.monthCalendar.$scopedSlots.dateCell;
      if (!render) return '';
      const day = this.getFormateDate(text, type);
      const date = new Date(day);
      const data = {
        isSelected: this.selectedDay === day,
        type: `${type}-month`,
        day
      };
      return render({ date, data });
    },
    toNestedArr(days) {
      return rangeArr(days.length / 7).map((_, index) => {
        const start = index * 7;
        return days.slice(start, start + 7);
      });
    },
  },
  render() {
    const thead = this.hideHeader ? null : (<thead>
      {
        this.weekDays.map((day) => <th key={day}>{ day }</th>)
      }
    </thead>);
    return (
      <table
        class={{
          'calendar-table': true,
        }}
        cellspacing="0"
        cellpadding="0">
        {
          thead
        }
        <tbody>
          {
            this.rows.map((row, index) => <tr
              class={{
                'calendar-table__row': true,
                'calendar-table__row--hide-border': index === 0 && this.hideHeader
              }}
              key={index}>
              {
                row.map((cell, key) => <td key={key}
                  class={ this.getCellClass(cell) }
                  onClick={this.pickDay.bind(this, cell)}>
                  <div class="calendar-day">
                    <span class="day-number">{cell.text}</span>
                    <div class="day-others">
                      {
                        this.cellRenderProxy(cell)
                      }
                    </div>
                  </div>
                </td>)
              }
            </tr>)
          }
        </tbody>
      </table>);
  }
};
</script>
<style lang="scss" scoped>
  .calendar-table {
    table-layout: fixed;
    width: 100%;
    height: 100%;
    th {
      padding: 12px 0;
      color: #606266;
      font-weight: 400;
      border-top: 1px solid #ebeef5;
      border-right: 1px solid #ebeef5;
    }
    th:first-child {
      border-left: 1px solid #ebeef5;
    }
    tr td:first-child{
      border-left: 1px solid #ebeef5;
    }
    tr:first-child td{
      border-top: 1px solid #ebeef5;
    }
    td.is-today .day-number {
      color: #fff !important;
      background-color: #f93f40;
      border-radius: 30px;
    }
    td.is-selected .calendar-day{
      background-color: #f2f8fe;
    }
    td.is-selected .day-number{
      color: #21539b;

    }
    td {
      border-bottom: 1px solid #ebeef5;
      border-right: 1px solid #ebeef5;
      vertical-align: top;
      transition: background-color .2s ease;
      .calendar-day {
        box-sizing: border-box;
        height: 100%;
        display: flex;
        flex-direction: column;
      }
      .calendar-day:hover{
        cursor: pointer;
        background-color: #f2f8fe;
      }
      .day-number {
        display: block;
        text-align: center;
        font-size: 14px;
        color: #5e6d82;
        line-height: 30px;
        box-sizing: border-box;
        width: 30px;
        margin: 8px 0 2px 8px;
      }
      .day-others{
        flex: 1;
      }
    }
    td.prev, td.next {
      .day-number {
        color: #c0c4cc;
      }
    }
    td.current {

    }
  }
</style>
