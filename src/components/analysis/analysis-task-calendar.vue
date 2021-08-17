<template>
  <div class="task-calendar">
    <div
      class="calendar-wrapper">
      <div class="calendar">
        <div class="calendar-content">
          <div class="calendar-header">
            <div class="switch-mode clearfix">
              <div
                class="change-to-month"
                :class="{'active': showMonth}"
                @click="changeToMonth">
                {{ $t('月视图') }}
              </div>
              <div
                class="change-to-week"
                :class="{'active': !showMonth}"
                @click="changeToWeek">
                {{ $t('周视图') }}
              </div>
            </div>
            <!-- 选择日历 -->
            <div class="dropdown-date">
              <div
                class="tab"
                v-show="!showMonth">
                <div
                  class="go-prev"
                  @click="goPrev">
                  &lt;
                </div>
                <div
                  class="go-next"
                  @click="goNext">
                  &gt;
                </div>
              </div>
              <div
                class="tab"
                v-show="showMonth">
                <div
                  class="go-prev"
                  style="color: #fff;">
                  &lt;
                </div>
                <div
                  class="go-next"
                  style="color: #fff;">
                  &gt;
                </div>
              </div>
              <meg-dropdown
                @command="handleYearCommand"
                style="margin-right: 10px;"
                placement="bottom"
                trigger="click">
                <span class="meg-dropdown-link">
                  {{ curYear }}<i class="el-icon-arrow-down el-icon--right"></i>
                </span>
                <meg-dropdown-menu
                  slot="dropdown"
                  style="max-height:200px;overflow-y:auto;">
                  <meg-dropdown-item
                    :command="year"
                    v-for="year in yearArr"
                    :key="year">
                    {{ year }}
                  </meg-dropdown-item>
                </meg-dropdown-menu>
              </meg-dropdown>
              <meg-dropdown
                @command="handleMonthCommand"
                placement="bottom"
                trigger="click">
                <span class="meg-dropdown-link">
                  {{ curMonth }}<i class="el-icon-arrow-down el-icon--right"></i>
                </span>
                <meg-dropdown-menu
                  slot="dropdown"
                  style="max-height:200px;overflow-y:auto;">
                  <meg-dropdown-item
                    :command="month"
                    v-for="month in 12"
                    :key="month">
                    {{ month }}
                  </meg-dropdown-item>
                </meg-dropdown-menu>
              </meg-dropdown>
            </div>
          </div>
          <div
            class="calendar-body"
            v-loading="loading">
            <div
              class="month-mode"
              v-show="showMonth">
              <div class="month-mode-weeks">
                <!-- 展示周几 -->
                <strong
                  v-for="(day, index) in weekdays"
                  :key="index">{{ day }}</strong>
              </div>
              <div class="month-mode-dates">
                <!-- 展示当前日期 -->
                <div
                  class="month-mode-days"
                  v-for="(week, index) in currentDates"
                  :key="index">
                  <div
                    class="day-cell"
                    v-for="(day, indexday) in week"
                    :key="indexday"
                    :class="{'today' : day.isToday,'not-current-month' : !day.isCurMonth}">
                    <!-- <p
                      v-if="day.monthDay === 1"
                      class="day-number">{{ day.month + '月' + day.monthDay + '日' }}</p> -->
                    <p
                      class="day-number"
                      :class="{'fail':day.status === 3}">
                      {{ day.monthDay }}
                      <span v-if="day.status === 3">!</span>
                    </p>
                    <div
                      class="day-task-list"
                      :class="{'active-task': activeDate === +day.date}"
                      @click="showTaskList(day)">
                      <div
                        class="day-task top"
                        :class="{'history':day.status === 0, 'active': day.up}"></div>
                      <div
                        class="day-task bottom"
                        :class="{'history':day.status === 0, 'active': day.bottom}"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              class="week-mode"
              v-show="!showMonth">
              <div class="week-mode-weeks clearfix">
                <!-- 展示周几 -->
                <strong class="fixed-column"></strong>
                <strong
                  :class="{'active': day.isToday}"
                  v-for="(day, index) in currentWeeks"
                  :key="index">
                  <span class="week-date">{{ day.monthDay }}</span>
                  <span class="week-name">{{ day.weekName }}</span>
                  <!-- <span class="">{{ day.hourArr }}</span> -->
                </strong>
              </div>
              <div class="week-mode-dates clearfix">
                <div
                  class="week-mode-hours"
                  v-for="hour in 24"
                  :key="hour">
                  <div class="hour-cell fixed-column">
                    <p v-if="hour - 1 < 10">
                      {{ "0" + ( hour - 1 ) + ':00' }}
                    </p>
                    <p v-else>
                      {{ hour - 1 + ':00' }}
                    </p>
                  </div>
                  <div
                    class="hour-cell"
                    :class="{'active': isActive(hour, day) }"
                    v-for="(day, index) in currentWeeks"
                    :key="index"
                    @click="showTaskList(day)">
                    <p></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import moment from 'moment';
import RealtimeSrv from '@/modules/realtime-analysis/realtime-analysis.service';

export default {
  name: 'Calendar',
  props: {
    eventBus: {
      type: Object,
      default: () => {}
    },
    showCalendar: {
      type: Boolean,
      default: true
    },
    cameraId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: false,
      locale: 'zh-CN',
      currentMonth: moment().startOf('month'),
      currentWeek: moment().startOf('week'),
      events: [],
      showMonth: true,
      firstDay: 0,
      firstFlag: true, // 第一次切换周模式应该展示的是本周
      getTaskObj: {},
      calendarTaskList: [],
      yearArr: [2018, 2019, 2020, 2021, 2022],
      activeDate: 0,
      currentDates: [],
      currentWeeks: []
    };
  },
  computed: {
    weekdays() {
      moment.locale(this.locale);
      return moment.weekdaysShort();
    },
    curDate() {
      if (!this.currentMonth) return;
      return this.currentMonth.format('YYYY MMMM');//eslint-disable-line
    },
    curYear() {
      if (!this.currentMonth) return;
      return this.currentMonth.format('YYYY');// eslint-disable-line
    },
    curMonth() {
      if (!this.currentMonth) return;
      return this.currentMonth.format('MM');// eslint-disable-line
    },
  },
  watch: {
    currentMonth(newVal, oldVal) {
      if (newVal.month() !== oldVal.month()) {
        this.initTask();
      }
    },
    currentWeek() {
      this.initTask();
    }
  },
  mounted() {
    this.getCurrentData();
    this.initTask();
  },
  methods: {
    isActive(hour, day) {
      // 单元格的时间区间和task的起止时间重叠则选中
      const { date, taskInfo } = day;
      if (taskInfo) {
        const { tasks } = taskInfo;
        if (tasks && tasks.length) {
          const d = new Date(date);
          d.setHours(hour - 1, 0, 0);
          const start = d.getTime();
          d.setHours(hour - 1, 59, 59);
          const end = d.getTime();
          return tasks.some((item) => {
            const { taskInfo: task } = item;
            if (task) {
              const { startTime, endTime } = task;
              const max = [start, startTime];
              const min = [end, endTime];
              return Math.max.apply(null, max) <= Math.min.apply(null, min);
            }
            return false;
          });
        }
      }
      return false;
    },
    getCurrentData() {
      this.currentDates = this.getCalendar();
      this.currentWeeks = this.getWeekCalendar();
    },
    initTask() {
      if (!this.cameraId) return;
      this.loading = true;
      const month = moment(this.currentMonth).get('month') + 1;
      const days = moment(`${this.curYear}-${month}`, 'YYYY-MM').daysInMonth();
      const beginDate = new Date(new Date(new Date(+this.currentMonth).setDate(1)).toLocaleDateString()).getTime(); // - 11 * 1000 * 60 * 60 * 24;
      const closeDate = new Date(new Date(new Date(+this.currentMonth).setDate(days)).toLocaleDateString()).getTime(); // + 11 * 1000 * 60 * 60 * 24;
      const fetchObj = {
        cameraId: this.cameraId,
        startTime: beginDate,
        endTime: closeDate
      };
      RealtimeSrv.queryTaskMonthList(fetchObj).then((res) => {
        if (res.code === 0) {
          res.data.forEach((item) => {
            item.tasks.forEach((a) => {
              const c = new Date(a.startTime);
              a.startTime1 = 'd:' + c.getDate() + ',h:' + c.getHours() + ',m:' + c.getMinutes(); // eslint-disable-line
              const c1 = new Date(a.endTime);
              a.startTime2 = 'd:' + c1.getDate() + ',h:' + c1.getHours() + ',m:' + c1.getMinutes(); // eslint-disable-line
              console.log('sss', a.startTime1, a.startTime2);
            });
          });
          this.loading = false;
          // 将获取到的数据渲染到日历中
          const tempTaskList = res.data;
          if (tempTaskList.length) {
            tempTaskList.forEach((item) => {
              const tempArr = [];
              item.tasks.forEach((cItem) => {
                const { startTime, endTime } = cItem;
                const beginHour = new Date(startTime).getHours();
                let closeHour = new Date(endTime).getHours();
                const beginWeekDay = moment(startTime).date();
                const closeWeekDay = moment(endTime).date();
                const obj = {
                  beginHour,
                  closeHour,
                  date: moment(startTime).date(),
                  month: moment(startTime).month() + 1,
                  taskInfo: cItem,
                };
                if (closeHour === 0 && beginWeekDay !== closeWeekDay) {
                  closeHour = 24;
                }
                if (beginHour < 12 && closeHour > 12) {
                  obj.up = true;
                  obj.bottom = true;
                } else if (beginHour < 12 && closeHour <= 12) {
                  obj.up = true;
                  obj.bottom = false;
                } else if (beginHour >= 12 && closeHour > 12) {
                  obj.up = false;
                  obj.bottom = true;
                }
                obj.status = cItem.status;
                tempArr.push(obj);
              });
              const tempObj = {
                date: item.date,
                tasks: tempArr,
              };
              this.calendarTaskList.push(tempObj);
            });
          } else {
            this.calendarTaskList = [];
          }
          if (!this.showMonth) {
            this.initWeekTaskInfo();
          }
          this.getCurrentData();
        }
      });
    },
    /**
     * 在右侧展示任务详情
     */
    showTaskList(day) {
      if (day.taskInfo) {
        this.activeDate = +day.date;
        this.$emit('change-plan-info', day);
      } else {
        this.activeDate = 0;
      }
    },
    getWeekCalendar() {
      const { calendarTaskList } = this;
      // console.log(calendarTaskList);
      const weekStartDate = this.getWeekViewStartDate(this.currentWeek);
      const week = [];
        for (let perDay = 0; perDay < 7; perDay++) {//eslint-disable-line
        week.push({
          monthDay: weekStartDate.date(),
          isToday: weekStartDate.isSame(moment(), 'day'),
          isCurMonth: weekStartDate.isSame(this.currentMonth, 'month'),
          weekDay: perDay,
          date: moment(weekStartDate),
          month: moment(weekStartDate).month() + 1,
          active: false,
          weekName: this.weekdays[perDay]
        });
        weekStartDate.add(1, 'day');
      }
      this.currentMonth = moment(weekStartDate);
      if (calendarTaskList) {
        week.forEach((day) => {
          day.hourArr = [];
          //  0-可撤销 1-执行中 2-执行成功 3-执行失败 4-被终止 5-调度中
          calendarTaskList.forEach((cItem) => {
            cItem.tasks.forEach((task) => {
              if ((Number(task.month) === day.month) && day.monthDay === task.date) {
                if (task.realCloseHour) {
                    for (let i = task.beginHour; i <= task.realCloseHour; i++) { //eslint-disable-line
                    day.hourArr.push(i);
                  }
                } else {
                    for (let i = task.beginHour; i < task.closeHour; i++) { //eslint-disable-line
                    day.hourArr.push(i);
                  }
                  if (task.beginHour === task.closeHour) {
                    day.hourArr.push(task.beginHour);
                  }
                }
                day.taskInfo = cItem;
              }
            });
            // 设置右边的taskinfo
          });
        });
      }
      return week;
    },
    // 获得月份的日历
    getCalendar() {
      const { calendarTaskList } = this;
      const monthViewStartDate = this.getMonthViewStartDate(this.currentMonth, this.firstDay);
      const calendar = [];
      for (let perWeek = 0; perWeek < 6; perWeek++) {//eslint-disable-line
        const week = [];
        for (let perDay = 0; perDay < 7; perDay++) {//eslint-disable-line
          week.push({
            monthDay: monthViewStartDate.date(),
            isToday: monthViewStartDate.isSame(moment(), 'day'),
            isCurMonth: monthViewStartDate.isSame(this.currentMonth, 'month'),
            weekDay: perDay,
            date: moment(monthViewStartDate),
            month: moment(monthViewStartDate).month() + 1,
            active: false
          });
          monthViewStartDate.add(1, 'day');
        }
        calendar.push(week);
      }
      if (calendarTaskList && calendarTaskList.length) {
        calendar.forEach((week) => {
          week.forEach((day, innerIndex) => {
            calendarTaskList.forEach((item, cIndex) => {
              const statusArr = [];
              item.tasks.forEach((task, index) => {
                if (Number(task.month) === day.month && day.monthDay === task.date) {
                  if (index === 0) {
                    day = { ...day };
                    day.up = task.up;
                    day.bottom = task.bottom;
                  } else {
                    if (task.bottom === true) {
                      day.bottom = task.bottom;
                    }
                    if (task.up === true) {
                      day.up = task.up;
                    }
                  }
                  day.taskInfo = item;
                  statusArr.push(task.status);
                }
              });
              if (item.tasks) {
                item.tasks.forEach((task) => {
                  if (Number(task.month) === day.month && day.monthDay === task.date) {
                    const flagArr = statusArr.filter((sItem) => sItem === 2 || sItem === 4);
                    if (statusArr.indexOf(3) > -1) {
                      day.status = 3; // 执行失败的任务
                    } else if (statusArr.indexOf(3) === -1 && statusArr.indexOf(1) > -1) {
                      day.status = 1; // 正在进行的任务
                    } else if (flagArr.length === statusArr.length) {
                      day.status = 0; // 历史任务
                    }
                  }
                });
              }
              //  0-可撤销 1-执行中 2-执行成功 3-执行失败 4-被终止 5-调度中
              this.$set(week, innerIndex, day);
              if (this.showMonth && day.isToday && (day.up || day.bottom)) {
                this.$emit('change-plan-info', day);
                this.activeDate = +day.date;
              } else if (this.showMonth && cIndex === 0 && (day.up || day.bottom)) {
                this.$emit('change-plan-info', day);
                this.activeDate = +day.date;
              }
            });
          });
        });
      } else {
        this.activeDate = 0;
        this.$emit('change-plan-info', {});
      }
      return calendar;
    },
    getWeekViewStartDate(date) {
      const curWeekStart = moment(date).format('E');
      // console.log(date);
      let curSunday = null;
      if (curWeekStart !== '7') {
        curSunday = moment(date).subtract(curWeekStart, 'days');// 周日日期
      } else {
        curSunday = moment(date).subtract(curWeekStart - 7, 'days');// 周日日期
      }
      return curSunday;
    },
    getMonthViewStartDate(date, firstDay) {
      firstDay = parseInt(firstDay);//eslint-disable-line
      const start = moment(date);
      const startOfMonth = moment(start.startOf('month')); // 某个月的第一天
      // console.log(startOfMonth.day());// 一个周的第几天
      start.subtract(startOfMonth.day(), 'days'); // 向前推几天  把上个月的某个周日加入
      if (startOfMonth.day() < firstDay) {
        start.subtract(7, 'days');
      }
      start.add(firstDay, 'days'); // firstDay 代表从周几开始，加上几
      return start;
    },
    getMonthViewEndDate(date) {//eslint-disable-line
      return this.getMonthViewStartDate().add(6, 'weeks');
    },
    /**
     * 当改变年份的时候
     */
    handleYearCommand(year) {
      const str = `${year}-${this.curMonth}-01`;
      this.currentMonth = moment(str).startOf('month');
      this.currentWeek = moment(str).startOf('week');
    },
    /**
     * 当改变月份的时候
     */
    handleMonthCommand(month) {
      if (month < 10) {
        month = `0${String(month)}`;
      }
      const str = `${this.curYear}-${month}-01`;
      this.currentMonth = moment(str).startOf('month');
      this.currentWeek = moment(str).startOf('week');
      const curDate = this.currentWeek.format('YYYY-MM-DD');
      if (moment(curDate).add(6, 'days').date() === 1) {
        this.currentWeek = moment(str).add(6, 'days');
      }
    },
    // 切换成周模式
    changeToWeek() {
      this.showMonth = false;
      this.initWeekTaskInfo();
    },
    initWeekTaskInfo() {
      const tempDay = this.currentWeeks.find((item) => item.taskInfo);
      if (tempDay) {
        this.showTaskList(tempDay);
      } else {
        this.$emit('change-plan-info', {});
      }
    },
    // 切换成月模式
    changeToMonth() {
      this.showMonth = true;
    },
    goPrev() {
      const day = moment(this.currentWeeks[0].date).subtract(7, 'days');
      this.currentWeek = day;
      this.initWeekTaskInfo();
    },
    goNext() {
      const day = moment(this.currentWeeks[0].date).add(7, 'days');
      this.currentWeek = day;
      this.initWeekTaskInfo();
    }
  }
};
</script>

<style scoped lang='scss'>
.task-calendar{
  width: 100%;
  height: 100%;
  background: #fff;
}
.calendar-wrapper{
    height: 100%;
    overflow: hidden;
    display: -webkit-box;
    display: -moz-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
  }
  .calendar{
    -webkit-box-flex: 1 1 auto;
    -webkit-flex: 1 1 auto;
    flex: 1 1 auto;
    overflow: hidden;
    height: 100%;
  }
  .calendar-content{
    position: relative;
    height: 100%;
  }
  /* header */
  .calendar-header{
    height: 64px;
    padding: 0 25px;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
  }
  .calendar-header>div{
    display: inline-block;
    line-height: 40px;
  }
  .calendar-header .switch-mode{
    margin-bottom: 20px;
  }
  /* .calendar-header .back-to-today{
    background-color: rgba(0,0,0,.04);
    padding: 0 20px;
    font-size: 14px;
    cursor: pointer;
    margin-right: 10px;
  } */
  .calendar-header .change-to-week, .calendar-header .change-to-month{
    font-size: 14px;
    cursor: pointer;
    padding: 0 21px;
    border: 1px solid #d2d6de;
    line-height: 36px;
    box-sizing: border-box;
    float: left;
    color:#5a6676;
  }
  .calendar-header .change-to-week.active, .calendar-header .change-to-month.active{
    background-color: #2b5496;
    color: #fff;
  }
  .calendar-header .change-to-month{
    margin-right: -1px;
  }
  .calendar-header .tab{
    display: inline-block;
  }
  .calendar-header .go-prev, .calendar-header .go-next{
    cursor: pointer;
    display: inline-block;
    font-size: 15px;
    width: 20px;
    color: rgba(0, 0, 0, 0.54);
  }
  .calendar-header .current-date {
    font-size: 15px;
    margin: 0 6px;
    color: rgba(0,0,0,.54);
    cursor: default;
  }
  /* body */
  .calendar-body{
    position: relative;
    width: 100%;
    height: -webkit-calc(100% - 90px);
    height: calc(100% - 90px);
    padding: 0 25px;
    display: -webkit-box;
    display: -moz-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
  }
  .month-mode, .week-mode{
    -webkit-box-flex: 1 1 auto;
    -webkit-flex: 1 1 auto;
    flex: 1 1 auto;
    overflow: hidden;
    position: relative;
    display: -webkit-box;
    display: -moz-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-flex-direction: column;
    flex-direction: column;
    border-left: 1px solid #f2f2f2;
  }
  .week-mode{
    border-left: none;
  }
  .month-mode-weeks{
    display: -webkit-box;
    display: -moz-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    line-height: 40px;
  }
  .month-mode-weeks strong{
    -webkit-box-flex: 1 1 auto;
    -webkit-flex: 1 1 auto;
    flex: 1 1 auto;
    border: 1px solid #f2f2f2;
    border-left: none;
    text-align: left;
    padding-left: 10px;
    box-sizing: border-box;
    color: #8a97a0;
  }
  .week-mode-weeks{
    line-height: 20px;
  }
  .week-mode-weeks strong{
    text-align: center;
    padding-right: 10px;
    box-sizing: border-box;
    float: left;
    width: calc(14.28% - 10px);
    /* border-right: 1px solid #f2f2f2; */
    border: 1px solid #f2f2f2;
    border-left: none;
    .week-name{
      display: block;
    }
    .week-date{
      display: inline-block;
      width: 20px;
      margin: 5px auto;
      box-sizing: border-box;
      border-radius: 100%;
    }
  }
  .week-mode-weeks strong.active{
    .week-date{
      background-color: #f93f40;
      color: #fff;
    }
  }
  .week-mode-weeks strong.fixed-column{
    width: 60px;
    height: 50px;
    padding-right: 0;
    border: none;
    border-right: 1px solid #f2f2f2;
    p {
      line-height: 18px;
    }
  }
  .month-mode-dates {
    display: -webkit-box;
    display: -moz-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-flex-direction: column;
    flex-direction: column;
    -webkit-box-flex: 1 1 0%;
    -webkit-flex: 1 1 0%;
    flex: 1 1 0%;
  }
  .week-mode-dates{
    -webkit-flex-direction: column;
    flex-direction: column;
    -webkit-box-flex: 1 1 0%;
    -webkit-flex: 1 1 0%;
    flex: 1 1 0%;
    height: 100%;
    display: flex;
    /* overflow: auto; */
  }
  .month-mode-days{
    position: relative;
    overflow: hidden;
    border-bottom: 1px solid #eee;
    display: -webkit-box;
    display: -moz-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-flex: 1 1 0%;
    -webkit-flex: 1 1 0%;
    flex: 1 1 0%;
    text-align: center;
  }
  .week-mode-hours{
    position: relative;
    overflow: hidden;
    /* border-bottom: 1px solid #eee; */
    display: -webkit-box;
    display: -moz-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    text-align: center;
    flex: 1 1 0%;
    /* height: 50px;
    line-height: 50px; */
  }
  .week-mode-hours:last-child .hour-cell{
    border-bottom: 1px solid #f2f2f2;
  }
  .week-mode-hours:last-child .hour-cell.fixed-column{
    border-bottom: none;
  }
  .month-mode-days .day-cell{
    -webkit-box-flex: 1 1 auto;
    -webkit-flex: 1 1 auto;
    flex: 1 1 auto;
    border-right: 1px solid #eee;
    cursor: pointer;
    display: flex;
    flex-direction: column;
  }
  .week-mode-hours .hour-cell{
    text-align: center;
    box-sizing: border-box;
    float: left;
    width: calc(14.28% - 10px);
    border-right: 1px solid #f2f2f2;
  }
  .week-mode-hours .hour-cell.history{
    background-color: #efefef;
  }
  .week-mode-hours .hour-cell.active{
    background-color: #a3d7f6;
  }
  .week-mode-hours .hour-cell.fail{
    background-color: #f93f40;
  }
  .week-mode-hours .hour-cell.fixed-column{
    width: 60px;
    /* border-right: 1px solid #f2f2f2; */
  }
  .month-mode-days .day-cell:hover{
    background-color: #f9f9f9;
  }
  .day-number{
     font-size: 14px;
    line-height: 30px;
    margin-left: 8px;
    margin-top: 8px;
    box-sizing: border-box;
    width: 30px;
    color: #444;
    margin-bottom: 2px;
  }
  .day-number.fail{
    color: #f93f40;
    font-weight: bold;
  }
  .day-task-list{
    box-sizing: border-box;
    flex: 1;
  }
  .day-task-list.active-task{
    border: 1px solid #21539b;
  }
  .day-task{
    width: 100%;
    height: 50%;
    // background-color: #a3d7f6;
  }
  .day-task.active{
    background-color: #a3d7f6;
  }
  .day-task.history.active{
    background: #efefef;
  }
  .day-cell.today .day-number{
    color: #fff;
    background-color: #f93f40;
    border-radius: 30px;
  }
  .not-current-month .day-number{
    color: #999;
  }
</style>
