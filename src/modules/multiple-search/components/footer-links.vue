<template>
  <div
    class="footer__wrap">
    <div class="footer__title">
      <span class="title__left-line"></span>
      <span>{{ judges.length ? '根据所填条件，推荐以下研判' : '以上条件暂无可用研判推荐' }}</span>
      <span class="title__right-line"></span>
    </div>
    <div class="links__wrap">
      <meg-button
        v-for="(t, index) in judges"
        v-tooltip="true"
        :key="index"
        @click="onJudgeAfterClick(t)">
        <meg-icon :name="t.technicalIcon"></meg-icon>
        {{ t.technicalName }}
      </meg-button>
    </div>
  </div>
</template>

<script>
import { switchToModule } from '@/utils/utils';
import MultipleSearchSrv from '../multiple-search.service';
// 全量的事后研判模块（除了自定义技战法），以及分类。分类按需求约定，暂时在前端写死，
const wholeJudgesGroup = {
  // 有图+抓拍
  'img-capture': ['track', 'hiding-place', 'path-trace', 'peer'],
  // 有图+底库
  'img-database': ['multi-person'],
  // 有图+档案
  'img-document': ['human-fusion'],
  // 无图+抓拍
  'text-capture': ['frequency', 'region', 'album-region', 'person-gather', 'portrait-search', 'text-search'],
  // 无图+底库
  'text-database': ['album-region', 'collision'],
  // 无图+档案
  'text-document': ['track-analysis', 'record-crash']
};

export default {
  props: {
    // 有图 img  无图 text
    outerTabType: {
      type: String,
      default: undefined,
    },
    // 检索类型
    innerTabType: {
      type: String,
      default: undefined,
    },
  },
  data() {
    return {
      allJudgesAfter: {},
    };
  },
  computed: {
    judges() {
      return this.allJudgesAfter[`${this.outerTabType}-${this.innerTabType}`] || [];
    }
  },
  created() {
    // 获取全部事后研判功能
    this.getAllJudgesAfter();
  },
  methods: {
    /**
     * 获取全部事后研判功能
     */
    getAllJudgesAfter() {
      const params = {
        parentMenuId: this.$store.getters.modulesByAlias('judge-after').id
      };
      MultipleSearchSrv.getAllJudgesAfter(params).then((res) => {
        const { code, data } = res;
        if (code === 0) {
          // 数据获取后的重新组合，供组件渲染使用
          console.log(data.records);
          this.buildData(data.records);
        }
      });
    },

    /**
     * 数据获取后的重新组合，供组件渲染使用
     */
    buildData(datas = []) {
      // 全部事后研判功能的map
      const allJudgesAfterMap = {};
      // 全部自定义技战法，需要追加在全目标研判后
      const customTechniques = [];
      const allJudgesAfter = {};

      // 先生成一个全部事后研判功能的map，自定义技战法都放在 customTechniques 中
      datas.forEach((t) => {
        const { technicalType, technicalAlias } = t;
        if (technicalType === 0) {
          allJudgesAfterMap[technicalAlias] = t;
        }
        if (technicalType === 1) {
          customTechniques.push(t);
        }
      });

      allJudgesAfterMap.customTechniques = customTechniques;

      // 根据分类和全量的模块和之前处理生成的全部事后研判功能的map，处理得到最后的供页面组件渲染的数据结构
      Object.keys(wholeJudgesGroup).forEach((key) => {
        const wholeJudges = wholeJudgesGroup[`${key}`];
        wholeJudges.forEach((alias) => {
          const t = allJudgesAfterMap[`${alias}`];
          if (t) {
            if (!allJudgesAfter[`${key}`]) {
              allJudgesAfter[`${key}`] = [];
            }
            allJudgesAfter[`${key}`].push(t);
          }
        });
      });
      // 自定义技战法追加在 无图+抓拍 分类的最后
      allJudgesAfter['text-capture'].push(...allJudgesAfterMap.customTechniques);

      this.allJudgesAfter = allJudgesAfter;
    },

    /**
     * 事后研判的跳转点击事件
     */
    onJudgeAfterClick(technique) {
      const {
        id, technicalAlias, technicalType, technicalProperties, technicalName, technicalIcon
      } = technique;
      // 跳转到的模块信息，固定配置：新开页面和单页模式
      const moduleInfo = {
        isBlank: true,
        pageType: 'single'
      };

      if (technicalType === 0) {
        // technicalType=0表示是菜单模块，跳转到对应的菜单模块
        moduleInfo.module = technicalAlias;
      } else {
        // technicalType=1表示是自定义技战法，跳转主题检索模块
        moduleInfo.module = 'subject-search';
        moduleInfo.query = {
          technicalId: id,
          technicalProperties,
          technicalName,
          technicalIcon
        };
      }

      // 埋点请求
      this.eventTracking('MultipleSearchTJJZFLink');

      switchToModule(moduleInfo);
    },
  }
};
</script>

<style lang="scss" scoped>
.footer__title{
  display: flex;
  padding: 24px 0;
  color: rgba(67,80,104,0.5);
  width: 860px;
  overflow: hidden;
  margin: 0 auto;
}
.title__left-line, .title__right-line{
  flex: 1;
}
.title__left-line{
  background: url('~@/assets/images/multiple-search/line-left.svg') no-repeat right center;
  margin-right: 5px;
}
.title__right-line{
  background: url('~@/assets/images/multiple-search/line-right.svg') no-repeat left center;
  margin-left: 5px;
}
.links__wrap{
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  width: 872px;
  margin: 0 auto;
  box-sizing: border-box;
  position: relative;
  left: 6px;
}
.links__wrap .meg-button{
  padding: 14px 19px;
  margin-left: 0;
  margin-right: 12px;
  margin-bottom: 12px;
  max-width: 100%;
}

</style>
