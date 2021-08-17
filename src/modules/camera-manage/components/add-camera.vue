<template>
  <meg-dialog
    append-to-body
    :show-close="false"
    width="1440px"
    class="add-camera"
    :visible="visible"
    @close="closeDialog">
    <div
      class="title"
      slot="title">
      <h2 class="title-word">
        {{ isAddCamera?'手动添加':'编辑相机' }}
      </h2>
      <div class="title-button-group">
        <meg-button
          type="primary"
          @click="confirm">
          保存
        </meg-button>
        <meg-button @click="closeDialog">
          取消
        </meg-button>
      </div>
    </div>
    <ul class="add-camera-menu">
      <li
        class="menu"
        :class="{'active':activeIndex===0,'warning':warning===0}"
        @click="scrollTo(0)">
        基本参数
      </li>
      <li
        class="menu"
        :class="{'active':activeIndex===1,'warning':warning===1}"
        @click="scrollTo(1)">
        业务参数
      </li>
      <li
        class="menu"
        :class="{'active':activeIndex===2,'warning':warning===2}"
        @click="scrollTo(2)">
        其他参数
      </li>
    </ul>
    <div
      class="add-camera-content"
      @scroll="onScroll">
      <div class="form-container">
        <meg-form
          ref="form"
          label-position="right"
          label-width="110px"
          :model="formData"
          :rules="cameraRule">
          <div class="base-params bottom-line">
            <div class="menu-title">
              基本参数
            </div>
            <div class="form-content">
              <div class="form-left-content">
                <meg-form-item
                  class="force-width"
                  :label="$t('相机名称')"
                  :prop="cameraEditAuth.name?'name':''">
                  <meg-input
                    v-model="formData.name"
                    :disabled="!cameraEditAuth.name"
                    placeholder="请输入相机名称"></meg-input>
                </meg-form-item>
                <meg-form-item
                  class="force-width"
                  :label="$t('相机类型')"
                  prop="type">
                  <meg-select
                    scrolling-closable
                    v-model="formData.type"
                    :disabled="(!cameraEditAuth.type)||isGaproxy"
                    @change="cameraTypeChange">
                    <meg-option
                      v-for="item in filterCameraType"
                      :key="item.code"
                      :label="item.value"
                      :value="item.code">
                    </meg-option>
                  </meg-select>
                </meg-form-item>
                <meg-form-item
                  class="force-width"
                  v-if="formData.type !== '3' && formData.type !== '4'"
                  :label="$t('相机协议')"
                  prop="manufacturer">
                  <meg-select
                    v-model="formData.manufacturer"
                    scrolling-closable
                    :disabled="isGaproxy||(!cameraEditAuth.manufacturer)"
                    :placeholder="$t('相机协议')">
                    <meg-option
                      v-for="item in realManufactureOption"
                      :key="item.code"
                      :label="item.value"
                      :value="item.code">
                    </meg-option>
                  </meg-select>
                </meg-form-item>
                <meg-form-item
                  class="force-width"
                  :label="$t('卡口类型')"
                  prop="monitoringType">
                  <meg-select
                    scrolling-closable
                    :disabled="(!cameraEditAuth.monitoringType)||isGaproxy"
                    v-model="formData.monitoringType">
                    <meg-option
                      v-for="item in monitoringTypeOption"
                      :key="item.code"
                      :label="item.value"
                      :value="item.code">
                    </meg-option>
                  </meg-select>
                </meg-form-item>
                <meg-form-item
                  v-if="formData.type === '12'"
                  class="force-width"
                  :label="$t('关联智能盒')"
                  :prop="(isGaproxy||(!cameraEditAuth.boxId))?'':'boxId'">
                  <meg-treeselect
                    ref="boxTree"
                    node-key="id"
                    single-check
                    show-dept-icon
                    highlight-current
                    default-expand-all
                    standard-tree-data
                    :show-count="false"
                    :data="boxTreeData"
                    :disabled="isGaproxy||(!cameraEditAuth.boxId)"
                    :props="defaultTreeProps"
                    :placeholder-text="$t('请选择相机关联的智能盒')"
                    @tree-update-ready="boxTreeReady"
                    @single-check-change="boxTreeCheckChange">
                  </meg-treeselect>
                </meg-form-item>
                <meg-row v-if="formData.type!=='3'&&formData.type!=='4'&&formData.type!=='15'">
                  <meg-col :span="18">
                    <meg-form-item
                      :label="formData.type === '12' && formData.manufacturer === '1' ? $t('盒子IP') : 'IP'"
                      prop="ipAddr">
                      <meg-input
                        v-model.trim="formData.ipAddr"
                        :disabled="isGaproxy||(!cameraEditAuth.ipAddr)"
                        :placeholder="$t('IP或主动模式字符串')"></meg-input>
                    </meg-form-item>
                  </meg-col>
                  <meg-col :span="5">
                    <meg-form-item
                      label-width="10px"
                      prop="active">
                      <meg-checkbox
                        v-model="active"
                        :disabled="isGaproxy||(!cameraEditAuth.active)">
                        {{ $t("主动模式") }}
                      </meg-checkbox>
                    </meg-form-item>
                  </meg-col>
                </meg-row>
                <meg-row v-if="formData.type!=='3'&&formData.type!=='4'&&formData.type!=='15'">
                  <meg-col :span="12">
                    <meg-form-item
                      :label="$t('用户名')"
                      prop="username">
                      <meg-input
                        v-model.trim="formData.username"
                        :disabled="isGaproxy||(!cameraEditAuth.username)"></meg-input>
                    </meg-form-item>
                  </meg-col>
                  <meg-col :span="12">
                    <meg-form-item
                      :label="$t('密码')"
                      prop="password">
                      <meg-input
                        v-model.trim="formData.password"
                        :disabled="isGaproxy||(!cameraEditAuth.password)"
                        type="password"></meg-input>
                    </meg-form-item>
                  </meg-col>
                </meg-row>
                <meg-row v-if="formData.type!=='3'&&formData.type!=='4'&&formData.type!=='15'">
                  <meg-col :span="12">
                    <meg-form-item
                      :label="$t('信令端口')"
                      prop="cmdPort">
                      <meg-input
                        v-model.trim="formData.cmdPort"
                        :disabled="isGaproxy||(!cameraEditAuth.cmdPort)"></meg-input>
                    </meg-form-item>
                  </meg-col>
                  <meg-col :span="12">
                    <meg-form-item
                      :label="$t('视频流端口')"
                      prop="videoPort">
                      <meg-input
                        v-model.trim="formData.videoPort"
                        :disabled="isGaproxy||(!cameraEditAuth.videoPort)"></meg-input>
                    </meg-form-item>
                  </meg-col>
                </meg-row>
              </div>
              <div class="form-right-content">
                <meg-form-item
                  class="force-width"
                  :label="$t('流地址')"
                  v-if="isShowUrl || formData.type === '15'"
                  prop="rainbowUrl">
                  <span slot="label">
                    {{ formData.type === "12" && formData.manufacturer === "1"? $t("前端设备流地址"): $t("流地址") }}
                    <meg-popover
                      placement="bottom-start"
                      width="472"
                      :title="$t('流地址示例')"
                      popper-class="camera-popper">
                      <p>{{ $t("按标准的URL格式，如下：") }}</p>
                      <p>
                        rtsp://&lt;username&gt;:&lt;password&gt;@&lt;IP/SN&gt;:{videoPort}[/otherRtspSuffix]
                      </p>
                      <p>{{ $t("示例：") }}</p>
                      <p>
                        {{ $t("1、海康视频流相机：") }}<br />
                        rtsp://admin:123456@10.169.15.166:554/h264/ch1/main/av_stream
                      </p>
                      <p>
                        {{ $t("2、旷视抓拍机/云端协同相机：") }}<br />
                        rtsp://admin:123456@10.169.15.89:554
                      </p>
                      <p>
                        {{ $t("3、旷视抓拍机（主动模式）:") }}<br />
                        rtsp://admin:123456@SN12345678:554
                      </p>
                      <p>
                        {{ $t("4、文件模拟流:") }}<br />
                        rtsp://10.102.15.201:8554/test.264
                      </p>
                      <p>
                        {{ $t("5、kafka相机:") }}<br />
                        kafka2://10.199.2.83:23310/device1 // {{ $t("推荐")
                        }}<br />
                        kafka2://10.199.2.83:23310/device1?broker_list=10.199.2.83:23310,10.199.0.249:23310
                      </p>
                      <span
                        class="help-icon"
                        slot="reference">
                        <meg-icon
                          name="help_prompt"
                          width="12"
                          height="12"
                          color="#21539b"></meg-icon>
                      </span>
                    </meg-popover>
                  </span>
                  <meg-input
                    class="textarea"
                    resize="none"
                    type="textarea"
                    v-model.trim="formData.rainbowUrl"
                    :disabled="isGaproxy||(!cameraEditAuth.rainbowUrl)"
                    :placeholder="$t('请输入有效的流地址')"></meg-input>
                </meg-form-item>
                <meg-form-item
                  :label="$t('是否云台')"
                  prop="ptz">
                  <meg-switch
                    active-color="#21539B"
                    :disabled="isGaproxy||(!cameraEditAuth.ptz)"
                    v-model="ptz">
                  </meg-switch>
                </meg-form-item>
                <meg-form-item
                  class="force-width"
                  :label="$t('应用管理部门')"
                  :prop="'managementId'">
                  <meg-treeselect
                    ref="deptTree"
                    node-key="id"
                    single-check
                    highlight-current
                    standard-tree-data
                    default-expand-all
                    :show-count="false"
                    :data="orgTreeData"
                    :props="deptTreeProps"
                    :disabled="!cameraEditAuth.managementId"
                    @tree-update-ready="deptTreeReady"
                    @single-check-change="deptCheckChange">
                    <div
                      style="width: 100%"
                      v-tooltip="true"
                      slot-scope="{ data }">
                      {{ data.orgName }}
                    </div>
                  </meg-treeselect>
                </meg-form-item>
                <meg-form-item
                  v-if="formData.type === '12'"
                  :prop="(isGaproxy||(!cameraEditAuth.chanelNum))?'':'chanelNum'"
                  :label="$t('通道号')">
                  <meg-select
                    scrolling-closable
                    :disabled="isGaproxy||(!cameraEditAuth.chanelNum)"
                    v-model="formData.chanelNum">
                    <meg-option
                      v-for="item in getChannelName(boxDetail.channelSize)"
                      :key="item"
                      :value="item"
                      :label="`${$t('通道')}${item}`"></meg-option>
                  </meg-select>
                </meg-form-item>
                <meg-form-item
                  v-else
                  prop="channelNo"
                  :label="$t('相机通道号')">
                  <meg-select
                    scrolling-closable
                    :disabled="isGaproxy||(!cameraEditAuth.channelNo)"
                    v-model="formData.channelNo">
                    <meg-option
                      v-for="item in getChannelName('16')"
                      :key="item"
                      :value="item"
                      :label="`${$t('通道')}${item}`"></meg-option>
                  </meg-select>
                </meg-form-item>
                <meg-form-item
                  class="force-width"
                  :label="$t('设备标签')">
                  <meg-treeselect
                    ref="labelTree"
                    show-checkbox
                    check-strictly
                    show-all-checked
                    standard-tree-data
                    check-on-click-node
                    record-dynamic-select
                    :data="labelList"
                    :show-count="false"
                    :disabled="isGaproxy||(!cameraEditAuth.labels)"
                    :expand-on-click-node="false"
                    :all-selected-text="$t('全部标签')"
                    :placeholder-text="$t('请选择标签')"
                    :props="defaultTreeProps"
                    @tree-update-ready="labelTreeReady">
                    <template v-slot:selected="{ items }">
                      <div>
                        <meg-tag
                          v-tooltip="true"
                          v-for="(item, index) in handleSelectLabel(items)"
                          :key="index"
                          :closable="true"
                          @click.native.stop
                          @close="deleteSelect(item)">
                          {{ item.normalName }}
                        </meg-tag>
                      </div>
                    </template>
                  </meg-treeselect>
                </meg-form-item>
                <meg-form-item
                  class="force-width"
                  :label="$t('相机编号')"
                  prop="numeration">
                  <meg-input
                    v-model.trim="formData.numeration"
                    :disabled="isGaproxy||(!cameraEditAuth.numeration)"
                    :placeholder=" $t('请输入{from}-{to}个字符', { from: 2, to: 50 }) "></meg-input>
                </meg-form-item>
                <meg-form-item
                  class="force-width"
                  :label="$t('相机位置')"
                  prop="location">
                  <meg-input
                    v-model.trim="formData.location"
                    :disabled="isGaproxy||(!cameraEditAuth.location)"
                    :placeholder="$t('请输入相机位置')"></meg-input>
                </meg-form-item>
              </div>
            </div>
          </div>
          <div class="pro-params bottom-line">
            <div class="menu-title">
              业务参数
            </div>
            <div class="form-content">
              <div class="form-left-content">
                <meg-form-item
                  class="force-width"
                  :label="$t('存储方案')"
                  prop="storageScheme">
                  <meg-select
                    v-model="formData.storageScheme"
                    :disabled="!cameraEditAuth.storageScheme"
                    :placeholder="$t('请选择')">
                    <meg-option
                      v-for="item in storageSchemeOption"
                      :key="item.key"
                      :label="item.label"
                      :value="item.key"></meg-option>
                  </meg-select>
                </meg-form-item>
                <meg-form-item
                  class="force-width"
                  v-if="cameraType === 'faceCamera' && formData.type !== '12'"
                  :label="$t('状态刷新')"
                  prop="statusSyncInterval">
                  <meg-select
                    class="meg-select"
                    :disabled="!cameraEditAuth.statusSyncInterval"
                    v-model="formData.statusSyncInterval"
                    :placeholder="$t('请选择')">
                    <meg-option
                      v-for="item in statusSyncIntervalData"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"></meg-option>
                  </meg-select>
                </meg-form-item>
                <meg-form-item
                  :label="$t('低质量')"
                  prop="lowQuality">
                  <meg-switch
                    active-color="#21539B"
                    :disabled="!cameraEditAuth.lowQuality"
                    v-model="formData.lowQuality">
                  </meg-switch>
                </meg-form-item>
                <meg-form-item
                  class="force-width"
                  v-if="cameraType === 'faceCamera'"
                  :label="$t('人脸框模式')"
                  prop="fullRectModel">
                  <meg-select
                    v-model="formData.fullRectModel"
                    :disabled="!cameraEditAuth.fullRectModel"
                    :placeholder="$t('请选择')">
                    <meg-option
                      v-for="item in faceFrameModeOption"
                      :key="item.code"
                      :label="item.value"
                      :value="item.code"></meg-option>
                  </meg-select>
                </meg-form-item>
                <meg-form-item
                  :label="$t('相机权限')"
                  prop="shareModel">
                  <meg-radio-group
                    v-model="formData.shareModel"
                    :disabled="!cameraEditAuth.shareModel">
                    <meg-radio
                      v-for="shareModel in cameraShareModel"
                      :label="shareModel.code"
                      :key="shareModel.code">
                      {{ shareModel.value }}
                    </meg-radio>
                  </meg-radio-group>
                </meg-form-item>
                <meg-form-item
                  class="force-width"
                  v-if="formData.shareModel !== '0'"
                  :label="$t('共享人员')"
                  prop="shareList">
                  <meg-treeselect
                    ref="userTree"
                    node-key="id"
                    show-checkbox
                    check-strictly
                    show-all-checked
                    standard-tree-data
                    check-on-click-node
                    :show-count="false"
                    :data="userTreeData"
                    :props="deptTreeProps"
                    :expand-on-click-node="false"
                    :disabled="!cameraEditAuth.shareList"
                    :placeholder-text="$t('点击选择部门或人员')"
                    @tree-update-ready="userTreeReady">
                    <template slot-scope="{ data }">
                      <div
                        class="label-item"
                        v-tooltip="true">
                        {{ data.orgName }}
                      </div>
                    </template>
                  </meg-treeselect>
                </meg-form-item>
                <meg-form-item
                  class="force-width"
                  :label="$t('归属区域')"
                  prop="placeIds">
                  <meg-treeselect
                    ref="placeTree"
                    show-checkbox
                    standard-tree-data
                    check-on-click-node
                    :data="placeList"
                    :show-count="false"
                    :props="defaultTreeProps"
                    :expand-on-click-node="false"
                    :disabled="!cameraEditAuth.placeIds"
                    :placeholder-text="$t('请选择归属区域')"
                    @tree-update-ready="placeTreeReady">
                    <div
                      style="width: 100%"
                      v-tooltip="true"
                      slot-scope="{ data }">
                      {{ data.name }}
                    </div>
                  </meg-treeselect>
                </meg-form-item>
                <meg-form-item
                  class="force-width"
                  :label="$t('重点单位')"
                  prop="unitIds">
                  <meg-treeselect
                    ref="unitTree"
                    show-checkbox
                    standard-tree-data
                    check-on-click-node
                    :data="keyUnitList"
                    :show-count="false"
                    :props="defaultTreeProps"
                    :expand-on-click-node="false"
                    :disabled="!cameraEditAuth.unitIds"
                    :placeholder-text="$t('请选择重点单位')"
                    @tree-update-ready="unitTreeReady">
                    <div
                      style="width: 100%"
                      v-tooltip="true"
                      slot-scope="{ data }">
                      {{ data.name || data.orgName }}
                    </div>
                  </meg-treeselect>
                </meg-form-item>
              </div>
              <div class="form-right-content">
                <meg-form-item
                  v-if="$store.getters.systemByType('alarmShortVideo').value !== '0'"
                  prop="alarmShortVideo"
                  :label="$t('报警短视频')">
                  <meg-switch
                    active-color="#21539B"
                    :disabled="!cameraEditAuth.alarmShortVideo"
                    v-model="formData.alarmShortVideo">
                  </meg-switch>
                </meg-form-item>
                <meg-form-item
                  class="force-width"
                  :label="$t('小视频存储类型')">
                  <meg-select
                    scrolling-closable
                    v-model="formData.recordType"
                    :disabled="recordTypeDisabled"
                    @change="onRecordTypeChange">
                    <meg-option
                      v-for="item in recordTypeOption"
                      :key="item.code"
                      :label="item.value"
                      :value="item.code">
                    </meg-option>
                  </meg-select>
                </meg-form-item>
                <meg-form-item
                  class="force-width"
                  :label="$t('小视频时间(秒)')"
                  v-if="formData.recordType !== 3"
                  prop="period">
                  <meg-input
                    v-model.trim="formData.period"
                    :disabled="periodDisabled"></meg-input>
                </meg-form-item>
                <meg-form-item
                  class="force-width"
                  :label="$t('所属分组')"
                  prop="tagIds">
                  <meg-treeselect
                    ref="searchGroupTree"
                    show-checkbox
                    standard-tree-data
                    check-on-click-node
                    :data="groupTreeData"
                    :show-count="false"
                    :props="defaultTreeProps"
                    :expand-on-click-node="false"
                    :disabled="!cameraEditAuth.tagIds"
                    :placeholder-text="$t('请选择分组')"
                    @tree-update-ready="searchGroupTreeReady">
                    <div
                      style="width: 100%"
                      v-tooltip="true"
                      slot-scope="{ data }">
                      {{ data.name }}
                    </div>
                  </meg-treeselect>
                </meg-form-item>
                <meg-form-item
                  class="force-width"
                  v-if="formData.type !== '3'"
                  :label="$t('国标平台ID')"
                  prop="gbPlatformId">
                  <meg-input
                    :disabled="(formData.type === '4')||(!cameraEditAuth.gbPlatformId)"
                    v-model.trim="formData.gbPlatformId"
                    :placeholder="$t('请输入{entity}个字符', { entity: 20 })"></meg-input>
                </meg-form-item>
                <meg-form-item
                  class="force-width"
                  v-if="formData.type !== '3'"
                  :label="$t('国标平台设备ID')"
                  prop="gbPlatformDeviceId">
                  <meg-input
                    :disabled="(formData.type === '4')||(!cameraEditAuth.gbPlatformDeviceId)"
                    v-model.trim="formData.gbPlatformDeviceId"
                    :placeholder="$t('请输入{entity}个字符', { entity: 20 })"></meg-input>
                </meg-form-item>
                <meg-form-item
                  class="force-width"
                  v-if="formData.type === '3'"
                  :label="$t('视图库平台ID')"
                  prop="gbPlatformId">
                  <meg-input
                    disabled
                    v-model.trim="formData.gaPlatformId"
                    :placeholder="$t('请输入{entity}个字符', { entity: 20 })"></meg-input>
                </meg-form-item>
                <meg-form-item
                  class="force-width"
                  v-if="formData.type === '3'"
                  :label="$t('视图库平台设备ID')"
                  prop="gbPlatformDeviceId">
                  <meg-input
                    disabled
                    v-model.trim="formData.gaPlatformDeviceId"
                    :placeholder="$t('请输入{entity}个字符', { entity: 20 })"></meg-input>
                </meg-form-item>
              </div>
            </div>
          </div>
          <div class="other-params bottom-line">
            <div class="menu-title">
              其他参数
            </div>
            <div class="form-content">
              <div class="form-left-content">
                <meg-form-item
                  class="force-width"
                  :label="$t('相机SN码')"
                  prop="sncode">
                  <meg-input
                    v-model.trim="formData.sncode"
                    :disabled="isGaproxy||(!cameraEditAuth.sncode)"
                    :placeholder="$t('请输入{from}-{to}个字符',{ from:2, to:50 })"></meg-input>
                </meg-form-item>
                <meg-form-item
                  class="force-width"
                  prop="remark"
                  :label="$t('备注')">
                  <meg-input
                    type="textarea"
                    resize="none"
                    rows="3"
                    :disabled="!cameraEditAuth.remark"
                    v-model.trim="formData.remark"></meg-input>
                </meg-form-item>
              </div>
              <div class="form-right-content">
                <meg-form-item
                  prop="pulled"
                  :label="$t('激活状态')">
                  <meg-switch
                    active-color="#21539B"
                    :disabled="!cameraEditAuth.pulled"
                    v-model="formData.pulled">
                  </meg-switch>
                </meg-form-item>
              </div>
            </div>
          </div>
        </meg-form>
      </div>
    </div>
    <div class="add-camera-map">
      <div class="map-area">
        <position-modify-map
          :control-visible="cameraEditAuth.lat"
          @location-change="locationChange"
          @clear-location="clearLocation"
          :feature-data="position"></position-modify-map>
      </div>
      <div class="position-bar">
        <div class="input">
          {{ $t('经度') }}
          <meg-input
            :disabled="!cameraEditAuth.lon"
            v-model="formData.lon"></meg-input>
        </div>
        <div class="input">
          {{ $t('纬度') }}
          <meg-input
            :disabled="!cameraEditAuth.lat"
            v-model="formData.lat"></meg-input>
        </div>
        <meg-button
          type="text"
          :disabled="!cameraEditAuth.lon"
          @click="setPosition">
          {{ $t('标记') }}
        </meg-button>
      </div>
    </div>
  </meg-dialog>
</template>

<script>
import PositionModifyMap from '@/common-components/common-maps/position-modify-map';
import rules from '../camera-manage.rule';
import CameraManageSrv from '../camera-manage.service';

export default {
  components: {
    PositionModifyMap
  },
  props: {
    cameraAuth: {
      type: Object,
      default: () => {}
    },
    visible: {
      type: Boolean,
      default: false,
    },
    isAddCamera: {
      type: Boolean,
      default: false,
    },
    isGaproxy: {
      type: Boolean,
      default: false,
    },
    isPoliceNet: {
      type: Boolean,
      default: false,
    },
    labelList: {
      type: Array,
      default: () => [],
    },
    faceFrameModeOption: {
      type: Array,
      default: () => [],
    },
    orgTreeData: {
      type: Array,
      default: () => [],
    },
    userTreeData: {
      type: Array,
      default: () => [],
    },
    placeList: {
      type: Array,
      default: () => [],
    },
    keyUnitList: {
      type: Array,
      default: () => [],
    },
    boxTreeData: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      cameraTypeData: this.$store.getters.dataMapByType('camera_type'), // 相机类型
      manufactureOption: this.$store.getters.dataMapByType('device_manufacturer'), // 相机厂商
      monitoringTypeOption: this.$store.getters.dataMapByType('bayonet_type'),
      channelSizeData: this.$store.getters.dataMapByType('box_channel_number'),
      cameraShareModel: this.$store.getters.dataMapByType('camera_auth'),
      recordTypeOption: this.$store.getters.dataMapByType('record_type').map((val) => { val.code = Number(val.code); return val; }),
      storageSchemeOption: [
        {
          key: 1,
          label: this.$t('方案一'),
        },
        {
          key: 2,
          label: this.$t('方案二'),
        },
      ],
      activeIndex: 0,
      warning: 3,
      $target: null,
      groupTreeData: [],
      deptTreeProps: {
        children: 'subOrgs',
        label: 'orgName',
      },
      defaultTreeProps: {
        label: 'name',
        children: 'items',
      },
      baseParams: ['name', 'type', 'manufacturer', 'monitoringType', 'boxId', 'ipAddr', 'active', 'username', 'password', 'cmdPort', 'videoPort', 'rainbowUrl', 'ptz', 'managementId', 'chanelNum', 'channelNo', 'numeration', 'location'],
      proParams: ['storageScheme', 'statusSyncInterval', 'lowQuality', 'fullRectModel', 'shareModel', 'shareList', 'placeIds', 'unitIds', 'alarmShortVideo', 'period', 'tagIds', 'gbPlatformId', 'gbPlatformDeviceId'],
      otherParams: ['sncode', 'remark', 'pulled'],
      formData: {
        name: '',
        type: '1',
        manufacturer: '11',
        monitoringType: '1',
        ipAddr: '',
        active: 0,
        username: '',
        password: '',
        cmdPort: '',
        videoPort: '554',
        rainbowUrl: '',
        ptz: 0,
        managementId: '',
        numeration: '',
        location: '',
        boxId: '',
        chanelNum: '', // 后端拼错了少个n 不愿意改
        storageScheme: 1,
        statusSyncInterval: 10,
        lowQuality: false,
        fullRectModel: '1',
        shareModel: '0',
        alarmShortVideo: false,
        recordType: 1,
        period: 35,
        gbPlatformId: '',
        gbPlatformDeviceId: '',
        sncode: '',
        pulled: false,
        remark: '',
        lat: '',
        lon: '',
        channelNo: 1 // 相机通道号
      },
      defaultFormData: {
        name: '',
        type: '1',
        manufacturer: '11',
        monitoringType: '1',
        ipAddr: '',
        active: 0,
        username: '',
        password: '',
        cmdPort: '',
        videoPort: '554',
        rainbowUrl: '',
        ptz: 0,
        managementId: '',
        numeration: '',
        location: '',
        boxId: '',
        chanelNum: '',
        storageScheme: 1,
        statusSyncInterval: 10,
        lowQuality: false,
        fullRectModel: '1',
        shareModel: '0',
        alarmShortVideo: false,
        recordType: 1,
        period: 35,
        gbPlatformId: '',
        gbPlatformDeviceId: '',
        sncode: '',
        pulled: false,
        remark: '',
        lat: '',
        lon: '',
        channelNo: 1 // 相机通道号
      },
      position: {
        lat: '',
        lon: ''
      },
      cameraRule: null,
      boxDetail: {}, // 智能盒详情
      // 相机状态刷新间隔（分钟）
      statusSyncIntervalData: [
        {
          value: 1,
          label: '1分钟',
        },
        {
          value: 2,
          label: '2分钟',
        },
        {
          value: 5,
          label: '5分钟',
        },
        {
          value: 10,
          label: '10分钟',
        },
        {
          value: 30,
          label: '30分钟',
        },
        {
          value: 60,
          label: '60分钟',
        },
      ],
    };
  },
  computed: {
    // 相机类型
    filterCameraType() {
      return this.cameraTypeData.filter((val) => {
        if (this.isAddCamera) {
          return val.code !== '4' && val.code !== '3' && !val.extra;
        }
        return !val.extra;
      });
    },
    // 相机协议
    realManufactureOption() {
      return this.formData.type === '1'
        ? this.manufactureOption
        : this.manufactureOption.filter((val) => val.code !== '99');
    },
    // 是否显示ip
    isShowUrl() {
      return (
        (this.formData.type !== '12'
          && this.formData.type !== '4'
          && this.formData.type !== '3'
          && this.formData.type !== '15')
        || this.formData.type === '12'
      );
    },
    // 主动模式
    active: {
      get() {
        if (this.formData.active) return true;
        return false;
      },
      set(val) {
        this.formData.active = val ? 1 : 0;
      },
    },
    // 云台
    ptz: {
      get() {
        if (this.formData.ptz) return true;
        return false;
      },
      set(val) {
        this.formData.ptz = val ? 1 : 0;
      },
    },
    // 相机卡口类型
    cameraType() {
      const isFace = ['1', '2', '3', '10'].includes(
        this.formData.monitoringType
      );
      return isFace ? 'faceCamera' : 'structureCamera';
    },
    cameraEditAuth() {
      if (this.cameraAuth.sceneOnePoliceNet && !this.isAddCamera && !this.isPoliceNet) {
        return {
          name: true,
          type: false,
          manufacturer: true,
          monitoringType: true,
          tagIds: true,
          placeIds: true,
          unitIds: true,
          ipAddr: true,
          active: true,
          username: true,
          password: true,
          cmdPort: true,
          videoPort: true,
          rainbowUrl: true,
          ptz: true,
          managementId: true,
          numeration: true,
          location: true,
          boxId: false,
          chanelNum: false,
          storageScheme: true,
          statusSyncInterval: false,
          lowQuality: false,
          fullRectModel: false,
          shareModel: true,
          shareList: true,
          alarmShortVideo: false,
          recordType: true,
          period: true,
          gbPlatformId: true,
          gbPlatformDeviceId: true,
          sncode: true,
          pulled: false,
          remark: true,
          lat: true,
          lon: true,
          channelNo: true,
          labels: true
        };
      }
      if (this.cameraAuth.sceneThreePoliceNet && !this.isAddCamera) {
        return {
          name: false,
          type: false,
          manufacturer: false,
          monitoringType: false,
          tagIds: true,
          placeIds: true,
          unitIds: true,
          ipAddr: false,
          active: false,
          username: false,
          password: false,
          cmdPort: false,
          videoPort: false,
          rainbowUrl: false,
          ptz: false,
          managementId: false,
          numeration: false,
          location: false,
          boxId: false,
          chanelNum: false,
          storageScheme: true,
          statusSyncInterval: true,
          lowQuality: true,
          fullRectModel: true,
          shareModel: true,
          shareList: true,
          alarmShortVideo: false,
          recordType: false,
          period: false,
          gbPlatformId: false,
          gbPlatformDeviceId: false,
          sncode: false,
          pulled: false,
          remark: false,
          lat: false,
          lon: false,
          channelNo: false,
          labels: false
        };
      }
      if (this.isAddCamera) {
        return {
          name: true,
          type: true,
          manufacturer: true,
          monitoringType: true,
          tagIds: true,
          placeIds: true,
          unitIds: true,
          ipAddr: true,
          active: true,
          username: true,
          password: true,
          cmdPort: true,
          videoPort: true,
          rainbowUrl: true,
          ptz: true,
          managementId: true,
          numeration: true,
          location: true,
          boxId: true,
          chanelNum: true,
          storageScheme: true,
          statusSyncInterval: true,
          lowQuality: true,
          fullRectModel: true,
          shareModel: true,
          shareList: true,
          alarmShortVideo: true,
          recordType: true,
          period: true,
          gbPlatformId: true,
          gbPlatformDeviceId: true,
          sncode: true,
          pulled: true,
          remark: true,
          lat: true,
          lon: true,
          channelNo: true,
          labels: true
        };
      }
      return {
        name: true,
        type: false,
        manufacturer: true,
        monitoringType: true,
        tagIds: true,
        placeIds: true,
        unitIds: true,
        ipAddr: true,
        active: true,
        username: true,
        password: true,
        cmdPort: true,
        videoPort: true,
        rainbowUrl: true,
        ptz: true,
        managementId: true,
        numeration: true,
        location: true,
        boxId: true,
        chanelNum: true,
        storageScheme: true,
        statusSyncInterval: true,
        lowQuality: true,
        fullRectModel: true,
        shareModel: true,
        shareList: true,
        alarmShortVideo: true,
        recordType: true,
        period: true,
        gbPlatformId: true,
        gbPlatformDeviceId: true,
        sncode: true,
        pulled: true,
        remark: true,
        lat: true,
        lon: true,
        channelNo: true,
        labels: true
      };
    },
    periodDisabled() {
      return (!this.formData.alarmShortVideo
      && this.$store.getters.systemByType('alarmShortVideo').value === '0')
      || this.formData.recordType === 3
      || !(this.$store.getters.systemByType('alarmShortVideo').value !== '0')
      || (!this.cameraEditAuth.period);
    },
    recordTypeDisabled() {
      return (!this.formData.alarmShortVideo
      && this.$store.getters.systemByType('alarmShortVideo').value === '0')
      || !(this.$store.getters.systemByType('alarmShortVideo').value !== '0')
      || (!this.cameraEditAuth.recordType);
    }
  },
  watch: {},
  created() {
    this.getGroupsList();
  },
  mounted() {
    this.cameraRule = rules.addCamera(this.formData);
    this.$nextTick(() => {
      this.$target = document.querySelector('div.add-camera-content');
    });
  },
  destroyed() {
  },
  methods: {
    boxTreeReady() {
      if (this.formData.boxId) {
        this.$refs.boxTree.setCurrentKey(this.formData.boxId);
        this.boxTreeCheckChange({ id: this.formData.boxId, flag: 'box' }, true);
      }
    },
    deptTreeReady() {
      if (this.formData.managementId) {
        this.$refs.deptTree.setCurrentKey(this.formData.managementId);
      }
    },
    labelTreeReady() {
      if (this.formData.labels) {
        this.$refs.labelTree.setCheckedKeys(this.formData.labels);
      }
    },
    userTreeReady() {
      if (this.formData.shareList) {
        const ids = this.formData.shareList.map((item) => item.shareObject);
        this.$refs.userTree.setCheckedKeys(ids);
      }
    },
    unitTreeReady() {
      if (this.formData.unitIds) {
        this.$refs.unitTree.setCheckedKeys(this.formData.unitIds);
      }
    },
    placeTreeReady() {
      if (this.formData.placeIds) {
        this.$refs.placeTree.setCheckedKeys(this.formData.placeIds);
      }
    },
    searchGroupTreeReady() {
      if (this.formData.tagIds) {
        this.$refs.searchGroupTree.setCheckedKeys(this.formData.tagIds);
      }
    },
    // 滚动监听器
    onScroll() {
      // 获取所有锚点元素
      const navContents = document.querySelectorAll('div.bottom-line');
      // 所有锚点元素的 offsetTop
      const offsetTopArr = [];
      navContents.forEach((item) => {
        // 95是dialog的header和padding top
        offsetTopArr.push(item.offsetTop - 95);
      });
      let navIndex = 0;
      const bottom = document.querySelector('div.form-container').offsetHeight - 570;
      for (let n = 0; n < offsetTopArr.length; n += 1) {
        if (this.$target.scrollTop === bottom) {
          navIndex = 2;
          break;
        }
        if (this.$target.scrollTop >= offsetTopArr[n]) {
          navIndex = n;
        }
      }
      // 把下标赋值给 vue 的 data
      this.activeIndex = navIndex;
    },
    // menu点击滚动
    scrollTo(index) {
      const t = document.querySelectorAll('div.bottom-line')[index];
      console.log(t);
      const targetOffsetTop = document.querySelectorAll('div.bottom-line')[index].offsetTop;
      // 95是dialog的header和padding top
      this.$target.scrollTop = targetOffsetTop - 95;
      setTimeout(() => {
        this.activeIndex = index;
      }, 200);
    },
    // 查询相机分组
    getGroupsList() {
      CameraManageSrv.getGroupsList({ withCameras: false, searchType: 0 }).then((res) => {
        if (res.code === 0) {
          this.groupTreeData = res.data;
        }
      });
    },
    closeDialog() {
      this.$emit('update:visible', false);
    },
    // 相机类型
    cameraTypeChange() {
      const { gbPlatformDeviceId, gbPlatformId, type } = this.formData;
      if (type === '1') {
        this.formData.pulled = false;
      } else {
        this.formData.pulled = true;
      }
      if (type !== '12') {
        if (this.boxDetail.id) {
          this.formData.ipAddr = '';
          this.formData.username = '';
          this.formData.password = '';
          this.formData.cmdPort = '';
          this.formData.videoPort = '554';
          this.formData.rainbowUrl = '';
          this.boxDetail = {};
        }
      }
      if (type !== '1') {
        this.formData.manufacturer = '11';
      }
      if (!gbPlatformDeviceId) {
        this.$refs.form.clearValidate(['gbPlatformDeviceId']);
      }
      if (!gbPlatformId) {
        this.$refs.form.clearValidate(['gbPlatformId']);
      }
    },
    deptCheckChange(node, checked) {
      this.formData.managementId = checked ? node.id : '';
    },
    // 处理自定义标签显示
    handleSelectLabel(items) {
      const arr = [];
      items.forEach((val) => {
        let str = '';
        if (val.idPath.length) {
          val.idPath.forEach((item) => {
            str += `${this.$refs.labelTree.getNode(item).name}/`;
          });
        }
        arr.push({
          ...val,
          normalName: `${str}${val.name}`,
        });
      });
      return arr;
    },
    // 取消选中
    deleteSelect(item) {
      if (!this.cameraEditAuth.labels) return;
      this.$refs.labelTree.setChecked(item.id, false);
    },
    // 盒子
    boxTreeCheckChange(node, checked) {
      if (checked && this.cameraEditAuth.boxId) {
        if (node.flag === 'box') {
          this.formData.boxId = node.id;
          this.getBoxData({ id: node.id });
        } else {
          this.$refs.boxTree.setCurrentKey(null);
        }
      }
    },
    // 盒子树选择节点后请求盒子详情
    getBoxData(params) {
      CameraManageSrv.queryBoxDetail(params).then((res) => {
        if (res.code === 0) {
          this.boxDetail = res.data;
          this.formData.ipAddr = this.boxDetail.ipAddr || '';
          this.formData.username = this.boxDetail.username || '';
          this.formData.password = this.boxDetail.password || '';
          this.formData.cmdPort = this.boxDetail.cmdPort || '';
          this.formData.videoPort = this.boxDetail.videoPort || '554';
          this.formData.rainbowUrl = this.boxDetail.url || '';
        }
      });
    },
    // 取到通道数
    getChannelName(key) {
      return key ? this.getChannelMapData(this.channelSizeData).get(key) : [];
    },
    // 数组转map
    getChannelMapData(data) {
      const map = new Map();
      data.forEach((item) => {
        map.set(item.code, parseInt(item.value, 10));
      });
      return map;
    },
    // 当小视频类型变化时，切换默认值
    onRecordTypeChange() {
      this.cameraRule = rules.addCamera(this.formData);
      if (this.formData.recordType === 3) {
        this.formData.period = '';
      } else if (this.formData.recordType === 2) {
        this.formData.period = 1800;
      } else if (this.formData.recordType === 1) {
        this.formData.period = 35;
      }
    },
    locationChange(location) {
      this.formData.lon = location.lon.toFixed(6);
      this.formData.lat = location.lat.toFixed(6);
      this.position = {
        lon: this.formData.lon,
        lat: this.formData.lat
      };
    },
    clearLocation() {
      this.position = {
        lon: '',
        lat: ''
      };
      this.formData.lon = '';
      this.formData.lat = '';
    },
    setPosition() {
      const { lon, lat } = this.position;
      this.formData.lon = lon;
      this.formData.lat = lat;
    },
    getFormData() {
      console.log(this.userTreeData);
      const data = { ...this.formData };
      if (this.$refs.labelTree) {
        data.labels = this.$refs.labelTree.getCheckedKeys();
      }
      if (this.$refs.userTree) {
        const nodes = this.$refs.userTree.getCheckedNodes();
        data.shareList = nodes.map((item) => ({
          shareType: item.isUser ? 1 : 0,
          shareObject: item.id
        }));
      }
      if (this.$refs.placeTree) {
        data.placeIds = this.$refs.placeTree.getCheckedKeys();
      }
      if (this.$refs.unitTree) {
        data.unitIds = this.$refs.unitTree.getCheckedKeys();
      }
      if (this.$refs.searchGroupTree) {
        data.tagIds = this.$refs.searchGroupTree.getCheckedKeys();
      }
      return data;
    },
    setFormData(data) {
      this.formData = { ...this.defaultFormData, ...data };
      this.formData.type += '';
      this.formData.manufacturer += '';
      this.formData.monitoringType += '';
      this.formData.shareModel += '';
      this.formData.fullRectModel += '';
      this.position = {
        lon: this.formData.lon,
        lat: this.formData.lat
      };
      this.cameraRule = rules.addCamera(this.formData);
    },
    confirm() {
      this.cameraRule = rules.addCamera(this.formData);
      this.$nextTick(() => {
        this.$refs.form.validate((valid, keys) => {
          if (valid) {
            const params = this.getFormData();
            if (this.isAddCamera) {
              CameraManageSrv.createCamera(params).then((res) => {
                if (res.code === 0) {
                  this.$message.success(this.$t('添加成功'));
                  this.$emit('update-camera-list');
                  this.closeDialog();
                }
              });
            } else {
              CameraManageSrv.setEditCamera(params).then((res) => {
                if (res.code === 0) {
                  this.$message.success(this.$t('修改成功'));
                  this.$emit('update-camera-list');
                  this.closeDialog();
                }
              });
            }
          } else {
            const key = Object.keys(keys)[0];
            if (this.baseParams.includes(key)) {
              this.scrollTo(0);
              this.warning = 0;
            } else if (this.proParams.includes(key)) {
              this.scrollTo(1);
              this.warning = 1;
            } else if (this.otherParams.includes(key)) {
              this.scrollTo(2);
              this.warning = 2;
            } else {
              this.warning = 3;
            }
          }
        });
      });
    },
  },
};
</script>

<style lang='scss' scoped>
.add-camera {
  .title {
    display: flex;
    justify-content: space-between;
    height: 55px;
    line-height: 55px;
    .title-word {
      font-weight: bold;
      font-size: 18px;
      color: #435068;
      margin-left: 30px;
    }
  }
  ::v-deep .meg-dialog__body {
    padding: 0;
    display: flex;
    height: 690px;
  }
  .add-camera-menu {
    width: 120px;
    background: #f7f7f7;
    height: 100%;
    position: relative;
    .menu {
      border-left: solid 6px #f7f7f7;
      position: relative;
      top: 12px;
      height: 70px;
      width: 114px;
      font-size: 18px;
      font-weight: bold;
      color: #435068;
      line-height: 70px;
      text-align: center;
      cursor: pointer;
    }
    .active {
      border-left: solid 6px #5B98E7;
      background: white;
    }
    .warning {
      border-left: solid 6px #D81010;
      color: #D81010;
      background: white;
    }
  }
  .add-camera-content {
    overflow-y: scroll;
    width: 780px;
    padding: 40px;
    .bottom-line {
      border-bottom: solid 1px #f3f3f3;
      margin-bottom: 40px;
    }
    .menu-title {
      font-size: 14px;
      color: #435068;
      font-weight: bold;
      margin-bottom: 25px;
    }
    .form-content {
      display: flex;
      margin-bottom: 20px;
      .force-width {
        ::v-deep .meg-form-item__content {
          width: 270px;
        }
      }
      .textarea {
        ::v-deep .meg-textarea__inner {
          height: 88px;
        }
      }
      .meg-select {
        width: 270px;
      }
      .form-left-content {
        width: 50%;
      }
      .form-right-content {
        flex: 1;
      }
    }
  }
  .add-camera-map {
    flex: 1;
    display: flex;
    flex-direction: column;
    .map-area {
      flex: 1;
    }
    .position-bar {
      height: 66px;
      display: flex;
      justify-content: space-around;
      line-height: 66px;
      .input {
        width: 40%;
      }
      .meg-input {
        width: 80%;
      }
    }
  }
}
</style>
