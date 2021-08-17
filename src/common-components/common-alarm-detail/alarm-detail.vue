<template>
  <meg-dialog
    :visible="true"
    class="alarm-detail"
    :append-to-body="appendToBody"
    :modal-append-to-body="appendToBody"
    @close="closeAlarmDetail"
    width="1250px">
    <template v-slot:title>
      <meg-tabs
        v-model="activeTab"
        plain
        @tab-click="onTabClick">
        <meg-tab-pane
          :label="$t('报警详情')"
          name="detail">
        </meg-tab-pane>
        <meg-tab-pane
          :label="$t('视频回放')"
          v-if="info.strategyTypeId !== '9'"
          name="video">
        </meg-tab-pane>
        <meg-tab-pane
          v-if="info.showTrack && Object.keys(trackInfo).length"
          :label="$t('活动轨迹')"
          name="track">
        </meg-tab-pane>
        <meg-tab-pane
          :label="$t('报警地点')"
          name="position">
        </meg-tab-pane>
      </meg-tabs>
    </template>
    <div
      class="detail-content"
      v-loading="detailLoading">
      <detail
        :info="info"
        v-if="activeTab === 'detail'"
        @move-deploy="onMoveDeploy"></detail>
      <alarm-video-replay
        :video-info="videoInfo"
        v-if="activeTab === 'video' && info.strategyTypeId !== '9'"></alarm-video-replay>
      <alarm-active-track
        :track-info="trackInfo"
        :color-level="info.alarmColor"
        v-if="activeTab === 'track' && Object.keys(trackInfo).length"></alarm-active-track>
      <device-position-map
        :info="info"
        v-if="activeTab === 'position'"></device-position-map>
    </div>

    <template v-slot:footer>
      <next-prev
        @change="nextPrev"
        :total="total"
        :index="index"
        :height="100">
        <div
          v-if="!detailLoading"
          class="middle-btn-box-container">
          <meg-button
            type="danger"
            class="func-btn-big"
            v-show="isConfirmAlertAndFalseAlarmShow"
            @click="isShowConfirmAlarmDialog = true">
            {{ $t('确认警情') }}
          </meg-button>
          <meg-button
            type="primary"
            class="func-btn-normal"
            v-show="isConfirmAlertAndFalseAlarmShow"
            @click="onClickAlarmUndo">
            {{ $t('虚警') }}
          </meg-button>
          <meg-button
            type="primary"
            class="func-btn-normal"
            v-show="info.processStatus === 2"
            @click="onClickAlarmReceive">
            {{ $t('接收') }}
          </meg-button>
          <meg-button
            type="primary"
            class="func-btn-normal"
            v-show="info.processStatus === 3"
            @click="onClickAlarmReport">
            {{ $t('填报') }}
          </meg-button>
          <div
            @click.stop="temporaryOperation"

            :class="['func-btn-store', detailInfo.temporaryFlag === 0 ? 'add':'delete']">
            {{ detailInfo.temporaryFlag === 0 ? $t('加入暂存架') : $t('移出暂存架') }}
          </div>
        </div>
      </next-prev>
    </template>
    <confirm-alarm-dialog
      v-if="isShowConfirmAlarmDialog"
      @alarm-archive="onAlarmArchive"
      @alarm-designate="onAlarmDesignate"
      @close="isShowConfirmAlarmDialog = false"></confirm-alarm-dialog>
    <alarm-record
      ref="alarmRecord"
      @save="alarmRecord"
      @close="recordDialogVisible= false"
      v-if="recordDialogVisible"></alarm-record>
  </meg-dialog>
</template>

<script>
import moment from 'moment';
import { utils } from '@/utils/utils.js';
import NextPrev from '../common-next-prev';
import Detail from './components/detail';
import ConfirmAlarmDialog from './components/confirm-alarm-dialog';
import AlarmVideoReplay from './components/alarm-video-replay';
import AlarmActiveTrack from './components/alarm-active-track';
import DevicePositionMap from './components/device-position-map';
import AlarmRecord from './components/alarm-record';
import AlarmDetailSrv from './alarm-detail.service';
import mixin from './adapter';

export default {
  name: 'AlarmDetail',
  components: {
    NextPrev,
    Detail,
    ConfirmAlarmDialog,
    AlarmVideoReplay,
    AlarmActiveTrack,
    DevicePositionMap,
    AlarmRecord
  },
  mixins: [mixin],
  props: {
    alarmId: {
      type: String,
      default: '',
    },
    total: {
      type: Number,
      default: 0,
    },
    index: {
      type: Number,
      default: 0,
    },
    appendToBody: {
      type: Boolean,
      default: true
    },
  },
  data() {
    return {
      activeTab: 'detail',
      isShowConfirmAlarmDialog: false,
      detailInfo: {},
      info: {},
      recordDialogVisible: false,
      detailLoading: false,

      videoInfo: { // 旧的视频播放信息
        faceOnlyUrl: '',
        clipUrl: '',
        clipFile: ''
      }, // 报警的视频回放信息
      trackInfo: {},
    };
  },
  computed: {
    /**
     * @description 是否显示 确认警情和虚警按钮
     * @returns {Boolean}
     */
    isConfirmAlertAndFalseAlarmShow() {
      if (this.info.processStatus === 1) {
        return true;
      }
      return false;
    },
  },
  watch: {
    alarmId: {
      handler(value) {
        if (value) {
          this.getDetailInfo(value);
        }
      },
      immediate: true,
    }
  },
  mounted() {
  },
  methods: {
    /**
     * @description 获取详情
     * @param {string} id
     */
    getDetailInfo(id) {
      this.detailLoading = true;
      AlarmDetailSrv.getAlarmDetail({ id }).then((res) => {
        if (res.code === 0) {
          this.detailInfo = res.data;
          this.info = this.getNormalData(this.detailInfo);

          // 只有当人脸布控才查询top3
          if (this.detailInfo.strategyTypeId === '1') {
            this.topSearch(this.detailInfo);
          }
          if (['1', '2'].includes(this.detailInfo.strategyTypeId) && this.detailInfo.strategyCategory !== 3) {
            this.getTracks(id);
          }
          if (this.detailInfo.strategyTypeId === '1') {
            if (this.detailInfo.album.srcType !== 2) this.isMoveDeploy(this.detailInfo.album.albumId, this.detailInfo.photo.photoId);
          }
          if (this.detailInfo.strategyTypeId !== '9') {
            this.getVideo(id);
          }
        }
        this.detailLoading = false;
      });
    },
    /**
     * @description 获取视频播放地址
     */
    getVideo(id) {
      AlarmDetailSrv.getVideo({ id }).then((res) => {
        if (res.code === 0) {
          this.videoInfo = { ...res.data, faceOnlyUrl: this.detailInfo.cropUri };
        }
      });
    },
    /**
     * @description 获取活动轨迹
     */
    getTracks(id) {
      AlarmDetailSrv.getTracks({ id }).then((res) => {
        if (res.code === 0) {
          this.trackInfo = res.data;
        }
      });
    },
    /**
     * @description 本地比对top3获取
     * @param {object} params
     * @returns
     */
    async topSearch(params) {
      const base64 = await utils.urlToBase64(params.cropUri);

      AlarmDetailSrv.topSearch({
        albumType: 1,
        faceList: [{
          photoData: base64,
          rect: params.captureLocator.cropLocator
        }],
        topNum: 3
      }).then((res) => {
        if (res.code === 0) {
          this.$set(this.info, 'cardInfo', res.data.candidateList);
        }
      });
    },
    /**
     * @description 查询是否撤控
     * @param {string} albumId
     * @param {string} photoId
     */
    isMoveDeploy(albumId, photoId) {
      AlarmDetailSrv.getDeployStatus({ albumId, photoId }).then((res) => {
        if (res.code === 0) {
          this.$set(this.info, 'currentMoveStatus', res.data);
        }
      });
    },
    // 接受报警
    onClickAlarmReceive() {
      this.$confirm(this.$t('确定接收该报警?'), this.$t('接收确认'), {
        confirmButtonText: this.$t('确定'),
        cancelButtonText: this.$t('取消'),
      }).then(() => {
        this.alarmReceive();
      }).catch(() => {
      });
    },
    // 点击报警填报按钮，显示报警填报表单
    onClickAlarmReport() {
      this.recordDialogVisible = true;
    },
    // 填报报警
    alarmRecord(recordData) {
      recordData.alarmId = this.detailInfo.id;
      AlarmDetailSrv.alarmReport(recordData).then((response) => {
        if (response.code === 0) {
          this.$message.success(this.$t('填报成功'));
          // 当成功的时候关闭详情弹框并强制刷新今日报警列表
          this.recordDialogVisible = false;
          this.createArchives(recordData);
          this.$emit('close');
          this.$emit('update', { id: this.alarmId, index: this.index }, '4');
        } else {
          this.$message.error(this.$t('填报失败'));
        }
      });
    },

    /**
     * @description 新建战果
     * @param {object} recordData
     * @returns
     */
    createArchives(recordData) {
      if (recordData.right === 1 || recordData.resultStatus === '3') {
        return;
      }

      const params = {};
      // 如果是抓捕
      moment.locale('zh-cn');
      const tempTime = this.$d(new Date(recordData.policeTime), 'long'); // 24小时制
      if (recordData.resultStatus === '2') {
        params.archiveName = `${recordData.policeName}${this.$t('于')}${tempTime
        }${this.$t('抓获')}${recordData.grabCount}${this.$t('人')}`;
        params.catchCount = recordData.grabCount;
        params.clueCount = 0;
      }
      // 如果是线索
      if (recordData.resultStatus === '4') {
        params.archiveName = `${recordData.policeName}${this.$t('于')}${tempTime
        }${this.$t('提供有效线索')}${recordData.grabCount}${this.$t('条')}`;
        params.clueCount = recordData.grabCount;
        params.catchCount = 0;
      }
      params.archiveTime = recordData.policeTime;
      params.archiveOrgId = this.$store.getters.userOrg.id;
      params.archiveOrgName = this.$store.getters.userOrg.orgName;
      params.archiveSource = 1;
      params.archiveSourceName = this.$t('历史报警');
      // params.content = recordData.reportContent;
      // 从字典表获取警情处理状态
      const resultType = this.$store.getters.dataMapByType('realtime_result').find((item) => recordData.resultStatus === item.code);
      params.content = `
      ${this.$t('出警人员')}:${recordData.policeName}
      ${this.$t('处理结果')}:${resultType.value}
      ${this.$t('备注')}:${recordData.reportContent}
      `;
      params.policemanId = this.$store.getters.user.id;
      params.policemanName = this.$store.getters.user.userName;
      params.policemen = {
        userIds: [this.$store.getters.user.id],
        userNames: [this.$store.getters.user.userName],
      };
      params.images = [];
      const imgObj = {};

      imgObj.type = 'alarm';
      imgObj.detailData = this.detailInfo;
      imgObj.imageSaveStatus = 1;
      params.images.push(imgObj);

      AlarmDetailSrv.createResult(params).then((response) => {
        if (response.code === 0) {
          // 成功生成战果
          // console.log(response)
        }
      });
    },
    /**
     * @description 标题切换时
     * @param {any}
     */
    onTabClick(tab, event) {
      console.log(tab, event);
    },
    /**
     * @description 报警并派警
     */
    onAlarmDesignate() {
      AlarmDetailSrv.alarmDesignate({ alarmId: this.alarmId }).then((response) => {
        if (response.code === 0) {
          this.$message.success(this.$t('派警成功'));
          this.$emit('close');
          this.$emit('update', { id: this.alarmId, index: this.index }, '2');
        } else {
          this.$message.error(this.$t('派警失败'));
        }
      });
    },
    /**
     * @description 仅确认
     */
    onAlarmArchive() {
      console.log('onAlarmArchive');
      AlarmDetailSrv.alarmArchive({ alarmId: this.alarmId }).then((response) => {
        if (response.code === 0) {
          this.$message.success(this.$t('确认成功'));
          this.$emit('close');
          this.$emit('update', { id: this.alarmId, index: this.index }, '4');
        } else {
          this.$message.error(this.$t('确认失败'));
        }
      });
    },
    /**
     * @description 撤销布控
     */
    onMoveDeploy() {
      AlarmDetailSrv.moveDeployFace({ albumId: this.detailInfo.album.albumId, photoId: this.detailInfo.photo.photoId }).then((res) => {
        if (res.code === 0) {
          this.$set(this.info, 'currentMoveStatus', 2);
          this.$message.success(this.$t('当前人员不会再收到报警信息，已移入撤控库'));
        } else {
          this.$message.error(this.$t('操作失败'));
        }
      });
    },
    /**
     * @description 虚警
     */
    onClickAlarmUndo() {
      this.$confirm(this.$t('确认该警情为虚警？'), this.$t('虚警确认'), {
        confirmButtonText: this.$t('确定'),
        cancelButtonText: this.$t('取消'),
      }).then(() => {
        AlarmDetailSrv.alarmUndo({ alarmId: this.alarmId }).then((response) => {
          if (response.code === 0) {
            this.$message.success(this.$t('操作成功'));
            this.$emit('close');
            this.$emit('update', { id: this.alarmId, index: this.index }, '4');
          } else {
            this.$message.error(this.$t('操作失败'));
          }
        });
      }).catch(() => {
      });
    },
    /**
     * @description 报警接收
     */
    alarmReceive() {
      AlarmDetailSrv.alarmReceive({ alarmId: this.alarmId }).then((response) => {
        if (response.code === 0) {
          this.$message.success(this.$t('接收成功'));
          // 报警之后更新详情信息
          this.$emit('close');
          this.$emit('update', { id: this.alarmId, index: this.index }, '3');
        } else if (response.code === 20271004) {
          this.$message({
            type: 'error',
            message: this.$t('报警已经被接收')
          });
        } else {
          this.$message.error(this.$t('接收失败'));
        }
      });
    },
    /**
     * @description 上一个下一个
     * @param {any}
     * @returns
     */
    nextPrev(index, direction) {
      this.$emit('change', index, direction);
    },
    closeAlarmDetail() {
      this.$emit('close');
    },

    /**
     * @description 暂存架相关操作
     * @param {any}
     * @returns
     */
    temporaryOperation() {
      if (this.detailInfo.temporaryFlag === 0) {
        this.addTemporaries();
      } else {
        this.deleteTemporaries();
      }
    },
    addTemporaries() {
      const params = {
        temId: this.detailInfo.id,
        temType: 2,
        temOrigin: this.getTempOrigin(this.$route.name),
        snapshot: this.detailInfo
      };
      AlarmDetailSrv.addTemporaries(params).then((res) => {
        if (res.code === 0) {
          this.$message.success(this.$t('加入暂存架成功'));
          this.$set(this.detailInfo, 'temporaryFlag', 1);
          this.$emit('temp-change', this.index, 1, this.detailInfo);
          this.$store.dispatch('shelf/manageShelf', {
            action: 'add',
            type: 'alarm',
            id: this.detailInfo.id
          });
        }
      });
    },
    deleteTemporaries() {
      const params = {
        temIds: [this.detailInfo.id],
        temType: 2,
      };
      AlarmDetailSrv.deleteTemporaries(params).then((res) => {
        if (res.code === 0) {
          this.$message.success(this.$t('移出暂存架成功'));
          this.$set(this.detailInfo, 'temporaryFlag', 0);
          this.$emit('temp-change', this.index, 0, this.detailInfo);
          this.$store.dispatch('shelf/manageShelf', {
            action: 'delete',
            type: 'alarm',
            id: this.detailInfo.id
          });
        }
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.alarm-detail {
  ::v-deep.meg-dialog__footer {
    padding: 0px;
  }
  ::v-deep.meg-dialog__body {
    padding-top: 0px;
  }
  .detail-content {
    height: 486px;
  }
  .middle-btn-box-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    .func-btn-big {
      width: 140px;
      font-size: 20px;
      margin-right: 14px;
      font-weight: bold;
      height: 56px;
    }

    .func-btn-normal {
      width: 140px;
      font-size: 20px;
      font-weight: bold;
      margin-right: 24px;
      height: 56px;
    }
    .func-btn-store {
      height: 54px;
      width: 158px;
      border: 1px solid #767676;
      border-radius: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: #ffffff;
      cursor: pointer;
      &.add{
        &:hover {
          background:#1A1A1A;
        }
      }
      &.delete{
        border: 1px solid #869ABB;
        &:hover {
          background:#1A1A1A;
        }
      }

    }
  }
}
</style>
