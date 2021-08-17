<template>
  <div
    class="map-camera-select">
    <div class="left-trigger">
      <span
        class="frame-select"
        :class="{active: drawType === 'Box'}"
        @click.stop="handleSelectActions('Box')">
        <meg-icon
          name="frame_select"
          width="20"
          height="20"
          :color="'#94a9c9 #21539b white white'">
        </meg-icon>
        <span class="text">{{ $t("框选") }}</span>
      </span>
      <span
        class="circle-select"
        :class="{active: drawType === 'Circle'}"
        @click.stop="handleSelectActions('Circle')">
        <meg-icon
          name="Circle_default"
          width="21"
          height="21"
          :color="'#21539b #94a9c9 #21539b white'">
        </meg-icon>
        <span class="text">{{ $t("圈选") }}</span>
      </span>
      <span
        class="polygon-select"
        :class="{active: drawType === 'Polygon'}"
        @click.stop="handleSelectActions('Polygon')">
        <meg-icon
          name="polygon_default"
          width="21"
          height="21"
          :color="'#94a9c9 #21539b white white'">
        </meg-icon>
        <span class="text">{{ $t("多边形选") }}</span>
      </span>
    </div>
  </div>
</template>

<script>
export default {
  props: {

  },
  data() {
    return {
      drawType: ''
    };
  },
  methods: {
    /**
     * @param {String} type 'Box', 'Circle', 'Polygon'
     */
    setDrawType(type = '') {
      this.drawType = type;
    },
    handleSelectActions(type) {
      this.drawType = type;
      this.$emit('change', type);
    },
  }
};
</script>

<style lang='scss' scoped>
.map-camera-select {
  position: absolute;
  background: #fff;
  right: 90px;
  top: 10px;
  z-index: 1;
  width: 320px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.2);
  .left-trigger {
    line-height: 26px;
    flex: 1;
    display: flex;
    text-align: center;
    > span {
      padding: 10px 0;
      position: relative;
      &:after {
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        content: '';
        padding: 10px 0;
        border-right: 1px solid #dce1e5;
      }
      &:last-child{
        &:after {
          display: none;
        }
      }
      &.active{
        background-color: #e6f2ff;
      }
      .text {
        margin-left: 10px;
      }
    }
    .circle-select,
    .frame-select {
      width: 100px;
      cursor: pointer;
    }
    .polygon-select {
      flex: 1;
      cursor: pointer;
    }
  }
  .left-count {
    flex: 1;
    border-top: 1px solid #f3f3f3;
    display: flex;
    justify-content: space-between;
    padding: 0 16px;
    box-sizing: border-box;
    line-height: 40px;
    .list {
      position: relative;
      top: -1px;
      margin-left: 10px;
      cursor: pointer;
    }
  }
  .left-selected-wrap {
    border-top: 1px solid #f3f3f3;
  }
  .left-selected-content {
    max-height: 145px;
    line-height: 16px;
    box-sizing: border-box;
    padding: 2px 5px 5px 5px;
    overflow: hidden;
    .camera-tag {
      margin-right: 3px;
      margin-top: 3px;
    }
  }
}
</style>
