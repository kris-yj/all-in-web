<template>
  <task-detail
    :history="true"
    :task-id="taskId"></task-detail>
</template>

<script>
import TaskDetail from '../components/task-detail.vue';

export default {
  name: 'SurveillanceTaskHistoryDetail',
  components: {
    TaskDetail
  },
  data() {
    return {
      // 由列表页面带过来的数据
      taskId: this.$route.params.taskId,
    };
  }
};
</script>
