<template>
  <div
    class="custom-technique"
    v-loading="isLoading">
    <div class="header">
      <div class="title">
        <p class="name">
          自定义技战法
        </p>
      </div>
      <div class="actions">
        <meg-button
          type="danger"
          v-if="currentType === 'edit'"
          @click="onDelete">
          删除
        </meg-button>
        <meg-button @click="onCancel">
          取消
        </meg-button>
        <meg-button
          type="primary"
          @click="onSave">
          保存
        </meg-button>
      </div>
    </div>
    <div class="content">
      <common-layout>
        <template slot="left">
          <basic-info
            ref="basicInfo"
            :rules="rules">
          </basic-info>
        </template>
        <template slot="right">
          <target-property ref="targetProperty"></target-property>
        </template>
      </common-layout>
    </div>
  </div>
</template>

<script>
import CommonLayout from '@/common-components/common-layout';
import { switchToModule } from '@/utils/utils';
import BasicInfo from '../components/basic-info';
import TargetProperty from '../components/target-property';
import JudgeAfterSrv from '../judge-after.service';
import Rules from '../judge-after.rule';

export default {
  components: {
    CommonLayout,
    BasicInfo,
    TargetProperty
  },
  data() {
    return {
      isLoading: true,
      rules: Rules.createRules(null),
    };
  },
  computed: {
    // 当前状态，新建还是编辑
    currentType() {
      const { id } = this.$route.query;
      if (id !== undefined) {
        return 'edit';
      }
      return 'create';
    }
  },
  created() {
    if (this.currentType === 'create') {
      this.isLoading = false;
    }
    if (this.currentType === 'edit') {
      const { id } = this.$route.query;
      this.rules = Rules.createRules(id);
    }
  },
  mounted() {
    // 页面挂载后如果是编辑，设置两部分表单的数据
    if (this.currentType === 'edit') {
      const { id } = this.$route.query;
      if (id) {
        this.getCustomTechniqueById(id);
      }
    }
  },
  methods: {
    async getCustomTechniqueById(id) {
      const { code, data } = await JudgeAfterSrv.getCustomTechniqueById(id);
      if (code === 0) {
        const { basicInfo, targetProperty } = this.$refs;
        basicInfo.setBasicInfoData(data);
        targetProperty.setTargetProperties(data);

        this.isLoading = false;
      }
    },
    /**
     * 新建自定义技战法
     */
    async createCustomTechnique(customTechniqueData = {}) {
      const { code } = await JudgeAfterSrv.createCustomTechnique(customTechniqueData);
      if (code === 0) {
        this.$message.success('新建自定义技战法成功');
        switchToModule({
          module: 'judge-after'
        });
      }
    },
    /**
     * 编辑自定义技战法
     */
    async editCustomTechnique(customTechniqueData = {}) {
      const { id } = this.$route.query;
      customTechniqueData.id = id;

      const { code } = await JudgeAfterSrv.editCustomTechnique(customTechniqueData);
      if (code === 0) {
        this.$message.success('编辑自定义技战法成功');
        switchToModule({
          module: 'judge-after'
        });
      }
    },
    /**
     * 保存
     */
    onSave() {
      const { basicInfo, targetProperty } = this.$refs;
      let basicInfoValid = false;
      let targetPropertyValid = false;

      // 基础信息组件里的表单校验
      basicInfo.validateForm((valid) => {
        basicInfoValid = valid;

        // 目标属性的校验
        const targetProperties = targetProperty.getTargetProperties();
        if (targetProperties.length === 0) {
          this.$message({
            showClose: true,
            message: '技战法目标属性不能为空',
            type: 'error'
          });
        } else {
          targetPropertyValid = true;
        }

        // 基础信息&目标属性校验都通过
        if (basicInfoValid && targetPropertyValid) {
          const customTechniqueData = {
            ...basicInfo.getBasicInfoData(),
            technicalProperties: JSON.stringify(targetProperties)
          };
          console.log('customTechniqueData', customTechniqueData);

          if (this.currentType === 'create') {
            this.createCustomTechnique(customTechniqueData);
          }
          if (this.currentType === 'edit') {
            this.editCustomTechnique(customTechniqueData);
          }
        }
      });
    },
    /**
     * 删除
     */
    onDelete() {
      this.$confirm('是否确定删除该自定义技战法', '确认删除').then(() => {
        const { id } = this.$route.query;
        JudgeAfterSrv.deleteCustomTechnique(id).then((res) => {
          if (res.code === 0) {
            this.$message.success('删除自定义技战法成功');
            switchToModule({
              module: 'judge-after'
            });
          }
        });
      }).catch(() => {
      });
    },
    /**
     * 取消
     */
    onCancel() {
      switchToModule({
        module: 'judge-after'
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.custom-technique {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #dce1e5;
  .header {
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .title {
      margin-left: 25px;
      display: flex;
      align-items: center;
    }
    .name {
      font-size: 16px;
      font-weight: bold;
      color: #435068;
    }
    .actions {
      margin-right: 10px;
    }
  }
  .content {
    flex: 1;
  }
}
</style>
