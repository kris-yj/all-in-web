const editTaskRules = {
  cameraType: [
    { required: true }
  ]
  // analysisType: [{ required: true, message: '请选择解析类型', trigger: 'change' }],
  // scheduleType: [{ required: true, message: '请选择解析规则', trigger: 'change' }],
  // time: [{ required: true, message: '请选择日期', trigger: 'change' }],
  // includeDays: [{ required: true, message: '请选择循环范围', trigger: 'change' }],
  // startHour: [{ required: true, message: '请选择起始小时数', trigger: 'change' }],
  // endHour: [{ required: true, message: '请选择结束小时数', trigger: 'change' }],
};
const addTaskRules = {
  cameraType: [
    { required: true }
  ]
};

export {
  addTaskRules,
  editTaskRules
};
