<template>
  <div class="img-viewer">
    <div
      v-if="selfSize.width && size && size.width"
      class="img-container"
      :style="containerStyles">
      <img
        v-if="src"
        :src="src" />
      <slot></slot>
    </div>
  </div>
</template>
<script>
export default {
  name: 'ImgViewer',
  props: {
    src: {
      type: String,
      default: ''
    },
    size: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      selfSize: { width: 0, height: 0 }
    };
  },
  computed: {
    containerStyles() {
      const { width: imgWidth, height: imgHeight } = this.size;
      const { width, height } = this.selfSize;
      const paneRatio = width / height;
      const imgRatio = imgWidth / imgHeight;
      const styles = imgRatio > paneRatio ? { width: '100%', height: `${width / imgRatio}px` } : { width: `${height * imgRatio}px`, height: '100%' };
      return styles;
    }
  },
  mounted() {
    Object.assign(this.selfSize, { width: this.$el.offsetWidth, height: this.$el.offsetHeight });
  },
  methods: {

  }
};
</script>
<style lang="scss" scoped>
.img-viewer {
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAAA3NCSVQICAjb4U/gAAAABlBMVEXMzMz////TjRV2AAAACXBIWXMAAArrAAAK6wGCiw1aAAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M26LyyjAAAABFJREFUCJlj+M/AgBVhF/0PAH6/D/HkDxOGAAAAAElFTkSuQmCC");
  .img-container {
    position: relative;
    img {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
