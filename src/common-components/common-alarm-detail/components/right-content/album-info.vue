<template>
  <div
    class="album-info">
    <p>
      <label> {{ $t('姓名') }}</label>
      <span v-tooltip="true">{{ info.albumPhotoName }}</span>
    </p>
    <p>
      <label> {{ $t('在逃编号') }}</label>
      <span v-tooltip="true">{{ info.criminalNumber }}</span>
    </p>
    <p>
      <label>{{ $t('证件类型') }}</label>
      <span>{{ info.cardTypeName }}</span>
    </p>
    <p>
      <label>{{ $t('证件号码') }}</label>
      <span
        class="span-before-btn"
        v-tooltip="true">{{ info.cardNo }}</span>
      <span
        v-if="info.cardNo"
        class="icon-tip-can-right-blue"
        @click="copyAction(info.cardNo)">{{ $t('复制') }}</span>
    </p>
    <p class="icon-tip-can-box">
      <label>{{ $t('底库') }}</label>
      <span
        class="span-before-btn"
        v-tooltip="true">{{ info.albumName }}</span>
      <template v-if="showCancelCorrelation || !info.cascadeId">
        <span
          class="icon-tip-can-right-grey span-before-btn-tip"
          v-if="info.currentMoveStatus===2">{{ $t('已撤销') }}</span>
        <span
          class="icon-tip-can-right-blue span-before-btn-tip"
          v-if="info.currentMoveStatus===1"
          @click="onClickMove">{{ $t('撤销') }} </span>
        <meg-tooltip
          :content="$t('撤销布控后，该布控人员将被移入撤控库，不再产生报警')"
          placement="top">
          <div class="tooltip-box">
            <meg-icon
              width="12"
              height="12"
              color="#A1A7B3"
              v-if="info.currentMoveStatus === 1 || info.currentMoveStatus === 2"
              class="icon-tip-can-right"
              name="help_prompt"></meg-icon>
          </div>
        </meg-tooltip>
      </template>
    </p>
    <p>
      <label>{{ $t('民族') }}</label>
      <span>{{ info.nationName }}</span>
    </p>
    <p>
      <label>{{ $t('性别') }}</label>
      <span>{{ info.genderName }}</span>
    </p>
    <p>
      <label>{{ $t('出生日期') }}</label>
      <span>{{ info.photoBirthday }}</span>
    </p>
    <p>
      <label>  {{ $t('籍贯') }}</label>
      <span>{{ info.addrName }}</span>
    </p>
    <p>
      <label> {{ $t('备注') }}</label>
      <span
        v-tooltip="true"
        class="inline-block">{{ info.photoRemark }}</span>
    </p>
    <p>
      <label> {{ $t('布控原因') }}</label>
      <span
        v-tooltip="true"
        class="inline-block">{{ info.monitorReason }}</span>
    </p>
    <p>
      <label> {{ $t('报警联系人') }}</label>
      <span
        v-tooltip="true"
        class="inline-block">{{ info.albumContact }}</span>
    </p>
    <p v-if="info.realAlarmTimes">
      <label> {{ $t('相机报警') }}</label>
      <span
        v-tooltip="true"
        class="inline-block span-before-btn">{{ info.realAlarmTimes }}{{ $t('次') }}</span>
      <span
        class="icon-tip-can-right-blue"
        v-if="isShowAlarmTimes"
        @click="goToHistoryAlarm('camera')">{{ $t('查看') }} > </span>
    </p>
    <p v-if="info.historyAlarmTimes">
      <label> {{ $t('录像报警') }}</label>
      <span
        v-tooltip="true"
        class="inline-block span-before-btn">{{ info.historyAlarmTimes }}{{ $t('次') }}</span>
      <span
        class="icon-tip-can-right-blue"
        v-if="isShowAlarmTimes"
        @click="goToHistoryAlarm('video')">{{ $t('查看') }} > </span>
    </p>
    <p v-if="info.offlineAlarmTimes">
      <label> {{ $t('文件报警') }}</label>
      <span
        v-tooltip="true"
        class="inline-block span-before-btn">{{ info.offlineAlarmTimes }}{{ $t('次') }}</span>
      <span
        class="icon-tip-can-right-blue"
        v-if="isShowAlarmTimes"
        @click="goToHistoryAlarm('file')">{{ $t('查看') }} > </span>
    </p>
    <p>
      <label> {{ $t('累计报警') }}</label>
      <span
        v-tooltip="true"
        class="inline-block span-before-btn">{{ info.alarmTimes }}{{ $t('次') }}</span>
    </p>
  </div>
</template>
<script>
import { switchToModule } from '@/utils/utils';

export default {
  name: 'Info',
  props: {
    info: {
      type: Object,
      required: true,
      default: () => {}
    },

  },
  computed: {

    // 是否显示查看
    isShowAlarmTimes() {
      return this.info.alarmTimes > 1 && this.info.cardNo;
    },
    // 是否显示撤销相关
    showCancelCorrelation() {
      const cascadeLevel = this.$store.getters.systemByType('cascadeLevel').value;
      return cascadeLevel !== '2';
    }
  },
  methods: {
    onClickMove() {
      const vm = this;
      this.$confirm(`${this.$t('是否确定将当前人员信息移入撤控库')}?`, this.$t('确认移入撤控库'), {
        confirmButtonText: this.$t('确定'),
        cancelButtonText: this.$t('取消')
      })
        .then(() => {
          vm.moveAlbum();
        })
        .catch(() => { });
    },
    moveAlbum() {
      this.$emit('move-deploy');
    },
    copyAction(idCardNumber) {
      this.$clipboard(idCardNumber).then(() => {
        this.$message.success(this.$t('复制成功'));
      }, () => {
        this.$message.error(this.$t('复制失败'));
      });
    },
    goToHistoryAlarm(type) {
      const destRoute = this.info.cascadeId ? 'cascade-alarm-history' : 'alarm-history';
      const objNew = {
        module: destRoute,
        query: {
          photoCardNo: this.info.cardNo,
          t: Date.now(),
          strategyTypeId: this.info.strategyTypeId,
          type,
          identityType: this.info.identityType,
          minSimilarity: 0,
          maxSimilarity: 100,
          timeArr: JSON.stringify(['', ''])
        }
      };
      switchToModule(objNew);
    },
  }
};
</script>
<style scoped lang="scss">
.album-info {
  height: 100%;
  width: 100%;
  overflow-y: auto;
  .tooltip-box {
    display: inline-block;
  }
  .icon-tip-can-box {
    display: flex;
    align-items: center;
  }
  .icon-tip-can-right-grey {
    color: #869abb;
  }
  .icon-tip-can-right-blue {
    color: #21539b;
    cursor: pointer;
  }
  p {
    line-height: 30px;
    font-size: 14px;
    display: flex;
    label {
      width: 86px;
      text-align: right;
      color: #869abb;
      margin-right: 12px;
      flex-shrink: 0;
    }
    span {
      color: #435068;
      display: inline-block;
      vertical-align: middle;
    }
    .span-before-btn {
      display: inline-block;
      width: 158px;
    }
    .span-before-btn-tip {
      margin-right: 0px;
    }
  }
  .copy-btn {
    padding: 0 0 0 5px !important;
  }
}
.i18n-en-US {
  .album-info {
    p {
      line-height: 26px;
    }
  }
}
.inline-block {
  display: inline-block;
}
/* .album-info p span.alarm-name {
  display: inline-block;
  max-width: 118px;
  vertical-align: middle;
} */

.move-btn-box {
  text-align: center;
  width: 100%;
  height: 56px;
}
.move-btn-box button {
  width: 270px;
  margin-top: 22px;
  margin-left: -18px;
}
</style>
