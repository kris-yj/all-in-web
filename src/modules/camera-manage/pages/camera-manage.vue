<template>
  <div class="camera-manage">
    <camera-manage-form
      ref="searchForm"
      :place-list="placeList"
      :label-list="labelList"
      :camera-auth="cameraAuth"
      :key-unit-list="keyUnitList"
      :org-tree-data="orgTreeData"
      @search="getCameraList"
      @edit-group="handleEditGroup"
      @delete-group="deleteGroup"></camera-manage-form>
    <div class="camera-manage-content">
      <button-group
        :total="total"
        :is-select="isSelect"
        :camera-auth="cameraAuth"
        :checked-length="checkedLength"
        @show-gb="showGb"
        @show-stk="showStk"
        @export="handleExport"
        @add-group="handleAddGroup"
        @batch-edit="handleBatchEdit"
        @add-camera="handleAddCamera"
        @batch-update="handleBatchUpdate"
        @batch-delete="handleBatchDelete"
        @batch-upload="handleBatchUpload"
        @checkedAll-change="checkedAllChange"
        @batch-pulled-change="batchPulledChange"></button-group>
      <camera-table
        ref="cameraTable"
        :total="total"
        :is-loading="isLoading"
        :checked-all="checkedAll"
        :table-data="cameraList"
        :camera-auth="cameraAuth"
        @space="handleOpenSpace"
        @delete="handleSingleDelete"
        @edit-device="handleEditDevice"
        @view-device="handleViewDevice"
        @sort-change="handleSortChange"
        @change-pulled="handleChangePulled"
        @update-camera-list="getCameraList"
        @selection-change="handleSelectionChange"></camera-table>
    </div>
    <camera-detail
      v-if="isShowDetail"
      :visible.sync="isShowDetail"
      :camera-type="cameraType"
      :detail-data="cameraDetailData"
      :camera-type-option="cameraTypeOption"
      :monitoring-type-option="monitoringTypeOption"
      :face-frame-mode-option="faceFrameModeOption"></camera-detail>
    <add-group
      ref="addGroup"
      v-if="addGroupVisible"
      :is-add="isAddGroup"
      :visible.sync="addGroupVisible"
      :default-select="addGroupDefaultSelect"
      @update-Group-list="handleUpdateGroupList"></add-group>
    <add-camera
      ref="addCamera"
      v-if="addCameraVisible"
      :place-list="placeList"
      :label-list="labelList"
      :is-gaproxy="isGAProxy"
      :camera-auth="cameraAuth"
      :box-tree-data="boxTreeData"
      :is-police-net="isPoliceNet"
      :key-unit-list="keyUnitList"
      :is-add-camera="isAddCamera"
      :org-tree-data="orgTreeData"
      :user-tree-data="userTreeData"
      :visible.sync="addCameraVisible"
      :face-frame-mode-option="faceFrameModeOption"
      @update-camera-list="getCameraList"></add-camera>
    <platform-gb
      v-if="isPlatformGbVisible"
      @close="isPlatformGbVisible = false"
      @success="pullSuccess"
      :visible="isPlatformGbVisible"></platform-gb>
    <platform-1400
      v-if="isPlatform1400Visible"
      @close="isPlatform1400Visible = false"
      @success="pullSuccess"
      :visible="isPlatform1400Visible"></platform-1400>
    <batch-import
      v-if="batchImportVisible"
      :edit-api="editApi"
      :import-api="importApi"
      :is-batch-edit="isBatchEdit"
      :visible.sync="batchImportVisible"
      @download-temp="downloadTemplate"></batch-import>
    <batch-update
      v-if="batchUpdateVisible"
      :label-list="labelList"
      :place-list="placeList"
      :org-tree-data="orgTreeData"
      :key-unit-list="keyUnitList"
      :user-tree-data="userTreeData"
      :visible.sync="batchUpdateVisible"
      @batch-update-save="batchUpdateSave"></batch-update>
    <space-time
      ref="spaceTime"
      :camera-info="spaceCameraData"
      :visible.sync="spaceTimeVisible"
      @save-space-time="saveSpaceTime"
      @calculate-camera-space="getSpaceTimeCamera"></space-time>
  </div>
</template>

<script>
import _ from 'lodash';
import config from '@/utils/config.utils.js';
import CameraManageForm from '../components/camera-manage-form';
import CameraTable from '../components/camera-table';
import CameraManageSrv from '../camera-manage.service';
import ButtonGroup from '../components/button-group';
import CameraDetail from '../components/camera-detail';
import AddGroup from '../components/add-group';
import AddCamera from '../components/add-camera';
import PlatformGb from '../components/platform-gb/platform-gb';
import Platform1400 from '../components/platform-1400/platform-1400';
import BatchImport from '../components/batch-import';
import BatchUpdate from '../components/batch-update';
import SpaceTime from '../components/space-time';

export default {
  components: {
    CameraManageForm,
    CameraTable,
    ButtonGroup,
    CameraDetail,
    AddGroup,
    AddCamera,
    PlatformGb,
    Platform1400,
    BatchImport,
    BatchUpdate,
    SpaceTime
  },
  props: {

  },
  data() {
    const { system } = this.$store.getters;
    return {
      labelList: [], // 设备标签
      orgTreeData: [], // 部门树
      userTreeData: [],
      boxTreeData: [],
      placeList: [], // 归属区域列表
      keyUnitList: [], // 重点单位列表
      searchParams: {}, // 检索的参数 导出时需要
      total: 0,
      cameraList: [], // 相机列表
      selectList: [], // 选中的相机
      isShowDetail: false, // 显示详情
      cameraType: '', // 详情相机的卡口类型
      cameraDetailData: {
        storageScheme: 1,
      }, // 相机详情
      spaceCameraData: {}, // 小时空相机详情
      isAddGroup: false, // 是否为新建分组
      addGroupVisible: false,
      isPlatformGbVisible: false, // 是否显示国标相机拉取
      isPlatform1400Visible: false, // 是否显示视图库拉取
      isAddCamera: false, // 是否新建相机
      isPoliceNet: false,
      isGAProxy: false, // 是否是GAProxy接进来的相机
      addCameraVisible: false,
      batchImportVisible: false,
      isBatchEdit: false,
      importApi: CameraManageSrv.importApi(),
      editApi: CameraManageSrv.editApi(),
      batchUpdateVisible: false,
      spaceTimeVisible: false,
      addGroupDefaultSelect: [], // 编辑分组时默认选中的相机列表
      cameraTypeOption: this.$store.getters.dataMapByType('face_camera_type').filter((val) => val.extra !== '1'), // 人像卡口相机类型
      monitoringTypeOption: this.$store.getters.dataMapByType('bayonet_type'), // 人像卡口卡口类型
      faceFrameModeOption: this.$store.getters.dataMapByType('face_frame_mode'), // 人脸框模式选项
      isLoading: false, // 列表loading
      checkedAll: false, // 跨页全选
      dualScene: Number(system.dualScene.value), // 当前场景
      isDual: system.isDual.value === 'true', // 是否双网
      dualPlatformType: system.dualPlatformType.value === '1', // 是否公安网
      captureLowQualitySave: system.captureLowQualitySave.value, // 是否存低质量
      isAuth: false, // 是否拥有相机综合管理权限
    };
  },
  computed: {
    scene() { // 当前场景 0 单网 1 单向网闸 3 双向网闸
      if (this.isDual) {
        return this.dualScene === 3 ? 3 : 1;
      }
      return 0;
    },
    cameraAuth() {
      // https://wiki.megvii-inc.com/pages/viewpage.action?pageId=237815482 双网权限具体wiki
      const isVideoNet = !this.dualPlatformType && this.isDual; // 是否视频网
      const isPoliceNet = this.dualPlatformType && this.isDual; // 是否公安网
      const sceneOnePoliceNet = this.scene === 1 && isPoliceNet; // 场景1公安网
      const sceneThreeVideoNet = this.scene === 3 && isVideoNet; // 场景3视频网
      const sceneThreePoliceNet = this.scene === 3 && isPoliceNet; // 场景3公安网
      const hasCloudBridge = this.$store.getters.modulePermissonsByAlias('cloudbridge').length;
      const pullAuth = function (data) {
        if (sceneOnePoliceNet && data) return data.policeNet;
        if (sceneOnePoliceNet) return true;
        if (isVideoNet) return true;
        return false;
      };
      const deleteAuth = function (data) {
        if (sceneOnePoliceNet && data) return data.policeNet;
        if (sceneOnePoliceNet) return true;
        if (isVideoNet) return true;
        return false;
      };
      if (sceneOnePoliceNet) {
        return {
          sceneOnePoliceNet,
          sceneThreeVideoNet,
          sceneThreePoliceNet,
          hasCloudBridge,
          addAuth: true,
          groupAuth: true,
          pullAuth,
          detailAuth: true,
          editAuth: true,
          deleteAuth,
          spaceAuth: true,
          exportAuth: true
        };
      }
      if (sceneThreeVideoNet) {
        return {
          sceneOnePoliceNet,
          sceneThreeVideoNet,
          sceneThreePoliceNet,
          hasCloudBridge,
          addAuth: true,
          groupAuth: true,
          pullAuth,
          detailAuth: true,
          editAuth: true,
          deleteAuth,
          spaceAuth: true,
          exportAuth: true
        };
      }
      if (sceneThreePoliceNet) {
        return {
          sceneOnePoliceNet,
          sceneThreeVideoNet,
          sceneThreePoliceNet,
          hasCloudBridge,
          addAuth: false,
          groupAuth: false,
          pullAuth,
          detailAuth: true,
          editAuth: true,
          deleteAuth,
          spaceAuth: false,
          exportAuth: true
        };
      }
      return {
        sceneOnePoliceNet,
        sceneThreeVideoNet,
        sceneThreePoliceNet,
        hasCloudBridge,
        addAuth: true,
        groupAuth: true,
        pullAuth: () => (true),
        detailAuth: true,
        editAuth: true,
        deleteAuth: () => (true),
        spaceAuth: true,
        exportAuth: true
      };
    },
    // 是否是选择状态
    isSelect() {
      return Boolean(this.selectList.length > 0);
    },
    // 已选中多少条
    checkedLength() {
      if (this.isSelect) {
        return this.checkedAll ? this.total : this.selectList.length;
      }
      return 0;
    },
    // 已选中相机
    selectCamera() {
      return this.checkedAll ? [] : this.selectList;
    }
  },
  created() {
    this.getLabelList(); // 获取设备标签列表
    this.getQueryOrgTree(); // 获取全部门
    this.getPlaceList(); // 获取归属区域列表
    this.getKeyUnitList(); // 获取重点单位列表
    if (this.cameraAuth.spaceAuth) this.getAllCamera();
    this.queryBoxTree();
  },
  methods: {
    // 关联相机盒子树
    queryBoxTree() {
      CameraManageSrv.queryBoxTree().then((res) => {
        if (res.code === 0) {
          // 视频网场景1场景2只有盒子没有部门
          this.boxTreeData = res.data;
        }
      });
    },
    /**
     * 拉取成功
     */
    pullSuccess() {
      this.isPlatform1400Visible = false;
      this.isPlatformGbVisible = false;
      this.getCameraList();
    },
    /**
     * 显示国标平台拉取dialog
     */
    showGb() {
      console.log(11111);
      this.isPlatformGbVisible = true;
    },
    /**
     * 显示视图库平台拉取
     */
    showStk() {
      this.isPlatform1400Visible = true;
    },
    // 获取全量相机列表
    getAllCamera() {
      CameraManageSrv.geAlltCameraList().then((res) => {
        if (res.code === 0) {
          this.$nextTick(() => {
            this.$refs.spaceTime.setFeatures(res.data);
          });
        }
      });
    },
    // 获取重点单位列表
    getKeyUnitList() {
      CameraManageSrv.getKeyUnitList().then((res) => {
        if (res.code === 0) {
          this.keyUnitList = res.data;
        }
      });
    },
    // 获取归属区域列表
    getPlaceList() {
      CameraManageSrv.getPlaceList().then((res) => {
        if (res.code === 0) {
          this.placeList = res.data;
        }
      });
    },
    // 获取设备标签列表
    getLabelList() {
      CameraManageSrv.getLabelList().then((res) => {
        if (res.code === 0) {
          this.labelList = res.data;
        }
      });
    },
    // 获取全部门
    getQueryOrgTree() {
      CameraManageSrv.getQueryItemOrgTree().then((res) => {
        if (res.code === 0) {
          this.orgTreeData = [res.data];
          this.userTreeData = _.cloneDeep([res.data]);
          this.traverseUserTree(this.userTreeData[0]);
        }
      });
    },
    // 人员树的递归
    traverseUserTree(data) {
      if (data.subOrgs) {
        // 现在user中加入字段，在push
        if (data.users) {
          data.users.forEach((item) => {
            item.orgName = item.userRealName;
            item.isUser = true;
          });
          data.subOrgs = _.concat(data.users, data.subOrgs);
        }
        data.subOrgs.forEach((item) => {
          if (item.subOrgs) {
            this.traverseUserTree(item);
          }
        });
      }
    },
    checkedAllChange(val) {
      this.$refs.cameraTable.checkAll(val);
      this.checkedAll = val;
    },
    // 查询相机列表
    getCameraList(param) {
      this.isLoading = true;
      let params;
      if (param) {
        params = {
          ...param,
          action: 'all'
        };
        this.searchParams = { ...params }; // 因为导出需要记录一下检索条件
      } else {
        params = { ...this.searchParams };
      }
      const pageInfo = this.$refs.cameraTable.getPageInfo();
      params.pageNo = pageInfo.pageNo;
      params.pageSize = pageInfo.pageSize;
      CameraManageSrv.getCameraList(params).then((res) => {
        this.isLoading = false;
        if (res.code === 0) {
          this.total = res.data.totalRecords;
          this.cameraList = res.data.records;
          // 全选时每页都需要选中
          if (this.checkedAll) {
            this.$nextTick(() => {
              this.$refs.cameraTable.checkAll(true);
            });
          }
        }
      });
    },
    // 选中列表
    handleSelectionChange(rows) {
      this.selectList = rows;
    },
    // 重新排序
    handleSortChange(orderBy = '', order = '') {
      const params = this.$refs.searchForm.getSearchParams();
      params.orderBy = orderBy;
      params.order = order === 'descending' ? 'desc' : 'asc';
      this.$refs.cameraTable.resetPageInfo();
      this.getCameraList(params);
    },
    // 单个激活/停用
    handleChangePulled(pulled, id, index) {
      if (pulled) {
        CameraManageSrv.batchSaveSync({ ids: [id] }).then((res) => {
          if (res.code === 0) {
            this.$message({
              message: '相机激活成功',
              type: 'success'
            });
          } else {
            this.cameraList[index].pulled = false;
          }
        });
      } else {
        this.$confirm('该相机将被停用，同时在所有功能模块中都不可用，您确定要继续吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          CameraManageSrv.batchDelete({ cameraIds: [id] }).then((res) => {
            if (res.code === 0) {
              this.$message({
                message: '相机停用成功',
                type: 'success'
              });
            } else {
              this.cameraList[index].pulled = true;
            }
          });
        }).catch(() => {
          this.cameraList[index].pulled = true;
        });
      }
    },
    // 查询相机详情
    async getCameraDetail(params) {
      const res = await CameraManageSrv.queryCameraDetail({ range: 'query', ...params });
      if (res.code === 0) {
        const isFace = [1, 2, 3, 10].includes(res.data.monitoringType);
        this.cameraType = isFace ? 'faceCamera' : 'structureCamera';
        this.cameraDetailData = res.data;
      } else {
        this.cameraDetailData = { storageScheme: 1 };
      }
    },
    // 查看相机详情
    async handleViewDevice(id) {
      await this.getCameraDetail({
        id, needUnit: true, needPlace: true, needTag: true
      });
      if (this.cameraDetailData.id) {
        this.isShowDetail = true;
      } else {
        this.$message.error(this.$t('请求失败'));
      }
    },
    // 删除
    handleSingleDelete(id) {
      CameraManageSrv.deleteCamera({ cameraIds: [id], range: 'query' }).then((res) => {
        if (res.code === 0) {
          this.$message.success(this.$t('正在删除，请稍后刷新页面查看相机列表，请勿重复执行删除操作'));
          this.checkedAllChange(false);
          this.getCameraList();
        } else {
          this.$message.error(this.$t('删除相机失败，请重试'));
        }
      });
    },
    // 小时空
    async handleOpenSpace(data) {
      this.spaceCameraData = data;
      const res = await CameraManageSrv.searchSpace({ id: this.spaceCameraData.id });
      if (res.code === 0) {
        this.spaceCameraData.shapeValue = res.data.shapeValue;
        this.getSpaceTimeCamera({
          shapeType: res.data.shapeType,
          shapeValue: res.data.shapeValue,
          id: res.data.cameraId
        });
      }
    },
    // 计算小时空相机
    getSpaceTimeCamera(params) {
      CameraManageSrv.calculateCameraSpace(params).then((res) => {
        if (res.code === 0) {
          this.spaceTimeVisible = true;
          this.$nextTick(() => {
            this.$refs.spaceTime.renderFeatures(res.data);
          });
        }
      });
    },
    // 保存小时空
    saveSpaceTime(params) {
      CameraManageSrv.saveCameraSpace(params).then((res) => {
        if (res.code === 0) {
          this.$message.success(this.$t('编辑小时空成功'));
          this.spaceTimeVisible = false;
          this.getCameraList();
        }
      });
    },
    // 新建分组
    handleAddGroup() {
      this.isAddGroup = true;
      this.addGroupVisible = true;
    },
    // 编辑分组
    handleEditGroup(id) {
      this.isAddGroup = false;
      CameraManageSrv.getGroupById({ id }).then((res) => {
        if (res.code === 0) {
          const groupForm = {
            id: res.data.id,
            name: res.data.name,
            remark: res.data.remark,
            cameraIds: _.map(res.data.cameras, (item) => item.id)
          };
          this.addGroupVisible = true;
          this.$nextTick(() => {
            this.$refs.addGroup.setGroupForm(groupForm);
          });
        }
      });
    },
    // 删除分组
    deleteGroup(params) {
      this.$confirm(this.$t('该自定义分组将被删除，您确定要继续吗？'), this.$t('删除自定义分组'),
        {
          confirmButtonText: this.$t('确定'),
          cancelButtonText: this.$t('取消')
        }).then(() => {
        CameraManageSrv.deleteGroup(params).then((res) => {
          if (res.code === 0) {
            this.$message.success(this.$t('删除成功'));
            this.$refs.searchForm.getGroupsList();
          }
        });
      });
    },
    // 分组改变后 更新分组
    handleUpdateGroupList() {
      this.$refs.searchForm.getGroupsList();
    },
    // 导出
    handleExport(items) {
      const cameraIds = this.selectCamera.map((item) => item.id);
      let params;
      if (cameraIds.length) {
        params = {
          items, cameraIds, order: this.searchParams.order, orderBy: this.searchParams.orderBy, action: 'all'
        };
      } else {
        params = { items, ...this.searchParams, action: 'all' };
      }
      CameraManageSrv.exportCamera(params).then((res) => {
        if (res.code === 0) {
          this.$message.success('导出成功,请前往任务列表查看');
        }
      });
    },
    // 批量激活
    batchPulledChange(pulled) {
      const ids = this.selectCamera.map((item) => item.id);
      let parmas = {};
      if (ids.length) {
        parmas = {
          ids: pulled ? ids : null,
          cameraIds: pulled ? null : ids
        };
      } else {
        parmas = {
          ...this.searchParams,
          order: null,
          orderBy: null
        };
      }
      if (this.cameraAuth.sceneOnePoliceNet) { // 场景一公安网
        parmas.needLocal = true;
      }
      if (pulled) {
        CameraManageSrv.batchSave(parmas).then((res) => {
          if (res.code === 0) {
            this.$message({
              message: '激活成功,请前往任务列表查看，任务完成后请刷新页面',
              type: 'success'
            });
          }
        });
      } else {
        this.$confirm('相机将被停用，同时在所有功能模块中都不可用，您确定要继续吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          CameraManageSrv.batchDeleteAsync(parmas).then((res) => {
            if (res.code === 0) {
              this.$message({
                message: '相机停用成功,请前往任务列表查看，任务完成后请刷新页面',
                type: 'success'
              });
            }
          });
        });
      }
    },
    // 新建相机
    handleAddCamera() {
      this.isAddCamera = true;
      this.isGAProxy = false;
      this.addCameraVisible = true;
    },
    // 编辑相机
    async handleEditDevice(data) {
      await this.getCameraDetail({
        id: data.id, needUnit: true, needPlace: true, needTag: true
      });
      if (this.cameraDetailData.id) {
        this.isGAProxy = Boolean(data.systemType === 'gaproxy-device');
        this.isAddCamera = false;
        this.isPoliceNet = data.policeNet;
        this.addCameraVisible = true;
        this.$nextTick(() => {
          this.$refs.addCamera.setFormData(this.cameraDetailData);
        });
      } else {
        this.$message.error(this.$t('请求失败'));
      }
    },
    // 批量编辑
    handleBatchEdit() {
      this.isBatchEdit = true;
      this.batchImportVisible = true;
    },
    // 批量上传
    handleBatchUpload() {
      this.isBatchEdit = false;
      this.batchImportVisible = true;
    },
    // 下载模板
    downloadTemplate() {
      CameraManageSrv.getDownloadTemplate().then((res) => {
        if (res.code === 0) {
          window.location.href = `${config.apiPath.service}${res.data.templateUri}`;
        }
      });
    },
    // 批量删除
    handleBatchDelete() {
      this.$confirm('此操作将批量删除相机, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const ids = this.selectCamera.map((item) => item.id);
        let parmas = {};
        if (ids.length) {
          parmas = {
            cameraIds: ids,
            range: 'query'
          };
        } else {
          parmas = {
            ...this.searchParams,
            order: null,
            orderBy: null,
            range: 'query'
          };
        }
        if (this.cameraAuth.sceneOnePoliceNet) { // 场景一公安网
          parmas.needLocal = true;
        }
        CameraManageSrv.batchDeleteCamera(parmas).then((res) => {
          if (res.code === 0) {
            this.$message({
              type: 'success',
              message: '正在删除，请稍后刷新页面查看相机列表，请勿重复执行删除操作'
            });
            this.checkedAllChange(false);
            this.getCameraList();
          }
        });
      }).catch(() => {});
    },
    // 批量更新字段
    handleBatchUpdate() {
      this.batchUpdateVisible = true;
    },
    batchUpdateSave(modify) {
      const cameraIds = this.selectCamera.map((item) => item.id);
      let parmas = {};
      if (cameraIds.length) {
        parmas = {
          ...modify,
          cameraIds
        };
      } else {
        parmas = {
          ...modify,
          ...this.searchParams,
          order: null,
          orderBy: null
        };
      }
      CameraManageSrv.patchUpdateAsync(parmas).then((res) => {
        if (res.code === 0) {
          this.$message({
            type: 'success',
            message: '操作成功，请前往任务列表查看'
          });
          this.batchUpdateVisible = false;
        }
      });
    }
  },
};
</script>

<style lang='scss' scoped>
.camera-manage {
  height: 100%;
  display: flex;
  .camera-manage-content {
    flex: 1;
    height: 100%;
    padding-left: 16px;
    background: #dce0e4;
    display: flex;
    flex-direction: column;
  }
}
</style>
