<template>
  <page-layout>
    <div class="gather-detail">
      <div class="result-list">
        <div class="result-list-header">
          <meg-return-button
            width="160px"
            :title="jobName"></meg-return-button>
          <meg-button
            type="text"
            @click="showDetailDialog">
            {{ $t('查看任务详情') }}
          </meg-button>
        </div>
        <div class="result-list-content">
          <div class="header">
            <span>{{ $t('分析结果') }}</span>
            <span>{{ $t('聚类为{count}人',{count: resultList.length|| 0 }) }}</span>
          </div>
          <div class="content">
            <div
              v-for="(result,index) in resultList"
              :key="result.personId">
              <div
                class="person-image"
                @click="queryPersonList(result.personId,index)">
                <meg-card
                  :img-src="result.faceUrl"
                  :img-border="index === activeIndex ? '2px solid #0074FF':''"
                  img-margin="0">
                </meg-card>
              </div>
              <div class="person-count">
                <span class="number">{{ result.count }}</span>{{ $t('次') }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="result-detail">
        <capture-list
          :is-loading="isCaptureListLoading"
          :list-data="personList"
          :cluster-type="clusterType"
          :list-count="personListCount"
          @confirm-export="confirmExport"
          @delete-item="deleteItem"></capture-list>
      </div>
      <gather-detail-dialog
        v-if="detailDialogVisible"
        :detail-dialog-visible="detailDialogVisible"
        :detail-dialog-data="detailDialogData"
        @edit-job-name="editJobName"
        @close-detail-dialog="closeDetailDialog"></gather-detail-dialog>
    </div>
  </page-layout>
</template>
<script>
import PersonGatherSrv from '../person-gather.service';
import GatherDetailDialog from '../components/gather-detail';
import CaptureList from '../components/capture-list';

export default {
  components: {
    CaptureList,
    GatherDetailDialog
  },
  data() {
    return {
      jobName: '',
      resultList: [],
      personList: [],
      personListCount: 0,
      isSelectMode: false,
      selectedNum: 0,
      exportData: {
        exportList: [],
        exportColumns: []
      },
      personDetailVisible: false,
      personDetailData: {},
      isCaptureListLoading: false,
      detailDialogVisible: false,
      detailDialogData: {},
      clusterType: '',
      activeIndex: 0
    };
  },
  created() {
    this.jobId = this.$route.query.id;
    this.jobName = this.$route.query.jobName;
    this.queryResultList(this.jobId);
  },
  methods: {
    /*
    * 删除
    * @param {any}
    * @return
    * */
    deleteItem(item) {
      const activeData = this.resultList[this.activeIndex];
      const param = {
        faceId: item.faceId,
        personId: activeData.personId
      };
      PersonGatherSrv.deleteFace(param).then((res) => {
        if (res.code === 0) {
          this.queryResultList(this.jobId);
          this.queryPersonList(activeData.personId);
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    /*
    * 编辑任务名字
    * @param {any}
    * @return
    * */
    async editJobName(params) {
      const res = await PersonGatherSrv.modifyJobName(params);
      if (res.code === 0) {
        this.$message.success(this.$t('编辑成功'));
        this.jobName = params.jobName;
      } else {
        this.$message.error(this.$t('编辑失败'));
      }
    },
    /*
    * 详情弹框
    * @param {any}
    * @return
    * */
    async showDetailDialog() {
      const params = { id: this.jobId };
      const res = await PersonGatherSrv.queryTaskDetail(params);
      if (res.code === 0) {
        this.detailDialogData = res.data;
        this.detailDialogVisible = true;
      } else {
        this.$message.error(this.$t('任务详情请求失败'));
      }
    },
    /*
    * 关闭详情弹框
    * @param {any}
    * @return
    * */
    closeDetailDialog() {
      this.detailDialogVisible = false;
    },
    /*
    * 确认导出任务
    * @param {any}
    * @return
    * */
    async confirmExport(params) {
      const res = await PersonGatherSrv.export(params);
      if (res.code === 0) {
        if (!params.task) { // 批量导出走任务消息，不返回下载链接
          window.location.href = res.data.url;
        } else {
          this.$message({
            message: this.$t('导出成功，请前往任务列表下载'),
            type: 'success'
          });
        }
      } else {
        this.$message.success(this.$t('导出失败'));
      }
    },
    /*
    * 切换选择模式
    * @param {any}
    * @return
    * */
    setSelectMode() {
      this.selectedNum = 0;
      this.exportData.exportList = [];
      if (this.personListCount !== 0) {
        this.personList.forEach((val) => {
          this.$set(val, 'checked', false);
        });
      }
      this.isSelectMode = !this.isSelectMode;
    },
    /*
    * 分析结果列表
    * @param {jobId} 任务id
    * @return
    * */
    async queryResultList(jobId) {
      const res = await PersonGatherSrv.queryResultList({ jobId });
      if (res.code === 0) {
        this.resultList = res.data;
        if (this.resultList.length > 0) {
          this.queryPersonList(this.resultList[0].personId);
          this.clusterType = this.resultList[0].clusterType;
        }
      } else {
        this.$message.error(this.$t('请求失败'));
      }
    },
    /*
    * 分析结果对应的抓拍图片列表
    * @param {personId} 人员id
    * @return
    * */
    async queryPersonList(personId, index = 0) {
      this.activeIndex = index;
      this.isCaptureListLoading = true;
      const res = await PersonGatherSrv.queryPersonList({ personId });
      if (res.code === 0) {
        const { faceList, count } = res.data;
        faceList.forEach((item) => {
          item.clusterType = this.clusterType;
        });
        this.personList = faceList;
        this.personListCount = count;
      } else {
        this.$message.error(this.$t('请求失败'));
      }
      this.isCaptureListLoading = false;
    },
    /*
    * 显示抓拍详情弹框
    * @param {info} 抓拍详情数据
    * @return
    * */
    showPersonDetail(info) {
      this.personDetailVisible = true;
      this.personDetailData = info;
    },
    exportResult() {
    },
    setResult() {

    }
  }
};
</script>
<style lang="scss" scoped>
::v-deep .meg-return-button{
  display: flex;
}
@mixin flex-center-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.gather-detail {
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  flex-direction: row;
}
.result-list {
  width: 320px;
  .result-list-header {
    display: flex;
    align-items: center;
    height: 56px;
    background: #efefef;
    padding: 0 20px;
    // @include flex-center-between;
  }
}
.result-list-content {
  padding: 0 20px;
  height: calc(100% - 91px);
  overflow: scroll;
  .header {
    height: 35px;
    line-height: 35px
  }
  .content {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    background-color: #fff;
    .person-image {
      cursor: pointer;
      height: 130px;
      width: 130px;
      margin-bottom: 9px;
      img {
        height: 130px;
        width: 130px;
      }
      &.active {
        border: 3px solid #5b98e7;
      }
    }
    .person-count {
      font-size: 14px;
      color: #435068;
      margin-bottom: 18px;
      .number {
        font-size: 18px;
        font-family: meg-number;
        margin-right: 5px;
      }
    }
  }
}
.result-detail {
  background-color: #dce1e5;
  height: 100%;
  padding-left: 16px;
  flex: 1;
  .result-detail-header {
    // @include flex-center-between;
    height: 56px;
    font-size: 14px;
    color: #435068;
    padding-right: 9px;
  }
  .result-detail-list {
    width: 100%;
    height: calc(100% - 56px);
    .list-item-wrap {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
    }
    .list-item {
      height: 160px;
      width: 160px;
    }
  }
}
</style>
<style lang="scss">
.result-list-header{
  .return-title{
    width: 130px;
  }
}
</style>
<style lang="scss">
.i18n-en-US {
  .gather-detail .meg-return-button .return-title{
    font-size: 14px;
    width: 140px !important;
  }
  .gather-detail .result-list-header{
    padding: 0 20px 0 0;
  }
}
</style>
