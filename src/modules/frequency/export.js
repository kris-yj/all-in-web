/* Automatically generated by './build/add-module.js' */
import './preset';
import module from '@/modules/frequency/pages/frequency';
import routes from '@/modules/frequency/frequency.router.js';
import store from '@/modules/frequency/store';

export default {
  module,
  routes,
  store: { frequency: store }
};