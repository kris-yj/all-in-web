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

export function getCameraIconName(type) {
  switch (type) {
    case '1':
    case '2':
    case '3':
    case '4':
      return 'camera_normal';
    case '5':
      return 'identity_card';
    case '6':
      return 'glasses_card';
    case '7':
      return 'portface';
    default:
      return 'camera_normal';
  }
}
