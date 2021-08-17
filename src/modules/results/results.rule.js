import { i18n } from '@/utils/i18n.utils';

const rules = {
  archiveName: [{
    required: true,
    message: i18n.t('{entity}不能为空', {
      entity: i18n.t('战果名称')
    }),
    trigger: 'blur'
  }, {
    pattern: /^.{2,100}$/,
    message: i18n.t('请输入{from}-{to}位汉字、数字、字母', {
      from: 2,
      to: 100
    }),
    trigger: ['blur', 'change']
  }],
  archiveTime: [{
    type: 'date',
    required: true,
    message: i18n.t('{entity}不能为空', {
      entity: i18n.t('填报时间')
    }),
    trigger: 'blur'
  }],
  archiveOrgName: [{
    required: true,
    message: i18n.t('{entity}不能为空', {
      entity: i18n.t('部门')
    }),
    trigger: 'blur'
  }],
  archiveSource: [{
    required: true,
    message: i18n.t('{entity}不能为空', {
      entity: i18n.t('战果来源')
    }),
    trigger: 'blur'
  }],
  clueCount: [{
    required: true,
    message: i18n.t('{entity}不能为空', {
      entity: i18n.t('有效线索数')
    }),
    trigger: ['blur', 'change']
  },
  {
    pattern: /^[0-9]{1,4}$/,
    message: i18n.t('请输入4位之内的纯数字'),
    trigger: ['blur', 'change']
  }
  ],
  catchCount: [{
    required: true,
    message: i18n.t('{entity}不能为空', {
      entity: i18n.t('抓获人数')
    }),
    trigger: ['blur', 'change']
  },
  {
    pattern: /^[0-9]{1,4}$/,
    message: i18n.t('请输入4位之内的纯数字'),
    trigger: ['blur', 'change']
  }
  ],
};

export default rules;
