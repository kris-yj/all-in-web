<template>
  <div class="task-control-wrap">
    <div
      class="task-control"
      @click="analysisControlClick">
      <meg-icon
        name="videoAnalysis_menu"
        color="#435068"></meg-icon>
      <div
        class="control-msg">
        录像解析任务{{ taskList.length }}个
      </div>
      <meg-icon
        name="library"
        color="#21539B"></meg-icon>
    </div>
    <div
      v-show="isShowMapAnaylysis"
      class="analysis-value-box">
      <div
        class="value-title"
        @click="jumpTo">
        前往录像解析>
      </div>
      <div
        class="item-box"
        v-background="taskList.length > 0 ? false: {icon:'icon_2',text:$t('检索无结果')}">
        <div
          v-for="(item, key) of taskList"
          :key="key"
          class="value-item">
          <div>
            <div class="item-name">
              {{ item.taskName }}
            </div>
            <div
              class="item-msg">
              <meg-icon
                name="time_fill"
                color="#D1D5DD"></meg-icon>
              <span class="item-msg-time">
                {{ item.createTime | formatTime('YYYY-MM-DD HH:mm') }}
              </span>
              <div class="icon-box">
                <meg-icon
                  class="item-icon"
                  v-for="(icon, i) in icons"
                  v-show="!!item[icon.type]"
                  :key="i"
                  :name="icon.name"
                  color="#DCE1E5"></meg-icon>
              </div>
            </div>
          </div>
          <meg-progress
            class="value-progress"
            type="circle"
            status="text"
            color="#21539B"
            :stroke-width="3"
            :percentage="parseFloat(item.progress)"
            :width="24"
            @click.native="analysisTaskControl(item)">
            <!-- relatime-contorl -->
            <meg-icon
              :name="controlStatus(item.status)"
              color="#21539B"></meg-icon>
          </meg-progress>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { switchToModule } from '@/utils/utils';
import pathTraceSrv from '../path-trace.service';

export default {
  props: {
    camerasId: {
      type: Array,
      default: () => []
    },
    visible: {
      type: Boolean,
    },
  },
  data() {
    return {
      isShowMapAnaylysis: false,
      taskList: [],
      icons: [
        {
          name: 'card_face',
          color: '#435068',
          type: 'doFace'
        },
        {
          name: 'person',
          color: '#435068',
          type: 'doBody'
        },
        {
          name: 'car',
          color: '#DCE1E5',
          type: 'doMotor'
        },
        {
          name: 'non_motor_vehicle',
          color: '#435068',
          type: 'doNonMotor'
        },
      ],
    };
  },
  watch: {
    visible(val) {
      if (val) this.isShowMapAnaylysis = false;
    }
  },
  methods: {
    controlStatus(code) {
      let name = '';
      if (code === 1) name = 'mission_stop';
      else if (code === 3) name = 'arrow_solid';
      return name;
    },
    analysisControlClick() {
      this.isShowMapAnaylysis = !this.isShowMapAnaylysis;
    },
    jumpTo() {
      switchToModule({
        module: 'videotape-analysis',
        query: {
        },
        isBlank: true,
        pageType: 'single'
      });
    },
    async analysisTaskControl(item) {
      // item === 3 已暂停
      // 0，1 等待中/进行中
      if (item.status === 3) {
        await this.batchTaskResume(item);
        await this.getBatchTask();
      } else if (item.status === 1) {
        await this.batchTaskPause(item);
        await this.getBatchTask();
      }
    },
    // 暂停
    batchTaskPause(item) {
      const params = {
        batchTaskIds: [item.batchTaskId]
      };
      return pathTraceSrv.batchTaskPause(params).then((res) => {
        if (res.code === 0) {
          this.$message.success('暂停成功');
        }
      });
    },
    // 恢复
    batchTaskResume(item) {
      const params = {
        batchTaskIds: [item.batchTaskId]
      };
      return pathTraceSrv.batchTaskResume(params).then((res) => {
        if (res.code === 0) {
          this.$message.success('恢复成功');
        }
      });
    },
    getBatchTask() {
      const params = {
        cameraIds: this.camerasId,
        status: [0, 1, 3]
      };
      return pathTraceSrv.getBatchTask(params).then((res) => {
        if (res.code === 0) {
          this.taskList = res.data.records;
        }
      });
    }
  }
};
</script>
<style lang='scss' scoped>
.task-control-wrap {
  div {
    box-sizing: border-box;
  }
  .task-control {
    width: 280px;
    height: 40px;
    padding: 0 20px;
    background: #FFFFFF;
    border: 1px solid #D2D6DE;
    box-shadow: 2px 2px 4px 0 rgba(0,0,0,0.10);
    border-radius: 2px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    cursor: pointer;
    .control-msg{
      flex: 1;
      text-align: left;
      padding-left: 6px;
      font-family: SourceHanSansCN-Regular;
      font-size: 14px;
      color: #435068;
    }
  }
  .analysis-value-box{
    width: 280px;
    height: 428px;
    background: #FFFFFF;
    border: 1px solid #D2D6DE;
    box-shadow: 2px 2px 6px 0 rgba(0,0,0,0.12);
    border-radius: 2px;
    .value-title {
      cursor: pointer;
      font-family: SourceHanSansCN-Regular;
      font-size: 14px;
      color: #21539B;
      padding: 20px 5px 20px 20px;
    }
    .item-box {
      height: calc(100%-54px);
      padding: 0 15px;
      overflow: scroll;
    }
    .value-item {
      display: flex;
      margin-bottom: 20px;
      .item-name {
        font-family: SourceHanSansCN-Regular;
        font-size: 14px;
        color: #435068;
        letter-spacing: 0;
      }
      .item-msg {
        height: 24px;
        line-height: 24px;
        font-family: SourceHanSansCN-Regular;
        font-size: 12px;
        color: #999999;
        .item-msg-time{
          padding: 0 11px 0 6px;
        }
      }
      .icon-box {
        width: 65px;
        display: inline-block;
      }
      .item-icon {
        margin-right: 2px;
      }
      .value-progress {
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-left: 4px;
      }
    }
  }
}

</style>
