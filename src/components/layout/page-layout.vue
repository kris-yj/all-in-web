<!--- 供module/pages的页面组件使用的layout组件 --->
<template>
  <div class="page-layout">
    <!-- 头部 -->
    <page-header
      v-if="this.$store.state.pageType === 'single'"
      :show-immidately="showImmidately">
      <!-- 头部左侧 title -->
      <template v-slot:headerTitle>
        <div
          v-if="isShowInnerLogo"
          class="split-line"></div>
        <slot name="headerTitle">
          <div> {{ defaultPageTitleName }} </div>
          <operating-instructions>
          </operating-instructions>
        </slot>
      </template>
      <!-- 头部中间内容区 -->
      <template v-slot:headerContent>
        <slot name="headerContent"></slot>
      </template>
      <template v-slot:headerActions>
        <user-info class="action"></user-info>
      </template>
    </page-header>
    <!-- 页面内容区域 -->
    <div class="page-content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import UserInfo from '@/components/user-info/user-info';
import PageHeader from './header';
import OperatingInstructions from './operating-instructions.vue';

export default {
  components: {
    PageHeader,
    UserInfo,
    OperatingInstructions
  },
  props: {
    showImmidately: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
    };
  },
  computed: {
    isShowInnerLogo() {
      const { value } = this.$store.getters.systemByType('showInnerLogo');
      return value === 'true' || value === true;
    },
    defaultPageTitleName() {
      return (this.$store.state.currentModule && this.$store.state.currentModule.name) || '';
    }
  },
};
</script>

<style lang="scss">
.page-layout {
  display: flex;
  height: 100%;
  width: 100%;
  min-height: 0;
  overflow: hidden;
  flex-direction: column;
  .split-line {
    width: 1px;
    height: 14px;
    margin: 0 10px;
    background: #ffffff;
    opacity: 0.5;
  }
  .page-content {
    flex: 1;
    background: #ffffff;
    overflow: auto;
  }
}
</style>
