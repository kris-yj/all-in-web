<template>
  <meg-dialog
    append-to-body
    :show-close="false"
    fullscreen
    custom-class="platform-1400-dialog"
    :visible="visible"
    @close="closeDialog">
    <template #title>
      <div class="platform-header">
        <span class="title">
          {{ $t('视图库平台拉取') }}
        </span>
        <div>
          <meg-button
            type="primary"
            :disabled="btnStatus"
            @click="saveAndSynchronize">
            {{ $t('同步') }}
          </meg-button>
          <meg-button @click="closeDialog">
            取消
          </meg-button>
        </div>
      </div>
    </template>
    <div
      v-loading="loading"
      class="platform-view">
      <div class="id-input">
        <span class="input-title">{{ $t('视图库平台ID') }}</span>
        <meg-input
          v-model="platformId"
          placeholder="请输入平台ID"></meg-input>
        <meg-button
          type="primary"
          @click="pullCamera">
          {{ $t('拉取') }}
        </meg-button>
      </div>
      <div
        class="platform-body">
        <div class="body-top">
          <span class="body-title">{{ $t('平台信息同步') }}</span>
          <!-- <div class="syncId-button">
            {{ $t('相同ID信息是否更新') }}
            <meg-switch
              :disabled="btnStatus"
              v-model="update">
            </meg-switch>
            {{ update ? '开启':'关闭' }}
          </div> -->
        </div>
        <div class="body-content">
          <div class="pull-device-tree">
            <device-tree
              ref="searchDevice"
              :tree-data="platformTreeData"></device-tree>
          </div>
          <div class="push-wrap">
            <div
              class="push-button"
              @click="pushToRight">
              <meg-icon
                name="caret_right"
                color="#D2D6DE"></meg-icon>
            </div>
          </div>
          <device-table
            ref="deviceTable"
            :camera-list="cameraList"
            :total="total"
            :dept-list="deptList"
            :platform-type="'1400'"
            @dept-change="deptChange"
            @btn-status="btnStatusChange"
            @delete-camera="deleteCamera"
            @show-batch-modify-dialog="(type)=>{isShowBatchModifyDialog = true;isModifyType=type}"
            @get-camera-list-in-right="getCameraListInRight"
            :columns="columns"></device-table>
        </div>
      </div>
      <batch-modify-department
        :is-modify-type="isModifyType"
        @close-dialog="isShowBatchModifyDialog = false"
        @confirm="changeCameras"
        :tree-data="orgTreeDatas"
        v-if="isShowBatchModifyDialog"></batch-modify-department>
    </div>
  </meg-dialog>
</template>

<script>
import BatchModifyDepartment from '@/components/platform-common/batch-modify-department';
import DeviceTable from './components/device-table';
import PlatFormViewSrv from './platform-1400.service';
import DeviceTree from './components/device-tree';

export default {
  components: {
    DeviceTable,
    BatchModifyDepartment,
    DeviceTree
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      // 左侧树数据
      platformTreeData: [],
      btnStatus: true,
      deptList: [], // 部门列表
      update: false,
      platformId: '11010000005030000050',
      columns: [
        {
          prop: 'name',
          label: this.$t('相机名称'),
        },
        {
          prop: 'gbDeviceId',
          label: this.$t('视图库设备ID'),
        },
      ],
      // 右侧相机列表data
      cameraList: [],
      // 右侧的相机列表总数
      total: 0,
      // 是否显示批量修改归属弹窗
      isShowBatchModifyDialog: false,
      isModifyType: false,
      // 部门树数据
      orgTreeDatas: [],
      // 是否显示编辑弹窗
      isShowEditDialog: false,
      // 相机详情数据
      cameraDetail: {},
      // 页面唯一码
      uniqueKey: '',
      // 暂存检索id
      searchPlarformId: '',
    };
  },
  created() {
    this.getDepartmentTree();
    this.initUniqueKey();
    this.getDeptList();
  },
  methods: {
    /**
     * 修改列表责权部门
     */
    deptChange(data) {
      PlatFormViewSrv.editCamera({
        id: data.gbDeviceId,
        data: {
          searchId: this.searchPlarformId,
          uniqueKey: this.uniqueKey,
          deptId: data.deptId,
          bayonetType: data.bayonetType,
          name: data.name,
        }
      }).then((res) => {
        if (res.code === 0) {
          this.resetTable(false);
        } else {
          this.$message({
            message: res.msg,
            type: 'error'
          });
        }
      });
    },
    /**
     * 拉取部门列表
     */
    async getDeptList() {
      const res = await PlatFormViewSrv.getDeptList();
      this.deptList = res.data.records;
    },
    closeDialog() {
      this.$emit('close');
    },
    /**
     * @description 生成页面唯一标识符
     * @param {any}
     * @returns
     */
    initUniqueKey() {
      this.uniqueKey = `${new Date().getTime()}${Math.floor(Math.random() * 10000) + 10000}`;
      console.log(this.uniqueKey);
    },

    /**
     * @description 获取部门树
     */
    getDepartmentTree() {
      PlatFormViewSrv.queryOrganizationTree().then((res) => {
        if (res.code === 0) {
          this.orgTreeDatas = [res.data];
        }
      });
    },
    /**
     * @description 同步并保存按钮是否可用的更改 由table是否由选中决定
     * @param {Boolean} status
     */
    btnStatusChange(status) {
      this.btnStatus = status;
    },
    /**
     * @description 删除某个相机
     * @param {number} id 相机ID
     */
    deleteCamera(id) {
      PlatFormViewSrv.deleteCamera({
        searchId: this.searchPlarformId,
        uniqueKey: this.uniqueKey,
        ids: id
      }).then((res) => {
        if (res.code === 0) {
          this.resetTable();
        }
      }).catch((error) => {
        console.log(error);
      });
    },
    /**
     * @description 批量修改
     * @param {Object} data 要修改的数据
     */
    changeCameras(data) {
      const condition = this.$refs.deviceTable.getSelected();
      const body = {
        searchId: this.searchPlarformId,
        uniqueKey: this.uniqueKey,
        deptId: data.deptId,
        bayonetType: data.bayonetType
      };
      if (!condition.allChecked) {
        body.ids = condition.selectCameraList.map((val) => val.gbDeviceId);
      }
      PlatFormViewSrv.editCameras(body).then(() => {
        this.isShowBatchModifyDialog = false;
        this.resetTable();
      }).catch((error) => {
        console.log(error);
      });
    },
    /**
     * @description 保存并同步相机
     */
    saveAndSynchronize() {
      const condition = this.$refs.deviceTable.getSelected();
      const body = {
        searchId: this.searchPlarformId,
        uniqueKey: this.uniqueKey,
      };
      if (!condition.allChecked) {
        body.ids = condition.selectCameraList.map((val) => val.gbDeviceId);
      }
      this.loading = true;
      PlatFormViewSrv.saveCamera(body).then((res) => {
        this.loading = false;
        if (res.code === 0) {
          this.$message.success(this.$t('保存成功'));
        } else {
          this.$message.error(res.msg);
        }
        this.$emit('success');
      }).catch((error) => {
        console.log(error);
      });
    },
    /**
     * @description 拉取相机
     * @param {Object} data 拉取条件
     */
    async pullCamera() {
      this.searchPlarformId = this.platformId;
      this.loading = true;
      const res = await PlatFormViewSrv.catalog({ id: this.searchPlarformId });
      this.loading = false;
      if (res.code === 0) {
        const platformTreeData = [
          {
            name: this.$t('全部'),
            sub: res.data || [],
            gbDeviceId: 'root',
            type: 0
          }
        ];
        if (res.data.length) {
          this.platformTreeData = platformTreeData;
        } else {
          this.platformTreeData = [];
        }
      }
    },
    /**
     * @description 讲左侧选中相机推送到右边，并且告知后台暂存，由后台做分页；
     * @param {any}
     * @returns
     */
    pushToRight() {
      const cameras = this.$refs.searchDevice.getCheckedCamera();
      if (cameras.length < 1) return;
      PlatFormViewSrv.selectCamera({ uniqueKey: this.uniqueKey, searchId: this.searchPlarformId, cameras }).then((res) => {
        if (res.code === 0) {
          // 重置table 分页
          this.resetTable();
        }
      });
    },
    /**
     * @description table重新初始化加载
     * @param {Boolean} reset 是否重置  默认重置
     */
    resetTable(reset = true) {
      if (reset) {
        this.$refs.deviceTable.resetListPageInfo();
      }
      this.$refs.deviceTable.getCameraListInRight();
    },
    /**
     * @description 获取经过后台处理之后的数据，分页等已做好。
     * @param {Object} data 检索条件
     */
    getCameraListInRight(data) {
      console.log(data);
      PlatFormViewSrv.searchCamera({ uniqueKey: this.uniqueKey, searchId: this.searchPlarformId, ...data }).then((res) => {
        if (res.code === 0) {
          this.total = res.data.totalRecords;
          this.cameraList = res.data.records;
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.platform-header {
  display: flex;
  justify-content: space-between;
  height: 50px;
  align-items: center;
  .title{
    line-height: 34px;
    font-size: 14px;
  }

}
.platform-view {
  display: flex;
  box-sizing: border-box;
  height: 100%;
  flex-direction: column;
  .id-input {
    display: flex;
    height: 54px;
    margin-bottom: 10px;
    background-color: #fff;
    align-items: center;
    .input-title {
      font-size: 14px;
      color: #435068;
      margin: 0 16px 0 19px;
    }
    .meg-input {
      width: 270px;
      margin-right: 15px;
    }
  }
  .pull-device-tree {
    width: 275px;
    padding: 10px 10px 5px 15px;
    border-right: 1px solid #dce1e5;
    display: flex;
    flex-direction: column;
  }
  .push-wrap {
    display: flex;
    align-items: center;
    width: 44px;
    border-right: 1px solid #dce1e5;
    .push-button {
      width: 24px;
      height: 24px;
      margin: 0 auto;
      border: 1px solid #D2D6DE;
      line-height: 24px;
      text-align: center;
      cursor: pointer;
    }
  }
  .platform-body {
    position: relative;
    flex: 1;
    flex-direction: column;
    display: flex;
    background-color: #fff;
     .body-top {
      display: flex;
      align-items: center;
      height: 42px;
      border-bottom: 1px solid #dce1e5;
      justify-content: space-between;
      .body-title {
        font-size: 14px;
        color: #435068;
        margin-left: 16px;
      }
      .syncId-button {
        padding-right: 20px;
      }
    }
    .body-content {
      position: relative;
      flex: 1;
      display: flex;
      .push-wrap {
        display: flex;
        align-items: center;
        width: 44px;
        border-right: 1px solid #dce1e5;
        .push-button {
          width: 24px;
          height: 24px;
          margin: 0 auto;
          border: 1px solid #D2D6DE;
          line-height: 24px;
          text-align: center;
          cursor: pointer;
        }
      }
    }
  }
}
</style>
<style lang='scss' >
.platform-1400-dialog {
  &>.meg-dialog__body {
    background-color: #dce1e5;
    padding-bottom: 30px;
  }
}
</style>
