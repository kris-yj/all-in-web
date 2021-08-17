<template>
  <div
    @mouseenter.stop="handleMouseenter"
    @mouseleave.stop="handleMouseleave"
    @click.stop="handleClick"
    class="capture-hover-items">
    <meg-icon
      :width="iconWidth"
      :height="iconHeight"
      :name="triggerIcon"
      :rotate="rotate"></meg-icon>
    <target-list
      ref="targetList"
      :visible="showList"
      :params="params"
      :prev-items="prevItems"
      :next-items="nextItems"
      :extra-query="extraQuery"
      :handle-jump-map="handleJumpMap"
      :append-album="appendAlbum"
      :do-deploy="doDeploy"
      :custom-target-list="customTargetList"
      :exclude-common-use="excludeCommonUse"
      @mouseleave.stop="handleListMouseleave"
      @handle-compare="handleCompare"
      @size-change="sizeChange"></target-list>
  </div>
</template>
<script>
import TargetList from './target-list';

export default {
  name: 'CommonJumpWithImg',
  components: {
    TargetList
  },
  props: {
    // 排除抓拍检索和人脸身份
    excludeCommonUse: {
      type: Boolean,
      default: false
    },
    // 自定义携图跳转列表
    customTargetList: {
      type: Array,
      default: () => []
    },
    /**
     * 集成加入底库
     */
    appendAlbum: {
      type: Object,
      default: () => ({})
    },
    /**
     * 集成一键布控
     */
    doDeploy: {
      type: Object,
      default: () => ({})
    },
    // 触发的icon显示
    triggerIcon: {
      type: String,
      default: 'faceSearch_menu'
    },
    rotate: {
      type: Number,
      default: 0
    },
    iconWidth: {
      type: String,
      default: '16'
    },
    iconHeight: {
      type: String,
      default: '16'
    },
    /**
     * 触发的事件类型：hover, click
     */
    trigger: {
      type: String,
      default: 'hover',
      validator(v) {
        return ['click', 'hover'].includes(v);
      }
    },
    ...TargetList.props
  },
  data() {
    return {
      showList: false
    };
  },
  computed: {
    triggerHover() {
      return this.trigger === 'hover';
    },
    triggerClick() {
      return this.trigger === 'click';
    }
  },
  methods: {
    handleItemClick(alias, goAnalyze = false, params) {
      const { targetList } = this.$refs;
      if (targetList) {
        targetList.handleItemClick({
          alias
        }, goAnalyze, params);
      }
    },
    sizeChange(size) {
      this.$emit('size-change', size);
    },
    handleCompare() {
      this.$emit('handle-compare');
    },
    handleMouseenter() {
      if (this.triggerHover) {
        this.showListPopup();
      }
    },
    handleMouseleave() {
      if (this.triggerHover) {
        this.hideListPopup();
      }
    },
    handleClick() {
      if (this.triggerClick) {
        this.showListPopup();
      }
    },
    handleListMouseleave() {
      if (this.triggerClick) {
        this.hideListPopup();
      }
    },
    showListPopup() {
      this.showList = true;
      this.$emit('toggle-list', true);
    },
    hideListPopup() {
      this.showList = false;
      this.$emit('toggle-list', false);
    }
  },
};
</script>
<style lang="scss" scoped>
.capture-hover-items {
  position: absolute;
  top: 14px;
  right: 10px;
  height: 40px;
  cursor: pointer;
  .meg-icon {
    display: block;
    padding: 3px;
    color: #fff;
    border-radius: 1px;
    background-color: rgba(134, 154, 187, 0.8);
    transition: background-color 0.3s;
  }
  &:hover {
    .meg-icon {
      background: #21539b;
    }
  }
}
</style>
<style lang="scss">
.jump-with-img-panel {
  padding: 0;
  min-width: 120px;
}
</style>
