<template>
  <div>
    <meg-dialog
      :modal-append-to-body="false"
      :append-to-body="false"
      :visible="visible"
      @close="closeDialog"
      title="添加到事件">
      <meg-form
        :rules="formRules"
        ref="eventForm"
        label-width="100px"
        :model="formData">
        <meg-form-item
          label="事件名称"
          prop="event">
          <meg-select v-model="formData.event">
            <meg-option
              :key="event.id"
              v-for="event in eventList"
              :value="event.id"
              :label="event.eventName">
            </meg-option>
            <template v-slot:extra>
              <div
                class="extra-item"
                @click="addNewEvent">
                <meg-icon name="plus"></meg-icon>
                新建事件
              </div>
            </template>
          </meg-select>
        </meg-form-item>
      </meg-form>
      <template slot="footer">
        <meg-button
          @click="handleDataSubmit"
          type="primary">
          确认
        </meg-button>
        <meg-button @click="closeDialog">
          取消
        </meg-button>
      </template>
    </meg-dialog>
    <add-event
      width="1100px"
      v-if="addEventVisible"
      @cancel="closeAddEventDialog"
      @success="closeAddEventDialog"
      :visible="addEventVisible"
      :append-to-body="false"></add-event>
  </div>
</template>
<script>
import AddEvent from '@/modules/events-manage/components/event-dialog';

export default {
  components: {
    AddEvent
  },
  props: {
    visible: {
      type: Boolean,
      default: true,
    },
    eventList: {
      type: Array,
      default: () => [],
    }
  },
  data() {
    return {
      formRules: {
        event: [
          { required: true, message: '请选择事件', trigger: 'change' },
        ],
      },
      addEventVisible: false,
      formData: {
        event: ''
      }
    };
  },
  methods: {
    /*
    * 新建事件
    * @param {any}
    * @return
    * */
    addNewEvent() {
      this.closeDialog();
      this.addEventVisible = true;
    },
    /*
    * 关闭新建事件弹框
    * @param {any}
    * @return
    * */
    closeAddEventDialog() {
      this.addEventVisible = false;
    },
    /*
    * 选择事件后提交数据
    * @param {any}
    * @return
    * */
    handleDataSubmit() {
      this.$refs.eventForm.validate((valid) => {
        if (valid) {
          this.$emit('add-to-event', { eventId: this.formData.event });
        }
      });
    },
    /*
    * 关闭添加事件弹框
    * @param {any}
    * @return
    * */
    closeDialog() {
      this.$refs.eventForm.resetFields();
      this.$emit('update:visible', false);
    }
  }
};
</script>
<style lang="scss" scoped>
.extra-item {
  font-size: 14px;
  color: #21539b;
  font-weight: bold;
  height: 34px;
  line-height: 34px;
  border-top: 1px solid #d2d6de;
  padding-top: 4px;
  padding-bottom: 4px;
  display: flex;
  align-items: center;
  cursor: pointer;
  .meg-icon {
    width: 12px;
    margin-right: 5px;
    margin-left: 13px;
  }
}
</style>
