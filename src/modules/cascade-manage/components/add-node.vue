<template>
  <div
    class="outline"
    @click.stop="onClick">
    <!-- <meg-icon
      style="margin-bottom:10px"
      name="new"
      width="20px"
      height="20px"
      color="#A6BAD7">
    </meg-icon> -->
    <span style="font-size:25px;margin-bottom:10px">+</span>
    <span>{{ $t('新建') }}</span>
    <div
      class="tooltip"
      v-if="hasTooltip">
      {{ $t('暂无节点，请创建第一个节点') }}
    </div>
  </div>
</template>
<script>
export default {
  name: 'AddNode',
  props: {
    hasTooltip: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    onClick() {
      this.$emit('click-add');
    }
  }
};
</script>
<style lang="scss" scoped>
.outline {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 80px;
  width: 120px;
  background: #f7f8f9;
  border: 1px dashed #d2d6de;
  font-size: 14px;
  color: #999999;
  user-select: none;
  cursor: pointer;

  span {
    display: inline-block;
    font-size: 14px;
  }

  .tooltip {
    position: absolute;
    top: 90px;
    font-size: 14px;
    color: #999999;
    width: max-content;
  }

  &:hover {
    background-image: linear-gradient(179deg, #d1e4ff 0%, #ecf7fa 100%);
    border: 1px dashed #a6bad7;
    box-shadow: 2px 2px 4px rgba(33, 83, 155, 0.2);

    span {
      color: #435068;
    }
  }
}
</style>
