<template>
  <meg-dialog
    v-if="isShow"
    fullscreen
    :visible="isShow"
    :append-to-body="true"
    :show-close="false">
    <div
      slot="title"
      class="header">
      <div class="title">
        {{ $t('新建全目标布控') }}
      </div>
      <div class="actions">
        <meg-button
          type="primary"
          :loading="btnLoading"
          @click="handleSave">
          {{ $t('保存') }}
        </meg-button>
        <meg-button @click="cancel">
          {{ $t('取消') }}
        </meg-button>
      </div>
    </div>
    <div class="container">
      <div class="aside">
        <meg-form
          ref="asideForm"
          class="aside-form"
          :model="taskData"
          :rules="rules"
          label-position="right"
          label-width="85px">
          <meg-form-item
            :label="$t('任务名称')"
            class="spec-box"
            prop="strategyName">
            <meg-input
              v-model="taskData.strategyName"
              placeholder="请输入布控任务名称"></meg-input>
          </meg-form-item>
          <meg-form-item
            :label="$t('选择相机')"
            prop="cameraIds">
            <common-camera-selector
              map-icon-position="right"
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
            prop="createTime">
            <meg-date-picker
              class="width-all"
              value-format="timestamp"
              type="daterange"
              format="yyyy-MM-dd"
              v-model="taskData.createTime"
              :picker-options="pickerOptions">
            </meg-date-picker>
          </meg-form-item>
          <meg-form-item
            :label="$t('布控状态')"
            prop="status">
            <meg-switch
              v-model="taskData.status"
              :active-value="0"
              :inactive-value="1">
            </meg-switch>
          </meg-form-item>
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
                :brief-selected-info="true"
                :all-selected-text="$t('全部部门')"
                :placeholder-text="$t('请选择接收的部门')"
                :search-placeholder="$t('输入区域名称进行搜索')"
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
        </meg-form>
      </div>
      <div class="main">
        <div class="title">
          <div class="label">
            请选择布控目标
          </div>
          <div class="check-all">
            已选择 {{ `${countObj.checked}/${countObj.total}` }}
          </div>
        </div>
        <target-deploy-album-tab
          ref="tabForm"
          :archive-images-obj="archiveImagesObj">
        </target-deploy-album-tab>
      </div>
    </div>
  </meg-dialog>
</template>
<script>
import CommonCameraSelector from '@/common-components/common-camera-selector';
import moment from 'moment';
import TimeMultiSelector from '@/modules/surveillance-task/components/time-multi-selector/time-multi-selector.vue';
import rules from '@/modules/surveillance-task/surveillance-task.rule';
import targetDeployAlbumTab from './target-deploy-album-tab';
import EventManageApi from '../events-manage.service';

export default {
  name: 'TargetDeploy',
  components: {
    CommonCameraSelector,
    TimeMultiSelector,
    targetDeployAlbumTab
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    archiveImagesObj: {
      type: Object,
      default: () => ({})
    },
  },
  data() {
    return {
      isShow: this.visible,
      taskData: {
        createTime: [],
        strategyName: '',
        termType: 0,
        cameraIds: [],
        alarmType: 0, // 0 识别 1 检测
        status: 0,
        otherReceiver: false,
        strategyTimeList: [
        ],
        receiverDeptList: [],
        receiverList: [],
      },
      pickerOptions: {
        shortcuts: ['today', 'nextThreeDays', 'theNextWeek', 'theNextMonth']
      },
      btnLoading: false,
      timeArr: [],
      // 部门树数据
      deptTree: [],
      // 人员树数据
      personTree: [],
      areaTreeProps: {
        children: 'subOrgs',
        label: 'name'
      },
      deptTreeProps: {
        children: 'subOrgs',
        label: 'orgName'
      },
    };
  },
  computed: {
    countObj() {
      let checked = 0;
      let total = 0;
      Object.keys(this.archiveImagesObj).forEach((key) => {
        const curItem = this.archiveImagesObj[key];
        checked += curItem.checkedNum;
        total += curItem.totalNum;
      });
      return {
        checked,
        total
      };
    },
    deployAging() {
      return this.$store.getters.dataMapByType('deploy_aging');
    },
    rules() {
      const ret = {
        ...rules.surveillanceTask(this.taskData),
        strategyName: [ // @TODO
          {
            required: true,
            trigger: 'change',
            message: '请输入任务名称'
          },
          {
            min: 2,
            max: 30,
            message: '请输入2-30个字符', // '请输入2-30个字符',
            trigger: 'change',
          },
          {
            pattern: /^(?:[^'“”!@#$%^&*`~！＠＃＄％＾＆＊￥……<>/,，]+)$/,
            message: '不能包含特殊字符',
            trigger: 'change'
          },
        ],
        status: [
          {
            required: true,
            message: '请选择布控状态',
            trigger: 'change'
          }
        ],
        createTime: [{
          required: true,
          message: '请选择有效时间',
          trigger: 'change'
        }],
      };
      return ret;
    },
  },
  watch: {
    visible(val) {
      this.isShow = val;
    }
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.timeArr = this.taskData.strategyTimeList.map((val) => {
        val.startMinute = new Date(val.startMinute + moment().startOf('day').toDate().getTime());
        val.endMinute = new Date(val.endMinute + moment().startOf('day').toDate().getTime());
        return val;
      });
      this.getDeptTree();
      this.getPersonTree();
    },
    getDeptTree() {
      EventManageApi.getDeptTree().then((res) => {
        if (res.code === 0) {
          this.deptTree = [res.data];
        }
      });
    },
    getPersonTree() {
      EventManageApi.getPersonTree().then((res) => {
        if (res.code === 0) {
          this.personTree = [res.data];
        }
      });
    },
    cancel() {
      this.$emit('cancel');
    },
    /**
     * 保存
     */
    handleSave() {
      this.$refs.asideForm.validate((valid) => {
        if (valid) {
          this.doCreateDeploy();
        }
      });
    },
    /**
     * 处理脸人机非选择结果
     */
    dealWithAlumbSelect() {
      const filter = {};
      let status = true;
      Object.keys(this.archiveImagesObj).forEach((key) => {
        const temp = this.archiveImagesObj[key];
        if (temp.name === '人脸' && temp.data.length) {
          if (!temp.threshold) {
            this.$message.error('请输入人脸布控阈值');
            status = false;
          }
          filter.faceSet = {
            threshold: temp.threshold,
            faceList: temp.data.map((item) => item.url)
          };
        }
        if (temp.name === '人体' && temp.data.length) {
          if (!temp.threshold) {
            this.$message.error('请输入人体布控阈值');
            status = false;
          }
          filter.bodySet = {
            threshold: temp.threshold,
            bodyList: temp.data.map((item) => item.url)
          };
        }

        if (temp.name === '机动车' && temp.data.length) {
          if (!temp.threshold) {
            this.$message.error('请输入机动车布控阈值');
            status = false;
          }
          filter.motorSet = {
            threshold: temp.threshold,
            motorList: temp.data.map((item) => item.url)
          };
        }

        if (temp.name === '非机动车' && temp.data.length) {
          if (!temp.threshold) {
            this.$message.error('请输入非机动车布控阈值');
            status = false;
          }
          filter.nonMotorSet = {
            threshold: temp.threshold,
            nonMotorList: temp.data.map((item) => item.url)
          };
        }

        if (temp.name === '机动车车牌' && temp.data.length) {
          filter.motorNoSet = temp.data.map((item) => ({
            photoUrl: item.url,
            carNo: item.carNo || ''
          }));
        }

        if (temp.name === '非机动车车牌' && temp.data.length) {
          filter.nonMotorNoSet = temp.data.map((item) => ({
            photoUrl: item.url,
            carNo: item.carNo || ''
          }));
        }
      });
      if (status) {
        return filter;
      }
      return status;
    },
    /** 创建全目标布控 */
    doCreateDeploy() {
      const ret = this.dealWithAlumbSelect();
      if (!ret) return;
      const currObj = { ...this.taskData };
      const { createTime } = currObj;
      const startTime = createTime && createTime.length > 1 ? new Date(createTime[0]).getTime() : '';
      const endTime = createTime && createTime.length > 1 ? new Date(createTime[1]).getTime() : '';
      delete currObj.createTime;
      const reqParams = {
        startTime,
        endTime,
        ...currObj,
        ...ret
      };
      this.btnLoading = true;
      EventManageApi.createDeployAll(reqParams).then((res) => {
        this.btnLoading = false;
        if (res.code === 0) {
          this.$message.success('创建成功');
          this.$emit('success');
        } else {
          this.$message.error(res.msg);
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
    onTimeSelectChange(timeArr) {
      this.taskData.strategyTimeList = timeArr;
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
      this.taskData.receiverList = this.$refs.personTree.getCheckedKeys();
    },
  }
};
</script>
<style lang="scss" scoped>
.header {
  height: 54px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  align-content: center;
  .title {
    font-size: 20px;
    color: #435068;
    font-weight: 600;
  }
}
.container {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  align-content: center;
  .aside {
    width: 380px;
  }
  .main {
    margin-left: 100px;
    width: calc(100% - 480px);
    height: 595px;
    .title {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      align-content: center;
      padding-bottom: 11px;
      .label {
        &:before {
          content: "*";
          color: #f05353;
          margin-right: 4px;
        }
      }
      .check-all {
        padding-left: 8px;
        font-size: 12px;
        color: #435068;
      }
    }
  }
}
.tips {
  font-size: 14px;
  color: rgba(67, 80, 104, 0.5);
}
.label-box {
  margin-right: 30px;
}
</style>
