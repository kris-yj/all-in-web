import analysisFilter from './analysis-filter';

analysisFilter.install = function (Vue) {
  Vue.component(analysisFilter.name, analysisFilter);
};

export default analysisFilter;
