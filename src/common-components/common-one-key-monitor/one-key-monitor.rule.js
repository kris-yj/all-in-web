import { i18n } from '@/utils/i18n.utils';
import SurveillanceTaskSvr from './one-key-monitor.service';

const validateName = (id) => async (rule, value, callback) => {
  if (!value) {
    callback(new Error(i18n.t('任务名称不能为空')));
  } else {
    if (!(/^[\u4e00-\u9fa5_a-zA-Z0-9]{2,50}$/.test(value))) {
      callback(new Error(i18n.t('请输入{from}-{to}位汉字、数字、字母', { from: 2, to: 50 })));
      return;
    }
    const result = await SurveillanceTaskSvr.checkSurveillanceTaskName({
      id: id || '',
      name: value
    });
    if (result.data.isRepeat !== 0) {
      callback(new Error(result.data.info));
    } else {
      callback();
    }
  }
};

const validateDetectThreshold = (data)=> (rule, value, callback) => { // eslint-disable-line
  if (!value) {
    return callback(new Error(i18n.t('布控阈值不能为空')));
  }
  if (`${Number(value)}` === 'NaN') {
    callback(new Error(i18n.t('请输入{entity}', {
      entity: i18n.t('数字值')
    })));
  } else if (value <= 0 || value >= 100) {
    callback(new Error(i18n.t('请输入0-100之间的数字')));
  } else {
    callback();
  }
};
const rules = {
  surveillanceTask: (data) => ({
    strategyName: [{
      validator: validateName(data.id),
      trigger: 'blur',
      required: true
    }],
    startTime: [{
      required: true,
      message: i18n.t('请选择{entity}', { entity: i18n.t('有效时间') }),
      trigger: 'change'
    }],
    cameraIds: [{
      type: 'array',
      required: true,
      message: i18n.t('请选择{entity}', { entity: i18n.t('相机') }),
      trigger: 'change'
    }],
    strategyTimeList: [{
      type: 'array',
      required: true,
      message: i18n.t('请选择{entity}', { entity: i18n.t('相机') }),
      trigger: 'change'
    }],
    termType: [{
      required: true,
      message: i18n.t('请选择{entity}', { entity: i18n.t('布控时效') }),
      trigger: 'change'
    }],
    threshold: [{
      validator: validateDetectThreshold(data),
      trigger: 'blur',
      required: true
    }],

  }),
};

export default rules;
