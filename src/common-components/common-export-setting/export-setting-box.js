import Vue from 'vue';
import ExportSettingBox from './export-setting';

const ExportSettingBoxConstructor = Vue.extend(ExportSettingBox);

const showSettingMessageBox = (options = {}) => new Promise((resolve, reject) => {
  const exportSettingMessageBox = new ExportSettingBoxConstructor({
    el: document.createElement('div'),
    propsData: {
      chosen: options.chosen || [],
      remained: options.remained || [],
      category: !!options.category
    }
  });
  exportSettingMessageBox.showDialog().then(
    (data) => {
      resolve(data);
    },
    () => {
      reject();
    }
  ).finally(() => {
    // 选择过程结束后销毁组件，基于dialog组件的销毁机制，会自动从body移出
    exportSettingMessageBox.$destroy();
  });
});

export default { showSettingMessageBox };
