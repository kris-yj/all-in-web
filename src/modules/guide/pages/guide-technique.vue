<template>
  <div class="guide fill">
    <div class="guide-content operating-instructions">
      <div class="headline">
        使用场景
      </div>
      <div class="scene-text">
        {{ instructions.scene }}。
      </div>
      <div class="headline step">
        使用说明
      </div>
      <div v-if="itemIsAllObj">
        <div
          v-for="(item,ind) of state"
          :key="ind">
          <div>
            <div class="way-title">
              {{ item.way }}
            </div>
            <div
              v-for="(val,i) of item.state"
              class="scene-text"
              :key="i">
              {{ val }}
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <div
          v-for="(item,ind) of state"
          :key="ind">
          <div
            class="scene-text"
            v-if="typeof item === 'string'">
            {{ item }}
          </div>
          <div v-else>
            <div class="scene-text">
              {{ item.step }}
            </div>
            <div
              class="subitem"
              v-for="(val,i) of item.subitem"
              :key="i">
              {{ val }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import official from '@/components/layout/instructions.json';

export default {
  computed: {
    instructions() {
      const { query } = this.$route;
      return official[query.alias];
    },
    state() {
      return this.instructions.state;
    },
    itemIsAllObj() {
      return this.instructions.state.every((item) => Object.prototype.toString.call(item) === '[object Object]');
    },
  },
  mounted() {
    document.title = `战法说明 - ${this.instructions.title}`;
  }
};
</script>

<style lang="scss" scoped>
.fill {
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  overflow-y: auto;
}
.operating-instructions {
  .guide-content {
    // height: 585px;
  }
  .headline {
    font-weight: bold;
    font-size: 18px;
    color: #435068;
    text-align: left;
    margin-bottom: 20px;
  }
  .scene-text {
    font-size: 16px;
    line-height: 20px;
    color: #435068;
    text-align: left;
    margin-bottom: 20px;
  }
  .step{
    padding-top: 10px;
  }
  .subitem {
    padding-left: 25px;
    font-family: SourceHanSansCN-Regular;
    font-size: 16px;
    line-height: 24px;
    color: #435068;
    text-align: left;
    margin-top: 10px;
  }
  .way-title{
    font-family: SourceHanSansCN-Bold;
    font-size: 16px;
    color: #435068;
    text-align: left;
    line-height: 26px;
  }
}
</style>
