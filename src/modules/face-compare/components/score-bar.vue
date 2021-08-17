<template>
  <div class="score-directions">
    <div class="score">
      <span
        v-for="(score,key) in verifyThreshold"
        :key="score"
        :class="`score${key+1}`">
        {{ Math.ceil(score) }}
      </span>
    </div>
    <div class="border-graduation">
      <span class="green-graduation"></span>
      <span class="yellow-graduation"></span>
      <span class="orange-graduation"></span>
      <span class="red-graduation"></span>
    </div>
    <div class="color-block">
      <span class="green">{{ $t('极可能不是一个人') }}</span>
      <span class="yellow">{{ $t('可能不是一个人') }}</span>
      <span class="orange">{{ $t('可能是一个人') }}</span>
      <span class="red">{{ $t('极可能是一个人') }}</span>
    </div>
  </div>
</template>

<script>
export default {
  components: {

  },
  props: {
    verifyThreshold: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
    };
  },
  methods: {

  },
};
</script>

<style lang='scss' scoped>
.score-directions {
  margin: 50px auto 0 auto;
  height: 50px;
  width: 550px;
  .border-graduation {
    display: flex;
  }
  .color-block {
    display: flex;
  }
  .score {
    height: 15px;
  }
  .score1 {
    display: inline-block;
    width: 30%;
    color: #4baf78;
    box-sizing: border-box;
    padding-left: 5px;
    font-family: "HEMIHEAD";
  }
  .score2 {
    width: 29%;
    display: inline-block;
    color: #dbac58;
    font-family: "HEMIHEAD";
  }
  .score3 {
    width: 20%;
    display: inline-block;
    color: #ed673e;
    font-family: "HEMIHEAD";
  }
  .score4 {
    display: inline-flex;
    width: 18%;
    color: #ce3636;
    font-family: "HEMIHEAD";
  }
  .score4 {
    display: inline-flex;
    width: 17%;
    color: #ce3636;
    font-family: "HEMIHEAD";
  }
  .score5 {
    @extend .score4;
    width: 4%;
  }
  .green {
    flex: 3;
    height: 34px;
    background-color: #4baf78;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 12px;
    color: #ffffff;
  }
  .green-graduation {
    height: 5px;
    flex-grow: 3;
    border-left: 1px solid #4baf78;
  }
  .yellow {
    height: 34px;
    flex: 3;
    background-color: #dbac58;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 12px;
    color: #ffffff;
  }
  .yellow-graduation {
    height: 5px;
    flex-grow: 3;
    border-left: 1px solid #dbac58;
    margin-left: 2px;
  }
  .orange {
    height: 34px;
    flex: 2;
    background-color: #ed673e;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 12px;
    color: #ffffff;
  }
  .orange-graduation {
    height: 5px;
    flex-grow: 2;
    border-left: 1px solid #ed673e;
    margin-left: 2px;
  }
  .red-graduation {
    height: 5px;
    flex-grow: 2;
    border-left: 1px solid #ce3636;
    border-right: 1px solid #ce3636;
    margin-left: 1px;
  }
  .red {
    height: 34px;
    flex: 2;
    background-color: #ce3636;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 12px;
    color: #ffffff;
  }
}
</style>
