<template>
  <meg-dialog
    class="analysis-filter"
    :visible="visible"
    width="800px"
    @close="close"
    append-to-body
    body-height="420px">
    <span
      slot="title"
      class="common-dialog-title">{{ $t('人工筛选') }}</span>
    <div
      class="filter-dialog-body"
      v-loading="filterloading">
      <div
        class="filter-loading-box"
        v-background="categoriesData.length > 0 ? false: {icon:'icon_2',text:$t('检索无结果')}">
        <meg-scrollbar>
          <div class="card-wrapper">
            <common-collapse
              ref="collapse"
              v-model="nowIndex"
              :categories="categoriesData"
              :list-key="listKey"
              :show-checkbox="false"
              :reset-page-number-when-categories-change="false"
              list-fetch="innerPage"
              :card-min-width="220">
              <template v-slot="{item, index}">
                <common-card
                  :is-show-base-button="[]"
                  :card-data="item">
                  <template
                    v-slot:checkbox="{isShowCustom}">
                    <div
                      v-show="isShowCustom"
                      class="collection-box">
                      <meg-tooltip
                        :content="$t('删除本张照片')"
                        placement="bottom">
                        <meg-icon
                          @click.native.stop="deleteOne(index)"
                          name="mission_del">
                        </meg-icon>
                      </meg-tooltip>
                      <meg-tooltip
                        :content="$t('删除本张照片和之后所有照片')"
                        placement="bottom">
                        <meg-icon
                          @click.native.stop="deleteAll(index)"
                          name="delete_later">
                        </meg-icon>
                      </meg-tooltip>
                    </div>
                  </template>
                </common-card>
              </template>
            </common-collapse>
          </div>
        </meg-scrollbar>
      </div>
    </div>
    <div slot="footer">
      <meg-button
        type="primary"
        @click="confirm">
        {{ $t('确认') }}
      </meg-button>
      <meg-button @click="cancel">
        {{ $t('取消') }}
      </meg-button>
    </div>
  </meg-dialog>
</template>
<script>
import commonCollapse from '@/common-components/common-collapse';
import commonCard from '@/common-components/common-card';

export default {
  components: {
    commonCollapse,
    commonCard
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    filterloading: {
      type: Boolean,
      default: false
    },
    listKey: {
      type: String,
      default: 'listResults'
    },
  },
  data() {
    return {
      nowIndex: 0,
      categoriesData: []
    };
  },
  methods: {
    initData(data) {
      this.categoriesData = JSON.parse(JSON.stringify(data));
    },
    /**
     * 弹窗确定
     */
    confirm() {
      this.$emit('confirm', this.categoriesData);
      this.$emit('update:visible', false);
    },
    /**
     * 弹窗取消
     */
    cancel() {
      this.$emit('update:visible', false);
    },
    /**
     * 弹窗关闭
     */
    close() {
      this.$emit('update:visible', false);
    },
    /**
     * 删除目标数据
     */
    deleteOne(index) {
      this.categoriesData[this.nowIndex][this.listKey].splice(index, 1);
      this.categoriesData[this.nowIndex].count = this.categoriesData[this.nowIndex].listResults.length;
      this.$set(this.categoriesData, this.nowIndex, this.categoriesData[this.nowIndex]);
    },
    /**
     * 删除目标和目标之后的数据
     */
    deleteAll(index) {
      this.categoriesData[this.nowIndex][this.listKey].splice(index);
      this.categoriesData[this.nowIndex].count = this.categoriesData[this.nowIndex].listResults.length;
      this.$set(this.categoriesData, this.nowIndex, this.categoriesData[this.nowIndex]);
    },
  }
};
</script>
<style lang="scss" scoped>
.analysis-filter{
  width: 100%;
  height: 100%;
  ::v-deep .meg-dialog__body {
    padding: 0;
  }
  ::v-deep .meg-dialog__title{
    padding: 0;
  }
  .common-dialog-title{
    line-height: 54px;
    font-size: 16px;
    color: #435068;
    font-weight: 700;
  }
  .filter-dialog-body{
    height: 420px;
    margin: 20px 25px;
    background-color: #dbe0e5;
    .filter-loading-box{
      height:400px;
    }
    .meg-background{
      z-index: 1;
    }
  }
  .card-wrapper{
    background-color: #dbe0e5;
  }
  .card-item-box{
    display: inline-block;
    position: relative;
    width: 245px;
  }
  .card-right-wrapper {
    display: flex;
    align-items: center;
    padding-bottom: 8px;
  }
  .card-tip,.bottom-tip-box{
    .meg-icon {
      height: 12px;
      width: 12px;
      vertical-align: baseline;
      color: #d1d5dd;
    }
  }
  .bottom-tip-box{
    display: flex;
    height: 18px;
    color: #5a6676;
    line-height: 12px;
    font-size: 12px;
    margin-left: 8px;
    .card-tip{
      display: inline-block;
      margin: 0 2px;
    }
  }
  .card-tip-box{
    display: inline-block;
    vertical-align: top;
    width: 78px;
    color: #5a6676;
    line-height: 16px;
    font-size: 12px;
    height: 32px;
    margin-left: 2px;
  }
  .card-score{
    font-size: 24px;
    color:#21539b;
    height:38px;
    line-height: 45px;
  }
  .collection-box{
    position: absolute;
    top: 10px;
    right: 10px;
    .meg-icon{
      width: 14px;
      height: 14px;
      color: #fff;
      background-color: #a1a7b3;
      padding: 6px;
      border-radius: 2px;
      &:hover{
        background-color: #22529a;
      }
    }
  }
  .load-more-box{
    text-align: center;
    button{
      margin-top: 10px;
    }
  }
}
</style>
