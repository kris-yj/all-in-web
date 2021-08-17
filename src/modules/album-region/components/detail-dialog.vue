<template>
  <meg-dialog
    class="region__new albumRegion__new__detail"
    :visible="visible"
    width="100%"
    :fullscreen="true"
    :show-close="false"
    @close="onDialogClose">
    <div
      class="region__content">
      <div class="region__title">
        <span class="form-title">
          {{ formData.jobName }}
        </span>
        <div>
          <meg-button
            @click="onDialogClose"
            type="primary">
            {{ $t('取消') }}
          </meg-button>
        </div>
      </div>
      <div class="region__list">
        <div class="region__list-left">
          <div class="task__top__detail">
            <meg-form
              ref="task"
              class="task-form-left"
              label-position="top"
              label-width="83px"
              :model="taskForm"
              :rules="taskRule">
              <meg-form-item
                prop="jobName">
                <p>
                  <span class="title__task">{{ $t('任务名称') }}</span>
                  <span
                    v-show="!editMode"
                    v-tooltip="true"
                    class="album__name__item">{{ taskForm.jobName }}</span>
                  <span
                    v-show="editMode"
                    class="region__name__main">
                    <meg-input
                      v-model.trim="taskForm.jobName"
                      :placeholder="$t('请输入{from}-{to}个汉字，字母，数字', { from: 2, to: 50 })">
                    </meg-input>
                  </span>
                  <meg-button
                    type="text"
                    @click="editJobName"
                    v-if="!editMode && ifAuth">
                    {{ $t('编辑') }}
                  </meg-button>
                  <meg-button
                    class="button__Region__name"
                    type="text"
                    @click="confirmJobName"
                    v-if="editMode">
                    {{ $t('确认') }}
                  </meg-button>
                  <meg-button
                    class="button__Region__name"
                    type="text"
                    @click="cancelJobName"
                    v-if="editMode">
                    {{ $t('取消') }}
                  </meg-button>
                </p>
              </meg-form-item>
            </meg-form>
            <p class="title__task__choose">
              <span class="title__task">{{ $t('选择模式') }}</span><span
                class="color__main__region__second">{{ chooseItem }}</span>
            </p>
            <p class="title__task__region__album">
              <span class="title__task">{{ $t('比对阈值') }}</span><span
                class="color__main__region__second">{{ formData.threshold }}</span>
            </p>
          </div>
          <div class="task__center"></div>
          <div
            class="region__task__album__item">
            <p>{{ $t('区域') }}</p>
            <div class="region__camera__list">
              <p><span class="date__region">{{ $t('选择相机') }}</span><span class="num__list__task__detail">{{ $t('已选') }} {{ formData.region.cameraVos.length ||0 }}{{ $t('个') }}</span> </p>
              <div
                class="content-tag-main-item__album">
                <div class="camera__box">
                  <span
                    v-for="(item,index) in camerasFirst"
                    :key="item.id">
                    {{ item.cameraName }}
                    <span
                      v-show="camerasFirst.length!==index+1">,</span>
                  </span>
                </div>
              </div>
            </div>
            <div class="date__region">
              {{ $t('选择时间') }}
            </div>
            <meg-date-picker
              :disabled="disiabled"
              format="yyyy-MM-dd HH:mm"
              type="daterange"
              :prefix-icon-visible="false"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :value="[formData.region.beginTime,formData.region.endTime]"
              group="today,lastThreeDay,lastWeek,lastMonth">
            </meg-date-picker>
          </div>
          <div class="task__center"></div>
          <div class="region__task__album__item">
            <p>{{ $t('底库') }}</p>
            <div class="region__album__Choose__item">
              <span class="date__region__album">{{ $t('选择底库') }}</span><span class="num__list__task__album__item">{{ $t('已选') }}{{ formData.albumVos.length ||0 }}{{ $t('个') }}</span>
            </div>
            <div
              class="content-tag-main-item__album">
              <div class="camera__box">
                <span
                  v-for="(item,index) in albumLists"
                  :key="item.id">
                  {{ item.albumName }}
                  <span
                    v-show="albumLists.length!==index+1">,</span>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="region__map">
          <area-display-map
            ref="mapSelector"
            v-if="mapAreaShow"
            :areas-data="[formData.region]"></area-display-map>
        </div>
      </div>
    </div>
  </meg-dialog>
</template>
<script>
import AreaDisplayMap from '@/common-components/common-maps/area-display-map';
import Rule from '@/modules/common/judge.rule';

export default {
  components: {
    // cameraSelectRegion,
    AreaDisplayMap
  },
  props: {
    ifAuth: {
      type: [Boolean, Object],
      default: null
    },
    type: {
      type: String,
      default: 'add'
    },
    visible: {
      type: Boolean,
      default: false
    },
    responseFlag: {
      type: String,
      default: 'success'
    },
    formData: {
      type: Object,
      default() {
        return {
          jobName: '',
          jobType: '',
          threshold: 80,
          albumVos: [],
          compareMode: '',
          region: {
            beginTime: new Date(new Date().setHours(0, 0, 0, 0)) - 6 * 24 * 60 * 60 * 1000,
            endTime: new Date().getTime(),
            cameraVos: [],
            regionLocation: ''
          },
        };
      }
    },
  },
  data() {
    return {
      chooseItem: '',
      camerasFirst: [],
      albumLists: [],
      jobName: '',
      taskForm: {
        jobName: ''
      },
      jobId: '',
      taskRule: Rule.albumRegion,
      editMode: false,
      mapAreaShow: false,
      selectcameraVos: [],
      disiabled: true,
      areasDataMapDate: [],
      num: 0,
      areasDataArr: [{
        id: '2342',
        name: this.$t('区域一'),
        geom: ''
      }, {
        id: '323',
        name: this.$t('区域二'),
        geom: ''
      }],
    };
  },
  computed: {
  },

  watch: {
    formData: {
      handler() {
        // this.taskRule = regionAlbum(this.formData && this.formData.jobId);
        if (this.$refs.task) { this.$refs.task.resetFields(); }
        if (this.formData.compareMode === 'SPEED') {
          this.chooseItem = this.$t('速度模式');
        } else {
          this.chooseItem = this.$t('精度模式');
        }
        this.taskForm.jobName = this.formData.jobName;
        this.jobId = this.formData.jobId;
        this.camerasFirst = this.formData.region.cameraVos;
        this.albumLists = this.formData.albumVos;
        this.mapAreaShow = true;
        this.$nextTick(() => {
          this.areasDataArr[0].geom = this.formData.region.regionLocation;
          this.areasDataMapDate = JSON.parse(JSON.stringify(this.areasDataArr));
          this.$refs.mapSelector.setFeatures(this.flatterCameraList);
          this.$refs.mapSelector.selectFeatures(this.camerasFirst.map((item) => item.id));
        });
      }
    },
    // 确认编辑后请求的返回状态 格式为 success/error + _ +时间戳
    responseFlag(val) {
      const [flag] = val.split('_');
      if (flag === 'success') {
        this.editMode = false;
        if (this.$refs.task) {
          this.$refs.task.clearValidate();
        }
      } else {
        this.formData.jobName = this.jobName;
      }
    }
  },
  created() {
    this.selectcameraVos = this.taskForm.cameraVos;
  },
  mounted() {

  },
  methods: {
    setTreeData(data) {
      this.flatterCameraList = this.mapTreeToList(data, 'items');
    },
    editJobName() {
      this.editMode = true;
      this.jobName = this.taskForm.jobName;
    },
    confirmJobName() {
      if (this.jobName === this.taskForm.jobName) {
        this.editMode = false;
        return;
      }
      this.$refs.task.validate((valid) => {
        if (valid) {
          const params = {
            id: this.jobId,
            jobName: this.taskForm.jobName
          };

          this.$emit('modifyJobName', params);
        }
      });
    },
    cancelJobName() {
      this.editMode = false;
      if (this.$refs.task) {
        this.$refs.task.clearValidate();
      }
      this.taskForm.jobName = this.jobName;
    },
    /**
     * 弹窗关闭
     */
    onDialogClose() {
      this.editMode = false;
      this.mapAreaShow = false;
      this.$emit('update:visible', false);
      this.mapAreaShow = false;
    },
    /**
 * 映射树形数据
 * @param {Array} treeData 原始树形数据
 * @param {String} childPropName 子节点字段名
 * @param {Function} dataHandle 映射表处理方法
 * @param {Function} nodeHandle 遍历节点处理方法 需要直接修改源数据时调用
 * @returns {Array} 树状数据的映射表
 */
    mapTreeData(treeData, childPropName, dataHandle, nodeHandle) {
      // 状态映射表
      const dataMap = {};
      // 映射表附带参数
      const params = {};
      // 是否对数据进行处理
      const isDataHandle = dataHandle && typeof dataHandle === 'function';
      // 是否对遍历节点进行预处理
      const isNodeHandle = nodeHandle && typeof nodeHandle === 'function';

      // 递归遍历所有节点
      function traverse(node, path = []) {
        if (!node) return;

        if (isNodeHandle) node = nodeHandle(node);

        if (isDataHandle) dataHandle(dataMap, node, path, params);

        // 当前节点如果有子节点，则先将该节点推入到path路径中，遍历完成后再吐出
        if (node[childPropName]) {
          path.push(node);
          // 子节点进行递归
          node[childPropName].forEach((subNode) => {
            traverse(subNode, path);
          });
          path.pop(node);
        } else {
          // 如果没有子节点则传入false
          traverse(false);
        }
      }
      // 传入的treeData必须保证为数组
      treeData.forEach((node) => {
        traverse(node);
      });
      return [dataMap, params];
    },

    mapTreeToList(treeData, childPropName) {
      const [treeMap] = this.mapTreeData(treeData, childPropName, (dataMap, node) => {
        const nodeInfo = { ...node };
        delete nodeInfo[childPropName];
        dataMap[nodeInfo.id] = nodeInfo;
      });
      return Object.values(treeMap);
    }

  }
};
</script>
<style lang="scss" scoped>
::v-deep .meg-dialog .meg-dialog__body {
  height: 100%;
  padding: 0px;
}
.albumRegion__new__detail ::v-deep .meg-input--suffix{
  display: none;
}
.albumRegion__new__detail ::v-deep.select-toolbar{
  display: none;
}
.region__name__main {
  display: inline-block;
  width: 50%;
}
.region__album__Choose__item {
  margin: 14px 0 10px 0;
}
.button__Region__name {
  margin-right: -10px;
}
.title__task__region__album {
  padding-top: 10px;
}
.content-tag-main-item__album {
  height: 150px;
  border: 1px solid #e4e7ed;
}
.camera__box {
  position: relative;
  height: 145px;
  padding: 10px;
  box-sizing: border-box;
  line-height: 24px;
  font-size: 14px;
  overflow-y: scroll;
  span {
    color: #435068;
  }
  .el-tag {
    max-width: 100%;
    position: relative;
    padding: 0 10px 0 10px;
  }
}
.region__list {
  height: calc(100%-56px);
  width: 100%;
  display: flex;
  background-color: rgb(240, 240, 240);
  box-shadow: 1px 3px 1px rgba(0, 0, 0, 0.1);
  .region__list-left {
    width: 320px;
    height: 100%;
    border-right: 1px solid #ccc;
  }
}
.region__content {
  width: 100%;
  height: 100%;
}
.region__title__detail {
  height: 50px;
  padding-top: 10px;
  box-sizing: border-box;
  background-color: rgb(240, 240, 240);
}
.form-title {
  height: 35px;
  line-height: 35px;
  font-size: 16px;
  font-weight: 800;
}
.region__newTask {
  position: relative;
  top: -10px;
  right: -70px;
}
.task__top__detail {
  padding: 10px 0 0 20px;
  background-color: #ffffff;
  .color__main__region {
    display: inline-block;
    height: 20px;
    line-height: 20px;
    font-size: 14px;
    color: rgb(67, 80, 104);
    margin-left: 10px;
    max-width: 160px;
  }
  .color__main__region__second {
    display: inline-block;
    height: 20px;
    line-height: 20px;
    margin-bottom: 5px;
    font-size: 14px;
    margin-left: 14px;
    color: rgb(67, 80, 104);
  }
  .title__task {
    color: rgb(134, 154, 187);
  }
}
.album__name__item {
  position: relative;
  top: 5px;
  display: inline-block;
  height: 20px;
  line-height: 20px;
  font-size: 14px;
  color: rgb(67, 80, 104);
  margin-left: 10px;
  max-width: 160px;
}
.region__first {
  margin-top: 10px;
  // height: 215px;
  width: 270px;
  padding: 20px 0 0 25px;
}
.region__title {
  display: flex;
  justify-content: space-between;
  height: 55px;
  border-bottom: 1px solid #f3f3f3;
  align-items: center;
  padding: 0 30px 0 20px;
}
.region__task__album__item {
  padding: 20px 20px 8px 20px;
  box-sizing: border-box;
  background-color: #ffffff;
  > p {
    color: rgb(67, 80, 104);
    font-size: 14px;
    font-weight: bold;
  }
}
.region__camera__list {
  p {
    color: rgb(67, 80, 104);
    font-size: 14px;
    height: 20px;
    line-height: 20px;
    padding: 10px 0 5px 0;
  }
}
.num__list__task__detail {
  color: rgb(153, 153, 153);
  font-size: 12px;
  float: right;
}
.num__list__task__album__item {
  font-size: 12px;
  float: right;
  color: #999999;
}
.date__region {
  font-size: 14px;
  color: rgb(134, 154, 187);
  margin-top: 8px;
  height: 30px;
  line-height: 30px;
}
.date__region__album {
  font-size: 14px;
  color: rgb(134, 154, 187);
  margin-top: 8px;
  margin-top: 15px;
}
.region__reset {
  width: 80px;
  position: absolute;
  top: -10px;
  right: -50px;
  font-size: 14px;
}
.task__center {
  height: 5px;
  background-color: #f0f0f0;
}
.choose__region__icon {
  > span {
    display: inline-block;
    height: 34px;
    padding: 0 3px;
  }
}
.region__map {
  flex: 1;
}
</style>
