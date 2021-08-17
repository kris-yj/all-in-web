<template>
  <div class="face-identity-content">
    <select-frame
      ref="selectFrame"
      :list="list"
      item-key="photoId"
      @check-list-change="selecting(arguments)">
      <template
        v-slot="{item,index}">
        <database-card
          draggable
          :card-data="item"
          :show-jump-button="!isSelectMode"
          :show-temporary-button="!isSelectMode"
          @card-click="clickCard(index)">
        </database-card>
      </template>
    </select-frame>
    <div
      class="load-more-box"
      v-if="list.length && loadMore && !isSelectMode">
      <meg-button @click="$emit('load-more')">
        {{ $t('加载更多') }}
      </meg-button>
    </div>
    <common-database-detail
      :index="detailIndex"
      :visible.sync="detailVisible"
      :result-list="detailList"></common-database-detail>
  </div>
</template>

<script>
import { SelectFrame } from '@/common-components/common-collapse';
import DatabaseCard from '@/common-components/common-database-card';
import CommonDatabaseDetail from '@/common-components/common-database-detail';

export default {
  components: {
    DatabaseCard,
    CommonDatabaseDetail,
    SelectFrame
  },
  props: {
    resultList: {
      type: Object,
      default: () => {}
    },
    isSelectMode: {
      type: Boolean,
      default: false
    },
    loadMore: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      detailVisible: false,
      detailIndex: -1,
      detailList: []
    };
  },
  computed: {
    list() {
      return this.resultList.records ? this.resultList.records : [];
    }
  },
  watch: {
    isSelectMode(val) {
      if (val === false) {
        this.$refs.selectFrame.setCheckedKeys();
      }
    }
  },
  methods: {
    selecting(arg) {
      this.$emit('checked-change', arg[1]);
    },
    clickCard(index) {
      this.eventTracking('FaceIdentityDetail');
      this.detailVisible = true;
      this.detailList = this.list;
      this.detailIndex = index;
    },
  },
};
</script>

<style lang='scss' scoped>
.face-identity-content {
  height: 100%;
  ::v-deep .meg-checkbox__input {
    top: 4px;
  }
  .load-more-box {
    text-align: center;
    width: 100%;
    height: 56px;
    button {
      width: 300px;
      margin-top: 10px;
    }
  }
}
</style>
