<template>
  <meg-dialog
    append-to-body
    :show-close="false"
    fullscreen
    custom-class="platform-gb-dialog"
    :visible="visible"
    @close="closeDialog">
    <template v-slot:title>
      <div class="platform-header">
        <span class="title">
          {{ $t('国标平台拉取') }}
        </span>
        <div class="button-group">
          <meg-button
            type="primary"
            :disabled="disableSync"
            @click="sync">
            {{ $t('同步') }}
          </meg-button>
          <meg-button @click="closeDialog">
            {{ $t('取消') }}
          </meg-button>
        </div>
      </div>
    </template>
    <div
      v-loading="loading"
      class="platform-gb">
      <div class="id-input">
        <span class="input-title">{{ $t('国标平台ID') }}</span>
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
          <div class="syncId-button">
            {{ $t('相同ID设备名称是否更新') }}
            <meg-switch
              :disabled="disableSync"
              v-model="update">
            </meg-switch>
            {{ update ? '开启':'关闭' }}
          </div>
        </div>
        <div class="body-content">
          <div class="pull-device-tree">
            <device-tree
              ref="deviceTree"
              :tree-data="platformTree"></device-tree>
            <div v-if="!isDual">
              <div class="title">
                如需同步目录，请先手动同步目录树
              </div>
              <meg-button
                size="mini"
                class="syncDept-button"
                @click="syncDept">
                {{ $t('同步目录') }}
              </meg-button>
            </div>
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
          <camera-table
            ref="cameraTable"
            :total="total"
            :disable-sync.sync="disableSync"
            :data-list="tableData"
            :dept-list="deptList"
            @dept-change="deptChange"
            @delete="deleteDevice"
            @update-data="getTableData"
            @batch-modify="(type)=>{showBatchModify=true;isModifyType=type}"
            @change-sync-status="changeSyncStatus"></camera-table>
        </div>
      </div>
      <!-- 默认节点选择弹框 -->
      <default-dept-dialog
        v-if="showDefaultDeptDialog"
        :no-dept="noDept"
        :tree-data="orgTree"
        @confirm="defaultDeptDialogConfirm"
        @close="showDefaultDeptDialog=false"></default-dept-dialog>
      <!-- 批量编辑弹框 -->
      <batch-modify-department
        v-if="showBatchModify"
        :tree-data="orgTree"
        :is-modify-type="isModifyType"
        @confirm="batchModifyConfirm"
        @close-dialog="showBatchModify = false"></batch-modify-department>
      <!-- 同步进度遮罩 -->
      <sync-progress
        v-if="showSyncProgress"
        :unique-key="uniqueKey"
        :platform-id="platformId"
        :sync-progress-id="syncProgressId"
        @close="$emit('success')"></sync-progress>
    </div>
  </meg-dialog>
</template>

<script>
import BatchModifyDepartment from '@/components/platform-common/batch-modify-department';
import DeviceTree from './components/device-tree';
import PlatFormGbSrv from './platform-gb.service';
import CameraTable from './components/camera-table';
import SyncProgress from './components/sync-progress';
import DefaultDeptDialog from './components/default-dept-dialog';

export default {
  components: {
    DeviceTree,
    CameraTable,
    BatchModifyDepartment,
    SyncProgress,
    DefaultDeptDialog
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
      orgTree: [], // 部门树
      deptSynchronized: false, // 是否同步过目录
      uniqueKey: '', // 页面唯一标识符
      platformTree: [], // 相机树
      deptList: [], // 部门列表
      disableSync: true,
      platformId: '',
      cachePlatformId: '',
      noDept: 0, // 不存在部门的相机数量
      showDefaultDeptDialog: false, // 显示默认节点弹窗
      tableData: [], // 右侧抽屉数据
      total: 0, // 右侧数据总数
      showBatchModify: false, // 显示批量编辑弹窗
      isModifyType: false, // 是否是变更卡口类型
      syncProgressId: '', // 同步id
      showSyncProgress: false, // 是否显示同步进度
      isDual: false,
      update: false
    };
  },
  created() {
    this.isDual = Boolean(this.$store.getters.systemByType('isDual').value === 'true');
    this.deptSynchronized = this.isDual; // 双网时屏蔽同步目录 所以双网时默认已经同步过目录
    this.getOrgTree();
    this.getDeptList();
    this.initUniqueKey();
  },
  methods: {
    /**
     * 拉取部门列表
     */
    async getDeptList() {
      const res = await PlatFormGbSrv.getDeptList();
      this.deptList = res.data.records;
    },
    closeDialog() {
      this.$emit('close');
    },
    // 生成页面唯一标识符
    initUniqueKey() {
      this.uniqueKey = `${new Date().getTime()}${Math.floor(Math.random() * 10000) + 10000}`;
    },
    // 获取部门树
    getOrgTree() {
      PlatFormGbSrv.queryOrganizationTree().then((res) => {
        if (res.code === 0) {
          this.orgTree = [res.data];
        }
      });
    },
    // 同步
    sync() {
      const ids = this.$refs.cameraTable.getSelectData().map((val) => val.gbDeviceId);
      const params = {
        searchId: this.platformId,
        uniqueKey: this.uniqueKey,
        update: this.update,
        ids
      };
      this.loading = true;
      PlatFormGbSrv.saveCamera(params).then((res) => {
        this.syncProgressId = res.data.id;
        this.$message.success(this.$t('保存成功'));
        this.loading = false;
        this.showSyncProgress = true;
      });
    },
    // 拉取
    pullCamera() {
      if (!this.platformId.length) return;
      if (this.cachePlatformId !== this.platformId) {
        this.cachePlatformId = this.platformId;
        if (!this.isDual) this.deptSynchronized = false;
      }
      this.tableData = []; // 右侧抽屉数据
      this.total = 0; // 右侧数据总数
      this.$refs.cameraTable.changeCrossPageCheck(false); // 清除之前的全选
      this.loading = true;
      PlatFormGbSrv.catalog({ id: this.platformId }).then((res) => {
        if (res.code === 0) {
          if (res.data.tree && res.data.tree.length) {
            this.platformTree = [{
              name: '全部',
              sub: res.data.tree,
              gbDeviceId: 'root',
              type: 0
            }];
          } else {
            this.platformTree = [];
          }
          this.count = res.data.number;
        }
        this.loading = false;
      }).catch(() => {
        this.loading = false;
      });
    },
    // 同步目录
    syncDept() {
      if (this.platformTree[0] && this.platformTree[0].sub) {
        PlatFormGbSrv.syncDept(this.platformTree[0].sub).then((res) => {
          if (res.code === 0) {
            this.deptSynchronized = true;
            this.$confirm('目录已同步，如需查阅，请到 用户->部门 查看', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            });
            this.pullCamera();
          } else {
            console.log(res.msg);
          }
        });
      } else {
        this.$message({
          message: '请先拉取相机，再同步',
          type: 'error'
        });
      }
    },
    // 同步到右侧
    pushToRight() {
      const cameras = this.$refs.deviceTree.getCheckedCamera();
      if (cameras.length < 1) return;
      this.noDept = cameras.filter((i) => !i.deptExist).length;
      if (!this.noDept) {
        this.push(cameras);
      } else {
        this.showDefaultDeptDialog = true;
      }
    },
    defaultDeptDialogConfirm(dept) {
      this.showDefaultDeptDialog = false;
      const cameras = this.$refs.deviceTree.getCheckedCamera();
      this.push(cameras, dept);
    },
    // 同步到右侧
    push(cameras, defaultDeptId) {
      this.loading = true;
      PlatFormGbSrv.selectCamera({
        uniqueKey: this.uniqueKey, searchId: this.platformId, cameras, defaultDeptId
      }).then((res) => {
        if (res.code === 0) {
          this.$refs.cameraTable.resetPageInfo(); // 还原table设置，加载第一页内容
          this.$refs.cameraTable.changeCrossPageCheck(false); // 清除之前的全选
          this.getTableData();
        }
        this.loading = false;
      }).catch(() => {
        this.loading = false;
      });
    },
    // 获取右边table数据
    getTableData() {
      const pageInfo = this.$refs.cameraTable.getPageInfo();
      const params = {
        uniqueKey: this.uniqueKey,
        searchId: this.platformId,
        ...pageInfo
      };
      const syncStatus = this.$refs.cameraTable.getSyncStatus();
      if (syncStatus) {
        params.syncStatus = !syncStatus;
      }
      PlatFormGbSrv.searchCamera(params).then((res) => {
        if (res.code === 0) {
          this.total = res.data.totalRecords;
          this.tableData = res.data.records;
          this.$refs.cameraTable.changeCrossPageCheck('default');
        }
      });
    },
    // 改变是否过滤已同步相机状态
    changeSyncStatus() {
      this.$refs.cameraTable.resetPageInfo();
      this.$refs.cameraTable.changeCrossPageCheck(false);
      this.getTableData();
    },
    /**
     * 编辑责权部门
     */
    deptChange(data) {
      PlatFormGbSrv.editCamera({
        id: data.gbDeviceId,
        data: {
          searchId: this.platformId,
          uniqueKey: this.uniqueKey,
          deptId: data.deptId,
          bayonetType: data.bayonetType,
          name: data.name,
        }
      }).then((res) => {
        if (res.code === 0) {
          this.getTableData();
        } else {
          this.$message({
            message: res.msg,
            type: 'error'
          });
        }
      });
    },

    // 删除设备
    deleteDevice(id) {
      PlatFormGbSrv.deleteCamera({
        searchId: this.platformId,
        uniqueKey: this.uniqueKey,
        ids: id
      }).then((res) => {
        if (res.code === 0) this.getTableData();
      }).catch((error) => {
        console.log(error);
      });
    },
    // 批量修改确认
    batchModifyConfirm(data) {
      const ids = this.$refs.cameraTable.getSelectData().map((val) => val.gbDeviceId);
      const params = {
        searchId: this.platformId,
        uniqueKey: this.uniqueKey,
        deptId: data.deptId,
        bayonetType: data.bayonetType,
        ids
      };
      PlatFormGbSrv.editCameras(params).then(() => {
        this.showBatchModify = false;
        this.getTableData();
      }).catch((error) => {
        console.log(error);
      });
    }
  },
};
</script>

<style lang='scss' scoped>
.platform-gb {
  height: 100%;
  position: relative;
  display: flex;
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
  .platform-body {
    position: relative;
    flex: 1;
    flex-direction: column;
    display: flex;
    // margin: 10px 10px 0;
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
  .pull-device-tree {
    width: 275px;
    padding: 10px 10px 5px 15px;
    border-right: 1px solid #dce1e5;
    display: flex;
    flex-direction: column;
    .title {
      font-size: 12px;
      color: #435068;
      height: 24px;
      line-height: 24px;
      background: #F7F8F9;
      padding-left: 6px;
      margin-bottom: 10px;
    }
    .syncDept-button {
      width: 100%;
      height: 34px;
    }
  }
}
.platform-header {
  display: flex;
  justify-content: space-between;
  height: 56px;
  background-color: #fff;
  align-items: center;
  .title{
    margin-left: 20px;
    line-height: 56px;
    font-size: 16px;
    font-weight: 900;
  }
  .button-group {
    display: flex;
    line-height: 34px;
    margin-right: 20px;
    .meg-checkbox {
      margin-right: 9px;
    }
  }
}

</style>
<style lang='scss'>

.platform-gb-dialog  {
  &>.meg-dialog__body {
    background-color: #dce1e5;
    padding-bottom: 30px;
  }
}
</style>
