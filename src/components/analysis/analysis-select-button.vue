<template>
  <div
    class="alarm-select-button">
    <span class="select-button-icon">
      <meg-icon
        name="camera_normal"
        width="16"
        color="#435068 #ffffff"
        height="16"></meg-icon>
    </span>
    <span class="select-button-label">相机{{ count }}个</span>
    <span
      class="select-button-arrow">
      <meg-icon
        name="library"
        width="12"
        dir="down"
        color="#21539b"></meg-icon>
    </span>
  </div>
</template>

<script>
export default {
  name: 'AlarmSelectButton',
  props: {
    count: {
      default: 0,
      type: Number
    }
  }
};
</script>

<style scoped lang="scss">
.alarm-select-button {
  display: flex;
  align-items: center;
  width: 220px;
  height: 40px;
  padding: 0 16px;
  font-size: 14px;
  background: #fff;
  cursor: pointer;
  border: 1px solid #dddddd;
  border-radius: 2px;
  box-sizing: border-box;
  transition: all 0.3s;
  z-index: 3;
  position: relative;

  &:hover {
    border-color: #c0c4cc;
  }

  &.active {
    border-color: #21539b;
  }

  .select-button-icon {
    flex: 0 0 20px;
  }

  .select-button-label {
    flex: 1;
    color: #435068;
    user-select: none;
    margin-left: 3px;
  }

  .select-button-arrow {
    flex: 0 0 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.arrow-down {
  float: right;
  transform: rotate(90deg);
  transition: 0.2s;
  transform-origin: 50% 50%;
}
.arrow-up {
  float: right;
  transform: rotate(270deg);
  transform-origin: 50% 50%;
  transition: 0.2s;
}
</style>
