<template>
  <div class="meg-export-button">
    <meg-button-group
      class="meg-button-group--disabled"
      v-if="disabled">
      <meg-button
        :disabled="disabled"
        :type="type ||'default'">
        {{ buttonText || $t('导出') }}
      </meg-button>
      <meg-button
        :disabled="disabled"
        :type="type ||'default'"
        class="meg-dropdown__caret-button">
        <meg-icon
          name="meg-icon-arrow_down"
          height="12">
        </meg-icon>
      </meg-button>
    </meg-button-group>
    <meg-dropdown
      v-else
      split-button
      :type="type ||'default'"
      trigger="hover"
      placement="bottom-start"
      @command="onClickSetting"
      @click="onClickExport">
      {{ buttonText || $t('导出') }}
      <template v-slot:dropdown>
        <meg-dropdown-menu
          class="meg-export-button-dropdown">
          <meg-dropdown-item>
            {{ dropdownText || $t('导出设置') }}
          </meg-dropdown-item>
        </meg-dropdown-menu>
      </template>
    </meg-dropdown>
  </div>
</template>
<script>

export default {
  name: 'MegExportButton',
  props: {
    type: {
      type: String,
      default: 'default',
    },
    disabled: {
      type: Boolean,
      default: false
    },
    buttonText: {
      type: String,
      default: ''
    },
    dropdownText: {
      type: String,
      default: ''
    }
  },
  methods: {
  /**
   * 发出导出事件
   */
    onClickExport() {
      this.$emit('click-export');
    },
    /**
   * 发出导出设置事件
   */
    onClickSetting() {
      this.$emit('click-setting');
    }
  }
};
</script>
<style lang="scss" scoped>
.meg-export-button {
  display: inline-block;
  .meg-dropdown {
    .meg-button {
      &::before {
        top: 10px;
        bottom: 10px;
        background-color: #c8d5e6;
      }
    }
    button.meg-button--default.meg-dropdown__caret-button:focus {
      padding-left: 5px;
      padding-right: 5px;
    }

    .meg-button--primary.meg-dropdown__caret-button {
      padding-bottom: 9px;
      &::before {
        top: 10px;
        bottom: 10px;
      }
    }
    .meg-dropdown__caret-button:hover {
      padding-left: 5px;
      padding-right: 5px;
    }
  }
}
.meg-dropdown-menu.meg-export-button-dropdown {
  padding: 0;
  margin-top: 10px;
  .meg-dropdown-menu__item {
    padding: 0 23px;
  }
}

.meg-button-group--disabled {
  .meg-button:first-child:hover {
    z-index: 0;
  }
  .meg-dropdown__caret-button {
    padding-left: 5px;
    padding-right: 5px;
    position: relative;
    border-left: none;
  }
  .meg-button--primary.meg-dropdown__caret-button {
    padding-left: 5px;
    padding-right: 5px;
    position: relative;
    border-left: none;
    padding-bottom: 9px;
  }
  .meg-button--primary.meg-dropdown__caret-button::before {
    top: 10px;
    bottom: 10px;
  }
  .meg-dropdown__caret-button::before {
    content: "";
    position: absolute;
    display: block;
    width: 1px;
    top: 5px;
    bottom: 5px;
    left: 0;
    background: rgba(255, 255, 255, 0.5);
  }
  .meg-button::before {
    top: 10px;
    bottom: 10px;
    background-color: #c8d5e6;
    border-color: #d7e5ee;
  }
}
</style>
