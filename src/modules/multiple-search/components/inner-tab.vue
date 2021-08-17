<template>
  <!-- 检索类别 切换 -->
  <div
    class="inner__tab">
    <div
      class="inner__tab-item"
      v-for="item in items"
      :class="{'active': item.code===value}"
      @click="$emit('change', item.code)"
      :key="item.code">
      <span>{{ item.name }}</span>
    </div>
  </div>
</template>

<script>

export default {
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    // 当前项
    value: {
      type: null,
      default: undefined,
    },
    horizontal: {
      type: Boolean,
      default: false,
    },
    items: {
      type: Array,
      default: () => [
      ],
    }
  },
  data() {
    return {
    };
  },
  computed: {
  }
};
</script>

<style lang="scss" scoped>
.inner__tab{
  display: flex;
}
.inner__tab-item{
  padding: 13px 16px;
  cursor: pointer;
  line-height: 1em;
  transition: all .2s cubic-bezier(.645,.045,.355,1);
  margin-left: 28px;
  &:first-child{
    margin-left: 0;
  }
  &:hover{
    color: #21539B;
    font-weight: bold;
  }

}
.inner__tab-item.active{
  font-weight: bold;
  color: #21539B;
  background: #F2F4F8;
}

</style>
