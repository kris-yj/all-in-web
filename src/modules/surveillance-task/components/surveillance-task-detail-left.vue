<template>
  <div class="task-detail-left-container">
    <div class="task-detail-left-title">
      <meg-return-button
        width="200px"
        :disable="true"
        @click="go"
        :title="taskDetailData.name">
      </meg-return-button>
    </div>
    <div class="searchSelector">
      <div class="page-title-container">
        {{ $t('任务详情') }}
        <meg-button
          v-show="!history && taskDetailData.enableEdit"
          @click="editTask"
          class="fr editBtn">
          {{ $t('编辑') }}
        </meg-button>
      </div>
      <div class="task-detail-content-container">
        <div class="detail-top-container">
          <div class="detail-content-item">
            <div class="detail-content-name-item">
              {{ $t('有效时间') }}
            </div>
            <div class="detail-content-content-item">
              {{ taskDetailData.realDateStr }}
            </div>
          </div>
          <div class="detail-content-item">
            <div class="detail-content-name-item">
              {{ $t('布控类型') }}
            </div>
            <div class="detail-content-content-item">
              {{ taskDetailData.strategyTypeName }}
            </div>
          </div>
          <div
            class="detail-content-item">
            <div class="detail-content-name-item">
              {{ $t('布控时间段') }}
            </div>
            <div class="detail-content-content-item">
              <span
                class="time-container"
                v-for="(date,index) in taskDetailData.timesStrArr"
                :key="index">{{ date.startTime }}~{{ date.endTime }}</span>
            </div>
          </div>
          <div
            class="detail-content-item">
            <div class="detail-content-name-item">
              {{ $t('相机') }}
            </div>
            <div
              class="detail-content-content-item camera-detail-btn"
              @click="showCameraList = true">
              {{ $t('布控') + taskDetailData.cameraCount + $t('路相机') }}
            </div>
          </div>
          <div
            v-if="taskDetailData.alarmType === 0"
            class="detail-content-item">
            <div class="detail-content-name-item">
              {{ $t('底库') }}
            </div>
            <div class="detail-content-content-item">
              {{ taskDetailData.albumsStr }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <camera-list
      :show-camera-list="showCameraList"
      :task-id="taskId"
      @close-camera-list="showCameraList = false"></camera-list>
  </div>
</template>

<script>
import { switchToModule } from '@/utils/utils.js';
import CameraList from './camera-list';

export default {
  name: 'SurveillanceTaskDetailLeft',
  components: {
    CameraList
  },
  props: {
    taskDetailData: {
      type: Object,
      default: () => {}
    },
    // 是否是历史任务
    history: {
      type: Boolean,
      default: false,
    },
    taskId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      taskCategory: {},
      showCameraList: false,
    };
  },
  created() {
    const vm = this;
    const deployCategory = this.$store.getters.dataMapByType('deploy_category');
    deployCategory.forEach((item) => {
      vm.taskCategory[item.code] = item.value;
    });
  },
  methods: {
    editTask() {
      this.$emit('on-click-edit-task');
    },
    go() {
      if (this.history) {
        switchToModule({
          module: 'surveillance-task-history',
        });
      } else {
        switchToModule({
          module: 'surveillance-task',
        });
      }
    }
  }
};
</script>

<style scoped lang="scss">
.task-detail-left-container {
  height: 100%;
  width: 100%;
  overflow: hidden;
}
.search-container {
  width: 100%;
  height: 100%;
}
.task-detail-left-title {
  display: flex;
  align-items: center;
  height: 56px;
  background: #f1f1f1;
  padding: 0 16px;
  width: 320px;
  box-sizing: border-box;
  font-weight: bold;
}
.searchSelector {
  padding: 0 25px;
  flex: 1 1 auto;
  height: 100%;
  overflow: hidden;
  position: relative;
}
.task-detail-content-container {
  height: calc(100% - 162px);
  overflow: auto;
}

.detail-content-item {
  overflow: hidden;
  margin-bottom: 8px;
}
.detail-content-name-item {
  float: left;
  width: 76px;
  line-height: 22px;
  color: #869abb;
  text-align: right;
}
.detail-content-content-item {
  float: left;
  width: 150px;
  line-height: 22px;
  padding-left: 20px;
  color: #435068;
  word-break: break-word;
}
.camera-detail-btn{
  color: #0000FF;
  cursor: pointer;
}
.page-title-container {
  height: 56px;
  line-height: 56px;
  color: #435068;
  font-weight: 700;
  border-bottom: 1px solid #f4f4f4;
  margin-bottom: 20px;
}
.time-container {
  margin-right: 10px;
  display: inline-block;
  width: 80px;
}
.editBtn {
  float: right;
  margin-top: 8px;
}
</style>
