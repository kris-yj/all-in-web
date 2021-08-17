import _ from 'lodash';

/**
 * 内置颜色
 * 对于这里没有内置的，只需要在数据字典的 extension中写入color字段，指定对应的字符串格式的颜色即可
 * @sutianbin
 */
export const colorValue = {
  'white': '#ffffff', // 白色
  'black': '#000000', // 黑色
  'gray': '#cccccc', // 灰色
  'brown': '#9f7560', // 棕色
  'red': '#d30012', // 红色
  'blue': '#0782dc', // 蓝色
  'yellow': '#ffd547', // 黄色
  'green': '#62d192', // 绿色
  'pink': '#ffcfda', // 粉色
  'orange': '#f8836a', // 橙色
  'purple': '#a585dc', // 紫色
  'small_new_energy': 'linear-gradient(to bottom, #62d192 , rgba(0,255,0,0))', // 新能源小型车
  'large_new_energy': 'linear-gradient(to bottom, #62d192 , rgba(0,255,0,0))', // 新能源大型车
  'vehicle_color_gray': '#cccccc', // 银灰
  'itasha': 'linear-gradient(to bottom right, red , blue)', // 花色
  'dark_blue': '#0782dc', // 蓝色
  'light_blue': '#5cd8e1', // 青色
  // 车辆新增颜色
  'cyan': '#00ffff', // 青色
  'silvery': '#c0c0c0', // 银灰
  'champagne': '#FFF9B1', // 香槟色
};

/**
 * 属性分类
 * sort 为归类排序，text 为归类的时候的替代显示文字(如果要显示短一些的文字的话，不提换就可以不传或传'')
 * outer 是因为属性检索的时候，有归类需要纳入更多，outer为true的表示不纳入更多
 */
const propertyClassifyMap = {
  // 人脸
  // 'face_age_num': { sort: 1, text: '' },
  // 'face_gender': { sort: 1, text: '' },
  'face_hair': { sort: 2, text: '发型', outer: true },
  'face_hat': { sort: 2, text: '帽子', outer: true },
  'face_glasses': { sort: 2, text: '眼镜', outer: true },
  'face_bread': { sort: 3, text: '胡子', outer: true },
  'face_respirator': { sort: 3, text: '口罩', outer: true },
  'face_skin_color': { sort: 3, text: '', outer: true },
  // 人体 10开始
  // 'body_gender': { sort: 10, text: '' },
  'body_dress_upper_color': { sort: 10, text: '上身颜色', outer: true },
  'body_dress_upper_grain': { sort: 10, text: '纹理', outer: true },
  'body_dress_upper_size': { sort: 10, text: '服饰', outer: true },
  'body_upper_logo': { sort: 10, text: 'logo', outer: true },
  'body_dress_upper_style': { sort: 10, text: '类型', outer: true },

  'body_dress_lower_color': { sort: 11, text: '下身颜色', outer: true },
  'body_dress_lower_size': { sort: 11, text: '服饰', outer: true },
  'body_dress_lower_style': { sort: 11, text: '类型', outer: true },
  'body_dress_lower_skirt': { sort: 11, text: '下衣裙子', outer: true },

  'body_age_num': { sort: 12, text: '' },
  'body_glasses': { sort: 12, text: '' },

  'body_figure': { sort: 13, text: '' },
  'body_dress_upper_coat': { sort: 13, text: '' },

  'body_hair_length': { sort: 14, text: '' },
  'body_wear_hat': { sort: 14, text: '帽子' },
  'body_hat_color': { sort: 14, text: '颜色' },
  'body_wear_safetycap': { sort: 14, text: '安全帽' },
  'body_wear_helmet': { sort: 14, text: '头盔' },

  'body_shoes_color': { sort: 15, text: '' },
  'body_boots': { sort: 15, text: '靴子' },
  'body_sports': { sort: 15, text: '运动鞋' },

  'body_carry_any_bag': { sort: 16, text: '有包' },
  'body_carry_backpack': { sort: 16, text: '双肩' },
  'body_carry_handbag': { sort: 16, text: '手提' },
  'body_carry_drag': { sort: 16, text: '拉杆箱' },
  'body_carry_messengerbag': { sort: 16, text: '单肩包' },

  'body_orientation': { sort: 17, text: '朝向' },
  'body_hold_umbrella': { sort: 17, text: '打伞' },
  'body_ride_bike': { sort: 17, text: '' },

  'body_static_action_fall': { sort: 18, text: '' },
  'body_static_action_smoke': { sort: 18, text: '' },
  'body_static_action_run': { sort: 18, text: '' },
  'body_static_action_use_phone': { sort: 18, text: '' },
  'body_static_action_watch_phone': { sort: 18, text: '看手机' },

  // 机动车 20开始
  'motor_category': { sort: 20, text: '车辆类型', outer: true },
  'motor_brand': { sort: 20, text: '品牌', outer: true },
  'license_plate_color': { sort: 20, text: '', outer: true },
  'vehicle_color': { sort: 20, text: '', outer: true },

  'motor_utility_category': { sort: 21, text: '' },
  'vehicle_spray': { sort: 22, text: '车身喷字' },
  'vehicle_orientation': { sort: 22, text: '' },
  'motor_main_sunvisor': { sort: 23, text: '遮阳板' },
  'motor_main_seatbelt': { sort: 23, text: '' },
  'motor_phone': { sort: 23, text: '打电话' },
  'motor_aux_sunvisor': { sort: 24, text: '遮阳板' },
  'motor_aux_seatbelt': { sort: 24, text: '' },
  'motor_aux_seat_has_person': { sort: 24, text: '乘客' },
  'vehicle_sunroof': { sort: 25, text: '天窗' },
  'vehicle_rack': { sort: 25, text: '行李架' },
  'motor_annual_inspection': { sort: 26, text: '年检标' },
  'motor_pendant': { sort: 26, text: '摆件' },
  'motor_decoration': { sort: 26, text: '挂件' },

  // 非机动车 30开始
  'non_motor_category': { sort: 30, text: '', outer: true },
  'non_motor_orientation': { sort: 30, text: '方向', outer: true },

};

/**
 * 初始化属性，包括排序和添加 value字段 生成 map
 * @param { Array } allProperties 全量属性
 * @returns
 * @sutianbin
 */
export const initProperties = (allProperties) => {
  const propertiesMap = {};
  const detectTypeMap = {};

  allProperties = _.cloneDeep(allProperties);
  allProperties.forEach((properties) => {
    properties.data.forEach((item) => {
      // 提前设置上 value字段，用于表单绑定值使用
      item.value = null;
      if ([3, 4, 5].indexOf(item.type) > -1) {
        item.value = [];
      }

      // 添加归类标识
      const classifyItem = propertyClassifyMap[item.attrKey] || {};
      item.classifySort = classifyItem.sort || 0;
      item.classifyOuter = classifyItem.outer;
      item.classifyText = classifyItem.text;

      // 对于已经初始化过的，就不用作此判断了
      if (typeof item.extension !== 'object') {
        try {
          item.extension = item.extension && item.extension[0] === '{' && JSON.parse(item.extension);
        } catch (err) {
          console.log(err);
        }
      }
      // console.log('前端附带条件', item, item.extension);
      item.parentInfo = {
        code: properties.code,
        id: properties.id,
        name: properties.name,
        sort: properties.sort
      };
      // 这里加上父级的 code 是为了避免 attrKey 一样的时候造成覆盖，比如'license_plate_text'
      propertiesMap[`${item.attrKey}_${item.parentInfo.code}`] = item;
      // 内部选项排序处理
      if (item.data) {
        item.data.sort((a, b) => a.sort - b.sort);
        // 如果已经有全部的选项，就不用添加了
        if (item.type === 2 && item.data[0] && item.data[0].code !== '') {
          // item.data.unshift({
          //   name: '全部',
          //   code: '',
          //   sort: -1,
          // });
        }
        item.dataMap = {};
        item.data.forEach((dataItem) => {
          item.dataMap[dataItem.code] = dataItem;
        });
      }
    });
    // 属性顺序排序处理
    properties.data.sort((a, b) => a.sort - b.sort);
    detectTypeMap[properties.code] = properties;
  });

  return {
    allProperties,
    propertiesMap,
    detectTypeMap
  };
};

/**
  * @description 生成标签映射
  * @param {Array} 标签树
  * @returns  Object 标签路径映射
  */
export function CreateLabelMap(labels) {
  const map = {};
  function recursion(el, path) {
    if (el.items) {
      el.items.forEach((item) => {
        const itemPath = [...path, item.name];
        recursion(item, itemPath);
      });
    } else {
      map[el.id] = path;
    }
  }
  labels.forEach((item) => {
    recursion(item, [item.name]);
  });
  return map;
}
/**
  * @description 生成id-name映射
  * @param {Array} array id-name 对象数组
  * @param {string} id 指定属性
  * @param {string} name 指定值
  * @returns  Object id-name映射
  */
export function CreateIdMap(array, id = 'id', name = 'name') {
  const map = {};
  array.forEach((item) => {
    map[item[id]] = item[name];
  });
  return map;
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
    case 'dept':
      return 'group'; // 部门
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
      case '1':
      case '5':
      case '0':
        return '#46A653';

        // return '#8A97A0';
      case '2':
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
 * @params { category } 类型
 */
export function captureTransToAlarm(category) {
  const map = {
    '0': '1', // 人脸
    '1': '2', // 人体
    '5': '3', // 机动车
    '6': '4', // 非机动
  };
  return map[category];
}
export default {};
