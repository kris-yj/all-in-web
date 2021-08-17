/**
 * 有节点信息判断是否显示图标
 * @param {Object} data 节点映射数据
 */
export function mapIconShow(data) {
  return data.flag === 'unit' || data.flag === 'camera';
}

/**
 * 由节点信息映射图标类型
 * @param {Object} data 节点映射数据
 */
export function mapIconName(data) {
  const type = (data.type && data.type.toString()) || '1';
  switch (data.flag) {
    case 'camera':
      switch (type) {
        case '1':
        case '4':
          return 'camera_video'; // 视频流相机
        case '2':
        case '3':
        case '11':
        case '12':
        case '13':
        case '14':
        case '15':
          return 'camera_capture'; // 抓拍机
        case '5':
          return 'identity_card'; // 人证机
        case '6':
          return 'glasses_card'; // 眼镜设备
        case '7':
          return 'portface'; // 便携设备
        default:
          return '';
      }
    case 'unit':
      return 'camera_unlabeled'; // 重点单位
    default:
      return '';
  }
}

/**
 * 由节点信息映射图标颜色
 * @param {Object} data  节点映射数据
 */
export function mapIconColor(data) {
  if (data.flag === 'camera') {
    const status = data.status.toString() || ''; // eslint-disable-line
    // 视图库相机不能播放视频
    const type = data.type.toString() || ''; // eslint-disable-line
    if (type === '3') {
      return '#EE6723';
    }
    switch (status) {
      case '1': // 准备中
      case '5': // 暂停中
      case '0': // 正在进行中
        return '#46A653';

        // return '#8A97A0';
      case '2': // 异常
        return '#EE6723';
      default:
        return '#EE6723';
    }
  } else if (data.flag === 'unit') {
    return '#8A97A0';
  } else {
    return '#8A97A0';
  }
}

/**
 * 由节点信息判断是否可用于视频类设备拖拽
 * @param {Object} data
 */
export function canNodeDragForVideo(data) {
  const validateType = data.flag === 'camera'
  && data.type !== '3'
  && data.type !== '5'
  && data.type !== '6'
  && data.type !== '7';
  return ['0', '1', '5'].includes(data.status) && validateType && !data.disableDrag;
}

/**
 * 由节点信息判断是否可用于通用设备类拖拽
 * @param {Object} data
 */
export function canNodeDragForCapture(data) {
  return data.flag === 'camera' && ['0', '1', '5'].includes(data.status) && !data.disableDrag;
}
