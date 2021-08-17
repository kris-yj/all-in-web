<template>
  <page-layout>
    <div
      class="judge-after"
      v-loading="isLoading">
      <div class="header">
        <p class="title">
          事后研判
        </p>
        <p class="total">
          共 <span class="num">{{ total }}</span> 个战法
        </p>
      </div>
      <div class="content-wrap">
        <div class="content">
          <div
            class="block"
            v-for="(techniques, blockName) in allJudgesAfter"
            :key="blockName">
            <template v-if="techniques.length > 0">
              <div
                class="block-header"
                v-if="judgeAfterBlockShow(blockName)">
                <div>{{ blockName }} ({{ techniques.length }})</div>
                <meg-button
                  v-if="blockName === '全目标研判'"
                  class="add-custom-btn"
                  type="text"
                  icon="icon_plus"
                  @click="onAddCustom"
                  v-event-tracking="'JudgeAfterAddCustom'">
                  添加自定义技战法
                </meg-button>
              </div>
              <div class="block-list">
                <meg-card-frame
                  tag="div"
                  :gap="10"
                  :card-min-width="200">
                  <div
                    class="block-item"
                    v-for="(t, index) in techniques"
                    :key="t.id"
                    @click="onJudgeAfterClick(t)"
                    v-event-tracking="'JudgeAfterClickMenu'">
                    <div
                      class="icon-block"
                      :style="getBlockStyle(index)">
                      <meg-icon
                        :name="t.technicalIcon"
                        class="icon">
                      </meg-icon>
                    </div>
                    <div
                      class="name"
                      :title="t.technicalName">
                      {{ t.technicalName }}
                    </div>
                    <meg-tooltip
                      placement="bottom"
                      content="编辑">
                      <meg-icon
                        v-if="t.technicalType === 1"
                        name="edit_1"
                        class="technical-edit-btn"
                        @click.stop="onCustomEdit(t)">
                      </meg-icon>
                    </meg-tooltip>
                  </div>
                </meg-card-frame>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </page-layout>
</template>

<script>
import { utils, switchToModule } from '@/utils/utils';
import JudgeAfterSrv from '../judge-after.service';

// 全量的事后研判模块（除了自定义技战法），以及分类。分类按需求约定，暂时在前端写死，
const wholeJudgesGroup = {
  '人脸研判': ['frequency', 'peer', 'region', 'collision', 'album-region', 'person-gather', 'multi-person'],
  '全目标研判': ['track', 'hiding-place', 'path-trace', 'portrait-search', 'text-search'],
  '全息档案研判': ['record-crash', 'human-fusion', 'track-analysis', 'relation-analyze', 'relation', 'technique-search', 'region-first']
};

export default {
  data() {
    return {
      allJudgesAfter: {
        '人脸研判': [],
        '全目标研判': [],
        '全息档案研判': [],
      },
      // 全部事后研判技战法总数
      total: 0,
      // 页面是否loading
      isLoading: true
    };
  },
  created() {
    // 初始化相关
    this.init();
  },
  methods: {
    /**
     * 模块页面初始化
     */
    init() {
      // 获取全部事后研判功能
      this.getAllJudgesAfter();
    },
    /**
     * 获取全部事后研判功能
     */
    async getAllJudgesAfter() {
      const params = {
        parentMenuId: this.$store.getters.modulesByAlias('judge-after').id
      };

      const { code, data } = await JudgeAfterSrv.getAllJudgesAfter(params);

      if (code === 0) {
        // 数据获取后的重新组合，供组件渲染使用
        this.buildData(data.records);
      }

      this.isLoading = false;
    },
    /**
     * 数据获取后的重新组合，供组件渲染使用
     */
    buildData(datas = []) {
      // 全部事后研判功能的map
      const allJudgesAfterMap = {};
      // 全部自定义技战法，需要追加在全目标研判后
      const customTechniques = [];
      const allJudgesAfter = {
        '人脸研判': [],
        '全目标研判': [],
        '全息档案研判': [],
      };

      // 设置总数
      this.total = datas.length;

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
      Object.keys(this.allJudgesAfter).forEach((key) => {
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

      // 自定义技战法追加在全目标研判分类的最后
      // if (!allJudgesAfter['全目标研判']) {
      //   allJudgesAfter['全目标研判'] = [];
      // }
      allJudgesAfter['全目标研判'].push(...allJudgesAfterMap.customTechniques);

      // if (!allJudgesAfter['全息档案研判']) {
      //   allJudgesAfter['全息档案研判'] = [];
      // }

      // if (!allJudgesAfter['人脸研判']) {
      //   allJudgesAfter['人脸研判'] = [];
      // }
      this.allJudgesAfter = allJudgesAfter;
    },
    /**
     * 色块规则
     */
    getBlockStyle(index) {
      return {
        background: utils.pickColorForJudge(index)
      };
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
        // query Id是技战法Id
        moduleInfo.module = 'subject-search';
        moduleInfo.query = {
          technicalId: id,
          technicalProperties,
          technicalName,
          technicalIcon
        };
      }

      switchToModule(moduleInfo);
    },
    /**
     * 添加自定义技战法点击事件
     */
    onAddCustom() {
      switchToModule({
        module: 'judge-after',
        child: 'custom-technique'
      });
    },
    /**
     * 自定义技战法编辑事件
     */
    onCustomEdit(t = {}) {
      switchToModule({
        module: 'judge-after',
        child: 'custom-technique',
        query: {
          id: t.id
        }
      });
    },
    judgeAfterBlockShow(blockName) {
      const isDual = this.$store.getters.systemByType('isDual').value;
      const dualPlatformType = this.$store.getters.systemByType('dualPlatformType').value;
      // const dualScene = this.$store.getters.systemByType('dualScene').value;
      if (blockName === '全息档案研判'
        && isDual === 'true'
        && dualPlatformType === '0') {
        return false;
      }
      return true;
    }
  }
};
</script>

<style lang="scss" scoped>
.judge-after {
  width: 100%;
  height: 100%;
  background-color: #dde1e5;
  display: flex;
  flex-direction: column;
  .header {
    height: 56px;
    display: flex;
    align-items: center;
    padding-left: 18px;
    .title {
      font-size: 16px;
      font-weight: 700;
      margin-right: 20px;
    }
  }
  .content-wrap {
    flex: 1;
    padding-left: 18px;
  }
  .content {
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: #f2f4f8;
    // background-color: #303030;
    // background-image: url('../../../assets/images/workbench/background-1.png');
    // background-size: contain;
    // background-repeat:no-repeat;
    // background-position: bottom right;
    // padding: 0 $--block-padding;
    box-sizing: border-box;

    .block {
      padding: 0px 20px 10px 20px;
      .block-header {
        height: 56px;
        font-size: 16px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .block-list {
        .block-item {
          position: relative;
          height: 78px;
          border-radius: 2px;
          background: #FFFFFF;
          border: 1px solid #ffffff;
          display: flex;
          align-items: center;
          flex-shrink: 0;
          margin-bottom: 10px;
          cursor: pointer;
          transition: all .3s ease;
          &:hover {
            border-color: #21539B;
            .technical-edit-btn {
              display: inline-block;
            }
          }
        }
        .name {
          font-size: 16px;
          margin-left: 16px;
          display: -webkit-box;
          overflow: hidden;
          white-space: normal;
          text-overflow: ellipsis;
          word-wrap: break-word;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          padding-right: 20px;
          line-height: 26px;
        }
        .icon-block {
          width: 50px;
          height: 50px;
          background: #5195EA;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 15px;
          flex-shrink: 0;
          .icon {
            width: 26px;
            height: 26px;
            color: #ffffff;
          }
        }
      }
      .technical-edit-btn {
        display: none;
        position: absolute;
        top: 6px;
        right: 6px;
        transition: all .2s ease;
        width: 16px;
        height: 16px;
        cursor: pointer;
        color: #869abb;
        &:hover {
          color: #21539b;
        }
      }
    }
  }
}
</style>
