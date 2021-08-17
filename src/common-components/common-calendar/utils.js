import moment from 'moment';

const oneDay = 86400000;
const weeks = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
// const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const weeksObj = {
  'sun': '日',
  'mon': '一',
  'tue': '二',
  'wed': '三',
  'thu': '四',
  'fri': '五',
  'sat': '六',
};
// return Array.apply(null, { length: n }).map((_, n) => n);//eslint-disable-line

export const range = function (m, n) {
  // see https://stackoverflow.com/questions/3746725/create-a-javascript-array-containing-1-n
  if (!n) return Array.apply(null, { length: m }).map((_, m) => m);//eslint-disable-line
  return Array.from({ length: (n - m) }, (_, i) => i + m);
};
// 获取星期
export const weekdaysShort = weeks.map((week) => weeksObj[week]);
// 格式化日期
export const formatDate = (time, formater = 'YYYY-MM-DD HH:mm:ss') => (time ? moment(new Date(time)).format(formater) : '');
// 获取一年里面的天数
export const getDayCountOfYear = function (year) {
  const isLeapYear = year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0);
  return isLeapYear ? 366 : 365;
};
// 获取当月的第一天
export const getFirstDayOfMonth = function (date) {
  const temp = new Date(date.getTime());
  temp.setDate(1);
  return temp.getDay();
};
// 获取当周的最后一天的日
export const getLastDayOfWeek = function (date, firstDayOfWeek) {
  let lastDayOfWeek = firstDayOfWeek + 6;
  if (lastDayOfWeek > 6) lastDayOfWeek -= 7;
  const day = new Date(date.getTime()).getDay();
  let tempDate = new Date(date.getTime()).getDate();
  if (day !== lastDayOfWeek) {
    const temp = lastDayOfWeek - day;
    if (temp > 0) {
      tempDate = new Date(date.getTime + temp * oneDay).getDate();
    } else {
      tempDate = new Date(date.getTime + (temp + 7) * oneDay).getDate();
    }
  }
  return tempDate;
};
export const getWeekDays = function (date, firstDayOfWeek, weekDays) {
  let lastDayOfWeek = firstDayOfWeek + 6;
  if (lastDayOfWeek > 6) lastDayOfWeek -= 7;
  const day = new Date(date.getTime()).getDay();
  let tempDate = new Date(date.getTime());
  if (day !== lastDayOfWeek) {
    const temp = lastDayOfWeek - day;
    if (temp > 0) {
      tempDate = new Date(date.getTime() + temp * oneDay);
    } else {
      tempDate = new Date(date.getTime() + (temp + 7) * oneDay);
    }
  }
  const days = [];
  range(7).forEach((key) => {
    const tempDay = new Date(tempDate - key * oneDay);
    days.unshift({
      day: tempDay.getDate(),
      date: formatDate(tempDay, 'YYYY-MM-DD'),
      name: weekDays[6 - key]
    });
  });
  return days;
};

export const getPrevMonthLastDays = (date, amount) => {
  if (amount <= 0) return [];
  const temp = new Date(date.getTime());
  temp.setDate(0);
  const lastDay = temp.getDate();
  return range(amount).map((_, index) => lastDay - (amount - index - 1));
};

export const getMonthDays = (date) => {
  const temp = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const days = temp.getDate();
  return range(days).map((_, index) => index + 1);
};
export default {};
