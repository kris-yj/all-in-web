<template>
  <div class="alarm-local-compare">
    <span class="title">{{ $t('本地 比对结果Top 3') }}:</span>
    <meg-card
      class="top3-card"
      v-for="item in cardInfo"
      :key="item.photoId"
      right-width="190px"
      img-border="0"
      :img-src="item.photoUrl">
      <div slot="right">
        <p class="card-line newFont score">
          {{ item.score }}
        </p>
        <p
          class="card-line name"
          v-tooltip="true">
          <meg-icon
            color="#D1D5DD"
            width="11"
            height="11"
            name="card_face"></meg-icon>&nbsp;{{ item.name }}&nbsp;&nbsp;{{ getGender(item.gender) }}
        </p>
        <p
          class="card-line">
          <meg-icon
            color="#D1D5DD"
            width="11"
            height="11"
            name="ID"></meg-icon>&nbsp;
          <span
            v-tooltip="true">{{ item.idCard }}</span>
          <span
            v-if="item.idCard"
            class="icon-tip-cancmeg-right-blue"
            @click="copyAction(item.idCard)">{{ $t('复制') }}</span>
        </p>
        <p
          class="card-line"
          v-tooltip="true">
          <meg-icon
            color="#D1D5DD"
            width="11"
            height="11"
            name="card_remark"></meg-icon>&nbsp;{{ item.remark }}
        </p>
      </div>
    </meg-card>
    <div
      class="empty-background"
      v-if="!cardInfo.length">
      {{ $t('暂无数据') }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    cardInfo: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {

    };
  },
  methods: {
    copyAction(idCardNumber) {
      this.$clipboard(idCardNumber).then(() => {
        this.$message.success(this.$t('复制成功'));
      }, () => {
        this.$message.error(this.$t('复制失败'));
      });
    },
    getGender(value) {
      let gender = '';
      if (value) {
        const genderArr = this.$store.getters.dataMapByType('common_gender');
        genderArr.forEach((item) => {
          if (item.code === value) {
            gender = item.value;
          }
        });
      }
      return gender;
    },
  }
};
</script>

<style scoped lang="scss">
.alarm-local-compare{
    margin-left: 20px;
    height: 390px;
    width: 305px;
    .card-line{
      margin: 2px 0;
      padding-left: 5px;
      font-size: 12px;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      color: #5a6676;
    }
    .title {
      color: #869abb;
      display:inline-block;
      margin-bottom: 10px;
    }
    .top3-card{
      box-shadow: none;
      background-color: #f9f9f9;
    }
    .score{
      font-size: 24px;
      color: #21539b;
    }
    .icon-tip-cancmeg-right-blue {
      color: #21539b;
      cursor: pointer;
      margin-left: 5px;
    }
    .empty-background {
      height: 100%;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #999;
    }
}

</style>
