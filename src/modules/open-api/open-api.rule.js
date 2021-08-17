import _ from 'lodash';
import { i18n } from '@/utils/i18n.utils';

const validateVendorIp = async (rule, value, callback) => {
  if (!value) {
    callback();
    return;
  }
  const arr = value.split(';');
  let type = true;
  _.forEach(arr, (item) => {
    _.forEach(item.split('-'), (val) => {
      if (!(/^((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))|([\da-fA-F]{1,4}:){7}([\da-fA-F]{1,4})$/.test(val)) && val) {
        type = false;
      }
    });
  });
  if (!type) {
    callback(new Error(i18n.t('IP地址不合法')));
  } else {
    callback();
  }
};
const validateVendorHour = async (rule, value, callback) => {
  console.log(rule, value);
  if (!value) {
    callback(new Error(i18n.t('有效时段不能为空')));
  } else if (!(/^([0-9]|[1][0-9]|[2][0123])-([0-9]|[1][0-9]|[2][0123])$/.test(value))) {
    callback(new Error(i18n.t('有效时段不合法')));
  } else {
    callback();
  }
};

const validateVendorNumber = async (rule, value, callback) => {
  console.log(rule, value);
  if (!(/^\d+$/.test(value))) {
    callback(new Error(i18n.t('请输入大于0的数字')));
  } else {
    callback();
  }
};
const rules = {
  topicRules: {
    queueName: [
      {
        required: true,
        message: i18n.t('调用方名称不能为空'),
        trigger: 'blur'
      }
    ]
  },
  identityAuth: {
    userToken: [{
      required: true,
      message: i18n.t('调用方秘钥不能为空'),
      trigger: 'blur',
    }
    ],
    vendorName: [
      {
        required: true,
        message: i18n.t('调用方名称不能为空'),
        trigger: 'blur'
      }
    ],
    hourPairs: [{
      trigger: 'blur',
      validator: validateVendorHour
    }],
    accessLimitNumber: [{
      required: true,
      message: i18n.t('流量限制不能为空'),
      trigger: 'blur',
    },
    {
      trigger: 'blur',
      validator: () => { }
    }],
    ipList: [
      {
        required: true,
        message: i18n.t('IP地址不能为空'),
        trigger: 'blur'
      }, {
        trigger: 'blur',
        validator: validateVendorIp
      }],
    ACCESS_DAY_LIMIT: [{
      required: true,
      message: i18n.t('每日最大访问限制不能为空'),
      trigger: 'blur'
    }, {
      trigger: 'blur',
      validator: validateVendorNumber
    }],
    ACCESS_SEC_LIMIT: [{
      required: true,
      message: i18n.t('每日最大流量限制不能为空'),
      trigger: 'blur'
    },
    {
      trigger: 'blur',
      validator: validateVendorNumber
    }]
  }
};
export default rules;
