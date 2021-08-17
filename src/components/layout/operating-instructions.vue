<template>
  <div>
    <div v-if="instructions">
      <div
        class="instruction"
        @click="showInstruction">
        <meg-icon
          class="instruction-icon"
          name="infomation"
          height="14px"
          width="14px"
          color="white"></meg-icon>
        战法说明
      </div>
    </div>
  </div>
</template>
<script>
import { openGuideModule } from '@/utils/utils.js';
import official from './instructions.json';

export default {
  computed: {
    instructions() {
      return official[this.alias];
    },
    state() {
      return this.instructions.state;
    },
    itemIsAllObj() {
      return this.instructions.state.every((item) => Object.prototype.toString.call(item) === '[object Object]');
    },
    alias() {
      return (this.$store.state.currentModule && this.$store.state.currentModule.alias) || '';
    }
  },
  methods: {
    showInstruction() {
      openGuideModule({
        name: 'guide',
        query: {
          type: 'technique',
          alias: this.alias
        }
      });
    }
  }
};
</script>
<style lang='scss' scoped>
.instruction {
  font-size: 12px;
  margin-left: 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
}
.instruction-icon {
  padding: 0 2px;
}
.operating-instructions {
  .dialog-content {
    height: 585px;
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
  .step {
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
  .way-title {
    font-family: SourceHanSansCN-Bold;
    font-size: 16px;
    color: #435068;
    text-align: left;
    line-height: 26px;
  }
}
</style>
