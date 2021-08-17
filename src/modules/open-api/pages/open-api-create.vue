<template>
  <div class="edit-container">
    <div class="nav">
      <meg-return-button
        :title="title"></meg-return-button>
      <div>
        <meg-button
          @click="saveAuth"
          :loading="loading"
          type="primary">
          {{ $t('保存') }}
        </meg-button>
        <meg-button @click="goBack">
          {{ $t('取消') }}
        </meg-button>
      </div>
    </div>
    <meg-tabs
      v-model="activeName"
      class="content">
      <meg-tab-pane
        :label="$t('认证授权')"
        name="identityAuth">
        <meg-form
          :label-width="labelWidth"
          :model="callerModel"
          ref="callerForm"
          label-position="right"
          :rules="callerFormRule">
          <meg-form-item
            :label="$t('调用方编号')">
            <span>{{ callerModel.userName }}</span>
          </meg-form-item>
          <meg-form-item
            :label="$t('调用方秘钥')"
            prop="userToken">
            <meg-input
              :disabled="true"
              v-model="callerModel.userToken">
            </meg-input>
            <meg-button
              class="updatePwd"
              @click="updateUserToken"
              type="text">
              {{ $t("更新秘钥") }}
            </meg-button>
          </meg-form-item>
          <meg-form-item
            :label="$t('调用方名称')"
            prop="vendorName">
            <meg-input
              :disabled="id?true:false"
              v-model="callerModel.vendorName">
              <!-- <meg-option
                v-for="item in vendorList"
                :label="item.vendorName"
                :value="item.vendorName"
                :key="item.vendorName"></meg-option> -->
            </meg-input>
          </meg-form-item>
          <meg-form-item
            :label="$t('有效期')">
            <template>
              <meg-radio-group
                v-model="callerModel.timeCtrl">
                <meg-radio
                  style="line-height:36px"
                  label="0">
                  {{ $t('长期') }}
                </meg-radio>
                <meg-radio
                  style="line-height:36px"
                  label="1">
                  {{ $t('临时') }}
                </meg-radio>
                <meg-date-picker
                  :range-separator="$t('至')"
                  :prefix-icon-visible="false"
                  :after-date="true"
                  type="daterange"
                  v-if="callerModel.timeCtrl==='1'"
                  v-model="timeSpan"
                  @change="setTimeCtrl"
                  format="yyyy-MM-dd"
                  class="datePicker"
                  group="today,lastThreeDay,lastWeek,lastMonth">
                </meg-date-picker>
              </meg-radio-group>
            </template>
          </meg-form-item>
          <meg-form-item
            :label="$t('描述')"
            prop="remark">
            <meg-input
              v-model="callerModel.remark"
              type="textarea"
              :rows="3"
              :maxlength="50"
              resize="none"
              :placeholder="$t('请输入{from}-{to}位数字、字母', {from: 1, to: 50})"></meg-input>
            <div class="counter">
              <span>{{ callerModel.remark&&callerModel.remark.length }}/50</span>
            </div>
          </meg-form-item>
        </meg-form>
      </meg-tab-pane>
      <meg-tab-pane
        v-if="id"
        :label="$t('接口授权')"
        name="interfaceAuth">
        <div class="interfaceAuth">
          <meg-form
            ref="accessLimitForm"
            label-position="left"
            :rules="callerFormRule"
            :model="accessLimit">
            <div class="column-info show-border">
              <div class="info-area">
                <span class="title">{{ $t('访问地址限制') }}</span>
                <meg-radio-group
                  @change="ipCtrlDisabled"
                  v-model="accessLimit.accessAddrLimit">
                  <meg-radio
                    label="0">
                    {{ $t('不限访问地址') }}
                  </meg-radio>
                  <meg-radio
                    label="1">
                    <span>{{ $t('指定访问IP地址') }}</span>
                    <meg-form-item
                      prop="ipList">
                      <meg-input
                        :disabled="accessLimit.accessAddrLimit==='0'"
                        class="accessAddrLimit-input"
                        v-model="accessLimit.ipList"
                        :placeholder="$t('请输入指定IP地址')"></meg-input>
                    </meg-form-item>
                  </meg-radio>
                  <meg-popover
                    class="accessAddrLimit-help"
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
                </meg-radio-group>
              </div>
              <div
                class="info-area info-area-accessLimit">
                <span class="title">{{ $t('流量限制') }}</span>
                <div class="accessLimit">
                  <span style="font-size:12px">{{ $t('流量限制') }}</span>
                  <meg-form-item
                    prop="accessLimitNumber">
                    <meg-input
                      v-model.number="accessLimit.accessLimitNumber"
                      :placeholder="$t('请输入{from}-{to}位数字', { from: 1, to: accessLimitNumberMax })"></meg-input>{{ $t('次/秒') }}
                  </meg-form-item>
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
                </div>
              </div>
            </div>
          </meg-form>
          <div class="info-area">
            <span class="title">{{ $t('授权接口') }}</span>
            <meg-table
              ref="authInterface"
              :data="authTableData"
              stripe>
              <meg-table-column
                v-for="item in dataAuthConfig"
                :key="item.id"
                :label="item.label"
                :prop="item.prop"
                :align="item.align"
                :width="item.width">
                <template slot-scope="scope">
                  <!-- column: 是否启用 -->
                  <span v-if="item.id===1">
                    <meg-switch
                      v-model="scope.row[item.prop]">
                    </meg-switch>
                  </span>
                  <!-- column: 时间段 -->
                  <span v-else-if="item.id===4">
                    <span
                      @click="dateClick(scope.row)"
                      v-if="scope.row['enable']&&scope.row['timeCtrl'] === '1'">
                      <meg-date-picker
                        type="daterange"
                        :range-separator="$t('至')"
                        :prefix-icon-visible="false"
                        v-model="scope.row.timeSpan"
                        default-date="today"
                        :format="'yyyy-MM-dd'"
                        @change="getDateValue"
                        group="today,lastThreeDay,lastWeek,lastMonth">
                      </meg-date-picker>
                    </span>
                    <span v-if="!scope.row['enable']">{{ scope.row["timeCtrl"] === '1' ? `${scope.row["accessBeginTime"]} &nbsp;${$t('至')}&nbsp; ${scope.row["accessEndTime"]}` : '' }}</span>
                  </span>
                  <span v-else-if="item.id===3">
                    <span v-if="!scope.row['enable']">
                      {{ scope.row[item.prop] === '1' ? $t('临时') : $t('长期') }}
                    </span>
                    <span v-if="scope.row['enable']">
                      <meg-select
                        v-model="scope.row[item.prop]">
                        <meg-option
                          :label="$t('临时')"
                          value="1">
                        </meg-option>
                        <meg-option
                          :label="$t('长期')"
                          value="0">
                        </meg-option>
                      </meg-select>
                    </span>
                  </span>
                  <span v-else-if="item.id===0">
                    {{ scope.row[item.prop] }}
                  </span>
                  <span v-else-if="item.id===5">
                    <meg-switch
                      v-if="scope.row['enable']"
                      v-model="scope.row[item.prop]"
                      active-value="1"
                      inactive-value="0">
                    </meg-switch>
                    <span v-if="!scope.row['enable']">{{ scope.row[item.prop] === '1'? $t("开启") : $t("关闭") }}</span>
                  </span>
                  <span v-else-if="item.id===6">
                    <span v-if="!scope.row['enable']">{{ scope.row['hourCtrl'] === '1' ?scope.row[item.prop]:"" }}</span>
                    <span
                      class="accessAddrLimit-hourCtrl"
                      v-if="scope.row['enable']&&scope.row['hourCtrl'] === '1'">
                      <meg-input
                        v-model="scope.row[item.prop]"
                        @blur="checkTime(scope.row[item.prop],true)"></meg-input>
                      <meg-popover
                        class="accessAddrLimit-help"
                        placement="top"
                        width="210"
                        trigger="click"
                        :content="$t('时段控制示例:1-2;8;9-10,可以输入多个时段，分号分隔，时段包括开始时间，但不包括结束时间,取值范围0-23')">
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
                    </span>
                  </span>
                  <span v-else-if="item.id===7">
                    <span v-if="!scope.row['enable']">{{ scope.row[item.prop] }}</span>
                    <span v-if="scope.row['enable']">
                      <meg-input
                        :placeholder="$t('请输入{from}-{to}位数字', { from: 1, to: accessDayLimitMax })"
                        v-model.number="scope.row[item.prop]"></meg-input></span>
                  </span>
                  <span v-else>
                    <span>{{ scope.row[item.prop] }}</span>
                  </span>
                </template>
              </meg-table-column>
            </meg-table>
          </div>
          <div class="info-area">
            <span class="title">{{ $t('数据推送') }}</span>
            <meg-table
              ref="dataPush"
              :data="pushTableData"
              stripe>
              <meg-table-column
                v-for="item in dataPushConfig"
                :key="item.id"
                :label="item.label"
                :prop="item.prop"
                :width="item.width"
                :align="item.align">
                <template slot-scope="scope">
                  <!-- column: 是否启用 -->
                  <span v-if="item.id===1">
                    <meg-switch
                      v-model="scope.row[item.prop]">
                    </meg-switch>
                  </span>
                  <!-- column: 时间段 -->
                  <span v-else-if="item.id===4">
                    <span
                      @click="dateClick(scope.row)"
                      v-if="scope.row['enable']&&scope.row['timeCtrl'] === '1'">
                      <meg-date-picker
                        type="daterange"
                        :after-date="true"
                        :range-separator="$t('至')"
                        :prefix-icon-visible="false"
                        v-model="scope.row.timeSpan"
                        default-date="today"
                        :format="'yyyy-MM-dd'"
                        @change="getDateValue"
                        :picker-options="pickerOptions">
                      </meg-date-picker>
                    </span>
                    <span v-if="!scope.row['enable']">{{ scope.row["timeCtrl"] === '1' ? `${scope.row["accessBeginTime"] }   ${scope.row["accessEndTime"]}` : '' }}</span>
                  </span>
                  <span v-else-if="item.id===3">
                    <span v-if="!scope.row['enable']">
                      {{ scope.row[item.prop] === '1' ? $t('临时') : $t('长期') }}
                    </span>

                    <span v-if="scope.row['enable']">
                      <meg-select
                        v-model="scope.row['timeCtrl']">
                        <meg-option
                          :label="$t('临时')"
                          value="1">
                        </meg-option>
                        <meg-option
                          :label="$t('长期')"
                          value="0">
                        </meg-option>
                      </meg-select>
                    </span>
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
                    <span v-if="!scope.row['enable']">{{ scope.row[item.prop] }}</span>
                    <span v-if="scope.row['enable']">
                      <meg-input
                        v-model="scope.row[item.prop]"
                        @blur="checkTopic(scope.row[item.prop],true)"></meg-input></span>
                  </span>
                </template>
              </meg-table-column>
            </meg-table>
          </div>
          <div class="column-info column-info-auth">
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
                  v-show="activeIndex === 1"
                  class="info-area">
                  <span class="title">{{ $t('设备授权') }}</span>
                     <meg-tree
                      :content-height="300"
                      ref="searchCamera"
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
                      @check-change="onsearchOnTreeChanged"
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
                  @check="handleAblumChange"
                  show-checkbox>
                  <span slot-scope="{ node, data }">
                    <span
                      v-tooltip="true"
                      class="ablum-name">
                      {{ data.albumName }}
                    </span>
                    <span class="btn-auth">
                      <meg-button
                        :key="item.delete"
                        class="authTree-btn"
                        v-show="val === 'retrieve'"
                        v-for="(item,val) in data.authButton"
                        @click="handleAblumClick(data.coreId,node, data,val,2)"
                        :class="{active : item }">
                        {{ authButton[val] }}
                      </meg-button>
                    </span>
                  </span>
                </meg-tree>
              </div>
              <div
                v-show="activeIndex === 2"
                class="info-area">
                <span class="title">{{ $t('设备授权') }}</span>
                <meg-tree
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
                  @check-change="onablumOnTreeChanged"
                  @tree-update-ready="ablumOnTreeUpdateReady"
                  :data="ablumDeviceList">
                </meg-tree>
              </div>
            </div>
          </div>
        </div>
      </meg-tab-pane>
    </meg-tabs>
    <!-- <div class="edit-bottom">
      <meg-button
        @click="save"
        :loading="loading"
        type="primary">{{ $t('common.save') }}</meg-button>
      <meg-button @click="goBack">{{ $t('common.cancel') }}</meg-button>
    </div> -->
  </div>
</template>

<script>
// import * as _ from 'insight-utils/lodash';
import _ from 'lodash';
import moment from 'moment';
import rules from '../open-api.rule';
import OpenApiSrv from '../open-api.service';

export default {
  components: {},
  data() {
    const validateNumber = (rule, value, callback) => {
      if (value < 1 || value > this.accessLimitNumberMax || !(/^\d+$/.test(value))) {
        callback(new Error(this.$t('请输入{from}-{to}位数字', {
          from: 1,
          to: this.accessLimitNumberMax
        })));
      } else {
        callback();
      }
    };
    rules.identityAuth.accessLimitNumber[1].validator = validateNumber;
    return {
      currentLocale: 'zh-CN',
      activeIndex: 2,
      timeSpan: [moment().startOf('day'), moment().add(6, 'days').endOf('day')
      ],
      pushTableData: [],
      authTableData: [],
      allAlbumList: [],
      albumList: [],
      allDeviceList: [],
      searchDeviceList: [],
      ablumDeviceList: [],
      allDeviceListActive: [],
      searchDeviceListActive: [],
      ablumDeviceListActive: [],
      albumListProps: {
        label: 'albumName',
        children: 'children'
      },
      deviceListProps: {
        label: 'orgName',
        children: 'subOrgs'
      },
      deviceListDefaultCheckedKeys: [],
      defaultProps: {
        // 功能权限树默认配置
        label: 'albumName'
      },
      callerModel: {
        remark: ''
      },
      id: 0,
      loading: false,
      title: this.$t('新建授权'),
      activeName: 'identityAuth',
      callerFormRule: rules.identityAuth,
      accessLimit: {
        accessAddrLimit: '0',
        ipList: '',
        accessLimitNumber: 1,
      },
      accessLimitNumberMax: 50,
      accessDayLimitMax: 100,
      vendorList: [],
      rowTarget: {},
      authButton: {
        create: this.$t('新建'),
        delete: this.$t('删除'),
        retrieve: this.$t('查看'),
        update: this.$t('编辑'),
      },
      dataAuthConfig: [
        {
          // 接口编号
          id: 0,
          label: this.$t('接口编号'),
          prop: 'apiNo',
          align: 'center',
          width: '90px'
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
          width: '95px'
        },

        {
          // 期限
          id: 4,
          label: this.$t('期限'),
          prop: 'accessBeginTime',
          width: '280px'
        },
        {
          // 期限
          id: 7,
          label: this.$t('每日最大调用次数'),
          prop: 'dayLimit',
        },
        // 时段控制
        {
          id: 5,
          label: this.$t('时段控制'),
          prop: 'hourCtrl'
        },
        {
          // 时段
          id: 6,
          label: this.$t('可用时段'),
          prop: 'hourPairs'
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
          width: '120px'
        },
        {
          // 期限
          id: 4,
          label: this.$t('期限'),
          prop: 'accessBeginTime',
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
      ],
      pickerOptions: {
        shortcuts: [{
          text: this.$t('近一天'),
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24);
            picker.$emit('pick', [start, end]);
          }
        },
        {
          text: this.$t('近三天'),
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 3);
            picker.$emit('pick', [start, end]);
          }
        },
        {
          text: this.$t('近一周'),
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', [start, end]);
          }
        },
        {
          text: this.$t('近一个月'),
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            picker.$emit('pick', [start, end]);
          }
        }]
      },

    };
  },
  computed: {
    labelWidth() {
      return this.currentLocale === 'zh-CN' ? '95px' : '150px';
    }
  },
  created() {
    this.init();
    this.currentLocale = this.$store.state.currentLocale;
  },
  methods: {
    checkTopic(val, showTips) {
      if (!val && showTips) this.$message.error('队列名称不能为空');
      return Boolean(val);
    },
    checkTime(val, showTips) {
      const arr = val.split(';');
      const res = arr.filter((i) => {
        const iarr = i.split('-');
        if (iarr.length !== 2) return true;
        const b = parseInt(iarr[1], 10);
        const a = parseInt(iarr[0], 10);
        if (a < 0 || a > 23 || b < 0 || b > 23 || a > b) return true;
        return false;
      });
      if (res.length && showTips) this.$message.error('时段控制示例:1-2;8;9-10,可以输入多个时段，分号分隔，时段包括开始时间，但不包括结束时间,取值范围0-23');
      return Boolean(!res.length);
    },
    onTreeUpdateReady(dataMap) {
      const defaultSelectNodes = dataMap.filter((item) => item.flag === 'DEVICE' && item.enable);
      this.$refs.allCamera.setCheckedNodes(defaultSelectNodes);
      this.allDeviceListActive = defaultSelectNodes;
    },
    // searchOnTreeUpdateReady(dataMap) {
    //   const defaultSelectNodes = dataMap.filter((item) => item.flag === 'DEVICE' && item.enable);
    //   this.$refs.searchCamera.setCheckedNodes(defaultSelectNodes);
    //   this.searchDeviceListActive = defaultSelectNodes;
    // },
    ablumOnTreeUpdateReady(dataMap) {
      const defaultSelectNodes = dataMap.filter((item) => item.flag === 'DEVICE' && item.enable);
      this.$refs.ablumCamera.setCheckedNodes(defaultSelectNodes);
      this.ablumDeviceListActive = defaultSelectNodes;
    },
    onallOnTreeChanged() {
      this.allDeviceListActive = this.$refs.allCamera.getCheckedNodes((item) => item.flag === 'DEVICE');
    },
    // onsearchOnTreeChanged() {
    //   this.searchDeviceListActive = this.$refs.searchCamera.getCheckedNodes((item) => item.flag === 'DEVICE');
    // },
    /**
     * 底库下设备选中
     */
    onablumOnTreeChanged() {
      this.ablumDeviceListActive = this.$refs.ablumCamera.getCheckedNodes((item) => item.flag === 'DEVICE');
    },
    /**
     * 初始化
     */
    async init() {
      this.getVendor();// 查询生产商列表
      if (this.$route.query.id) {
        this.id = this.$route.query.id; // 获取路由传过来的角色id
        this.title = this.$t('编辑授权');
        this.getDeviceList(this.id); // 获取设备列表
        this.getUserInfo(this.id); // 获取用户信息
        this.getLevelAuth();
        this.getMaxAccessLimit(); // 获取最大流量限制
        this.getMaxAccessDayLimit(); // 获取单日最大访问次数
        this.getDataPush(this.id);
        this.getAuthList(this.id);
        this.getAlbumList(this.id);
      } else {
        this.baseUserInfo();
      }
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
      this.authTableData = result.data ? result.data.map((item) => ({
        ...item,
        timeSpan: [item.accessBeginTime, item.accessEndTime]
      })) : [];
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
      }
      this.pushTableData = result.data ? result.data.map((item) => ({
        ...item,
        timeSpan: [item.accessBeginTime, item.accessEndTime]
      })) : [];
    },
    /**
     * 修改有效时间
     */
    getDateValue(d) {
      console.log(d);
      this.rowTarget.accessBeginTime = moment(d[0]).format('YYYY-MM-DD');
      this.rowTarget.accessEndTime = moment(d[1]).format('YYYY-MM-DD');
    },
    dateClick(row) {
      this.rowTarget = row;
      console.log(this.authTableData);
    },
    /**
     * 返回授权列表界面
     */
    goBack() {
      this.$router.push({
        name: 'open-api'
      });
    },
    /**
     * 创建用户模板
     */
    async baseUserInfo() {
      const res = await OpenApiSrv.baseUserInfo();
      this.callerModel = {
        userName: res.data.userName, // 调用方编号
        userToken: res.data.userToken, // 调用方编号
        vendorName: '', // 调用方名称
        remark: '', // 描述
        timeCtrl: '0',
        beginTime: moment().startOf('day').format('YYYY-MM-DD'),
        endTime: moment().add(6, 'days')
          .endOf('day').format('YYYY-MM-DD'),

      };
    },

    /**
     * 获取最大访问量
     */
    async getMaxAccessLimit() {
      const result = await OpenApiSrv.itemvalue({ item: 'ACCESS_SEC_LIMIT' });
      if (result.code !== 0) {
        this.accessLimitNumberMax = 50;
        return;
      }
      this.accessLimitNumberMax = result.data - 0;
    },
    /**
     * 获取每秒最大访问次数
     */
    async getMaxAccessDayLimit() {
      const result = await OpenApiSrv.itemvalue({ item: 'ACCESS_DAY_LIMIT' });
      if (result.code !== 0) {
        this.accessDayLimitMax = 100;
        return;
      }
      this.accessDayLimitMax = result.data - 0;
    },
    /**
     * 获取用户信息
     */
    async getUserInfo(id) {
      const res = await OpenApiSrv.getUserInfo({ id });
      console.log(res);
      this.callerModel = {
        userName: res.data.userName, // 调用方编号
        userToken: res.data.userToken, // 调用方编号
        vendorName: res.data.vendorName, // 调用方名称
        remark: res.data.remark, // 描述
        timeCtrl: res.data.timeCtrl,
        beginTime: res.data.beginTime,
        endTime: res.data.endTime,
      };
      if (res.data.beginTime && res.data.endTime) this.timeSpan = [moment(res.data.beginTime), moment(res.data.endTime)];
    },
    /**
    * 获取用户级别授权（ip、流量）
    * @param(Number) id 当前授权用户id
    */
    async getLevelAuth() {
      const result = await OpenApiSrv.levelAuth({ id: this.id });
      if (result.code !== 0) {
        this.$message({
          type: 'error',
          message: result.msg
        });
      }
      this.accessLimit.accessAddrLimit = result.data.ipCtrl;
      this.accessLimit.ipList = result.data.ipList;
      this.accessLimit.accessLimitNumber = result.data.secLimit;
      this.ipCtrlDisabled();
    },
    /**
     * 禁用访问限制执行
     */
    ipCtrlDisabled() {
      const params = {
        ...this.accessLimit
      };
      if (this.accessLimit.accessAddrLimit === '0') {
        this.callerFormRule.ipList[0].required = false;
      } else {
        this.callerFormRule.ipList[0].required = true;
      }
      this.$refs.accessLimitForm.resetFields(); // 清除表单的校验信息
      this.accessLimit = params; // 清空表单会导致还原默认值，所以需要重新赋值
    },
    /**
     * 更新接口权限
     */
    async updateGrant() {
      const arr = [];
      _.forEach(this.authTableData, (item) => { // 只传开启权限的接口
        if (item.enable) { // 开启状态
          arr.push(item);
        }
      });

      const param = {
        records: arr,
        userName: this.id,
      };
      const res = await OpenApiSrv.updateGrant(param);
      if (res.code !== 0) {
        this.$message.error(res.msg);
      }
    },
    /**
     * 更新数据接口权限
     */
    async updatePush() {
      const arr = [];
      _.forEach(this.pushTableData, (item) => { // 只传开启权限的接口
        if (item.enable) {
          if (item.queueType === '1') {
            item.resourceAuthAoList = [
              {
                'bizType': 1,
                'resourceType': '1',
                'resItemList': _.map(this.searchDeviceListActive, (items) => ({ id: items.id }))
              }
            ];
          }
          if (item.queueType === '2') {
            item.resourceAuthAoList = [
              {
                'bizType': 2,
                'resourceType': '2',
                'resItemList': this.$refs.albumList.getCheckedNodes().concat(this.$refs.albumList.getHalfCheckedNodes())
              },
              {
                'bizType': 2,
                'resourceType': '1',
                'resItemList': _.map(this.ablumDeviceListActive, (items) => ({ id: items.id }))
              }
            ];
          }
          arr.push(item);
        }
      });
      const param = {
        records: arr,
        userName: this.id
      };
      const res = await OpenApiSrv.updatePush(param);
      if (res.code !== 0) {
        this.$message.error(res.msg);
      }
    },

    /**
     * 更新用户信息
     */
    async updateUserInfo() {
      const res = await OpenApiSrv.updateUser(this.callerModel);
      if (res.code === 0) {
        this.goBack();
      } else {
        this.$message.error(res.msg);
      }
    },
    async setUserAuth() {
      const param = {
        ipCtrl: this.accessLimit.accessAddrLimit,
        ipList: this.accessLimit.ipList,
        secLimit: this.accessLimit.accessLimitNumber,
        userName: this.id,
        noFilterEmpty: true
      };
      const res = await OpenApiSrv.setOpenapi(param);
      if (res.code !== 0) {
        this.$message.error(res.msg);
      }
    },
    /**
     * 创建用户模板
     */
    async createUser(param) {
      const params = { ...param };
      const res = await OpenApiSrv.addUser(params);
      if (res.code === 0) {
        this.$router.push({
          name: 'open-api'
        });
      } else {
        this.$message.error(res.msg);
      }
      console.log(res);
    },
    /**
     * 更新底库权限
     */
    async updateAbulmAuth(activeIndex) {
      const params = {
        bizType: activeIndex,
        resourceType: '2',
        resItemList: []
      };
      if (activeIndex === 0) {
        params.resItemList = this.$refs.allAlbum.getCheckedNodes().concat(this.$refs.allAlbum.getHalfCheckedNodes());
      } else if (activeIndex === 2) {
        params.resItemList = this.$refs.albumList.getCheckedNodes().concat(this.$refs.albumList.getHalfCheckedNodes());
      }
      const res = await OpenApiSrv.updateAuth({ id: this.id, params: { ...params } });
      if (res.code !== 0) {
        this.$message.error(res.msg);
      }
    },
    /**
    * 更新设备权限
    */
    async updateCameraAuth(activeIndex) {
      const params = {
        bizType: activeIndex,
        resourceType: '1',
        resItemList: []
      };
      if (activeIndex === 0) { // 接口
        params.resItemList = _.map(this.allDeviceListActive, (item) => item);
      } else if (activeIndex === 2) { // 报警
        params.resItemList = _.map(this.ablumDeviceListActive, (item) => item);
      } else { // 抓拍
        params.resItemList = _.map(this.searchDeviceListActive, (item) => item);
      }
      const res = await OpenApiSrv.updateAuth({ id: this.id, params });
      if (res.code !== 0) {
        this.$message.error(res.msg);
      }
    },
    setTimeCtrl(d) {
      this.callerModel.beginTime = moment(d[0]).format('YYYY-MM-DD');
      this.callerModel.endTime = moment(d[1]).format('YYYY-MM-DD');
    },
    /**
     * 更新秘钥
     */
    async updateUserToken() {
      const res = await OpenApiSrv.getUserToken();
      this.callerModel.userToken = res.data; // 调用方编号
    },
    /**
     * 保存授权
     */
    async saveAuth() {
      const missTopic = this.pushTableData.filter((i) => i.enable && !this.checkTopic(i.queueName)).length;
      if (missTopic) {
        this.$message.error('队列名称不能为空');
        return;
      }
      const illegalTime = this.authTableData.filter((i) => i.hourCtrl === '1' && !this.checkTime(i.hourPairs)).length;
      if (illegalTime) {
        this.$message.error('时段控制示例:1-2;8;9-10,可以输入多个时段，分号分隔，时段包括开始时间，但不包括结束时间,取值范围0-23');
        return;
      }
      this.$refs.callerForm.validate(async (valid) => {
        if (valid && !this.id) {
          this.createUser(this.callerModel);
        }
        if (this.id) {
          this.$refs.accessLimitForm.validate(async (valids) => {
            if (valids) {
              const limit = [];
              _.forEach(this.authTableData, (item) => { // 只传开启权限的接口
                if (item.enable) { // 开启状态
                  if (item.dayLimit > this.accessDayLimitMax || !item.dayLimit || item.dayLimit <= 0 || !(/^\d+$/.test(item.dayLimit))) {
                    limit.push(item.apiNo);
                  }
                }
              });
              if (limit.length) {
                this.$message.error(`${this.$t('编号')}${limit.join(',')}${this.$t('每日访问限制输入不合法')}`);
                return;
              }
              await this.updateGrant();
              await this.setUserAuth();
              await this.updatePush();
              await this.updateUserInfo(); // 更新用户信息
            }
          });
        }
      });
    },
    /**
     * 获取部门
     */
    async getVendor(id) {
      const result = await OpenApiSrv.getVendor({ id });
      if (result.code !== 0) {
        this.$message({
          type: 'error',
          message: result.msg
        });
      }
      this.vendorList = result.data || [];
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
     * 选中底库
     */
    handleAblumChange(data, node) {
      console.log(data, node);
      const isSelect = node.checkedKeys.indexOf(data.id) !== -1;
      _.forEach(data.authButton, (val, key) => {
        if (data.deployAlbumType !== '2' || key === 'retrieve') {
          data.authButton[key] = isSelect;
        }
      });
    },
    /**
     * 选中按钮权限
     */
    handleAblumClick(id, node, data, key, type) {
      node.indeterminate = false;
      node.checked = false;
      data.authButton[key] = !data.authButton[key];
      const isAll = _.map(data.authButton, (item) => item).indexOf(false) === -1;
      if (isAll || (type === 2 && data.authButton[key])) {
        node.checked = true;
      } else if (_.map(data.authButton, (item) => item).indexOf(true) !== -1) {
        node.indeterminate = true;
      }
      // this.setChecked(node, data);
    },
    /**
     * 根据当前功能权限，做深层选中状态判断
     */
    // setChecked() {
    // const slibingsId = _.map(this.authBtnList[data.id].authorizeType, map => map.id); // 当前功能权限拥有的按钮list
    // const slibingsList = _.intersection(slibingsId, this.authBtnList); // 当前选中的功能，选中的按钮id
    // if (slibingsId.length && slibingsList.length !== slibingsId.length) {
    //   // 当按钮权限不为零，又没全选
    //   this.upParentAuthTree(data.id, false, node);
    //   node.indeterminate = true;
    // } else if (slibingsList.length) {
    //   this.upParentAuthTree(node.data.id, true, node);
    // }
    // },
    /**
     * 获取接口底库列表
     */
    async getAlbumList(id) {
      // // 接口
      // const res = await OpenApiSrv.albumList({ id, bizType: '0' });
      // this.allAlbumList = res.data;
      // const allDefaultSelectIds = _.pickBy(this.allAlbumList, (item) => item.enable);
      // this.$nextTick(() => {
      //   this.$refs.allAlbum.setCheckedKeys(_.map(allDefaultSelectIds, (item) => item.id));
      // });

      // 告警
      const rep = await OpenApiSrv.albumList({ id, bizType: '2' });
      this.albumList = rep.data;
      const defaultSelect = _.pickBy(this.albumList, (item) => item.enable);
      this.$nextTick(() => {
        this.$refs.albumList.setCheckedKeys(_.map(defaultSelect, (item) => item.id));
      });
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/scss/index.scss";

.edit-container {
  .column-info-list {
    margin: 0 20px;
    &::v-deep input {
      width: 300px;
    }
  }
  height: 100%;
  @include flex-vertical;
  .counter {
    width: 300px;
    color: #c0c4cc;
    font-size: 12px;
    display: flex;
    justify-content: flex-end;
    margin-bottom: 5px;
  }
  .nav {
    padding: 0 20px 0 26px;
    background: #dce1e5;
    height: 56px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .content {
    padding: 0 20px 0 26px;
    flex: 1;
  }
  .edit-bottom {
    height: 50px;
    box-shadow: 0 0 16px #d4d4d4;
    display: flex;
    flex-shrink: 0;
    justify-content: center;
    align-items: center;
  }
  .updatePwd {
    margin-left: 10px;
  }
  .meg-form {
    .meg-input,
    .meg-textarea {
      width: 300px;
    }
    .meg-button {
      font-size: 12px;
    }
  }
  .title {
    font-weight: bold;
    color: #435068;
    font-size: 14px;
    margin-bottom: 10px;
  }
  .info-area {
    @include flex-vertical;

    margin: 15px 0 20px 0;
    .meg-radio {
      line-height: 34px;
    }
  }
  .column-info-auth {
    flex-direction: column;
  }
  .column-info {
    display: flex;
    > div {
      flex: 1;
    }
    .meg-input {
      width: 300px;
    }

    .accessLimit {
      line-height: 34px;
    }
    .column-info-list {
      display: flex;
      height: 400px;
      flex: auto;
      .info-area {
        width: 50%;
      }
    }
  }
  .meg-form {
    .meg-select {
      width: 300px;
    }
  }

  .info-area-accessLimit {
    padding-left: 10px;
  }
  .accessLimit {
    display: flex;
    > span {
      width: 60px;
      line-height: 34px;
    }
    > .meg-select {
      width: 300px;
    }
  }
  .show-border {
    border-bottom: 1px solid #d4d4d4;
    .meg-form-item {
      display: inline-block;
    }
  }
  .accessAddrLimit-input {
    margin-left: 5px;
  }
  .interfaceAuth {
    height: 100%;
    overflow-y: auto;
  }
  .help-icon {
    cursor: pointer;
    margin-left: 8px;
  }
}
</style>
<style lang="scss">
.edit-container {
  .authTree-btn {
    display: inline-block;
    padding: 7px 12px !important;
    font-size: 12px;
    border: 1px solid #2e539b;
    color: #2e539b;
    margin-left: 20px;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    &.active {
      color: #ffffff;
      background: #2e539b;
    }
  }
  .accessAddrLimit-hourCtrl {
    .meg-input {
      width: calc(100% - 40px);
    }
  }
  .ablum-name {
    float: left;
    width: 126px;
    line-height: 34px;
  }
  .btn-auth {
    float: right;
  }
  .meg-tabs {
    height: calc(100% - 106px);
  }
  .meg-tabs__content {
    height: calc(100% - 96px);
  }
  .meg-tab-pane {
    height: 100%;
  }
  .meg-tabs__nav {
    height: 56px;
    line-height: 56px;
  }
  .meg-tree__empty-text {
    color: #909399;
    font-size: 12px;
  }
  .ablum-list {
    .meg-tree-node__content {
      height: 34px;
    }
  }
  .meg-radio-group .accessAddrLimit-help {
    position: relative;
    top: -4px;
  }
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none !important;
    margin: 0;
  }
}
</style>
<style lang="scss" scoped>
.i18n-en-US {
  .edit-container {
    ::v-deep .meg-date-editor .meg-range-separator {
      width: 13%;
    }
  }
}
</style>
