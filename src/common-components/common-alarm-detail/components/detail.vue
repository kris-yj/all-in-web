<template>
  <div class="content-box">
    <div class="left-content">
      <div class="left-top">
        <component
          :info="info"
          :append-to-body="appendToBody"
          :is="info.leftTop"></component>
      </div>
      <div class="left-bottom">
        <information
          :info="info"></information>
      </div>
    </div>
    <div class="right-content">
      <tab-group
        @move-deploy="onMoveDeploy"
        :info="info"></tab-group>
    </div>
  </div>
</template>

<script>
import Information from './information';
import TabGroup from './tab-group';

export default {
  name: 'Detail',
  components: {
    ThreeImage: () => import('./left-top/three-image'),
    TwoImage: () => import('./left-top/two-image'),
    OneImage: () => import('./left-top/one-image'),
    Information,
    TabGroup,
  },
  props: {
    info: {
      type: Object,
      default: () => {},
    },
    appendToBody: {
      type: Boolean,
      default: true
    },
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  methods: {
    onMoveDeploy() {
      this.$emit('move-deploy');
    },
  },
};
</script>
<style lang="scss" scoped>
.content-box {
    height: 486px;
    display: flex;
    .right-content {
      width: 320px;
    }
    .left-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      .left-top{
        height: 291px;
        padding-top: 11px;
        box-sizing: border-box;
      }
      .left-bottom {
        flex: 1
      }
    }
  }
</style>
