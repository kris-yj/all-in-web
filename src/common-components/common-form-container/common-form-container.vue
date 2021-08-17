<template>
  <div class="common-form-container">
    <div
      v-if="showHeader"
      class="header">
      <slot name="header">
        {{ headerText }}
      </slot>
    </div>
    <section
      v-if="showSearchOperate"
      class="search-operate">
      <slot name="title">
        <span class="title">{{ prompt }}</span>
      </slot>
      <span
        class="button"
        v-if="showButtons">
        <meg-button
          type="text"
          @click="reset"
          class="reset">
          重置
        </meg-button>
        <meg-button
          type="primary"
          @click="search"
          :disabled="searchDisabled"
          class="search">{{ buttonText }}
        </meg-button>
      </span>
    </section>
    <div
      :style="contentStyle"
      class="content">
      <slot></slot>
    </div>
  </div>
</template>
<script>
export default {
  name: 'CommonFormContainer',
  props: {
    showHeader: {
      type: Boolean,
      default: true
    },
    showButtons: {
      type: Boolean,
      default: true
    },
    showSearchOperate: {
      type: Boolean,
      default: true
    },
    headerText: {
      type: String,
      default: ''
    },
    searchDisabled: {
      type: Boolean,
      default: false
    },
    prompt: {
      type: String,
      default: '检索条件'
    },
    buttonText: {
      type: String,
      default: '检索'
    },
    contentStyle: {
      type: Object,
      default: () => ({ 'padding': '20px 25px 0px 25px' })
    }
  },
  methods: {
    search() {
      this.$emit('search');
    },
    reset() {
      this.$emit('reset');
    }
  }
};
</script>
<style lang="scss" scoped>
.common-form-container {
  display: flex;
  flex-direction: column;
  font-weight: 400;
  width: 320px;
  height: 100%;
  background: #fff;
  overflow-x: hidden;
  .header {
    flex: none;
    display: flex;
    align-items: center;
    height: 56px;
    font-size: 16px;
    font-weight: 700;
    color: #435068;
    background-color: #eee;
    padding-left: 20px;
    .returnButton {
      display: inline-flex;
    }
  }
  .search-operate {
    margin:0 25px;
    font-size:14px;
    border-bottom: 1px solid #f9f9f9;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 9px 0px;
    height: 36px;
    .title {
      font-weight: bold;
      color: #435068;
    }
    .search {
      padding: 10px 26px;
      font-weight: bold;
    }
    .reset {
      margin-right:6px;
    }
  }
  .content {
    overflow: auto;
    flex: 1;
  }
}
</style>
