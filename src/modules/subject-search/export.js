/* Automatically generated by './build/add-module.js' */
import './preset';
import module from '@/modules/subject-search/pages/subject-search';
import routes from '@/modules/subject-search/subject-search.router.js';
import store from '@/modules/subject-search/store';

export default {
  module,
  routes,
  store: { subjectSearch: store }
};