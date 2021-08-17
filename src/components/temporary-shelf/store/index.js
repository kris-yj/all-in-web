/* Automatically generated by './build/add-module.js' */
import actions from './actions';
import mutations from './mutations';
import getters from './getters';

const shelf = {
  namespaced: true,
  mutations,
  actions,
  getters,
  state: {
    isShelfOpen: false,
    manageShelfData: null,
    eventAddData: 0,
    deleteShelfData: null
  },
};

export default shelf;