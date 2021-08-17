import { i18n } from '@/utils/i18n.utils';
import JudgeAfterSrv from './judge-after.service';

/**
 * 检验战法标签名是否重复
 * @param {*} id
 */
const validatorTechnicalName = (id) => async (rule, value, callback) => {
  if (!value || value.trim() === '') {
    callback(new Error(i18n.t('{entity}不能为空', {
      entity: i18n.t('战法标签')
    })));
  } else {
    const params = {
      id,
      technicalName: value.trim()
    };
    const result = await JudgeAfterSrv.checkTechniqueName(params);

    if (result.data && result.data.nameRepeat === 1) {
      callback(new Error(i18n.t('{entity}已存在', {
        entity: i18n.t('战法标签')
      })));
    } else {
      callback();
    }
  }
};

const rules = {
  createRules: (id) => ({
    // 战法标签名的校验
    technicalName: [
      {
        pattern: /^.{1,50}$/,
        message: i18n.t('请输入{from}-{to}个汉字，字母，数字', {
          from: 1,
          to: 50
        }),
      },
      {
        required: true,
        trigger: 'blur',
        validator: validatorTechnicalName(id),
      }
    ],
    // 战法备注
    technicalNote: [
      {
        pattern: /^.{0,80}$/,
        message: i18n.t('请输入{from}-{to}个字符', {
          from: 0,
          to: 80
        }),
        trigger: ['blur', 'change']
      }
    ]
  })
};

export default rules;
