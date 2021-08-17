<template>
  <div class="region-album-sort-collapse">
    <meg-collapse
      v-model="activeName"
      @change="changeActive"
      accordion>
      <meg-collapse-item
        class="common-collapse__item"
        v-for="(item,index) in content"
        :key="index"
        :name="index">
        <template slot="title">
          <meg-checkbox
            style="margin:0 2px"
            v-model="item.allChecked"
            :indeterminate="item.indeterminate"
            @click.native="stopProp($event)"
            @change="onSelectAllChanged($event,index)"
            v-show="isSelectMode && activeName===index">
          </meg-checkbox>
          {{ item.category }}
          <span class="record-num">（{{ item.count }}{{ $t('条') }}）</span>
        </template>
        <!-- v-loading="loading && index===activeName" -->
        <div
          class="collapse-block">
          <!-- <meg-scrollbar> -->
          <meg-card-frame :card-min-width="280">
            <div
              class="card-frame-child"
              v-for="(obj,key) in item.records"
              @mouseenter="enter(key)"
              @mouseleave="leave"
              :key="key">
              <meg-double-card
                class="card-content"
                :animation="true"
                @click="cardClick($event,index,key,obj)"
                :left-img-src="obj.faceOnlyUrl"
                :right-img-src="obj.albumPhotoUrl"
                :score="obj.score">
                <div
                  class="card-header"
                  slot="header"
                  v-tooltip="true">
                  {{ obj.albumName }}
                </div>
                <!-- 卡片底部slot -->
                <div
                  slot="bottom"
                  class="card-bottom">
                  <!-- 底部左侧信息 -->
                  <div class="card-bottom-left">
                    <p
                      class="card-line"
                      v-tooltip="true">
                      {{ obj.cameraName }}
                    </p>
                    <p class="card-line">
                      {{ obj.captureTime }}
                    </p>
                  </div>
                  <!-- 底部右侧信息 -->
                  <div class="card-bottom-right">
                    <p
                      class="card-line"
                      v-tooltip="true">
                      {{ obj.name }}
                    </p>
                    <p
                      class="card-line"
                      v-tooltip="true">
                      {{ obj.cardNo }}
                    </p>
                  </div>
                </div>
                <template slot="custom">
                  <div
                    class="card-checkbox"
                    v-show="isSelectMode || key===hoverIndex"
                    @click="stopProp">
                    <meg-checkbox
                      v-model="obj.cardChecked"
                      @change="onCheckChanged(index,key)">
                    </meg-checkbox>
                  </div>
                  <div
                    v-show="isSelectMode"
                    class="card-mask"
                    @click.stop="onCardMaskClick(index,key,obj)">
                  </div>
                </template>
              </meg-double-card>
            </div>
            <div
              class="load-more-loading"
              v-if="item.loading">
              <div
                v-loading="true"
                style="width:100%; height:100%;"></div>
            </div>
            <!-- </meg-scrollbar> -->
          </meg-card-frame>
          <div
            class="load-more-box"
            v-if="item.morePage && !item.loading">
            <meg-button @click="updatePageData(index)">
              {{ $t('加载更多') }}
            </meg-button>
          </div>
        </div>
      </meg-collapse-item>
    </meg-collapse>
  </div>
</template>

<script>
export default {
  components: {
  },
  props: {
    isSelectMode: {
      type: Boolean,
      default: false
    },
    content: {
      type: Array,
      default: () => []
    },
    defaultIndex: {
      type: [Number, String],
      default: ''
    }
  },
  data() {
    return {
      activeName: 0,
      lastName: 0,
      hoverIndex: ''
    };
  },
  computed: {
    deletePermission() {
      return this.$store.getters.user.userName === 'superAdmin'
      && this.$store.getters.systemByType('enablePKSetting').value === 'true'
      && this.$store.getters.systemByType('enableDelCapture').value === 'true';
    }
  },
  watch: {
    content() {
      this.activeName = 0;
      this.lastName = 0;
    },
    isSelectMode(val) {
      if (!val) {
        this.onSelectAllChanged(false, this.lastName);
      }
    }
  },
  mounted() {
    // this.content[this.activeName].loading = false;
  },
  methods: {
    /**
     * 鼠标移入卡片 显示收藏按钮
     */
    enter(index) {
      this.hoverIndex = index;
    },
    /**
     * 鼠标移出卡片 隐藏收藏按钮
     */
    leave() {
      this.hoverIndex = '';
    },
    /**
     * 当卡片遮罩层在选择模式被点击时，判断卡片选中状态
     * @param {index} 分类索引
     * @param {key} 卡片位于分类中的索引
     */
    onCardMaskClick(index, key, card) {
      card.cardChecked = !card.cardChecked;
      this.changeMode();
      this.updateCheckState(index, key);
    },
    /**
     * @description changeMode
     */
    changeMode() {
      if (this.content && this.content.length > 0) {
        if (this.content.some((item) => (item.records.length > 0 && item.records.some((child) => child.cardChecked)))) {
          this.$emit('change-mode', true);
        } else {
          this.$emit('change-mode', false);
        }
      }
    },
    /**
     * 当某一个选择框状态改变时，为当前分类的全选框判断状态
     * @param {index} 分类索引
     */
    updateCheckState(index) {
      const { records } = this.content[index];
      let selectedNum = 0;
      const selection = [];
      records.forEach((val) => {
        if (val.cardChecked) {
          selectedNum += 1;
          selection.push(val);
        }
      });
      this.$emit('selected-num-change', selectedNum, selection);
      // 全选
      if (selectedNum === records.length) {
        this.content[index].allChecked = true;
        this.content[index].indeterminate = false;
        return;
      }
      // 全不选
      if (selectedNum === 0) {
        this.content[index].allChecked = false;
        this.content[index].indeterminate = false;
        return;
      }
      this.content[index].allChecked = false;
      this.content[index].indeterminate = true;
    },

    /**
     * 当每一分类的全选按钮切换时，更新子卡片的选中状态
     * @param {checked} boolean 是否选中
     * @param {index} number 分类索引
     */
    onSelectAllChanged(checked, index) {
      this.content[index].indeterminate = false;
      this.content[index].allChecked = checked;
      this.content[index].records.forEach((val) => {
        val.cardChecked = checked;
      });
      this.$emit('selected-num-change', checked ? this.content[index].records.length : 0, checked ? this.content[index].records : []);
    },
    /**
     * 点击卡片上的单选按钮时，切换选中状态
     * @param {index} 卡片对应分类索引
     * @returns
     */
    onCheckChanged(index) {
      this.changeMode();
      this.updateCheckState(index);
    },
    /**
     * 取消冒泡 vue有修饰符事件，但是这里只是单纯的阻止事件冒泡，没有数据修改
     * @param {e} 原生事件
     */
    stopProp(e) {
      e.stopPropagation();
    },
    /**
     * 当切换折叠面板的索引时，向父组件提交索引变更事件，并在一定延迟之后取消loading
     * @param {any}
     * @returns
     */
    changeActive(index) {
      if (index === '' || index === this.lastName) { return; }
      this.$emit('change', index, this.lastName);
      this.lastName = index;
      this.content[this.lastName].allChecked = false;
      this.$emit('selected-num-change', 0);
      setTimeout(() => {
        this.content[index].loading = false;
      }, 1200);
    },
    /**
     * 当折叠模块滚动到底部时，申请新的分页数据
     * @param {index} 需要申请新数据的分类的索引
     * @returns
     */
    updatePageData(index) {
      this.$emit('update', index);
    },
    /**
     * 点击卡片时提交点击事件
     * @param {index,key} 分类和卡片索引
     * @returns
     */
    cardClick($event, index, key) {
      if (!$event) {
        this.$emit('card-click', index, key);
      }
    },
    /**
     * 点击删除按钮
     */
    deleteItem(item, index, key) {
      this.$emit('delete', item, index, key);
    },
    /**
     * 卡片拖拽如图片框
     */
    cardDrag(event, url) {
      event.dataTransfer.setData('Text', url);
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
<style lang="scss">

.region-album-sort-collapse{
  padding-right: 15px;
  .record-num{
    color: #435068;
  }
  .el-collapse {
    border-top: none;
    border-bottom: none;
  }
  .el-collapse-item [role='tab']{
    position: sticky;
    margin:0 3px;
    z-index: 99;
    top: 0px;
  }
  .el-collapse-item__arrow {
    margin-right: 4px;
    float: none;
    line-height: 34px;
  }
  .common-collapse__item{
    margin-bottom: 6px;
    border: none 0;
  }
  .el-icon-arrow-right:before {
    content: "\E60E";
  }
  .el-collapse-item__header{
    border-bottom: 3px solid #dce2e5;
    height: 34px;
    line-height: 34px;
    padding-left: 16px;
    font-size: 14px;
    color: #435068;
    &:hover{
      color:#21539b;
      background-color: #e8f2fe;
      .record-num{
        color: #21539b;
      }
    }
  }
  .el-collapse-item__wrap{
    background-color: transparent;
  }
  .el-collapse-item__content{
    padding-top: 5px;
    padding-bottom: 3px;
  }
  .collapse-block{
    padding-top: 6px;
    .card-mask {
      position: absolute;
      z-index: 7;
      top: 0;
      width: 100%;
      height: 100%;
    }
    .card-checkbox {
      position: absolute;
      left: 10px;
      top: 5px;
      z-index: 100;
    }
    .card-frame-child {
      position: relative;
      // &:hover {
      //   transform: translate(-2px,-2px);
      // }
    }
  }
  // .card-frame {
  //   height: 500px;
  // }
  .card-right-wrapper {
    display: flex;
    justify-items: center;
    align-items: center;
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
      flex:1;
      margin-left: 2px;
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
    font-size: 24px;
    color:#21539b;
    height:38px;
  }
  .collection-box{
    position: absolute;
    top: 10px;
    right: 10px;
    .meg-icon{
      width: 26px;
      height: 26px;
    }
    .delete-box{
      display: inline-block;
      margin-right: 6px;
      .meg-icon{
        width: 16px;
        height: 16px;
        color: #fff;
        background-color: #d9d8d9;
        padding: 5px;
        border-radius: 2px;
      }
    }
  }
  .load-more-loading{
    width: 100%;
    height: 56px;
    .el-loading-mask{
      background-color: transparent;
    }
  }
  .load-more-box{
    text-align: center;
    width: 100%;
    height: 56px;
    button{
      width: 300px;
      margin-top: 10px;
    }
  }
  .card-content {
    background: #ffffff;
  }

  .card-header {
    height: 28px;
    line-height: 28px;
    padding-left: 25px;
    font-size: 12px;
    color: #435068;
  }

  .info-level {
    flex: 0 0 14px;
  }

  .info-album {
    flex: 1 1 auto;
    padding: 0 10px;
  }

  .info-status {
    flex: 0 0 60px;
    text-align: right;
  }

  .card-bottom {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 15px;
  }

  .card-bottom-left,
  .card-bottom-right {
    width: 50%;
  }

  .card-line {
    height: 16px;
    font-size: 12px;
    line-height: 16px;
    color: #435068;
  }
}
</style>
