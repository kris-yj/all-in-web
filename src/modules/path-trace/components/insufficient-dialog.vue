<template>
  <meg-dialog
    class="insufficient-dialog"
    title="算力不足"
    :visible="dialogVisible"
    @close="closeDialog"
    width="480px">
    <div class="dialog-content">
      <div class="content-top">
        <div class="top-message">
          <span class="task-title-text">还需要</span>
          <span class="message-number">{{ hashrate - remainVideoPower }}</span>
          <span class="task-title-text">路算力</span>
        </div>
        <div class="message-tip">
          剩余算力不足，建议暂停部分解析任务
        </div>
      </div>
      <div class="task-box">
        <div class="task-tip">
          暂停任务越多，解析速度越快
        </div>
        <div
          class="task-card"
          v-for="(item, ind) of analysisMsg"
          :key="ind">
          <div class="task-title">
            <div class="task-title-text">
              {{ item.name }}
            </div>
            <div
              class="task-title-link"
              @click="jumpToMudule(item)">
              {{ item.text }} >
            </div>
          </div>
          <div class="task-status">
            <div class="task-status-style">
              <span class="task-status-title">正在进行中</span>
              <span class="task-status-number">{{ item.runningCount }}</span>
            </div>
            <div class="task-status-style">
              <span class="task-status-title">等待中</span>
              <span class="task-status-number">{{ item.waitingCount }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </meg-dialog>
</template>

<script>
import { switchToModule } from '@/utils/utils';
import pathTraceSrv from '../path-trace.service';

export default {
  props: {
    dialogVisible: {
      type: Boolean,
    },
    remainVideoPower: {
      type: Number,
      default: 0
    },
    hashrate: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      analysisMsg: [
        {
          name: this.$t('实时解析任务'),
          text: this.$t('前往实时解析'),
          alias: 'realtime-analysis'
        },
        {
          name: this.$t('录像解析任务'),
          text: this.$t('前往录像解析'),
          alias: 'videotape-analysis'
        },
        {
          name: this.$t('文件解析任务'),
          text: this.$t('前往文件解析'),
          alias: 'file-analysis'
        },
      ]
    };
  },
  watch: {
    dialogVisible(val) {
      if (val) {
        const historyBatchTask = pathTraceSrv.historyBatchTask();
        const realtime = pathTraceSrv.realtime();
        const fileBatchTask = pathTraceSrv.fileBatchTask();
        Promise.all([realtime, historyBatchTask, fileBatchTask]).then((res) => {
          console.log(res);
          this.analysisMsg = this.analysisMsg.map((item, ind) => {
            item.waitingCount = res[ind].data.waitingCount;
            item.runningCount = res[ind].data.runningCount;
            return item;
          });
          console.log(this.analysisMsg);
        });
      }
    }
  },
  methods: {
    closeDialog() {
      this.$emit('close-insufficient-dialog');
    },
    jumpToMudule(item) {
      switchToModule({
        module: item.alias,
        query: {},
        isBlank: true,
        pageType: 'single'
      });
    }
  }
};
</script>
<style lang='scss' scoped>
.insufficient-dialog {
  div {
    box-sizing: border-box;
  }
  .dialog-content{
    padding: 0px 0px 60px;
  }
  .task-tip {
    font-family: SourceHanSansCN-Regular;
    font-size: 12px;
    color: #43506880;
  }
  .task-card {
    background: #FFFFFF;
    border: 1px solid #D2D6DE;
    border-radius: 2px;
    padding: 20px;
    margin-top: 10px;
  }
  .content-top {
    padding-bottom: 30px;
    .top-message{
      display: flex;
      justify-content: center;
      align-items: center;
      .message-number {
        display: inline-block;
        font-family: HEMIHEAD;
        font-size: 60px;
        color: #F05353;
        letter-spacing: 0;
        padding: 0 20px;
      }
    }
    .message-tip {
      text-align: center;
    }
  }
  .task-title{
    position: relative;
    margin-bottom: 18px;
    .task-title-text {
      font-family: SourceHanSansCN-Bold;
      font-size: 14px;
      color: #435068;
      letter-spacing: 0;
    }
    .task-title-link{
      font-family: SourceHanSansCN-Regular;
      font-size: 14px;
      color: #21539B;
      position: absolute;
      right: 0;
      top: 0;
      cursor: pointer
    }
  }
  .task-status {
    display: flex;
    .task-status-style{
      display: flex;
      justify-content: center;
      align-items: center;
      margin-right: 34px;
    }
    .task-status-title{
      font-family: SourceHanSansCN-Regular;
      font-size: 14px;
      color: rgba(67,80,104,0.50);
      letter-spacing: 0;
      text-align: right;
      margin-right: 6px;
    }
    .task-status-number {
      font-family: HEMIHEAD;
      font-size: 24px;
      color: #435068;
      letter-spacing: 0;
    }
  }
}
</style>
