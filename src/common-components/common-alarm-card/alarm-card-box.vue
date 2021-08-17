<template>
  <div
    @dragstart="onDragStart"
    @dragover="onDragOver"
    :draggable="draggable"
    class="alarm-card-box">
    <alarm-card
      @click="onCardClick"
      :show-process-status="showProcessStatus"
      :left-img-draggable="leftImgDraggable"
      :right-img-draggable="rightImgDraggable"
      :info="info"></alarm-card>
    <div class="icon-box">
      <meg-tooltip
        class="item"
        effect="meg"
        :content="isInStore ? $t('移出暂存架'):$t('加入暂存架')"
        placement="top">
        <span
          v-if="showStoreIcon"
          @click="temporaryOperation"
          :style="{
            'background':isInStore ?'#21539b':'#a1a7b3'
          }">
          <meg-icon
            name="all-store-stroke"
            height="14px"
            width="14px"
            color="white"></meg-icon>
        </span>
      </meg-tooltip>
      <span
        v-if="showDeleteIcon"
        @click="handleDelete"
        :style="{
          'background':'#a1a7b3'
        }">
        <meg-icon
          name="mission_del"
          height="14px"
          width="14px"
          color="white"></meg-icon>
      </span>
    </div>
  </div>
</template>

<script>

import { mapGetters } from 'vuex';
import AlarmCard from './alarm-card';
import alarmCardAdapter from './adapter.js';
import AlarmCardSrv from './alarm-card.service';

export default {
  name: 'AlarmCardBox',
  components: {
    AlarmCard
  },
  mixins: [alarmCardAdapter],
  props: {
    cardInfo: {
      type: Object,
      default: () => {}
    },
    draggable: {
      type: Boolean,
      default: false
    },
    showStoreIcon: {
      type: Boolean,
      default: true,
    },
    showDeleteIcon: {
      type: Boolean,
      default: false,
    },
    // 左侧图片是否支持拖拽
    leftImgDraggable: {
      type: Boolean,
      default: true,
    },
    // 右侧图片是否支持拖拽
    rightImgDraggable: {
      type: Boolean,
      default: true,
    },
    // 是否显示处理状态（战果內部展示的详情，不展示处理状态）
    showProcessStatus: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      info: {},
      temporaryMap: {
        'surveillance-task': 7,
        'alarm-history': 4,
        'alarm-realtime': 5,
      }
    };
  },
  computed: {
    ...mapGetters('shelf', [
      'deleteShelfData'
    ]),

    isInStore() {
      return this.cardInfo.temporaryFlag === 1;
    }
  },
  watch: {
    deleteShelfData(val) {
      if (val && val.id[0] === this.cardInfo.id) {
        this.$set(this.cardInfo, 'temporaryFlag', 0);
      }
    },

    'cardInfo.processStatus': function (val) {
      if (val) {
        this.$set(this.info, 'status', this.alarmProcessStatusMap[val]);
      }
    },
    cardInfo: {
      deep: true,
      handler() {
        if (Object.keys(this.cardInfo).length) {
          this.info = this.getNormalData(this.cardInfo);
        }
      }
    }
  },
  created() {
    this.info = this.getNormalData(this.cardInfo);
  },
  methods: {
    temporaryOperation() {
      if (this.cardInfo.temporaryFlag === 0) {
        this.addTemporaries();
      } else {
        this.deleteTemporaries();
      }
    },
    /**
     * @description 删除按钮点击
     */
    handleDelete() {
      this.$emit('delete', this.cardInfo);
    },
    /**
     * @description 获得tempOrigin参数
     * @param {name}
     * @returns
     */
    getTempOrigin(name) {
      if (/surveillance-task/.test(name)) {
        return this.temporaryMap['surveillance-task'];
      }
      if (/alarm-history/.test(name)) {
        return this.temporaryMap['alarm-history'];
      }
      if (/alarm-realtime/.test(name)) {
        return this.temporaryMap['alarm-realtime'];
      }
      return '';
    },
    addTemporaries() {
      const params = {
        temId: this.cardInfo.id,
        temType: 2,
        temOrigin: this.getTempOrigin(this.$route.name),
        snapshot: this.cardInfo
      };
      AlarmCardSrv.addTemporaries(params).then((res) => {
        if (res.code === 0) {
          this.$message.success(this.$t('加入暂存架成功'));
          this.$set(this.cardInfo, 'temporaryFlag', 1);
          this.$store.dispatch('shelf/manageShelf', {
            action: 'add',
            type: 'alarm',
            id: this.cardInfo.id
          });
        }
      });
    },
    deleteTemporaries() {
      const params = {
        temIds: [this.cardInfo.id],
        temType: 2,
      };
      AlarmCardSrv.deleteTemporaries(params).then((res) => {
        if (res.code === 0) {
          this.$message.success(this.$t('移出暂存架成功'));
          this.$set(this.cardInfo, 'temporaryFlag', 0);
          this.$store.dispatch('shelf/manageShelf', {
            action: 'delete',
            type: 'alarm',
            id: this.cardInfo.id
          });
        }
      });
    },
    /**
     * @description
     * @param {any}
     * @returns
     */
    onCardClick() {
      this.$emit('click');
    },
    /**
     * @description 拖拽开始时赋值
     */
    onDragStart(e) {
      if (!this.draggable) return;
      e.dataTransfer.setData('draggingData', JSON.stringify({ type: 'alarm', data: this.cardInfo }));
    },
    onDragOver(e) {
      e.preventDefault();
    },
    /**
     * @description 更新处理状态
     * @param {number} processStatus
     */
    updateProcessStatus(processStatus) {
      this.info.status = this.alarmProcessStatusMap[processStatus];
    },
  },
};
</script>
<style lang="scss" scoped>
.alarm-card-box {
  position: relative;
  .icon-box {
    position: absolute;
    right: 0;
    top: 0px;
    background: white;
    display: none;
    align-items: center;
    span {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 10px;
      margin-top: 10px;
      cursor: pointer;
      height: 26px;
      width: 26px;
      border-radius: 2px;
    }
  }
  &:hover {
    .icon-box {
      display: flex;
    }
  }
}
</style>
