import Vue from 'vue';
import moment from 'moment';

Vue.filter('formatTime', (time, formater) => (time ? moment(new Date(time)).format(formater || 'YYYY-MM-DD HH:mm:ss') : ''));
