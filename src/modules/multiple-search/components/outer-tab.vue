<template>
  <!-- 有图 无图 切换 -->
  <div
    class="outer__tab">
    <div
      class="outer__tab-item"
      v-for="item in items"
      :class="{'active': item.code===value}"
      @click="$emit('change', item.code)"
      :key="item.code">
      <img :src="icons[item.code+(item.code===value?'Active':'')]" />
      <span>{{ item.name }}</span>
    </div>
  </div>
</template>

<script>
import textIcon from '@/assets/images/multiple-search/text.png';
import textActiveIcon from '@/assets/images/multiple-search/text-active.png';
import imgIcon from '@/assets/images/multiple-search/img.png';
import imgActiveIcon from '@/assets/images/multiple-search/img-active.png';

const icons = {
  text: textIcon,
  textActive: textActiveIcon,
  img: imgIcon,
  imgActive: imgActiveIcon
};

export default {
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    // 当前项
    value: {
      type: null,
      default: undefined,
    },
    items: {
      type: Array,
      default: () => [
        {
          code: 'img',
          name: '有图检索',
        },
        {
          code: 'text',
          name: '无图检索',
        },
      ],
    }
  },
  data() {
    return {
      icons
    };
  },
  computed: {
  }
};
</script>

<style lang="scss" scoped>
.outer__tab{
  display: flex;
}
.outer__tab-item{
  height: 46px;
  line-height: 46px;
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  transition: all .2s cubic-bezier(.645,.045,.355,1);
  margin-left: 48px;
  &:first-child{
    margin-left: 0;
  }
  img{
    width: 56px;
    margin-left: 8px;
  }
  &:hover{
    color: #21539B;
    font-weight: bold;
  }
  &::after{
    content: '';
    width: 0;
    height: 0;
    position: absolute;
    top: 39px;
    left: 26px;
    border-style: solid;
    border-width: 8px 8px 10px 8px;
    border-color: transparent transparent #fff transparent;
    display: none;
  }

}
.outer__tab-item.active{
  font-weight: bold;
  color: #21539B;
  &::after{
    display: block;
  }
}

</style>
