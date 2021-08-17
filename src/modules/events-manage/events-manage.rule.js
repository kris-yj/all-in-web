const rules = {
  createRules: () => ({
    eventName: [
      {
        required: true,
        trigger: 'change',
        message: '请输入事件名称'
      },
      {
        min: 2,
        max: 50,
        message: '请输入2-50个字符', // '请输入2-50个字符',
        trigger: 'change',
      },
      {
        pattern: /^(?:[^'“”!@#$%^&*`~！＠＃＄％＾＆＊￥……<>/,，]+)$/,
        message: '不能包含特殊字符',
        trigger: 'change'
      },
    ],
    eventDesc: [
      {
        pattern: /^(?:[^<>]+)$/,
        message: '不能包含特殊字符',
        trigger: 'change'
      },
      {
        min: 0,
        max: 80,
        message: '请输入0-80个字符', // '请输入0-80个字符',
        trigger: 'change',
      },
    ],
    eventPlace: [
      {
        min: 0,
        max: 50,
        message: '请输入0-50个字符', // '请输入0-50个字符',
        trigger: 'change',
      },
    ]
  }),
};
export default rules;
