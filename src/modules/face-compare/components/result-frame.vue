<template>
  <div
    class="result-frame">
    <p class="list-title">
      {{ $t('检索到有多个结果，请选择') }}
    </p>
    <div class="sroll-bar">
      <div
        class="card-container"
        v-for="(item,index) in resultList"
        @click="$emit('select-result',index)"
        :key="index">
        <meg-img-container
          :class="{active:rightImgFile.index === index}"
          class="result-card"
          :img-src="item.photoUrl">
          <span
            class="result-score"
            slot="operate-one">{{ Number(item.score).toFixed(2) }}</span>
        </meg-img-container>
        <p
          v-tooltip="true"
          class="album-name">
          {{ item.albumName }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  components: {

  },
  props: {
    resultList: {
      type: Array,
      default: () => []
    },
    rightImgFile: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {

    };
  },
  computed: {
  },
  methods: {

  },
};
</script>

<style lang='scss' scoped>
.result-frame {
  position: relative;
  width: 340px;
  height: 300px;
  display: inline-block;
  background: #eceff4;
  margin-left: 7px;
  padding: 15px 15px;
  .sroll-bar {
    height: 100%;
    overflow-y: auto;
  }
  .list-title {
    position: absolute;
    font-size: 12px;
    color: #89969f;
    top: -20px;
    left: 0;
  }
  .card-container {
    float: left;
    margin: 5px 5px 16px 5px;
    cursor: pointer;
    overflow: hidden;
    .active {
      border: 2px solid #5c96f2 !important;
    }
  }
  .album-name {
    font-size: 12px;
    color: #435068;
    line-height: 18px;
    height: 36px;
    width: 100px;
  }
  .result-card {
    width: 96px;
    height: 96px;
    border: 2px solid #d7dadf;
    .result-score {
      font-size: 14px;
      position: absolute;
      color: #ffffff;
      font-family: "HEMIHEAD";
      width: 36px;
      height: 22px;
      bottom: 0;
      right: 0;
      background-color: rgba(211, 7, 7, 0.7);
      display: inline-flex;
      justify-content: center;
      align-items: center;
    }
  }
}
</style>
