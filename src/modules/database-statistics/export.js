/* Automatically generated by './build/add-module.js' */
import './preset';
import module from '@/modules/database-statistics/pages/database-statistics';
import routes from '@/modules/database-statistics/database-statistics.router.js';
import store from '@/modules/database-statistics/store';

export default {
  module,
  routes,
  store: { databaseStatistics: store }
};