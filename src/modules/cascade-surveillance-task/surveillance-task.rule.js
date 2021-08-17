import { i18n } from '@/utils/i18n.utils';
import SurveillanceTaskSvr from '@/modules/surveillance-task/surveillance-task.service';

const validateName = (data) => async (rule, value, callback) => {
  if (!value) {
    callback(new Error(i18n.t('任务名称不能为空')));
  } else {
    if (!(/^.{2,50}$/.test(value))) {
      callback(new Error(i18n.t('请输入{from}-{to}位汉字、数字、字母', { from: 2, to: 50 })));
      return;
    }
    console.log(data.mode);
    const result = await SurveillanceTaskSvr.checkSurveillanceTaskName({
      id: data.mode === 'edit' ? data.id : '',
      name: value
    });
    if (result.data.isRepeat !== 0) {
      callback(new Error(result.data.info));
    } else {
      callback();
    }
  }
};
const validateTypeName = async (rule, value, callback) => {
  console.log(value);
  console.log(rule);
  if (!value) {
    callback(new Error(i18n.t('任务名称不能为空')));
  } else {
    if (!(/^.{2,50}$/.test(value))) {
      callback(new Error(i18n.t('请输入{from}-{to}位汉字、数字、字母', { from: 2, to: 50 })));
      return;
    }
    const result = await SurveillanceTaskSvr.deployTypeNameCheck({
      name: value
    });
    if (result.code !== 0) {
      callback(new Error(result.msg));
    } else {
      callback();
    }
  }
};

const rules = {
  surveillanceTask: (data) => ({
    strategyName: [{
      validator: validateName(data),
      trigger: 'blur',
      required: true
    }],
    startTime: [{
      required: true,
      message: i18n.t('请选择{entity}', { entity: i18n.t('有效时间') }),
      trigger: 'change'
    }],
    cascadeIds: [{
      type: 'array',
      required: true,
      message: i18n.t('请选择{entity}', { entity: i18n.t('下发单位') }),
      trigger: 'change'
    }],
    strategyTimeList: [{
      type: 'array',
      required: true,
      message: i18n.t('请选择{entity}', { entity: i18n.t('相机') }),
      trigger: 'change'
    }],
    albumList: [{
      type: 'array',
      required: true,
      message: i18n.t('请选择{entity}', { entity: i18n.t('底库') }),
      trigger: 'change'
    }],
    invadeTypes: [{
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

  }),
  createType: {
    ruleName: [
      {
        validator: validateTypeName,
        trigger: 'blur',
        required: true
      }
    ],
    ruleInfo: [
      {
        required: true,
        message: i18n.t('请选择{entity}', { entity: i18n.t('') }),
        trigger: 'change'
      },
    ]
  }
};

export default rules;
