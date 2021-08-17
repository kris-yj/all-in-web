<template>
  <common-layout aside-width="360px">
    <template v-slot:left>
      <event-info
        v-if="list.length"
        :list="list"
        :event-info="eventInfo"></event-info>
    </template>
    <template v-slot:right>
      <div class="container">
        <div
          class="loading"
          v-loading="loading">
          <!-- 头部 -->
          <div class="main-header">
            <div class="title">
              关联人员身份信息
            </div>
            <div class="actions">
              <meg-button @click.stop="handleAddToTemporaryShelf">
                从暂存架添加
              </meg-button>
              <meg-button @click="handleJumpToManageResult">
                发布战果
              </meg-button>
            </div>
          </div>
          <div
            class="related-list"
            v-background="bgVisible">
            <div class="list-container">
              <meg-card-frame
                class="related-card"
                :card-min-width="258"
                :gap="10">
                <div
                  class="modal-card"
                  v-for="(card, index) in identityResults"
                  :key="card.id"
                  @click="handleCardDetail(index)">
                  <database-card
                    :card-data="card"
                    :show-delete-button="true"
                    :show-jump-button="false"
                    :show-temporary-button="false"
                    @delete="handleDeleteRelated(card)">
                  </database-card>
                </div>
              </meg-card-frame>
            </div>
            <div class="list-pager">
              <meg-pagination
                :total="total"
                :page-sizes="[20, 40, 60]"
                @size-change="handleSizeChange"
                @current-change="handlePageChange"></meg-pagination>
            </div>
            <common-database-detail
              :index="captureIdx"
              :visible="captureDialogVisible"
              :result-list="identityResults"
              :show-temporary="false"
              @close="captureDialogVisible=false"></common-database-detail>
          </div>
        </div>
      </div>
    </template>
  </common-layout>
</template>
<script>
import DatabaseCard from '@/common-components/common-database-card';
import CommonDatabaseDetail from '@/common-components/common-database-detail';
import { switchToModule } from '@/utils/utils';
import CommonLayout from '@/common-components/common-layout';
import EventInfo from '../components/event-info';
import EventManageApi from '../events-manage.service';

export default {
  name: 'RelatedIdentity',
  components: {
    CommonLayout,
    EventInfo,
    DatabaseCard,
    CommonDatabaseDetail,
  },
  data() {
    return {
      list: [],
      eventInfo: null,
      identityResults: [],
      loading: false,
      pageSize: 20,
      pageNo: 1,
      total: 0,
      captureIdx: 0,
      captureDialogVisible: false,
    };
  },
  computed: {
    bgVisible() {
      const background = {
        icon: 'icon_2',
        text: '暂无数据'
      };
      if (this.identityResults.length > 0 || this.loading) return false;
      return background;
    },
    addSelf() {
      return this.$store.getters['shelf/eventAddData'];
    },
  },
  watch: {
    addSelf(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.getRelatedList();
      }
    }
  },
  created() {
    this.getEventDetailById();
    this.getRelatedList();
  },
  methods: {
    /**
     * 查看详情
     */
    handleCardDetail(idx) {
      this.captureIdx = idx;
      this.captureDialogVisible = true;
    },
    /**
     * 根据eventId查寻事件详情
     */
    getEventDetailById() {
      const { eventId } = this.$route.query;
      EventManageApi.eventsDetailByOne(eventId).then((res) => {
        if (res.code === 0) {
          this.eventInfo = res.data;
          this.dealWithBaseInfo(this.eventInfo);
        } else {
          this.$$message.error(res.msg);
        }
      });
    },
    /**
     * 获取关联身份列表
     */
    getRelatedList() {
      const reqParams = {
        pageSize: this.pageSize,
        pageNo: this.pageNo,
        eventId: this.$route.query.eventId,
      };
      this.loading = true;
      EventManageApi.identityList(reqParams).then((res) => {
        this.loading = false;
        if (res.code === 0) {
          this.identityResults = res.data.records;
          this.total = res.data.totalRecords;
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    /**
     * 处理关联事件信息
     */
    dealWithBaseInfo(eventInfo) {
      this.list = [
        {
          label: '发生时间',
          value: eventInfo.eventTime,
        },
        {
          label: '发生地点',
          value: eventInfo.eventPlace,
        },
        {
          label: '事件描述',
          value: eventInfo.eventDesc
        }];
    },
    handleSizeChange(size) {
      this.pageSize = size;
      this.timer = setTimeout(() => {
        this.getRelatedList();
      }, 20);
    },
    handlePageChange(page) {
      clearTimeout(this.timer);
      this.pageNo = page;
      this.getRelatedList();
    },
    /**
     * 从关联图片库删除卡片
     */
    handleDeleteRelated(card) {
      const { id } = card;
      this.$confirm('此操作将删除关联人员身份信息, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        EventManageApi.identityDelete(id).then((res) => {
          if (res.code === 0) {
            this.$message.success(res.msg);
            this.getRelatedList();
          } else {
            this.$message.error(res.msg);
          }
        });
      });
    },
    /**
     * 跳转到发布战果
     */
    handleJumpToManageResult() {
      const { eventId } = this.$route.query;
      switchToModule({
        module: 'results',
        child: 'manage-result',
        query: {
          eventId,
        },
        pageType: 'single',
        isBlank: true
      });
    },
    /**
     * 加入暂存架
     */
    handleAddToTemporaryShelf() {
      this.$store.dispatch('shelf/setShelfState', true);
    }
  }
};
</script>
<style lang="scss" scoped>
  .container {
    box-sizing: border-box;
    height: 100%;
    padding-right: 10px;
    .loading {
      width: 100%;
      height: 100%;
    }
  }
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
  .related-list {
    width: 100%;
    height: calc(100% - 56px);
    overflow: hidden;
    .list-container {
      height: calc(100% - 56px);
      overflow-y: scroll;
      .modal-card{
        position: relative;
        cursor: pointer;
        &:hover {
          .card-actions {
            opacity: 1;
          }
        }
        .card-actions {
          position: absolute;
          top: 4px;
          right: 4px;
          z-index: 1;
          display: flex;
          justify-content: flex-start;
          align-items: center;
          opacity: 0;
          .del-icon {
            display: none;
            width: 20px;
            height: 20px;
            border-radius: 1px;
            background: rgba(134,154,187,0.80);
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
          }
        }
      }
    }
    .list-pager {
      height: 56px;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #fff;
    }
  }
</style>
