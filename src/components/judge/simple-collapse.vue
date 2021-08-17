<template>
  <div class="simple-sort-collapse">
    <meg-collapse
      :key="state"
      v-model="activeName"
      @change="changeActive"
      accordion>
      <meg-collapse-item
        class="single-collapse__item"
        v-for="(item,index) in activeLists"
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
          <span
            class="record-title"
            v-tooltip="true">{{ item.title }}</span>
          <span
            class="record-num"
            v-tooltip="true">（{{ $t('出现{count}次', { count: item.count }) }}）</span>
        </template>
        <div
          class="collapse-block"
          v-loading="loading && index===activeName">
          <!-- <meg-scrollbar> -->
          <div
            class="card-frame-child"
            v-for="(obj,key) in item.list"
            @mouseenter="enter(key)"
            @mouseleave="leave"
            :key="key">
            <thread-card
              @click.native="cardClick(index, key, item.list, obj)"
              :actived="selectedCard === key"
              class="simple-thread-card"
              :is-show-del-button="false"
              :ind="obj.ind"
              :card-data="obj">
              <template
                v-slot:checkbox="{isShowCustom}">
                <div
                  v-show="isSelectMode || isShowCustom"
                  class="card-checkbox"
                  @click="stopProp">
                  <meg-checkbox
                    v-model="obj.cardChecked"
                    @change="onCheckChanged(index,key)">
                  </meg-checkbox>
                </div>
              </template>
            </thread-card>
            <div
              class="card-mask"
              v-show="isSelectMode"
              @click.stop="onCardMaskClick(index,key,obj)">
            </div>
          </div>
          <div
            class="load-more-box"
            v-if="item.morePageVisible&&!isSelectMode">
            <meg-button @click="updatePageData(index)">
              {{ $t('加载更多') }}
            </meg-button>
          </div>
          <!-- </meg-scrollbar> -->
        </div>
      </meg-collapse-item>
    </meg-collapse>
  </div>
</template>

<script>
import moment from 'moment';
import ThreadCard from './thread-card';

const PAGESIZE = 60;
export default {
  components: {
    ThreadCard
  },
  props: {
    state: {
      type: [String, Number],
      default: 'a'
    },
    isSelectMode: {
      type: Boolean,
      default: false
    },
    content: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    morePage: {
      type: Boolean,
      default: false
    },
    defaultIndex: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      activeName: 0,
      lastName: 0,
      hoverIndex: '',
      activeLists: [],
      selectedCard: 0
    };
  },
  watch: {
    state() {
      const val = 0;
      this.activeName = val;
      this.lastName = val;
    },
    content() {
      this.init();
    },
    defaultIndex(val) {
      this.activeName = val.key;
      this.lastName = val.key;
    },
    isSelectMode(val) {
      if (!val) {
        this.cancelAllSelected();
      }
    }
  },
  mounted() {
  },
  methods: {
    setActiveList(list) {
      this.activeLists[this.activeName].list = list;
    },
    setActiveIndex(ind) {
      this.activeName = ind;
    },
    /**
     * 函数作用
     * @param {any}
     * @returns
     */
    init() {
      const temp = [];
      this.content.forEach((element) => {
        temp.push({
          allChecked: false,
          count: element.count,
          list: [],
          title: element.title || element.day,
          morePageVisible: false,
          indeterminate: false
        });
      });
      this.activeLists = temp;
      this.activeName = 0;
      this.lastName = 0;
      this.updatePageData(0);
    },
    /**
     * 时间格式化
     * @param {time} 时间戳
     * @returns 格式化后的字符串
     */
    timeFormat(time) {
      return moment(time).format('YYYY-MM-DD HH:mm:ss');
    },
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
    onCardMaskClick(index, key, obj) {
      obj.cardChecked = !obj.cardChecked;
      this.changeMode();
      this.updateCheckState(index, key);
    },
    /**
     * 当某一个选择框状态改变时，为当前分类的全选框判断状态
     * @param {index} 分类索引
     */
    updateCheckState(index) {
      const { list } = this.activeLists[index];
      let selectedNum = 0;
      const selection = [];
      this.activeLists.forEach((li) => {
        if (li.list.length) {
          li.list.forEach((val) => {
            if (val.cardChecked) {
              selectedNum += 1;
              selection.push(val);
            }
          });
        }
      });
      this.$emit('selected-num-change', selectedNum, selection);
      // 全选
      if (selectedNum === list.length) {
        this.activeLists[index].allChecked = true;
        this.activeLists[index].indeterminate = false;
        return;
      }
      // 全不选
      if (selectedNum === 0) {
        this.activeLists[index].allChecked = false;
        this.activeLists[index].indeterminate = false;
        return;
      }
      this.activeLists[index].allChecked = false;
      this.activeLists[index].indeterminate = true;
    },
    /**
     * 取消所有选择
     */
    cancelAllSelected() {
      this.activeLists.forEach((element) => {
        element.indeterminate = false;
        element.allChecked = false;
        element.list.forEach((val) => {
          val.cardChecked = false;
        });
      });
      this.content.forEach((element) => {
        element.indeterminate = false;
        element.allChecked = false;
        element.list.forEach((val) => {
          val.cardChecked = false;
        });
      });
      this.$emit('selected-num-change', 0, []);
    },
    /**
     * 当每一分类的全选按钮切换时，更新子卡片的选中状态
     * @param {boolean}  是否选中
     * @param {number}  分类索引
     */
    onSelectAllChanged(checked, index) {
      this.activeLists[index].indeterminate = false;
      this.activeLists[index].allChecked = checked;
      this.activeLists[index].list.forEach((val) => {
        val.cardChecked = checked;
      });
      let selectedNum = 0;
      const selection = [];
      this.activeLists.forEach((list) => {
        if (list.list.length) {
          list.list.forEach((val) => {
            if (val.cardChecked) {
              selectedNum += 1;
              selection.push(val);
            }
          });
        }
      });
      this.$emit('selected-num-change', selectedNum, selection);
      // this.$emit('selected-num-change', checked ? this.content[index].list.length : 0, checked ? this.content[index].list : []);
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
    changeMode() {
      if (this.activeLists.length > 0) {
        if (this.activeLists.some((item) => (item.list.length > 0 && item.list.some((child) => child.cardChecked)))) {
          this.$emit('change-mode', true);
        } else {
          this.$emit('change-mode', false);
        }
      }
    },
    /**
     * 取消冒泡 vue有修饰符事件，但是这里只是单纯的阻止事件冒泡，没有数据修改
     * @param {e} 原生事件
     */
    stopProp(e) {
      e.stopPropagation();
    },
    /**
     * 当切换折叠面板的索引时，向父组件提交索引变更事件
     * @param {any}
     * @returns
     */
    changeActive(index) {
      if (index === '' || index === this.lastName) { return; }
      this.selectedCard = '';
      this.lastName = index;
      this.$emit('change', index);
      if (!this.activeLists[index].list.length) {
        setTimeout(() => {
          this.updatePageData(index);
        }, 200);
      }
    },
    /**
     * 当折叠模块滚动到底部时，申请新的分页数据
     * @param {index} 需要申请新数据的分类的索引
     * @returns
     */
    updatePageData(index) {
      const len = this.activeLists[index].list.length;
      this.activeLists[index].morePageVisible = false;

      let slen = 0;// 需要剪切的长度
      if (this.content[index].list.length > len + PAGESIZE) {
        slen = PAGESIZE;
        setTimeout(() => {
          this.activeLists[index].morePageVisible = true;
        });
      } else {
        slen = this.content[index].list.length - len;
        setTimeout(() => {
          this.activeLists[index].morePageVisible = false;
        });
      }
      const temp = this.content[index].list.slice(len, len + slen);
      this.activeLists[index].list = this.activeLists[index].list.concat(temp);
    },
    /**
     * 点击卡片时提交点击事件
     * @param {index,key} 分类和卡片索引
     * @returns
     */
    cardClick(index, key, list, card) {
      this.selectedCard = key;
      this.$emit('card-click', index, key, list, card);
    },
    /**
     * 删除元素
     */
    deleteItem(item) {
      this.$emit('delete', item);
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

.simple-sort-collapse{
  overflow: auto;
  width: 100%;
  height: calc(100% - 60px);
  background: #F2F4F8;
  box-sizing: border-box;
  ::v-deep .meg-collapse-item__wrap{
    padding: 0 10px;
  }
  ::v-deep .meg-collapse-item__content{
    padding: 0;
  }
  .single-collapse__item{
    margin-bottom: 6px;
    border: none 0;
    ::v-deep .collapse-block {
      padding-bottom: 70px;
    }
  }
  .record-title{
    display: inline-block;
    vertical-align: middle;
    max-width: calc(100% - 125px);
  }
  .record-num{
    color:#435068;
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
    // padding-top: 5px;
    padding-bottom: 3px;
  }
  .collapse-block{
    padding-top: 6px;
    overflow: hidden;;
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
      top: 0px;
      z-index: 2;
    }
    .card-frame-child {
      position: relative;
      width: 100%;
      .simple-thread-card{
        margin-bottom: 3px;
      }
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
    // font-family: 'meg-number';
    font-size: 24px;
    color:#21539b;
    height:38px;
  }
  .collection-box{
    position: absolute;
    top: 10px;
    right: 10px;
    .meg-icon{
      width: 25px;
      height: 25px;
    }
  }
  .load-more-box{
    text-align: center;
    width: 100%;
    height: 56px;
    margin-bottom: 50px;
    button{
      margin-top: 10px;
    }
  }
}
</style>
