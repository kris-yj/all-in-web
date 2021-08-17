<template>
  <common-form-container
    class="search-form"
    @reset="reset"
    :content-style="{ 'padding': '20px 25px 25px 25px' }"
    :header-text="$t('级联报警')"
    @search="search">
    <camera-form
      ref="camera"
      :album-tree-data="albumTreeData"
      :cascade-list="cascadeList"
      :default-data="defaultData"></camera-form>
  </common-form-container>
</template>

<script>
import CommonFormContainer from '@/common-components/common-form-container';
import CameraForm from './search/camera';

const refMap = {
  1: 'camera',
};

export default {
  name: 'SearchForm',
  components: {
    CommonFormContainer, CameraForm
  },
  props: {
    albumTreeData: {
      type: Array,
      default: () => []
    },
    defaultData: {
      type: Object,
      default: () => {}
    },
    // 级联单位列表
    cascadeList: {
      type: Array,
      default: () => []
    },
  },
  data() {
    return {
      activeDrop: {
        // type: 1,
        // name: this.$t('按相机检索'),
      },

      dropdownList: [
        {
          type: 1,
          name: this.$t('按相机检索'),
        },
      ],
      dropMap: {
        'camera': {
          type: 1,
          name: this.$t('按相机检索'),
        },
      }
    };
  },
  computed: {},
  watch: {
    activeDrop(val) {
      this.$emit('tab-change', val.type);
    }
  },
  created() {},
  mounted() {},
  methods: {
    /**
     * @description 搜索
     */
    search() {
      this.$nextTick(() => {
        const params = this.$refs[refMap[this.activeDrop.type]].getCondition();
        this.$emit('search', { ...params, source: 'CASCADE' });
      });
    },
    /**
     * @description 重置
     */
    reset() {
      this.$refs[refMap[this.activeDrop.type]].reset();
      this.$emit('reset');
    },

    /**
     * @description 检索类型变更
     * @param {object} val
     */
    changeDropdown(val) {
      this.activeDrop = val;
      this.search();
    },
    /**
     * @description 设置当前搜索维度
     * @param {any}
     * @returns
     */
    setActiveDrop(obj) {
      this.activeDrop = this.dropMap[obj.type];
    },
    /**
     * @description 设置默认检索条件,主要是外部跳转到这里产生得功能
     * @param {object} obj
     */
    setDefaultCondition(obj) {
      this.$nextTick(() => {
        this.$refs[obj.type].setCondition(obj);
      });
    },
  }
};
</script>
<style lang="scss" scoped>
.search-form {
  .meg-dropdown-link {
      cursor: pointer;
      display: flex;
      align-items: center;
      color: #21539b!important;
      .meg-dropdown-link-icon {
        margin-left:5px;
        font-size: 12px;
        transform: rotate(0deg);
      }
    }
}
</style>
