import { i18n } from '@/utils/i18n.utils';

const validateDate = (rule, value, callback) => {
  if (value && value[0] && value[1]) {
    callback();
  } else {
    callback(new Error(i18n.t('请选择日期')));
  }
};

const rules = {
  dateValue: [
    { required: true, validator: validateDate, trigger: 'change', },
  ]
};

export default rules;
