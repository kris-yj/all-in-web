/* Automatically generated by './build/add-module.js' */
import './preset';
import module from '@/modules/business-config/pages/business-config';
import routes from '@/modules/business-config/business-config.router.js';
import store from '@/modules/business-config/store';

export default {
  module,
  routes,
  store: { businessConfig: store }
};