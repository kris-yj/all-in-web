<template>
  <meg-dialog
    :visible="true"
    width="1044px"
    @close="closeDialog"
    :append-to-body="appendToBody"
    :modal-append-to-body="appendToBody"
    :title="$t('新建一键布控')">
    <div class="form-box">
      <div class="image-box">
        <meg-img-container
          :img-src="photoUrl">
        </meg-img-container>
      </div>
      <meg-form
        ref="formLeft"
        :model="taskData"
        class="left-form"
        :rules="rules"
        label-position="right"
        label-width="83px">
        <meg-form-item
          :label="$t('任务名称')"
          class="spec-box"
          prop="strategyName">
          <meg-input
            :autofocus="true"
            v-model="taskData.strategyName"
            :placeholder="$t('请输入{entity}', { entity:$t('任务名称') })"></meg-input>
        </meg-form-item>
        <meg-form-item
          class="spec-box"
          :label="$t('布控阈值')"
          prop="threshold">
          <meg-input
            v-model="taskData.threshold"
            :placeholder="$t('请输入{entity}', { entity:$t('布控阈值') })"></meg-input>
        </meg-form-item>
        <meg-form-item
          :label="$t('选择相机')"
          class="spec-box"
          prop="cameraIds">
          <common-camera-selector
            map-icon-position="right"
            :default-ids="taskData.cameraIds"
            @change="onCameraChange"></common-camera-selector>
        </meg-form-item>

        <meg-form-item
          :label="$t('布控时效')"
          prop="termType">
          <meg-radio
            v-for="(category, index) in deployAging"
            v-model="taskData.termType"
            :key="index"
            :label="Number(category.code)">
            {{ category.value }}
          </meg-radio>
        </meg-form-item>
        <meg-form-item
          :label="$t('有效时间')"
          class="time-box spec-box"
          v-if="taskData.termType === 0"
          prop="startTime">
          <meg-date-picker
            class="width-all"
            value-format="timestamp"
            type="daterange"
            format="yyyy-MM-dd"
            v-model="timeTag"
            @change="getDateValue"
            :picker-options="pickerOptions">
          </meg-date-picker>
        </meg-form-item>
        <meg-form-item
          :label="$t('布控状态')"
          prop="valid">
          <meg-switch
            v-model="taskData.status"
            :active-value="0"
            :inactive-value="1">
          </meg-switch>
        </meg-form-item>
      </meg-form>
      <meg-form
        ref="formRight"
        :rules="rules"
        :model="taskData"
        label-position="right"
        class="right-form"
        label-width="83px">
        <meg-form-item
          :label="$t('报警接收')"
          prop="otherReceiver">
          <span class="label-box">{{ $t('本人接收') }}</span>
          <meg-checkbox v-model="taskData.otherReceiver">
            {{ $t('添加其他接收人') }}
          </meg-checkbox>
        </meg-form-item>
        <template v-if="taskData.otherReceiver">
          <meg-form-item
            class="spec-box"
            :label="$t('接收部门')">
            <meg-treeselect
              ref="deptTree"
              :data="deptTree"
              :standard-tree-data="true"
              :show-count="false"
              :show-all-checked="true"
              :check-strictly="true"
              :brief-selected-info="true"
              :all-selected-text="$t('全部部门')"
              :placeholder-text="$t('请选择接收的部门')"
              :search-placeholder="$t('输入部门名称进行搜索')"
              :props="deptTreeProps"
              :show-checkbox="true"
              @check-change="deptUpdate">
            </meg-treeselect>
          </meg-form-item>
          <meg-form-item
            class="spec-box"
            :label="$t('接收人员')">
            <meg-treeselect
              ref="personTree"
              :data="personTree"
              :standard-tree-data="true"
              :show-count="false"
              :brief-selected-info="true"
              :all-selected-text="$t('全部人员')"
              :placeholder-text="$t('请选择接收的人员')"
              :search-placeholder="$t('输入人员名称进行搜索')"
              :props="areaTreeProps"
              :show-checkbox="true"
              @check-change="personUpdate">
            </meg-treeselect>
          </meg-form-item>
        </template>

        <meg-form-item
          prop="strategyTimeList"
          :label="$t('布控时间')">
          <time-multi-selector
            :default-select="timeArr"
            @time-select-change="onTimeSelectChange"></time-multi-selector>
          <div class="tips">
            {{ $t('可分时段布控,最多可设置5个时间段') }}
          </div>
        </meg-form-item>
      </meg-form>
    </div>
    <template v-slot:footer>
      <meg-button
        type="primary"
        :loading="isSaving"
        @click="save">
        {{ $t('开始布控') }}
      </meg-button>
      <meg-button
        :disabled="isSaving"
        @click="closeDialog">
        {{ $t('取消') }}
      </meg-button>
    </template>
  </meg-dialog>
</template>

<script>
import moment from 'moment';
import CommonCameraSelector from '@/common-components/common-camera-selector';
import TimeMultiSelector from './time-multi-selector/time-multi-selector.vue';
import oneKeyMonitorSrv from './one-key-monitor.service';
import rules from './one-key-monitor.rule';

export default {
  name: 'OneKeyMonitor',
  components: {
    CommonCameraSelector,
    TimeMultiSelector
  },
  props: {
    photoUrl: {
      type: String,
      default: '',
    },
    photoType: {
      type: [String, Number],
      default: '',
    },
    appendToBody: {
      type: Boolean,
      default: true
    },
  },
  data() {
    return {
      isSaving: false,
      deptTree: [],
      rules: {},
      taskData: {
        strategyTypeId: 109,
        strategyName: '',
        threshold: '',
        cameraIds: [],
        endTime: '',
        startTime: '',
        status: 0,
        termType: 0,
        otherReceiver: false,
        strategyTimeList: [
        ],
      },
      areaTreeProps: {
        children: 'subOrgs',
        label: 'name'
      },
      deptTreeProps: {
        children: 'subOrgs',
        label: 'orgName'
      },
      personTree: [],
      lvOptions: this.$store.getters.dataMapByType('realtime_level'), // 报警级别
      defaultDate: [new Date(moment()).getTime(), new Date(moment().add(6, 'days')).getTime()],
      timeTag: [],
      deployAging: [],
      timeArr: [],
      pickerOptions: {
        shortcuts: ['today', 'nextThreeDays', 'theNextWeek', 'theNextMonth']
      },
    };
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {
    this.init();
    const thresholdTransfer = [
      'kunlun_alarm_deployment_recommend_threshold',
      'kunlun_body_identify_threshold',
      'kunlun_motor_identify_threshold',
      'kunlun_non_motor_identify_threshold',
    ];
    const type = thresholdTransfer[Number(this.photoType) - 1];
    if (type) this.taskData.threshold = this.$store.getters.systemByType(type).value;
  },
  methods: {
    init() {
      this.timeTag = this.defaultDate;
      this.deployAging = this.$store.getters.dataMapByType('deploy_aging');
      this.rules = rules.surveillanceTask(this.taskData);
      [this.taskData.startTime, this.taskData.endTime] = this.defaultDate;
      this.getDeptTree();
      this.getPersonTree();
    },
    getDeptTree() {
      oneKeyMonitorSrv.getDeptTree().then((res) => {
        if (res.code === 0) {
          this.deptTree = [res.data];
        }
      });
    },
    getPersonTree() {
      oneKeyMonitorSrv.getPersonTree().then((res) => {
        if (res.code === 0) {
          this.personTree = [res.data];
        }
      });
    },
    /**
     * @description 关闭弹窗
     */
    closeDialog() {
      this.$emit('close');
    },
    save() {
      this.$refs.formLeft.validate((left) => {
        if (left) {
          this.$refs.formRight.validate((right) => {
            if (right) {
              this.isSaving = true;
              this.taskData.startTime = new Date(new Date(this.taskData.startTime).toLocaleDateString()).getTime(); // 0时0分0秒;
              this.taskData.endTime = new Date(new Date(this.taskData.endTime).toLocaleDateString()).getTime() + 86400000 - 1;
              const params = {
                ...this.taskData,
                photoType: this.photoType,
                photoData: this.photoUrl,
                alarmType: 0,
                strategyTypeId: this.photoType,
                isUrl: ((/\/storage/).test(this.photoUrl) || (/\/core/).test(this.photoUrl) || (/http/).test(this.photoUrl)),
              };

              oneKeyMonitorSrv.deploy(params).then((res) => {
                this.isSaving = false;
                if (res.code === 0) {
                  this.$message.success(this.$t('布控成功'));
                  this.$emit('close');
                } else {
                  this.$message.error(res.msg);
                }
              });
            }
          });
        }
      });
    },
    onTimeSelectChange(timeArr) {
      console.log(timeArr);
      this.taskData.strategyTimeList = timeArr;
    },
    /**
     * @description 处理外部时间数据转换成内部的
     * @param {array} origin
     * @returns {array}
     */
    handleStampToOrigin(origin) {
      return origin.map((val) => {
        val.startMinute = new Date(val.startMinute + moment().startOf('day').toDate().getTime());
        val.endMinute = new Date(val.endMinute + moment().startOf('day').toDate().getTime());
        return val;
      });
    },
    /**
     * @description 获得时间
     * @param {any}
     * @returns
     */
    getDateValue(dateArr) {
      if (dateArr) {
        [this.taskData.startTime, this.taskData.endTime] = dateArr;
      } else {
        this.taskData.startTime = '';
        this.taskData.endTime = '';
      }
    },
    /**
     * @description 相机选择发生变化时
     * @param {array} ids 选择的id
     */
    onCameraChange(ids) {
      this.taskData.cameraIds = ids;
    },
    /**
     * @description 部门选择变化时
     */
    deptUpdate() {
      this.taskData.receiverDeptList = this.$refs.deptTree.getCheckedKeys();
    },
    /**
     * @description 接收人员选择变化时
     */
    personUpdate() {
      this.taskData.receiverList = this.$refs.personTree.getCheckedKeys((val) => val.flag === 'user');
    },
  },
};
</script>
<style lang="scss" scoped>
.form-box {
  display: flex;
  justify-content: space-between;
  height: 426px;
  .image-box{
    width: 156px;
    height: 156px;
  }
  .spec-box {
    box-sizing: border-box;
    padding-right: 39px;
  }
  .left-form {
    width: 397px;
    overflow: auto;
    box-sizing: border-box;
    .time-box {
      ::v-deep.meg-form-item__content {
        height: 34px;
      }
    }
    .meg-select {
      width: 100%;
    }
  }
  .right-form {
    height: 100%;
    overflow: auto;
    width: 393px;
    box-sizing: border-box;
    .tips {
      font-size: 14px;
      color: rgba(67, 80, 104, 0.5);
    }
    // padding-right: 30px;
  }
  .label-box {
    margin-right: 30px;
  }
}
</style>
