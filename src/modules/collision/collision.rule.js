import * as _ from 'lodash';
import { i18n } from '@/utils/i18n.utils';
import CollisionSrv from '@/modules/collision/collision.service';

// const validateName = () => async (rule, value, callback) => {
//   const result = await CollisionSrv.checkDupl({
//     name: value
//   });
//   if (result.code !== 0) {
//     this.$message({
//       type: 'error',
//       message: result.msg
//     });
//   }
//   if (result.data) {
//     callback('任务名称已存在');
//   }
//   callback();
// };
const validateName = () => async (rule, value, callback) => {
  if (value.trim() === '') {
    callback(new Error(i18n.t('{entity}不能为空', { entity: i18n.t('任务名称') })));
  } else {
    const result = await CollisionSrv.checkDupl({
      name: value
    });
    if (result.code !== 0) {
      this.$message({
        type: 'error',
        message: result.msg
      });
    }
    if (result.data === true) {
      callback(i18n.t('{entity}已存在', { entity: i18n.t('任务名称') }));
    }
    callback();
  }
};
const validateThreshhod = (minValue) => (rule, value, callback) => {
  const threshold = _.toNumber(value);
  const reg = /^([1-9]{1,2}|[0-9][1-9])$|^[1-9]\d{0,1}(\.\d{1,2}){0,1}$|^100(\.0{1,2}){0,1}$/;
  const valid = reg.test(value);
  if (_.isNaN(threshold)) {
    callback(i18n.t('请输入数字'));
  } else if (value < minValue || value > 100) {
    callback(i18n.t('请输入{from}-{to}之间的数字', { from: minValue, to: 100 }));
  } else if (!valid) {
    callback(i18n.t('请输入正确的格式'));
  } else {
    callback();
  }
};

const rules = {
  createTask: (minValue) => ({
    name: [{
      required: true,
      validator: validateName(),
      trigger: 'blur'
    }, {
      pattern: /^.{2,50}$/,
      message: i18n.t('请输入{from}-{to}个汉字，字母，数字', {
        from: 2,
        to: 50
      }),
      trigger: ['blur', 'change']
    }],
    threshold: [{
      required: true,
      message: i18n.t('{entity}不能为空', {
        entity: i18n.t('比对阈值')
      }),
      trigger: 'blur'
    },
    {
      validator: validateThreshhod(minValue),
      trigger: 'blur'
    }],
    albumId1: [{
      required: true,
      message: i18n.t('{entity}不能为空', {
        entity: i18n.t('底库')
      }),
    }],
    albumId2: [{
      required: true,
      message: i18n.t('{entity}不能为空', {
        entity: i18n.t('底库')
      }),
    }]
  })
};
export default rules;
