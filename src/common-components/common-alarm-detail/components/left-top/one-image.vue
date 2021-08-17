<template>
  <div class="one-image">
    <div class="full-image">
      <span class="title">{{ $t('全景图') }}</span>
      <full-image
        :info="info"></full-image>
    </div>
  </div>
</template>

<script>
import FullImage from './full-image';

export default {
  name: 'OneImage',
  components: {
    FullImage
  },
  props: {
    info: {
      type: Object,
      default: () => {}
    },
    appendToBody: {
      type: Boolean,
      default: true
    },
  },
  data() {
    return {

    };
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  methods: {},
};
</script>
<style lang="scss" scoped>
.one-image {
  display: flex;
  align-items: center;
  justify-content: center;
  .full-image {
    display: flex;
    flex-direction: column;
    width: 332px;
    height: 280px;
    .title {
      line-height: 32px;
      font-size: 14px;
      color: #869abb;
      flex-shrink: 0;
    }
  }
}
</style>
