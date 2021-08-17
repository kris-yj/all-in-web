<template>
  <div class="logo-footer">
    <span>©2011-{{ new Date().getFullYear() }}&nbsp;&nbsp;北京旷视科技有限公司&nbsp;&nbsp;京ICP备12036813号</span>
  </div>
</template>

<script>

export default {
  components: {
  },
  data() {
    return {
    };
  },
  created() {
  },
  methods: {
  }
};
</script>

<style scoped>
  .logo-footer {
    text-align: center;
    color: #80b0f2;
    font-size: 14px;
    position: absolute;
    width: 100%;
    height: 20px;
    bottom: 3%;
  }
</style>
