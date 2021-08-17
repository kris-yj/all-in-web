<template>
  <div
    :class="{empty: isPie}"
    class="data-empty">
    <div
      v-if="isPie"
      class="pie">
      {{ $t("暂无数据") }}
    </div>
    <div
      v-else
      class="bar">
      {{ $t("暂无数据") }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isPie: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {

    };
  }
};
</script>

<style lang='scss' scoped>
.data-empty {
  width: 100%;
  height: calc(100% - 20px);
  background: #ffffff;
  position: absolute;
  top: 20px;
  left: 0;
  font-size: 14px;
  color: rgba(67,80,104,0.50);
}
.bar {
  position: absolute;
  width: calc(100% - 40px);
  height: calc(100% - 40px);
  background: #F9F9FB;
  top: 20px;
  left: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.pie {
  width: 100px;
  height: 100px;
  background: #ffffff;
  border-radius: 50%;
  border: 30px solid #F9F9FB;
  position: absolute;
  left: 50%;
  top: 50%;
  margin-top: -80px;
  margin-left: -80px;
  text-align: center;
  line-height: 100px;
}
</style>
