import task from './task';

task.install = function (Vue) {
  Vue.component(task.name, task);
};

export default task;
