<template>
  <div class="album-multi-selector">
    <template v-if="albumItemsArray.length">
      <div
        class="album-multi-selector-list"
        v-for="(item,index) in albumItemsArray"
        :key="item.renderId">
        <div class="album-multi-selector-editor">
          <album-multi-selector-item
            :options-data="optionsData"
            :default-album="item.album"
            :default-threshold="item.threshold"
            @selectChanged="onSelectChanged"
            @thresholdChanged="onThresholdChanged">
          </album-multi-selector-item>
        </div>
        <div class="album-multi-selector-control">
          <span
            class="plus-icon"
            @click="onAddAlbum"
            v-if="isShowPlusIcon(index)">
            <meg-icon
              name="plus"
              width="10"
              height="10"
              color="#ffffff"></meg-icon>
          </span>
          <span
            @click="onRemoveAlbum(index)"
            v-if="isShowMinusIcon(index)"
            class="minus-icon">
            <meg-icon
              name="circle_del"
              width="14"
              height="14"
              color="red white"></meg-icon>
          </span>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="album-editor">
        <div class="album-select">
          <meg-select
            v-model="selectValue"
            :placeholder="$t('请选择')">
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
  </div>
</template>

<script>
import guid from '../../mixins/guid';
import AlbumMultiSelectorItem from './album-multi-selector-item.vue';

export default {
  name: 'AlbumMultiSelector',
  components: {
    AlbumMultiSelectorItem
  },
  mixins: [guid],
  props: {
    optionsData: {
      type: Array,
      default: () => [],
      required: true
    },
    // 默认选择列表
    defaultSelect: {
      type: Array,
      default: () => []
    },
    // 最大可选项数
    maxSelectNum: {
      type: Number,
      default: 999
    }
  },
  data() {
    return {
      albumItemsArray: [],
      albumSelectSet: new Set(),
      threshold: '',
      selectValue: '',
    };
  },
  watch: {
    defaultSelect() {
      this.updateSelect();
    },
    albumItemsArray(newV) {
      if (newV.length === 0) {
        this.$emit('selectChanged', []);
      }
    }
  },
  mounted() {
    this.updateSelect();
    const systemThreshold = this.$store.getters.systemByType('threshold_alarm_monitor').value || 1;
    this.threshold = systemThreshold;
  },
  methods: {
    /**
     * 更新选择项
     */
    updateSelect() {
      const vm = this;
      if (this.optionsData.length > 0) {
        if (this.defaultSelect.length > 0) {
          // 过滤无权限的或者删除的底库记录
          const validateAlbums = this.optionsData.map((item) => item.id);
          const albumArray = [];
          this.defaultSelect.forEach((item) => {
            if (validateAlbums.indexOf(item.id) >= 0) {
              albumArray.push({
                renderId: vm.createGuid('render'),
                album: item.id,
                threshold: item.threshold
              });
            }
          });
          // 如果一条匹配记录也不存在，则按照无默认选择值进行处理
          this.albumItemsArray = albumArray.length > 0 ? albumArray : [{ renderId: this.createGuid('render') }];
        } else {
          this.albumItemsArray.push({
            renderId: this.createGuid('render')
          });
        }
      }
    },
    /**
     * 是否显示添加图标
     */
    isShowPlusIcon(index) {
      if (this.albumItemsArray.length === 0) {
        return true;
      } if (index === this.albumItemsArray.length - 1) {
        if (
          index === this.optionsData.length - 1
          || index === this.maxSelectNum - 1
        ) { return false; }
        return true;
      }
      return false;
    },
    /**
     * 是否显示删除图标
     */
    isShowMinusIcon() {
      if (this.albumItemsArray.length <= 1) {
        return false;
      }
      return true;
    },
    // 增加底库选择响应事件
    onAddAlbum() {
      this.albumItemsArray.push({
        renderId: this.createGuid('render')
      });
    },
    // 删除底库选择响应事件
    onRemoveAlbum(index) {
      this.albumItemsArray.splice(index, 1);
    },
    // 底库选择更改响应事件
    onSelectChanged({ addItem, removeItem }, threshold) {
      if (addItem.id) {
        addItem.threshold = threshold;
        this.$set(addItem, 'hasSelected', true);
        this.albumSelectSet.add(addItem);
      }
      if (removeItem.id) {
        this.$set(removeItem, 'hasSelected', false);
        this.albumSelectSet.delete(removeItem);
      }
      this.$emit('selectChanged', Array.from(this.albumSelectSet));
    },
    // 阈值更改响应事件
    onThresholdChanged(item, threshold) {
      item.threshold = threshold;
      this.$emit('selectChanged', Array.from(this.albumSelectSet));
    }
  }
};
</script>
<style lang="scss" scoped>
.album-multi-selector-list {
  height: 34px;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  margin-bottom: 5px;
  align-items: stretch;
}

.album-multi-selector-editor {
  width: 350px;
  padding-right: 10px;
  box-sizing: border-box;
  flex: 1 1 auto;
  flex-grow: 0;
}

.album-multi-selector-control {
  // flex: 0 0 54px;
  // padding-top: 10px;
  // padding-left: 10px;
  // box-sizing: border-box;
  // display: inline-flex;
  // justify-content: center;
  width: 40px;
  height: 24px;
  float: left;
}

.plus-icon {
  width: 14px;
  height: 14px;
  margin-right: 5px;
  border-radius: 50%;
  cursor: pointer;
  background: #99bc6f;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}
.minus-icon {
  display: inline-block;
  cursor: pointer;
  width: 14px;
  height: 14px;
}
.album-multi-selector {
  .album-editor {
    width: 100%;
    height: 34px;
    margin-bottom: 5px;
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
    padding-left: 15px;
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
}
.i18n-en-US {
  .album-multi-selector {
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
}
</style>
