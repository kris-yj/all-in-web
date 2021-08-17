<template>
  <meg-dialog
    :visible="true"
    :title="title"
    width="928px"
    @close="closeDialog">
    <div class="form-box">
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
          :label="$t('布控类型')"
          prop="strategyTypeId">
          <meg-select
            @change="onDeployTypeChange"
            :disabled="mode === 'edit'"
            v-model="taskData.strategyTypeId">
            <meg-option
              v-for="item in deployList"
              :key="item.id"
              :value="item.id"
              :label="item.ruleName"></meg-option>
            <template v-slot:extra>
              <div
                @click="openCreateType"
                v-if="taskData.alarmType === 1"
                class="extra-item">
                <meg-icon name="plus"></meg-icon>
                {{ $t('新增布控类型') }}
              </div>
            </template>
          </meg-select>
        </meg-form-item>
        <meg-form-item
          class="spec-box"
          v-if="taskData.alarmType === 1 && taskData.strategyTypeId !== '9' && taskData.strategyTypeId !== '12'"
          :label="$t('布控阈值')"
          prop="detectThreshold">
          <meg-input-number
            :placeholder="$t('请输入{entity}', { entity:$t('布控阈值') })"
            v-model="taskData.detectThreshold"
            :controls="false"
            :precision="2"
            :min="0"
            :step="0.01"
            :max="1"></meg-input-number>
        </meg-form-item>
        <meg-form-item
          v-if="taskData.strategyTypeId === '12'"
          :label="$t('选择目标')"
          prop="invadeTypes">
          <meg-checkbox-group v-model="taskData.invadeTypes">
            <meg-checkbox
              :label="1">
              {{ $t('人体') }}
            </meg-checkbox>
            <meg-checkbox
              :label="5">
              {{ $t('机动车') }}
            </meg-checkbox>
            <meg-checkbox
              :label="6">
              {{ $t('非机动车') }}
            </meg-checkbox>
          </meg-checkbox-group>
        </meg-form-item>
        <meg-form-item
          class="spec-box"
          :label="$t('选择相机')"
          prop="cameraIds">
          <common-camera-selector
            ref="cameraSelector"
            map-icon-position="right"
            :default-ids="taskData.cameraIds"
            @change="onCameraChange"></common-camera-selector>
        </meg-form-item>
        <meg-form-item
          class="is-required"
          v-if="taskData.alarmType === 1"
          :label="$t('报警级别')"
          prop="level">
          <meg-radio-group
            class="lv-radio-group"
            v-model="taskData.level">
            <div
              v-for="type in lvOptions"
              :key="type.code"
              class="lv-radio-item">
              <meg-radio-button
                :class="[
                  'lv-' + type.code
                ]"
                :label="Number(type.code)">
                {{ type.value }}
              </meg-radio-button>
            </div>
          </meg-radio-group>
        </meg-form-item>
        <template v-if="taskData.alarmType === 0">
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
        </template>
      </meg-form>
      <meg-form
        ref="formRight"
        :rules="rules"
        :model="taskData"
        label-position="right"
        class="right-form"
        label-width="83px">
        <template v-if="taskData.alarmType === 1">
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
        </template>

        <meg-form-item
          :label="$t('报警接收')"
          prop="otherReceiver">
          <span class="label-box">{{ $t('本人接收') }}</span>
          <meg-checkbox
            @change="onOtherReceiverChange"
            v-model="taskData.otherReceiver">
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
              :check-strictly="true"
              :show-count="false"
              :brief-selected-info="true"
              :show-all-checked="true"
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
              :show-dept-icon="true"
              :pretreatment-node-data-fn="pretreatPersonTree"
              :all-selected-text="$t('全部人员')"
              :placeholder-text="$t('请选择接收的人员')"
              :search-placeholder="$t('输入人员名称进行搜索')"
              :props="personTreeProps"
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
        <template v-if="taskData.alarmType === 0">
          <meg-form-item
            class="spec-box-album"
            prop="albumList"
            :label="$t('底库')">
            <meg-treeselect
              ref="albumList"
              :data="albumTreeList"
              :standard-tree-data="true"
              :show-count="false"
              :brief-selected-info="true"
              :all-selected-text="$t('全部底库')"
              :placeholder-text="$t('请选择底库')"
              :search-placeholder="$t('输入底库名称进行搜索')"
              :props="areaTreeProps"
              :show-checkbox="true"
              @check-change="albumUpdate">
            </meg-treeselect>
          </meg-form-item>
          <meg-form-item
            label="">
            <album-list
              :list="taskData.albumList"
              @data-change="onDataChange"></album-list>
          </meg-form-item>
        </template>
      </meg-form>
    </div>

    <template v-slot:footer>
      <meg-button
        type="primary"
        :loading="isSaving"
        @click="save">
        {{ confirmButton }}
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
import CommonCameraSelector from '@/common-components/common-camera-selector';
import moment from 'moment';
import TimeMultiSelector from './time-multi-selector/time-multi-selector.vue';
import AlbumList from './album-list';
import rules from '../surveillance-task.rule';

export default {
  name: 'ManageTask',
  components: {
    CommonCameraSelector,
    TimeMultiSelector,
    AlbumList,
  },
  props: {
    mode: {
      type: String,
      default: 'create', // create 创建 copy 复制 edit 编辑
    },
    isSaving: {
      type: Boolean,
      default: false,
    },
    // 布控类型列表
    deployTypeList: {
      type: Array,
      default: () => []
    },
    // 布控时效类型
    deployAging: {
      type: Array,
      default: () => []
    },
    // 部门树数据
    deptTree: {
      type: Array,
      default: () => []
    },
    // 人员树数据
    personTree: {
      type: Array,
      default: () => []
    },
    // 获取底库列表的方法
    getAlbum: {
      type: Function,
      default: () => {}
    },
    // 相关信息
    defaultData: {
      type: Object,
      default: () => {}
    },

  },
  data() {
    return {

      rules: {},
      taskData: {
        strategyTypeId: '1',
        strategyName: '',
        detectThreshold: 0.00,
        invadeTypes: [],
        cameraIds: [],
        endTime: '',
        startTime: '',
        alarmType: 1, // 0 识别 1 检测
        status: 0,
        termType: 1,
        level: 1,
        albumList: [],
        otherReceiver: false,
        strategyTimeList: [
        ],
      },
      lvOptions: this.$store.getters.dataMapByType('realtime_level'), // 报警级别
      defaultDate: [new Date(moment()).getTime(), new Date(moment().add(6, 'days')).getTime()],
      areaTreeProps: {
        children: 'items',
        label: 'name'
      },
      deptTreeProps: {
        children: 'subOrgs',
        label: 'orgName'
      },
      personTreeProps: {
        children: 'subOrgs',
        label: 'name'
      },
      areaName: [],
      timeTag: [],
      timeArr: [],
      pickerOptions: {
        shortcuts: ['today', 'nextThreeDays', 'theNextWeek', 'theNextMonth']
      },
      albumTreeList: [],
      showThresholdMap: {
        '1': this.$store.getters.systemByType('kunlun_alarm_deployment_recommend_threshold').value,
        '2': this.$store.getters.systemByType('kunlun_body_identify_threshold').value,
        '3': this.$store.getters.systemByType('kunlun_motor_identify_threshold').value,
        '4': this.$store.getters.systemByType('kunlun_non_motor_identify_threshold').value,
      }
    };
  },
  computed: {
    title() {
      const map = {
        0: this.$t('新建识别布控'),
        1: this.$t('新建检测布控'),
      };
      const titleMap = {
        'create': map[this.taskData.alarmType],
        'copy': this.$t('复制任务'),
        'edit': this.$t('编辑任务'),
      };
      return titleMap[this.mode];
    },
    confirmButton() {
      const loading = {
        'create': this.$t('布控中'),
        'copy': this.$t('布控中'),
        'edit': this.$t('保存中'),
      };
      const map = {
        'create': this.$t('开始布控'),
        'copy': this.$t('开始布控'),
        'edit': this.$t('保存'),
      };
      return this.isSaving ? loading[this.mode] : map[this.mode];
    },
    deployList() {
      return this.deployTypeList.filter((value) => value.ruleType === Number(this.taskData.alarmType));
    }
  },
  watch: {

  },
  created() {
    this.init();
  },
  mounted() {
  },
  methods: {
    /**
     * @description 初始化
     */
    init() {
      this.taskData.detectThreshold = this.$store.getters.systemByType('kunlun_attr_identify_threshold').value;
      this.timeTag = this.defaultDate;
      this.taskData = Object.assign(this.taskData, this.defaultData);
      // console.log('taskData -> ', this.taskData);
      // 此处已经修改为直接使用cameraIds，避免data数据挂载大量相机造成，崩溃问题
      // if (this.defaultData.cameraList) {
      //   this.taskData.cameraIds = this.defaultData.cameraList.map((val) => val.cameraId);
      // }
      this.timeArr = this.handleStampToOrigin(this.taskData.strategyTimeList);
      if (this.mode !== 'create' && this.taskData.termType === 0) {
        this.timeTag = [this.taskData.startTime, this.taskData.endTime];
      } else if (this.mode === 'create') {
        [this.taskData.startTime, this.taskData.endTime] = this.defaultDate;
      }
      if (this.taskData.otherReceiver) {
        this.$nextTick(() => {
          this.$refs.deptTree.setCheckedKeys(this.taskData.receiverDeptList);
          this.$refs.personTree.setCheckedKeys(this.taskData.receiverList);
        });
      }
      this.rules = rules.surveillanceTask({ ...this.taskData, mode: this.mode });
      if (this.taskData.alarmType === 0) {
        this.onDeployTypeChange(this.taskData.strategyTypeId, () => {
          console.log(this.taskData.albumList.map((val) => val.albumId));
          this.$nextTick(() => {
            this.$refs.albumList.setCheckedKeys(this.taskData.albumList.map((val) => val.albumId));
          });
        });
      }
    },
    /**
     * @description 当选择报警接收人的配置发生改变时
     * @param {boolean} status
     */
    onOtherReceiverChange(status) {
      if (!status) {
        this.taskData.receiverDeptList = [];
        this.taskData.receiverList = [];
      }
    },
    /**
     * @description 打开新建布控类型弹窗
     */
    openCreateType() {
      this.$emit('open-create-type');
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
     * @description 内部数据变化时
     * @param {array} list
     * @returns
     */
    onDataChange(list) {
      this.taskData.albumList = list;
      this.$refs.albumList.setCheckedKeys(list.map((val) => val.albumId));
    },
    /**
     * @description 提前处理，让部门不纳入人员树统计数量
     * @param {object} item
     */
    pretreatPersonTree(item) {
      if (item.flag !== 'user') {
        item.noStatistics = true;
      }
    },
    /**
     * @description 获得时间
     * @param {any}
     * @returns
     */
    getDateValue(dateArr) {
      console.log(3333, dateArr);
      if (dateArr) {
        [this.taskData.startTime, this.taskData.endTime] = dateArr;
      } else {
        this.taskData.startTime = '';
        this.taskData.endTime = '';
      }
    },
    onTimeSelectChange(timeArr) {
      this.taskData.strategyTimeList = timeArr;
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
              this.taskData.startTime = new Date(new Date(this.taskData.startTime).toLocaleDateString()).getTime(); // 0时0分0秒;
              this.taskData.endTime = new Date(new Date(this.taskData.endTime).toLocaleDateString()).getTime() + 86400000 - 1;
              this.$emit('save', this.taskData, this.mode);
            }
          });
        }
      });
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
      this.taskData.receiverList = this.$refs.personTree.getCheckedKeys((item) => item.flag === 'user');
    },
    /**
     * @description 底库选择变化时
     */
    albumUpdate() {
      const result = this.$refs.albumList.getCheckedNodes();
      const beforeList = this.taskData.albumList;
      const arr = result.map((value) => {
        let obj = {
          albumId: value.id,
          showThreshold: Number(this.showThresholdMap[this.taskData.strategyTypeId]),
          albumType: Number(this.taskData.strategyTypeId),
          albumName: value.name
        };
        beforeList.forEach((val) => {
          if (val.albumId === value.id) {
            obj = val;
          }
        });
        return obj;
      });
      this.taskData.albumList = arr;
    },
    resetAlbumList() {
      this.taskData.albumList = [];
      this.$nextTick(() => {
        if (this.taskData.alarmType === 0) {
          this.$refs.albumList.setPopoverVisibility(false);
        }
      });
    },
    /**
     * @description  选择的布控类型发生变化时
     * @param {number} type
     * @param {function} fn
     * @returns
     */
    onDeployTypeChange(type, fn = this.resetAlbumList) {
      const paramsMap = {
        1: {
          deployObject: [1],
        },
        2: {
          deployObject: [2],
        },
        3: {
          deployObject: [3],
        },
        4: {
          deployObject: [5],
        },
        5: {
          deployObject: [4],
          carType: 1,
        },
        6: {
          deployObject: [4],
          carType: 2,
        },
      };
      this.getAlbum({
        ...paramsMap[type],
        authLevel: 1,
        type: [2],
      }, (data) => {
        this.albumTreeList = data;
        fn();
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.form-box {
  display: flex;
  justify-content: space-between;
  height: 420px;
  .spec-box {
    box-sizing: border-box;
    padding-right: 39px;
  }
  .spec-box-album {
    box-sizing: border-box;
    width: 354px;
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
    .lv-radio-group {
      display: flex;
      .lv-radio-item {
        margin-right: 20px;
        label {
          padding: 1px;
          border: 3px solid #ffffff;
          transition: all 0.2s ease;
        }
        ::v-deep.meg-radio-button__inner {
          border: 0;
          border-radius: 0;
          font-weight: 400;
          padding: 8px 12px;
          font-size: 12px;
          color: #ffffff;
        }
        .lv-1 {
          ::v-deep.meg-radio-button__inner {
            background-color: #be5753;
          }
          &.is-active {
            border-color: #b71114;
          }
        }
        .lv-2 {
          ::v-deep.meg-radio-button__inner {
            background-color: #d88342;
          }
          &.is-active {
            border-color: #da650b;
          }
        }
        .lv-3 {
          ::v-deep.meg-radio-button__inner {
            background-color: #f3c85f;
          }
          &.is-active {
            border-color: #d79200;
          }
        }
        .lv-4 {
          ::v-deep.meg-radio-button__inner {
            background-color: #5c88cd;
          }
          &.is-active {
            border-color: #0451ac;
          }
        }
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
<style lang="scss">
.extra-item {
  font-size: 14px;
  color: #21539b;
  font-weight: bold;
  height: 34px;
  line-height: 34px;
  border-top: 1px solid #d2d6de;
  padding-top: 4px;
  padding-bottom: 4px;
  display: flex;
  align-items: center;
  cursor: pointer;
  .meg-icon {
    width: 12px;
    margin-right: 5px;
    margin-left: 13px;
  }
}
</style>
