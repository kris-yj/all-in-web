<template>
  <page-layout>
    <common-layout>
      <template slot="left">
        <search-form @search="handleSearch"></search-form>
      </template>
      <template slot="right">
        <div class="event-container">
          <!-- 头部 -->
          <div class="main-header">
            <div class="title">
              检索结果：共{{ totalRecords }}条
            </div>
            <div class="actions">
              <meg-button
                v-if="isPermission"
                type="primary"
                @click="openEventDialogCreate">
                新建事件
              </meg-button>
            </div>
          </div>
          <common-table
            class="main-table"
            height="100%"
            :loading="loading"
            :background="background"
            :pagination-props="pagination"
            :pagination-events="paginationEvents"
            :columns="columns"
            :data="eventList">
            <template v-slot:eventName="{row}">
              <p
                class="event-name"
                v-tooltip="true"
                @click="handleJumpDetail(row)">
                {{ row.eventName }}
              </p>
            </template>
            <template v-slot:createTime="{row}">
              {{ row.createTime | formatTime }}
            </template>
            <template
              v-slot:action="{row}"
              v-if="isPermission">
              <meg-button
                v-for="action in actions"
                :key="action.value"
                @click.native.stop="handleButtonClick(row, action.value)"
                type="text"
                size="small">
                {{ action.label }}
              </meg-button>
            </template>
          </common-table>
          <event-dialog
            v-if="eventDialogVisible"
            ref="eventDialog"
            width="1100px"
            :id="eventId"
            :title="eventDialogTitle"
            :visible="eventDialogVisible"
            @success="handleEventDialogSucc"
            @cancel="handleCloseEventDialog"></event-dialog>
        </div>
      </template>
    </common-layout>
  </page-layout>
</template>

<script>
import CommonLayout from '@/common-components/common-layout';
import CommonTable from '@/common-components/common-table';
import { switchToModule } from '@/utils/utils.js';
import SearchForm from '../components/search-form';
import EventDialog from '../components/event-dialog';
import EventManageApi from '../events-manage.service';

export default {
  components: {
    CommonLayout,
    CommonTable,
    SearchForm,
    EventDialog,
  },
  data() {
    return {
      columns: [
        {
          label: '事件名称',
          prop: 'eventName',
        },
        {
          label: '事件编号',
          prop: 'eventNumber',
        }, {
          label: '创建时间',
          prop: 'createTime',
        },
        {
          label: '创建用户',
          prop: 'creatorName',
        },
      ],
      eventList: [],
      background: {
        icon: 'icon_2',
        text: '检索无结果'
      },
      pagination: {
        align: 'center',
        layout: 'prev, pager, next, sizes, total',
        'page-sizes': [20, 40, 60],
      },
      paginationEvents: {
        change: this.handleChange
      },
      pageNo: 1,
      pageSize: 20,
      totalRecords: 0,
      searchModel: {},
      loading: false,
      actions: [
        {
          label: '导出',
          value: 'export'
        },
        {
          label: '编辑',
          value: 'edit'
        },
        {
          label: '删除',
          value: 'delete'
        }
      ],
      eventDialogVisible: false,
      eventDialogTitle: '新建事件',
      eventId: 0,
    };
  },
  computed: {
    isPermission() {
      return this.$store.getters.modulePermissonsByAlias('events-manage', 'createEventsManage');
    }
  },
  created() {
    this.getEventList();
    if (this.isPermission) {
      this.columns.push({
        label: '操作',
        prop: 'action'
      });
    }
  },
  methods: {
    getEventList() {
      this.loading = true;
      const reqParams = {
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        ...this.searchModel,
      };
      EventManageApi.getEventList(reqParams).then((res) => {
        this.loading = false;
        if (res.code === 0) {
          this.eventList = res.data.records;
          this.totalRecords = res.data.totalRecords;
          this.pagination.total = this.totalRecords;
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    handleSearch(searchData) {
      const { beginTime, endTime, eventName } = searchData;
      this.searchModel = {
        beginTime,
        endTime,
        eventName
      };
      this.getEventList();
    },
    handleChange({ pageNo, pageSize }) {
      this.pageSize = pageSize;
      this.pageNo = pageNo;
      this.getEventList();
    },
    /**
     * 更多下拉菜单
     * @param { operate } 返回所点击的操作
     * @param { row } 点击表格每条数据返回该条数据
     * @returns
     */
    handleButtonClick(row, action) {
      const actionType = {
        export: this.handleExport,
        edit: this.openEventDialogEdit,
        delete: this.handleDelete,
      };
      actionType[action](row);
    },
    /**
     * 关闭新建事件弹窗
     */
    handleCloseEventDialog() {
      this.$refs.eventDialog.onClickClearLocation();
      this.eventDialogVisible = false;
    },
    /**
     * 编辑成功
     */
    handleEventDialogSucc() {
      this.handleCloseEventDialog();
      this.getEventList();
    },
    /**
     * 打开新建弹窗
     */
    openEventDialogCreate() {
      this.eventDialogTitle = '新建事件';
      this.eventId = 0;
      this.eventDialogVisible = true;
    },
    /**
     * 导出
     */
    handleExport(row) {
      const { id } = row;
      const reqParams = {
        eventId: id,
        type: 1
      };
      EventManageApi.exportEvent(id, reqParams).then((res) => {
        if (res.code === 0) {
          this.$message.success('导出成功，请前往任务列表下载');
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    /**
     * 打开编辑弹窗
     */
    openEventDialogEdit(row) {
      const { id } = row;
      this.eventDialogTitle = '编辑事件';
      this.eventId = id;
      this.eventDialogVisible = true;
    },
    /**
     * 删除
     */
    handleDelete(row) {
      const { id } = row;
      console.log(id);
      this.$confirm('此操作将删除该事件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.doDelete(id);
      });
    },
    doDelete(id) {
      EventManageApi.deleteEvent(id).then((res) => {
        if (res.code === 0) {
          this.getEventList();
          this.$message.success('删除成功!');
        }
      });
    }, /**
     * 跳转事件详情
     */
    handleJumpDetail(row) {
      const { id } = row;
      switchToModule({
        module: 'eventsDetail',
        query: {
          eventId: id
        },
        pageType: 'single',
        isBlank: true
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.event-name {
  display: inline-block;
  max-width: 240px;
  color: #21539b;
  cursor: pointer;
}
.event-container{
  padding-right: 20px;
  height: 100%;
  .main-header {
    width: 100%;
    height: 56px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .title {
      font-size: 14px;
      color: #435068;
    }
  }
  .main-table{
    height: calc(100% - 56px);
    padding-right: 20px;
    background-color: #fff;
  }
}
</style>
