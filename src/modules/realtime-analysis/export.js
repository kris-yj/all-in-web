/* Automatically generated by './build/add-module.js' */
import './preset';
import module from '@/modules/realtime-analysis/pages/realtime-analysis';
import routes from '@/modules/realtime-analysis/realtime-analysis.router.js';
import store from '@/modules/realtime-analysis/store';

export default {
  module,
  routes,
  store: { realtimeAnalysis: store }
};
