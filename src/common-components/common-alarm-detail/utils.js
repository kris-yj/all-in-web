import moment from 'moment';
/**
 * 将store数据转换为map
 * @param {Object} store
 */
export function convertStoreToMap(store) {
  if (!store) return {};
  const map = {};
  Object.values(store).forEach((item) => {
    map[item.code] = item.value;
  });
  return map;
}

export function formatTime(time) {
  return moment(time).format('YYYY-MM-DD HH:mm:ss');
}
