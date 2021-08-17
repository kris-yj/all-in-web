import { i18n } from '@/utils/i18n.utils';
import PersonGatherSrv from './person-gather.service';

/*
* 校验任务名称
* @param {any}
* @return
* */
const validatorTaskName = (id) => async (rule, value, callback) => {
  if (!value) {
    callback(new Error(i18n.t('{entity}不能为空', {
      entity: i18n.t('任务名称')
    })));
  } else {
    const params = {
      id,
      jobName: value
    };
    const result = await PersonGatherSrv.checkTaskName(params);
    if (result.data && result.data.exist) {
      callback(new Error(i18n.t('{entity}已存在', {
        entity: i18n.t('任务名称')
      })));
    } else {
      callback();
    }
  }
};
const validatorLength = (rule, value, callback) => {
  if (value.length < 2 || value.length > 50) {
    callback(i18n.t('请输入{from}-{to}个汉字，字母，数字', {
      from: 2,
      to: 50
    }));
  } else {
    callback();
  }
};
const rules = {
  addTask: (id) => ({
    jobName: [{
      validator: validatorLength,
      trigger: 'blur'
    }, {
      required: true,
      validator: validatorTaskName(id),
      trigger: 'blur'
    }],
    appearCount: [{
      required: true,
      message: i18n.t('请输入{entity}', {
        entity: i18n.t('出现次数')
      }),
    }, {
      pattern: /^([2-9]|[1-9][0-9]|100)$/,
      message: i18n.t('出现次数为2-100的整数'),
      trigger: ['blur', 'change']
    }],
    clusterType: [{
      required: true,
      message: i18n.t('请选择{entity}', {
        entity: i18n.t('文件类型')
      }),
    }],
    uploadFile: [{
      required: true,
      message: i18n.t('请选择或上传文件'),
    }],
    videoIds: [{
      required: true,
      message: i18n.t('请选择{entity}', {
        entity: i18n.t('视频')
      }),
    }]
  }),
};
export default rules;
