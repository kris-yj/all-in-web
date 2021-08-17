<template>
  <page-layout>
    <div class="workbench">
      <div class="common-techs">
        <div
          class="techs-content"
          v-loading="isTechniquesLoading">
          <!-- 用户常用技战法 -->
          <common-techniques
            :techniques="userCommonTechniques"
            :all-judges-after="allJudgesAfter"
            @technique-checked="onTechniqueChecked">
          </common-techniques>
          <div class="recommend-techniques-wrap">
            <!-- 用户推荐技战法 -->
            <recommend-techniques
              :techniques="recommondTechniques">
            </recommend-techniques>
          </div>
        </div>
      </div>
      <div
        class="common-modules-wrap"
        v-loading="isCommonModulesLoading">
        <!-- 用户常用功能 -->
        <common-modules
          :user-common-modules="userCommonModules"
          @module-checked="onModuleChecked">
        </common-modules>
      </div>
    </div>
  </page-layout>
</template>

<script>
import WorkbenchSrv from '@/modules/workbench/workbench.service';
import CommonTechniques from '../components/common-techniques';
import RecommendTechniques from '../components/recommend-techniques';
import CommonModules from '../components/common-modules';

export default {
  components: {
    CommonTechniques,
    RecommendTechniques,
    CommonModules
  },
  data() {
    return {
      userCommonTechniques: [], // 用户常用技战法
      allJudgesAfter: [], // 全部的事后研判技战法（包括菜单技战法和用户自定义技战法）
      recommondTechniques: [], // 系统推荐技战法
      userCommonModules: [], // 用户常用功能
      isTechniquesLoading: true,
      isCommonModulesLoading: true
    };
  },
  created() {
    this.init();
  },
  methods: {
    /**
     * 数据初始化
     */
    init() {
      this.getTechniques();
      this.getUserCommonModules();
      this.getAllJudgesAfter();
    },
    /**
     * 获取技战法数据，包括常用技战法和系统推荐技战法
     */
    async getTechniques() {
      this.isTechniquesLoading = true;
      const [userCommonTechniques, recommendTechniques] = await Promise.all([WorkbenchSrv.getUserCommonTechniques(), WorkbenchSrv.getRecommendTechniques()]);

      if (userCommonTechniques.code === 0) {
        this.userCommonTechniques = userCommonTechniques.data.records;
      }
      if (recommendTechniques.code === 0) {
        this.recommondTechniques = recommendTechniques.data.records;
      }

      this.isTechniquesLoading = false;
    },
    /**
     * 获取用户常用功能
     */
    async getUserCommonModules() {
      const { code, data } = await WorkbenchSrv.getUserCommonModules();

      if (code === 0) {
        this.userCommonModules = data.records;
      }
      this.isCommonModulesLoading = false;
    },
    /**
     * 获取全部的事后研判技战法（包括菜单技战法和用户自定义技战法）
     */
    async getAllJudgesAfter() {
      const params = {
        parentMenuId: this.$store.getters.modulesByAlias('judge-after').id
      };

      const { code, data } = await WorkbenchSrv.getAllJudgesAfter(params);

      if (code === 0) {
        this.allJudgesAfter = data.records;
      }
    },
    /**
     * 常用技战法添加或删除事件
     */
    async onTechniqueChecked(technique, isChecked) {
      const data = { ...technique };

      if (isChecked) {
        const params = {
          technicals: []
        };
        params.technicals.push({
          id: data.id,
          technicalType: data.technicalType
        });

        const addRes = await WorkbenchSrv.addTechnical(params);
        if (addRes.code === 0) {
          // 添加成功后，常用技战法和系统推荐技战法都重新获取数据
          this.getTechniques();
          // this.userCommonTechniques.push(data);
          // 常用技战法添加成功后，重新刷新一次推荐技战法
          // WorkbenchSrv.getRecommendTechniques().then((res) => {
          //   if (res.code === 0) {
          //     this.recommondTechniques = res.data.records;
          //   }
          // });
        }
      } else {
        const params = {
          ids: []
        };
        params.ids.push(data.id);

        const delRes = await WorkbenchSrv.deleteTechnical(params);
        if (delRes.code === 0) {
          // 删除成功后，常用技战法和系统推荐技战法都重新获取数据
          this.getTechniques();
          // this.userCommonTechniques = this.userCommonTechniques.filter((t) => t.id !== data.id);
          // // 常用技战法删除成功后，重新刷新一次推荐技战法
          // WorkbenchSrv.getRecommendTechniques().then((res) => {
          //   if (res.code === 0) {
          //     this.recommondTechniques = res.data.records;
          //   }
          // });
        }
      }
    },
    /**
     * 常用功能添加或删除事件
     */
    async onModuleChecked(moduleData, isChecked) {
      const { id } = moduleData;

      if (isChecked) {
        const params = {
          menusIds: []
        };
        params.menusIds.push(id);

        const addRes = await WorkbenchSrv.addCommonModules(params);
        if (addRes.code === 0) {
          this.userCommonModules.push(moduleData);
        }
      } else {
        const params = {
          ids: []
        };
        params.ids.push(moduleData.id);

        const delRes = await WorkbenchSrv.deleteCommonModules(params);
        if (delRes.code === 0) {
          this.userCommonModules = this.userCommonModules.filter((t) => t.alias !== moduleData.alias);
        }
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.workbench {
  width: 100%;
  height: 100%;
  display: flex;
  background-image: url('../../../assets/images/workbench/background-1.png');
  background-size: auto;
  background-repeat:no-repeat;
  background-position: bottom right;
  // background-color: #303030;

  .techs-content {
    width: 588px;
  }

  .common-techs {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .common-modules-wrap {
    width: 180px;
    border-left: 1px solid #F2F4F8;
  }
  .recommend-techniques-wrap {
    margin-top: 96px;
  }
}
</style>
