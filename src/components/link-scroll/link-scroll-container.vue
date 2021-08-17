<template>
  <div :class="['link-scroll-container', `link-scroll-${containerType}`]">
    <slot>
      <menu-render
        v-if="autoGenMenu&&renderContent"
        :description="renderContent"></menu-render>
    </slot>
  </div>
</template>
<script>
import MenuRender from './menu-render';
import { typeEnum, evtName } from './const';

const { genMenu, addContainer } = evtName;
export default {
  name: 'LinkScrollContainer',
  components: {
    MenuRender
  },
  provide() {
    return {
      containerType: this.containerType
    };
  },
  inject: ['scrollBox'],
  props: {
    type: {
      type: [String, Number],
      default: 'body'
    },
    autoMenu: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      renderContent: null,
    };
  },
  computed: {
    containerType() {
      return typeEnum[this.type];
    },
    autoGenMenu() {
      return this.type === typeEnum.menu && this.autoMenu;
    }
  },
  watch: {
    autoGenMenu: {
      handler(val) {
        if (val) {
          this.scrollBox.$off(genMenu, this.menuDataHandler);
          this.scrollBox.$on(genMenu, this.menuDataHandler);
        }
      },
      immediate: true
    },
  },
  mounted() {
    this.sendContainerInfo();
  },
  updated() {
    this.$nextTick(() => {
      // 最好是diff一下后代组件节点中link-scroll-item的情况，若有变化再执行sendContainerInfo方法，但目前大部分场景这么做复杂度较高
      this.sendContainerInfo();
    });
  },
  methods: {
    sendContainerInfo() {
      const checkVal = this.containerType;
      if (!checkVal) {
        console.error(this.$t('type值类型错误'));
        return;
      }
      this.scrollBox.$emit(addContainer, checkVal, this);
    },
    menuDataHandler(data) {
      if (!this.autoGenMenu) return;
      const getTextConf = (node, children = []) => ({ text: node.component.$el.firstChild.innerText, children });
      // node格式是 {component: vm, parent: node, children:[] }
      const getArrByNode = (node) => getTextConf(node, node.children.map(getArrByNode));
      this.renderContent = data.children.map(getArrByNode);
    },
  }
};
</script>
<style lang="scss" scoped>
.link-scroll-container{
  height: 100%;
  overflow-y: auto;
}
.link-scroll-menu::v-deep{
  .link-scroll-item{
    &.active{
      background-color: #ebf5ff;
    }
  }
}
</style>
