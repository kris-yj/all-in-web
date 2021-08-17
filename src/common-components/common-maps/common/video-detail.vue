<template>
  <div
    class="video-box">
    <meg-stream-player
      :socket-url="videoInfo.url"
      :title="videoInfo.name"
      @close="closeVideo">
    </meg-stream-player>
  </div>
</template>

<script>
export default {
  props: {
    videoInfo: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {

    };
  },
  methods: {
    closeVideo() {
      this.$emit('close');
    }
  }
};
</script>

<style lang='scss' scoped>
.video-box{
  width: 600px;
  height: 400px;
  position: absolute;
  left: 50%;
  top: 50%;
  margin-left: -300px;
  margin-top: -200px;
  z-index: 1111;
}
</style>
