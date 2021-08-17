<template>
  <div class="box-warp">
    <camera-search
      type="box"
      ref="cameraSearch"
      :dept-tree-data="orgTreeItemDatas"
      @search-click="searchBox"
      :camera-auth="boxAuth"
      @dept-node-change="searchBox"
      @reset-click="resetSearch"
      :title="$t('智能盒管理')"></camera-search>
    <div class="box-view">
      <div class="box-view-header">
        <div>
          <span
            v-show="!isSelect"
            class="box-header_title">{{ $t("智能盒在线数") }} (<span class="fontSize14">{{ boxListNumber.normal }}</span>/<span class="fontSize14">{{ boxListNumber.total }}</span>)</span>
          <span
            v-show="isSelect"
            class="box-header_title">
            <meg-checkbox
              style="margin-right: 20px"
              @change="toggleSelection"
              v-model="allChecked">{{ $t("跨页全选") }}</meg-checkbox>
            <span>{{ $t("已选") }}{{ allChecked ? total : selectBoxList.length }}{{ $t("项") }}</span>
          </span>
        </div>
        <div>
          <meg-button
            v-show="!isSelect"
            @click="createClick"
            type="primary">
            {{ $t("新建智能盒") }}
          </meg-button>
          <meg-button
            v-show="isSelect"
            @click="batchDeleteBox">
            {{ $t("删除") }}
          </meg-button>
          <meg-export-button
            v-show="!isSelect"
            :button-text="$t('批量导入')"
            :set-text="$t('批量编辑')"
            @export="batchImport"
            @set="batchEdit">
          </meg-export-button>
          <!-- <meg-button
            @click="batchImport"
            class="meg-export-button"
            v-show="!isSelect">
            批量导入
          </meg-button>
          <meg-button
            @click="batchEdit"
            class="meg-export-button"
            v-show="!isSelect">
            批量编辑
          </meg-button> -->

          <meg-export-button
            v-show="isSelect"
            @export="exportClick"
            @set="setExport">
          </meg-export-button>
          <meg-button
            v-if="isAuth"
            @click="selectClick">
            {{ !isSelect ? $t("选择") : $t("退出选择") }}
          </meg-button>
        </div>
      </div>
      <camera-table
        ref="cameraTable"
        :all-checked="allChecked"
        :table-select="isSelect"
        :camera-auth="boxAuth"
        @delete-device="deleteBox"
        @view-device="handleBoxDetailOpen"
        @edit-device="editDevice"
        :is-loading="isTableLoading"
        :table-data="boxDataList"
        @on-sort-change="onSortChange"
        @handle-selection-change="handleSelectionChange"
        :table-config="tableConfig"></camera-table>
      <div class="list-pager">
        <meg-pagination
          :total="total"
          :current-page.sync="listPagerInfo.pageNo"
          :page-size="listPagerInfo.pageSize"
          @size-change="sizeChange"
          @current-change="currentChange">
        </meg-pagination>
      </div>
    </div>
    <add-box
      v-if="isAddBox || isEditBox"
      :is-edit-box="isEditBox"
      :is-add-box="isAddBox"
      :add-form-data="addFormData"
      :org-tree-item-datas="orgTreeItemDatas"
      :is-box-loading="isBoxLoading"
      :rules="rules"
      :box-auth="boxAuth"
      @submit-add-box-form="submitAddBoxForm"
      @submit-edit-box-form="submitEditBoxForm"
      @cancel-box-dialog="cancelBoxDialog"></add-box>
    <box-detail
      v-if="isShowDetail"
      :is-loading="isBoxDetailLoading"
      :is-show-detail="isShowDetail"
      :channel-detail-loading="channelDetailLoading"
      :camera-list="cameraList"
      :camera-info="cameraInfo"
      :detail-data="boxDetailData"
      @get-camera-info="getCameraInfo"
      @cancel-box-detail-dialog="cancelBoxDetailDialog"></box-detail>
    <batch-import
      type="box"
      :upload-api="uploadApi"
      :edit-api="editApi"
      :mention-text="mentionText"
      :batch-import-show="batchImportShow"
      :is-edit="isBatchImportEdit"
      @download-template="downloadTemplate"
      @upload-camera-close="uploadCameraClose"
      @upload-camera-closed="uploadCameraClose"
      @get-list-data="getBoxList"></batch-import>
    <meg-export
      :visible="exportDialog"
      :category="false"
      @confirm="exportConfirm"
      @close="exportClose"
      :residue="exportResidue"
      :choosed="exportChoosed">
    </meg-export>
    <box-export
      @confirm-export="confirmExport"
      @cancel-export="cancelExport"
      :is-exports="isExports"></box-export>
  </div>
</template>

<script>
import globalConfig from '@/utils/config.utils.js';
import CameraSearch from '@/components/camera-common/camera-search.vue';
import CameraTable from '@/components/camera-common/camera-table-list.vue';
import BatchImport from '@/components/camera-common/batch-import';
import Rules from '@/modules/intelligent-box/intelligent-box.rule.js';
import _ from 'lodash';
import IntelligentBoxSrv from '../intelligent-box.service.js';
import AddBox from '../components/add-box.vue';
import BoxDetail from '../components/box-detail.vue';
import BoxExport from '../components/box-export.vue';

export default {
  components: {
    CameraSearch,
    CameraTable,
    AddBox,
    BoxDetail,
    BatchImport,
    BoxExport,
  },
  data() {
    const { system } = this.$store.getters;
    return {
      isExports: false,
      exportDialog: false,
      listPagerInfo: {
        pageNo: 1,
        pageSize: 20,
      },
      total: 0,
      isSelect: false,
      allChecked: false,
      tableConfig: [
        {
          id: 8,
          label: this.$t('智能盒名称'),
          prop: 'name',
        },
        {
          id: 9,
          label: this.$t('通道数'),
          prop: 'channelSize',
          align: 'center',
        },
        {
          id: 10,
          label: this.$t('运行状态'),
          prop: 'status',
          // width: '120px',
          align: 'center',
          sortable: true,
        },
        {
          id: 4,
          label: this.$t('智能盒URL'),
          prop: 'url',
        },
        {
          id: 11,
          label: this.$t('所属部门'),
          prop: 'deptName',
        },
      ],
      boxDataList: [],
      isTableLoading: false,
      exportResidue: [], // 获取导出字段
      exportChoosed: this.$store.getters.dataMapByType(
        'box_and_camera_export_column'
      ),
      addFormData: {
        name: '',
        manufacturer: '', // 厂商
        model: '', // 智能盒子型号
        number: '', // 智能盒子编号
        snNumber: '', // 智能盒子SN码
        channelSize: '', // 最大通道数
        gbPlatformId: '', // 国标平台id
        gbPlatformDeviceId: '', // 国标平台设备id
        deptId: '', // 智能盒子归属部门id
        url: '', // 流地址
        remark: '', // 备注
        lat: '', // 经度
        lon: '', // 纬度
      },
      isBoxLoading: false,
      isAddBox: false,
      isEditBox: false,
      selectBoxList: [],
      orgTreeItemDatas: [],
      rules: Rules.addBox(null),
      boxDetailData: {},
      isShowDetail: false,
      isBoxDetailLoading: false,
      query: {
        deptId: '',
      }, // 记录点击检索后的检索条件
      batchImportShow: false,
      isBatchImportEdit: false,
      uploadApi: '/api/rainbow/v1/device/box/import/excel', // 批量上传接口地址
      editApi: '/api/rainbow/v1/device/box/template/edit', // 批量编辑接口地址
      mentionText: this.$t(
        '厂商、智能盒型号、智能盒URL、最大通道数、国标平台设备ID、国标平台ID、流地址、状态'
      ), // 批量编辑底部文案
      cameraInfo: {
        iotDeviceInfo: { alarminConfigList: [] },
      }, // 通道详情里的相机详情
      cameraList: [], // 盒子的相机列表
      channelDetailLoading: false, // 通道列表相机详情loading
      heartBeatTimer: null,
      isAuth: true,
      /**
       * 双网相关
       */
      dualPlatformType: system.dualPlatformType.value === '1', // 是否公安网
      dualScene: Number(system.dualScene.value), // 当前场景
      dualDeviceEditable: system.dualDeviceEditable.value === 'true', // 是否有新建设备权限
      videoResolution: system.videoResolution.value === '3',
      boxListNumber: {
        total: 0,
        normal: 0,
      },
      cameraDetailStroe: {
        config: {},
        detail: {},
      },
      manufactureOption: this.$store.getters.dataMapByType(
        'device_manufacturer'
      ),
    };
  },
  computed: {
    boxAuth() {
      return {};
    },
  },
  created() {
    this.queryItemOrgTree();
    this.query.deptId = this.$store.getters.userOrg.id;
    // this.getBoxList();
    this.$nextTick(() => {
      this.$refs.cameraSearch.changeDropdown({
        type: 1,
        name: this.$t('按部门显示'),
      });
    });
    this.initExport();
  },
  methods: {
    /**
     * 获取在线盒子总数
     */
    async getOnLineBox() {
      const res = await IntelligentBoxSrv.getOnLineBox();
      if (res.code !== 0) {
        this.$message.error(res.msg);
        return;
      }
      this.boxListNumber = res.data;
    },
    /**
     * 搜索盒子列表 也是初始化搜索的地方
     */
    searchBox(param) {
      this.listPagerInfo.pageNo = 1;
      this.boxDataList = [];
      this.total = 0;
      this.selectClick();
      this.isSelect = false;
      this.getBoxList(param);
    },
    /**
     * 检索排序
     */
    onSortChange(orderBy = '', order = '') {
      this.query.orderBy = orderBy;
      this.query.order = order === 'descending' ? 'desc' : 'asc';
      // 排序change后重新查询对应排序的底库列表
      this.getBoxList();
    },
    /**
     * 获取智能盒列表
     */
    async getBoxList(formData = this.query) {
      const param = {
        // 因为导出需要检索条件记录一下
        ...formData,
        pageSize: this.listPagerInfo.pageSize,
        pageNo: this.listPagerInfo.pageNo,
      };
      param.orderBy = this.query.orderBy;
      param.order = this.query.order;
      this.query = formData;
      this.isTableLoading = true;
      const res = await IntelligentBoxSrv.getBoxList(param);
      this.isTableLoading = false;
      if (res.code !== 0) {
        this.$message.error(res.msg);
        return;
      }
      this.getOnLineBox();
      this.total = res.data.totalRecords;
      this.boxDataList = res.data.records;
      // 全选时每页都需要选中
      if (this.allChecked) {
        this.$nextTick(() => {
          this.toggleSelection();
        });
      }
    },
    /**
     * 当前选中点相机list
     */
    handleSelectionChange(row) {
      this.selectBoxList = row;
    },
    /*
     * 批量删除盒子
     */
    batchDeleteBox() {
      if (!this.selectBoxList.length) {
        this.$message.warning(this.$t('请先选择要删除的智能盒'));
        return;
      }
      if (this.allChecked) {
        this.$confirm(
          this.$t('全部智能盒将被删除，删除后无法恢复，您确定要继续吗？'),
          this.$t('删除智能盒'),
          {
            confirmButtonText: this.$t('确定'),
            cancelButtonText: this.$t('取消'),
          }
        )
          .then(() => {
            this.allDeleteBox();
          })
          .catch(() => {});
        return;
      }
      this.$confirm(
        this.$t('智能盒将被删除，您确定要继续吗？'),
        this.$t('删除智能盒'),
        {
          confirmButtonText: this.$t('确定'),
          cancelButtonText: this.$t('取消'),
        }
      )
        .then(() => {
          // 删除单个盒子
          const ids = _.map(this.selectBoxList, (item) => item.id);
          this.getDeleteBox(ids);
        })
        .catch(() => {});
    },
    /**
     * 删除单个盒子
     */
    deleteBox(ids) {
      this.$confirm(
        this.$t('智能盒及其关联相机将被删除，您确定要继续吗？'),
        this.$t('删除智能盒'),
        {
          confirmButtonText: this.$t('确定'),
          cancelButtonText: this.$t('取消'),
        }
      )
        .then(() => {
          this.getDeleteBox(ids);
        })
        .catch(() => {});
    },
    /**
     * 删除全部盒子
     */
    async allDeleteBox() {
      const param = this.query;
      const res = await IntelligentBoxSrv.allDelete(param);
      if (res.code !== 0) {
        this.$message.error(res.msg);
        return;
      }
      this.$message.success(this.$t('删除成功'));

      this.searchBox();
    },
    /**
     * 删除多个盒子 也可以是单个
     */
    async getDeleteBox(ids) {
      const res = await IntelligentBoxSrv.batchDeleteBox({ ids });
      if (res.code !== 0) {
        this.$message.error(res.msg);
        return;
      }
      this.$message.success(this.$t('删除成功'));
      this.searchBox();
    },
    /**
     * 初始化搜索条件
     */
    resetSearch() {
      const { cameraTable } = this.$refs;
      this.query.orderBy = '';
      this.query.order = '';
      cameraTable.clearSort();
    },
    /**
     *  实现跨页全选逻辑
     */
    toggleSelection() {
      const { cameraTable } = this.$refs;
      //  点击跨页全选 allChecked
      // cameraTable.toggleAllSelection();
      if (this.allChecked) {
        this.boxDataList.forEach((row) => {
          cameraTable.toggleRowSelection(row, true);
        });
      } else {
        cameraTable.clearSelection();
      }
    },
    /**
     * 初始化导出设置
     */
    initExport() {
      if (
        localStorage.getItem('boxExportResidue')
        && localStorage.getItem('boxExportChoosed')
      ) {
        this.exportResidue = JSON.parse(
          localStorage.getItem('boxExportResidue')
        );
        this.exportChoosed = JSON.parse(
          localStorage.getItem('boxExportChoosed')
        );
      }
    },
    /**
     * 保存导出设置
     */
    exportConfirm(e) {
      this.exportResidue = e.residue;
      this.exportChoosed = e.choosed;
      //  导出设置存储到localStorage
      localStorage.setItem(
        'boxExportResidue',
        JSON.stringify(this.exportResidue)
      );
      localStorage.setItem(
        'boxExportChoosed',
        JSON.stringify(this.exportChoosed)
      );
      this.exportDialog = false;
    },
    /**
     * 取消导出设置
     */
    exportClose() {
      this.exportDialog = false;
    },
    /**
     * 打开导出设置
     */
    setExport() {
      this.exportDialog = true;
    },
    /**
     * 选择导出
     */
    exportClick() {
      if (!this.selectBoxList.length && !this.allChecked) {
        this.$message.warning(this.$t('请先选择要导出的智能盒'));
      } else {
        this.isExports = true;
      }
    },
    /**
     * 取消导出
     */
    cancelExport() {
      this.isExports = false;
    },
    /**
     * 确认导出
     */
    confirmExport(type) {
      this.isExports = false;
      if (this.allChecked) {
        this.allExport(type);
      } else {
        this.batchExport(type);
      }
    },
    /**
     * 批量导出
     */
    async batchExport(type) {
      const param = {
        associated: type,
        items: this.exportChoosed,
        ids: _.map(this.selectBoxList, (item) => item.id),
      };
      const res = await IntelligentBoxSrv.batchExport(param);
      if (res.code === 0) {
        this.$message.success(this.$t('导出成功，请到任务列表中查看'));
      } else {
        this.$message.error(res.msg);
      }
      this.getBoxList();
    },
    /**
     * 全部导出
     */
    async allExport(type) {
      const param = {
        associated: type,
        items: this.exportChoosed,
        ...this.query,
      };
      const res = await IntelligentBoxSrv.allExport(param);
      if (res.code === 0) {
        this.$message.success(this.$t('全部导出成功'));
      } else {
        this.$message.error(res.msg);
      }
      this.getBoxList();
    },
    /*
     * 新建盒子
     * */
    createClick() {
      this.addFormData = {
        name: '',
        manufacturer: '', // 厂商
        model: '', // 智能盒子型号
        number: '', // 智能盒子编号
        snNumber: '', // 智能盒子SN码
        channelSize: '', // 最大通道数
        gbPlatformId: '', // 国标平台id
        gbPlatformDeviceId: '', // 国标平台设备id
        deptId: '', // 智能盒子归属部门id
        url: '', // 流地址
        remark: '', // 备注
        lat: '', // 经度
        lon: '', // 纬度
      };
      this.isAddBox = true;
    },
    /**
     * 选择状态事件
     */
    selectClick() {
      this.isSelect = !this.isSelect;
      this.selectBoxList = [];
      this.allChecked = false;
      this.$refs.cameraTable.clearSelection();
    },
    /**
     * 切换分页大小
     */
    sizeChange(size) {
      this.listPagerInfo = {
        pageSize: size,
        pageNo: 1,
      };
      this.getBoxList();
    },
    /**
     * 切换当前页
     */
    currentChange(page) {
      this.listPagerInfo = {
        pageSize: this.listPagerInfo.pageSize,
        pageNo: page,
      };
      this.getBoxList();
    },
    /*
     * 盒子添加表单提交
     * */
    async submitAddBoxForm(params) {
      const formData = params;
      // @TODO 存储位置的判断？
      this.isBoxLoading = true;
      const res = await IntelligentBoxSrv.createBox(formData);
      // 判断数据是否请求成功
      if (res.code === 0) {
        this.$message.success(this.$t('添加成功'));
        this.isAddBox = false;
        this.getBoxList();
      } else {
        this.$message.error(res.msg || this.$t('添加失败'));
      }
      this.isBoxLoading = false;
    },
    /*
     * 盒子编辑表单提交
     * */
    async submitEditBoxForm(params) {
      const formData = params;
      // @TODO 存储位置的判断？
      this.isBoxLoading = true;
      const res = await IntelligentBoxSrv.editBox(formData);
      // 判断数据是否请求成功
      if (res.code === 0) {
        this.$message.success(this.$t('编辑成功'));
        this.isEditBox = false;
        this.getBoxList();
      } else {
        this.$message.error(res.msg || this.$t('编辑失败'));
      }
      this.isBoxLoading = false;
    },
    /*
     * 编辑盒子
     * */
    async editDevice(data) {
      this.isTableLoading = true;
      const res = await IntelligentBoxSrv.queryBoxDetail({ id: data.id });
      if (res.code === 0) {
        const editData = res.data;
        this.rules = Rules.addBox(data.id);
        editData.manufacturer = `${editData.manufacturer}`;
        editData.model = `${editData.model}`;
        this.addFormData = editData;
        this.isEditBox = true;
      } else {
        this.$message.error(res.msg);
      }
      this.isTableLoading = false;
    },
    /*
     * 新建或编辑弹框关闭
     * */
    cancelBoxDialog() {
      this.isAddBox = false;
      this.isEditBox = false;
      this.isBoxLoading = false;
    },
    /*
     * 智能盒子归属部门展示
     * */
    async queryItemOrgTree() {
      const res = await IntelligentBoxSrv.getQueryItemOrgTree();
      if (res.code === 0) {
        this.orgTreeItemDatas = [res.data];
        this.$nextTick(() => {
          this.$refs.cameraSearch.setDeptNode(this.$store.getters.userOrg.id);
        });
      } else {
        this.$message.error(res.msg);
      }
    },
    /*
     * 全景图配置
     * */
    async queryPanoramaConfig(params) {
      const res = await IntelligentBoxSrv.queryPanoramaConfig(params);
      return new Promise((resolve) => {
        if (res.code === 0) {
          resolve(res.data);
        } else {
          resolve({});
          this.$message.error(res.msg || this.$t('请求失败'));
        }
      });
    },
    /*
     * 版本详情
     * */
    async queryVersionDetail(params) {
      const res = await IntelligentBoxSrv.queryVersionDetail(params);
      return new Promise((resolve) => {
        if (res.code === 0) {
          resolve(res.data);
        } else {
          resolve({});
          this.$message.error(res.msg || this.$t('请求失败'));
        }
      });
    },
    /*
     * 盒子基本信息
     * */
    async queryBaseInfo(params) {
      const res = await IntelligentBoxSrv.queryBoxDetail(params);
      return new Promise((resolve) => {
        if (res.code === 0) {
          resolve(res.data);
        } else {
          resolve({});
          this.$message.error(res.msg || this.$t('请求失败'));
        }
      });
    },
    /*
     * 盒子详情数据合并
     * */
    queryBoxDetail(params) {
      this.isBoxDetailLoading = true;
      const { queryPanoramaConfig, queryVersionDetail, queryBaseInfo } = this;
      const arr = this.$store.getters.dataMapByType('box_megvii_mode');
      return Promise.all([
        queryPanoramaConfig(params),
        queryVersionDetail(params),
        queryBaseInfo(params),
      ])
        .then((res) => {
          this.boxDetailData = Object.assign({}, ...res);
          arr.forEach((val) => {
            if (`${this.boxDetailData.model}` === val.code) {
              this.boxDetailData.modelName = val.value;
            }
          });
        })
        .catch((e) => {
          this.$message.error(e || this.$t('请求失败'));
        })
        .finally(() => {
          this.isBoxDetailLoading = false;
        });
    },
    /*
     * 关闭盒子详情dialog
     * */
    cancelBoxDetailDialog() {
      this.isShowDetail = false;
    },
    /*
     * 打开详情弹框
     * */
    async handleBoxDetailOpen(data) {
      const { id } = data;
      await this.getCameraListByBoxId({ boxId: id });
      await this.queryBoxDetail({ id });
      this.isShowDetail = true;
    },
    /*
     *  刷新tree列表
     * */
    retry() {
      // TODO 获取相机树
      // this.getCameraTree();
    },
    /*
     * 首页批量导入
     * */
    uploadCameraOpen() {
      if (!this.noAddCamera) {
        this.batchImportShow = true;
      }
    },
    /*
     *  首页批量导入关闭
     * */
    uploadCameraClose() {
      this.batchImportShow = false;
    },
    /*
     * 下载模板
     * */
    async downloadTemplate() {
      const res = await IntelligentBoxSrv.getDownloadTemplate();
      if (res.code === 0) {
        window.location.href = `${globalConfig.apiPath.service}${res.data}`;
      } else {
        this.$message.error(res.msg || this.$t('下载失败'));
      }
    },
    /**
     * 批量导入
     */
    batchImport() {
      this.isBatchImportEdit = false;
      this.batchImportShow = true;
    },
    /**
     * 批量编辑
     */
    batchEdit() {
      this.isBatchImportEdit = true;
      this.batchImportShow = true;
    },
    /**
     * 获取盒子关联的相机列表
     */
    async getCameraListByBoxId(params) {
      const res = await IntelligentBoxSrv.getCameraListByBoxId(params);
      if (res.code === 0) {
        res.data.forEach((item) => {
          // 因为tree不能没有childen所以加上
          item.items = [];
        });
        this.cameraList = res.data;
      } else {
        this.$message.error(res.msg || this.$t('相机列表获取失败'));
      }
    },
    /*
     * 盒子关联相机详细信息
     * */
    async getCameraInfo(id) {
      this.channelDetailLoading = true;
      await this.getCameraData(id);
      let typeName = '';
      let modelName = '';
      this.$store.getters.dataMapByType('camera_type').forEach((val) => {
        if (`${this.cameraDetailStroe.detail.type}` === val.code) {
          typeName = val.value;
          this.tabCameraModelOption(
            `${this.cameraDetailStroe.detail.type}`
          ).forEach((value) => {
            if (value.code === `${this.cameraDetailStroe.detail.model}`) {
              modelName = value.value;
            }
          });
        }
      });
      this.cameraInfo = {
        ...this.cameraDetailStroe.detail,
        ...this.cameraDetailStroe.config,
        typeName,
        sncode: this.cameraDetailStroe.detail.snCode,
        modelName,
        iotDeviceInfo: {
          alarminConfigList: this.cameraDetailStroe.config.alarminConfigList,
        },
      };
      this.cameraInfo.manufacturer = _.find(this.manufactureOption, {
        code: `${this.cameraInfo.manufacturer}`,
      }).value; // 转换厂商
      this.channelDetailLoading = false;
    },
    /**
     * @description 获取设备的配置详情和相机详情
     * @param {string || number} id 相机id
     * @returns
     */
    async getCameraData(id) {
      const resArr = await Promise.all([
        IntelligentBoxSrv.queryCameraDeviceInfo(id),
        IntelligentBoxSrv.queryCameraDetail(id),
      ]);
      const [config, detail] = resArr;
      if (config.code === 0) {
        this.cameraDetailStroe.config = config.data;
      }
      if (detail.code === 0) {
        this.cameraDetailStroe.detail = detail.data;
      }
    },
    /**
     * @description 切换相机型号码表
     * @param {String} type
     */
    tabCameraModelOption(type) {
      let options = [];
      switch (type) {
        case '1':
          options = this.$store.getters.dataMapByType('camera_video_model');
          break;
        case '2':
          options = this.$store.getters.dataMapByType('camera_capture_model');
          break;
        case '11':
          options = this.$store.getters.dataMapByType('camera_cloud_mode');
          break;
        case '12':
          options = this.$store.getters.dataMapByType('box_megvii_mode');
          break;
        case '13':
          options = this.$store.getters.dataMapByType('camera_istinguish_mode');
          break;
        case '14':
          options = this.$store.getters.dataMapByType('camera_structured_mode');
          break;
        default:
          break;
      }
      return options;
    },
  },
};
</script>

<style lang="scss">
.box-warp {
  width: 100%;
  height: 100%;
  display: flex;

  .box-view {
    background: #dce0e4;
    flex: 1;
    display: flex;
    flex-direction: column;
    padding-left: 20px;
    width: calc(100% - 340px);

    .box-view-header {
      height: 56px;
      line-height: 56px;
      display: flex;
      justify-content: space-between;
      padding-right: 20px;
    }

    .box-header_title {
      color: #435068;
      font-size: 12px;

      .fontSize14 {
        font-size: 14px;
      }
    }
    .list-pager {
      background: white;
    }
    .meg-export-button {
      margin: 0 10px;
    }
  }
}
</style>
