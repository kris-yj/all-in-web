/* Automatically generated by './build/add-module.js' */
import './preset';
import module from '@/modules/workbench/pages/workbench';
import routes from '@/modules/workbench/workbench.router.js';
import store from '@/modules/workbench/store';

export default {
  module,
  routes,
  store: { workbench: store }
};
