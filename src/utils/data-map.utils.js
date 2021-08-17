const analysisTypeArr = {
  0: [
    {
      id: 0,
      label: '人脸+人体+机动车+非机动车',
      msg: '建议所有场景',
      val: {
        doFace: 1,
        doBody: 1,
        doMotor: 1,
        doNonMotor: 1,
      }
    },
    {
      id: 1,
      label: '人体+机动车+非机动车',
      msg: '建议治安监控场景',
      val: {
        doFace: 0,
        doBody: 1,
        doMotor: 1,
        doNonMotor: 1
      }
    },
    {
      id: 2,
      label: '机动车+非机动车',
      msg: '建议交通卡口场景',
      val: {
        doFace: 0,
        doBody: 0,
        doMotor: 1,
        doNonMotor: 1,
      }
    },
    {
      id: 3,
      label: '人脸+人体',
      msg: '建议人脸卡口场景',
      val: {
        doFace: 1,
        doBody: 1,
        doMotor: 0,
        doNonMotor: 0,
      }
    },
    {
      id: 4,
      label: '人体',
      msg: '建议治安检控场景',
      val: {
        doFace: 0,
        doBody: 1,
        doMotor: 0,
        doNonMotor: 0
      }
    },
    {
      id: 5,
      label: '人脸',
      msg: '建议人脸卡口场景',
      val: {
        doFace: 1,
        doBody: 0,
        doMotor: 0,
        doNonMotor: 0
      }
    }
  ],
  2: [ // 治安监控
    {
      id: 0,
      label: '人脸+人体+机动车+非机动车',
      msg: '建议所有场景',
      val: {
        doFace: 1,
        doBody: 1,
        doMotor: 1,
        doNonMotor: 1,
      }
    },
    {
      id: 1,
      label: '人体+机动车+非机动车',
      msg: '建议治安监控场景',
      val: {
        doFace: 0,
        doBody: 1,
        doMotor: 1,
        doNonMotor: 1
      }
    },
    // {
    //   id: 2,
    //   label: '人脸+机动车+非机动车',
    //   msg: '建议高速道路场景',
    //   val: {
    //     doFace: 1,
    //     doBody: 0,
    //     doMotor: 1,
    //     doNonMotor: 1
    //   }
    // },
    {
      id: 3,
      label: '人脸+人体+非机动车',
      msg: '建议治安监控场景',
      val: {
        doFace: 1,
        doBody: 1,
        doMotor: 0,
        doNonMotor: 1,
      }
    },
    {
      id: 4,
      label: '机动车+非机动车',
      msg: '建议交通卡口场景',
      val: {
        doFace: 0,
        doBody: 0,
        doMotor: 1,
        doNonMotor: 1,
      }
    },
    {
      id: 5,
      label: '人脸+人体',
      msg: '建议人脸卡口场景',
      val: {
        doFace: 1,
        doBody: 1,
        doMotor: 0,
        doNonMotor: 0
      }
    },
    {
      id: 6,
      label: '人体',
      msg: '建议治安监控场景',
      val: {
        doFace: 0,
        doBody: 1,
        doMotor: 0,
        doNonMotor: 0
      }
    },
    {
      id: 7,
      label: '人脸',
      msg: '建议人脸卡口场景',
      val: {
        doFace: 1,
        doBody: 0,
        doMotor: 0,
        doNonMotor: 0
      }
    }
  ],
  4: [ // 交通卡口
    // {
    //   id: 0,
    //   label: '人脸+人体+机动车+非机动车',
    //   msg: '建议所有场景',
    //   val: {
    //     doFace: 1,
    //     doBody: 1,
    //     doMotor: 1,
    //     doNonMotor: 1,
    //   }
    // },
    {
      id: 1,
      label: '人体+机动车+非机动车',
      msg: '建议治安监控场景',
      val: {
        doFace: 0,
        doBody: 1,
        doMotor: 1,
        doNonMotor: 1
      }
    },
    // {
    //   id: 2,
    //   label: '人脸+机动车+非机动车',
    //   msg: '建议高速道路场景',
    //   val: {
    //     doFace: 1,
    //     doBody: 0,
    //     doMotor: 1,
    //     doNonMotor: 1
    //   }
    // },
    // {
    //   id: 2,
    //   label: '人脸+人体+非机动车',
    //   msg: '建议治安监控场景',
    //   val: {
    //     doFace: 1,
    //     doBody: 1,
    //     doMotor: 0,
    //     doNonMotor: 1,
    //   }
    // },
    {
      id: 3,
      label: '机动车',
      msg: '建议交通卡口场景',
      val: {
        doFace: 0,
        doBody: 0,
        doMotor: 1,
        doNonMotor: 0,
      }
    },
    {
      id: 4,
      label: '机动车+非机动车',
      msg: '建议交通卡口场景',
      val: {
        doFace: 0,
        doBody: 0,
        doMotor: 1,
        doNonMotor: 1,
      }
    }
  ],
  3: [ // 微卡口
    // {
    //   id: 0,
    //   label: '人脸+人体+机动车+非机动车',
    //   msg: '建议所有场景',
    //   val: {
    //     doFace: 1,
    //     doBody: 1,
    //     doMotor: 1,
    //     doNonMotor: 1,
    //   }
    // },
    {
      id: 1,
      label: '人体+机动车+非机动车',
      msg: '建议治安监控场景',
      val: {
        doFace: 0,
        doBody: 1,
        doMotor: 1,
        doNonMotor: 1
      }
    },
    // {
    //   id: 2,
    //   label: '人脸+机动车+非机动车',
    //   msg: '建议高速道路场景',
    //   val: {
    //     doFace: 1,
    //     doBody: 0,
    //     doMotor: 1,
    //     doNonMotor: 1
    //   }
    // },
    // {
    //   id: 3,
    //   label: '人脸+人体+非机动车',
    //   msg: '建议治安监控场景',
    //   val: {
    //     doFace: 1,
    //     doBody: 1,
    //     doMotor: 0,
    //     doNonMotor: 1,
    //   }
    // },
    {
      id: 4,
      label: '机动车',
      msg: '建议交通卡口场景',
      val: {
        doFace: 0,
        doBody: 0,
        doMotor: 1,
        doNonMotor: 0,
      }
    },
    {
      id: 5,
      label: '机动车+非机动车',
      msg: '建议交通卡口场景',
      val: {
        doFace: 0,
        doBody: 0,
        doMotor: 1,
        doNonMotor: 1,
      }
    }
  ],
  5: [ // 结构化相机
    {
      id: 0,
      label: '人脸+人体+机动车+非机动车',
      msg: '建议所有场景',
      val: {
        doFace: 1,
        doBody: 1,
        doMotor: 1,
        doNonMotor: 1,
      }
    },
    {
      id: 1,
      label: '人体+机动车+非机动车',
      msg: '建议治安监控场景',
      val: {
        doFace: 0,
        doBody: 1,
        doMotor: 1,
        doNonMotor: 1
      }
    },
    // {
    //   id: 2,
    //   label: '人脸+机动车+非机动车',
    //   msg: '建议高速道路场景',
    //   val: {
    //     doFace: 1,
    //     doBody: 0,
    //     doMotor: 1,
    //     doNonMotor: 1
    //   }
    // },
    {
      id: 3,
      label: '人脸+人体+非机动车',
      msg: '建议治安监控场景',
      val: {
        doFace: 1,
        doBody: 1,
        doMotor: 0,
        doNonMotor: 1,
      }
    },
    {
      id: 4,
      label: '机动车+非机动车',
      msg: '建议交通卡口场景',
      val: {
        doFace: 0,
        doBody: 0,
        doMotor: 1,
        doNonMotor: 1,
      }
    },
    {
      id: 5,
      label: '机动车',
      msg: '建议交通卡口场景',
      val: {
        doFace: 0,
        doBody: 0,
        doMotor: 1,
        doNonMotor: 0,
      }
    },
    {
      id: 6,
      label: '人脸+人体',
      msg: '建议人脸卡口场景',
      val: {
        doFace: 1,
        doBody: 1,
        doMotor: 0,
        doNonMotor: 0
      }
    },
    {
      id: 7,
      label: '人体',
      msg: '建议治安监控场景',
      val: {
        doFace: 0,
        doBody: 1,
        doMotor: 0,
        doNonMotor: 0
      }
    },
    {
      id: 8,
      label: '人脸',
      msg: '建议人脸卡口场景',
      val: {
        doFace: 1,
        doBody: 0,
        doMotor: 0,
        doNonMotor: 0
      }
    },
  ],
  1: [ // 人脸卡口
    {
      id: 0,
      label: '人脸+人体',
      msg: '建议人脸卡口场景',
      val: {
        doFace: 1,
        doBody: 1,
        doMotor: 0,
        doNonMotor: 0
      }
    },
    {
      id: 1,
      label: '人脸',
      msg: '建议人脸卡口场景',
      val: {
        doFace: 1,
        doBody: 0,
        doMotor: 0,
        doNonMotor: 0
      }
    }
  ]
};

/* eslint-disable no-lonely-if */
export default {
  scenesTypeObj: {
    1: '人脸卡口 - 200万',
    2: '人脸卡口 - 400万',
    3: '人脸卡口 - 800万',
    4: '治安监控 - (200万至400万)',
    5: '治安监控 - (500万至800万)',
    6: '微卡口 - (200万至700万)',
    7: '微卡口 - (800万至900万)',
    8: '交通卡口 - (200万至700万)',
    9: '交通卡口 - (800万至900万) ',
    10: '人像卡口(全景图)',
    11: '视频结构化相机(400万至800万)',
  },
  realtimeTaskStatusObj: {
    1: '等待中',
    2: '正在进行',
    3: '已完成',
    4: '已暂停',
    5: '未开始',
    6: '已失败'
  },
  videoTaskStatusObj: {
    0: '等待中',
    1: '正在进行',
    2: '已完成',
    3: '已暂停'
  },
  analysisTypeArr,
  fileAnalysisTableConfig: [
    {
      prop: 'taskName',
      label: '任务名称',
      sortable: 'custom',
      minWidth: 100
    },
    {
      prop: 'progress',
      label: '进度',
      sortable: 'custom',
      width: 90
    },
    {
      prop: 'finishedNum',
      align: 'center',
      label: '完成数',
      sortable: 'custom',
      minWidth: 80
    }, {
      prop: 'failedNum',
      align: 'center',
      label: '失败数',
      sortable: 'custom',
      minWidth: 80
    }, {
      prop: 'totalMinute',
      align: 'center',
      label: '总时长(分)',
      sortable: 'custom',
      minWidth: 105
    }, {
      prop: 'speed',
      align: 'center',
      label: '倍速',
      sortable: 'custom',
      minWidth: 70
    }, {
      prop: 'createTime',
      align: 'center',
      label: '创建时间',
      minWidth: 130,
      sortable: 'custom'
    }, {
      prop: 'creatorName',
      align: 'center',
      label: '创建用户',
      sortable: 'custom',
      minWidth: 100,
    }, {
      prop: 'operate',
      align: 'center',
      label: '操作',
      width: 200
    }
  ],
  videotapeAnalysisTableConfig: [
    {
      prop: 'taskName',
      label: '任务名称',
      sortable: 'custom',
      minWidth: 100
    },
    {
      prop: 'progress',
      label: '进度',
      sortable: 'custom',
      width: 90
    },
    {
      prop: 'finishNum',
      align: 'center',
      label: '完成数',
      sortable: 'custom',
      minWidth: 80
    }, {
      prop: 'failedNum',
      align: 'center',
      label: '失败数',
      sortable: 'custom',
      minWidth: 80
    }, {
      prop: 'duration',
      align: 'center',
      label: '总时长(分)',
      sortable: 'custom',
      minWidth: 105
    }, {
      prop: 'speed',
      align: 'center',
      label: '倍速',
      sortable: 'custom',
      minWidth: 70
    }, {
      prop: 'createTime',
      align: 'center',
      label: '创建时间',
      minWidth: 130,
      sortable: 'custom'
    }, {
      prop: 'creatorName',
      align: 'center',
      label: '创建用户',
      minWidth: 100,
      sortable: 'custom'
    }, {
      prop: 'operate',
      align: 'center',
      label: '操作',
      width: 200
    }
  ],
  realtimeAnalysisTableConfig: [
    {
      prop: 'cameraName',
      label: '相机名称',
      sortable: 'custom',
      minWidth: 120
    },
    {
      prop: 'monitoringType',
      label: '卡口类型',
      align: 'center',
      sortable: 'custom',
      minWidth: 110
    },
    {
      prop: 'createTime',
      label: '创建时间',
      align: 'center',
      sortable: 'custom',
      minWidth: 135
    }, {
      prop: 'creatorName',
      label: '创建用户',
      align: 'center',
      sortable: 'custom',
      minWidth: 110
    }, {
      prop: 'analysisTime',
      label: '解析时间',
      align: 'center',
      minWidth: 110
    }, {
      prop: 'analysisType',
      label: '解析类型',
      align: 'center',
      minWidth: 130
    }, {
      prop: 'operate',
      label: '操作',
      align: 'center',
      width: 210
    }
  ]
};
/**
 * @params { category } 类型
 */
export function captureTransToAlarm(category) {
  const map = {
    '0': '1', // 人脸
    '1': '2', // 人体
    '5': '3', // 机动车
    '6': '4', // 非机动
  };
  return map[category];
}

/**
 * 相机携带的卡口类型和解析模块的卡口类型之间的映射
 */
export const monitoringTypeMap = {
  1: ['1', '2', '3', '10'], // 人脸卡口
  2: ['4', '5', '12'], // 治安监控
  3: ['6', '7'], // 微卡口
  4: ['8', '9'], // 交通卡口
  5: ['11'], // 视频结构化相机
};
