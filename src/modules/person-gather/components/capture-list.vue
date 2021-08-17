<template>
  <div class="videoCapture__card">
    <div
      class="card__title">
      <div
        class="return__lists">
        <span>{{ $t('分析结果：共') }}{{ listCount }}{{ $t('次') }}</span>
        <div class="export__video">
          <meg-button
            :disabled="!listCount"
            v-if="buttonPermission"
            :type="isSelectMode && selectedNum ? 'primary' : 'default'"
            @click="confirmExport">
            {{ $t('导出') }}
          </meg-button>
          <meg-button
            v-show="isSelectMode"
            @click="setSelectMode"
            :class="[!listCount?'button__main__moreCapture':'']"
            :disabled="!listCount">
            {{ $t('退出选择') }}
          </meg-button>
        </div>
      </div>
    </div>
    <div
      v-loading="isLoading"
      style="width:100%; height: calc(100% - 53px);">
      <div
        v-background="listCount? false:{icon:'icon_3',text: $t('暂无结果')}"
        class="content__container">
        <meg-card-frame
          :card-min-width="160">
          <div
            class="card-frame-child"
            v-for="(item,index) in listData"
            @mouseenter="enter(index)"
            @mouseleave="leave"
            :key="index">
            <meg-card
              @click="detailData(index)"
              :img-src="item.faceUrl
              ">
              <div slot="custom">
                <div
                  v-show=" !isSelectMode && index===hoverIndex"
                  class="collection-box">
                  <div
                    class="delete-box">
                    <meg-icon
                      name="mission_del"
                      @click.stop="deleteItem(item,index)">
                    </meg-icon>
                  </div>
                </div>
                <div
                  v-show="isSelectMode"
                  class="card-mask"
                  @click.stop="onCardMaskClick(index)">
                </div>
                <div
                  v-show="isSelectMode || index===hoverIndex"
                  class="card-checkbox"
                  @click="stopProp">
                  <meg-checkbox
                    v-model="item.cardChecked"
                    @change="onCheckChanged(index)">
                  </meg-checkbox>
                </div>
              </div>
            </meg-card>
          </div>
        </meg-card-frame>
      </div>
    </div>
    <capture-detail
      :detail-list="listData"
      :index="dialogCardIndex"
      @close="moreDetailShow=false"
      v-if="moreDetailShow">
    </capture-detail>
  </div>
</template>

<script>
import CaptureDetail from './capture-detail';

export default {
  components: {
    CaptureDetail,
  },
  props: {
    isLoading: {
      type: Boolean,
      default: false
    },
    listData: {
      type: Array,
      default: () => []
    },
    listCount: {
      type: Number,
      default: () => 0
    }
  },
  data() {
    return {
      hoverIndex: '',
      loading: false,
      jobName: this.$t('返回'),
      dialogCardIndex: 0,
      moreDetailShow: false,
      isSelectMode: false, // 是否为选择模式
      selectedNum: 0, // 卡片选中数量
      exportList: [],
    };
  },
  computed: {
    // 报警卡片显示pk删除按钮
    isSuperAdmin() {
      if (this.$store.getters.user.userName === 'superAdmin' && this.$store.getters.systemByType('enablePKSetting').value === 'true') {
        return true;
      }
      return false;
    },
    deletePermissionNone() {
      return this.$store.getters.user.userName === 'superAdmin'
      && this.$store.getters.systemByType('enablePKSetting').value === 'true'
      && this.$store.getters.systemByType('enableDelRetrievalCapture').value === 'true';
    },
    buttonPermission() {
      return this.$store.getters.modulePermissonsByAlias('person-gather', 'export');
    },
  },
  watch: {
    listData() {
      this.updateCheckState();
    }
  },
  created() {
    if (this.jobName) {
      localStorage.setItem('manJobName', this.jobName);
    }
    this.jobName = localStorage.getItem('manJobName');
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
     * 删除卡片
     */
    deleteItem(item) {
      this.$emit('delete-item', item);
    },
    /*
    * 批量导出
    * @param {any}
    * @return
    * */
    onClickBatchExport() {
      const param = {
        exportData: this.listData,
        task: true, // true:批量导出
      };
      this.$emit('confirm-export', param);
    },
    /**
     * 当卡片遮罩层在选择模式被点击时，判断卡片选中状态
     * @param {index} 卡片索引
     */
    onCardMaskClick(index) {
      this.listData[index].cardChecked = !this.listData[index].cardChecked;
      this.changeMode();
      this.updateCheckState();
    },
    /**
     * 点击卡片上的单选按钮时，切换选中状态
     * @param {index} 卡片对应分类索引
     * @returns
     */
    onCheckChanged() {
      this.changeMode();
      this.updateCheckState();
    },
    /**
     * @description changeMode
     */
    changeMode() {
      if (this.listData.length > 0 && this.listData.some((item) => item.cardChecked)) {
        this.isSelectMode = true;
      } else {
        this.isSelectMode = false;
      }
    },
    /**
     * 当某一个选择框状态改变时，为当前分类的全选框判断状态
     * @param {index} 分类索引
     */
    updateCheckState() {
      this.selectedNum = 0;
      this.exportList = [];
      this.listData.forEach((val) => {
        if (val.cardChecked) {
          this.selectedNum += 1;
          this.exportList.push(val);
        }
      });
    },
    /*
    * 确认导出
    * @param {any}
    * @return
    * */
    confirmExport() {
      const params = {
        task: !this.isSelectMode,
        exportData: this.isSelectMode ? this.exportList : this.listData,
      };
      this.$emit('confirm-export', params);
    },
    /**
     * 退出选择模式
     */
    setSelectMode() {
      this.selectedNum = 0;
      this.exportList = [];
      if (this.listCount !== 0) {
        this.listData.forEach((val) => {
          this.$set(val, 'cardChecked', false);
        });
      }
      this.isSelectMode = false;
    },
    /**
     * 取消冒泡 vue有修饰符事件，但是这里只是单纯的阻止事件冒泡，没有数据修改
     * @param {e} 原生事件
     */
    stopProp(e) {
      e.stopPropagation();
    },
    /*
    * 弹出框，显示详细信息
    * @param {item} 选中的数据
    * @return
    * */
    detailData(index) {
      this.dialogCardIndex = index;
      this.moreDetailShow = true;
    },
  }
};
</script>

<style lang="scss" scoped>
.videoCapture__card {
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
  }
}
.collection-box {
  position: absolute;
  top: 5px;
  right: 5px;
  .meg-icon {
    width: 26px;
    height: 26px;
  }
  .delete-box {
    position: absolute;
    top: 10px;
    right: 10px;
    .meg-icon {
      width: 14px;
      height: 14px;
      color: #fff;
      background-color: #a1a7b3;
      padding: 6px;
      border-radius: 2px;
      &:hover {
        background-color: #22529a;
      }
    }
  }
}
.button__main__moreCapture {
  position: relative;
  top: 2px;
}
.export__video {
  float: right;
}
.return__button {
  display: inline-block;
  height: 16px;
  line-height: 16px;
  padding-top: 15px;
  margin-left: -7px;
}
.videoCapture__card {
  width: 100%;
  height: 100%;
  background-color: #d1d5dd;
}
.card__title {
  height: 53px;
  line-height: 53px;
}
.results__icon2 {
  margin-top: -2px;
  transform: rotate(90deg);
  margin-right: 8px;
  cursor: pointer;
}
.return__lists {
  margin-left: 15px;
  margin-right: 20px;
}

.return__lists > span:nth-child(2) {
  position: relative;
  top: -10px;
  margin-left: 20px;
  font-size: 12px;
  color: #435068;
}
.content__container {
  width: 100%;
  padding: 0 14px;
  box-sizing: border-box;
  height: calc(100% - 53px);
  overflow: auto;
}

.more__name {
  color: #5a6676;
  font-size: 12px;
  margin-left: 10px;
  margin-top: 10px;
}
.bottom__list {
  padding-bottom: 10px;
}
.more__score {
  font-size: 24px;
  color: #21539a;
  font-family: "meg-number";
  margin-left: 10px;
}
.more__id {
  color: #5a6676;
  font-size: 12px;
  margin-left: 10px;
  margin-top: 10px;
}
.big-icon {
  position: relative;
  top: -1px;
}
</style>
<style lang="scss">
.videoCapture__card {
  .meg-card {
    margin: 2.5px;
  }
}
</style>
