<template>
  <meg-dialog
    :title="$t('选择档案')"
    class="record-gather"
    :visible="visible"
    width="900px"
    @close="close"
    append-to-body>
    <div
      v-loading="dialogLoading"
      class="filter-dialog-body">
      <div
        v-background="matchRecordList.length ? false : {icon:'icon_3',text:$t('暂无结果')}"
        class="filter-loading-box">
        <meg-scrollbar>
          <meg-card-frame
            tag="div"
            class="card-frame"
            :gap="10"
            :card-min-width="230">
            <record-card
              :class="selectedIndex === index ? 'activeCard' : ''"
              v-for="(item,index) in matchRecordList"
              card-type="score"
              :key="index"
              @selected-card="selectedCard($event, index)"
              @mouseenter.native="enter(index)"
              @mouseleave.native="leave"
              :card-data="item"
              :ind="index">
              <div
                class="collection-box"
                slot="custom">
                <div
                  v-show="index===hoverIndex && item.faceCount !== 0"
                  @click.stop="viewFile(item)">
                  <span>{{ $t('查看档案') }}</span>
                  <meg-icon
                    name="nav_expand">
                  </meg-icon>
                </div>
              </div>
            </record-card>
          </meg-card-frame>
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
import { switchToModule } from '@/utils/utils';
import recordCard from './record-card';

export default {
  components: {
    recordCard
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    matchRecordList: {
      type: Array,
      default: () => []
    },
    dialogLoading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      morePageVisible: false,
      hoverIndex: -1, //
      selectedIndex: -1,
      selectedItem: null,
    };
  },
  watch: {
    visible(val) {
      if (!val) {
        this.selectedIndex = -1;
      }
    }
  },
  methods: {
    viewFile(item) {
      const profileType = item.profileType === 0 ? 3 : item.profileType;
      const query = {
        id: item.profileId,
        profileType
      };
      switchToModule({
        module: 'document',
        child: 'document-detail',
        query,
        isBlank: true
      });
    },
    confirm() {
      this.$emit('update:visible', false);
      this.$emit('selected-record', this.selectedItem);
    },
    enter(ind) {
      this.hoverIndex = ind;
    },
    leave() {
      this.hoverIndex = '';
    },
    selectedCard(item, ind) {
      this.selectedIndex = ind;
      this.selectedItem = item;
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
     * 比分处理，保留两位小数
     */
    fixedScore(param) {
      return typeof param === 'number' ? param.toFixed(2) : parseFloat(param).toFixed(2);
    }
  }
};
</script>
<style lang="scss" scoped>
.record-gather{
  width: 100%;
  height: 100%;
  .filter-dialog-body{
    background-color: #dbe0e5;
    .filter-loading-box{
      height:400px;
      padding: 10px;
    }
    .meg-background{
      z-index: 1;
    }
  }
  .card-wrapper{
    background-color: #dbe0e5;
  }
  .activeCard{
    border: 2px solid blue;
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
  .card-info {
    height: 100%;
    display: flex;
    justify-content: center;
    flex-direction: column;
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
    font-family: 'meg-number';
    font-size: 24pxs;
    color:#21539b;
    height:38px;
    line-height: 45px;
  }
  .collection-box{
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    align-items: center;
    z-index: 100;
  }
  .collection-box:hover{
    cursor: pointer;
  }
}
</style>
