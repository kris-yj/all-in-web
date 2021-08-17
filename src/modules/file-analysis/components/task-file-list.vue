<template>
  <div class="task-file-list">
    <div class="list-title">
      {{ `${$t('检索结果：共')}${taskItemInfo.totalRecords || 0}${$t('条')}` }}
    </div>
    <div class="list-table">
      <common-table
        height="100%"
        stripe
        :columns="columns"
        :background="background"
        :data="taskItemInfo.records"
        :pagination-props="tablePagination"
        :pagination-events="paginationEvents">
        <template
          v-tooltip="true"
          v-slot:resourceName="scope">
          {{ scope.value }}
        </template>
        <!-- 文件大小 -->
        <template v-slot:resourceSize="scope">
          {{ bytesToSize(scope.value) }}
        </template>
        <!-- 操作 -->
        <template
          v-if="permission"
          v-slot:operate="{row}">
          <meg-button
            type="text"
            v-if="hasAttributeSearch"
            @click="commandFn(row, 'attribute-search')">
            {{ $t('解析结果') }}
          </meg-button>
          <!-- <meg-button
            type="text"
            @click="commandFn(row, 'capture-search')">
            {{ $t('抓拍检索') }}
          </meg-button> -->
          <meg-button
            type="text"
            v-if="hasAlarmHistory"
            @click="commandFn(row, 'alarm-history')">
            {{ $t('报警结果') }}
          </meg-button>
        </template>
      </common-table>
    </div>
  </div>
</template>
<script>
import CommonTable from '@/common-components/common-table';
import { switchToModule, utils } from '@/utils/utils.js';
import _ from 'lodash';
import commonSwitchParams from '@/common-components/common-switch-params';

export default {
  components: {
    CommonTable
  },
  props: {
    // 表格数据
    taskItemInfo: {
      type: Object,
      default: () => ({
        records: []
      })
    },
  },
  data() {
    // 表格分页事件配置
    this.paginationEvents = {
      change: this.paginationChange,
      // 'sync:currentPage': this.syncCurrentPage
    };
    // 表格无数据背景配置
    this.background = {
      icon: 'icon_4',
      text: this.$t('暂无数据')
    };
    this.columns = [{
      prop: 'resourceName',
      label: this.$t('文件名称'),
      minWidth: 500
    }, {
      prop: 'resourceSize',
      label: this.$t('文件大小'),
      align: 'center',
      minWidth: 160
    }, {
      prop: 'operate',
      label: this.$t('操作'),
      align: 'center',
      minWidth: 200
    }];
    return {

    };
  },
  computed: {
    permission() {
      return this.$store.getters.modulePermissonsByAlias('file-analysis').length;
    },
    hasAttributeSearch() {
      return this.$store.getters.modulesByAlias('attribute-search');
    },
    hasAlarmHistory() {
      return this.$store.getters.modulesByAlias('alarm-history');
    },
    // 表格的分页配置
    tablePagination() {
      return {
        align: 'center',
        layout: 'prev, pager, next, sizes, total',
        currentPage: _.isEmpty(this.taskItemInfo) ? 1 : this.taskItemInfo.pageNo,
        pageSizes: [20, 50, 100, 500, 1000],
        total: this.taskItemInfo.totalRecords || 0
      };
    },
  },
  created() {
    this.$emit('getTaskList', {
      pageNo: 1,
      pageSize: 60,
      taskId: this.$route.query.id
    });
  },
  methods: {
    /**
     * @description 将字节数据转换成合适的单位大小
     * @param {Number} bytes 字节大小
     * @returns {String} 修改单位后的数据表示
     */
    bytesToSize(bytes) {
      return utils.bytesToSize(bytes);
    },
    /**
     * @description 文件分析结果跳转
     * @param {Object} row 当前文件分析信息
     * @param {String} moduleAlias 要跳转的模块别名
     */
    commandFn(row, moduleAlias) {
      let query = {};
      if (moduleAlias === 'alarm-history') {
        query = {
          type: 'file',
          timeArr: JSON.stringify(['', '']),
          taskInfos: JSON.stringify([{
            id: row.taskId,
            idsIn: [row.id]
          }])
        };
        switchToModule({
          module: moduleAlias,
          query,
          pageType: 'single',
          isBlank: true
        });
      } else {
        query = {
          from: 'file-analysis',
          data: {
            sourceType: 'OFFLINE',
            taskInfos: [{
              id: row.taskId,
              idsIn: [row.id]
            }],
          }
        };
        console.log('query', query);
        new commonSwitchParams.FormatSwitchParams({
          module: moduleAlias,
          isBlank: true,
          pageType: 'single',
          query
        }).switchToModule();
      }
    },
    /**
     * @description 当前表格分页改变
     * @param {Object} paginationInfo 分页信息
     */
    paginationChange(paginationInfo) {
      this.$emit('getTaskList', {
        ...paginationInfo,
        taskId: this.$route.query.id
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.task-file-list {
  height: 100%;
    .list-title{
        line-height: 55px;
    }
    .list-table{
      height: calc(100% - 55px);
      background: #ffffff;
    }
}
</style>
