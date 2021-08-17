<template>
  <div
    class="vsr-dialog-wrap"
    v-if="isEditShow">
    <meg-dialog
      :visible="isEditShow"
      :width="'640px'"
      :title="$t('编辑任务')"
      @close="closeClick">
      <div
        v-loading="!loading"
        class="show-detail">
        <div class="plan-left">
          <div class="vsr-dialog-content">
            <div class="wrap">
              <span class="label">{{ $t('任务名称') }}</span>
              <meg-input
                v-model="editForm.taskName"></meg-input>
            </div>
            <div class="wrap">
              <span class="label">{{ $t('解析类型') }}</span>
              <div class="con">
                {{ analysisTypeArr[analysisType] && analysisTypeArr[analysisType].label }}
              </div>
            </div>
            <div class="wrap">
              <span class="label">{{ $t('解析倍速') }}</span>
              <meg-input
                v-model="editForm.speed"></meg-input>
            </div>
            <div class="wrap">
              <span class="label">{{ $t('优先级') }}</span>
              <meg-radio-group v-model="editForm.priority">
                <meg-radio :label="1">
                  {{ $t('一般任务') }}
                </meg-radio>
                <meg-radio :label="0">
                  {{ $t('紧急任务') }}
                </meg-radio>
              </meg-radio-group>
            </div>
            <div class="wrap">
              <span class="label">{{ $t('自动比对') }}</span>
              <div class="con">
                {{ editForm.autoCompare?$t('是'):$t('否') }}
              </div>
            </div>
            <div class="wrap last-item">
              <span class="label">{{ $t('比对目标') }}</span>
              <div class="con">
                <span>
                  {{ editForm.doPackage ? $t('图片文件') : $t('布控库') }}
                </span>
                <meg-input
                  readonly
                  v-model="albumInfo"
                  type="textarea"
                  :rows="6"></meg-input>
              </div>
            </div>
          </div>
        </div>
      </div>
      <span
        slot="footer"
        class="dialog-footer">
        <meg-button
          type="primary"
          :loading="btnLoading"
          :disabled="!loading"
          @click="saveEdit">{{ $t('保存') }}</meg-button>
        <meg-button @click.native="closeClick">{{ $t('取消') }}</meg-button>
      </span>
    </meg-dialog>
  </div>
</template>

<script>
import AnalysisCommonMapList from '@/utils/data-map.utils';

export default {
  props: {
    // 显示详情的弹框
    isEditShow: {
      type: Boolean,
      default: false
    },
    detailData: {
      type: Object,
      default: () => {}
    },
    monitorInfo: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      editForm: {},
      loading: false,
      btnLoading: false,
      analysisTypeArr: AnalysisCommonMapList.analysisTypeArr[0],
    };
  },
  computed: {
    analysisType() {
      let tempIndex = 0;
      this.analysisTypeArr.forEach((item, index) => {
        const curItem = item.val;
        const arr = Object.keys(curItem).filter((key) => curItem[key] === this.detailData[key]);
        if (arr.length === 4) {
          tempIndex = index;
        }
      });
      return tempIndex;
    },
    albumInfo() {
      const {
        compareBodySets, compareFaceSets, compareMotorSets, compareNonMotorSets, compareMotorLicenseSets, compareNonMotorLicenseSets
      } = this.detailData;
      return this.generateStr(compareBodySets, this.$t('人体库')) + this.generateStr(compareFaceSets, this.$t('人脸库')) + this.generateStr(compareMotorSets, this.$t('机动车库')) + this.generateStr(compareNonMotorSets, this.$t('非机动车库')) + this.generateStr(compareMotorLicenseSets, this.$t('机动车牌库')) + this.generateStr(compareNonMotorLicenseSets, this.$t('非机动车牌库'));
    }
  },
  watch: {
    detailData(newVal) {
      this.loading = Boolean(Object.keys(newVal || {}).length);
      this.editForm = {
        ...newVal
      };
    }
  },
  methods: {
    /**
     * @description 解析倍速值校验
     */
    checkValue(speed) {
      const { monitorInfo } = this;
      if (!/^\d+$/.test(speed)) {
        return false;
      }
      if (speed > monitorInfo.totalVideoPower || speed < 0) {
        return false;
      }
      return true;
    },
    /**
     * @description 生成底库信息字符串
     * @param {Object} albumSelectInfo 选中的底库信息
     * @param {String} albumSelectInfo 选中的底库信息
     * @returns {String} 选中底库信息描述
     */
    generateStr(albumSelectInfo, albumType) {
      let descriptionString = '';
      if (albumSelectInfo) {
        if (!this.detailData.doPackage) {
          descriptionString = `${albumType}
`;
        }
        albumSelectInfo.forEach((item) => {
          const thres = [5, 6].includes(item.albumType) ? '' : `，${this.$t('阈值')}:${item.threshold}`;
          descriptionString += `${item.albumName + thres};
`;
        });
      }
      return descriptionString;
    },
    /**
     * @description 编辑完成
     */
    saveEdit() {
      if (this.btnLoading) return false;
      const {
        taskName, speed, priority, id
      } = this.editForm;
      if (!taskName) {
        return this.$message.error({
          message: '请输入任务名称',
          showClose: true
        });
      }
      if (taskName.length < 2 || taskName.length > 50) {
        return this.$message.error({
          message: '任务名称为2-50个字符',
          showClose: true
        });
      }
      if (!/^(?:[^'“”!@#$%^&*`~！＠＃＄％＾＆＊￥……<>/,，。]+)$/.test(taskName)) {
        return this.$message.error({
          message: '任务名称不能包含特殊字符',
          showClose: true
        });
      }
      if (speed === '') {
        return this.$message.error({
          message: '请输入解析倍速',
          showClose: true
        });
      }
      if (speed <= 0) {
        return this.$message.error({
          message: '请输入大于0的解析倍速',
          showClose: true
        });
      }
      if (!this.checkValue(speed)) {
        const { totalVideoPower } = this.monitorInfo;
        return this.$message.error({
          message: `请输入1-${totalVideoPower}的解析倍速`,
          showClose: true
        });
      }
      this.btnLoading = true;
      this.$emit('save-edit', {
        id,
        taskName,
        speed,
        priority
      });
      return false;
    },
    /**
     * 取消编辑
     */
    closeClick() {
      this.$emit('close-click');
    }
  },
};
</script>
<style lang='scss' scoped>
  ::v-deep .meg-dialog__body{
    padding-bottom: 20px;
  }
  .show-detail{
    display: flex;
    .plan-left{
      flex: 1;
    }
    .plan-right{
      flex: 1;
      height: 560px;
      ::v-deep .task-calendar {
        .switch-mode .active{
          background-color: #2B5496;
          color: white;
        }
      }
    }
  }
  .vsr-dialog-content {
    .wrap {
      display: flex;
      align-items: baseline;
      line-height: 34px;
      margin-bottom: 10px;

      .label {
        width: 70px;
        text-align: right;
        color: #869ABB;
        margin-right: 12px;
      }

      .con {
        flex: 1;
        color: #435068;
      }
    }
    .meg-input,.meg-radio-group {
      flex: 1;
      ::v-deep input {
        width: 270px;
      }
    }
    .last-item {
      // margin-bottom: 25px;
    }
  }
</style>
