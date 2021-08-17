import Vue from 'vue';
import ExportMessageBox from './export-message-box.vue';

const ExportMessageBoxConstructor = Vue.extend(ExportMessageBox);

const showExportMessageBox = (options = {}) => new Promise((resolve, reject) => {
  const exportMessageBox = new ExportMessageBoxConstructor({
    el: document.createElement('div'),
    propsData: {
      exportType: options.type || 'time',
      title: options.title || '',
      tips: options.tips || '',
      selectOptions: options || {}
    }
  });
  exportMessageBox.showDialog().then(
    (data) => {
      resolve(data);
    },
    () => {
      reject();
    }
  ).finally(() => {
    // 选择过程结束后销毁组件，基于dialog组件的销毁机制，会自动从body移出
    exportMessageBox.$destroy();
  });
});

export default { showExportMessageBox };
