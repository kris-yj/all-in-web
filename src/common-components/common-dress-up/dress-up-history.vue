<template>
  <div class="history">
    <meg-tooltip
      :content="$t('撤销')"
      placement="left"
      effect="dark">
      <meg-button
        :disabled="allHistoryIndex<0"
        type="text"
        @click="cancelHistory">
        <meg-icon
          name="recovery_line"
          width="18"
          height="18"></meg-icon>
      </meg-button>
    </meg-tooltip>
    <!-- 撤销 -->

    <meg-tooltip
      :content="$t('恢复')"
      placement="right"
      effect="dark">
      <meg-button
        :disabled="allHistoryIndex >= (allHistoryArr.length - 1)"
        type="text"
        @click="recoverHistory">
        <meg-icon
          name="cancel_line"
          width="18"
          height="18"></meg-icon>
      </meg-button>
    </meg-tooltip>
    <!-- 恢复 -->
  </div>
</template>

<script>

export default {
  props: {
    eventBus: {
      type: Object,
      default() {
        return null;
      }
    }
  },
  data() {
    return {
      allHistoryArr: [],
      allHistoryIndex: -1
    };
  },
  computed: {
  },
  watch: {
  },
  beforeMount() {
  },
  mounted() {
    // 总的历史记录发生改变
    this.eventBus.$on('allHistoryChange', (canvName) => {
      this.allHistoryArr.push(canvName);
      this.allHistoryIndex += 1;
      // 如果超过20步，就删除第一步
      if (this.allHistoryIndex > 20) {
        this.eventBus.$emit(`deletFirstHistory_${this.allHistoryArr.shift()}`);
        this.allHistoryIndex -= 1;
      }
    });
    // 撤销一步
    this.eventBus.$on('cancelHistory', () => {
      this.cancelHistory();
    });
    // 重做一步
    this.eventBus.$on('recoverHistory', () => {
      this.recoverHistory();
    });

    // 当有新操作的时候，重置已经被回滚的历史纪录
    this.eventBus.$on('resetAllHistory', () => {
      if (this.allHistoryIndex < (this.allHistoryArr.length - 1)) { // 表示有撤销纪录的情况
        const newArr = this.allHistoryArr.splice(this.allHistoryIndex + 1, this.allHistoryArr.length - (this.allHistoryIndex + 1));
        const newObj = {};
        newArr.forEach((item) => {
          console.log(item);
          if (!newObj[item]) { // 只需要清除一次 每个learyer的记录
            newObj[item] = 1;
            this.eventBus.$emit(`resetHistory_${item}`);
          }
        });
      }
    });
  },
  methods: {
    /**
     *
     * 撤销历史记录
    */
    cancelHistory() {
      if (this.allHistoryIndex >= 0) {
        this.eventBus.$emit(`cancelHistory_${this.allHistoryArr[this.allHistoryIndex]}`);
        this.allHistoryIndex -= 1;
      }
    },
    /**
     *
     * 重做历史记录
    */
    recoverHistory() {
      if (this.allHistoryIndex < (this.allHistoryArr.length - 1)) {
        this.allHistoryIndex += 1;
        this.eventBus.$emit(`recoverHistory_${this.allHistoryArr[this.allHistoryIndex]}`);
      }
    }

  }
};
</script>

<style scoped lang="scss">
  .history .meg-button{
    padding: 9px 12px  !important;
  }
</style>
