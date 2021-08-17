<template>
  <common-form-container
    class="task-directions"
    :show-search-operate="false"
    :content-style="{
      'padding': '0px 20px'
    }">
    <template
      slot="header">
      <span
        class="back-to-list"
        @click="toTaskList">
        <meg-icon name="arrow_left"></meg-icon>
        <span
          v-tooltip="true"
          class="task-name">{{ taskInfo.taskName }}</span>
      </span>
    </template>
    <div>
      <div
        class="operate">
        <span class="operate-title">{{ $t('任务详情') }}</span>
        <span>
          <meg-button
            v-if="permission"
            @click="$emit('edit-task')">{{ $t('编辑') }}</meg-button>
        </span>
      </div>
      <analysis-task-info
        type="file"
        :info-loading="infoLoading"
        :task-info="taskInfo"></analysis-task-info>
    </div>
  </common-form-container>
</template>
<script>
import commonFormContainer from '@/common-components/common-form-container';
import { switchToModule } from '@/utils/utils';
import AnalysisTaskInfo from './analysis-task-info';

export default {
  components: {
    commonFormContainer,
    AnalysisTaskInfo
  },
  props: {
    taskInfo: {
      type: Object,
      default: () => {}
    },
    infoLoading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
    };
  },
  computed: {
    permission() {
      return this.$store.getters.modulePermissonsByAlias('file-analysis').length;
    },
  },
  methods: {
    toTaskList() {
      switchToModule({
        module: 'file-analysis'
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.task-directions{
  .back-to-list{
    cursor: pointer;
    display: flex;
    align-items: center;
    width: 100%;
    .meg-icon {
      flex: none;
    }
    .task-name{
      margin-left: 15px;
    }
  }
  .operate{
    font-size: 14px;
    border-bottom: 1px solid #f9f9f9;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 9px 0;
    .operate-title{
      font-weight: 700;
      color: #435068;
    }
  }
}
</style>
