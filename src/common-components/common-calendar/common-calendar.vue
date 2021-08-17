<template>
  <page-layout>
    <div class="calendar-wrapper">
      <div class="switch-mode">
        <meg-button-group>
          <meg-button
            :type="showMonth ? 'primary' : 'plain'"
            @click="showMonth = true">
            {{ '月视图' }}
          </meg-button>
          <meg-button
            :type="!showMonth ? 'primary' : 'plain'"
            @click="showMonth = false">
            {{ '周视图' }}
          </meg-button>
        </meg-button-group>
      </div>
      <common-week-calendar
        v-model="currentDate"
        v-show="!showMonth">
        <template
          slot="dateCell"
          slot-scope="{day, hour}">
          <span
            class="hour-task"
            v-if="showWeekTask(day, hour)"></span>
        </template>
      </common-week-calendar>
      <common-month-calendar
        v-model="currentDate"
        v-show="showMonth">
        <template
          slot="dateCell"
          slot-scope="{date, data}">
          <div
            v-if="showTask(data)"
            :class="['date-task-wrap', data.isSelected? 'is-selected': '']">
            <div
              :class="['top', currentTaskList[data.day].up ? 'show': '']">
            </div>
            <div
              :class="['bottom', currentTaskList[data.day].bottom ? 'show': '']"></div>
          </div>
        </template>
      </common-month-calendar>
    </div>
  </page-layout>
</template>

<script>
import commonWeekCalendar from '@/common-components/common-calendar/calendar-week';
import commonMonthCalendar from '@/common-components/common-calendar/calendar-month';

export default {
  components: {
    commonWeekCalendar,
    commonMonthCalendar
  },
  props: {
    // 当前任务列表
    currentTaskList: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      showMonth: true,
      currentDate: new Date()
    };
  },
  methods: {
    showTask(data) {
      return data.type === 'current-month' && this.currentTaskList[data.day];
    },
    showWeekTask(day, hour) {
      return this.currentTaskList[day.date] && this.currentTaskList[day.date].hours.indexOf(hour) > -1;
    }
  }
};
</script>

<style lang="scss" scoped>
  .calendar-wrapper {
    position: relative;
    height: 100%;
  }
  .switch-mode{
    text-align: center;
    position: absolute;
    top: 7px;
    left: 50%;
    margin-left: -82px;
  }
  .date-task-wrap {
    height: 100%;
    display: flex;
    flex-direction: column;
    >div {
      height: 50%;
      background-color:#a3d7f6;
      opacity: 0;
    }
    .show{
      opacity: 1;
    }
  }
  .date-task-wrap.is-selected{
    > div{
      background-color: #f2f8fe;
    }
    .show{
      opacity: 1;
      background-color:#a3d7f6;
    }
  }
  .hour-task{
    display: block;
    background-color:#a3d7f6;
    height: 100%;
  }
</style>
