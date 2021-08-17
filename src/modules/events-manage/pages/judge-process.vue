<template>
  <div class="judge-wrapper">
    <h3 class="judge-title">
      共{{ totalRecords }}条
    </h3>
    <common-table
      class="main-table"
      height="100%"
      :loading="loading"
      :background="background"
      :pagination-props="pagination"
      :pagination-events="paginationEvents"
      :columns="columns"
      :data="list">
      <template v-slot:$index="{row}">
        <p>
          {{ row.$index }}
        </p>
      </template>
      <template v-slot:createTime="{row}">
        {{ row.createTime | formatTime }}
      </template>
      <template v-slot:imgUrl="{row}">
        <div class="pic">
          <meg-img-container
            :img-src="row.imageUrl">
          </meg-img-container>
        </div>
      </template>
      <template v-slot:operation="{row}">
        <p>{{ getActionName(row.operation) }}</p>
      </template>
    </common-table>
  </div>
</template>
<script>
import CommonTable from '@/common-components/common-table';
import EventManageApi from '../events-manage.service';

export default {
  name: 'JudgeProcess',
  components: {
    CommonTable
  },
  data() {
    return {
      columns: [
        {
          label: '序号',
          prop: '$index',
        },
        {
          label: '线索图片',
          prop: 'imgUrl',
        }, {
          label: '功能名称',
          prop: 'operation',
        },
        {
          label: '操作时间',
          prop: 'createTime',
        },
        {
          label: '操作人',
          prop: 'creatorName'
        }
      ],
      list: [],
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
      loading: false,
    };
  },
  computed: {
    actionNames() {
      return this.$store.getters.dataMapByType('kunlun_event_temp_origin');
    }
  },
  created() {
    this.getJudgeProcessList();
  },
  methods: {
    getActionName(action) {
      let actionName = '';
      this.actionNames.forEach((item) => {
        if (item.code === action) {
          actionName = item.value;
        }
      });
      return actionName;
    },
    /**
     * 获取研判过程列表
     */
    getJudgeProcessList() {
      const reqParams = {
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        eventId: this.$route.query.eventId
      };
      this.loading = true;
      EventManageApi.processList(reqParams).then((res) => {
        this.loading = false;
        if (res.code === 0) {
          this.totalRecords = res.data.totalRecords;
          this.pagination.total = this.totalRecords;
          this.list = res.data.records.map((item, index) => ({
            $index: index + 1,
            ...item
          }));
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    handleChange({ pageNo, pageSize }) {
      this.pageSize = pageSize;
      this.pageNo = pageNo;
      this.getJudgeProcessList();
    },
  }
};
</script>
<style lang="scss" scoped>
  .judge-wrapper {
    width: 100%;
    height: calc(100% - 56px);
    .judge-title {
      height: 56px;
      padding-left: 20px;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      background-color: #efefef;
      font-size: 14px;
      color: #435068;
    }
    .pic {
      width: 72px;
      height: 72px;
      >img {
        display: block;
        width: 72px;
        height: 72px;
        object-fit: cover;
      }
    }
  }
</style>
