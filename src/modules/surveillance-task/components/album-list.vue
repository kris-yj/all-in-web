<template>
  <div class="album-list">
    <div
      v-for="(item,index) in realList"
      :key="index"
      class="item">
      <span
        v-tooltip="true"
        :style="{'width':(item.albumType !== 5 && item.albumType !== 6)? '168px':'258px'}"
        class="name">
        {{ item.albumName }}
      </span>
      <meg-input-number
        v-if="(item.albumType !== 5 && item.albumType !== 6)"
        v-model="item.showThreshold"
        :placeholder="$t('请输入阈值')"
        @change="handleChange(item,index)"
        :controls="false"
        :precision="2"
        :min="0"
        :max="100"></meg-input-number>
      <span
        @click="deleteItem(index)"
        class="icon-box">
        <meg-icon
          name="circle_del"
          width="20"
          height="20"
          color="red white"></meg-icon>
      </span>
    </div>
  </div>
</template>

<script>
import { reactive, watch, toRefs } from '@vue/composition-api';

export default {
  props: {
    list: {
      type: Array,
      default: () => []
    },
  },
  setup(props, { emit }) {
    const obj = reactive({
      realList: []
    });
    obj.realList = JSON.parse(JSON.stringify(props.list));
    watch(() => props.list, (newValue) => {
      obj.realList = JSON.parse(JSON.stringify(newValue));
    });
    function handleChange() {
      emit('data-change', obj.realList.map((val) => val));
    }
    function deleteItem(index) {
      obj.realList.splice(index, 1);
      handleChange();
    }
    return {
      ...toRefs(obj),
      handleChange,
      deleteItem,
    };
  }
};
</script>
<style lang="scss" scoped>
.album-list {
  .item {
    height: 34px;
    display: flex;
    align-items: center;
    font-size: 14px;
    margin-bottom: 20px;
    color: #435068;
    .icon-box {
      display: flex;
      width: 20px;
      height: 20px;
      cursor: pointer;
    }
    .meg-input-number {
      width: 90px;
      margin-right: 10px;
      margin-left:12px;
    }
      ::v-deep.meg-input{
        width: 90px;
      }
  }
}
</style>
