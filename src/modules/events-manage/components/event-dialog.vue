<template>
  <meg-dialog
    v-if="isShow"
    :title="title"
    :modal-append-to-body="appendToBody"
    :append-to-body="appendToBody"
    :visible.sync="isShow"
    :width="width"
    @close="handleCancel">
    <div class="modal-container">
      <div class="modal-left-form">
        <meg-form
          ref="modalForm"
          :model="formModel"
          :rules="rules"
          label-width="80px"
          label-position="right">
          <meg-form-item
            label="事件名称"
            prop="eventName">
            <meg-input
              v-model.trim="formModel.eventName"
              placeholder="请输入事件名称"></meg-input>
          </meg-form-item>
          <meg-form-item
            v-show="type === 'edit'"
            label="事件编号"
            prop="eventNumber">
            <meg-input
              :disabled="true"
              v-model="formModel.eventNumber"
              placeholder="案件编号"></meg-input>
          </meg-form-item>
          <meg-form-item
            label="事件时间"
            prop="eventTime">
            <meg-date-picker
              v-model="formModel.eventTime"
              type="datetime"
              :picker-options="pickerOptions"
              placeholder="选择日期">
            </meg-date-picker>
          </meg-form-item>
          <meg-form-item
            label="事件地点"
            prop="eventPlace">
            <meg-input
              v-model="formModel.eventPlace"
              placeholder="请输入或在地图中标记地点"></meg-input>
          </meg-form-item>
          <meg-form-item
            label="事件描述"
            prop="eventDesc">
            <meg-input
              class="textarea-form"
              type="textarea"
              v-model="formModel.eventDesc"></meg-input>
          </meg-form-item>
        </meg-form>
      </div>
      <div class="modal-right-map">
        <position-modify-map
          :feature-data="position"
          ref="positionModifyMap"
          @clear-location="onClickClearLocation"
          @location-change="onLocationChange"></position-modify-map>
      </div>
    </div>
    <div
      class="dialog-footer"
      slot="footer">
      <meg-button
        @click="handleSubmit"
        :loading="btnLoading"
        type="primary">
        保存
      </meg-button>
      <meg-button
        @click="handleCancel">
        取消
      </meg-button>
    </div>
  </meg-dialog>
</template>
<script>
import PositionModifyMap from '@/common-components/common-maps/position-modify-map';
// import { trim } from '@/utils/common.utils.js';
import EventManageApi from '../events-manage.service';
import rules from '../events-manage.rule';

export default {
  name: 'EventDialog',
  components: {
    PositionModifyMap,
  },
  props: {
    width: {
      type: String,
      default: '50%',
    },
    title: {
      type: String,
      default: '',
    },
    visible: {
      type: Boolean,
      default: false,
    },
    // 初始数据
    initData: {
      type: Object,
      default: () => (null)
    },
    // 编辑Id
    id: {
      type: [String, Number],
      default: 0,
    },
    appendToBody: {
      type: Boolean,
      default: true,
    }
  },
  data() {
    return {
      isShow: this.visible,
      formModel: {
        eventName: '', // 事件名称
        eventNumber: '', // 事件编号
        eventTime: '', // 事件创建时间
        eventPlace: '', // 事件发生地点
        eventDesc: '', // 事件备注
        longitude: '',
        latitude: '',
      },
      position: { lon: '', lat: '' },
      btnLoading: false,
      type: 'create',
      rules: rules.createRules(),
      pickerOptions: {
        disabledDate(now) {
          return new Date(now).getTime() > new Date().getTime();
        }
      }
    };
  },
  watch: {
    visible(val) {
      this.isShow = val;
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.initFormData();
    });
  },
  methods: {
    initFormData() {
      if (this.id) {
        this.type = 'edit';
        // 如果是编辑的话，回填数据，否则清空数据
        this.fillEditDefaultData();
      } else {
        this.type = 'create';
        this.cleanFormData();
      }
    },
    // 每次页面加载清空掉之前输入的数据
    cleanFormData() {
      this.$nextTick(() => {
        if (this.$refs.modalForm) this.$refs.modalForm.resetFields();
      });
      Object.keys(this.formModel).forEach((key) => {
        this.formModel[key] = '';
      });
    },
    /**
     * 将编辑的数据回显
     */
    fillEditDefaultData() {
      // 先清空，然后再注入
      Object.keys(this.formModel).forEach((key) => {
        this.formModel[key] = '';
      });
      EventManageApi.eventsDetailByOne(this.id).then((res) => {
        if (res.code === 0) {
          Object.keys(this.formModel).forEach((key) => {
            if (Object.prototype.hasOwnProperty.call(res.data, key)) {
              this.formModel[key] = res.data[key];
            }
          });
          const { longitude, latitude, eventTime } = res.data;
          this.formModel.eventTime = new Date(eventTime);
          if (longitude === undefined || latitude === undefined) {
            this.position = {
              lon: '',
              lat: ''
            };
            return;
          }
          this.position = { lon: longitude, lat: latitude };
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    /**
     * 表单提交
     */
    handleSubmit() {
      this.$refs.modalForm.validate((valid) => {
        if (valid) {
          this.handleSave();
        }
      });
    },
    /**
     * 保存新建或者编辑的数据
     */
    handleSave() {
      const { type } = this;
      const {
        eventName, eventTime, eventPlace, eventDesc, eventNumber,
        longitude, latitude
      } = this.formModel;
      const params = {
        // caseName: trim(caseName),
        eventName,
        eventTime: new Date(eventTime).getTime(),
        eventPlace,
        eventDesc,
        eventNumber,
        longitude,
        latitude
      };
      this.resolveEditOrSave(params)[type]();
    },
    // 分开处理
    resolveEditOrSave(params) {
      const self = this;
      return {
        edit() {
          self.handleEventEdit({ ...params, id: self.id });
        },
        create() {
          delete params.eventNumber;
          self.handleEventSave(params);
        }
      };
    },
    /**
     * 关闭
     */
    handleCancel() {
      this.$emit('cancel');
    },
    // 获取地图标记的经纬度
    onLocationChange({ lon, lat }) {
      console.log(lon, lat);
      this.formModel.longitude = lon;
      this.formModel.latitude = lat;
      this.position = { lon, lat };
    },
    // 清除地图的标记点位
    onClickClearLocation() {
      this.position = {
        lon: '',
        lat: ''
      };
      this.formModel.longitude = null;
      this.formModel.latitude = null;
    },
    /**
     * 编辑
     */
    handleEventEdit(params) {
      const { id } = params;
      this.btnLoading = true;
      EventManageApi.editEvent(id, params).then((res) => {
        this.btnLoading = false;
        if (res.code === 0) {
          this.$message.success('编辑事件成功');
          this.$emit('success');
        } else {
          this.$message.errro(res.msg);
        }
      }).catch((e) => {
        console.log(e);
        this.$message.error('编辑目标档案失败');
      });
    },
    /**
     * 保存
     */
    handleEventSave(params) {
      this.btnLoading = true;
      EventManageApi.createEvent(params).then((res) => {
        this.btnLoading = false;
        if (res.code === 0) {
          this.$message.success('创建事件成功');
          this.$emit('success', res.data.id);
        } else {
          this.$message.errror(res.msg);
        }
      }).catch((e) => {
        console.log(e);
      });
    },
  }
};
</script>
<style lang="scss" scoped>
.textarea-form{
  ::v-deep.meg-textarea__inner {
    max-height: 200px;
  }
}

.modal-container{
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  box-sizing: border-box;
  height: 448px;
  .modal-left-form{
    width: 288px;
    .addr-info{
      font-size: 12px;
      color: #606266;
    }
  }
  .modal-right-map{
    width: calc(100% - 288px);
    margin-left: 24px;
    height: 428px;
    position: relative;
    .actions {
      position: absolute;
      top: 12px;
      right: 12px;
    }
  }
}
</style>
