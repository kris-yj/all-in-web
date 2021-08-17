import { i18n } from '@/utils/i18n.utils';

function createRules() {
  return {
    alarmRecord: {
      policeName: [
        { required: true, message: i18n.t('请输入出警人姓名'), trigger: 'blur' }
      ],
      policeTime: [
        { required: true, message: i18n.t('请选择出警时间'), trigger: 'change' }
      ],
      right: [
        { required: true, message: i18n.t('请选择警情真假'), trigger: 'change' }
      ],
      grabCount: [
        {
          pattern: /^(([1-9]\d{0,3})|0)$/, message: i18n.t('请输入{from}~{to}之间的整数', { from: 0, to: 9999 }), trigger: 'blur'
        }
      ],
      resultStatus: [
        { required: true, message: i18n.t('请选择处理结果'), trigger: 'change' }
      ],
      reportContent: [
        { required: true, message: i18n.t('请填写报告内容'), trigger: 'blur' }
      ],
    }
  };
}
export default createRules;
