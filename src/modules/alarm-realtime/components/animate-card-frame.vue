<template>
  <transition-group
    class="card-frame-container-list"
    name="card-list"
    tag="div">
    <div
      class="card-item"
      v-for="card in cardList"
      :key="card._renderId">
      <slot
        :data="card.data">
      </slot>
    </div>
  </transition-group>
</template>
<script>
import _ from 'lodash';

let guid = 100000;
function genGuid() {
  if (guid === 999999) {
    guid = 100000;
  } else {
    guid += 1;
  }
  return guid;
}

export default {
  name: 'AnimateCardFrame',
  props: {
    // 移动时间间隔
    animateInterval: {
      type: Number,
      default: 500
    },
    // 移动卡片数
    animateCardNum: {
      type: Number,
      default: 5
    },
    // 最大展示数量
    maxDisplayNum: {
      type: Number,
      default: 15
    },
    // 最大缓存数
    cacheMaxNum: {
      type: Number,
      default: 100
    }
  },
  data() {
    return {
      cardCache: [],
      cardList: [],
      updateTimer: null
    };
  },
  computed: {
    hasCache() {
      return this.cardCache.length > 0;
    }
  },
  watch: {
    hasCache(val) {
      if (val) {
        this.startUpdate();
      } else {
        if (this.updateTimer) clearTimeout(this.updateTimer);
        this.updateTimer = null;
      }
    }
  },
  methods: {
    startUpdate() {
      if (this.updateTimer) clearTimeout(this.updateTimer);
      this.updateTimer = setTimeout(() => {
        this.updateAnimateCard();
      }, this.animateInterval);
    },
    updateAnimateCard() {
      const toAddCard = [];
      let i = this.animateCardNum;
      while (i) {
        const item = this.cardCache.shift();
        if (item) toAddCard.unshift(item);
        i -= 1;
      }
      if (toAddCard.length > 0) this.cardList = _.concat(toAddCard, _.take(this.cardList, this.maxDisplayNum - toAddCard.length));
      this.startUpdate();
    },
    addCard(data) {
      const newData = (Array.isArray(data) ? data : [data]).map((item) => ({
        _renderId: Date.now() + genGuid(),
        data: item
      }));
      this.cardCache = this.cardCache.concat(newData);
      if (this.cardCache.length > this.cacheMaxNum) {
        this.cardCache = _.takeRight(this.cardCache, this.cacheMaxNum);
      }
    },
    clear() {
      this.cardCache = [];
      this.cardList = [];
    }
  }
};
</script>

<style lang="scss" scoped>
.card-frame-container-list {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-content: center;
  align-items: flex-end;
  overflow: hidden;
  .card-item {
    flex: 0 0 auto;
    cursor: pointer;
    &:hover {
      transform: translateY(-4px);
    }
  }
}

.card-list-enter-active,
.card-list-leave-active {
  transition: all 1s;
}
.card-list-enter {
  opacity: 0;
  transform: translateX(-999px);
}
.card-list-leave-to {
  opacity: 0;
  transform: translateX(999px);
}
.card-list-move {
  transition: transform 1s;
}
</style>
