<template>
  <meg-dialog
    :visible="visible"
    :title="$t('导出设置')"
    :append-to-body="true"
    width="800px"
    @close="onClickCancel">
    <div class="export-setting-wrapper">
      <div class="remained-wrapper">
        <div>
          <span class="field-type">{{ $t('剩余字段') }}</span>
          <span class="field-tip">{{ $t('点击选择字段') }}</span>
        </div>
        <div class="remained-box">
          <div
            v-for="(obj,i) in destRemained"
            :key="i"
            class="remained-box-line">
            <div
              class="cate-name"
              v-if="obj.name && category">
              <span>{{ obj.name }}</span>
            </div>
            <div class="cate-content">
              <span
                class="remained-item"
                v-for="(item,index) in obj.list"
                :key="index"
                @click="chooseItem(index,i)">
                {{ item.value }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="chosen-wrapper">
        <div>
          <span class="field-type">{{ $t('已选字段') }} </span>
          <span class="field-tip">{{ $t('拖拽字段调整导出列表项顺序，单击取消选择') }}</span>
        </div>
        <div class="chosen-box">
          <vue-draggable
            v-model="destChosen"
            @start="()=>{}"
            @end="()=>{}">
            <transition-group>
              <span
                class="chosen-item"
                v-for="(item,index) in destChosen"
                @click="resetItem(item,index)"
                :key="item.value.code">
                {{ item.value.value }}
              </span>
            </transition-group>
          </vue-draggable>
        </div>
        <div
          v-if="!destChosen.length"
          class="export-error-tip">
          {{ $t('请选择导出字段') }}
        </div>
      </div>
    </div>
    <template v-slot:footer>
      <meg-button
        type="primary"
        @click="onClickConfirm">
        {{ $t('保存') }}
      </meg-button>
      <meg-button @click="onClickCancel">
        {{ $t('取消') }}
      </meg-button>
    </template>
  </meg-dialog>
</template>
<script>
import VueDraggable from 'vuedraggable';

export default {
  name: 'MegExportSetting',
  components: {
    VueDraggable
  },
  props: {
    // 字段是否分类
    category: {
      type: Boolean,
      default: false
    },
    remained: {
      type: Array,
      default: () => ([])
    },
    chosen: {
      type: Array,
      default: () => ([])
    }
  },
  data() {
    return {
      visible: false,
      handler: [null, null],
      destChosen: this.category ? this.chosen : this.chosen.map((val) => ({ name: 'default', value: val })),
      destRemained: this.category ? this.remained : [{ name: 'default', list: [...this.remained] }]
    };
  },
  methods: {
    showDialog() {
      return new Promise((resolve, reject) => {
        this.visible = true;
        this.handler = [resolve, reject];
      });
    },
    /**
     * 选择剩余字段进入已选择范围
     * @param {index} 分类中的按钮排序index
     * @param {i} 第 i 个分类
     * @returns
     */
    chooseItem(index, i) {
      const item = {
        name: this.destRemained[i].name,
        value: this.destRemained[i].list[index]
      };
      this.destChosen.push(item);
      this.destRemained[i].list.splice(index, 1);
    },
    /**
     * 重置字段进入剩余字段范围
     * @param {item} 按钮对象，包含name、value
     * @param {index} 第 index 个按钮
     * @returns
     */
    resetItem(item, index) {
      this.destRemained.forEach((obj, i) => {
        if (obj.name === item.name) {
          this.destRemained[i].list.push(item.value);
          this.destChosen.splice(index, 1);
        }
      });
    },
    /**
     * 导出确认 如果不分类，返回原数据格式，如果分类，返回简单数组格式
     * @param {any}
     * @returns
     */
    onClickConfirm() {
      const [resolve, reject] = this.handler;
      if (!this.destChosen.length) {
        if (reject) reject();
      }
      if (this.category) {
        if (resolve) resolve([this.destChosen, this.destRemained]);
      } else if (resolve) resolve([this.destChosen.map((val) => (val.value)), this.destRemained[0].list]);
    },
    /**
     * 关闭导出设置
     */
    onClickCancel() {
      const [, reject] = this.handler;
      this.visible = false;
      if (reject)reject();
    }
  }
};
</script>
<style lang="scss" scoped>
.export-setting-wrapper {
  display: flex;
  height: 100%;
  flex-direction: column;
  padding-bottom: 10px;
  .field-type {
    color: #435068;
    font-weight: 600;
    margin-right: 16px;
  }
  .field-tip {
    color: #999;
  }
  .remained-box {
    margin: 9px 0px;
    height: 96px;
    overflow-y: auto;
  }
  .remained-box-line {
    display: flex;
  }
  .cate-name {
    width: 72px;
    min-height: 32px;
  }
  .cate-content {
    flex: 1;
  }
  .chosen-wrapper {
    flex: 1;
  }
  .chosen-box {
    padding: 10px;
    margin-top: 10px;
    height: 218px;
    border: 1px solid #d2d6de;
    overflow-y: auto;
  }
  .remained-item {
    display: inline-block;
    padding: 0 20px;
    height: 24px;
    line-height: 24px;
    margin: 0 8px 8px 0;
    border-radius: 2px;
    // font-size: 12px;
    cursor: pointer;
    color: #444;
    background-color: #f7f8f9;
    text-align: center;
  }
  .chosen-item {
    display: inline-block;
    padding: 0 20px;
    height: 24px;
    line-height: 24px;
    margin: 0 8px 8px 0;
    border-radius: 2px;
    cursor: pointer;
    color: #fff;
    background-color: #21539b;
    text-align: center;
    border: 1px solid transparent;
    &.sortable-chosen {
      background-color: #177cce;
    }
    &.sortable-ghost {
      color: #21539b;
      color: #21539b;
      border: 1px dashed #a0bbd5;
      background-color: #fff;
    }
    &.sortable-drag {
      background-color: #104982;
    }
  }
  .export-error-tip {
    color: #f56c6c;
    font-size: 12px;
    line-height: 1;
    padding-top: 4px;
  }
}
</style>
