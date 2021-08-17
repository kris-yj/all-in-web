<template>
  <meg-popover
    placement="left-end"
    popper-class="scene-select-popover"
    :width="230"
    trigger="hover"
    :visible-arrow="false"
    :open-delay="0"
    :offset="0">
    <div class="scene-edit">
      <div
        class="scene-name"
        v-tooltip="true">
        {{ sceneName }}
      </div>
      <meg-button
        class="meg__button__icon"
        type="primary"
        @click="onClickSceneChange">
        {{ $t('查看') }}
      </meg-button>
    </div>
    <span
      slot="reference">
      <div class="scene-icon">
        <meg-icon
          name="img"
          width="20px"
          height="20px"
          :color="selected?'#D9EBFD':'#21539B'">
        </meg-icon>
      </div>
    </span>
  </meg-popover>
</template>
<script>
export default {
  name: 'MapSceneSelect',
  props: {
    scene: {
      type: Object,
      default: () => ({})
    },
    selected: {
      type: Boolean,
      default: false
    },
    sceneName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {};
  },
  mounted() {
  },
  methods: {
    // 场景变更
    onClickSceneChange() {
      this.$emit('scene-change', this.scene);
    }
  }
};
</script>
<style scoped>
  .scene-icon{
    display: flex;
    justify-content: center;
    align-items: center;
    width: 34px;
    height: 34px;
  }
  .scene-name{
    width: 170px;
    height: 34px;
    line-height: 34px;
  }
</style>

<style>
  .scene-select-popover[x-placement^="left"]{
    margin-right:0;
  }
  .scene-select-popover{
    padding:0;
  }
  .scene-select-popover button.meg-button.meg__button__icon{
    padding:7.5px 9.5px;
  }
  .scene-select-popover .meg-button + .meg-button {
      margin-left: 0;
  }
  .scene-select-popover .scene-edit{
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
  }
</style>
