<template>
  <div>
    <config-block>
      <div
        slot="title"
        class="database-class-header">
        <h3>人像底库逻辑分库</h3>
        <meg-switch
          v-model="configData.multiAlbum.value">
        </meg-switch>
        <span>
          {{ configData.multiAlbum.value?$t('已开启'):$t('已关闭') }}
        </span>
        <span class="database-class-title">{{ $t('开启后，系统创建的底库，一个逻辑库会对应多个实体库') }}</span>
      </div>
      <meg-form
        slot="content"
        class="database-table"
        :model="configData"
        v-if="numUpdate"
        ref="faceAlbumForm">
        <div
          class="database-class">
          <div class="database-header">
            <div class="database-th databaseName">
              {{ $t('实体库') }}
            </div>
            <div class="database-th database-info">
              {{ $t('说明') }}
            </div>
            <div class="database-th database-input">
              {{ $t('默认调分') }}（0~100）
            </div>
            <div class="database-th database-input">
              {{ $t('检索阈值') }}（0~100）
            </div>
          </div>
          <div
            class="database-tr"
            v-for="item in pkAlbumType"
            :key="item.code">
            <div class="database-td databaseName">
              {{ item.value }}
            </div>
            <div class="database-td database-info">
              {{ item.extra }}
            </div>
            <div class="database-td database-input">
              <meg-input-number
                v-model="configData[`multiAlbum_${item.code}_factor`].value"
                :disabled="!configData.multiAlbum.value"
                :clearable="false"
                :max="100"
                :min="0"
                @blur="numberChange(`multiAlbum_${item.code}_factor`)"
                :controls="false"></meg-input-number>
            </div>
            <div class="database-td database-input">
              <meg-input-number
                v-model="configData[`multiAlbum_${item.code}_threshold`].value"
                :disabled="!configData.multiAlbum.value"
                :clearable="false"
                :max="100"
                :min="0"
                @blur="numberChange(`multiAlbum_${item.code}_threshold`)"
                :controls="false"></meg-input-number>
            </div>
          </div>
        </div>
      </meg-form>
    </config-block>
  </div>
</template>
<script>
import ConfigBlock from './config-block';

export default {
  components: {
    ConfigBlock
  },
  props: {
    configData: {
      type: Object,
      default: () => {}
    },
    storageOptions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      numUpdate: true,
      pkAlbumType: this.$store.getters.dataMapByType('pk_album_type'),
    };
  },
  methods: {
    /**
     * 阈值或比分值改变触发
     * @param {Object} key 当前节点对象key
     */
    numberChange(key) {
      if (!this.configData[key].value) {
        this.numUpdate = false;
        this.configData[key].value = 0;
        this.$nextTick(() => {
          this.numUpdate = true;
        });
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.database-class-header {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #999999;
  h3 {
    font-weight: 500;
    font-size: 14px;
    margin-right: 20px;
  }
  .database-class-title {
    color: #999999;
    margin-left: 30px;
  }
  &::v-deep .meg-switch {
    margin-right: 10px;
  }
}
.database-table {
  background: #fff;
  margin: -10px 20px 20px;
}
.database-class {
  font-size: 14px;
  padding-bottom: 5px;
  width: 100%;
  .databaseName {
    color: #435068;
    width: 280px;
    font-weight: 600;
  }
  .database-info {
    width: 390px;
    color: #8a97a0;
  }
  .database-input {
    width: 300px;
    &:last-of-type {
      padding-left: 50px;
    }
  }
  .database-header {
    display: flex;
    padding-left: 10px;
    border-bottom: 2px solid #ebeef5;
    .database-th {
      color: #8a97a0;
      line-height: 40px;
    }
  }

  .database-tr {
    display: flex;
    padding-left: 10px;
    .database-td {
      line-height: 50px;
      .meg-input-number {
        width: 80px;
        margin-left: 10px;
      }
    }
  }
}
</style>
