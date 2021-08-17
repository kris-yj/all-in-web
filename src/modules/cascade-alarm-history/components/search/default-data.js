import { i18n } from '@/utils/i18n.utils';

const defaultSearchData = {
  itemsOne: [{
    attrKey: 'name', // 非必须
    name: i18n.t('姓名'), // 必须 用于显示 label
    type: 0, // 必须 用于判断表单类型 ，暂时只支持基础表单类型   0-input(如车牌) 1-radio 2-select单选 3-mutiselect多选数组 4-mutitreeselct树形多选数组(还未实现) 5-checkBox 复选组数组 6-车辆品牌
    value: '', // 必须 多选 初始化绑定[] ，其它类型初始化绑定 null 或 ''
  },
  {
    attrKey: 'identityType',
    name: i18n.t('证件类型'),
    type: 2,
    value: null,
    data: [],
    dataMap: {},
  },
  {
    attrKey: 'identityCard', // 非必须
    name: i18n.t('证件号'), // 必须 用于显示 label
    type: 0, // 必须 用于判断表单类型 ，暂时只支持基础表单类型   0-input(如车牌) 1-radio 2-select单选 3-mutiselect多选数组 4-mutitreeselct树形多选数组(还未实现) 5-checkBox 复选组数组 6-车辆品牌
    value: '', // 必须 多选 初始化绑定[] ，其它类型初始化绑定 null 或 ''
  },
  ],
  itemsTwo: [

    {
      attrKey: 'gender',
      name: i18n.t('性别'),
      type: 2,
      value: null,
      data: [],
      dataMap: {},
    },
    {
      attrKey: 'ageLevel',
      name: i18n.t('年龄'),
      type: 2,
      value: null,
      data: [],
      dataMap: {},
    },
    {
      attrKey: 'address', // 非必须
      name: i18n.t('籍贯'), // 必须 用于显示 label
      type: 0, // 必须 用于判断表单类型 ，暂时只支持基础表单类型   0-input(如车牌) 1-radio 2-select单选 3-mutiselect多选数组 4-mutitreeselct树形多选数组(还未实现) 5-checkBox 复选组数组 6-车辆品牌
      value: '', // 必须 多选 初始化绑定[] ，其它类型初始化绑定 null 或 ''
    },
    {
      attrKey: 'cmnt', // 非必须
      name: i18n.t('备注'), // 必须 用于显示 label
      type: 0, // 必须 用于判断表单类型 ，暂时只支持基础表单类型   0-input(如车牌) 1-radio 2-select单选 3-mutiselect多选数组 4-mutitreeselct树形多选数组(还未实现) 5-checkBox 复选组数组 6-车辆品牌
      value: '', // 必须 多选 初始化绑定[] ，其它类型初始化绑定 null 或 ''
    },
  ],
};

export default defaultSearchData;
