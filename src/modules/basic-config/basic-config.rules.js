import { i18n } from '@/utils/i18n.utils';

const checkLonRange = (rule, value, callback) => {
  if (value < -180 || value > 180) {
    callback(new Error(i18n.t('地图中心点经度坐标范围为-180~+180')));
  } else {
    callback();
  }
};
const checkLatRange = (rule, value, callback) => {
  if (value < -85 || value > 85) {
    callback(new Error(i18n.t('地图中心点纬度坐标范围为-85~+85')));
  } else {
    callback();
  }
};
const checkMinRange = (rule, value, callback) => {
  if (value < 1) {
    callback(new Error(i18n.t('请输入{entity}', {
      entity: i18n.t('大于0的整数')
    })));
  } else {
    callback();
  }
};
const checkMaxRange = (rule, value, callback) => {
  if (value < 1) {
    callback(new Error(i18n.t('请输入{entity}', {
      entity: i18n.t('大于0的整数')
    })));
  } else {
    callback();
  }
};
const checkLevelRange = (rule, value, callback) => {
  if (value < 1) {
    callback(new Error(i18n.t('请输入{entity}', {
      entity: i18n.t('大于0的整数')
    })));
  } else {
    callback();
  }
};
const rules = {
  logoConfig: {
    productName: {
      value: [{
        required: true,
        message: i18n.t('{entity}不能为空', {
          entity: i18n.t('系统名称')
        }),
      },
      {
        pattern: /^.{1,30}$/,
        message: i18n.t('请输入{max}个以内字符', {
          max: 30
        }),
      }],
      trigger: 'blur'
    },
    productNameDL: {
      value: [{
        required: true,
        message: i18n.t('{entity}不能为空', {
          entity: i18n.t('系统名称')
        }),
      },
      {
        pattern: /^.{1,30}$/,
        message: i18n.t('请输入{max}个以内字符', {
          max: 30
        }),
      }],
      trigger: 'blur'
    }
  },
  loginConfig: {
    expiration: {
      value: [{
        required: true,
        message: i18n.t('{entity}不能为空', {
          entity: i18n.t('登陆失效时长')
        }),
      }],
      trigger: 'blur'
    }
  },
  mapConfig: {
    mapCenterLon: {
      value: [{
        required: true,
        message: i18n.t('{entity}不能为空', {
          entity: i18n.t('地图中心点经度坐标')
        }),
      }, {
        pattern: /^(([1-9]\d+(.[0-9]{1,6})?|\d(.[0-9]{1,6})?)|([-]([1-9]\d+(.[0-9]{1,6})?|\d(.[0-9]{1,6})?)))$/,
        message: i18n.t('地图中心点经度坐标范围为-180~+180'),
      }, {
        validator: checkLonRange
      }
      ],
      trigger: 'blur'
    },
    mapCenterLat: {
      value: [{
        required: true,
        message: i18n.t('{entity}不能为空', {
          entity: i18n.t('地图中心点纬度坐标')
        }),
      }, {
        pattern: /^(([1-9]\d+(.[0-9]{1,6})?|\d(.[0-9]{1,6})?)|([-]([1-9]\d+(.[0-9]{1,6})?|\d(.[0-9]{1,6})?)))$/,
        message: i18n.t('地图中心点经度坐标范围为-85~+85'),
      }, {
        validator: checkLatRange
      }
      ],
      trigger: 'blur'
    },
    mapMin: {
      value: [{
        required: true,
        message: i18n.t('{entity}不能为空', {
          entity: i18n.t('地图最小缩放级别')
        }),
      }, {
        pattern: /^[1-9]\d*$/,
        message: i18n.t('请输入{entity}', {
          entity: i18n.t('大于0的整数')
        })
      }, {
        validator: checkMinRange
      }
      ],
      trigger: 'blur'
    },
    mapMax: {
      value: [{
        required: true,
        message: i18n.t('{entity}不能为空', {
          entity: i18n.t('地图最大缩放级别')
        })
      }, {
        pattern: /^[1-9]\d*$/,
        message: i18n.t('请输入{entity}', {
          entity: i18n.t('大于0的整数')
        })
      }, {
        validator: checkMaxRange
      }
      ],
      trigger: 'blur'
    },
    mapLevel: {
      value: [{
        required: true,
        message: i18n.t('{entity}不能为空', {
          entity: i18n.t('地图默认缩放级别')
        })
      }, {
        pattern: /^[1-9]\d*$/,
        message: i18n.t('请输入{entity}', {
          entity: i18n.t('大于0的整数')
        })
      }, {
        validator: checkLevelRange
      }
      ],
      trigger: 'blur'
    },
    mapSource: {
      value: [{
        required: true,
        message: i18n.t('{entity}不能为空', {
          entity: i18n.t('地图数据源')
        })
      }
      ],
      trigger: 'blur'
    },
    mapMergeValue: {
      value: [{
        required: true,
        message: i18n.t('{entity}不能为空', {
          entity: i18n.t('地图聚合临界值')
        })
      }, {
        pattern: /^[1-9]\d*$/,
        message: i18n.t('请输入{entity}', {
          entity: i18n.t('大于0的整数')
        })
      }]
    }
  },
};

export default rules;
