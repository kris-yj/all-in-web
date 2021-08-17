<template>
  <div class="export-list-select">
    <div class="select-header">
      <meg-checkbox
        :indeterminate="isIndeterminate"
        v-model="isCheckedAll"
        @change="onCheckAllClick">
        全选
      </meg-checkbox>
      <span>已选择{{ innerSelect.length }}条结果</span>
    </div>
    <div class="select-body">
      <meg-checkbox-group
        v-model="innerSelect"
        @change="onChange">
        <div
          class="select-item"
          v-for="(item,index) in selectItems"
          :key="index">
          <meg-checkbox
            :label="item.value">
            <div
              class="select-item-label"
              v-tooltip="true">
              {{ item.label }}
            </div>
          </meg-checkbox>
        </div>
      </meg-checkbox-group>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExportSelectList',
  model: {
    prop: 'selected',
    event: 'change'
  },
  props: {
    selected: {
      type: Array,
      default: () => ([])
    },
    selectOptions: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      innerSelect: [],
      selectItems: [],
      isCheckedAll: false
    };
  },
  computed: {
    isIndeterminate() {
      return this.innerSelect.length > 0 && this.innerSelect.length < this.selectItems.length;
    }
  },
  watch: {
    selected: {
      // immediate: true,
      handler() {
        this.innerSelect = this.selected;
        this.isCheckedAll = this.innerSelect.length === this.selectItems.length;
      }
    }
  },
  created() {
    this.selectItems = this.selectOptions.selects || [];
  },
  methods: {
    onChange(ret) {
      if (Array.isArray(ret)) {
        this.$emit('change', ret);
      }
    },
    onCheckAllClick(checkedAll) {
      if (checkedAll) {
        this.innerSelect = this.selectItems.map((item) => item.value);
      } else {
        this.innerSelect = [];
      }
      this.$emit('change', this.innerSelect);
    }
  }
};
</script>
<style lang="scss" scoped>
.export-list-select {
  width: 100%;
  height: 410px;
  display: flex;
  flex-direction: column;

  .select-header {
    flex: 1 1 50px;
    display: flex;
    align-items: center;
    padding: 0 13px;
  }

  .select-body {
    flex: 0 0 360px;
    border: 1px solid #dde0e6;
    padding: 5px 13px;
    overflow: auto;
  }

  .select-item {
    height: 38px;
    line-height: 38px;
  }

  .select-item-label {
    display: inline-block;
    vertical-align: middle;
    width: 630px;
  }
}
</style>
