/* Automatically generated by './build/add-module.js' */
import './preset';
import module from '@/modules/path-trace/pages/path-trace';
import routes from '@/modules/path-trace/path-trace.router.js';
import store from '@/modules/path-trace/store';

export default {
  module,
  routes,
  store: { pathTrace: store }
};
