/* Automatically generated by './build/add-module.js' */
import './preset';
import module from '@/modules/results/pages/results';
import routes from '@/modules/results/results.router.js';
import store from '@/modules/results/store';

export default {
  module,
  routes,
  store: { results: store }
};