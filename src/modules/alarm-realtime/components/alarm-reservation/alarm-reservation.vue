<template>
  <div class="alarm-reservation-container-box">
    <div class="container-top">
      <div class="title-container">
        <span class="title-name">{{ $t('报警订阅') }}</span>
        <meg-button
          type="primary"
          size="small"
          @click="saveAlarm">
          {{ $t('保存并应用') }}
        </meg-button>
      </div>
      <div class="level-container content-box-all">
        <div class="level-container-title">
          <meg-icon
            name="alarmRealtime_menu"
            width="15"
            height="15"
            color="#435068"></meg-icon>
          <span>{{ $t('报警级别') }}</span>
        </div>
        <div class="level-content-container">
          <div
            class="alarm-level"
            @click="checkLevel(levelItem)"
            :key="levelItem.code"
            :class="{'active':levelItem.checked}"
            v-for="levelItem in alarmLevels">
            <span>{{ levelItem.value }}</span>
          </div>
        </div>
      </div>
      <div class="alarm-sound-container content-box-all">
        <span class="icon-container">
          <meg-icon
            class="icon"
            name="volume"
            width="12"
            height="12"
            color="#435068"></meg-icon>
          <span>{{ $t('报警声音') }}</span>
        </span>

        <meg-switch
          active-color="#21539B"
          v-model="alarmReservationData.voiceEnable">
        </meg-switch>
      </div>
      <div class="alarm-sound-container title content-box-all">
        <span class="icon-container ">
          <meg-icon
            class="icon"
            name="all-in-task"
            width="12"
            height="12"
            color="#435068"></meg-icon>
          <span>{{ $t('订阅布控') }}</span>
        </span>
        <div
          @click="configAllTask"
          class="btn">
          {{ $t('配置相机底库') }}
        </div>
      </div>
    </div>
    <div class="tree-box">
      <meg-tree
        ref="tree"
        :data="treeData"
        :show-checkbox="true"
        :props="treeProps"
        :record-dynamic-select="true">
        <template v-slot="{data}">
          <div
            v-if="data.flag !== 'root'"
            class="item-box">
            <div
              class="content">
              <span
                v-tooltip="true"
                class="title">{{ data.name }}</span>
              <div
                v-tooltip="true"
                class="tips">
                <span v-if="data.flag === 'local'">{{ `${$t('相机')}: ${data.cameraSelectNum}/${data.cameraAllNum}` }}</span>
                <span>{{ `${$t('底库')}: ${data.albumSelectNum}/${data.albumAllNum}` }}</span>
              </div>
            </div>
            <div
              @click="configSingle(data)"
              class="btn">
              {{ $t('配置') }}
            </div>
          </div>
          <!-- <div
            v-if="data.flag !== 'root'"
            class="item-box">
            <span>
              {{ item.name }}
            </span>
            <span>
              {{}}
            </span>
          </div> -->
        </template>
      </meg-tree>
    </div>
    <config-task
      v-if="isShowSingleConfig"
      @close="isShowSingleConfig = false"
      @update="getInfo"
      :info="singleTaskData"></config-task>
    <config-task-album
      v-if="isShowCascadeSingleConfig"
      @close="isShowCascadeSingleConfig = false"
      @update="getInfo"
      :info="singleTaskData"></config-task-album>
    <config-task-all
      v-if="isShowAllConfig"
      @close="isShowAllConfig = false"
      @update="getInfo"
      :info="singleTaskData"></config-task-all>
  </div>
</template>

<script>
import AlarmRealTimeSrv from '../../alarm-realtime.service.js';
import ConfigTask from './config-task';
import ConfigTaskAlbum from './config-task-album';
import ConfigTaskAll from './config-task-all';
import { mapIconShow, mapIconName, mapIconColor } from './utils';

export default {
  name: 'AlarmReservation',
  components: {
    ConfigTask,
    ConfigTaskAlbum,
    ConfigTaskAll
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // TODO
      alarmReservationData: {
        level: [],
        voiceEnable: true,
        strategies: [],
        cascadeStrategies: [],
      },
      alarmLevels: [],
      activeIndex: 0,
      activeCascadeIndex: 0,
      mapIconShow,
      mapIconName,
      mapIconColor,

      isShowMultiLevelTask: false, // 是否显示多级
      treeData: [],
      treeProps: { children: 'items', label: 'name' },
      singleTaskData: {}, // 单个布控任务信息
      localSelected: [],
      cascadeSelected: [],
      isShowSingleConfig: false, // 是否显示配置单个本地布控任务
      isShowCascadeSingleConfig: false, // 是否显示配置单个级联布控任务
      isShowAllConfig: false, // 是否显示配置所有布控任务
    };
  },
  watch: {
    visible() {
      this.$nextTick(() => {
        this.$refs.tree.resize();
      });
    }
  },
  created() {
    this.alarmLevels = this.$store.getters.dataMap.realtime_level.map((item) => ({ checked: false, ...item }));
    const cascadeLevel = this.$store.getters.systemByType('cascadeLevel');

    if (cascadeLevel && cascadeLevel.value === '1') {
      this.isShowMultiLevelTask = true;
    } else {
      this.isShowMultiLevelTask = false;
    }
  },
  mounted() {
    this.init();
  },
  methods: {
    /**
    * @description 初始化
    */
    init() {
      this.getInfo();
    },
    checkLevel(obj) {
      obj.checked = !obj.checked;
    },
    configAllTask() {
      this.config({}, (obj) => {
        const cameras = obj.cameras.map((item) => ({
          ...item,
          flag: 'camera',
          // indeterminate: item.select === 2,
          selected: item.select === 1
        }));

        const albums = obj.albums.map((item) => ({
          ...item,
          flag: 'album',
          indeterminate: item.select === 2,
          selected: item.select === 1
        }));
        this.singleTaskData = {
          ...obj,
          cameraTree: [
            {
              id: 'root',
              name: this.$t('全部'),
              flag: 'root',
              items: cameras,
              strategySelectNum: 0,
              strategyAllNum: 0,
            }
          ],
          cameras,
          albumTree: [
            {
              id: 'root',
              name: this.$t('全部'),
              flag: 'root',
              items: albums,
              strategySelectNum: 0,
              strategyAllNum: 0,
            }
          ],
          albums
        };
        this.isShowAllConfig = true;
      });
    },
    updateAlarmConfiguration() {
      // 设置获取到的报警级别
      const setLevelObj = {};
      this.alarmReservationData.level.forEach((item) => { setLevelObj[item] = item; });
      this.alarmLevels.forEach((item) => {
        if (setLevelObj[item.code]) {
          item.checked = true;
        }
      });
      const arr = [];
      const localSelected = [];
      const cascadeSelected = [];

      const objLocal = {
        name: this.isShowMultiLevelTask ? this.$t('本地布控任务') : this.$t('全部'),
        id: 'localRoot',
        items: [],
        flag: 'root'
      };
      objLocal.items = this.alarmReservationData.strategies.map((item) => {
        if (item.select === 1) {
          localSelected.push(item.id);
        }
        return {
          ...item,
          flag: 'local'
        };
      });
      arr.push(objLocal);
      if (this.isShowMultiLevelTask) {
        const objCas = {
          name: this.$t('级联布控任务'),
          id: 'casRoot',
          items: [],
          flag: 'root'
        };
        objCas.items = this.alarmReservationData.cascadeStrategies.map((item) => {
          if (item.select === 1) {
            cascadeSelected.push(item.id);
          }
          return {
            ...item,
            flag: 'cas'
          };
        });
        arr.push(objCas);
      }
      this.treeData = arr;
      this.localSelected = localSelected;
      this.cascadeSelected = cascadeSelected;
      this.$emit('setting-ready', this.alarmReservationData.voiceEnable);
      this.$nextTick(() => {
        if (this.$refs.tree) this.$refs.tree.setCheckedKeys([...localSelected, ...cascadeSelected]);
      });
    },

    /**
     * @description 保存订阅
     */
    saveAlarm() {
      const params = { ...this.alarmReservationData };
      // 获取设置的报警级别数组
      const level = [];
      this.alarmLevels.forEach((element) => {
        if (element.checked) {
          level.push(element.code);
        }
      });
      params.level = level;
      const checked = this.$refs.tree.getCheckedNodes();
      const localSelected = checked.filter((item) => item.flag === 'local').map((item) => item.id);
      const cascadeSelected = checked.filter((item) => item.flag === 'cas').map((item) => item.id);
      params.strategies.forEach((val) => {
        val.select = 0;
        if (localSelected.includes(val.id)) {
          val.select = 1;
        }
      });
      params.cascadeStrategies.forEach((val) => {
        val.select = 0;
        if (cascadeSelected.includes(val.id)) {
          val.select = 1;
        }
      });
      AlarmRealTimeSrv.saveSubConfiguration(params).then(() => {
        this.$emit('setting-change', this.alarmReservationData.voiceEnable);
        this.$message.success(this.$t('保存成功'));
      });
    },

    /**
     * @description 获取报警订阅信息
     */
    getInfo() {
      AlarmRealTimeSrv.getSubConfiguration().then((res) => {
        if (res.code === 0) {
          this.alarmReservationData = res.data;

          this.updateAlarmConfiguration();
        }
      });
    },
    configSingle(data) {
      this.config({ strategyId: data.id }, (obj) => {
        this.singleTaskData = {
          ...obj,
          title: data.name,
          strategyId: data.id,
          cameraTree: [
            {
              id: 'root',
              name: this.$t('全部'),
              items: obj.cameras.map((item) => ({
                ...item,
                flag: 'camera'
              }))
            }
          ],
          albumTree: [
            {
              id: 'root',
              name: this.$t('全部'),
              items: obj.albums
            }
          ]
        };
        if (data.flag === 'local') {
          this.isShowSingleConfig = true;
        } else {
          this.isShowCascadeSingleConfig = true;
        }
      });
    },
    /**
     * @description 配置任务
     * @param {object} data
     * @returns
     */
    config(data, fn = () => {}) {
      AlarmRealTimeSrv.getCameraAlbum(data).then((res) => {
        if (res.code === 0) {
          fn(res.data);
        }
      });
    },
  }
};
</script>
<style scoped lang="scss">
.alarm-reservation-container-box {
  width: 320px;
  height: 100%;
  box-sizing: border-box;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.3);
  border-radius: 0.2px;
  .container-top {
    padding: 0px 10px;
    flex-shrink: 0;
    .content-box-all {
      margin: 0 10px;
      border-bottom: 1px solid #dadada;
      &:last-of-type {
        border-bottom: none;
      }
    }
    .title-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #dadada;
      .title-name {
        font-size: 16px;
        line-height: 41px;
      }
    }

    .level-container {
      padding-top: 6px;
      overflow: hidden;
      .level-container-title {
        display: flex;
        align-items: center;
        span {
          line-height: 22px;
          display: inline-block;
          margin-left: 8px;
          color: #435068;
          font-size: 14px;
        }
      }
      .level-content-container {
        margin-top: 4px;
        padding-bottom: 8px;
        .alarm-level {
          display: inline-block;
          margin-right: 4px;
          border: 2px solid #ffffff;
          user-select: none;
          span {
            width: 59px;
            height: 28px;
            line-height: 28px;
            display: inline-block;
            border: 2px solid #ffffff;
            cursor: pointer;
            color: #ffffff;
            font-size: 14px;
            text-align: center;
          }
          &:last-of-type {
            margin-right: 0px;
          }
        }
        .alarm-level:nth-child(1) {
          background: #ce4f4f;
        }

        .alarm-level:nth-child(1).active {
          border: 2px solid #a41a1a;
        }
        .alarm-level:nth-child(2) {
          background: #e77e2d;
        }

        .alarm-level:nth-child(2).active {
          border: 2px solid #b45c19;
        }
        .alarm-level:nth-child(3) {
          background: #fbc647;
        }

        .alarm-level:nth-child(3).active {
          border: 2px solid #c99314;
        }
        .alarm-level:nth-child(4) {
          background: #4c8ad4;
        }

        .alarm-level:nth-child(4).active {
          border: 2px solid #0f4e99;
        }
      }
    }
    .alarm-sound-container {
      font-size: 14px;
      line-height: 32px;
      height: 32px;
      color: #435068;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: space-between;
      &.title {
        line-height: 38px;
        height: 38px;
      }
      .icon-container {
        display: flex;
        align-items: center;
        .icon {
          margin-right: 10px;
          vertical-align: middle;
        }
      }
      .btn {
        font-size: 14px;
        color: #21539b;
        cursor: pointer;
      }
    }
  }
  .tree-box {
    flex: 1;
    margin: 3px 10px 10px;
    .item-box {
      display: flex;
      align-items: center;
      .content {
        display: flex;
        flex-direction: column;
        width: 186px;
        .title {
          line-height: 26px;
          font-size: 14px;
        }
        .tips {
          font-size: 12px;
          color: #999999;
          line-height: 12px;
          margin-bottom: 6px;
          > span:first-of-type {
            margin-right: 20px;
          }
        }
      }
      .btn {
        flex-shrink: 0;
        font-size: 14px;
        color: #21539b;
        cursor: pointer;
      }
    }
  }
}
</style>
