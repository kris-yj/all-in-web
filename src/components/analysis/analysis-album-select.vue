<template>
  <div class="sets-wrap">
    <meg-treeselect
      class="sets"
      ref="compareSets"
      standard-tree-data
      :show-count="false"
      :data="albums"
      show-checkbox
      :brief-selected-info="true"
      :placeholder-text="placeholder"
      :all-selected-text="$t('全部')"
      count-right-bottom
      @tree-update-ready="treeReady"
      @check-change="compareSetsChange">
    </meg-treeselect>
    <div
      ref="aaa"
      :key="item.id"
      v-for="item of chosedAlbums"
      class="sets-threshold">
      <span
        class="album-item-text"
        v-tooltip="true">{{ item.name || item.albumName }}</span>
      <meg-input-number
        v-if="!isLicense"
        placeholder="请输入报警阈值"
        v-model="item.threshold"
        :controls="false"
        :min="0"
        :max="100"
        :precision="2"></meg-input-number>
      <meg-icon
        name="circle_del"
        width="20"
        height="20"
        color="red white"
        @click="delItem(item.id)"></meg-icon>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    // 某种类型的底库全部数据
    albumData: {
      type: Array,
      default: () => []
    },
    // 初始化占位符
    placeholder: {
      type: String,
      default: '请选择'
    },
    albumType: {
      type: Number,
      default: () => 1
    },
    initData: {
      type: Array,
      default: () => []
    },
    defaultThreshold: {
      type: Number,
      default: 0.00
    },
    isLicense: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      chosedAlbums: []
    };
  },
  computed: {
    albums() {
      this.albumData.forEach((item) => {
        item.label = item.name;
      });
      return this.albumData;
    }
  },
  watch: {
    initData: {
      immediate: true,
      handler(data) {
        if (data && data.length) {
          data.forEach((item) => {
            item.albumType = this.albumType;
          });
          this.chosedAlbums = data;
          if (this.$refs.compareSets) {
            this.$refs.compareSets.setCheckedKeys(data.map((item) => (item.albumId || item.id)));
          }
        }
      }
    }
  },
  methods: {
    delItem(id) {
      console.log(this.chosedAlbums, id, '1');
      const { chosedAlbums } = this;
      chosedAlbums.forEach((item, i) => {
        if (item.id === id) {
          chosedAlbums.splice(i, 1);
        }
      });
      this.chosedAlbums = [...chosedAlbums];
      if (this.$refs.compareSets) {
        this.$refs.compareSets.setCheckedKeys(chosedAlbums.map((item) => (item.albumId || item.id)));
      }
    },
    treeReady() {
      if (this.initData && this.initData.length) {
        this.$refs.compareSets.setCheckedKeys(this.chosedAlbums.map((item) => (item.albumId || item.id)));
      }
    },
    setCheckedKeys(val) {
      this.$refs.compareSets.setCheckedKeys(val);
    },
    getCheckedKeys() {
      return this.$refs.compareSets.getCheckedKeys(true);
    },
    /**
     * @description 比对底库发生变化的时候
     */
    compareSetsChange(curr) {
      curr.threshold = this.defaultThreshold;
      curr.albumType = this.albumType;
      const { chosedAlbums } = this;
      if (chosedAlbums.find((item) => item.id === curr.id)) {
        chosedAlbums.forEach((item, ins) => {
          if (item.id === curr.id) {
            chosedAlbums.splice(ins, 1);
          }
        });
      } else {
        this.chosedAlbums.push(curr);
      }
    },
  }
};
</script>
<style lang="scss">
  .sets-wrap{
    .sets{
      width: 270px;
    }
    .sets-threshold{
      width: 270px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 20px;
      .album-item-text {
        flex: 1;
      }
      .meg-input-number {
        width: 94px;
      }
      .meg-icon {
        cursor: pointer;
        margin-left: 10px;
      }
    }
  }
</style>
