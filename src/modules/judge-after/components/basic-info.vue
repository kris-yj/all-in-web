<template>
  <div class="basic-info">
    <div class="header">
      基础信息
    </div>
    <div class="content">
      <meg-form
        label-position="top"
        :model="customForm"
        :rules="rules"
        ref="basicInfoForm">
        <div class="technique-label-block">
          <div class="technique-label-text">
            <div class="icon-block">
              <meg-icon
                :name="technicalIcon"
                class="icon"></meg-icon>
            </div>
            <meg-form-item
              label="战法标签"
              prop="technicalName">
              <meg-input
                placeholder="请输入1-50个字符"
                v-model="customForm.technicalName"></meg-input>
            </meg-form-item>
          </div>
          <meg-form-item>
            <ul class="technique-icon-list">
              <li
                class="technique-icon-block"
                :class="{ 'selected': icon === technicalIcon}"
                v-for="(icon, index) in customTechniqueIcons"
                :key="index"
                @click="onIconClick(icon)">
                <div class="technique-icon-block-inner">
                  <meg-icon
                    :name="icon"
                    color="#ffffff">
                  </meg-icon>
                </div>
              </li>
            </ul>
          </meg-form-item>
        </div>
        <meg-form-item
          label="备注"
          prop="technicalNote">
          <meg-input
            type="textarea"
            placeholder="请输入"
            v-model="customForm.technicalNote"></meg-input>
        </meg-form-item>
      </meg-form>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    rules: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      // 战法icon
      customTechniqueIcons: ['handcuffs', 'send-flyers', 'lock', 'stay', 'thief', 'dagger', 'non_motor_vehicle'],
      // 当前选中的战法icon
      technicalIcon: 'handcuffs',
      // 战法标签和战法备注
      customForm: {
        technicalName: '',
        technicalNote: ''
      },
    };
  },
  methods: {
    /**
     * 基础信息表单校验，供外部调用
     */
    validateForm(callback) {
      const { basicInfoForm } = this.$refs;
      basicInfoForm.validate((vaild) => {
        callback(vaild);
      });
    },
    /**
     * 设置基础信息数据，供外部编辑使用
     */
    setBasicInfoData(data) {
      const { technicalIcon, technicalName, technicalNote } = data;
      this.technicalIcon = technicalIcon;
      this.customForm = {
        technicalName,
        technicalNote
      };
      this.$nextTick(() => {
        this.$refs.basicInfoForm.clearValidate();
      });
    },
    /**
     * 获取基础信息表单的数据，供外部调用
     */
    getBasicInfoData() {
      return {
        ...this.customForm,
        technicalIcon: this.technicalIcon
      };
    },
    /**
     * 战法icon点击
     */
    onIconClick(iconName = 'handcuffs') {
      this.technicalIcon = iconName;
    }
  }
};
</script>

<style lang="scss" scoped>
.basic-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.header {
  height: 52px;
  line-height: 52px;
  border-bottom: 1px solid #EFEFEF;
  font-size: 16px;
  font-weight: bold;
  color: #435068;
  padding-left: 25px;
}
.content {
  flex: 1;
  overflow: auto;
  padding: 20px 25px;
}
.technique-label-block {
  display: flex;
  border-bottom: 1px solid #EFEFEF;
  flex-direction: column;
  margin-bottom: 20px;

  .technique-label-text {
    display: flex;
  }
  .icon-block {
    width: 56px;
    height: 56px;
    margin-right: 14px;
    background: #6B82E4;
    border-radius: 4px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    .icon {
      width: 25px;
      height: 25px;
      color: #ffffff;
    }
  }
}
.technique-icon-list {
  display: flex;
}
.technique-icon-block {
  width: 37px;
  height: 37px;
  border-radius: 6px;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all .2s ease;

  &.selected, &:hover {
    border: 1px solid #5B98E7;
  }

  .technique-icon-block-inner {
    width: 30px;
    height: 30px;
    background: #6B82E4;
    border-radius: 4px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
