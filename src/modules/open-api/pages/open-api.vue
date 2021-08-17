<template>
  <div class="interface-container">
    <div class="header">
      <span>{{ $t("接口管理") }}</span>
      <div>
        <meg-button
          type="primary"
          @click="create">
          {{ $t("新建授权") }}
        </meg-button>
        <meg-button @click="edit">
          {{ $t("编辑") }}
        </meg-button>
        <meg-button @click="setting">
          {{ $t("设置") }}
        </meg-button>
        <meg-button @click="deleteAuth">
          {{ $t("删除") }}
        </meg-button>
      </div>
    </div>
    <div class="content">
      <meg-tabs
        v-model="activeName"
        @tab-click="handleTabClick">
        <meg-tab-pane
          v-loading="loading"
          v-for="item in list"
          :key="item.userName"
          :label="`${item.vendorName}-${item.userName}`"
          :name="item.userName">
          <detail
            ref="detail"
            :level-auth="levelAuth"
            :auth-list="authList"
            :data-push="dataPush"
            :album-list="albumList"
            :all-album-list="allAlbumList"
            :album-list-default-checked-keys="albumListDefaultCheckedKeys"
            :all-device-list="allDeviceList"
            :search-device-list="searchDeviceList"
            :ablum-device-list="ablumDeviceList"
            :device-list-default-checked-keys="deviceListDefaultCheckedKeys"></detail>
        </meg-tab-pane>
      </meg-tabs>
      <meg-dialog
        @close="cancelSettings"
        custom-class="openapi-dialog"
        :title="$t('设置访问限制')"
        :is-loading="isLoading"
        :visible="showConfirmSettings">
        <div class="dialog-body">
          <div class="witnesses-create-form">
            <meg-form
              ref="settings"
              class="form-settings"
              :model="formData"
              label-position="right"
              :rules="rules"
              :label-width="labelWidth">
              <meg-form-item
                prop="ACCESS_DAY_LIMIT"
                :label="$t('每日最大访问限制')">
                <meg-input
                  :placeholder="$t('请输入数字')"
                  v-model="formData.ACCESS_DAY_LIMIT"></meg-input>{{ $t('次/天') }}
                <meg-popover
                  class="accessAddrLimit-help"
                  placement="top"
                  width="210"
                  trigger="click"
                  :content="$t('单个用户单个接口可以授权的最大访问次数')">
                  <span
                    class="help-icon"
                    slot="reference">
                    <meg-icon
                      name="help_prompt"
                      width="14"
                      height="14"
                      color="#21539b"></meg-icon>
                  </span>
                </meg-popover>
              </meg-form-item>
              <meg-form-item
                prop="ACCESS_SEC_LIMIT"
                :label="$t('每日最大流量限制')">
                <meg-input
                  :placeholder="$t('请输入数字')"
                  v-model="formData.ACCESS_SEC_LIMIT"></meg-input>{{ $t('次/秒') }}
              </meg-form-item>
            </meg-form>
          </div>
        </div>
        <template slot="footer">
          <meg-button
            @click="confirmSettings"
            type="primary">
            {{ $t('保存') }}
          </meg-button>
          <meg-button @click="cancelSettings">
            {{ $t('取消') }}
          </meg-button>
        </template>
      </meg-dialog>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import DetailComponent from '../components/detail-component';
import OpenApiSrv from '../open-api.service';
import rules from '../open-api.rule';

export default {
  components: {
    detail: DetailComponent
  },
  data() {
    return {
      activeName: '',
      id: 0,
      showConfirmSettings: false,
      list: [],
      levelAuth: {},
      authList: [],
      formData: {
        ACCESS_DAY_LIMIT: 0,
        ACCESS_SEC_LIMIT: 0
      },
      isLoading: false,
      dataPush: [],
      allAlbumList: [],
      albumList: [],
      loading: false,
      albumListDefaultCheckedKeys: [],
      deviceListDefaultCheckedKeys: [],
      allDeviceList: [],
      searchDeviceList: [],
      ablumDeviceList: [],
      rules: rules.identityAuth,
      currentLocale: 'zh-CN',
    };
  },
  computed: {
    labelWidth() {
      return this.currentLocale === 'zh-CN' ? '140px' : '180px';
    }
  },
  created() {
    this.init();
    console.log(this.rules);
    this.currentLocale = this.$store.state.currentLocale;
  },
  methods: {

    /**
     * 初始化
     */
    async init() {
      this.loading = true;
      await this.getList();
      if (!(_.isEmpty(this.list))) {
        this.activeName = this.list[0].userName;
        // 获取当前用户的详细信息
        await this.getDetail(this.activeName);
      }
    },
    /**
     * 获取列表
     */
    async getList() {
      const result = await OpenApiSrv.list({
        pageNo: 1,
        pageSize: 100000 // 返回所有的列表
      });
      console.log(result);
      if (result.code !== 0) {
        this.$message({
          type: 'error',
          message: result.msg
        });
      }
      this.list = result.data.records || [];
    },
    /**
     * 获取详细信息
     * @param(String) id 当前授权用户id
     */
    async getDetail(id) {
      this.id = id;
      await this.getLevelAuth(id);
      await this.getAuthList(id);
      await this.getDataPush(id);
      await this.getAlbumList(id);
      await this.getDeviceList(id);
    },
    /**
     * 获取用户级别授权（ip、流量）
     * @param(Number) id 当前授权用户id
     */
    async getLevelAuth(id) {
      const result = await OpenApiSrv.levelAuth({ id });
      if (result.code !== 0) {
        this.$message({
          type: 'error',
          message: result.msg
        });
      }
      this.levelAuth = result.data || {};
    },
    /**
     * 获取接口授权列表
     * @param(Number) id 当前授权用户id
     */
    async getAuthList(id) {
      const result = await OpenApiSrv.authList({ id });
      if (result.code !== 0) {
        this.$message({
          type: 'error',
          message: result.msg
        });
        throw new Error(this.$t('获取授权接口失败'));
      }
      this.authList = result.data || [];
    },
    /**
     * 获取数据推送列表
     * @param(Number) id 当前授权用户id
     */
    async getDataPush(id) {
      const result = await OpenApiSrv.dataPush({ id });
      if (result.code !== 0) {
        this.$message({
          type: 'error',
          message: result.msg
        });
        throw new Error(this.$t('获取数据推送失败'));
      }
      this.dataPush = result.data || [];
    },
    /**
     * 获取接口底库列表
     */
    async getAlbumList(id) {
      // 接口
      const res = await OpenApiSrv.albumList({ id, bizType: '0' });
      this.allAlbumList = res.data;
      // 告警
      const rep = await OpenApiSrv.albumList({ id, bizType: '2' });
      this.albumList = rep.data;
    },
    /**
    * 获取设备列表
    * @param(Number) id 当前授权用户id
    */
    async getDeviceList(id) {
      // 接口
      const result = await OpenApiSrv.deviceList({ id, bizType: '0' });
      if (result.code !== 0) {
        this.$message({
          type: 'error',
          message: result.msg
        });
      }
      this.allDeviceList = result.data || [];
      // 抓拍
      const res = await OpenApiSrv.deviceList({ id, bizType: '1' });
      if (result.code !== 0) {
        this.$message({
          type: 'error',
          message: res.msg
        });
      }
      this.searchDeviceList = res.data || [];
      // 告警
      const rep = await OpenApiSrv.deviceList({ id, bizType: '2' });
      if (result.code !== 0) {
        this.$message({
          type: 'error',
          message: rep.msg
        });
      }
      this.ablumDeviceList = rep.data || [];
    },
    /**
     * 新建授权
     */
    create() {
      this.$router.push({
        name: 'open-api-create'
      });
    },
    /**
     * 编辑授权
     */
    edit() {
      this.$router.push({
        name: 'open-api-create',
        query: { id: this.id }
      });
    },
    setting() {
      this.getMaxAccessLimit();
      this.getMaxAccessDayLimit();
      this.showConfirmSettings = true;
    },
    async confirmSettings() {
      this.$refs.settings.validate(async (valid) => {
        if (valid) {
          this.isLoading = true;
          const param = {
            keyValue: [{
              /**
               * 每日最大访问次数
               */
              'key': 'ACCESS_DAY_LIMIT',
              'value': this.formData.ACCESS_DAY_LIMIT
            },
            {
              /**
               * 每秒访问速率
               */
              'key': 'ACCESS_SEC_LIMIT',
              'value': this.formData.ACCESS_SEC_LIMIT
            }]
          };
          const res = await OpenApiSrv.updateSettings(param);
          if (res.code !== 0) {
            this.$message.error(res.msg);
            this.isLoading = false;
          } else {
            this.$message.success(res.msg);
            this.showConfirmSettings = false;
          }
        }
      });
    },
    closedSettings() {
      this.isLoading = false;
    },
    cancelSettings() {
      this.showConfirmSettings = false;
    },
    /**
     * 删除操作
     * @param {Number} id
     */
    async deleteAuth() {
      // 弹出删除提示框
      await this.$confirm(
        this.$t('此操作将永久删除该{entity}, 是否继续?', { entity: this.$t('此授权接口') }), // delete body
        this.$t('确定要删除{entity}', { entity: this.$t('此授权接口') }), // delete title
        {
          confirmButtonText: this.$t('确定'),
          cancelButtonText: this.$t('取消'),
          customClass: 'openapi-dialog'

        }
      ).then(() => {
        this.deleteUser();
      });
    },
    async deleteUser() {
      const result = await OpenApiSrv.deleteUser({ id: this.id });
      if (result.code !== 0) {
        this.$message.error(result.msg);
      } else {
        this.$message.success(result.msg);
        this.init();
      }
    },
    async getMaxAccessLimit() {
      const result = await OpenApiSrv.itemvalue({ item: 'ACCESS_SEC_LIMIT' });
      this.formData.ACCESS_SEC_LIMIT = result.data;
    },
    async getMaxAccessDayLimit() {
      const result = await OpenApiSrv.itemvalue({ item: 'ACCESS_DAY_LIMIT' });
      this.formData.ACCESS_DAY_LIMIT = result.data;
    },
    /**
     * 处理tab切换事件
     * @param(String) tab 当前tab信息
     */
    async handleTabClick(tab) {
      try {
        this.loading = true;
        await this.getDetail(tab.name);
      } catch (error) {
        this.$message({
          type: 'error',
          message: error
        });
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/scss/index.scss";

.interface-container {
  @include flex-vertical;
  height: 100%;

  .header {
    display: flex;
    justify-content: space-between;
    height: 56px;
    line-height: 56px;
    background: #dce1e5;
    padding: 0 20px 0 26px;
    > span {
      color: #435068;
      font-weight: bold;
    }
  }
  .column-info-list {
    display: flex;
    height: 400px;
    .info-area {
      width: 50%;
      & > .meg-scrollbar {
        width: 500px;
      }
    }
  }
  .content {
    flex: 1;
    margin-left: 26px;
    height: calc(100% - 56px);
  }
  .form-settings {
    padding: 25px;
    .meg-input {
      width: 300px;
    }
  }

  .meg-tabs__header {
    margin: 0;
  }
  ::v-deep .meg-tabs__content {
    height: calc(100% - 75px);
  }

  .meg-tab-pane {
    height: 100%;
  }
  .meg-tabs__nav {
    height: 56px;
    line-height: 56px;
  }
  .meg-tabs {
    height: 100%;
  }
}
</style>
<style lang="scss">
.i18n-en-US {
  .openapi-dialog {
    &.meg-message-box {
      width: 455px;
    }
  }
}
</style>
