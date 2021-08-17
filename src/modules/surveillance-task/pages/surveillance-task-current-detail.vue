<template>
  <task-detail
    :history="false"
    :task-id="taskId"></task-detail>
</template>

<script>
import TaskDetail from '../components/task-detail';

export default {
  name: 'SurveillanceTaskCurrentDetail',
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

  <style scoped>
  </style>
