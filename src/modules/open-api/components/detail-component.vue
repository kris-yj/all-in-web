<template>
  <div class="detail-container">
    <div class="input">
      <span class="title">{{ $t("访问地址限制") }}</span>
      <meg-form
        :model="levelAuth"
        ref="levelAuth"
        inline>
        <!-- <meg-form-item
          :label="$t('interfaces.desc')">
          <meg-input
            v-model="levelAuth.secLimit"
            :disabled="true"></meg-input>
        </meg-form-item> -->
        <span
          style="line-height:40px;color:#606266;padding-right:10px"
          v-if="levelAuth.ipCtrl=== '0'">
          {{ $t('不限访问地址') }}
        </span>
        <meg-form-item
          v-if="levelAuth.ipCtrl=== '1'"
          :label="$t('指定访问IP地址')">
          <meg-input
            v-model="levelAuth.ipList"
            :disabled="true"></meg-input>
          <meg-popover
            placement="top"
            width="210"
            trigger="click"
            :content="$t('可输入多个IP地址，用“；”号隔开')">
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
          :label="$t('流量限制')"
          label-width="100px">
          <meg-input
            :disabled="true"
            v-model="levelAuth.secLimit"></meg-input>{{ $t('次/秒') }}
          <meg-popover
            placement="top"
            width="210"
            trigger="click"
            :content="$t('厂商访问已授权接口的总速度，不包含数据推送接口。')">
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
      </meg-form>
    </div>
    <div class="table">
      <div>
        <span class="title">{{ $t("授权接口") }}</span>
        <meg-table
          ref="authInterface"
          :data="authList"
          stripe>
          <meg-table-column
            v-for="item in authInterfaceConfig"
            :key="item.id"
            :label="item.label"
            :prop="item.prop"
            :align="item.align"
            :width="item.width">
            <template slot-scope="scope">
              <!-- column: 是否启用 -->
              <span v-if="item.id===1">{{ scope.row[item.prop] ? $t('开启') : $t('关闭') }}</span>
              <!-- column: 时间段 -->
              <!-- <span v-else-if="item.id===4">
                {{ scope.row["timeCtrl"] === '1' ? `${scope.row["accessBegintime"]} 至 ${scope.row["accessEndtime"]}` : '' }}
              </span> -->
              <span v-else-if="item.id===3">
                {{ scope.row[item.prop] === '1' ? `${scope.row["accessBeginTime"]}&nbsp;${$t('至')}&nbsp;${scope.row["accessEndTime"]}` : $t('长期') }}
              </span>
              <span v-else-if="item.id===5">
                {{ scope.row[item.prop] === '1' ? scope.row['hourPairs']: '-' }}
              </span>
              <span v-else>
                {{ scope.row[item.prop] }}
              </span>
            </template>
          </meg-table-column>
        </meg-table>
      </div>
      <div>
        <span class="title">{{ $t("数据推送") }}</span>
        <meg-table
          ref="dataPush"
          :data="dataPush"
          stripe>
          <meg-table-column
            v-for="item in dataPushConfig"
            :key="item.id"
            :label="item.label"
            :prop="item.prop"
            :align="item.align"
            :width="item.width">
            <template slot-scope="scope">
              <!-- column: 是否启用 -->
              <span v-if="item.id===1">{{ scope.row[item.prop] ? $t('开启') : $t('关闭') }}</span>
              <!-- column: 时间段 -->
              <span v-else-if="item.id===4">
                {{ scope.row["timeCtrl"] === '1' ? `${scope.row["accessBeginTime"]} &nbsp;${$t('至')}&nbsp; ${scope.row["accessEndTime"]}` : '' }}
              </span>
              <span v-else-if="item.id===3">
                {{ scope.row[item.prop] === '1' ? $t('临时') : $t('长期') }}
              </span>
              <span v-else-if="item.id ===2">
                {{ scope.row["queueTypeName"] }}
              </span>
              <span v-else-if="item.id ===6">
                {{ scope.row["queueName"]?`${scope.row["queueName"]}_faceAlarm`:'' }}
              </span>
              <span v-else-if="item.id ===7">
                {{ scope.row["queueName"]?`${scope.row["queueName"]}_pedestrianAlarm`:'' }}
              </span>
              <span v-else-if="item.id ===8">
                {{ scope.row["queueName"]?`${scope.row["queueName"]}_plateNum`:'' }}
              </span>
              <span v-else>
                {{ scope.row[item.prop] }}
              </span>
            </template>
          </meg-table-column>
        </meg-table>
      </div>
    </div>
    <div class="tree  column-info-auth">
      <span class="title">{{ $t('底库和设备授权') }}</span>
      <meg-radio-group v-model="activeIndex">
        <!-- <meg-radio-button
          :label="1">
          {{ $t('抓拍') }}
        </meg-radio-button> -->
        <meg-radio-button
          :label="2">
          {{ $t('告警') }}
        </meg-radio-button>
      </meg-radio-group>
      <div class="column-info-list">
        <!-- <div
          v-show="activeIndex === 0"
          class="info-area ablum-list">
          <span class="title">{{ $t('底库授权') }}</span>
            <meg-tree
              ref="allAlbum"
              node-key="id"
              :props="defaultProps"
              :data="allAlbumList"
              default-expand-all
              show-checkbox>
              <span
                class="name-wrap"
                slot-scope="{ data }">
                <span
                  v-tooltip="true"
                  class="ablum-name">
                  {{ data.albumName }}
                </span>
                <span class="btn-auth">
                  <span
                    v-for="(item,val) in data.authButton"
                    :key="item.delete"
                    v-show="item">{{ authButton[val] }}</span>
                </span>
              </span>
            </meg-tree>
        </div>
        <div
          v-show="activeIndex === 1"
          class="info-area">
          <span class="title">{{ $t('设备授权') }}</span>
            <meg-tree
              ref="searchCamera"
              :disabled="true"
              class="tree-selector"
              :props="{children: 'subOrgs', label: 'orgName'}"
              :standard-tree-data="true"
              :show-checkbox="true"
              :default-expand-all="true"
              :show-count="false"
              :check-strictly="false"
              :expand-on-click-node="true"
              :record-dynamic-select="false"
              :search-placeholder="$t('输入相机名进行查找')"
              :placeholder-text="$t('请选择相机')"
              :all-selected-text="$t('全部相机')"
              :empty-text="$t('暂无数据')"
              :selected-count-text="$t('已选择{count}个相机')"
              node-key="id"
              :pretreatment-node-data-fn="handleNodeFilter"
              @tree-update-ready="searchOnTreeUpdateReady"
              :data="searchDeviceList">
            </meg-tree>
        </div> -->
        <div
          v-show="activeIndex === 2"
          class="info-area ablum-list">
          <span class="title">{{ $t('底库授权') }}</span>
          <meg-tree
            ref="albumList"
            node-key="id"
            :props="defaultProps"
            :data="albumList"
            default-expand-all
            show-checkbox>
            <span
              class="name-wrap"
              slot-scope="{ data }">
              <span
                v-tooltip="true"
                class="ablum-name">
                {{ data.albumName }}
              </span>
              <span class="btn-auth">
                <span
                  v-show="item"
                  v-for="(item,val) in data.authButton"
                  :key="item.delete">{{ authButton[val] }}</span>
              </span>
            </span>
          </meg-tree>
        </div>
        <div
          v-show="activeIndex === 2"
          class="info-area">
          <span class="title">{{ $t('设备授权') }}</span>
          <meg-tree
            :disabled="true"
            ref="ablumCamera"
            class="tree-selector"
            :props="{children: 'subOrgs', label: 'orgName'}"
            :standard-tree-data="true"
            :show-checkbox="true"
            :default-expand-all="true"
            :show-count="false"
            :check-strictly="false"
            :expand-on-click-node="true"
            :record-dynamic-select="false"
            :search-placeholder="$t('输入相机名进行查找')"
            :placeholder-text="$t('请选择相机')"
            :all-selected-text="$t('全部相机')"
            :empty-text="$t('暂无数据')"
            :selected-count-text="$t('已选择{count}个相机')"
            node-key="id"
            :pretreatment-node-data-fn="handleNodeFilter"
            @tree-update-ready="ablumOnTreeUpdateReady"
            :data="ablumDeviceList">
          </meg-tree>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';

export default {
  components: {},
  props: {
    levelAuth: {
      type: Object,
      default: () => ({
        ipCtrl: '',
        ipList: '',
        secLimit: 0,
      })
    },
    authList: {
      type: Array,
      default: () => []
    },
    dataPush: {
      type: Array,
      default: () => []
    },
    albumList: {
      type: Array,
      default: () => []
    },
    // allAlbumList: {
    //   type: Array,
    //   default: () => []
    // },
    allDeviceList: {
      type: Array,
      default: () => []
    },
    searchDeviceList: {
      type: Array,
      default: () => []
    },
    ablumDeviceList: {
      type: Array,
      default: () => []
    },
    deviceListDefaultCheckedKeys: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      authButton: {
        create: this.$t('新建'),
        delete: this.$t('删除'),
        retrieve: this.$t('查看'),
        update: this.$t('编辑'),
      },
      activeIndex: 2,
      dataAuthConfig: [
        {
          // 接口编号
          id: 0,
          label: this.$t('接口编号'),
          prop: 'apiNo', // access_endtime
          align: 'center'
        },
        {
          // 开启权限
          id: 1,
          label: this.$t('开启权限'),
          prop: 'enable',
          width: '90px'
        },
        {
          // 接口名称
          id: 2,
          label: this.$t('接口名称'),
          prop: 'apiName'
        },
        {
          // 有效期
          id: 3,
          label: this.$t('有效期'),
          prop: 'timeCtrl',
          // width: '90px'
        },

        // 时段控制
        {
          id: 5,
          label: this.$t('时段控制'),
          prop: 'hourCtrl'
        },
      ],
      dataPushConfig: [
        {
          // 开启权限
          id: 1,
          label: this.$t('开启权限'),
          prop: 'enable',
          width: '90px'
        },
        {
          // 接口名称
          id: 2,
          label: this.$t('接口名称'),
          prop: 'apiName'
        },
        {
          // 有效期
          id: 3,
          label: this.$t('有效期'),
          prop: 'timeCtrl',
          width: '95px'
        },
        {
          // 期限
          id: 4,
          label: this.$t('期限'),
          prop: 'accessBeginTime', // access_endtime
          width: '280px'
        },
        {
          id: 5,
          label: this.$t('队列名称'),
          prop: 'queueName',

        },
        {
          id: 6,
          label: this.$t('人脸'),
          prop: 'faceAlarm',

        },
        {
          id: 7,
          label: this.$t('人体'),
          prop: 'pedestrianAlarm',

        },
        {
          id: 8,
          label: this.$t('车牌'),
          prop: 'plateNum',

        },
        // {
        //   id: 6,
        //   label: this.$t('队列IP地址'),
        //   prop: 'ip',

        // },
        // {
        //   id: 7,
        //   label: this.$t('队列端口'),
        //   prop: 'port',

        // },
        // {
        //   id: 8,
        //   label: this.$t('队列用户名'),
        //   prop: 'queueUserName',

        // },
        // {
        //   id: 9,
        //   label: this.$t('队列密码'),
        //   prop: 'queuePassword',

        // }

        // {
        //   // 时间段
        //   id: 4,
        //   label: this.$t('interfaces.timePeriod'),
        //   prop: 'accessBegintime' // access_endtime
        // }
      ],
      defaultProps: {
        // 功能权限树默认配置
        label: 'albumName',
        disabled: this.disabledFun
      },
    };
  },
  watch: {
    // allAlbumList(val) {
    //   const defaultSelect = _.pickBy(val, (item) => item.enable);
    //   this.$nextTick(() => {
    //     this.$refs.allAlbum.setCheckedKeys(_.map(defaultSelect, (item) => item.id));
    //   });
    // },
    albumList(val) {
      const defaultSelect = _.pickBy(val, (item) => item.enable);
      this.$nextTick(() => {
        this.$refs.albumList.setCheckedKeys(_.map(defaultSelect, (item) => item.id));
      });
    },
  },
  created() {
    this.init();
  },
  methods: {
    handleNodeFilter(node) {
      node.disabled = true;
    },
    disabledFun() {
      return true;
    },
    /**
     * 初始化
     */
    init() {
      this.initTableConfig();
    },
    /**
     * 初始化表格
     */
    initTableConfig() {
      this.authInterfaceConfig = _.cloneDeep(this.dataAuthConfig);
      this.authInterfaceConfig.splice(2, 0, {
        id: 10,
        label: `${this.$t('访问上限')}(${this.$t('次/天')})`,
        prop: 'dayLimit'
      });
    },
    // searchOnTreeUpdateReady(dataMap) {
    //   const defaultSelectNodes = dataMap.filter((item) => item.flag === 'DEVICE' && item.enable);
    //   this.$refs.searchCamera.setCheckedNodes(defaultSelectNodes);
    // },
    ablumOnTreeUpdateReady(dataMap) {
      const defaultSelectNodes = dataMap.filter((item) => item.flag === 'DEVICE' && item.enable);
      this.$refs.ablumCamera.setCheckedNodes(defaultSelectNodes);
    },
  }
};
</script>

<style lang="scss" scoped>
@import "@/scss/index.scss";

.detail-container {
  overflow-y: auto;
  height: 100%;
  .title {
    font-size: 14px;
    color: #435068;
    margin: 15px 0 10px 0;
    font-weight: bold;
  }
  .column-info-list {
    margin: 0 20px;
    &::v-deep input {
      width: 300px;
    }
  }
  .input {
    @include flex-vertical;
    border-bottom: 1px solid #f2f2f2;
    .meg-form {
      // display: flex;
      // justify-content: space-between;
      .meg-input,
      .meg-select {
        width: 300px;
      }
    }
  }
  .table {
    @include flex-vertical;
    justify-content: space-between;
    margin-right: 20px;
    > div {
      @include flex-vertical;
      flex: 1;
    }
  }
  .column-info-auth {
    flex-direction: column;
  }
  .tree {
    display: flex;
    .column-info-list {
      display: flex;
      height: 400px;
      .info-area {
        width: 50%;
      }
    }
    .info-area {
      @include flex-vertical;
      .meg-radio {
        line-height: 34px;
      }
    }
  }
  .help-icon {
    cursor: pointer;
    margin-left: 5px;
  }
  .custom-albumList-tree-node {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }
  .ablum-name {
    width: 126px;
    display: inline-block;
  }
  .btn-auth {
    & > span {
      padding-left: 5px;
    }
  }
  .name-wrap {
    width: calc(100% - 60px);
    display: flex;
    line-height: 26px;
  }
}
</style>
<style lang="scss">
.detail-container {
  .meg-tree__empty-text {
    color: #909399;
    font-size: 12px;
  }
}
</style>
