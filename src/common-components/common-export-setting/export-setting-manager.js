import exportSettingBox from './export-setting-box';

// export const export_setting_preset = {
//   alarm: 'alarm_export_column',
//   alarm_cascade: 'cascade_alarm_export_column',
//   capture: 'capture_export_column',
//   face_search: 'search_export_column',
//   body_search: 'body_search_export_columns',
//   judge_region_album: 'region_album_collision_export_column',
//   judge_collision: 'collision_export_column',
//   judge_record_crash: 'profile_analyze_export_column'
// };

export default class ExportSettingManager {
  constructor(storeInstance, storeName, presetName, fieldInCategory = false) {
    if (!storeInstance) throw new Error('ExportSettingManager error: storeInstance is null');
    if (!storeName) throw new Error('ExportSettingManager error: storeName is empty');
    if (!presetName) throw new Error('ExportSettingManager error: presetName is empty');
    this.$store = storeInstance;
    this.$storeName = storeName;
    this.$presetName = presetName;
    this.fieldInCategory = fieldInCategory;
    this.innerChosenItems = [];
    this.innerRemainedItems = [];
    this.readFields();
  }

  readFields() {
    try {
      const storeRemained = localStorage.getItem(`${this.$storeName}-remained`);
      const storeChosen = localStorage.getItem(`${this.$storeName}-chosen`);
      const presetChosen = this.$store.getters.dataMapByType(this.$presetName);
      this.innerRemainedItems = (storeRemained || storeChosen) ? JSON.parse(storeRemained) : [];
      this.innerChosenItems = (storeRemained || storeChosen) ? JSON.parse(storeChosen) : presetChosen || [];
    } catch (err) {
      throw new Error(`ExportSettingManager error: ${err.message}`);
    }
  }

  saveFields() {
    try {
      localStorage.setItem(`${this.$storeName}-remained`, JSON.stringify(this.innerRemainedItems));
      localStorage.setItem(`${this.$storeName}-chosen`, JSON.stringify(this.innerChosenItems));
    } catch (err) {
      throw new Error(`ExportSettingManager error: ${err.message}`);
    }
  }

  extentChosen(item) {
    const temp = Array.isArray(item) ? item : [item];
    this.innerChosenItems.push(...temp);
  }

  extentRemained(item) {
    const temp = Array.isArray(item) ? item : [item];
    this.innerRemainedItems.push(...temp);
  }

  /**
   * @description 过滤 导出字段
   * @param {Array} code码
   */
  excludeExportCode(item) {
    const temp = Array.isArray(item) ? item : [item];
    this.innerChosenItems = this.innerChosenItems.filter((val) => !(temp.includes(val.code)));
    this.innerRemainedItems = this.innerRemainedItems.filter((val) => !(temp.includes(val.code)));
  }

  setExportSetting() {
    return exportSettingBox.showSettingMessageBox({
      chosen: this.innerChosenItems,
      remained: this.innerRemainedItems,
      category: this.fieldInCategory
    }).then((ret) => {
      const [chosenItems, remainedItems] = ret;
      this.innerChosenItems = chosenItems;
      this.innerRemainedItems = remainedItems;
      this.saveFields();
    }, () => {
      console.log('export setting save cancel');
    });
  }

  /**
   * 获取导出设置
   */
  getExportSetting() {
    return this.innerChosenItems.map((val) => (val));
  }

  /**
   * 获取导出字段code码
   */
  getExportFiledCode() {
    return this.innerChosenItems.map((val) => (val.code));
  }
}
