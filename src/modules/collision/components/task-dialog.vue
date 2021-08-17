<template>
  <meg-dialog
    class="collision-task"
    :visible="visible"
    :show-close="true"
    width="800px"
    @close="onDialogClose">
    <span slot="title">
      {{ type==="add" ? $t("新建任务") : (type==="check" ? $t("查看任务") : $t("复制任务")) }}
    </span>
    <div>
      <meg-form
        ref="task"
        class="task-form"
        :class="{'readonly-form-four': disabled && formData.singleAlbum, 'readonly-form-five': disabled && !formData.singleAlbum,
                 'form-four': !disabled && formData.singleAlbum, 'form-five': !disabled && !formData.singleAlbum}"
        :model="formData"
        label-width="90px"
        :rules="taskRule">
        <meg-form-item
          prop="name"
          :class="{'readonly-item': disabled}">
          <span
            :class="readonlyLabel"
            slot="label">{{ $t('任务名称') }}</span>
          <meg-input
            v-if="!disabled"
            v-model.trim="formData.name"
            :placeholder="$t('请输入{entity}', { entity: $t('任务名称') })">
          </meg-input>
          <span
            class="readonly-value"
            v-else>
            {{ formData.name }}
          </span>
        </meg-form-item>
        <meg-form-item>
          <meg-radio-group
            v-model="formData.compareMode"
            v-if="!disabled">
            <meg-radio label="SEARCH_EQUIVALENT">
              {{ $t('精度模式') }}
            </meg-radio>
            <meg-radio label="SPEED">
              {{ $t('速度模式') }}
            </meg-radio>
          </meg-radio-group>
          <span
            class="readonly-value"
            v-else>
            {{ formData.compareMode === 'SPEED' ? $t("速度模式") : $t("精度模式") }}
          </span>
        </meg-form-item>
        <meg-form-item
          label=""
          :class="{'readonly-item': disabled}">
          <meg-radio-group
            v-if="!disabled"
            v-model="formData.singleAlbum"
            :disabled="disabled">
            <meg-radio :label="true">
              {{ $t('单库碰撞') }}
            </meg-radio>
            <meg-radio :label="false">
              {{ $t('双库碰撞') }}
            </meg-radio>
          </meg-radio-group>
          <span
            class="readonly-value"
            v-else>
            {{ formData.singleAlbum ? $t("单库碰撞") : $t("双库碰撞") }}
          </span>
        </meg-form-item>
        <meg-form-item
          prop="threshold"
          style="width:300px"
          :class="{'readonly-item': disabled}">
          <span
            :class="readonlyLabel"
            slot="label">{{ $t('比对阈值') }}</span>
          <div
            v-if="!disabled"
            class="oneline">
            <meg-input
              :placeholder="$t('请输入数字')"
              v-model="formData.threshold">
            </meg-input>
            <span>（{{ $t('输入范围：') }}</span>
            <span>{{ suggestThreshold.min }}-100）</span>
          </div>
          <span
            class="readonly-value"
            v-else>
            {{ formData.threshold }}
          </span>
        </meg-form-item>
        <meg-form-item
          prop="albumId1"
          :class="{'readonly-item': disabled}">
          <span
            :class="readonlyLabel"
            slot="label">{{ albumLabel }}</span>
          <meg-select
            class="album-select"
            v-if="!disabled"
            v-model="formData.albumId1"
            :placeholder="$t('请选择')">
            <meg-option
              v-show="item.id !== formData.albumId2 ||formData.singleAlbum"
              v-for="item in albumOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </meg-option>
          </meg-select>
          <span
            v-else
            class="readonly-value">
            {{ albumLabel1 }}
          </span>
        </meg-form-item>
        <meg-form-item
          prop="albumId2"
          v-if="!formData.singleAlbum"
          :class="{'readonly-item': disabled}">
          <span
            :class="readonlyLabel"
            slot="label">{{ $t('选择底库2') }}</span>
          <meg-select
            class="album-select"
            v-model="formData.albumId2"
            :placeholder="$t('请选择')"
            v-if="!disabled">
            <meg-option
              v-show="item.id!==formData.albumId1 ||formData.singleAlbum"
              v-for="item in albumOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </meg-option>
          </meg-select>
          <span
            v-else
            class="readonly-value">
            {{ albumLabel2 }}
          </span>
        </meg-form-item>
        <meg-form-item
          :class="{'readonly-item': disabled}">
          <span
            v-if="!disabled || disabled&&formData.filters.includes('1') || disabled&&formData.filters.includes('2')"
            :class="readonlyLabel"
            slot="label">{{ $t("过滤") }}</span>
          <meg-checkbox-group
            v-model="formData.filters"
            v-if="!disabled">
            <meg-checkbox label="1">
              <div class="filterContent">
                <span>{{ $t('身份证号去重') }}</span>
                <span>{{ $t('去除身份证号完全一样的结果') }}</span>
              </div>
            </meg-checkbox>
            <meg-checkbox
              label="2"
              v-if="currentLocale ==='zh-CN'">
              <div class="filterContent">
                <span>{{ $t('双胞胎去重') }}</span>
                <span>{{ $t('去除身份证号前14位完全一样的结果') }}</span>
              </div>
            </meg-checkbox>
          </meg-checkbox-group>
          <div
            class="readonly-filter"
            v-else>
            <span
              class="readonly-value"
              v-if="formData.filters.includes('1')">{{ $t('身份证号去重') }}</span>
            <span v-if="formData.filters.includes('2')">{{ $t('双胞胎去重') }}</span>
          </div>
        </meg-form-item>
      </meg-form>
    </div>
    <span
      slot="footer"
      class="dialog-footer">
      <meg-button @click="onDialogClose">取 消</meg-button>
      <meg-button
        type="primary"
        @click="onDialogConfirm">确 定</meg-button>
    </span>
  </meg-dialog>
</template>
<script>
import rule from '@/modules/collision/collision.rule';
import CollisionSrv from '../collision.service.js';

export default {
  props: {
    type: {
      type: String,
      default: 'add'
    },
    visible: {
      type: Boolean,
      default: false
    },
    formData: {
      type: Object,
      default() {
        return {
          filters: []
        };
      }
    },
    suggestThreshold: {
      type: Object,
      default() {
        return {
          min: 80,
          recommend: 80
        };
      }
    }
  },
  data() {
    return {
      albumOptions: [],
    };
  },
  computed: {
    platformType() {
      //  1是否公安网，0为视频网
      return this.$store.getters.systemByType('dualPlatformType').value;
    },
    currentLocale() {
      return this.$store.state.currentLocale;
    },
    taskRule() {
      return rule.createTask(this.suggestThreshold.min);
    },
    albumLabel() {
      return this.formData.singleAlbum ? this.$t('选择底库') : this.$t('选择底库1');
    },
    disabled() {
      return this.type === 'check';
    },
    albumLabel1() {
      if (!this.formData || !this.formData.albumId1 || !this.albumOptions) {
        return '';
      }
      const album = this.albumOptions.find((item) => item.id === this.formData.albumId1);
      if (!album) return '';
      return album.name;
    },
    albumLabel2() {
      if (!this.formData || !this.formData.albumId2 || !this.albumOptions) {
        return '';
      }
      const album = this.albumOptions.find((item) => item.id === this.formData.albumId2);
      if (!album) return '';
      return album.name;
    },
    readonlyLabel() {
      return {
        'readonly-label': this.disabled
      };
    }
  },
  watch: {
    visible(val) {
      if (val) this.openDialog();
    }
  },
  created() {
    this.init();
  },
  methods: {
    async init() {
      await this.getStaticAlbum();
    },
    onDialogConfirm() {
      this.$refs.task.validate(async (valid) => {
        // 检查用户模型是否校验通过
        if (valid) {
          // 通过进行保存操作
          this.$emit('taskConfirm', this.formData);
        }
      });
    },
    onDialogClose() {
      this.$emit('update:visible', false);
      this.$refs.task.resetFields();
    },
    /**
     * 获取静态库下拉列表值
     */
    async getStaticAlbum() {
      const params = {
        type: [1, 2],
        srcType: [1],
        deployObject: [1],
        authLevel: 1,
        platformType: this.platformType
      };
      const result = await CollisionSrv.albumList(params);
      if (result.code === 0) {
        this.albumOptions = result.data;
      }
    },
    /**
     * dialog打开事件，处理是否需要*
     */
    openDialog() {
      this.taskRule.name[0].required = !this.disabled;
      this.taskRule.threshold[0].required = !this.disabled;
      this.taskRule.albumId1[0].required = !this.disabled;
      this.taskRule.albumId2[0].required = !this.disabled;
      this.checkAlbum();
    },
    /**
     * 验证底库是否存在，更新显示
     */
    checkAlbum() {
      if (!this.isAlbumExist(this.formData.albumId1)) {
        this.formData.albumId1 = null;
      }
      if (!this.isAlbumExist(this.formData.albumId2)) {
        this.formData.albumId2 = null;
      }
    },
    /**
     * 验证底库是否存在
     * @param {String} id 底库id
     * @returns {Boolean} 底库是否存在
     */
    isAlbumExist(id) {
      const album = this.albumOptions.find((item) => item.id === id);
      return !!album;
    }
  }
};
</script>
<style lang="scss" scoped>
.collision-task ::v-deep .meg-dialog .meg-dialog__header{
  line-height: 54px;
  font-weight: 700;
  font-size: 16px;
  color: #435068;
}
.collision-task {
  .album-select {
    width: 100%;
  }
  .readonly-form-five {
    margin: 20px 0 0 12px !important;
  }
  .readonly-form-four {
    margin: 20px 0 0 4px !important;
  }
  .form-five {
    margin: 20px 0 0 22px !important;
  }
  .form-four {
    margin: 20px 0 0 15px !important;
  }
  .readonly-filter {
    display: flex;
    flex-direction: column;
    color: #435668;
  }
  .readonly-value {
    line-height: 34px;
    color: #435068;
  }
  .readonly-label {
    color: #869abb;
  }
  .el-checkbox {
    line-height: 34px;
  }
  .readonly-item {
    margin-bottom: 12px;
  }
  .el-form-item__label {
    line-height: 34px;
  }
  .task-form {
    width: 350px;
    margin: 35px auto 0;
    .el-input {
      width: 270px;
    }
  }
  .oneline {
    display: flex;
    width: 300px;
    > span:first-child {
      margin-right: 9px;
    }
    > span {
      display: inline-block;
      width: 240px;
      color: #999999;
    }
    .el-input {
      width: 120px;
    }
  }
  .el-checkbox + .el-checkbox {
    margin-left: 0px !important;
  }
  .filterContent {
    display: flex;
    > span:first-child {
      width: 85px;
    }
    > span:last-child {
      color: #999999;
      margin-left: 10px;
    }
  }
  .task-form {
    .el-form-item.is-success .el-input__inner,
    .el-form-item.is-success .el-input__inner:focus {
      border-color: #e4e7ed;
    }
  }
}
</style>
<style lang="scss">
.i18n-en-US{
  .collision-task{
    .task-form {
      width: 750px!important;
    }
    .el-form-item{
      width: 100%!important;
    }
    .el-form-item__label {
      width: 180px!important;
    }
    .el-form-item__content {
      margin-left: 180px!important;
    }
    .filterContent{
      flex-direction: column;
      & > span:last-child {
        margin-left:0;
      }
    }
  }
}
</style>
