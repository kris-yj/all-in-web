<template>
  <div class="album-editor">
    <div class="album-select">
      <meg-select
        v-model="selectValue"
        :placeholder="$t('请选择')">
        <meg-option
          v-for="(item,index) in optionsData"
          :key="index"
          :label="item.name"
          :value="item.id"
          v-show="!item.hasSelected">
        </meg-option>
      </meg-select>
    </div>
    <div class="alarm-threshold">
      <span>{{ $t('阈值') }}</span>
      <div class="threshold-input">
        <meg-input-number
          :max="100"
          :controls="false"
          :min="1"
          v-model="threshold"></meg-input-number>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';

export default {
  name: 'AlbumMultiSelectorItem',
  props: {
    optionsData: {
      type: Array,
      default: () => [],
      required: true
    },
    defaultAlbum: {
      type: String,
      default: ''
    },
    defaultThreshold: {
      type: String,
      default: '0'
    }
  },
  data() {
    return {
      systemThreshold: '',
      threshold: 1,
      selectValue: '',
      oldItem: null,
      newItem: null
    };
  },
  watch: {
    selectValue(newVal, oldVal) {
      const vm = this;
      let lastItem = null;
      let curItem = null;
      if (!oldVal) lastItem = { id: '' };
      _.forEach(this.optionsData, (item) => {
        if (item.id === newVal) {
          curItem = item;
          vm.newItem = item;
        } else if (item.id === oldVal) {
          lastItem = item;
          vm.oldItem = item;
        }
        if (lastItem && curItem) {
          vm.$emit('selectChanged', {
            addItem: curItem,
            removeItem: lastItem
          }, vm.threshold);
          return false;
        }
        return true;
      });
    },
    threshold(val) {
      setTimeout(() => {
        if (!val) this.threshold = this.systemThreshold;
      }, 0);
      this.$emit('thresholdChanged', this.newItem, val);
    }
  },
  beforeDestroy() {
    this.$emit('selectChanged', {
      addItem: { id: '' },
      removeItem: this.newItem
    });
  },
  mounted() {
    const vm = this;
    let hasDefault = false;
    // 设置默认底库 默认底库传入的为底库信息id
    if (this.defaultAlbum) {
      _.forEach(this.optionsData, (item) => {
        if (item.id === this.defaultAlbum) {
          vm.selectValue = item.id;
          hasDefault = true;
          return false;
        }
        return true;
      });
    } else {
      _.forEach(this.optionsData, (item) => {
        if (!item.hasSelected) {
          vm.selectValue = item.id;
          return false;
        }
        return true;
      });
    }
    // 设置默认阈值
    if (hasDefault) { this.threshold = this.defaultThreshold; } else {
      this.systemThreshold = this.$store.getters.systemByType('threshold_alarm_monitor').value || 1;
      this.threshold = this.systemThreshold;
    }
  }
};
</script>

<style scoped lang="scss">
.album-editor {
  width: 100%;
  height: 34px;
}

.album-select {
  height: 34px;
  width: 160px;
  float: left;
}

.alarm-threshold {
  height: 34px;
  width: 137px;
  float: left;
  margin-left: 15px;
}

.alarm-threshold span {
  line-height: 34px;
}
.threshold-input {
  display: inline-block;
  width: 80px;
  height: 34px;
  margin-left: 10px;
}
.threshold-input .meg-input-number {
  width: 124px;
}
.i18n-en-US {
  .alarm-threshold {
    width: 157px;
    margin-left: 0px;
  }
  .alarm-threshold > span:first-of-type {
    margin-left: 11px;
  }
  .threshold-input .meg-input-number {
    width: 78px;
  }
}
</style>
