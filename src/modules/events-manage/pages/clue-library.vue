<template>
  <div
    class="clue-library-wrapper">
    <div
      class="loading"
      v-loading="loading">
      <!-- 头部 -->
      <div class="main-header">
        <div class="title">
          已选：{{ checkList.length }}条
        </div>
        <div class="content">
          <meg-radio-group
            @change="handleTabChange"
            v-model="serachType">
            <meg-radio-button
              v-for="tab in searchTypeOpts"
              :key="tab.value"
              :label="tab.value">
              <span v-if="serachType === tab.value">按</span>{{ tab.label }}<span v-if="serachType === tab.value">排序</span>
            </meg-radio-button>
          </meg-radio-group>
        </div>
        <div class="actions">
          <meg-button
            v-if="!isVideoNet && isPermission"
            :disabled="!(categories.length > 0)"
            type="primary"
            @click="handleGoTrace">
            全域追踪
          </meg-button>
          <meg-button
            v-if="checkList.length > 0"
            type="primary"
            @click="handleGoTargetDeploy">
            全目标布控
          </meg-button>
          <meg-button
            @click="handleExportClue"
            :disabled="!(categories.length > 0)">
            导出
          </meg-button>
          <template v-if="checkList.length > 0">
            <meg-button
              @click="handleDeleteClue">
              删除
            </meg-button>
            <meg-button
              @click="handleCancelSelect">
              退出选择
            </meg-button>
          </template>
          <meg-button
            @click.stop="handleAddToTemporaryShelf"
            v-if="!(checkList.length > 0)">
            从暂存架添加
          </meg-button>
        </div>
      </div>
      <!-- 线索库筛选 -->
      <div
        class="clue-library-main"
        v-background="bgVisible">
        <div class="clue-library-container">
          <common-collapse
            ref="collapse"
            :show-checkbox="isShowCheckbox"
            :categories="categories"
            :list="clueList"
            :page-size="pageSize"
            @check-list-change="onCheckListChange"
            @change="onCategoryChange">
            <template v-slot="{item, index}">
              <div
                class="card-item"
                @mouseenter="handleMouseEnter">
                <div class="card-actions">
                  <div
                    v-if="item.photoType === 1"
                    class="face-icon"
                    @click.stop="handleCardActions({className: 'face'}, item)">
                    <meg-icon
                      name="captureStatistics_menu"
                      color="#fff"></meg-icon>
                  </div>
                  <div
                    v-for="action in cardActionsOpts"
                    :key="action.iconName"
                    :class="`${action.className}-icon`"
                    @click.stop="handleCardActions(action, item)">
                    <meg-icon
                      :name="action.iconName"
                      color="#fff"></meg-icon>
                  </div>
                </div>
                <common-card
                  @click.native.stop="handleCaptureDetail(index)"
                  :card-data="item"
                  :is-show-base-button="[]"
                  :is-show-del-button="false"></common-card>
              </div>
            </template>
          </common-collapse>
        </div>
      </div>
      <!-- 确认身份弹窗 -->
      <identity-modal
        :identity-data="identityData"
        :visible="visibleIdentityModal"
        v-if="visibleIdentityModal"
        @success="() => { visibleIdentityModal = false }"
        @cancel="() => { visibleIdentityModal = false }"></identity-modal>
      <!-- 全目标布控弹窗 -->
      <target-deploy-dialog
        :visible="visibleTargetModal"
        :archive-images-obj="archiveImagesObj"
        @success="handleCloseTargetModal"
        @cancel="handleCloseTargetModal"
        v-if="visibleTargetModal"></target-deploy-dialog>
      <!-- 一键布控 -->
      <common-one-key
        v-if="visibleOneKeyModal"
        :photo-url="oneKeyData.photoUrl"
        :photo-type="transformDetetype(oneKeyData.photoType)"
        @close="handleCloseOneKeyModal"></common-one-key>
      <common-capture-detail
        :show-temporary="false"
        :feaker="true"
        :visible.sync="captureDialogVisible"
        :result-list="resultList"
        :index="captureIdx">
      </common-capture-detail>
    </div>
  </div>
</template>
<script>
import CommonCaptureDetail from '@/common-components/common-capture-detail';
import CommonCollapse from '@/common-components/common-collapse';
import CommonCard from '@/common-components/common-card';
import CommonOneKey from '@/common-components/common-one-key-monitor';
import { switchToModule } from '@/utils/utils';
import IdentityModal from '../components/identity-modal';
import EventManageApi from '../events-manage.service';
import TargetDeployDialog from '../components/target-deploy';
import { categoriesName } from '../utils';

export default {
  name: 'ClueLibrary',
  components: {
    CommonCollapse,
    CommonCard,
    IdentityModal,
    TargetDeployDialog,
    CommonOneKey,
    CommonCaptureDetail,
  },
  data() {
    return {
      totalRecords: 0, // 已选{}条
      serachType: 'target', // tab默认按目标聚合
      searchTypeOpts: [ // tab list
        {
          label: '目标',
          value: 'target'
        },
        {
          label: '时间',
          value: 'date'
        },
        {
          label: '地点',
          value: 'camera'
        },
      ],
      categories: [], // 聚合接口
      clueList: [], // 风琴褶list
      resultList: [],
      isShowCheckbox: false, // 是否展示复选框
      pageSize: 60, // 默认展示卡片数量
      checkList: [], // 选中集合
      allSelectList: [], // 收集全部选中
      visibleIdentityModal: false, // 确认身份弹窗
      loading: true,
      visibleTargetModal: false, // 全目标布控
      visibleOneKeyModal: false, // 一键布控
      archiveImagesObj: {}, // 全目标布控脸，人，机，非数据
      identityData: null,
      oneKeyData: {
        photoUrl: '',
        photoType: '',
      }, // 一键布控
      captureDialogVisible: false, // 卡片详情弹窗
      captureIdx: 0,
      cardActionsOpts: [ // 卡片操作列表
        {
          className: 'alarm',
          iconName: 'alarmHistory_menu_old',
        },
        {
          className: 'del',
          iconName: 'mission_del',
        }
      ]
    };
  },
  computed: {
    bgVisible() {
      const background = {
        icon: 'icon_2',
        text: '暂无数据'
      };
      if (this.categories.length > 0 || this.loading) return false;
      return background;
    },
    addSelf() {
      return this.$store.getters['shelf/eventAddData'];
    },
    faceThreshold() {
      const face = this.$store.getters.systemByType('kunlun_alarm_deployment_recommend_threshold');
      return face.value || face.defaultValue;
    },
    bodyThreshold() {
      const body = this.$store.getters.systemByType('kunlun_body_identify_threshold');
      return body.value || body.defaultValue;
    },
    motorThreshold() {
      const motor = this.$store.getters.systemByType('kunlun_motor_identify_threshold');
      return motor.value || motor.defaultValue;
    },
    noMotorThreshold() {
      const noMotor = this.$store.getters.systemByType('kunlun_non_motor_identify_threshold');
      return noMotor.value || noMotor.defaultValue;
    },
    isDual() {
      return this.$store.getters.systemByType('isDual').value === 'true';
    },
    dualPlatformType() {
      return this.$store.getters.systemByType('dualPlatformType').value === '0'; // 视频网
    },
    isVideoNet() {
      return !this.dualPlatformType && this.isDual; // 是否视频网
    },
    isPermission() {
      return this.$store.getters.modulesByAlias(['path-trace']).length;
    }
  },
  watch: {
    addSelf(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.getClueCategory();
      }
    },
    'checkList.length': function (val) {
      if (val > 0) {
        this.dealWithSelectedClue();
      }
    },
  },
  created() {
    this.getClueCategory();
  },
  methods: {
    transformDetetype(photoType) {
      const map = {
        '1': '1',
        '2': '2',
        '3': '3',
        '4': '4',
        '5': '3',
        '6': '4'
      };
      return map[photoType];
    },
    /**
     * 获取线索库聚合数据
     */
    getClueCategory() {
      const reqParams = {
        aggType: this.serachType,
        eventId: this.$route.query.eventId,
        limitLonLat: false,
        order: 'asc'
      };
      this.loading = true;
      EventManageApi.clueCategory(reqParams).then((res) => {
        this.loading = false;
        if (res.code === 0) {
          this.categories = res.data.records.map((item) => ({
            displayName: item.aggName,
            count: item.count,
            ...item
          }));
          if (this.categories.length) {
            this.clueList = this.categories[0].listResults;
          }
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    /**
     * 退出选择
    */
    handleCancelSelect() {
      this.$refs.collapse.cancelSelect();
    },
    /**
     * 目标分析，时间分析，地点切换
     */
    handleTabChange(tab) {
      this.serachType = tab;
      this.getClueCategory();
      this.handleCancelSelect();
      this.checkList = [];
      this.categories = [];
      this.clueList = [];
      this.allSelectList = [];
    },
    /**
     * 风琴褶切换选择
     */
    onCategoryChange(idx) {
      if (idx || idx === 0) {
        this.clueList = this.categories[idx].listResults;
      }
    },
    /**
    * 处理选中的脸，人，机，非
    */
    dealWithSelectedClue() {
      const filterList = this.clueList.filter((x) => this.checkList.some((y) => x.id === y));
      this.allSelectList.push(...filterList);
    },
    onCheckListChange(ids) {
      this.checkList = ids;
    },
    /**
     * hover展示选择框
     */
    handleMouseEnter() {
      this.isShowCheckbox = true;
    },
    // 删除线索
    handleDeleteClue(card) {
      const reqParams = {
        clueIds: [...this.checkList]
      };
      if (card && card.id) {
        const { id } = card;
        reqParams.clueIds = [id];
      }
      this.$confirm('此操作将删除线索库图片信息, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        EventManageApi.deleteClue(reqParams).then((res) => {
          if (res.code === 0) {
            this.getClueCategory();
            this.$message.success(res.msg);
          } else {
            this.$message.error(res.msg);
          }
        });
      });
    },
    /**
     * 导出线索
     */
    handleExportClue() {
      const reqParams = {
        eventId: this.$route.query.eventId,
        clueIds: this.checkList,
      };
      EventManageApi.exportClue(reqParams).then((res) => {
        if (res.code === 0) {
          this.$message.success('导出线索成功');
        } else {
          this.$message.errror(res.msg);
        }
      });
    },
    /**
     * 跳转轨迹追踪或者全目标布控
     */
    handleGoTrace() {
      const { eventId } = this.$route.query;
      switchToModule({
        module: 'path-trace',
        query: {
          eventId,
        },
        isBlank: true,
        pageType: 'single',
      });
    },
    handleGoTargetDeploy() {
      const map = new Map();
      const dedupSelectList = this.allSelectList.filter((item) => !map.has(item.id) && map.set(item.id, true));
      this.archiveImagesObj = this.dealWithImages(dedupSelectList);
      this.visibleTargetModal = true;
      this.allSelectList = [];
      this.handleCancelSelect();
    },
    handleCloseTargetModal() {
      this.identityData = null;
      this.visibleTargetModal = false;
    },
    /**
     * 身份确认
     */
    handleIdentityModal(item) {
      this.identityData = item;
      this.visibleIdentityModal = true;
    },
    /**
     * 构造渲染需要的数据结构
     */
    renderDataObj() {
      const targetObj = {};
      const keys = Object.keys(categoriesName); // 获取脸人机非的key
      keys.forEach((key) => {
        targetObj[key] = {
          data: [],
          checkedData: [],
          checkedNum: 0,
          totalNum: 0,
          key,
          isIndeterminate: false,
          checkedAll: true,
          name: categoriesName[key].name,
          label: categoriesName[key].label
        };
      });
      targetObj[1].threshold = this.faceThreshold;
      targetObj[2].threshold = this.bodyThreshold;
      targetObj[3].threshold = this.motorThreshold;
      targetObj[4].threshold = this.noMotorThreshold;
      return targetObj;
    },
    /**
     * @description 处理人脸，人体，机动车和非机动车
     */
    dealWithFaceAndBodyAndMotorAndNoMotor(temp, imagesObj) {
      const { photoType } = temp;
      if (imagesObj[photoType]) {
        imagesObj[photoType].data.push(temp);
        imagesObj[photoType].checkedNum += 1;
        imagesObj[photoType].totalNum += 1;
        imagesObj[photoType].checkedData.push(temp.clueId);
      }
    },
    /**
     * @description 处理机动车牌
     */
    dealWithMotorCard(temp, imagesObj) {
      // 机动车车牌
      if (temp.photoType === 5 && temp.properties && temp.properties.license_plate_text) {
        if (imagesObj[5]) {
          imagesObj[5].data.push({ ...temp });
          imagesObj[5].checkedNum += 1;
          imagesObj[5].totalNum += 1;
          imagesObj[5].checkedData.push(temp.clueId);
        }
      }
    },
    /**
     * @description 处理机动车牌
     */
    dealWithNomotorCard(temp, imagesObj) {
      // 非机动车车牌
      if (temp.photoType === 6 && temp.properties && temp.properties.license_plate_text) {
        if (imagesObj[6]) {
          imagesObj[6].data.push({ ...temp });
          imagesObj[6].checkedNum += 1;
          imagesObj[6].totalNum += 1;
          imagesObj[6].checkedData.push(temp.clueId);
        }
      }
    },
    /**
     * @description 分发
     */
    distribution(arr, imagesObj) {
      for (let i = 0; i < arr.length; i += 1) {
        const temp = arr[i];
        temp.checked = true;
        this.dealWithFaceAndBodyAndMotorAndNoMotor(temp, imagesObj);
        this.dealWithMotorCard(temp, imagesObj);
        this.dealWithNomotorCard(temp, imagesObj);
      }
    },
    /**
     * @description 处理图片列表并且分类
     */
    dealWithImages(data) {
      // 构造需要的渲染函数
      const imagesObj = this.renderDataObj();
      if (!Array.isArray(data)) return imagesObj;
      this.distribution(data, imagesObj);
      return imagesObj;
    },
    handleCardActions(action, item) {
      const self = this;
      const actionsMap = {
        'face': self.handleIdentityModal, // 确认身份
        'alarm': self.handleOneKeyModal, // 一键布控
        'del': self.handleDeleteClue // 删除线索
      };
      const { className } = action;
      actionsMap[className](item);
    },
    /**
     * 打开一键布控弹窗
     */
    handleOneKeyModal(item) {
      console.log('===>item', item);
      this.oneKeyData = {
        photoUrl: item.url,
        photoType: item.photoType
      };
      this.visibleOneKeyModal = true;
    },
    /**
     * 关闭一键布控弹窗
     */
    handleCloseOneKeyModal() {
      this.visibleOneKeyModal = false;
    },
    /**
     * 查看抓拍详情
     */
    handleCaptureDetail(index) {
      this.captureDialogVisible = true;
      this.captureIdx = index;
      this.resultList = this.clueList.slice(0);
    },
    /**
     * 加入暂存架
     */
    handleAddToTemporaryShelf() {
      this.$store.dispatch('shelf/setShelfState', true);
    }
  }
};
</script>
<style scoped lang="scss">
  .clue-library-wrapper{
    width: 100%;
    height: 100%;
    background-color: #efefef;
    .loading {
      width: 100%;
      height: 100%;
    }
    .clue-library-main {
      padding: 0 20px 0 20px;
      height: calc(100% - 56px);
      overflow: hidden;
      background-color: #efefef;
      .clue-library-container {
        height: calc(100% - 56px);
        overflow-y: scroll;
        .card-item{
          position: relative;
          &:hover {
            .card-actions {
              opacity: 1;
            }
          }
          .card-actions {
            position: absolute;
            top: 4px;
            right: 4px;
            z-index: 2;
            display: flex;
            justify-content: flex-start;
            align-items: center;
            opacity: 0;
            .card-action-hidden {
              display: none;
            }
            .face-icon {
              width: 20px;
              height: 20px;
              border-radius: 1px;
              background: rgba(134,154,187,0.80);
              display: flex;
              justify-content: center;
              align-items: center;
              cursor: pointer;
              margin-right: 6px;
            }
            .alarm-icon {
              width: 20px;
              height: 20px;
              border-radius: 1px;
              background: rgba(134,154,187,0.80);
              display: flex;
              justify-content: center;
              align-items: center;
              cursor: pointer;
              margin-right: 6px;
            }
            .del-icon {
              width: 20px;
              height: 20px;
              border-radius: 1px;
              background: rgba(134,154,187,0.80);
              display: flex;
              justify-content: center;
              align-items: center;
              cursor: pointer;
            }
          }
        }
      }
    }
  }
  .main-header {
    padding: 0 20px 0 20px;
    height: 56px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    .title {
      width: 35%;
      font-size: 14px;
      color: #435068;
    }
    .content {
      width: 25%;
      display: flex;
      justify-content: center;
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      width: 40%;
    }
  }
</style>
